"use client";

import { useState } from "react";
import { MdFilterChip } from "@/components/material";

// Pick a workflow: AI steps run on their own; the ones a person must do go to a credentialed professional.
type Step = { who: "ai" | "human"; title: string; note: string };

const WORKFLOWS: { id: string; label: string; steps: Step[] }[] = [
  {
    id: "books",
    label: "Month-end books",
    steps: [
      { who: "ai", title: "Collect statements and receipts", note: "Your Claude gathers them and flags what's missing." },
      { who: "ai", title: "Reconcile the numbers", note: "Totals checked against the ledger." },
      { who: "human", title: "CPA check and sign-off", note: "A licensed accountant checks it. The sign-off is recorded." },
      { who: "ai", title: "Draft the invoice", note: "Ready for your OK. The client sees one total." },
    ],
  },
  {
    id: "contract",
    label: "Client contract",
    steps: [
      { who: "ai", title: "Draft from your template", note: "Terms filled in from the proposal." },
      { who: "ai", title: "Flag unusual clauses", note: "Changes from your standard terms, highlighted." },
      { who: "human", title: "Attorney review", note: "A lawyer reviews the flagged terms and approves or asks for changes." },
      { who: "ai", title: "Send it to the client", note: "After your OK." },
    ],
  },
  {
    id: "onboarding",
    label: "New client setup",
    steps: [
      { who: "ai", title: "Collect the client's documents", note: "Requested, gathered and checked for completeness." },
      { who: "human", title: "Paralegal preparation", note: "A paralegal prepares the engagement filings for review." },
      { who: "ai", title: "Open the account and project", note: "Set up with the right people and rates." },
      { who: "ai", title: "Send the welcome and first proposal", note: "Drafted for your OK." },
    ],
  },
];

export function WorkflowCard() {
  const [id, setId] = useState(WORKFLOWS[0].id);
  const wf = WORKFLOWS.find((w) => w.id === id)!;
  return (
    <div className="md-card p-6" style={{ ["--md-elevation-level" as string]: 2 }}>
      <md-elevation />
      <div className="flex items-center justify-between gap-3">
        <span className="md-label-large text-on-surface-variant">Where do the people go?</span>
        <span className="md-label-medium flex items-center gap-1 rounded-lg bg-surface-high px-2 py-1 text-on-surface-variant">
          <md-icon aria-hidden="true" style={{ ["--md-icon-size" as string]: "16px" }}>hub</md-icon> via MCP
        </span>
      </div>
      <md-chip-set class="mt-3" aria-label="Pick a workflow">
        {WORKFLOWS.map((w) => <MdFilterChip key={w.id} label={w.label} selected={w.id === id} onPick={() => setId(w.id)} />)}
      </md-chip-set>
      <ol className="mt-4 flex flex-col" aria-live="polite">
        {wf.steps.map((s, i) => (
          <li key={wf.id + s.title} className="relative flex gap-4 pb-5 last:pb-0">
            {i < wf.steps.length - 1 && <span className="absolute left-5 top-11 bottom-1 w-px bg-outline-variant" aria-hidden />}
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
