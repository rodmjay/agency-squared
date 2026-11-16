import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { MaterialElements } from "@/components/material";

const sans = Roboto({ variable: "--font-roboto", subsets: ["latin"], weight: ["400", "500", "700"] });
const mono = Roboto_Mono({ variable: "--font-roboto-mono", subsets: ["latin"], weight: ["400", "500"] });

const SITE = "https://rodmjay.github.io/agency-squared";
const TITLE = "AgencyPro · Your AI does the work. Real people fill the gaps.";
const OG_ALT = "AgencyPro: an AI workflow with one step handled by a real person";
const DESCRIPTION =
  "AgencyPro works with Claude through MCP and with your systems through its API. Steps only a person should do go to vetted professionals, and everyone is paid fairly once the payment clears.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    type: "website", url: SITE + "/", siteName: "AgencyPro", title: TITLE, description: DESCRIPTION,
    images: [{ url: SITE + "/og.png", width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [{ url: SITE + "/og.png", alt: OG_ALT }] },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} h-full antialiased`}>
      <head>
        {/* Icon font: "block" avoids flashing ligature names before the font loads. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font, @next/next/google-font-display */}
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block" />
      </head>
      <body className="flex min-h-full flex-col">
        <MaterialElements />
        {children}
      </body>
    </html>
  );
}
