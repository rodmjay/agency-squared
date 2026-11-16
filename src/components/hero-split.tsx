"use client";

import { useEffect, useState } from "react";
import { SplitBar } from "@/components/split-bar";
import { PRESETS, STREAMS, money } from "@/lib/streams";

export function HeroSplit() {
  const [i, setI] = useState(2);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % PRESETS.length), 3200);
    return () => clearInterval(t);
  }, []);
  const p = PRESETS[i];
  const rate = STREAMS.reduce((sum, s) => sum + p.rates[s.key], 0);

  return (
    <div className="md-card p-6" style={{ ["--md-elevation-level" as string]: 2 }}>
      <md-elevation />
      <div className="flex items-baseline justify-between gap-4">
        <span className="md-label-large text-on-surface-variant">One billed hour · {p.label}</span>
        <span className="md-headline-large figure">{money(rate)}</span>
      </div>
      <div className="mt-4"><SplitBar rates={p.rates} height={56} /></div>
      <ul className="md-body-medium mt-5 grid grid-cols-2 gap-x-6 gap-y-2">
        {STREAMS.filter((s) => p.rates[s.key] > 0).map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-3 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
              <span className="truncate">{s.name}</span>
            </span>
            <span className="figure text-on-surface-variant">${p.rates[s.key]}</span>
          </li>
        ))}
      </ul>
      <div className="md-body-medium mt-6 flex items-center gap-2 rounded-xl bg-secondary-container px-4 py-3 text-on-secondary-container">
        <md-icon aria-hidden="true">payments</md-icon>
        Client pays, every share goes pending, then pays out.
      </div>
    </div>
  );
}
