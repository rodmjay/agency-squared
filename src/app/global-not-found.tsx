import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";
import { MdButton } from "@/components/material";
import { DICTS, HTML_LANG, BASE, LANGS, langPath } from "@/i18n";

export const metadata: Metadata = { title: `${DICTS.en.notFound.eyebrow} · AgencyPro`, robots: { index: false } };

// Unmatched URLs on any language: both languages, each with its own way home.
export default function GlobalNotFound() {
  return (
    <SiteShell lang="en" pickLang={false}>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-12 px-4 py-24 sm:px-6">
        {LANGS.map((l) => {
          const n = DICTS[l].notFound;
          return (
            <section key={l} lang={HTML_LANG[l]} className="flex flex-col items-start gap-4">
              <p className="md-label-large text-primary">{n.eyebrow}</p>
              <h1 className="md-display-medium">{n.title}</h1>
              <p className="md-body-large text-on-surface-variant">{n.body}</p>
              <MdButton kind={l === "en" ? "filled" : "tonal"} href={BASE + langPath(l)} icon="home">{n.cta}</MdButton>
            </section>
          );
        })}
      </main>
    </SiteShell>
  );
}
