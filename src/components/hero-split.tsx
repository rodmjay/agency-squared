"use client";

import { useEffect, useState } from "react";
import { SplitBar } from "@/components/split-bar";
import { PRESETS, STREAMS, money } from "@/lib/streams";

export function HeroSplit() {
  const [i, setI] = useState(2);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((n) => (n + 1) % PRESETS.length), 2800);
    return () => clearInterval(t);
  }, []);
  const p = PRESETS[i];
  const rate = STREAMS.reduce((sum, s) => sum + p.rates[s.key], 0);
  const shown = STREAMS.filter((s) => p.rates[s.key] > 0);

  return (
    <div className="relative rounded-3xl bg-card p-6 shadow-[0_24px_60px_-20px_oklch(0.52_0.24_285/0.35)] ring-1 ring-foreground/10 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-sm text-muted-foreground">One billed hour · {p.label}</span>
        <span className="font-heading text-3xl font-extrabold tabular-nums">{money(rate)}</span>
      </div>
      <SplitBar rates={p.rates} className="mt-4 h-16" />
      <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm" aria-live="polite">
        {shown.map((s) => (
          <li key={s.key} className="flex items-center justify-between gap-2">
            <span className="flex min-w-0 items-center gap-2">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
              <span className="truncate">{s.name}</span>
            </span>
            <span className="font-mono tabular-nums text-muted-foreground">${p.rates[s.key]}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 rounded-2xl bg-muted px-4 py-3 text-sm">
        <b>Client pays</b> → <b>money lands</b> → <b>every share moves</b>. Automatically.
      </div>
    </div>
  );
}
