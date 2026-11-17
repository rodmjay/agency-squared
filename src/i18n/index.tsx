import { Fragment, type ReactNode } from "react";
import en from "./en.json";
import es from "./es.json";

// English and Spanish (es-419), from our own dictionaries (design system ADR 0002). en.json is the source;
// es.json must have the same shape, or the build fails here and in `npm run check:i18n`.
export type Dict = typeof en;
export type Lang = "en" | "es";
export const LANGS: Lang[] = ["en", "es"];
export const DICTS: Record<Lang, Dict> = { en, es };
export const HTML_LANG: Record<Lang, string> = { en: "en", es: "es-419" };
export const LANG_NAMES: Record<Lang, string> = { en: "English", es: "Español" };

export const BASE = process.env.PAGES_BASE_PATH ?? "";
export const SITE = "https://rodmjay.github.io/agency-squared";
/** The page for a language: "/" for English, "/es/" for Spanish. */
export const langPath = (lang: Lang) => (lang === "en" ? "/" : `/${lang}/`);

/** Fills {name} placeholders. */
export function fmt(s: string, vars: Record<string, string | number>) {
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** Like fmt, but placeholders can be React nodes (a bold amount inside a sentence). */
export function rich(s: string, vars: Record<string, ReactNode>) {
  return s.split(/(\{\w+\})/).map((part, i) => {
    const k = part.match(/^\{(\w+)\}$/)?.[1];
    return <Fragment key={i}>{k && k in vars ? vars[k] : part}</Fragment>;
  });
}
