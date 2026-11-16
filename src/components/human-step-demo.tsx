"use client";

import { useEffect, useRef, useState } from "react";
import { MdButton } from "@/components/material";
import { useAutoplay } from "@/lib/use-autoplay";

// One human step, start to finish, as your workflow sees it. Example data only.
const STAGES = [
  { key: "requested", label: "Requested", icon: "send", text: "Your workflow calls request_human_step: “Review the year-end reconciliation and sign off.”" },
  { key: "claimed", label: "Claimed", icon: "badge", text: "A professional with the right credential claims it and opens the documents." },
  { key: "review", label: "In review", icon: "find_in_page", text: "They check the numbers against the source documents. AI did the prep; a person makes the call." },
  { key: "approved", label: "Approved", icon: "verified", text: "Decision recorded: who decided, their role, and when. Your workflow picks it up and carries on." },
] as const;

export function HumanStepDemo() {
  const [at, setAt] = useState(STAGES.length - 1);
  const [run, setRun] = useState(0);
  const timers = useRef<number[]>([]);
  const { ref: autoRef, playing: loop, paused, reduced, setPaused } = useAutoplay<HTMLDivElement>();

  useEffect(() => {
    if (!loop && run === 0) return; // Off screen, paused or reduced motion: hold the finished state.
    timers.current.forEach(clearTimeout);
    timers.current = STAGES.map((_, i) => window.setTimeout(() => setAt(i), i * 1700));
    if (loop) timers.current.push(window.setTimeout(() => setRun((n) => n + 1), STAGES.length * 1700 + 4000));
    return () => timers.current.forEach(clearTimeout);
  }, [run, loop]);

  const stage = STAGES[at];
  return (
    <div ref={autoRef} className="md-card p-6" style={{ ["--md-elevation-level" as string]: 2 }}>
      <md-elevation />
      <div className="flex items-center justify-between gap-3">
        <span className="md-label-large text-on-surface-variant">One human step</span>
        <code className="figure md-label-medium rounded-lg bg-surface-high px-2 py-1">request_human_step</code>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface-high p-3">
        <md-icon aria-hidden="true">description</md-icon>
        <div className="min-w-0">
          <p className="md-title-medium truncate">Year-end reconciliation</p>
          <p className="md-label-medium text-on-surface-variant">Prepared by your AI · 14 pages</p>
        </div>
      </div>

      <ol className="mt-5 grid grid-cols-4 gap-1.5" aria-label="Step status">
        {STAGES.map((s, i) => (
          <li key={s.key} aria-current={i === at ? "step" : undefined} className="flex flex-col items-center gap-1.5 text-center">
            <span className={`grid size-10 place-items-center rounded-full transition-colors duration-300 ${i < at ? "bg-primary-container text-on-primary-container" : i === at ? (s.key === "approved" ? "bg-primary text-on-primary" : "bg-secondary-container text-on-secondary-container") : "bg-surface-high text-on-surface-variant"}`}>
              <md-icon aria-hidden="true">{i < at ? "check" : s.icon}</md-icon>
            </span>
            <span className={`md-label-medium ${i <= at ? "" : "text-on-surface-variant"}`}>{s.label}</span>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex items-start justify-between gap-3 rounded-xl bg-primary-container px-4 py-3 text-on-primary-container">
        <p className="md-body-medium" aria-live="polite">{stage.text}</p>
        <div className="flex shrink-0 flex-col items-end">
          {!reduced && <MdButton kind="text" icon={paused ? "play_arrow" : "pause"} onClick={() => setPaused((p) => !p)}>{paused ? "Play" : "Pause"}</MdButton>}
          <MdButton kind="text" icon="replay" onClick={() => setRun((n) => n + 1)}>Replay</MdButton>
        </div>
      </div>
      <p className="md-label-medium mt-3 text-on-surface-variant">Example. Review and sign-off steps come first; more step types are coming.</p>
    </div>
  );
}
