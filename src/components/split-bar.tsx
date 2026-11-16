import { STREAMS, type Rates } from "@/lib/streams";

export function SplitBar({ rates, height = 40 }: { rates: Rates; height?: number }) {
  const total = STREAMS.reduce((sum, s) => sum + rates[s.key], 0) || 1;
  return (
    <div className="flex w-full gap-0.5 overflow-hidden rounded-lg" style={{ height }} role="img"
      aria-label={STREAMS.filter((s) => rates[s.key] > 0).map((s) => `${s.name} $${rates[s.key]} an hour`).join(", ")}>
      {STREAMS.filter((s) => rates[s.key] > 0).map((s) => (
        <div key={s.key} className="h-full transition-[flex-grow] duration-500 ease-out"
          style={{ flexGrow: rates[s.key] / total, flexBasis: 0, background: s.color }} title={`${s.name}: $${rates[s.key]}/hr`} />
      ))}
    </div>
  );
}
