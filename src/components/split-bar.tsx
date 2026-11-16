import { STREAMS, type Rates } from "@/lib/streams";
import { cn } from "@/lib/utils";

export function SplitBar({ rates, className, scale = 1 }: { rates: Rates; className?: string; scale?: number }) {
  const total = STREAMS.reduce((sum, s) => sum + rates[s.key], 0) || 1;
  return (
    <div className={cn("flex h-12 w-full overflow-hidden rounded-xl ring-1 ring-foreground/10", className)} role="img"
      aria-label={STREAMS.filter((s) => rates[s.key] > 0).map((s) => `${s.name} $${rates[s.key]}`).join(", ")}>
      {STREAMS.map((s) => (
        <div
          key={s.key}
          className="h-full transition-[flex-grow] duration-500 ease-out first:rounded-l-xl last:rounded-r-xl"
          style={{ flexGrow: (rates[s.key] / total) * scale, flexBasis: 0, background: s.color, marginRight: rates[s.key] > 0 ? 2 : 0 }}
          title={`${s.name}: $${rates[s.key]}/hr`}
        />
      ))}
    </div>
  );
}
