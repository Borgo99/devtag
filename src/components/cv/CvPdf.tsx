import { Document, Font, Link, Page, pdf, Text, View } from "@react-pdf/renderer";
import type { Cv, CvLength, Entry } from "@/lib/cv/document";
import { drawable, wordParts } from "@/lib/cv/fonts";

/**
 * The CV as a PDF, made in the browser by @react-pdf/renderer (it writes the PDF itself: real text, embedded
 * fonts, links), laid out like Jake's Resume. Latin Modern, the open version of LaTeX's default font, as
 * TrueType subsets (public/static/fonts/latin-modern-pdf). Sizes are in pt, from the 11pt text.
 */

const FONTS = "/static/fonts/latin-modern-pdf";
const MARGIN = 36; // 0.5in

let registered = false;
function registerFonts() {
  if (registered) return;
  registered = true;
  Font.register({
    family: "LM Roman",
    fonts: [
      { src: `${FONTS}/lmromantt-regular.ttf`, fontWeight: 400 },
      { src: `${FONTS}/lmromantt-bold.ttf`, fontWeight: 700 },
      { src: `${FONTS}/lmromantt-italic.ttf`, fontWeight: 400, fontStyle: "italic" },
    ],
  });
  // Its lowercase letters are drawn as small capitals, while the text stays "Education".
  Font.register({ family: "LM Roman Caps", src: `${FONTS}/lmromancapstt-regular.ttf` });
  // Words aren't hyphenated; only one too long for its line (an address) breaks, so it doesn't run off the page.
  Font.registerHyphenationCallback(wordParts);
}

function styles(size: number) {
  const em = (n: number) => n * size;
  const small = em(0.91);
  // Each size sets its own line height: an inherited one would stay that of the 11pt text.
  const text = (fontSize: number) => ({ fontSize, lineHeight: 1.2 });
  return {
    page: { padding: MARGIN, fontFamily: "LM Roman", ...text(size), color: "#000" },
    header: { textAlign: "center" as const, marginBottom: em(0.55) },
    name: { fontSize: em(2.27), fontWeight: 700, lineHeight: 1.1 },
    contacts: { ...text(small), marginTop: em(0.15) },
    underline: { color: "#000", textDecoration: "underline" as const },
    plain: { color: "#000", textDecoration: "none" as const },
    section: { marginTop: em(0.5) },
    heading: {
      fontFamily: "LM Roman Caps",
      ...text(em(1.09)),
      paddingBottom: em(0.08),
      marginBottom: em(0.15),
      borderBottomWidth: 0.4,
      borderBottomColor: "#000",
    },
    entry: { paddingLeft: em(0.98), paddingRight: em(0.5) },
    next: { marginTop: em(0.4) },
    line: { flexDirection: "row" as const },
    // A line with text on both sides: the left takes the room the right leaves, and both wrap rather than
    // overlap. Layout items don't shrink by default here, unlike in a browser.
    left: { flexGrow: 1, flexShrink: 1, flexBasis: 0 },
    right: { flexShrink: 0, maxWidth: "45%", marginLeft: em(0.8), textAlign: "right" as const },
    title: { fontWeight: 700 },
    italic: { fontStyle: "italic" as const },
    sub: { flexDirection: "row" as const, ...text(small), fontStyle: "italic" as const, marginTop: em(0.1) },
    bullets: text(small),
    afterHeading: { marginTop: em(0.1) },
    bullet: { flexDirection: "row" as const },
    bulletGap: { marginTop: 0.2 * small },
    dot: { width: 1.85 * small, paddingRight: 0.55 * small, textAlign: "right" as const },
    bulletText: { flexGrow: 1, flexShrink: 1, flexBasis: 0 },
    lines: { paddingLeft: em(0.98), ...text(small) },
    paragraph: { paddingLeft: em(0.98), ...text(small), marginBottom: em(0.3) },
  };
}

type Styles = ReturnType<typeof styles>;

/**
 * Where a list (an entry's points, the skill lines) may break across pages. A short one (3 items or fewer) stays
 * whole. A longer one keeps its first two items together, as they come with what's before them (the entry's two
 * lines, the section heading), and its last two: never one point alone at the top of a page.
 */
function blocks<T>(items: T[]): { items: T[]; start: number }[] {
  if (items.length <= 3) return [{ items, start: 0 }];
  const middle = items.slice(2, -2).map((item, i) => ({ items: [item], start: i + 2 }));
  return [{ items: items.slice(0, 2), start: 0 }, ...middle, { items: items.slice(-2), start: items.length - 2 }];
}

/**
 * Blocks with more text than this may break inside after all: an unbreakable block taller than a page can only
 * be squeezed onto it, lines on top of each other. 2000 characters is about a third of a page.
 */
const BLOCK_CHARS = 2000;
const breakable = (texts: string[]) => texts.reduce((n, t) => n + t.length, 0) > BLOCK_CHARS;

function Heading({ entry, s }: { entry: Entry; s: Styles }) {
  return (
    <>
      <View style={s.line}>
        <Text style={s.left}>
          {entry.href ? (
            <Link src={entry.href} style={[s.title, s.plain]}>
              {entry.title}
            </Link>
          ) : (
            <Text style={s.title}>{entry.title}</Text>
          )}
          {entry.tags && (
            <Text>
              {" | "}
              <Text style={s.italic}>{entry.tags}</Text>
            </Text>
          )}
        </Text>
        {entry.right && <Text style={s.right}>{entry.right}</Text>}
      </View>
      {(entry.subtitle || entry.subright) && (
        <View style={s.sub}>
          <Text style={s.left}>{entry.subtitle ?? ""}</Text>
          {entry.subright && <Text style={s.right}>{entry.subright}</Text>}
        </View>
      )}
    </>
  );
}

export function CvPdf({ cv, size }: { cv: Cv; size: number }) {
  const s = styles(size);
  return (
    <Document title={`${cv.name} — CV`} author={cv.name} creator="devtag" producer="devtag">
      <Page size="A4" style={s.page}>
        <View style={s.header}>
          <Text style={s.name}>{cv.name}</Text>
          {cv.contacts.length > 0 && (
            <Text style={s.contacts}>
              {cv.contacts.map((c, i) => (
                <Text key={c.text}>
                  {i > 0 && " | "}
                  {c.href ? (
                    <Link src={c.href} style={s.underline}>
                      {c.text}
                    </Link>
                  ) : (
                    c.text
                  )}
                </Text>
              ))}
            </Text>
          )}
        </View>

        {cv.sections.map((section) => {
          // In the same unbreakable block as the start of what follows: never alone at the bottom of a page.
          // When that block may break (a lot of text), it still asks for a few lines after it.
          const heading = (
            <Text style={s.heading} minPresenceAhead={size * 3}>
              {section.title}
            </Text>
          );
          return (
            <View key={section.title} style={s.section}>
              {section.kind === "text" &&
                section.paragraphs.map((p, i) =>
                  i === 0 ? (
                    <View key={i} wrap={breakable([p])}>
                      {heading}
                      <Text style={s.paragraph}>{p}</Text>
                    </View>
                  ) : (
                    <Text key={i} style={s.paragraph}>
                      {p}
                    </Text>
                  ),
                )}
              {section.kind === "lines" &&
                blocks(section.lines).map((block, b) => (
                  <View key={b} wrap={breakable(block.items.map((line) => line.text))}>
                    {b === 0 && heading}
                    <View style={s.lines}>
                      {block.items.map((line, j) => (
                        <Text key={j}>
                          <Text style={s.title}>{line.label}</Text>: {line.text}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              {section.kind === "entries" &&
                section.entries.map((entry, i) =>
                  blocks(entry.bullets).map((block, b) => (
                    <View key={`${i}-${b}`} wrap={breakable(block.items)} style={i > 0 && b === 0 ? s.next : undefined}>
                      {i === 0 && b === 0 && heading}
                      <View style={s.entry}>
                        {/* The entry's two lines always come with its first points. */}
                        {b === 0 && (
                          <View minPresenceAhead={size * 2}>
                            <Heading entry={entry} s={s} />
                          </View>
                        )}
                        {block.items.length > 0 && (
                          <View style={b === 0 ? [s.bullets, s.afterHeading] : s.bullets}>
                            {block.items.map((text, j) => (
                              <View key={j} style={block.start + j > 0 ? [s.bullet, s.bulletGap] : s.bullet}>
                                <Text style={s.dot}>•</Text>
                                <Text style={s.bulletText}>{text}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  )),
                )}
            </View>
          );
        })}
      </Page>
    </Document>
  );
}

/** The pages of a PDF written by react-pdf, from its page tree: "/Type /Pages", then "/Count 2". */
async function pageCount(blob: Blob) {
  const count = new TextDecoder("latin1").decode(await blob.arrayBuffer()).match(/^\/Type \/Pages\n\/Count (\d+)$/m);
  if (!count) throw new Error("No page count in the PDF");
  return Number(count[1]);
}

/** One page: from 11pt down to 9.5pt. */
const SIZES = [11, 10.75, 10.5, 10.25, 10, 9.75, 9.5];

/**
 * The CV as a PDF file. One page: the largest size that fits, found by halving (at most 5 renders); when even
 * the smallest doesn't fit, the normal size on more pages. Everything: the normal size. Characters the fonts
 * can't draw are left out (missingCharacters lists them).
 */
export async function makeCvPdf(content: Cv, length: CvLength) {
  registerFonts();
  const cv = drawable(content);
  const render = async (i: number) => {
    const blob = await pdf(<CvPdf cv={cv} size={SIZES[i]} />).toBlob();
    return { blob, size: SIZES[i], pages: await pageCount(blob) };
  };
  try {
    const normal = await render(0);
    if (length === "full" || normal.pages === 1) return normal;
    let fits = await render(SIZES.length - 1);
    if (fits.pages > 1) return normal;
    let lo = 0; // doesn't fit
    let hi = SIZES.length - 1; // fits
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      const tried = await render(mid);
      if (tried.pages === 1) [hi, fits] = [mid, tried];
      else lo = mid;
    }
    return fits;
  } catch (error) {
    // A font that failed to load (the connection dropped) would fail every next try too: start again clean.
    Font.clear();
    registered = false;
    throw error;
  }
}
