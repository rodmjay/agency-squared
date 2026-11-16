"use client";

import { useEffect, useRef, useState } from "react";
import { MdButton } from "@/components/material";
import { PRESETS, STREAMS, money } from "@/lib/streams";
import { useAutoplay } from "@/lib/use-autoplay";

// One payment, start to finish: invoice sent → client pays (every share pending) → it clears (shares flip to paid).
const HOURS = 80;
const rates = PRESETS[2].rates;
const shares = STREAMS.filter((s) => rates[s.key] > 0);
const rate = shares.reduce((sum, s) => sum + rates[s.key], 0);

type Stage = "sent" | "pending" | "cleared";
const CAPTION: Record<Stage, string> = {
  sent: `Invoice sent: ${money(rate * HOURS)} for ${HOURS} hours.`,
  pending: "The client paid. Every share is pending until the payment fully clears.",
  cleared: "It cleared. Everyone is paid, and no one will ever pay it back.",
};

export function HeroSplit() {
  const [stage, setStage] = useState<Stage>("cleared");
  const [paidCount, setPaidCount] = useState(shares.length);
  const [run, setRun] = useState(0);
  const timers = useRef<number[]>([]);
  const { ref: autoRef, playing: loop, paused, reduced, setPaused } = useAutoplay<HTMLDivElement>();

  useEffect(() => {
    if (!loop && run === 0) return; // Off screen, paused or reduced motion: hold the finished state. Replay still plays once.
    const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
    const play = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      at(0, () => { setStage("sent"); setPaidCount(0); });
      at(1600, () => setStage("pending"));
      at(4200, () => setStage("cleared"));
      shares.forEach((_, i) => at(4300 + i * 220, () => setPaidCount(i + 1)));
      if (loop) at(4300 + shares.length * 220 + 4000, play);
    };
    play();
    return () => timers.current.forEach(clearTimeout);
  }, [run, loop]);

  return (
    <div ref={autoRef} className="md-card p-6" style={{ ["--md-elevation-level" as string]: 2 }}>
      <md-elevation />
      <div className="flex items-baseline justify-between gap-4">
        <span className="md-label-large text-on-surface-variant">One client payment</span>
        <span className="md-headline-large figure">{money(rate * HOURS)}</span>
      </div>

      <ol className="md-label-medium mt-4 grid grid-cols-3 gap-2" aria-label="Payment stage">
        {(["sent", "pending", "cleared"] as Stage[]).map((s, i) => {
          const reached = ["sent", "pending", "cleared"].indexOf(stage) >= i;
          return (
            <li key={s} aria-current={stage === s ? "step" : undefined}
              className={`rounded-lg px-2 py-1.5 text-center transition-colors duration-300 ${reached ? (s === "cleared" ? "bg-primary text-on-primary" : "bg-secondary-container text-on-secondary-container") : "bg-surface-high text-on-surface-variant"}`}>
              {s === "sent" ? "Invoice sent" : s === "pending" ? "Client paid" : "Cleared"}
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex h-14 w-full gap-0.5 overflow-hidden rounded-lg" aria-hidden>
        {shares.map((s, i) => {
          const paid = stage === "cleared" && i < paidCount;
          const pending = stage === "pending" || (stage === "cleared" && !paid);
          return (
            <div key={s.key} className="h-full transition-opacity duration-300"
              style={{
                flexGrow: rates[s.key] / rate, flexBasis: 0, background: s.color,
                opacity: stage === "sent" ? 0.18 : paid ? 1 : 0.45,
                backgroundImage: pending ? "repeating-linear-gradient(135deg, transparent 0 6px, rgb(255 255 255 / .35) 6px 9px)" : undefined,
              }} />
          );
        })}
      </div>

      <ul className="md-body-medium mt-4 grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {shares.map((s, i) => {
          const paid = stage === "cleared" && i < paidCount;
          return (
            <li key={s.key} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-2">
                <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
                <span className="truncate">{s.name}</span>
              </span>
              <span className={`md-label-medium shrink-0 ${paid ? "text-primary" : "text-on-surface-variant"}`}>
                {stage === "sent" ? "—" : paid ? `Paid ${money(rates[s.key] * HOURS)}` : "Pending"}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-secondary-container px-4 py-3 text-on-secondary-container">
        <p className="md-body-medium" aria-live="polite">{CAPTION[stage]}</p>
        <div className="flex shrink-0 items-center">
          {!reduced && <MdButton kind="text" icon={paused ? "play_arrow" : "pause"} onClick={() => setPaused((p) => !p)}>{paused ? "Play" : "Pause"}</MdButton>}
          <MdButton kind="text" icon="replay" onClick={() => setRun((n) => n + 1)}>Replay</MdButton>
        </div>
      </div>
    </div>
  );
}
