import { WorkflowCard } from "@/components/workflow-card";
import { HumanStepDemo } from "@/components/human-step-demo";
import { ConnectTabs } from "@/components/connect-tabs";
import { MobileMenu } from "@/components/mobile-menu";
import { MdButton } from "@/components/material";
import { PayoutPlayground } from "@/components/payout-playground";
import { STREAMS } from "@/lib/streams";
import { I18nProvider, LangMenu } from "@/components/i18n";
import { DICTS, fmt, type Lang } from "@/i18n";

const INVITE = "mailto:agency@squared.pro?subject=AgencyPro";

// Icons in the same order as the dictionary's lists (src/i18n/en.json).
const STEP_ICONS = ["stacked_bar_chart", "receipt_long", "verified"];
const HUMAN_ICONS = ["send", "badge", "fact_check", "arrow_forward"];
const KIND_ICONS = ["calculate", "gavel", "edit_document", "approval"];
const PERK_ICONS = ["forum", "visibility_off", "verified"];
const ROSTER_ICONS = ["inventory_2", "schedule", "verified_user"];
const NAV_KEYS = ["humans", "connect", "how", "play", "faq"] as const;

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="md-label-large text-primary">{children}</p>;
}

export function Home({ lang }: { lang: Lang }) {
  const d = DICTS[lang];
  const NAV: [string, string][] = NAV_KEYS.map((k) => [`#${k}`, d.nav[k]]);
  return (
    <I18nProvider lang={lang}>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2">{d.meta.skip}</a>
      <header className="sticky top-0 z-40 bg-surface-container">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#" className="md-title-large flex items-center gap-2 font-medium">
            <span className="flex h-6 w-9 gap-0.5 overflow-hidden rounded-md" aria-hidden>
              <span className="flex-[5]" style={{ background: "var(--s-contractor)" }} />
              <span className="flex-[2]" style={{ background: "var(--s-marketer)" }} />
              <span className="flex-[3]" style={{ background: "var(--s-agency)" }} />
            </span>
            AgencyPro
          </a>
          <nav className="md-label-large hidden items-center gap-0.5 xl:flex" aria-label={d.nav.sections}>
            {NAV.map(([href, label]) => <MdButton key={href} kind="text" href={href}>{label}</MdButton>)}
          </nav>
          <div className="flex items-center gap-2">
            <LangMenu />
            <span className="hidden sm:contents"><MdButton kind="tonal" href={INVITE} external>{d.nav.invite}</MdButton></span>
            <MobileMenu links={NAV} label={d.nav.menu} navLabel={d.nav.sections} />
          </div>
        </div>
      </header>

      <main id="main" className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
          <div className="min-w-0">
            <p className="md-label-large inline-flex items-center gap-1.5 rounded-lg border border-outline px-3 py-1.5 text-on-surface-variant">
              <md-icon aria-hidden="true">hub</md-icon> {d.hero.badge}
            </p>
            <h1 className="md-display-large mt-6 text-balance">{d.hero.title}</h1>
            <p className="md-body-large mt-6 max-w-xl text-on-surface-variant text-pretty">{d.hero.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <MdButton href="#humans" icon="person_check">{d.hero.ctaHuman}</MdButton>
              <MdButton kind="outlined" href={INVITE} external>{d.hero.ctaInvite}</MdButton>
            </div>
          </div>
          <WorkflowCard />
        </section>

        <section id="humans" className="scroll-mt-20 bg-surface-low py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
              <div>
                <Eyebrow>{d.humans.eyebrow}</Eyebrow>
                <h2 className="md-display-medium mt-2 text-balance">{d.humans.title}</h2>
                <p className="md-body-large mt-3 text-on-surface-variant">{d.humans.body}</p>
              </div>
              <HumanStepDemo />
            </div>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {d.humans.steps.map((s, i) => (
                <li key={i} className="md-card-outlined flex flex-col gap-3 bg-surface p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-primary-container text-on-primary-container">
                      <md-icon aria-hidden="true">{HUMAN_ICONS[i]}</md-icon>
                    </span>
                    <span className="md-label-large text-on-surface-variant">{fmt(d.humans.step, { n: i + 1 })}</span>
                  </div>
                  <h3 className="md-title-large">{s.title}</h3>
                  <p className="md-body-medium text-on-surface-variant">{s.body}</p>
                </li>
              ))}
            </ol>
            <h3 className="md-title-large mt-14">{d.humans.kindsTitle}</h3>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {d.humans.kinds.map(({ title, body }, i) => (
                <li key={i} className="flex gap-3 rounded-xl bg-surface p-4">
                  <md-icon aria-hidden="true" class="text-primary">{KIND_ICONS[i]}</md-icon>
                  <div className="min-w-0">
                    <p className="md-title-medium flex flex-wrap items-center gap-2">
                      {title}
                      <span className="md-label-medium rounded-md bg-surface-high px-1.5 py-0.5 text-on-surface-variant">{d.humans.coming}</span>
                    </p>
                    <p className="md-body-medium mt-0.5 text-on-surface-variant">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="connect" className="mx-auto grid w-full max-w-6xl scroll-mt-20 items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Eyebrow>{d.connect.eyebrow}</Eyebrow>
            <h2 className="md-display-medium mt-2 text-balance">{d.connect.title}</h2>
            <p className="md-body-large mt-3 text-on-surface-variant">{d.connect.body}</p>
          </div>
          <ConnectTabs />
        </section>

        <section id="how" className="scroll-mt-20 bg-surface-low py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <Eyebrow>{d.how.eyebrow}</Eyebrow>
            <h2 className="md-display-medium mt-2 max-w-3xl text-balance">{d.how.title}</h2>
            <p className="md-body-large mt-4 max-w-2xl text-on-surface-variant">{d.how.body}</p>
            <ol className="mt-10 grid gap-4 sm:grid-cols-3">
              {d.how.steps.map((s, i) => (
                <li key={i} className="md-card-outlined flex flex-col gap-3 p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-secondary-container text-on-secondary-container">
                      <md-icon aria-hidden="true">{STEP_ICONS[i]}</md-icon>
                    </span>
                    <span className="md-label-large text-on-surface-variant">{fmt(d.humans.step, { n: i + 1 })}</span>
                  </div>
                  <h3 className="md-title-large">{s.title}</h3>
                  <p className="md-body-medium text-on-surface-variant">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="play" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <Eyebrow>{d.play.eyebrow}</Eyebrow>
          <h2 className="md-display-medium mt-2 max-w-3xl text-balance">{d.play.title}</h2>
          <p className="md-body-large mt-3 max-w-2xl text-on-surface-variant">{d.play.body}</p>
          <div className="mt-10"><PayoutPlayground invite={INVITE} /></div>
        </section>

        <section id="streams" className="scroll-mt-20 bg-surface-low py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <Eyebrow>{d.streamsSection.eyebrow}</Eyebrow>
            <h2 className="md-display-medium mt-2 max-w-2xl text-balance">{d.streamsSection.title}</h2>
            <p className="md-body-large mt-3 max-w-2xl text-on-surface-variant">{d.streamsSection.body}</p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {STREAMS.map((s) => (
                <li key={s.key} className="md-card-outlined flex gap-4 p-5">
                  <span className="mt-1 h-10 w-1.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
                  <div>
                    <p className="md-title-medium">{d.streams[s.key].name} <span className="md-body-medium text-on-surface-variant">· {d.streams[s.key].who}</span></p>
                    <p className="md-body-medium mt-1 text-on-surface-variant">{d.streams[s.key].blurb}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {d.perks.map((p, i) => (
              <div key={i} className="md-card-filled flex flex-col gap-3 p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-tertiary-container text-on-tertiary-container">
                  <md-icon aria-hidden="true">{PERK_ICONS[i]}</md-icon>
                </span>
                <h3 className="md-title-large">{p.title}</h3>
                <p className="md-body-medium text-on-surface-variant">{p.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-3xl bg-inverse-surface p-8 text-inverse-on-surface sm:p-10">
            <p className="md-label-large flex items-center gap-2 text-inverse-primary"><md-icon aria-hidden="true">forum</md-icon> {d.claude.label}</p>
            <p className="md-headline-large mt-3 text-balance">{d.claude.quote}</p>
            <p className="md-body-large mt-3 max-w-2xl opacity-80">{d.claude.body}</p>
          </div>
        </section>

        <section id="faq" className="mx-auto w-full max-w-3xl scroll-mt-20 px-4 pb-20 sm:px-6">
          <Eyebrow>{d.faq.eyebrow}</Eyebrow>
          <h2 className="md-headline-large mt-2">{d.faq.title}</h2>
          <div className="md-card-outlined mt-6 divide-y divide-outline-variant overflow-hidden bg-surface">
            {d.faq.items.map(({ q, a }) => (
              <details key={q} className="group">
                <summary className="md-title-medium flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 hover:bg-surface-low focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary [&::-webkit-details-marker]:hidden">
                  {q}
                  <md-icon aria-hidden="true" class="shrink-0 transition-transform group-open:rotate-180">expand_more</md-icon>
                </summary>
                <p className="md-body-large px-5 pb-5 text-on-surface-variant">{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section id="roster" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 pb-20 sm:px-6">
          <div className="md-card-outlined grid gap-8 bg-surface p-8 sm:p-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <Eyebrow>{d.roster.eyebrow}</Eyebrow>
              <h2 className="md-headline-large mt-2 text-balance">{d.roster.title}</h2>
              <p className="md-body-large mt-3 text-on-surface-variant">{d.roster.body}</p>
              <div className="mt-6"><MdButton kind="tonal" href={INVITE} external icon="badge">{d.roster.cta}</MdButton></div>
            </div>
            <ul className="flex flex-col gap-3 self-center">
              {d.roster.items.map(({ title, body }, i) => (
                <li key={title} className="flex gap-3 rounded-xl bg-surface-low p-4">
                  <md-icon aria-hidden="true" class="text-primary">{ROSTER_ICONS[i]}</md-icon>
                  <div>
                    <p className="md-title-medium">{title}</p>
                    <p className="md-body-medium text-on-surface-variant">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="invite" className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
          <div className="rounded-3xl bg-primary-container px-8 py-14 text-on-primary-container sm:px-14">
            <h2 className="md-display-medium max-w-3xl text-balance">{d.invite.title}</h2>
            <p className="md-body-large mt-4 max-w-xl">{d.invite.body}</p>
            <div className="mt-8"><MdButton href={INVITE} external icon="arrow_forward" trailingIcon>{d.invite.cta}</MdButton></div>
            <p className="md-body-medium mt-6 opacity-80">{d.invite.beta}</p>
          </div>
        </section>
      </main>

      <footer className="border-t border-outline-variant">
        <div className="md-body-medium mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 text-on-surface-variant sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <nav aria-label={d.nav.footer} className="flex flex-wrap gap-x-5 gap-y-2">
              {NAV.map(([href, label]) => <a key={href} href={href} className="hover:text-on-surface hover:underline">{label}</a>)}
              <a href={INVITE} target="_blank" rel="noopener" className="hover:text-on-surface hover:underline">{d.nav.invite}</a>
            </nav>
            <a href="#main" className="flex items-center gap-1 hover:text-on-surface"><md-icon aria-hidden="true">arrow_upward</md-icon> {d.nav.top}</a>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            <span>{d.footer.copyright}</span>
            <span>{d.footer.trademarks}</span>
          </div>
        </div>
      </footer>
    </I18nProvider>
  );
}
