import type { Metadata } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

/** Shared by the whole site; profile pages replace this metadata with their own. */
const favicon =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#0b0f14"/>` +
      `<text x="32" y="42" text-anchor="middle" font-family="monospace" font-weight="700" font-size="24" fill="#4ade80">dt_</text></svg>`,
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
