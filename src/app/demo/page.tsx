import { DICTS } from "@/i18n";

// The in-browser demo was retired on 11/19 (no mock data): the app runs on its real back end at agency.squared.pro
// (psh ADR 0022). This page says so in both languages, for anyone with the old link.
export default function DemoPage() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-16">
      {(["en", "es"] as const).map((lang) => {
        const d = DICTS[lang].appMoved;
        return (
          <section key={lang} lang={lang === "es" ? "es-419" : "en"} className="flex flex-col gap-3">
            <h1 className="md-headline-medium">{d.title}</h1>
            <p className="md-body-large text-on-surface-variant">{d.body}</p>
            <a className="md-label-large text-primary underline" href={lang === "es" ? "../es/" : "../"}>{d.back}</a>
          </section>
        );
      })}
    </main>
  );
}
