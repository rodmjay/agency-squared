"use client";

import { useState } from "react";
import { MdFilterChip } from "@/components/material";
import { useI18n } from "@/components/i18n";

// Pick a workflow: AI steps run on their own; the ones a person must do go to a credentialed professional.
// Who does each step; the words are in the dictionary (workflow.workflows), in the same order.
const WORKFLOWS: { id: string; who: ("ai" | "human")[] }[] = [
  { id: "books", who: ["ai", "ai", "human", "ai"] },
  { id: "contract", who: ["ai", "ai", "human", "ai"] },
  { id: "onboarding", who: ["ai", "human", "ai", "ai"] },
];

export function WorkflowCard() {
  const { d } = useI18n();
  const [id, setId] = useState(WORKFLOWS[0].id);
  const n = WORKFLOWS.findIndex((w) => w.id === id);
  const wf = { id, steps: d.workflow.workflows[n].steps.map((s, i) => ({ ...s, who: WORKFLOWS[n].who[i] })) };
  return (
    <div className="md-card p-6" style={{ ["--md-elevation-level" as string]: 2 }}>
      <md-elevation />
      <div className="flex items-center justify-between gap-3">
        <span className="md-label-large text-on-surface-variant">{d.workflow.heading}</span>
        <span className="md-label-medium flex items-center gap-1 rounded-lg bg-surface-high px-2 py-1 text-on-surface-variant">
          <md-icon aria-hidden="true" style={{ ["--md-icon-size" as string]: "16px" }}>hub</md-icon> {d.workflow.via}
        </span>
      </div>
      <md-chip-set class="mt-3" aria-label={d.workflow.pick}>
        {WORKFLOWS.map((w, i) => <MdFilterChip key={w.id} label={d.workflow.workflows[i].label} selected={w.id === id} onPick={() => setId(w.id)} />)}
      </md-chip-set>
      <ol className="mt-4 flex flex-col" aria-live="polite">
        {wf.steps.map((s, i) => (
          <li key={wf.id + i} className="relative flex gap-4 pb-5 last:pb-0">
            {i < wf.steps.length - 1 && <span className="absolute left-5 top-11 bottom-1 w-px bg-outline-variant" aria-hidden />}
            <span className={`grid size-10 shrink-0 place-items-center rounded-full ${s.who === "human" ? "bg-primary text-on-primary" : "bg-surface-high text-on-surface-variant"}`}>
              <md-icon aria-hidden="true">{s.who === "human" ? "person_check" : "smart_toy"}</md-icon>
            </span>
            <div className={`min-w-0 flex-1 ${s.who === "human" ? "rounded-xl bg-primary-container p-3 text-on-primary-container" : "pt-1"}`}>
              <p className="md-title-medium">{s.title}</p>
              <p className={`md-body-medium mt-0.5 ${s.who === "human" ? "" : "text-on-surface-variant"}`}>{s.note}</p>
              <p className="md-label-medium mt-1 opacity-80">{s.who === "human" ? d.workflow.human : d.workflow.ai}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
