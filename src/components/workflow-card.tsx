// A workflow at a glance: AI steps run on their own; the one a person must do goes to a vetted professional.
type Step = { who: "ai" | "human"; title: string; note: string };

const STEPS: Step[] = [
  { who: "ai", title: "Collect the client's documents", note: "Your Claude gathers them and checks they're complete." },
  { who: "ai", title: "Reconcile the numbers", note: "Totals checked against the ledger." },
  { who: "human", title: "Review and sign off", note: "A vetted professional reviews it. Their decision is recorded." },
  { who: "ai", title: "Draft the invoice", note: "Ready for your OK. The client sees one total." },
];

export function WorkflowCard() {
  return (
    <div className="md-card p-6" style={{ ["--md-elevation-level" as string]: 2 }}>
      <md-elevation />
      <div className="flex items-center justify-between gap-3">
        <span className="md-label-large text-on-surface-variant">A client workflow</span>
        <span className="md-label-medium flex items-center gap-1 rounded-lg bg-surface-high px-2 py-1 text-on-surface-variant">
          <md-icon aria-hidden="true" style={{ ["--md-icon-size" as string]: "16px" }}>hub</md-icon> via MCP
        </span>
      </div>
      <ol className="mt-4 flex flex-col">
        {STEPS.map((s, i) => (
          <li key={s.title} className="relative flex gap-4 pb-5 last:pb-0">
            {i < STEPS.length - 1 && <span className="absolute left-5 top-11 bottom-1 w-px bg-outline-variant" aria-hidden />}
            <span className={`grid size-10 shrink-0 place-items-center rounded-full ${s.who === "human" ? "bg-primary text-on-primary" : "bg-surface-high text-on-surface-variant"}`}>
              <md-icon aria-hidden="true">{s.who === "human" ? "person_check" : "smart_toy"}</md-icon>
            </span>
            <div className={`min-w-0 flex-1 ${s.who === "human" ? "rounded-xl bg-primary-container p-3 text-on-primary-container" : "pt-1"}`}>
              <p className="md-title-medium">{s.title}</p>
              <p className={`md-body-medium mt-0.5 ${s.who === "human" ? "" : "text-on-surface-variant"}`}>{s.note}</p>
              <p className="md-label-medium mt-1 opacity-80">{s.who === "human" ? "Real person" : "AI"}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
