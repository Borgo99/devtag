import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

/** Shared by the whole site; profile pages replace this metadata with their own. The tag of public/brand/icon.svg. */
const favicon =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="5 12 54 40"><defs>` +
      `<linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4ade80"/><stop offset="1" stop-color="#38bdf8"/></linearGradient>` +
      `<mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64"><rect width="64" height="64" fill="#fff"/>` +
      `<circle cx="19.5" cy="32" r="4"/><path d="M31.4 39.02V36.78L38.56 33.68L31.4 30.58V28.36L40.6 32.34V35.04Z"/>` +
      `<rect x="42.5" y="36.5" width="11" height="4.4" rx="1.1"/></mask></defs>` +
      `<path d="M23 13H50a8 8 0 0 1 8 8V43a8 8 0 0 1-8 8H23a6 6 0 0 1-4.3-1.8L7.9 37.7a8 8 0 0 1 0-11.4L18.7 14.8A6 6 0 0 1 23 13Z" fill="url(#g)" mask="url(#m)"/></svg>`,
  );

export const metadata: Metadata = {
  title: "devtag — your developer portfolio in two minutes",
  description: "Drop your CV and get a portfolio page at you.devtag.io, made for developers looking for work.",
  icons: { icon: { url: favicon, type: "image/svg+xml" } },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
