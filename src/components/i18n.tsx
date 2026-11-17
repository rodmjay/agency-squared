"use client";

import { createContext, useContext } from "react";
import { DICTS, HTML_LANG, LANGS, LANG_NAMES, BASE, langPath, type Dict, type Lang } from "@/i18n";

const Ctx = createContext<{ lang: Lang; d: Dict }>({ lang: "en", d: DICTS.en });

export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <Ctx.Provider value={{ lang, d: DICTS[lang] }}>{children}</Ctx.Provider>;
}

/** The page's language and its dictionary, for client components. */
export const useI18n = () => useContext(Ctx);

/** Language menu: a native select (keyboard and screen readers work everywhere). The choice is remembered. */
export function LangMenu() {
  const { lang, d } = useI18n();
  function pick(next: Lang) {
    try { localStorage.setItem("ds-lang", next); } catch { /* private mode: the choice lasts this visit */ }
    const q = new URLSearchParams(window.location.search);
    q.delete("lang");
    const search = q.toString();
    window.location.assign(BASE + langPath(next) + (search ? `?${search}` : "") + window.location.hash);
  }
  return (
    <label className="relative flex h-10 items-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-high focus-within:outline-2 focus-within:outline-primary">
      <md-icon aria-hidden="true" class="pointer-events-none absolute left-2.5">language</md-icon>
      <select aria-label={d.meta.language} value={lang} onChange={(e) => pick(e.target.value as Lang)}
        className="md-label-large h-full cursor-pointer appearance-none rounded-full bg-transparent pl-9 pr-3 outline-none">
        {LANGS.map((l) => <option key={l} value={l} lang={HTML_LANG[l]} className="bg-surface text-on-surface">{LANG_NAMES[l]}</option>)}
      </select>
    </label>
  );
}
