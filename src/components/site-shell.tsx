import type { Metadata, Viewport } from "next";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { Roboto, Roboto_Mono } from "next/font/google";
import "@/app/globals.css";
import { MaterialElements } from "@/components/material";
import { DICTS, HTML_LANG, SITE, BASE, langPath, type Lang } from "@/i18n";

const sans = Roboto({ variable: "--font-roboto", subsets: ["latin"], weight: ["400", "500", "700"] });
const mono = Roboto_Mono({ variable: "--font-roboto-mono", subsets: ["latin"], weight: ["400", "500"] });

export function siteMetadata(lang: Lang): Metadata {
  const m = DICTS[lang].meta;
  const url = SITE + langPath(lang);
  return {
    metadataBase: new URL(SITE),
    title: m.title,
    description: m.description,
    alternates: { canonical: url, languages: { en: SITE + "/", "es-419": SITE + "/es/", "x-default": SITE + "/" } },
    other: { google: "notranslate" },
    openGraph: {
      type: "website", url, siteName: "AgencyPro", title: m.title, description: m.description,
      locale: lang === "es" ? "es_419" : "en_US",
      images: [{ url: SITE + "/og.png", width: 1200, height: 630, alt: m.ogAlt }],
    },
    twitter: { card: "summary_large_image", title: m.title, description: m.description, images: [{ url: SITE + "/og.png", alt: m.ogAlt }] },
  };
}

export const viewport: Viewport = {
  // Browser chrome can't read CSS variables: agency surface-container, light and dark (design system tokens.css).
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eeeee7" },
    { media: "(prefers-color-scheme: dark)", color: "#1e201c" },
  ],
};

// Before paint: pick the language with the design system's own rules (URL, the visitor's choice, browser, time zone)
// and go to that language's page if this isn't it. ?lang= counts as a choice and is remembered.
const kit = readFileSync(join(process.cwd(), "src/design-system/i18n.js"), "utf8").replace(/^export /gm, "");
const langScript = (lang: Lang) => `(function(){try{
${kit}
var q = new URLSearchParams(location.search), asked = ok(short(q.get("lang")));
if (asked) { store(asked); q.delete("lang"); }
var want = asked || pickLang();
if (want !== ${JSON.stringify(lang)}) { var s = q.toString(); location.replace(${JSON.stringify(BASE)} + (want === "es" ? "/es/" : "/") + (s ? "?" + s : "") + location.hash); }
}catch(e){}})();`;

export function SiteShell({ lang, children, pickLang = true }: { lang: Lang; children: React.ReactNode; pickLang?: boolean }) {
  return (
    <html lang={HTML_LANG[lang]} translate="no" data-brand="agency" className={`notranslate ${sans.variable} ${mono.variable} h-full antialiased`}>
      {/* The root layouts render this shell, so <head> here is the App Router root head. */}
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {pickLang && <script dangerouslySetInnerHTML={{ __html: langScript(lang) }} />}
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
