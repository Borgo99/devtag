import { NextResponse, type NextRequest } from "next/server";
import { subdomain } from "@/lib/site";

/** andrea.devtag.io/projects/x is served by the route /andrea/projects/x. */
export function proxy(request: NextRequest) {
  const username = subdomain(request.headers.get("host"));
  if (!username) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = `/${username}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url);
}

// Next's own files, the API (photos included) and the files in public/static are the same on every host.
export const config = {
  matcher: ["/((?!_next/|api/|static/).*)"],
};
