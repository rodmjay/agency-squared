import { ArrowRight, BadgeCheck, EyeOff, HandCoins, MessageSquareText, Receipt, Scale, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HeroSplit } from "@/components/hero-split";
import { PayoutPlayground } from "@/components/payout-playground";
import { STREAMS } from "@/lib/streams";
import { cn } from "@/lib/utils";

const INVITE = "https://www.linkedin.com/in/rodmjay";

const steps = [
  { icon: Scale, title: "Stack the rate", body: "Put everyone on the contract: contractor, recruiter, referral partner, PM, your margin. Each gets dollars per hour, locked when the work starts." },
  { icon: Receipt, title: "Bill one clean invoice", body: "Hours get approved, the client gets a single invoice with a payment link. They see the total, never the split." },
  { icon: HandCoins, title: "Money lands, shares move", body: "The moment the client's payment clears, every share becomes payable to its owner. Nobody fronts payroll." },
  { icon: Undo2Icon, title: "Refunds roll back fairly", body: "If a payment is refunded or disputed, every share gives back its slice in proportion. No awkward chasing." },
];

function Undo2Icon(props: React.ComponentProps<"svg">) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M9 14 4 9l5-5" /><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
    </svg>
  );
}

const perks = [
  { icon: Users, title: "Referrals that pay themselves", body: "Give partners a cut of every hour the client they sent you buys. It's tracked and paid out with no spreadsheets." },
  { icon: EyeOff, title: "Your bench stays yours", body: "Clients see their projects, totals and invoices. Never your team's names, rates or pay." },
  { icon: BadgeCheck, title: "Licensed sign-offs, on the record", body: "When a step needs an accountant or attorney, it goes to a real professional and their sign-off is recorded." },
];

export default function Home() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2">Skip to content</a>
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
        <a href="#" className="flex items-center gap-2 font-heading text-xl font-extrabold tracking-tight">
          <span className="relative inline-block size-6 rounded-md border-[3px] border-foreground" aria-hidden>
            <span className="absolute -right-1.5 -top-1.5 size-3 rounded-sm bg-primary" />
          </span>
          AgencyPro
        </a>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex" aria-label="Sections">
          <a className="hover:text-foreground" href="#how">How it splits</a>
          <a className="hover:text-foreground" href="#play">Try it</a>
          <a className="hover:text-foreground" href="#streams">Who gets paid</a>
        </nav>
        <a href={INVITE} target="_blank" rel="noopener" className={cn(buttonVariants({ size: "sm" }), "rounded-full px-4")}>Get an invite</a>
      </header>

      <main id="main" className="flex-1">
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-20 pt-8 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:pt-16">
          <div className="min-w-0">
            <Badge variant="secondary" className="mb-5 gap-1.5 rounded-full px-3 py-1"><Sparkles className="size-3.5" aria-hidden /> Private beta · invite only</Badge>
            <h1 className="font-heading text-5xl font-extrabold leading-[1.02] tracking-tight text-balance sm:text-6xl">
              Everyone who earned a cut <span className="text-primary">gets paid.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground text-pretty">
              AgencyPro splits every billed hour between the people who made it happen: the contractor, the recruiter who found them, the partner who sent the client, your PM and your agency. The client pays one invoice. When the money lands, every share moves on its own.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#play" className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-full px-6 text-base")}>Play with the split <ArrowRight className="size-4" aria-hidden /></a>
              <a href={INVITE} target="_blank" rel="noopener" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "h-11 rounded-full px-6 text-base")}>Get an invite</a>
            </div>
          </div>
          <HeroSplit />
        </section>

        <section id="how" className="border-y bg-card/60 py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">How it splits</p>
            <h2 className="mt-2 max-w-2xl font-heading text-4xl font-extrabold tracking-tight text-balance">Pay-when-paid, for everyone at once.</h2>
            <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s, i) => (
                <li key={s.title}>
                  <Card className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><s.icon className="size-5" aria-hidden /></span>
                        <span className="font-mono text-sm text-muted-foreground">0{i + 1}</span>
                      </div>
                      <CardTitle className="mt-3 font-heading text-lg">{s.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">{s.body}</CardContent>
                  </Card>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="play" className="mx-auto w-full max-w-6xl scroll-mt-6 px-4 py-20 sm:px-6">
          <p className="font-mono text-xs uppercase tracking-widest text-primary">Try it</p>
          <h2 className="mt-2 max-w-2xl font-heading text-4xl font-extrabold tracking-tight text-balance">Build a rate. Watch the money find its people.</h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">Nothing you do here leaves this page.</p>
          <div className="mt-10"><PayoutPlayground /></div>
        </section>

        <section id="streams" className="border-y bg-card/60 py-20">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
            <p className="font-mono text-xs uppercase tracking-widest text-primary">Who gets paid</p>
            <h2 className="mt-2 max-w-2xl font-heading text-4xl font-extrabold tracking-tight text-balance">Up to nine shares on every hour.</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">Use the ones your deal needs. Leave the rest at zero.</p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {STREAMS.map((s) => (
                <li key={s.key} className="flex gap-4 rounded-2xl bg-card p-5 ring-1 ring-foreground/10">
                  <span className="mt-1 h-10 w-2 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
                  <div>
                    <p className="font-heading font-bold">{s.name} <span className="font-sans text-sm font-normal text-muted-foreground">· {s.who}</span></p>
                    <p className="mt-1 text-sm text-muted-foreground">{s.blurb}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6">
          <div className="grid gap-5 md:grid-cols-3">
            {perks.map((p) => (
              <Card key={p.title}>
                <CardHeader>
                  <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><p.icon className="size-5" aria-hidden /></span>
                  <CardTitle className="mt-3 font-heading text-lg">{p.title}</CardTitle>
                  <CardDescription>{p.body}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="mt-5 grid items-center gap-6 rounded-3xl bg-foreground p-8 text-background sm:p-10 md:grid-cols-[1fr_auto]">
            <div>
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest opacity-70"><MessageSquareText className="size-4" aria-hidden /> Runs from your Claude</p>
              <p className="mt-3 font-heading text-2xl font-bold text-balance sm:text-3xl">&ldquo;Log three hours on the website project.&rdquo; &ldquo;Draft this month&apos;s invoice.&rdquo;</p>
              <p className="mt-3 max-w-2xl opacity-75">Add the AgencyPro connector to the Claude you already use. It acts with your permissions only, and we never run or bill you for the AI.</p>
            </div>
          </div>
        </section>

        <section id="invite" className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-14 text-primary-foreground sm:px-14">
            <div className="absolute inset-x-0 bottom-0 flex h-3" aria-hidden>
              {STREAMS.map((s) => <span key={s.key} className="flex-1" style={{ background: s.color }} />)}
            </div>
            <h2 className="max-w-2xl font-heading text-4xl font-extrabold tracking-tight text-balance">Run an agency that shares the upside? Come build it with us.</h2>
            <p className="mt-4 max-w-xl opacity-85">We&apos;re letting in a few agencies at a time. Tell us what you do and how your people get paid today.</p>
            <a href={INVITE} target="_blank" rel="noopener" className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "mt-8 h-11 rounded-full px-6 text-base")}>Message us on LinkedIn <ArrowRight className="size-4" aria-hidden /></a>
            <p className="mt-6 text-sm opacity-75">During the beta, payouts run in Stripe&apos;s test mode, so no real money moves yet. Pricing is set at launch.</p>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 pb-10 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6">
        <span>© 2026 Agency Squared, a Pro Squared company</span>
        <span>Claude is a trademark of Anthropic. Stripe is a trademark of Stripe, Inc. AgencyPro is not affiliated with either.</span>
      </footer>
    </>
  );
}
