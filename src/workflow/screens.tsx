"use client";

// The screens of the agency app. Lists are rows that wrap on phones (no sideways scroll); creating happens in dialogs;
// each view has at most one filled button, for its main action.
import { useMemo, useState, type ReactNode } from "react";
import { fmt, rich } from "@/i18n";
import { useWork } from "./app";
import { DemoSource, type Scenario } from "./demo";
import {
  SHARE_KEYS, billable, byId, clientRate, emptyShares, invoicePayees, payouts, pipeline, round2, usageCost, withMarkup,
  type Contract, type Holders, type Invoice, type Kind, type Member, type Role, type ShareKey, type Shares,
} from "./model";
import { Avatar, Btn, Card, Check, Chip, Dialog, Empty, Field, FilterChip, KindBadge, PageHead, Select, Tabs, type Tone } from "./ui";

const SHARE_COLOR: Record<ShareKey, string> = {
  contractor: "var(--s-contractor)", recruiter: "var(--s-recruiter)", marketer: "var(--s-marketer)", pm: "var(--s-pm)",
  am: "var(--s-am)", agency: "var(--s-agency)", system: "var(--s-system)",
};
const TODAY = () => new Date().toISOString().slice(0, 10);

// ── Shared bits ─────────────────────────────────────────────────────────────

function useLookups() {
  const { w } = useWork();
  return useMemo(() => {
    const project = (id: string) => byId(w.projects, id);
    const client = (projectId: string) => byId(w.clients, project(projectId)?.clientId);
    const member = (id: string | undefined) => byId(w.members, id);
    const contract = (id: string) => byId(w.contracts, id);
    return { project, client, member, contract };
  }, [w]);
}

function Who({ m, sub }: { m: Member | undefined; sub?: ReactNode }) {
  const { d } = useWork();
  if (!m) return null;
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Avatar name={m.name} kind={m.kind} />
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2"><span className="md-body-large truncate">{m.name}</span><KindBadge kind={m.kind} label={d.kind[m.kind]} /></span>
        {sub && <span className="md-body-medium block truncate text-on-surface-variant">{sub}</span>}
      </span>
    </span>
  );
}

function Row({ children, href, className = "" }: { children: ReactNode; href?: string; className?: string }) {
  const cls = `flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl px-4 py-3 ${className}`;
  return href
    ? <li><a href={href} className={`${cls} hover:bg-surface-container-low focus-visible:bg-surface-container-low`}>{children}</a></li>
    : <li className={cls}>{children}</li>;
}

function Back({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="md-label-large -ml-2 mb-4 inline-flex h-10 items-center gap-1 rounded-full px-2 text-primary hover:bg-surface-container-low">
      <md-icon aria-hidden="true">arrow_back</md-icon>{label}
    </a>
  );
}

function Figure({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`figure whitespace-nowrap ${className}`}>{children}</span>;
}

/** The split as one bar: each share's width is its slice of the billed hour. */
function SplitBar({ shares }: { shares: Shares }) {
  const total = clientRate(shares) || 1;
  return (
    <span className="flex h-2.5 w-full min-w-24 gap-0.5 overflow-hidden rounded-full" aria-hidden>
      {SHARE_KEYS.filter((k) => shares[k] > 0).map((k) => (
        <span key={k} style={{ flexGrow: shares[k] / total, background: SHARE_COLOR[k] }} />
      ))}
    </span>
  );
}

const contractTone = (s: Contract["status"]): Tone => (s === "active" ? "good" : s === "draft" ? "neutral" : "bad");
const invoiceTone = (s: Invoice["status"]): Tone => (s === "cleared" ? "good" : s === "paid" ? "waiting" : s === "sent" ? "info" : "neutral");

// ── Dashboard ───────────────────────────────────────────────────────────────

export function Dashboard() {
  const { w, d, money, day, num } = useWork();
  const L = useLookups();
  const p = pipeline(w);
  const tiles: { key: keyof typeof d.pipeline; amount: number; href: string }[] = [
    { key: "waiting", amount: p.waiting, href: "#/time" },
    { key: "ready", amount: p.ready, href: "#/invoices/new" },
    { key: "invoiced", amount: p.invoiced, href: "#/invoices" },
    { key: "clearing", amount: p.clearing, href: "#/payouts" },
    { key: "paid", amount: p.paid, href: "#/payouts" },
  ];
  const steps: { title: string; body: string; href: string; icon: string }[] = [];
  if (p.waitingCount) steps.push({ title: fmt(d.dashboard.approve, { count: p.waitingCount }), body: fmt(d.dashboard.approveBody, { amount: money(p.waiting) }), href: "#/time", icon: "fact_check" });
  for (const pr of w.projects) {
    const b = billable(w, pr.id);
    const amount = round2(b.time.reduce((s, t) => s + t.hours * clientRate(L.contract(t.contractId)!.shares), 0) + b.usage.reduce((s, u) => s + u.amount, 0));
    if (amount > 0) steps.push({ title: fmt(d.dashboard.invoice, { client: L.client(pr.id)?.name ?? "" }), body: fmt(d.dashboard.invoiceBody, { amount: money(amount) }), href: `#/invoices/new/${pr.id}`, icon: "receipt_long" });
  }
  for (const i of w.invoices.filter((x) => x.status === "sent"))
    steps.push({ title: fmt(d.dashboard.follow, { number: i.number, client: byId(w.clients, i.clientId)?.name ?? "" }), body: fmt(d.dashboard.followBody, { date: day(i.sentAt!), amount: money(i.total) }), href: `#/invoices/${i.id}`, icon: "send" });
  for (const c of w.contracts.filter((x) => x.status === "draft"))
    steps.push({ title: fmt(d.dashboard.activate, { title: c.title }), body: d.dashboard.activateBody, href: `#/contracts/${c.id}`, icon: "handshake" });

  const recent = [
    ...w.time.map((t) => ({ date: t.date, id: t.id, contractId: t.contractId, what: t.note, qty: fmt(d.contracts.hoursLogged, { hours: num(t.hours) }) })),
    ...w.usage.map((u) => ({ date: u.date, id: u.id, contractId: u.contractId, what: u.note, qty: fmt(d.contracts.usageLogged, { tokens: num(u.inputTokens + u.outputTokens) }) })),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6);
  const people = w.members.filter((m) => m.kind === "person").length;

  return (
    <>
      <PageHead title={d.dashboard.title} body={fmt(d.dashboard.hello, { name: w.me.name.split(" ")[0] })} />
      <h2 className="sr-only">{d.pipeline.title}</h2>
      <ol className="grid grid-cols-2 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
        {tiles.map((t, i) => (
          <li key={t.key} className={i === 4 ? "col-span-2 sm:col-span-1" : ""}>
            <a href={t.href} className="flex h-full flex-col justify-between gap-3 rounded-xl bg-surface-container px-4 py-4 hover:bg-surface-container-high">
              <span className="md-label-large text-on-surface-variant">{d.pipeline[t.key]}</span>
              <Figure className="text-title-medium sm:text-title-large">{money(t.amount)}</Figure>
            </a>
          </li>
        ))}
      </ol>
      <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr] [&>*]:min-w-0">
        <Card>
          <h2 className="md-title-large mb-2">{d.dashboard.next}</h2>
          {steps.length === 0 ? <p className="md-body-large text-on-surface-variant">{d.dashboard.allClear}</p> : (
            <ul className="-mx-2">
              {steps.slice(0, 6).map((s) => (
                <li key={s.href + s.title}>
                  <a href={s.href} className="flex items-center gap-4 rounded-xl px-2 py-3 hover:bg-surface-container-low">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"><md-icon aria-hidden="true">{s.icon}</md-icon></span>
                    <span className="min-w-0 flex-1"><span className="md-body-large block">{s.title}</span><span className="md-body-medium block text-on-surface-variant">{s.body}</span></span>
                    <md-icon aria-hidden="true" class="text-on-surface-variant">chevron_right</md-icon>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="md-title-large">{d.dashboard.team}</h2>
            <a href="#/people" className="md-label-large text-primary">{d.dashboard.seeAll}</a>
          </div>
          <p className="md-body-medium mt-1 text-on-surface-variant">{fmt(d.dashboard.teamBody, { people, agents: w.members.length - people })}</p>
          <ul className="mt-3 flex flex-col gap-3">
            {w.members.slice(0, 7).map((m) => <li key={m.id}><Who m={m} sub={m.title} /></li>)}
          </ul>
        </Card>
      </div>
      <Card className="mt-6">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="md-title-large">{d.dashboard.recent}</h2>
          <a href="#/time" className="md-label-large text-primary">{d.dashboard.seeAll}</a>
        </div>
        <ul className="-mx-4 mt-2">
          {recent.map((r) => {
            const c = L.contract(r.contractId)!;
            return (
              <Row key={r.id}>
                <Who m={L.member(c.workerId)} sub={`${r.what} · ${L.client(c.projectId)?.name}`} />
                <span className="md-body-medium flex items-center gap-3 text-on-surface-variant"><span>{day(r.date)}</span><Figure>{r.qty}</Figure></span>
              </Row>
            );
          })}
        </ul>
      </Card>
    </>
  );
}

// ── Clients and projects ────────────────────────────────────────────────────

export function Clients() {
  const { w, d, act, money } = useWork();
  const L = useLookups();
  const [adding, setAdding] = useState(false);
  const [projectFor, setProjectFor] = useState<string | null>(null);
  const [f, setF] = useState({ name: "", contact: "", email: "", project: "" });
  const billed = (projectId: string) => round2(w.invoices.filter((i) => i.projectId === projectId && i.status !== "draft").reduce((s, i) => s + i.total, 0));
  const ready = (projectId: string) => {
    const b = billable(w, projectId);
    return round2(b.time.reduce((s, t) => s + t.hours * clientRate(L.contract(t.contractId)!.shares), 0) + b.usage.reduce((s, u) => s + u.amount, 0));
  };
  return (
    <>
      <PageHead title={d.clients.title} body={d.clients.body} action={<Btn icon="add" onClick={() => { setF({ name: "", contact: "", email: "", project: "" }); setAdding(true); }}>{d.clients.add}</Btn>} />
      <div className="grid gap-4 md:grid-cols-2">
        {w.clients.map((c) => {
          const projects = w.projects.filter((p) => p.clientId === c.id);
          return (
            <Card key={c.id}>
              <h2 className="md-title-large">{c.name}</h2>
              <p className="md-body-medium mt-1 text-on-surface-variant">{c.contact} · {c.email}</p>
              <h3 className="md-title-small mt-4 text-on-surface-variant">{d.clients.projects}</h3>
              {projects.length === 0 && <p className="md-body-medium mt-2">{d.clients.noProjects}</p>}
              <ul className="mt-2 flex flex-col gap-2">
                {projects.map((p) => {
                  const contracts = w.contracts.filter((x) => x.projectId === p.id);
                  return (
                    <li key={p.id} className="rounded-lg bg-surface-container-low px-3 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="md-body-large">{p.name}</span>
                        <Chip tone="good">{d.clients.projectStatus[p.status]}</Chip>
                      </div>
                      <dl className="md-body-medium mt-2 grid grid-cols-2 gap-2 text-on-surface-variant">
                        <div><dt>{d.clients.unbilled}</dt><dd><Figure className="text-on-surface">{money(ready(p.id))}</Figure></dd></div>
                        <div><dt>{d.clients.billed}</dt><dd><Figure className="text-on-surface">{money(billed(p.id))}</Figure></dd></div>
                      </dl>
                      {contracts.length > 0 && (
                        <ul className="mt-3 flex flex-wrap gap-2" aria-label={d.clients.contractsOn}>
                          {contracts.map((x) => (
                            <li key={x.id}>
                              <a href={`#/contracts/${x.id}`} className="md-label-large inline-flex h-8 items-center gap-1.5 rounded-lg border border-outline-variant px-3 hover:bg-surface-container-high">
                                <md-icon aria-hidden="true" class="icon-14">{L.member(x.workerId)?.kind === "agent" ? "smart_toy" : "person"}</md-icon>
                                {L.member(x.workerId)?.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3"><Btn kind="text" icon="add" onClick={() => { setF({ ...f, project: "" }); setProjectFor(c.id); }}>{d.clients.addProject}</Btn></div>
            </Card>
          );
        })}
      </div>
      {adding && (
        <Dialog title={d.clients.addTitle} submit={d.clients.save} cancel={d.clients.cancel} onClose={() => setAdding(false)}
          onSubmit={async () => {
            if (!f.name.trim() || !f.contact.trim() || !f.email.trim()) return;
            if (await act({ type: "addClient", name: f.name, contact: f.contact, email: f.email })) setAdding(false);
          }}>
          <Field label={d.clients.name} value={f.name} onValue={(v) => setF({ ...f, name: v })} required autoFocus />
          <Field label={d.clients.contact} value={f.contact} onValue={(v) => setF({ ...f, contact: v })} required />
          <Field label={d.clients.email} type="email" value={f.email} onValue={(v) => setF({ ...f, email: v })} required />
        </Dialog>
      )}
      {projectFor && (
        <Dialog title={d.clients.projectTitle} submit={d.clients.save} cancel={d.clients.cancel} onClose={() => setProjectFor(null)}
          onSubmit={async () => {
            if (!f.project.trim()) return;
            if (await act({ type: "addProject", clientId: projectFor, name: f.project })) setProjectFor(null);
          }}>
          <Field label={d.clients.projectName} value={f.project} onValue={(v) => setF({ ...f, project: v })} required autoFocus />
        </Dialog>
      )}
    </>
  );
}

// ── People and agents ───────────────────────────────────────────────────────

const ROLE_CHOICES: Role[] = ["contractor", "recruiter", "marketer", "pm", "am", "admin"];

export function People() {
  const { w, d, act } = useWork();
  const [show, setShow] = useState<"all" | Kind>("all");
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ kind: "person" as Kind, name: "", email: "", role: "contractor" as Role, title: "", model: w.prices[1]?.model ?? "" });
  const list = w.members.filter((m) => show === "all" || m.kind === show);
  return (
    <>
      <PageHead title={d.people.title} body={d.people.body} action={<Btn icon="person_add" onClick={() => setAdding(true)}>{d.people.add}</Btn>} />
      <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label={d.people.kindLabel}>
        <FilterChip label={d.people.all} selected={show === "all"} onPick={() => setShow("all")} />
        <FilterChip label={d.people.onlyPeople} selected={show === "person"} onPick={() => setShow("person")} />
        <FilterChip label={d.people.onlyAgents} selected={show === "agent"} onPick={() => setShow("agent")} />
      </div>
      <ul className="-mx-4 flex flex-col">
        {list.map((m) => {
          const n = w.contracts.filter((c) => c.workerId === m.id || Object.values(c.holders).includes(m.id)).length;
          return (
            <Row key={m.id}>
              <Who m={m} sub={`${m.title}${m.id === w.me.id ? ` (${d.people.you})` : ""}${m.model ? ` · ${m.model}` : ""}`} />
              <span className="md-body-medium flex flex-wrap items-center gap-2 text-on-surface-variant">
                {m.roles.map((r) => <Chip key={r} tone="neutral">{d.roles[r]}</Chip>)}
                <span>{n ? fmt(d.people.contracts, { count: n }) : d.people.noContracts}</span>
              </span>
            </Row>
          );
        })}
      </ul>
      {adding && (
        <Dialog title={d.people.addTitle} submit={d.people.save} cancel={d.people.cancel} onClose={() => setAdding(false)}
          onSubmit={async () => {
            if (!f.name.trim() || !f.title.trim() || (f.kind === "person" && !f.email.trim())) return;
            const email = f.kind === "agent" ? `${f.name.trim().toLowerCase().replace(/\W+/g, "-")}@agents.harborlane.test` : f.email;
            if (await act({ type: "addMember", kind: f.kind, name: f.name, email, roles: [f.role], title: f.title, model: f.kind === "agent" ? f.model : undefined })) setAdding(false);
          }}>
          <Select label={d.people.kindLabel} value={f.kind} onValue={(v) => setF({ ...f, kind: v as Kind })}
            options={[{ value: "person", label: d.kind.person }, { value: "agent", label: d.kind.agent }]} />
          <Field label={d.people.name} value={f.name} onValue={(v) => setF({ ...f, name: v })} required autoFocus />
          {f.kind === "person"
            ? <Field label={d.people.email} type="email" value={f.email} onValue={(v) => setF({ ...f, email: v })} required />
            : <Select label={d.people.model} value={f.model} onValue={(v) => setF({ ...f, model: v })} options={w.prices.map((p) => ({ value: p.model, label: p.model }))} />}
          <Select label={d.people.role} value={f.role} onValue={(v) => setF({ ...f, role: v as Role })} options={ROLE_CHOICES.map((r) => ({ value: r, label: d.roles[r] }))} />
          <Field label={d.people.title2} value={f.title} onValue={(v) => setF({ ...f, title: v })} required />
        </Dialog>
      )}
    </>
  );
}

// ── Contracts ───────────────────────────────────────────────────────────────

export function Contracts() {
  const { route } = useWork();
  if (route.id === "new") return <><ContractList /><NewContract /></>;
  if (route.id) return <ContractDetail id={route.id} />;
  return <ContractList />;
}

function ContractList() {
  const { w, d, money, go } = useWork();
  const L = useLookups();
  return (
    <>
      <PageHead title={d.contracts.title} body={d.contracts.body} action={<Btn icon="add" onClick={() => go("contracts/new")}>{d.contracts.add}</Btn>} />
      {w.contracts.length === 0 ? <Empty>{d.contracts.none}</Empty> : (
        <ul className="-mx-4 flex flex-col">
          {w.contracts.map((c) => (
            <Row key={c.id} href={`#/contracts/${c.id}`}>
              <Who m={L.member(c.workerId)} sub={`${c.title} · ${L.client(c.projectId)?.name}`} />
              <span className="flex w-full items-center gap-4 sm:w-auto">
                <span className="flex min-w-0 flex-1 flex-col items-start gap-1.5 sm:w-56 sm:flex-none">
                  {c.billing === "hours" ? <SplitBar shares={c.shares} /> : <span className="h-2.5" />}
                  <span className="md-body-medium text-on-surface-variant">
                    {c.billing === "hours" ? fmt(d.contracts.perBilledHour, { amount: money(clientRate(c.shares)) }) : fmt(d.contracts.tokensRate, { percent: w.agency.markupPercent })}
                  </span>
                </span>
                <Chip tone={contractTone(c.status)}>{d.contracts.status[c.status]}</Chip>
              </span>
            </Row>
          ))}
        </ul>
      )}
    </>
  );
}

function ContractDetail({ id }: { id: string }) {
  const { w, d, act, money, num } = useWork();
  const L = useLookups();
  const c = L.contract(id);
  if (!c) return <Back href="#/contracts" label={d.contracts.back} />;
  const worker = L.member(c.workerId)!;
  const project = L.project(c.projectId)!;
  const hours = round2(w.time.filter((t) => t.contractId === c.id && t.status !== "rejected").reduce((s, t) => s + t.hours, 0));
  const usage = w.usage.filter((u) => u.contractId === c.id);
  const price = w.prices.find((p) => p.model === worker.model);
  const holderOf = (k: ShareKey) => (k === "contractor" ? worker : k === "agency" || k === "system" ? undefined : L.member(c.holders[k as keyof Holders]));
  return (
    <>
      <Back href="#/contracts" label={d.contracts.back} />
      <PageHead title={c.title} body={`${project.name} · ${L.client(c.projectId)?.name}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone={contractTone(c.status)}>{d.contracts.status[c.status]}</Chip>
            {c.status === "draft" && <Btn icon="play_arrow" onClick={() => act({ type: "activateContract", id: c.id }, d.contracts.activated)}>{d.contracts.activate}</Btn>}
            {c.status === "active" && <Btn kind="text" onClick={() => act({ type: "endContract", id: c.id })}>{d.contracts.end}</Btn>}
          </div>
        } />
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr] [&>*]:min-w-0">
        {c.billing === "hours" ? (
          <Card>
            <h2 className="md-title-large">{d.contracts.split}</h2>
            <div className="mt-4"><SplitBar shares={c.shares} /></div>
            <ul className="mt-4 flex flex-col divide-y divide-outline-variant">
              {SHARE_KEYS.filter((k) => c.shares[k] > 0).map((k) => {
                const h = holderOf(k);
                return (
                  <li key={k} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: SHARE_COLOR[k] }} aria-hidden />
                      <span className="min-w-0">
                        <span className="md-body-large block">{d.contracts.streams[k]}</span>
                        <span className="md-body-medium flex flex-wrap items-center gap-2 text-on-surface-variant">
                          {h ? <>{h.name}<KindBadge kind={h.kind} label={d.kind[h.kind]} /></> : k === "system" ? "AgencyPro" : d.contracts.toAgency}
                        </span>
                        {h?.kind === "agent" && k !== "contractor" && <span className="md-body-small block text-on-surface-variant">{fmt(d.contracts.agentShare, { name: h.name })}</span>}
                      </span>
                    </span>
                    <span className="md-body-large">{rich(d.contracts.shareOf, { amount: <Figure>{money(c.shares[k])}</Figure> })}</span>
                  </li>
                );
              })}
              <li className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span className="md-title-medium">{d.contracts.total}</span>
                <Figure className="md-title-medium">{money(clientRate(c.shares))}</Figure>
              </li>
            </ul>
            <p className="md-body-medium mt-2 text-on-surface-variant">{d.contracts.splitNote}</p>
          </Card>
        ) : (
          <Card>
            <h2 className="md-title-large">{d.contracts.tokensTitle}</h2>
            <p className="md-body-large mt-3">{fmt(d.contracts.tokensBody, { name: worker.name, model: worker.model ?? "", percent: w.agency.markupPercent })}</p>
            {price && (
              <>
                <dl className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-surface-container-low p-3"><dt className="md-label-large text-on-surface-variant">{d.contracts.priceIn}</dt><dd className="md-body-large mt-1"><Figure>{fmt(d.contracts.perMTok, { amount: money(price.inputPerMTok) })}</Figure></dd></div>
                  <div className="rounded-lg bg-surface-container-low p-3"><dt className="md-label-large text-on-surface-variant">{d.contracts.priceOut}</dt><dd className="md-body-large mt-1"><Figure>{fmt(d.contracts.perMTok, { amount: money(price.outputPerMTok) })}</Figure></dd></div>
                </dl>
                <p className="md-body-medium mt-3 text-on-surface-variant">
                  {fmt(d.contracts.example, { cost: money(usageCost(price, 1_000_000, 200_000)), total: money(withMarkup(usageCost(price, 1_000_000, 200_000), w.agency.markupPercent)) })}
                </p>
              </>
            )}
          </Card>
        )}
        <Card>
          <h2 className="md-title-large">{d.contracts.worker}</h2>
          <div className="mt-3"><Who m={worker} sub={worker.title} /></div>
          <h2 className="md-title-large mt-6">{d.contracts.logged}</h2>
          <p className="md-headline-small mt-2"><Figure>
            {c.billing === "hours" ? fmt(d.contracts.hoursLogged, { hours: num(hours) }) : fmt(d.contracts.usageLogged, { tokens: num(usage.reduce((s, u) => s + u.inputTokens + u.outputTokens, 0)) })}
          </Figure></p>
          <p className="md-body-medium mt-4"><a className="text-primary underline" href={`#/time${c.billing === "tokens" ? "/usage" : ""}`}>{d.nav.time}</a></p>
        </Card>
      </div>
    </>
  );
}

const HELD: ("recruiter" | "marketer" | "pm" | "am")[] = ["recruiter", "marketer", "pm", "am"];

function NewContract() {
  const { w, d, act, go, money } = useWork();
  const L = useLookups();
  const workers = w.members.filter((m) => m.roles.includes("contractor"));
  const [f, setF] = useState({ projectId: w.projects[0]?.id ?? "", workerId: workers[0]?.id ?? "", title: "" });
  const [shares, setShares] = useState<Shares>({ ...emptyShares(), contractor: 75, agency: 20, system: 5 });
  const [holders, setHolders] = useState<Holders>({ am: w.members.find((m) => m.roles.includes("am"))?.id });
  const worker = L.member(f.workerId);
  const label = (m: Member) => `${m.name}${m.kind === "agent" ? ` (${d.kind.agent})` : ""}`;
  return (
    <Dialog wide title={d.contracts.newTitle} submit={d.contracts.create} cancel={d.contracts.cancel} onClose={() => go("contracts")}
      onSubmit={async () => {
        if (!f.projectId || !f.workerId || !f.title.trim()) return;
        const clean = Object.fromEntries(HELD.map((k) => [k, shares[k] > 0 ? holders[k] : undefined]).filter(([, v]) => v)) as Holders;
        const s = worker?.kind === "agent" ? emptyShares() : Object.fromEntries(SHARE_KEYS.map((k) => [k, HELD.includes(k as never) && !holders[k as keyof Holders] ? 0 : Math.max(0, shares[k] || 0)])) as Shares;
        const next = await act({ type: "addContract", projectId: f.projectId, workerId: f.workerId, title: f.title, shares: s, holders: clean }, d.contracts.created);
        const c = next?.contracts.at(-1);
        if (c) go(`contracts/${c.id}`);
      }}>
      <Select label={d.contracts.project} value={f.projectId} onValue={(v) => setF({ ...f, projectId: v })}
        options={w.projects.map((p) => ({ value: p.id, label: `${p.name} · ${byId(w.clients, p.clientId)?.name}` }))} />
      <Select label={d.contracts.worker} value={f.workerId} onValue={(v) => setF({ ...f, workerId: v })} options={workers.map((m) => ({ value: m.id, label: label(m) }))} />
      <Field label={d.contracts.titleLabel} value={f.title} onValue={(v) => setF({ ...f, title: v })} required />
      {worker?.kind === "agent" ? (
        <p className="md-body-medium rounded-lg bg-surface-container-low p-3">
          {fmt(d.contracts.agentPicked, { name: worker.name })} {fmt(d.contracts.tokensRate, { percent: w.agency.markupPercent })}.
        </p>
      ) : (
        <fieldset className="flex flex-col gap-3">
          <legend className="md-title-medium">{d.contracts.sharesTitle}</legend>
          <p className="md-body-medium -mt-1 text-on-surface-variant">{d.contracts.sharesHint}</p>
          {SHARE_KEYS.map((k) => {
            const held = HELD.includes(k as never) ? (k as keyof Holders) : null;
            const options = held ? w.members.filter((m) => m.roles.includes(held)) : [];
            return (
              <div key={k} className={`grid gap-2 ${held ? "sm:grid-cols-2" : ""}`}>
                <Field label={d.contracts.streams[k]} type="number" min={0} step="0.5" prefix="$" value={String(shares[k])}
                  onValue={(v) => setShares({ ...shares, [k]: Number(v) || 0 })} />
                {held && (
                  <Select label={d.contracts.holder} value={holders[held] ?? ""} onValue={(v) => setHolders({ ...holders, [held]: v || undefined })}
                    options={[{ value: "", label: d.contracts.nobody }, ...options.map((m) => ({ value: m.id, label: label(m) }))]} />
                )}
              </div>
            );
          })}
          <p className="md-title-medium flex justify-between gap-2 border-t border-outline-variant pt-3">
            <span>{d.contracts.total}</span>
            <Figure>{money(clientRate(Object.fromEntries(SHARE_KEYS.map((k) => [k, HELD.includes(k as never) && !holders[k as keyof Holders] ? 0 : shares[k]])) as Shares))}</Figure>
          </p>
          <p className="md-body-small text-on-surface-variant">{d.contracts.splitNote}</p>
        </fieldset>
      )}
    </Dialog>
  );
}

// ── Time and usage ──────────────────────────────────────────────────────────

export function Time() {
  const { w, d, act, money, day, num, compact, route, go, toast } = useWork();
  const L = useLookups();
  const tab = route.id === "usage" ? 1 : 0;
  const [waitingOnly, setWaitingOnly] = useState(true);
  const [picked, setPicked] = useState<string[]>([]);
  const [dialog, setDialog] = useState<"time" | "usage" | null>(null);
  const hourContracts = w.contracts.filter((c) => c.status === "active" && c.billing === "hours");
  const tokenContracts = w.contracts.filter((c) => c.status === "active" && c.billing === "tokens");
  const [f, setF] = useState({ contractId: "", date: TODAY(), hours: "", note: "", tin: "", tout: "" });
  const entries = w.time.filter((t) => !waitingOnly || t.status === "submitted").sort((a, b) => b.date.localeCompare(a.date));
  const waiting = w.time.filter((t) => t.status === "submitted").map((t) => t.id);
  const sel = picked.filter((id) => waiting.includes(id));
  const tone = { submitted: "waiting", approved: "info", rejected: "bad", invoiced: "good" } as const;
  const contractLabel = (c: Contract) => `${L.member(c.workerId)?.name} · ${c.title}`;
  const open = (kind: "time" | "usage") => {
    setF({ contractId: (kind === "time" ? hourContracts : tokenContracts)[0]?.id ?? "", date: TODAY(), hours: "", note: "", tin: "", tout: "" });
    setDialog(kind);
  };
  return (
    <>
      <PageHead title={d.time.title} body={d.time.body}
        action={<div className="flex flex-wrap gap-2">
          <Btn kind="tonal" icon="more_time" onClick={() => open("time")}>{d.time.logTime}</Btn>
          <Btn kind="outlined" icon="smart_toy" onClick={() => open("usage")}>{d.time.logUsage}</Btn>
        </div>} />
      <Tabs label={d.time.title} tabs={[d.time.hoursTab, d.time.usageTab]} active={tab} onPick={(i) => go(i ? "time/usage" : "time")} />
      {tab === 0 ? (
        <div className="mt-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2" role="group" aria-label={d.time.filter}>
              <FilterChip label={d.time.waitingOnly} selected={waitingOnly} onPick={() => setWaitingOnly(true)} />
              <FilterChip label={d.time.everything} selected={!waitingOnly} onPick={() => setWaitingOnly(false)} />
            </div>
            {waiting.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <label className="md-label-large flex items-center gap-1 pr-2 text-on-surface-variant">
                  <Check checked={sel.length === waiting.length} label={d.time.selectAll} onChange={(v) => setPicked(v ? waiting : [])} />{d.time.selectAll}
                </label>
                <Btn kind="text" disabled={!sel.length} onClick={async () => { const n = sel.length; if (await act({ type: "rejectTime", ids: sel }, fmt(d.time.rejectedToast, { count: n }))) setPicked([]); }}>
                  {fmt(d.time.rejectSelected, { count: sel.length })}
                </Btn>
                <Btn icon="done_all" disabled={!sel.length} onClick={async () => { const n = sel.length; if (await act({ type: "approveTime", ids: sel }, fmt(d.time.approvedToast, { count: n }))) setPicked([]); }}>
                  {fmt(d.time.approveSelected, { count: sel.length })}
                </Btn>
              </div>
            )}
          </div>
          {entries.length === 0 ? <Empty>{waitingOnly ? d.time.noneWaiting : d.time.none}</Empty> : (
            <ul className="-mx-4 flex flex-col">
              {entries.map((t) => {
                const c = L.contract(t.contractId)!;
                return (
                  <Row key={t.id}>
                    <span className="flex min-w-0 items-center gap-2">
                      {t.status === "submitted"
                        ? <Check checked={sel.includes(t.id)} label={`${L.member(c.workerId)?.name} ${day(t.date)}`} onChange={(v) => setPicked(v ? [...sel, t.id] : sel.filter((x) => x !== t.id))} />
                        : <span className="w-12 shrink-0" aria-hidden />}
                      <Who m={L.member(c.workerId)} sub={`${day(t.date)} · ${t.note} · ${L.client(c.projectId)?.name}`} />
                    </span>
                    <span className="flex items-center gap-4 pl-14 sm:pl-0">
                      <Figure className="md-body-large">{fmt(d.contracts.hoursLogged, { hours: num(t.hours) })}</Figure>
                      <Figure className="md-body-medium text-on-surface-variant">{money(round2(t.hours * clientRate(c.shares)))}</Figure>
                      <Chip tone={tone[t.status]}>{d.time.statuses[t.status]}</Chip>
                    </span>
                  </Row>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <div className="mt-4">
          {w.usage.length === 0 ? <Empty>{d.time.noneUsage}</Empty> : (
            <ul className="-mx-4 flex flex-col">
              {[...w.usage].sort((a, b) => b.date.localeCompare(a.date)).map((u) => {
                const c = L.contract(u.contractId)!;
                return (
                  <Row key={u.id}>
                    <Who m={L.member(c.workerId)} sub={`${day(u.date)} · ${u.note} · ${L.client(c.projectId)?.name}`} />
                    <span className="md-body-medium flex flex-wrap items-center gap-x-4 gap-y-1 text-on-surface-variant">
                      <span>{u.model}</span>
                      <Figure>{compact(u.inputTokens)} / {compact(u.outputTokens)}</Figure>
                      <Figure>{money(u.cost)} + {num(u.markupPercent)}%</Figure>
                      <Figure className="md-body-large text-on-surface">{money(u.amount)}</Figure>
                      <Chip tone={u.invoiceId ? "good" : "neutral"}>{u.invoiceId ? d.time.billedYet : d.time.notYet}</Chip>
                    </span>
                  </Row>
                );
              })}
            </ul>
          )}
        </div>
      )}
      {dialog === "time" && (
        <Dialog title={d.time.logTitle} submit={d.time.save} cancel={d.time.cancel} onClose={() => setDialog(null)}
          onSubmit={async () => {
            if (!f.contractId || !f.hours || !f.note.trim()) return;
            if (await act({ type: "logTime", contractId: f.contractId, date: f.date, hours: Number(f.hours), note: f.note }, d.time.loggedToast)) { setDialog(null); setWaitingOnly(true); go("time"); }
          }}>
          <Select label={d.time.contract} value={f.contractId} onValue={(v) => setF({ ...f, contractId: v })} options={hourContracts.map((c) => ({ value: c.id, label: contractLabel(c) }))} />
          <Field label={d.time.date} type="date" value={f.date} onValue={(v) => setF({ ...f, date: v })} required />
          <Field label={d.time.hours} type="number" min={0.25} max={24} step="0.25" value={f.hours} onValue={(v) => setF({ ...f, hours: v })} required />
          <Field label={d.time.note} value={f.note} onValue={(v) => setF({ ...f, note: v })} required />
        </Dialog>
      )}
      {dialog === "usage" && (
        <Dialog title={d.time.usageTitle} submit={d.time.save} cancel={d.time.cancel} onClose={() => setDialog(null)}
          onSubmit={async () => {
            if (!f.contractId || !f.note.trim()) return;
            const ok = await act({ type: "logUsage", contractId: f.contractId, date: f.date, inputTokens: Math.round(Number(f.tin) || 0), outputTokens: Math.round(Number(f.tout) || 0), note: f.note });
            if (ok) { setDialog(null); toast(fmt(d.time.usageToast, { amount: money(ok.usage.at(-1)!.amount) })); go("time/usage"); }
          }}>
          <Select label={d.time.contract} value={f.contractId} onValue={(v) => setF({ ...f, contractId: v })} options={tokenContracts.map((c) => ({ value: c.id, label: contractLabel(c) }))} />
          <Field label={d.time.date} type="date" value={f.date} onValue={(v) => setF({ ...f, date: v })} required />
          <Field label={d.time.tokensIn} type="number" min={0} step="1" value={f.tin} onValue={(v) => setF({ ...f, tin: v })} required />
          <Field label={d.time.tokensOut} type="number" min={0} step="1" value={f.tout} onValue={(v) => setF({ ...f, tout: v })} required />
          <Field label={d.time.note} value={f.note} onValue={(v) => setF({ ...f, note: v })} required />
        </Dialog>
      )}
    </>
  );
}

// ── Invoices ────────────────────────────────────────────────────────────────

export function Invoices() {
  const { route } = useWork();
  if (route.id === "new") return <><InvoiceList /><NewInvoice projectId={route.sub} /></>;
  if (route.id) return <InvoiceDetail id={route.id} />;
  return <InvoiceList />;
}

function InvoiceList() {
  const { w, d, money, day, go } = useWork();
  const L = useLookups();
  return (
    <>
      <PageHead title={d.invoices.title} body={d.invoices.body} action={<Btn icon="add" onClick={() => go("invoices/new")}>{d.invoices.new}</Btn>} />
      {w.invoices.length === 0 ? <Empty>{d.invoices.none}</Empty> : (
        <ul className="-mx-4 flex flex-col">
          {[...w.invoices].reverse().map((i) => (
            <Row key={i.id} href={`#/invoices/${i.id}`}>
              <span className="min-w-0">
                <span className="md-body-large block">{i.number} · {byId(w.clients, i.clientId)?.name}</span>
                <span className="md-body-medium block text-on-surface-variant">{L.project(i.projectId)?.name} · {day(i.sentAt ?? i.createdAt)}</span>
              </span>
              <span className="flex items-center gap-4">
                <Figure className="md-body-large">{money(i.total)}</Figure>
                <Chip tone={invoiceTone(i.status)}>{d.invoices.statuses[i.status]}</Chip>
              </span>
            </Row>
          ))}
        </ul>
      )}
    </>
  );
}

function NewInvoice({ projectId }: { projectId?: string }) {
  const { w, d, act, go } = useWork();
  const withWork = w.projects.filter((p) => { const b = billable(w, p.id); return b.time.length + b.usage.length > 0; });
  const [pid, setPid] = useState(projectId ?? withWork[0]?.id ?? w.projects[0]?.id ?? "");
  const b = billable(w, pid);
  const hours = round2(b.time.reduce((s, t) => s + t.hours, 0));
  return (
    <Dialog title={d.invoices.newTitle} submit={d.invoices.create} cancel={d.invoices.cancel} onClose={() => go("invoices")}
      onSubmit={async () => {
        if (!pid) return;
        const next = await act({ type: "createInvoice", projectId: pid });
        const inv = next?.invoices.at(-1);
        if (inv) { go(`invoices/${inv.id}`); }
      }}>
      <Select label={d.invoices.project} value={pid} onValue={setPid}
        options={w.projects.map((p) => ({ value: p.id, label: `${p.name} · ${byId(w.clients, p.clientId)?.name}` }))} />
      <p className="md-body-large rounded-lg bg-surface-container-low p-3">
        {b.time.length + b.usage.length ? fmt(d.invoices.readyLine, { hours, usage: new Set(b.usage.map((u) => u.contractId + u.model)).size }) : d.invoices.nothing}
      </p>
    </Dialog>
  );
}

function InvoiceDetail({ id }: { id: string }) {
  const { w, d, act, money, day, num, compact, source } = useWork();
  const L = useLookups();
  const inv = byId(w.invoices, id);
  if (!inv) return <Back href="#/invoices" label={d.invoices.back} />;
  const client = byId(w.clients, inv.clientId)!;
  const payees = invoicePayees(w, inv);
  const byPayee = [...payees.reduce((m, p) => m.set(p.payeeId, (m.get(p.payeeId) ?? 0) + p.amount), new Map<string, number>())];
  const next = {
    draft: { label: d.invoices.send, icon: "send", a: { type: "sendInvoice", id: inv.id } as const, ok: fmt(d.invoices.sentToast, { client: client.name }) },
    sent: { label: d.invoices.pay, icon: "credit_card", a: { type: "payInvoice", id: inv.id } as const, ok: d.invoices.paidToast },
    paid: { label: d.invoices.clear, icon: "verified", a: { type: "clearInvoice", id: inv.id } as const, ok: d.invoices.clearedToast },
    cleared: null,
  }[inv.status];
  return (
    <>
      <Back href="#/invoices" label={d.invoices.back} />
      <PageHead title={`${d.invoices.number} ${inv.number}`} body={`${L.project(inv.projectId)?.name} · ${day(inv.sentAt ?? inv.createdAt)}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone={invoiceTone(inv.status)}>{d.invoices.statuses[inv.status]}</Chip>
            {inv.status === "paid" && inv.clearsAt && <span className="md-body-medium text-on-surface-variant">{fmt(d.invoices.clearsOn, { date: day(inv.clearsAt) })}</span>}
            {next && <Btn icon={next.icon} onClick={() => act(next.a, next.ok)}>{next.label}</Btn>}
          </div>
        } />
      {next && inv.status !== "draft" && source.mode === "demo" && <p className="md-body-medium -mt-3 mb-5 text-on-surface-variant">{d.invoices.testNote}</p>}
      <div className="grid gap-6 xl:grid-cols-[2fr_1fr] [&>*]:min-w-0">
        <Card>
          <p className="md-label-large text-on-surface-variant">{d.invoices.billTo}</p>
          <p className="md-title-medium mt-1">{client.name}</p>
          <p className="md-body-medium text-on-surface-variant">{client.contact} · {client.email}</p>
          <h2 className="md-title-large mt-6">{d.invoices.lines}</h2>
          <ul className="mt-2 flex flex-col divide-y divide-outline-variant border-y border-outline-variant">
            {inv.lines.map((l, i) => {
              const m = L.member(l.workerId);
              const c = L.contract(l.contractId);
              return (
                <li key={i} className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 py-3">
                  <span className="min-w-0 flex-1 basis-56">
                    <span className="md-body-large flex flex-wrap items-center gap-2">{m?.name}{m && <KindBadge kind={m.kind} label={d.kind[m.kind]} />}</span>
                    <span className="md-body-medium block text-on-surface-variant">{c?.title}{l.kind === "usage" ? ` · ${l.model}` : ""}</span>
                  </span>
                  <span className="md-body-medium min-w-0 flex-1 basis-56 text-on-surface-variant">
                    <span className="block text-on-surface"><Figure>{l.kind === "time" ? fmt(d.invoices.hoursQty, { hours: num(l.hours) }) : fmt(d.invoices.tokensQty, { in: compact(l.inputTokens), out: compact(l.outputTokens) })}</Figure></span>
                    <span className="block">{l.kind === "time" ? fmt(d.invoices.hourRate, { amount: money(l.rate) }) : fmt(d.invoices.tokenRate, { in: money(l.inputPerMTok), out: money(l.outputPerMTok) })}</span>
                    {l.kind === "usage" && <span className="block">{fmt(d.invoices.usageDetail, { cost: money(l.cost), percent: num(l.markupPercent) })}</span>}
                  </span>
                  <Figure className="md-body-large ml-auto">{money(l.amount)}</Figure>
                </li>
              );
            })}
          </ul>
          <p className="flex items-baseline justify-between gap-4 pt-4">
            <span className="md-title-medium">{d.invoices.totalDue}</span>
            <Figure className="md-title-large">{money(inv.total)}</Figure>
          </p>
        </Card>
        <Card>
          <h2 className="md-title-large">{d.invoices.whereItGoes}</h2>
          <ul className="mt-3 flex flex-col divide-y divide-outline-variant">
            {byPayee.map(([pid, amount]) => {
              const m = L.member(pid);
              return (
                <li key={pid} className="flex items-center justify-between gap-3 py-3">
                  <span className="md-body-large min-w-0">{m ? m.name : pid === "system" ? d.payouts.streams.system : fmt(d.payouts.agency, { name: w.agency.name })}</span>
                  <Figure className="md-body-large">{money(round2(amount))}</Figure>
                </li>
              );
            })}
          </ul>
          <p className="md-body-small mt-2 text-on-surface-variant">{d.payouts.agencyNote}</p>
        </Card>
      </div>
    </>
  );
}

// ── Payouts ─────────────────────────────────────────────────────────────────

export function Payouts() {
  const { w, d, money } = useWork();
  const L = useLookups();
  const all = payouts(w);
  const sum = (xs: { amount: number }[]) => round2(xs.reduce((s, x) => s + x.amount, 0));
  const payees = [...new Set(["agency", ...all.map((p) => p.payeeId)])].filter((id) => all.some((p) => p.payeeId === id));
  const tone = { invoiced: "info", clearing: "waiting", paid: "good" } as const;
  return (
    <>
      <PageHead title={d.payouts.title} body={d.payouts.body} />
      <div className="grid gap-3 sm:grid-cols-3">
        {(["invoiced", "clearing", "paid"] as const).map((s) => (
          <div key={s} className="rounded-xl bg-surface-container px-4 py-4">
            <p className="md-label-large text-on-surface-variant">{d.payouts[s]}</p>
            <p className="mt-2 text-title-medium sm:text-headline-small"><Figure>{money(sum(all.filter((p) => p.status === s)))}</Figure></p>
          </div>
        ))}
      </div>
      {all.length === 0 ? <div className="mt-6"><Empty>{d.payouts.none}</Empty></div> : (
        <Card className="mt-6">
          <h2 className="md-title-large">{d.payouts.byPayee}</h2>
          <ul className="mt-2 flex flex-col divide-y divide-outline-variant">
            {payees.map((id) => {
              const mine = all.filter((p) => p.payeeId === id);
              const m = L.member(id);
              const streams = [...new Set(mine.map((p) => p.stream))];
              return (
                <li key={id} className="grid items-center gap-x-6 gap-y-2 py-4 md:grid-cols-[minmax(0,1fr)_auto]">
                  <span className="min-w-0">
                    {m ? <Who m={m} sub={streams.map((s) => d.payouts.streams[s]).join(" · ")} /> : (
                      <span className="flex items-center gap-3">
                        <span aria-hidden className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"><md-icon>account_balance</md-icon></span>
                        <span className="min-w-0"><span className="md-body-large block">{fmt(d.payouts.agency, { name: w.agency.name })}</span><span className="md-body-medium block text-on-surface-variant">{d.payouts.agencyNote}</span></span>
                      </span>
                    )}
                  </span>
                  <dl className="md-body-medium grid grid-cols-3 gap-x-5 gap-y-0.5 text-right text-on-surface-variant max-md:pl-13">
                    {(["invoiced", "clearing", "paid"] as const).map((s) => (
                      <div key={s}><dt>{d.payouts[s]}</dt><dd className="text-on-surface"><Figure>{money(sum(mine.filter((p) => p.status === s)))}</Figure></dd></div>
                    ))}
                  </dl>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
      {all.length > 0 && (
        <Card className="mt-6">
          <h2 className="md-title-large">{d.payouts.detail}</h2>
          <ul className="mt-2 flex flex-col divide-y divide-outline-variant">
            {[...all].reverse().map((p, i) => {
              const inv = byId(w.invoices, p.invoiceId)!;
              return (
                <li key={i} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-3">
                  <span className="min-w-0">
                    <span className="md-body-large block">{L.member(p.payeeId)?.name ?? fmt(d.payouts.agency, { name: w.agency.name })}</span>
                    <span className="md-body-medium block text-on-surface-variant">{d.payouts.streams[p.stream]} · <a className="text-primary" href={`#/invoices/${inv.id}`}>{inv.number}</a></span>
                  </span>
                  <span className="flex items-center gap-3"><Figure className="md-body-large">{money(p.amount)}</Figure><Chip tone={tone[p.status]}>{d.payouts.statuses[p.status]}</Chip></span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </>
  );
}

// ── Settings ────────────────────────────────────────────────────────────────

export function Settings() {
  const { w, d, act, source, replace, toast, day, money, go } = useWork();
  const [markup, setMarkup] = useState(String(w.agency.markupPercent));
  const [scenario, setScenario] = useState<Scenario>(source instanceof DemoSource ? source.scenario : "hybrid");
  return (
    <>
      <PageHead title={d.settings.title} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="md-title-large">{d.settings.agency}: {w.agency.name}</h2>
          <form className="mt-4 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); void act({ type: "setMarkup", percent: Number(markup) }, fmt(d.settings.saved, { percent: Number(markup) })); }}>
            <Field label={d.settings.markup} type="number" min={0} max={100} step="0.5" suffix="%" value={markup} onValue={setMarkup} supporting={d.settings.markupHint} />
            <div><Btn type="submit">{d.settings.save}</Btn></div>
          </form>
        </Card>
        <Card>
          <h2 className="md-title-large">{d.settings.prices}</h2>
          <p className="md-body-medium mt-1 text-on-surface-variant">{d.settings.pricesHint}</p>
          <ul className="mt-3 flex flex-col divide-y divide-outline-variant">
            {w.prices.map((p) => (
              <li key={p.model} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <span><span className="md-body-large block">{p.model}</span><span className="md-body-small text-on-surface-variant">{fmt(d.settings.since, { date: day(p.since) })}</span></span>
                <Figure className="md-body-medium">{money(p.inputPerMTok)} / {money(p.outputPerMTok)}</Figure>
              </li>
            ))}
          </ul>
        </Card>
        {source instanceof DemoSource && (
          <Card>
            <h2 className="md-title-large">{d.settings.demo}</h2>
            <p className="md-body-medium mt-1 text-on-surface-variant">{d.settings.demoHint}</p>
            <div className="mt-4 flex flex-col gap-3">
              <Select label={d.settings.demo} value={scenario} onValue={(v) => setScenario(v as Scenario)}
                options={(["hybrid", "people", "agents"] as const).map((s) => ({ value: s, label: d.settings[s] }))} />
              <div><Btn kind="tonal" icon="restart_alt" onClick={() => { replace(source.reset(scenario)); setMarkup("20"); toast(d.settings.resetToast); go("dashboard"); }}>{d.settings.reset}</Btn></div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
