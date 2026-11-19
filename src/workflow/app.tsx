"use client";

// The agency app: one client-side app over a Source (the live API or the in-browser demo). Hash routes
// (#/contracts/ct12) keep it a single static page, so the demo runs on GitHub Pages under any base path.
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DICTS, HTML_LANG, LANGS, LANG_NAMES, fmt, type Dict, type Lang } from "@/i18n";
import type { Action, Source, World } from "./model";
import { useLoadMaterial, useToast, IconBtn, Btn } from "./ui";
import { DemoError } from "./demo";
import * as S from "./screens";

export type Section = "dashboard" | "clients" | "people" | "contracts" | "time" | "invoices" | "payouts" | "settings";
const NAV: { key: Section; icon: string }[] = [
  { key: "dashboard", icon: "space_dashboard" },
  { key: "clients", icon: "business" },
  { key: "people", icon: "groups" },
  { key: "contracts", icon: "handshake" },
  { key: "time", icon: "schedule" },
  { key: "invoices", icon: "receipt_long" },
  { key: "payouts", icon: "payments" },
  { key: "settings", icon: "settings" },
];

type Ctx = {
  w: World; d: Dict["work"]; lang: Lang; source: Source;
  act: (a: Action, ok?: string) => Promise<World | null>;
  toast: (text: string, error?: boolean) => void;
  go: (path: string) => void;
  route: { section: Section; id?: string; sub?: string };
  money: (n: number) => string; day: (iso: string) => string; num: (n: number) => string; compact: (n: number) => string;
  replace: (w: World) => void;
};
const C = createContext<Ctx | null>(null);
export const useWork = () => useContext(C)!;

function parse(hash: string): Ctx["route"] {
  const [section, id, sub] = hash.replace(/^#\/?/, "").split("/");
  return { section: (NAV.some((n) => n.key === section) ? section : "dashboard") as Section, id: id || undefined, sub: sub || undefined };
}

const LANG_KEY = "asq_lang";
function initialLang(fallback: Lang): Lang {
  try {
    const q = new URLSearchParams(location.search).get("lang");
    const saved = q ?? localStorage.getItem(LANG_KEY) ?? document.cookie.match(/asq_lang=(\w+)/)?.[1];
    if (saved === "en" || saved === "es") return saved;
    return navigator.languages?.some((l) => /^es\b/i.test(l)) ? "es" : fallback;
  } catch { return fallback; }
}

/** The whole app. `gate` renders instead until it returns null (the demo's sign-in). */
export function AgencyApp({ source, lang: start, gate, onSignOut }: {
  source: Source; lang: Lang; gate?: (lang: Lang, setLang: (l: Lang) => void) => ReactNode | null; onSignOut: () => void;
}) {
  useLoadMaterial();
  const [lang, setLangState] = useState<Lang>(() => (typeof window === "undefined" ? start : initialLang(start)));
  const [w, setW] = useState<World | null>(null);
  const [route, setRoute] = useState(() => parse(typeof location === "undefined" ? "" : location.hash));
  const [menu, setMenu] = useState(false);
  const { show, node: toastNode } = useToast();

  useEffect(() => {
    document.documentElement.lang = HTML_LANG[lang];
    try { localStorage.setItem(LANG_KEY, lang); document.cookie = `asq_lang=${lang}; path=/; max-age=31536000; samesite=lax`; } catch { /* fine */ }
  }, [lang]);
  useEffect(() => {
    const on = () => { setRoute(parse(location.hash)); setMenu(false); window.scrollTo(0, 0); };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => { source.load().then(setW, () => show(DICTS[lang].work.errors.generic, true)); }, [source]); // eslint-disable-line react-hooks/exhaustive-deps

  const d = DICTS[lang].work;
  const locale = lang === "es" ? "es-419" : "en-US";
  const money = useMemo(() => { const f = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", currencyDisplay: "narrowSymbol" }); return (n: number) => f.format(n); }, [locale]);
  const num = useMemo(() => { const f = new Intl.NumberFormat(locale); return (n: number) => f.format(n); }, [locale]);
  const compact = useMemo(() => { const f = new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }); return (n: number) => f.format(n); }, [locale]);
  const day = useMemo(() => { const f = new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
    return (iso: string) => f.format(new Date(iso.length === 10 ? `${iso}T12:00:00Z` : iso)); }, [locale]);

  const act = useCallback(async (a: Action, ok?: string) => {
    try {
      const next = await source.act(a);
      setW(next);
      if (ok) show(ok);
      return next;
    } catch (e) {
      const key = e instanceof DemoError ? e.message : (e as Error)?.message;
      show((d.errors as Record<string, string>)[key] ?? d.errors.generic, true);
      return null;
    }
  }, [source, d, show]);

  const g = gate?.(lang, setLangState);
  if (g) return <>{g}{toastNode}</>;
  if (!w) return <div className="flex min-h-dvh items-center justify-center" aria-busy="true" />;

  const ctx: Ctx = {
    w, d, lang, source, act, toast: show, route, money, day, num, compact, replace: setW,
    go: (path) => { location.hash = `#/${path}`; },
  };
  const nav = (
    <nav aria-label={d.nav.main} className="flex flex-col gap-1">
      {NAV.map((n) => {
        const on = route.section === n.key;
        return (
          <a key={n.key} href={`#/${n.key}`} aria-current={on ? "page" : undefined}
            className={`md-label-large flex h-14 items-center gap-3 rounded-full px-4 ${on ? "bg-secondary-container text-on-secondary-container" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
            <md-icon aria-hidden="true" class="icon-24">{n.icon}</md-icon>
            {d.nav[n.key]}
          </a>
        );
      })}
    </nav>
  );
  const brand = (
    <a href="#/dashboard" className="md-title-medium flex min-w-0 items-center gap-2 font-medium">
      <span className="flex h-6 w-9 shrink-0 gap-0.5 overflow-hidden rounded-md" aria-hidden>
        <span className="flex-[5]" style={{ background: "var(--s-contractor)" }} />
        <span className="flex-[2]" style={{ background: "var(--s-marketer)" }} />
        <span className="flex-[3]" style={{ background: "var(--s-agency)" }} />
      </span>
      <span className="truncate">{w.agency.name}</span>
    </a>
  );
  // The top bar on phones: the mark alone below ~420px, so the name never cuts off next to the language menu.
  const barBrand = (
    <a href="#/dashboard" aria-label={w.agency.name} className="md-title-medium flex min-w-0 items-center gap-2 font-medium">
      <span className="flex h-6 w-9 shrink-0 gap-0.5 overflow-hidden rounded-md" aria-hidden>
        <span className="flex-[5]" style={{ background: "var(--s-contractor)" }} />
        <span className="flex-[2]" style={{ background: "var(--s-marketer)" }} />
        <span className="flex-[3]" style={{ background: "var(--s-agency)" }} />
      </span>
      <span className="hidden truncate min-[420px]:inline">{w.agency.name}</span>
    </a>
  );
  const Screen = {
    dashboard: S.Dashboard, clients: S.Clients, people: S.People, contracts: S.Contracts,
    time: S.Time, invoices: S.Invoices, payouts: S.Payouts, settings: S.Settings,
  }[route.section];

  return (
    <C.Provider value={ctx}>
      <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById("main")?.focus(); }}
        className="md-label-large sr-only z-50 rounded-md bg-primary px-4 py-2 text-on-primary focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        {d.nav.skip}
      </a>
      <p className="md-label-medium bg-secondary-container px-4 py-1.5 text-center text-on-secondary-container">
        {source.mode === "demo" ? d.demoBanner : d.liveBanner}
      </p>
      <div className="flex min-h-[calc(100dvh-30px)] bg-surface-container-low">
        {/* Navigation drawer: always open on wide screens, a modal sheet on phones */}
        <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col gap-4 overflow-y-auto px-3 py-4 lg:flex">
          <div className="px-4 py-2">{brand}</div>
          {nav}
        </aside>
        {menu && (
          <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label={d.nav.menu}
            onKeyDown={(e) => { if (e.key === "Escape") setMenu(false); }}>
            <button aria-label={d.nav.close} className="absolute inset-0 bg-scrim/40" onClick={() => setMenu(false)} />
            <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col gap-4 overflow-y-auto rounded-r-2xl bg-surface-container-low px-3 py-4 shadow-level1">
              <div className="flex items-center justify-between gap-2 pl-4">{brand}<IconBtn icon="close" label={d.nav.close} onClick={() => setMenu(false)} /></div>
              {nav}
            </div>
          </div>
        )}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-2 px-2 py-2 sm:px-4">
            <div className="flex min-w-0 items-center gap-1 lg:hidden">
              <IconBtn icon="menu" label={d.nav.menu} onClick={() => setMenu(true)} />
              {barBrand}
            </div>
            <span className="hidden lg:block" />
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <LangMenu lang={lang} label={d.nav.language} onPick={setLangState} />
              <span className="md-body-medium hidden text-on-surface-variant sm:inline">{w.me.name}</span>
              <Btn kind="text" onClick={onSignOut}>{d.nav.signOut}</Btn>
            </div>
          </header>
          <main id="main" tabIndex={-1} className="mx-2 mb-2 min-h-0 flex-1 rounded-3xl bg-surface px-4 py-6 outline-none sm:mx-4 sm:mb-4 sm:px-8 sm:py-8">
            <div className="mx-auto w-full max-w-6xl"><Screen /></div>
          </main>
        </div>
      </div>
      {toastNode}
    </C.Provider>
  );
}

export function LangMenu({ lang, label, onPick }: { lang: Lang; label: string; onPick: (l: Lang) => void }) {
  return (
    <label className="relative flex h-10 items-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-high focus-within:outline-2 focus-within:outline-primary">
      <md-icon aria-hidden="true" class="pointer-events-none absolute left-2.5">language</md-icon>
      <select aria-label={label} value={lang} onChange={(e) => onPick(e.target.value as Lang)}
        className="md-label-large h-full cursor-pointer appearance-none rounded-full bg-transparent pl-9 pr-3 outline-none">
        {LANGS.map((l) => <option key={l} value={l} lang={HTML_LANG[l]} className="bg-surface text-on-surface">{LANG_NAMES[l]}</option>)}
      </select>
    </label>
  );
}

export { fmt };
