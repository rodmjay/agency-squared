"use client";

// The public demo: a sign-in for the demo admin, then the agency app on the in-browser demo agency. The login only
// guards made-up data; its password is shared privately, and only a hash of it is here.
import { useMemo, useState, useSyncExternalStore } from "react";
import { BASE, DICTS, type Lang } from "@/i18n";
import { AgencyApp, LangMenu } from "./app";
import { DemoSource } from "./demo";
import { Btn, Field } from "./ui";

const LOGIN_HASH = "27f2eab553abffd748e270d096ccfe1ab40aca9d1e16c467b64a1823ac92f10e";
const AUTH_KEY = "asq-demo-auth";

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function DemoApp() {
  // Everything here lives in the browser: render nothing on the server, then the app once mounted.
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [signedIn, setSignedIn] = useState(() => {
    try { return typeof window !== "undefined" && localStorage.getItem(AUTH_KEY) === LOGIN_HASH; } catch { return false; }
  });
  const source = useMemo(() => (mounted ? new DemoSource() : null), [mounted]);
  if (!source) return null;
  return (
    <AgencyApp source={source} lang="en"
      onSignOut={() => { try { localStorage.removeItem(AUTH_KEY); } catch { /* fine */ } setSignedIn(false); location.hash = ""; }}
      gate={signedIn ? undefined : (lang, setLang) => <SignIn lang={lang} setLang={setLang} onIn={() => setSignedIn(true)} />} />
  );
}

function SignIn({ lang, setLang, onIn }: { lang: Lang; setLang: (l: Lang) => void; onIn: () => void }) {
  const d = DICTS[lang].work;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [wrong, setWrong] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if ((await sha256(`${email.trim().toLowerCase()}:${password}`)) !== LOGIN_HASH) { setWrong(true); return; }
    try { localStorage.setItem(AUTH_KEY, LOGIN_HASH); } catch { /* signed in for this visit only */ }
    onIn();
  }
  return (
    <>
      <p className="md-label-medium bg-tertiary-container px-4 py-1.5 text-center text-on-tertiary-container">{d.demoBanner}</p>
      <main id="main" className="flex min-h-[calc(100dvh-30px)] items-center justify-center bg-surface-container-low px-4 py-10">
        <div className="w-full max-w-md rounded-3xl bg-surface p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <span className="md-title-medium flex items-center gap-2 font-medium">
              <span className="flex h-6 w-9 gap-0.5 overflow-hidden rounded-md" aria-hidden>
                <span className="flex-[5]" style={{ background: "var(--s-contractor)" }} />
                <span className="flex-[2]" style={{ background: "var(--s-marketer)" }} />
                <span className="flex-[3]" style={{ background: "var(--s-agency)" }} />
              </span>
              {d.brand}
            </span>
            <LangMenu lang={lang} label={d.nav.language} onPick={setLang} />
          </div>
          <h1 className="md-headline-small">{d.signIn.title}</h1>
          <p className="md-body-medium mt-2 text-on-surface-variant">{d.signIn.body}</p>
          <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
            <Field label={d.signIn.email} type="email" value={email} onValue={(v) => { setEmail(v); setWrong(false); }} required autoFocus name="email" autocomplete="username" />
            <Field label={d.signIn.password} type="password" value={password} onValue={(v) => { setPassword(v); setWrong(false); }} required name="password" autocomplete="current-password" />
            {wrong && <p role="alert" className="md-body-medium text-error">{d.signIn.wrong}</p>}
            <Btn type="submit">{d.signIn.submit}</Btn>
          </form>
          <a href={`${BASE}/`} className="md-label-large mt-6 inline-block text-primary">{d.signIn.back}</a>
        </div>
      </main>
    </>
  );
}
