"use client";

import { useState } from "react";
import { RotateCcw, Undo2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SplitBar } from "@/components/split-bar";
import { PRESETS, STREAMS, money, type Rates, type StreamKey } from "@/lib/streams";
import { cn } from "@/lib/utils";

export function PayoutPlayground() {
  const [preset, setPreset] = useState(PRESETS[2].id);
  const [rates, setRates] = useState<Rates>(PRESETS[2].rates);
  const [hours, setHours] = useState(80);
  const [refund, setRefund] = useState(false);

  const rate = STREAMS.reduce((sum, s) => sum + rates[s.key], 0);
  const invoice = rate * hours;
  const refundShare = refund ? 0.2 : 0;

  const setOne = (key: StreamKey, v: number) => {
    setPreset("custom");
    setRates((r) => ({ ...r, [key]: v }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-xl">Build the rate</CardTitle>
          <CardDescription>Drag any slider. Set a share to $0 and it drops off the contract.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Start from a preset">
            {PRESETS.map((p) => (
              <Button key={p.id} size="sm" variant={preset === p.id ? "default" : "outline"} aria-pressed={preset === p.id}
                onClick={() => { setPreset(p.id); setRates(p.rates); }}>
                {p.label}
              </Button>
            ))}
          </div>
          <ul className="flex flex-col gap-4">
            {STREAMS.map((s) => (
              <li key={s.key} className={cn("grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5", rates[s.key] === 0 && "opacity-55")}>
                <label id={`l-${s.key}`} className="flex items-center gap-2 text-sm font-medium">
                  <span className="size-3 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
                  {s.name}
                  <span className="hidden text-muted-foreground sm:inline">· {s.who}</span>
                </label>
                <span className="font-mono text-sm tabular-nums">${rates[s.key]}/hr</span>
                <Slider className="col-span-2" aria-labelledby={`l-${s.key}`} min={0} max={s.key === "contractor" ? 150 : 40} step={1}
                  value={[rates[s.key]]} onValueChange={(v) => setOne(s.key, Array.isArray(v) ? v[0] : (v as number))} />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card className="lg:sticky lg:top-6 lg:self-start">
        <CardHeader>
          <CardTitle className="font-heading text-xl">Where {money(invoice)} goes</CardTitle>
          <CardDescription>
            {hours} hours at {money(rate)}/hr. The client sees one invoice for {money(invoice)}. Nobody gets a cent until it&apos;s paid.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <SplitBar rates={rates} />
          <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1.5">
            <label id="l-hours" className="text-sm font-medium">Hours billed this month</label>
            <span className="font-mono text-sm tabular-nums">{hours} h</span>
            <Slider className="col-span-2" aria-labelledby="l-hours" min={10} max={200} step={5} value={[hours]}
              onValueChange={(v) => setHours(Array.isArray(v) ? v[0] : (v as number))} />
          </div>
          <ul className="divide-y divide-border rounded-lg border" aria-live="polite">
            {STREAMS.filter((s) => rates[s.key] > 0).map((s) => {
              const paid = rates[s.key] * hours;
              const back = paid * refundShare;
              return (
                <li key={s.key} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ background: s.color }} aria-hidden />
                    {s.name}
                  </span>
                  <span className="font-mono tabular-nums">
                    {money(paid - back)}
                    {refund && <span className="ml-2 text-destructive">−{money(back)}</span>}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-2.5">
            <label htmlFor="refund" className="flex items-center gap-2 text-sm font-medium">
              <Undo2 className="size-4" aria-hidden /> Client disputes 20%
            </label>
            <Switch id="refund" checked={refund} onCheckedChange={setRefund} />
          </div>
          <p className="text-sm text-muted-foreground">
            {refund
              ? "Every share gives back the same 20%, taken from the next payout if it already went out. No one eats the whole loss."
              : "Flip the switch to see a refund roll back fairly across everyone."}
          </p>
          <Button variant="ghost" size="sm" className="self-start" onClick={() => { setPreset(PRESETS[2].id); setRates(PRESETS[2].rates); setHours(80); setRefund(false); }}>
            <RotateCcw className="size-3.5" aria-hidden /> Reset
          </Button>
          <p className="text-xs text-muted-foreground">Example numbers only. You set every rate on your own contracts.</p>
        </CardContent>
      </Card>
    </div>
  );
}
