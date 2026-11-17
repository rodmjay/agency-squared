"use client";

import { STREAMS, money, type Rates } from "@/lib/streams";
import { useI18n } from "@/components/i18n";
import { fmt } from "@/i18n";

export function SplitBar({ rates, height = 40 }: { rates: Rates; height?: number }) {
  const { d } = useI18n();
  const total = STREAMS.reduce((sum, s) => sum + rates[s.key], 0) || 1;
  return (
    <div className="flex w-full gap-0.5 overflow-hidden rounded-lg" style={{ height }} role="img"
      aria-label={STREAMS.filter((s) => rates[s.key] > 0).map((s) => fmt(d.play.barLabel, { name: d.streams[s.key].name, amount: money(rates[s.key]) })).join(", ")}>
      {STREAMS.filter((s) => rates[s.key] > 0).map((s) => (
        <div key={s.key} className="h-full transition-[flex-grow] duration-500 ease-out"
          style={{ flexGrow: rates[s.key] / total, flexBasis: 0, background: s.color }} title={fmt(d.play.barTitle, { name: d.streams[s.key].name, amount: money(rates[s.key]) })} />
      ))}
    </div>
  );
}
