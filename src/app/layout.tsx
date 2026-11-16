import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { MaterialElements } from "@/components/material";

const sans = Roboto({ variable: "--font-roboto", subsets: ["latin"], weight: ["400", "500", "700"] });
const mono = Roboto_Mono({ variable: "--font-roboto-mono", subsets: ["latin"], weight: ["400", "500"] });

const SITE = "https://rodmjay.github.io/agency-squared";
const TITLE = "AgencyPro · Everyone who earned a cut gets paid";
const OG_ALT = "AgencyPro: one billed hour split between everyone who earned a cut";
const DESCRIPTION =
  "AgencyPro splits every billed hour between the contractor, the recruiter, the referral partner, the PM and your agency, and pays each share when the client pays.";

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
