import { HeroSplit } from "@/components/hero-split";
import { WorkflowCard } from "@/components/workflow-card";
import { MdButton } from "@/components/material";
import { PayoutPlayground } from "@/components/payout-playground";
import { STREAMS } from "@/lib/streams";

const INVITE = "https://www.linkedin.com/in/rodmjay";

const steps = [
  { icon: "stacked_bar_chart", title: "Stack the rate", body: "Put everyone on the contract: contractor, recruiter, referral partner, PM, your margin. Each gets dollars per hour, locked when the work starts." },
  { icon: "receipt_long", title: "Bill one clean invoice", body: "Hours get approved, the client gets a single invoice with a payment link. They see the total, never the split." },
  { icon: "hourglass_top", title: "Pending until it fully clears", body: "When the client pays, every share shows up as pending for its owner. It stays pending until the payment has completely cleared. Nobody fronts payroll." },
  { icon: "check_circle", title: "It clears or it doesn't", body: "If it clears, everyone is paid, for good. If it doesn't, no one is paid and no one owes a thing. You'll never have to pay money back." },
];

const humanSteps = [
  { icon: "send", title: "Your workflow asks", body: "When it reaches a step a person must do, your Claude or your system requests a human step through AgencyPro." },
  { icon: "badge", title: "A vetted pro takes it", body: "A professional who holds the right credential claims the step and gets the documents and context." },
  { icon: "fact_check", title: "They decide, on the record", body: "Approve, reject or ask for changes. The decision is recorded with who made it and when." },
  { icon: "arrow_forward", title: "Your workflow carries on", body: "The answer comes back to your workflow, and the professional's share goes into the same fair payout." },
];

const perks = [
  { icon: "forum", title: "Bring your own Claude", body: "AgencyPro plugs into the Claude you already use. It acts with your permissions only, and we never run or bill you for the AI." },
  { icon: "visibility_off", title: "Your bench stays yours", body: "Clients see their projects, totals and invoices. Never your team's names, rates or pay." },
  { icon: "verified", title: "Licensed sign-offs, on the record", body: "When a step needs an accountant or attorney, it goes to a real professional and their sign-off is recorded." },
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="md-label-large text-primary">{children}</p>;
}

export default function Home() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2">Skip to content</a>
      <header className="sticky top-0 z-40 bg-surface-container/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <a href="#" className="md-title-large flex items-center gap-2 font-medium">
            <span className="flex h-6 w-9 gap-0.5 overflow-hidden rounded-md" aria-hidden>
              <span className="flex-[5]" style={{ background: "var(--s-contractor)" }} />
              <span className="flex-[2]" style={{ background: "var(--s-marketer)" }} />
              <span className="flex-[3]" style={{ background: "var(--s-agency)" }} />
            </span>
            AgencyPro
          </a>
          <nav className="md-label-large hidden items-center gap-1 md:flex" aria-label="Sections">
            <MdButton kind="text" href="#humans">Human steps</MdButton>
            <MdButton kind="text" href="#how">How payouts work</MdButton>
            <MdButton kind="text" href="#play">Try the split</MdButton>
          </nav>
          <MdButton kind="tonal" href={INVITE} external>Get an invite</MdButton>
        </div>
      </header>

      <main id="main" className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-20">
          <div className="min-w-0">
            <p className="md-label-large inline-flex items-center gap-1.5 rounded-lg border border-outline px-3 py-1.5 text-on-surface-variant">
              <md-icon aria-hidden="true">hub</md-icon> Works with Claude · MCP and API · Private beta
            </p>
            <h1 className="md-display-large mt-6 text-balance">Your AI does the work. Real people fill the gaps.</h1>
            <p className="md-body-large mt-6 max-w-xl text-on-surface-variant text-pretty">
              AgencyPro plugs into Claude through MCP and into your systems through its API. When a workflow reaches a step only a person should do, like a professional review and sign-off, it goes to a vetted human, and the decision comes back on the record. Everyone who worked on it gets paid fairly, and no one ever pays it back.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <MdButton href="#humans" icon="person_check">See a human step</MdButton>
              <MdButton kind="outlined" href={INVITE} external>Get an invite</MdButton>
            </div>
          </div>
          <WorkflowCard />
        </section>

        <section id="humans" className="scroll-mt-20 bg-surface-low py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <Eyebrow>Human steps</Eyebrow>
            <h2 className="md-display-medium mt-2 max-w-3xl text-balance">When your workflow needs a person, it gets one.</h2>
            <p className="md-body-large mt-3 max-w-2xl text-on-surface-variant">AI shouldn&apos;t sign off on the books alone. AgencyPro routes those steps to real, vetted professionals and keeps the record.</p>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {humanSteps.map((s, i) => (
                <li key={s.title} className="md-card-outlined flex flex-col gap-3 bg-surface p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-primary-container text-on-primary-container">
                      <md-icon aria-hidden="true">{s.icon}</md-icon>
                    </span>
                    <span className="md-label-large text-on-surface-variant">Step {i + 1}</span>
                  </div>
                  <h3 className="md-title-large">{s.title}</h3>
                  <p className="md-body-medium text-on-surface-variant">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="how" className="scroll-mt-20 py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <Eyebrow>And everyone gets paid fairly</Eyebrow>
            <h2 className="md-display-medium mt-2 max-w-3xl text-balance">Pending until it clears. Never paid back.</h2>
            <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
              <p className="md-body-large text-on-surface-variant">Each person who worked on the job, from the contractor to the professional who signed off, gets a share of what the client pays. Every share stays pending until the payment fully clears. Then it clears and everyone is paid, or it doesn&apos;t and no one owes anything.</p>
              <HeroSplit />
            </div>
            <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title} className="md-card-outlined flex flex-col gap-3 p-6">
                  <div className="flex items-center justify-between">
                    <span className="grid size-12 place-items-center rounded-2xl bg-secondary-container text-on-secondary-container">
                      <md-icon aria-hidden="true">{s.icon}</md-icon>
                    </span>
                    <span className="md-label-large text-on-surface-variant">Step {i + 1}</span>
                  </div>
                  <h3 className="md-title-large">{s.title}</h3>
                  <p className="md-body-medium text-on-surface-variant">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="play" className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 sm:px-6">
          <Eyebrow>Try it</Eyebrow>
          <h2 className="md-display-medium mt-2 max-w-3xl text-balance">Build a rate. Watch the money find its people.</h2>
          <p className="md-body-large mt-3 max-w-2xl text-on-surface-variant">Nothing you enter leaves this page unless you share the link yourself.</p>
          <div className="mt-10"><PayoutPlayground invite={INVITE} /></div>
        </section>

        <section id="streams" className="scroll-mt-20 bg-surface-low py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <Eyebrow>Who gets paid</Eyebrow>
            <h2 className="md-display-medium mt-2 max-w-2xl text-balance">Up to nine shares on every hour.</h2>
            <p className="md-body-large mt-3 max-w-2xl text-on-surface-variant">Use the ones your deal needs. Leave the rest at zero.</p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {STREAMS.map((s) => (
                <li key={s.key} className="md-card-outlined flex gap-4 p-5">
                  <span className="mt-1 h-10 w-1.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
                  <div>
                    <p className="md-title-medium">{s.name} <span className="md-body-medium text-on-surface-variant">· {s.who}</span></p>
                    <p className="md-body-medium mt-1 text-on-surface-variant">{s.blurb}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-4 md:grid-cols-3">
            {perks.map((p) => (
              <div key={p.title} className="md-card-filled flex flex-col gap-3 p-6">
                <span className="grid size-12 place-items-center rounded-2xl bg-tertiary-container text-on-tertiary-container">
                  <md-icon aria-hidden="true">{p.icon}</md-icon>
                </span>
                <h3 className="md-title-large">{p.title}</h3>
                <p className="md-body-medium text-on-surface-variant">{p.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-3xl bg-inverse-surface p-8 text-inverse-on-surface sm:p-10">
            <p className="md-label-large flex items-center gap-2 text-inverse-primary"><md-icon aria-hidden="true">forum</md-icon> Runs from your Claude</p>
            <p className="md-headline-large mt-3 text-balance">&ldquo;Log three hours on the website project.&rdquo; &ldquo;Draft this month&apos;s invoice.&rdquo;</p>
            <p className="md-body-large mt-3 max-w-2xl opacity-80">Add the AgencyPro connector to the Claude you already use. It acts with your permissions only, and we never run or bill you for the AI.</p>
          </div>
        </section>

        <section id="invite" className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
          <div className="rounded-3xl bg-primary-container px-8 py-14 text-on-primary-container sm:px-14">
            <h2 className="md-display-medium max-w-3xl text-balance">Run an agency that shares the upside? Come build it with us.</h2>
            <p className="md-body-large mt-4 max-w-xl">We&apos;re letting in a few agencies at a time. Tell us what you do and how your people get paid today.</p>
            <div className="mt-8"><MdButton href={INVITE} external icon="arrow_forward" trailingIcon>Message us on LinkedIn</MdButton></div>
            <p className="md-body-medium mt-6 opacity-80">During the beta, payouts run in Stripe&apos;s test mode, so no real money moves yet. Pricing is set at launch.</p>
          </div>
        </section>
      </main>

      <footer className="md-body-medium mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 pb-10 text-on-surface-variant sm:flex-row sm:justify-between sm:px-6">
        <span>© 2026 Agency Squared, a Pro Squared company</span>
        <span>Claude is a trademark of Anthropic. Stripe is a trademark of Stripe, Inc. AgencyPro is not affiliated with either.</span>
      </footer>
    </>
  );
}
