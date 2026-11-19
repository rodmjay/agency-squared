// The demo agency: a made-up world that lives in this browser only (localStorage), changed by the same actions the
// live API takes. Every name, email and amount here is invented. Prices are the dated per-model table the API seeds.
import {
  byId, clientRate, invoiceLines, round2, usageCost, withMarkup,
  type Action, type Kind, type Price, type Role, type Shares, type Source, type World,
} from "./model";

export type Scenario = "hybrid" | "people" | "agents";
type State = { world: World; seq: number; scenario: Scenario };

const KEY = "asq-demo-v2";
const DAY = 86_400_000;

export const PRICES: Price[] = [
  { model: "claude-opus-5-5", inputPerMTok: 4, outputPerMTok: 20, since: "2026-11-17" },
  { model: "claude-sonnet-5-5", inputPerMTok: 2, outputPerMTok: 10, since: "2026-11-17" },
  { model: "claude-haiku-5-5", inputPerMTok: 0.1, outputPerMTok: 0.5, since: "2026-11-17" },
];

export class DemoError extends Error {}

/** Applies one action to the demo world (the same rules the API enforces, kept to the happy path). */
export function reduce(s: State, a: Action, now: number): State {
  const w = structuredClone(s.world);
  let seq = s.seq;
  const id = (p: string) => `${p}${++seq}`;
  const iso = new Date(now).toISOString();
  switch (a.type) {
    case "addClient":
      w.clients.push({ id: id("cl"), name: a.name.trim(), contact: a.contact.trim(), email: a.email.trim() });
      break;
    case "addProject":
      w.projects.push({ id: id("pr"), clientId: a.clientId, name: a.name.trim(), status: "active" });
      break;
    case "addMember":
      w.members.push({ id: id(a.kind === "agent" ? "ag" : "u"), name: a.name.trim(), email: a.email.trim(), kind: a.kind,
        roles: a.roles, title: a.title.trim(), model: a.kind === "agent" ? a.model : undefined });
      break;
    case "addContract": {
      const worker = byId(w.members, a.workerId);
      if (!worker) throw new DemoError("noWorker");
      const tokens = worker.kind === "agent";
      if (!tokens && a.shares.contractor <= 0) throw new DemoError("noRate");
      w.contracts.push({ id: id("ct"), projectId: a.projectId, workerId: a.workerId, title: a.title.trim(), status: "draft",
        billing: tokens ? "tokens" : "hours", shares: a.shares, holders: tokens ? {} : a.holders });
      break;
    }
    case "activateContract": {
      const c = byId(w.contracts, a.id)!;
      c.status = "active"; c.startedAt = iso;
      break;
    }
    case "endContract": byId(w.contracts, a.id)!.status = "ended"; break;
    case "logTime": {
      const c = byId(w.contracts, a.contractId);
      if (!c || c.status !== "active" || c.billing !== "hours") throw new DemoError("notActive");
      if (!(a.hours > 0 && a.hours <= 24)) throw new DemoError("badHours");
      w.time.push({ id: id("te"), contractId: c.id, date: a.date, hours: round2(a.hours), note: a.note.trim(), status: "submitted" });
      break;
    }
    case "logUsage": {
      const c = byId(w.contracts, a.contractId);
      if (!c || c.status !== "active" || c.billing !== "tokens") throw new DemoError("notActive");
      if (a.inputTokens < 0 || a.outputTokens < 0 || a.inputTokens + a.outputTokens === 0) throw new DemoError("badTokens");
      const model = byId(w.members, c.workerId)?.model ?? "";
      const p = w.prices.find((x) => x.model === model);
      if (!p) throw new DemoError("noPrice");
      const cost = usageCost(p, a.inputTokens, a.outputTokens);
      w.usage.push({ id: id("us"), contractId: c.id, date: a.date, model, inputTokens: a.inputTokens, outputTokens: a.outputTokens,
        cost, markupPercent: w.agency.markupPercent, amount: withMarkup(cost, w.agency.markupPercent), note: a.note.trim() });
      break;
    }
    case "approveTime":
    case "rejectTime":
      for (const t of w.time) if (a.ids.includes(t.id) && t.status === "submitted") t.status = a.type === "approveTime" ? "approved" : "rejected";
      break;
    case "createInvoice": {
      const lines = invoiceLines(w, a.projectId);
      if (lines.length === 0) throw new DemoError("nothingToBill");
      const p = byId(w.projects, a.projectId)!;
      const inv = { id: id("in"), number: `INV-${1000 + w.invoices.length + 1}`, clientId: p.clientId, projectId: p.id,
        status: "draft" as const, createdAt: iso, lines, total: round2(lines.reduce((t, l) => t + l.amount, 0)) };
      const contracts = new Set(lines.map((l) => l.contractId));
      for (const t of w.time) if (contracts.has(t.contractId) && t.status === "approved") { t.status = "invoiced"; t.invoiceId = inv.id; }
      for (const u of w.usage) if (contracts.has(u.contractId) && !u.invoiceId) u.invoiceId = inv.id;
      w.invoices.push(inv);
      break;
    }
    case "sendInvoice": { const i = byId(w.invoices, a.id)!; i.status = "sent"; i.sentAt = iso; break; }
    case "payInvoice": {
      const i = byId(w.invoices, a.id)!;
      i.status = "paid"; i.paidAt = iso; i.clearsAt = new Date(now + 120 * DAY).toISOString();
      break;
    }
    case "clearInvoice": { const i = byId(w.invoices, a.id)!; i.status = "cleared"; i.clearedAt = iso; break; }
    case "setMarkup":
      if (!(a.percent >= 0 && a.percent <= 100)) throw new DemoError("badMarkup");
      w.agency.markupPercent = round2(a.percent);
      break;
  }
  return { ...s, world: w, seq };
}

// ── The seed: built by replaying actions, so it obeys the same rules ─────────

const sh = (contractor: number, o: Partial<Shares> = {}): Shares =>
  ({ contractor, recruiter: 0, marketer: 0, pm: 0, am: 0, agency: 0, system: 0, ...o });

export function seed(scenario: Scenario, now = Date.now()): State {
  let s: State = {
    scenario, seq: 0,
    world: {
      me: { id: "u-alex", name: "Alex Rivera" },
      agency: { id: "org-harbor-lane", name: "Harbor Lane Agency", markupPercent: 20, systemFeePercent: 0 },
      members: [{ id: "u-alex", name: "Alex Rivera", email: "alex@harborlane.test", kind: "person", roles: ["owner", "admin", "am"], title: "Owner" }],
      clients: [], projects: [], contracts: [], time: [], usage: [], invoices: [], prices: PRICES,
    },
  };
  const daysAgo = (n: number) => new Date(now - n * DAY).toISOString().slice(0, 10);
  const run = (a: Action, at = now) => { s = reduce(s, a, at); };
  const last = <K extends keyof World>(k: K) => (s.world[k] as { id: string }[]).at(-1)!.id;
  const member = (name: string, kind: Kind, roles: Role[], title: string, model?: string) => {
    run({ type: "addMember", name, email: `${name.split(" ")[0].toLowerCase()}@harborlane.test`, kind, roles, title, model });
    return last("members");
  };

  const people = scenario !== "agents", agents = scenario !== "people";
  const maya = people ? member("Maya Ortiz", "person", ["contractor"], "Developer") : "";
  const jordan = people ? member("Jordan Lee", "person", ["contractor"], "Designer") : "";
  const priya = people ? member("Priya Shah", "person", ["recruiter"], "Recruiter") : "";
  const leo = people ? member("Leo Brandt", "person", ["marketer"], "Marketing partner") : "";
  const sam = scenario === "people" ? member("Sam Patel", "person", ["contractor"], "Copywriter") : "";
  const scout = agents ? member("Scout", "agent", ["contractor"], "Research agent", "claude-sonnet-5-5") : "";
  const quill = agents ? member("Quill", "agent", ["contractor"], "Writing agent", "claude-opus-5-5") : "";
  const ledger = agents ? member("Ledger", "agent", ["pm"], "Project-tracking agent", "claude-haiku-5-5") : "";
  const atlas = scenario === "agents" ? member("Atlas", "agent", ["contractor"], "Build agent", "claude-sonnet-5-5") : "";

  const client = (name: string, contact: string, email: string, project: string) => {
    run({ type: "addClient", name, contact, email });
    run({ type: "addProject", clientId: last("clients"), name: project });
    return last("projects");
  };
  const bluefield = client("Bluefield Dental", "Nora Hale", "nora@bluefield.test", "Patient portal refresh");
  const ridgeway = client("Ridgeway Outfitters", "Sam Ortega", "sam@ridgeway.test", "Spring catalog site");
  const marigold = client("Marigold Bakery", "Ivy Chen", "ivy@marigold.test", "Online ordering");

  const pm = agents ? ledger : undefined;
  const contract = (projectId: string, workerId: string, title: string, shares: Shares, holders = {}, active = true) => {
    run({ type: "addContract", projectId, workerId, title, shares, holders }, now - 40 * DAY);
    const id = last("contracts");
    if (active) run({ type: "activateContract", id }, now - 40 * DAY);
    return id;
  };
  const hours = (contractId: string, entries: [number, number, string][]) => {
    for (const [ago, h, note] of entries) run({ type: "logTime", contractId, date: daysAgo(ago), hours: h, note }, now - ago * DAY);
    return s.world.time.filter((t) => t.contractId === contractId).map((t) => t.id);
  };
  const tokens = (contractId: string, entries: [number, number, number, string][]) => {
    for (const [ago, i, o, note] of entries) run({ type: "logUsage", contractId, date: daysAgo(ago), inputTokens: i, outputTokens: o, note }, now - ago * DAY);
  };
  const approve = (ids: string[], at: number) => run({ type: "approveTime", ids }, now - at * DAY);
  const invoice = (projectId: string, ago: number, to: "sent" | "paid" | "cleared") => {
    run({ type: "createInvoice", projectId }, now - ago * DAY);
    const id = last("invoices");
    run({ type: "sendInvoice", id }, now - ago * DAY);
    if (to !== "sent") run({ type: "payInvoice", id }, now - (ago - 3) * DAY);
    if (to === "cleared") run({ type: "clearInvoice", id }, now - (ago - 5) * DAY);
  };

  // Bluefield: invoiced and cleared last month; more approved since; two days waiting for approval.
  if (people) {
    const c = contract(bluefield, maya, "Portal front end",
      sh(80, { recruiter: 6, pm: pm ? 8 : 0, am: 6, agency: 25, system: 5 }), { recruiter: priya, pm, am: "u-alex" });
    const first = hours(c, [[30, 6, "Appointment calendar"], [29, 7.5, "Login and accounts"], [28, 5, "Forms review"]]);
    approve(first, 27);
    if (agents) {
      const r = contract(bluefield, scout, "Insurance FAQ research", sh(0));
      tokens(r, [[29, 12_000_000, 1_800_000, "Read 40 insurer policies"], [28, 6_500_000, 900_000, "Drafted FAQ answers"]]);
    }
    invoice(bluefield, 26, "cleared");
    const later = hours(c, [[9, 6, "Reminders by text"], [8, 4.5, "Accessibility fixes"]]);
    approve(later, 7);
    hours(c, [[2, 5, "Billing page"], [1, 3.5, "Bug fixes"]]);
    if (agents) tokens(s.world.contracts.find((x) => x.workerId === scout)!.id, [[6, 9_000_000, 1_200_000, "Compared portal vendors"]]);
  } else {
    const r = contract(bluefield, scout, "Insurance FAQ research", sh(0));
    tokens(r, [[29, 12_000_000, 1_800_000, "Read 40 insurer policies"], [28, 6_500_000, 900_000, "Drafted FAQ answers"]]);
    invoice(bluefield, 26, "cleared");
    const b = contract(bluefield, atlas, "Portal front end", sh(0));
    tokens(b, [[9, 24_000_000, 4_100_000, "Appointment calendar"], [3, 11_000_000, 2_600_000, "Reminders by text"]]);
  }

  // Ridgeway: paid by the client, clearing now.
  if (people) {
    const c = contract(ridgeway, jordan, "Catalog design",
      sh(65, { marketer: 5, pm: pm ? 8 : 0, am: 5, agency: 20, system: 5 }), { marketer: leo, pm, am: "u-alex" });
    approve(hours(c, [[16, 6, "Product page layouts"], [15, 6, "Lookbook"], [14, 4, "Checkout design"]]), 13);
    invoice(ridgeway, 12, "paid");
    approve(hours(c, [[8, 5, "Gift guide"], [7, 4.5, "Mobile menu"]]).slice(-2), 6);
    invoice(ridgeway, 5, "sent");
    hours(c, [[1, 6, "Size guide"]]);
  } else {
    const c = contract(ridgeway, quill, "Catalog copy", sh(0));
    tokens(c, [[15, 8_000_000, 3_000_000, "Product descriptions, 120 items"]]);
    invoice(ridgeway, 12, "paid");
    tokens(c, [[7, 5_500_000, 1_900_000, "Gift guide copy"]]);
    invoice(ridgeway, 5, "sent");
  }

  // Marigold: new work. An agent drafting copy (unbilled) or, with people only, a copywriter; a draft contract to start.
  if (agents) {
    const q = contract(marigold, quill, "Menu and ordering copy", sh(0));
    tokens(q, [[4, 4_200_000, 1_600_000, "Menu descriptions"], [2, 3_000_000, 1_100_000, "Order emails"]]);
  }
  if (scenario === "people") {
    const c = contract(marigold, sam, "Menu and ordering copy", sh(55, { am: 5, agency: 18, system: 5 }), { am: "u-alex" });
    approve(hours(c, [[4, 3, "Menu descriptions"], [2, 2.5, "Order emails"]]), 1);
  }
  if (people) contract(marigold, maya, "Online ordering build", sh(85, { am: 6, agency: 25, system: 5 }), { am: "u-alex" }, false);
  else contract(marigold, atlas, "Online ordering build", sh(0), {}, false);

  return s;
}

// ── The source the app talks to ─────────────────────────────────────────────

export class DemoSource implements Source {
  readonly mode = "demo" as const;
  private state: State;
  constructor() {
    let saved: State | null = null;
    try { saved = JSON.parse(localStorage.getItem(KEY) ?? "null"); } catch { /* private window: start fresh */ }
    this.state = saved?.world?.agency ? saved : seed("hybrid");
  }
  get scenario() { return this.state.scenario; }
  private save() { try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch { /* not kept: fine for a demo */ } }
  async load() { return this.state.world; }
  async act(a: Action) {
    this.state = reduce(this.state, a, Date.now());
    this.save();
    return this.state.world;
  }
  /** Starts the demo over with one of the three agencies: hybrid, people only or agents only. */
  reset(scenario: Scenario) {
    this.state = seed(scenario);
    this.save();
    return this.state.world;
  }
}

export { clientRate };
