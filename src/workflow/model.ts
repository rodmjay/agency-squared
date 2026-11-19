// The agency workflow, as the web app sees it: one "world" per agency, loaded from a source (the live API or the
// in-browser demo) and changed only through actions. Amounts are US dollars.
//
// People bill hours. Every stream on a person's contract is a share of each hour the contractor bills; the client
// pays the sum. Agents bill tokens: the line is the model's token cost plus the agency's markup, and all of it goes
// to the agency (provider terms 3.2), never split among the payee shares.

export type Kind = "person" | "agent";
export type Role = "owner" | "admin" | "contractor" | "recruiter" | "marketer" | "pm" | "am";

/** A seat in the agency, filled by a person or an AI agent. */
export type Member = { id: string; name: string; email: string; kind: Kind; roles: Role[]; title: string; model?: string };

export type Client = { id: string; name: string; contact: string; email: string };
export type Project = { id: string; clientId: string; name: string; status: "active" | "done" };

/** The streams on a person's contract, each a share of every billed contractor hour. */
export type ShareKey = "contractor" | "recruiter" | "marketer" | "pm" | "am" | "agency" | "system";
export const SHARE_KEYS: ShareKey[] = ["contractor", "recruiter", "marketer", "pm", "am", "agency", "system"];
export type Shares = Record<ShareKey, number>;
/** Who holds each named share (an agent's share stays with the agency). */
export type Holders = Partial<Record<"recruiter" | "marketer" | "pm" | "am", string>>;

export type ContractStatus = "draft" | "active" | "ended";
export type Contract = {
  id: string; projectId: string; workerId: string; status: ContractStatus; title: string; startedAt?: string;
  billing: "hours" | "tokens";
  /** Hours: each share of a billed hour, in dollars. */
  shares: Shares; holders: Holders;
};

export type TimeStatus = "submitted" | "approved" | "rejected" | "invoiced";
export type TimeEntry = { id: string; contractId: string; date: string; hours: number; note: string; status: TimeStatus; invoiceId?: string };

export type UsageEntry = {
  id: string; contractId: string; date: string; model: string; inputTokens: number; outputTokens: number;
  cost: number; markupPercent: number; amount: number; note: string; invoiceId?: string;
};

/** Dated per-model token prices, dollars per million tokens. */
export type Price = { model: string; inputPerMTok: number; outputPerMTok: number; since: string };

export type InvoiceStatus = "draft" | "sent" | "paid" | "cleared";
export type TimeLine = { kind: "time"; contractId: string; workerId: string; hours: number; rate: number; amount: number; shares: Shares };
export type UsageLine = {
  kind: "usage"; contractId: string; workerId: string; model: string; inputTokens: number; outputTokens: number;
  inputPerMTok: number; outputPerMTok: number; cost: number; markupPercent: number; amount: number;
};
export type InvoiceLine = TimeLine | UsageLine;
export type Invoice = {
  id: string; number: string; clientId: string; projectId: string; status: InvoiceStatus; createdAt: string;
  sentAt?: string; paidAt?: string; clearsAt?: string; clearedAt?: string; lines: InvoiceLine[]; total: number;
};

export type Agency = { id: string; name: string; markupPercent: number; systemFeePercent: number };

export type World = {
  me: { id: string; name: string };
  agency: Agency;
  members: Member[]; clients: Client[]; projects: Project[]; contracts: Contract[];
  time: TimeEntry[]; usage: UsageEntry[]; invoices: Invoice[]; prices: Price[];
};

export type Action =
  | { type: "addClient"; name: string; contact: string; email: string }
  | { type: "addProject"; clientId: string; name: string }
  | { type: "addMember"; name: string; email: string; kind: Kind; roles: Role[]; title: string; model?: string }
  | { type: "addContract"; projectId: string; workerId: string; title: string; shares: Shares; holders: Holders }
  | { type: "activateContract"; id: string }
  | { type: "endContract"; id: string }
  | { type: "logTime"; contractId: string; date: string; hours: number; note: string }
  | { type: "logUsage"; contractId: string; date: string; inputTokens: number; outputTokens: number; note: string }
  | { type: "approveTime"; ids: string[] }
  | { type: "rejectTime"; ids: string[] }
  | { type: "createInvoice"; projectId: string }
  | { type: "sendInvoice"; id: string }
  | { type: "payInvoice"; id: string }
  | { type: "clearInvoice"; id: string }
  | { type: "setMarkup"; percent: number };

/** Where the world comes from: the in-browser demo or the AgencyPro API. */
export interface Source {
  readonly mode: "demo" | "live";
  load(): Promise<World>;
  act(a: Action): Promise<World>;
}

// ── Math shared by both sources ────────────────────────────────────────────

export const round2 = (n: number) => Math.round(n * 100) / 100;
export const clientRate = (s: Shares) => round2(SHARE_KEYS.reduce((t, k) => t + (s[k] || 0), 0));
export const emptyShares = (): Shares => ({ contractor: 0, recruiter: 0, marketer: 0, pm: 0, am: 0, agency: 0, system: 0 });

export function usageCost(p: Price, inputTokens: number, outputTokens: number) {
  return round2((inputTokens * p.inputPerMTok + outputTokens * p.outputPerMTok) / 1_000_000);
}
export const withMarkup = (cost: number, percent: number) => round2(cost * (100 + percent) / 100);

export const byId = <T extends { id: string }>(xs: T[], id: string | undefined) => xs.find((x) => x.id === id);

/** Unbilled work on a project, ready for its next invoice: approved hours and agent usage not yet invoiced. */
export function billable(w: World, projectId: string) {
  const contracts = new Set(w.contracts.filter((c) => c.projectId === projectId).map((c) => c.id));
  return {
    time: w.time.filter((t) => contracts.has(t.contractId) && t.status === "approved"),
    usage: w.usage.filter((u) => contracts.has(u.contractId) && !u.invoiceId),
  };
}

/** The lines an invoice would carry: one per contract, hours × client rate for people, token cost plus markup for agents. */
export function invoiceLines(w: World, projectId: string): InvoiceLine[] {
  const { time, usage } = billable(w, projectId);
  const lines: InvoiceLine[] = [];
  for (const c of w.contracts.filter((x) => x.projectId === projectId)) {
    const hours = round2(time.filter((t) => t.contractId === c.id).reduce((s, t) => s + t.hours, 0));
    if (hours > 0) {
      const rate = clientRate(c.shares);
      const shares = Object.fromEntries(SHARE_KEYS.map((k) => [k, round2(c.shares[k] * hours)])) as Shares;
      lines.push({ kind: "time", contractId: c.id, workerId: c.workerId, hours, rate, amount: round2(rate * hours), shares });
    }
    const us = usage.filter((u) => u.contractId === c.id);
    for (const model of [...new Set(us.map((u) => u.model))]) {
      const m = us.filter((u) => u.model === model);
      const p = w.prices.find((x) => x.model === model);
      const cost = round2(m.reduce((s, u) => s + u.cost, 0));
      const markupPercent = m[0].markupPercent;
      lines.push({
        kind: "usage", contractId: c.id, workerId: c.workerId, model,
        inputTokens: m.reduce((s, u) => s + u.inputTokens, 0), outputTokens: m.reduce((s, u) => s + u.outputTokens, 0),
        inputPerMTok: p?.inputPerMTok ?? 0, outputPerMTok: p?.outputPerMTok ?? 0,
        cost, markupPercent, amount: round2(m.reduce((s, u) => s + u.amount, 0)),
      });
    }
  }
  return lines;
}

export type PayStatus = "invoiced" | "clearing" | "paid";
export const payStatus = (i: Invoice): PayStatus | null =>
  i.status === "sent" ? "invoiced" : i.status === "paid" ? "clearing" : i.status === "cleared" ? "paid" : null;

/** One payee's money from one invoice. Agents' shares and usage go to the agency. */
export type Payout = { invoiceId: string; payeeId: string | "agency"; stream: ShareKey | "usage"; amount: number; status: PayStatus };

/** Who gets what from one invoice, whatever its status. Agents' shares and agent usage go to the agency. */
export function invoicePayees(w: World, inv: Invoice): { payeeId: string | "agency"; stream: ShareKey | "usage"; amount: number }[] {
  const out: { payeeId: string | "agency"; stream: ShareKey | "usage"; amount: number }[] = [];
  for (const l of inv.lines) {
    if (l.kind === "usage") { out.push({ payeeId: "agency", stream: "usage", amount: l.amount }); continue; }
    const c = byId(w.contracts, l.contractId);
    for (const k of SHARE_KEYS) {
      if (!l.shares[k]) continue;
      if (k === "system") { out.push({ payeeId: "system", stream: k, amount: l.shares[k] }); continue; }
      const holder = k === "contractor" ? l.workerId : k === "agency" ? undefined : c?.holders[k];
      const member = holder ? byId(w.members, holder) : undefined;
      out.push({ payeeId: !member || member.kind === "agent" ? "agency" : member.id, stream: k, amount: l.shares[k] });
    }
  }
  return out;
}

export function payouts(w: World): Payout[] {
  return w.invoices.flatMap((inv) => {
    const status = payStatus(inv);
    return status ? invoicePayees(w, inv).filter((p) => p.payeeId !== "system").map((p) => ({ ...p, invoiceId: inv.id, status })) : [];
  });
}

/** The money pipeline across the agency: logged → approved → invoiced → clearing → paid. */
export function pipeline(w: World) {
  const rateOf = (id: string) => clientRate(byId(w.contracts, id)?.shares ?? emptyShares());
  const sum = (xs: number[]) => round2(xs.reduce((a, b) => a + b, 0));
  const unbilledUsage = sum(w.usage.filter((u) => !u.invoiceId).map((u) => u.amount));
  return {
    waiting: sum(w.time.filter((t) => t.status === "submitted").map((t) => t.hours * rateOf(t.contractId))),
    waitingCount: w.time.filter((t) => t.status === "submitted").length,
    ready: round2(sum(w.time.filter((t) => t.status === "approved").map((t) => t.hours * rateOf(t.contractId))) + unbilledUsage),
    invoiced: sum(w.invoices.filter((i) => i.status === "sent").map((i) => i.total)),
    clearing: sum(w.invoices.filter((i) => i.status === "paid").map((i) => i.total)),
    paid: sum(w.invoices.filter((i) => i.status === "cleared").map((i) => i.total)),
  };
}
