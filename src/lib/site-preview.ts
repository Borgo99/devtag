import { lookup, type LookupAddress } from "node:dns";
import http from "node:http";
import https from "node:https";
import { BlockList, isIP, type LookupFunction } from "node:net";
import zlib from "node:zlib";
import sharp from "sharp";

/**
 * Reads a project's live site once, for its Portfolio card: the site's own link-preview image (og:image)
 * and its icon. The address comes from a user, so only public web addresses are fetched: no localhost,
 * private networks or cloud metadata, checked on every connection and every redirect. Responses have
 * size and time limits, and images are decoded and re-encoded, never passed through.
 * No project imports: the tests run this file directly with Node.
 */

const TIMEOUT = 6000;
const MAX_HTML = 512 * 1024; // the <head> is at the start
const MAX_IMAGE = 5 * 1024 * 1024;
const MAX_ICON = 1024 * 1024;
const MAX_REDIRECTS = 3;
const USER_AGENT = "Mozilla/5.0 (compatible; devtag-preview/1.0; +https://devtag.io)";

/**
 * Addresses that aren't the public internet: loopback, private, link-local (cloud metadata), reserved.
 * IPv4 written as IPv6 (::ffff:127.0.0.1) is checked against the IPv4 ranges by BlockList itself.
 */
const PRIVATE = new BlockList();
for (const [net, bits] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["224.0.0.0", 3],
] as const)
  PRIVATE.addSubnet(net, bits, "ipv4");
for (const [net, bits] of [
  ["::", 127], // :: and ::1
  ["64:ff9b::", 96], // IPv4 through NAT64
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
] as const)
  PRIVATE.addSubnet(net, bits, "ipv6");

export function isPublicAddress(address: string) {
  const family = isIP(address);
  return family !== 0 && !PRIVATE.check(address, family === 6 ? "ipv6" : "ipv4");
}

/** DNS lookup that refuses names pointing to a non-public address, checked as the connection opens. */
const publicLookup: LookupFunction = (hostname, options, callback) => {
  lookup(hostname, { ...options, all: true }, (error, addresses: LookupAddress[]) => {
    if (error) return callback(error, "", 0);
    if (!addresses.length || !addresses.every((a) => isPublicAddress(a.address)))
      return callback(new Error(`${hostname} isn't a public address`), "", 0);
    if (options.all) callback(null, addresses);
    else callback(null, addresses[0].address, addresses[0].family);
  });
};

interface Response {
  /** Where the content came from, after redirects. */
  url: URL;
  type: string;
  body: Buffer;
}

/** The body, uncompressed. Servers should honor "identity", but some compress anyway. */
function decode(body: Buffer, encoding: string | undefined, max: number) {
  const options = { maxOutputLength: max, finishFlush: zlib.constants.Z_SYNC_FLUSH };
  if (encoding === "gzip") return zlib.gunzipSync(body, options);
  if (encoding === "deflate") return zlib.inflateSync(body, options);
  if (encoding === "br")
    return zlib.brotliDecompressSync(body, {
      maxOutputLength: max,
      finishFlush: zlib.constants.BROTLI_OPERATION_FLUSH,
    });
  return body;
}

/**
 * GET from a public http(s) address, following redirects (each one checked). At most `max` bytes:
 * with `truncate` the first `max` bytes are kept, otherwise a bigger response fails.
 */
function get(url: URL, accept: string, max: number, truncate = false, redirects = MAX_REDIRECTS): Promise<Response> {
  if (url.protocol !== "https:" && url.protocol !== "http:") return Promise.reject(new Error("Not a web address"));
  const host = url.hostname.replace(/^\[|\]$/g, "");
  // Node skips the lookup for addresses written as numbers, so check those here.
  if (isIP(host) && !isPublicAddress(host)) return Promise.reject(new Error(`${host} isn't a public address`));

  return new Promise((resolve, reject) => {
    const client = url.protocol === "https:" ? https : http;
    const request = client.get(
      url,
      { lookup: publicLookup, headers: { "user-agent": USER_AGENT, accept, "accept-encoding": "identity" } },
      (response) => {
        const status = response.statusCode ?? 0;
        const location = response.headers.location;
        if (status >= 300 && status < 400 && location) {
          response.resume();
          clearTimeout(timer);
          if (!redirects) return reject(new Error("Too many redirects"));
          return resolve(get(new URL(location, url), accept, max, truncate, redirects - 1));
        }
        if (status !== 200) {
          response.resume();
          clearTimeout(timer);
          return reject(new Error(`The site answered ${status}`));
        }

        const chunks: Buffer[] = [];
        let size = 0;
        const finish = () => {
          clearTimeout(timer);
          try {
            const body = decode(Buffer.concat(chunks), response.headers["content-encoding"], max);
            resolve({ url, type: response.headers["content-type"] ?? "", body });
          } catch (error) {
            reject(error);
          }
        };
        response.on("data", (chunk: Buffer) => {
          size += chunk.length;
          chunks.push(chunk);
          if (size <= max) return;
          request.destroy();
          if (truncate) finish();
          else reject(new Error("Too large"));
        });
        response.on("end", finish);
        response.on("error", reject);
      },
    );
    // A whole-request deadline: the socket timeout alone lets a slow site trickle bytes forever.
    const timer = setTimeout(() => request.destroy(new Error("Timed out")), TIMEOUT);
    request.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

/** The attributes of every <meta> or <link> tag in the page. */
function tags(html: string, name: "meta" | "link") {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map(([tag]) => {
    const attributes: Record<string, string> = {};
    for (const [, key, ...values] of tag.matchAll(/([^\s=<>"'/]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
      const value = values.find((v) => v !== undefined) ?? "";
      attributes[key.toLowerCase()] = value
        .replace(/&amp;/g, "&")
        .replace(/&#x2F;|&#47;/gi, "/")
        .trim();
    }
    return attributes;
  });
}

const isIco = (link: Record<string, string>) =>
  /\.ico(\?|$)/i.test(link.href) || /x-icon|vnd\.microsoft\.icon/i.test(link.type ?? "");

/** How good an icon <link> looks to be: apple-touch-icon (180 px) first, then SVG, then the biggest PNG. */
function iconScore(link: Record<string, string>) {
  const rel = link.rel?.toLowerCase() ?? "";
  if (rel.includes("apple-touch-icon")) return 300;
  if (/svg/i.test(link.type ?? "") || /\.svg(\?|$)/i.test(link.href)) return 250;
  const size = Math.max(0, ...(link.sizes ?? "").split(/\s+/).map((s) => parseInt(s, 10) || 0));
  return size || 32;
}

/** Where the page says its preview image and its icons are, best icon first. */
export function findAssets(html: string, page: URL) {
  const resolve = (href: string | undefined) => {
    try {
      return href ? new URL(href, page) : undefined;
    } catch {
      return undefined;
    }
  };
  const meta = tags(html, "meta");
  const content = (key: string) => meta.find((m) => (m.property ?? m.name)?.toLowerCase() === key)?.content;
  const image = ["og:image:secure_url", "og:image:url", "og:image", "twitter:image", "twitter:image:src"]
    .map(content)
    .find(Boolean);

  const links = tags(html, "link").filter(
    (link) => link.href && /(^|\s)(apple-touch-icon(-precomposed)?|icon)(\s|$)/i.test(link.rel ?? ""),
  );
  const urls = (list: Record<string, string>[]) =>
    list.map((link) => resolve(link.href)).filter((url) => url !== undefined);
  // .ico files come last: they rarely hold more than 48 px. The two guesses are where most sites keep
  // their icons even when the page doesn't mention them.
  const icons = [
    ...urls(links.filter((link) => !isIco(link)).sort((a, b) => iconScore(b) - iconScore(a))),
    new URL("/apple-touch-icon.png", page),
    ...urls(links.filter(isIco)),
    new URL("/favicon.ico", page),
  ];

  return { image: resolve(image), icons: icons.filter((url, i) => icons.findIndex((u) => u.href === url.href) === i) };
}

/**
 * The site's preview image, as the card's 1280×800 JPEG. Preview images are usually wider (1.91:1), and
 * cropping would cut their text: the whole image is shown, on a blurred copy of itself. Too small: refused.
 */
export async function previewImage(body: Buffer) {
  const open = () => sharp(body, { limitInputPixels: 40_000_000, autoOrient: true });
  const { width = 0, height = 0, format } = await open().metadata();
  if (format === "svg" || width < 400 || height < 200) throw new Error("Not a usable preview image");
  const [backdrop, image] = await Promise.all([
    open()
      .resize(1280, 800, { fit: "cover" })
      .flatten({ background: "#0d1117" })
      .blur(40)
      .modulate({ brightness: 0.55 })
      .toBuffer(),
    open().resize(1280, 800, { fit: "inside" }).flatten({ background: "#0d1117" }).toBuffer(),
  ]);
  return sharp(backdrop)
    .composite([{ input: image, gravity: "centre" }])
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer();
}

/**
 * The biggest picture in a .ico file, for sharp, which can't read .ico itself: PNG entries as they are,
 * 32-bit bitmap entries as raw pixels. Other bitmap depths are refused.
 */
function fromIco(body: Buffer) {
  let best: Buffer | undefined;
  let bestArea = 0;
  for (let i = 0; i < Math.min(body.readUInt16LE(4), 64); i++) {
    const entry = 6 + i * 16;
    const area = (body[entry] || 256) * (body[entry + 1] || 256); // 0 means 256
    const size = body.readUInt32LE(entry + 8);
    const offset = body.readUInt32LE(entry + 12);
    if (area > bestArea && offset + size <= body.length)
      [best, bestArea] = [body.subarray(offset, offset + size), area];
  }
  if (!best) throw new Error("Empty icon file");
  if (best.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47])))
    return sharp(best, { limitInputPixels: 25_000_000 });

  // A bitmap: rows from the bottom, blue-green-red-alpha. Its height counts the transparency mask too.
  const header = best.readUInt32LE(0);
  const width = best.readInt32LE(4);
  const height = best.readInt32LE(8) / 2;
  if (
    best.readUInt16LE(14) !== 32 ||
    !Number.isInteger(height) ||
    width < 1 ||
    width > 512 ||
    height < 1 ||
    height > 512
  )
    throw new Error("Unsupported icon");
  if (best.length < header + width * height * 4) throw new Error("Damaged icon");
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const from = header + ((height - 1 - y) * width + x) * 4;
      const to = (y * width + x) * 4;
      pixels[to] = best[from + 2];
      pixels[to + 1] = best[from + 1];
      pixels[to + 2] = best[from];
      pixels[to + 3] = best[from + 3];
    }
  // Old icons leave the alpha channel empty and use the mask instead: show those opaque.
  if (!pixels.some((value, i) => i % 4 === 3 && value > 0)) for (let i = 3; i < pixels.length; i += 4) pixels[i] = 255;
  return sharp(pixels, { raw: { width, height, channels: 4 } });
}

/** The site's icon, as a 128×128 PNG. SVGs that load anything else are refused; tiny icons too (blurry). */
export async function logoImage(body: Buffer) {
  const svg = /<svg[\s>]/i.test(body.subarray(0, 2048).toString("utf8"));
  if (svg && /<(image|foreignObject|script|use)\b|href\s*=\s*["'](?!#)/i.test(body.toString("utf8")))
    throw new Error("This SVG loads other content");
  const ico = body.length > 6 && body.readUInt32LE(0) === 0x10000; // 00 00 01 00
  const image = ico ? fromIco(body) : sharp(body, { limitInputPixels: 25_000_000, ...(svg && { density: 288 }) });
  const { width = 0, height = 0 } = await image.metadata();
  if (!svg && Math.min(width, height) < 48) throw new Error("Icon too small");
  return image
    .resize(128, 128, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

/** The first of `items` for which `read` works. */
async function firstOf<T, R>(items: T[], read: (item: T) => Promise<R>) {
  for (const item of items) {
    try {
      return await read(item);
    } catch {
      // try the next one
    }
  }
  return undefined;
}

/**
 * Reads the site at `address`: its preview image and its icon, each if found and usable.
 * Throws when the site can't be opened at all.
 */
export async function readSite(address: URL) {
  const page = await get(address, "text/html,application/xhtml+xml", MAX_HTML, true);
  if (!/html/i.test(page.type)) return {};
  const found = findAssets(page.body.toString("utf8"), page.url);
  const [image, logo] = await Promise.all([
    found.image &&
      get(found.image, "image/*", MAX_IMAGE)
        .then((response) => previewImage(response.body))
        .catch(() => undefined),
    firstOf(found.icons.slice(0, 4), async (url) => logoImage((await get(url, "image/*", MAX_ICON)).body)),
  ]);
  return { image: image || undefined, logo };
}
