"use client";

import { useEffect, useRef, useState } from "react";
import { SplitBar } from "@/components/split-bar";
import { MdButton, MdFilterChip, MdSlider, MdSwitch } from "@/components/material";
import { PRESETS, STREAMS, money, type StreamKey } from "@/lib/streams";
import { DEFAULT_SPLIT, HOURS, decodeSplit, encodeSplit, rateMax, type SplitState } from "@/lib/split-url";

const REFUND = 0.2;
const totals = (s: SplitState) => {
  const rate = STREAMS.reduce((sum, x) => sum + s.rates[x.key], 0);
  return { rate, invoice: rate * s.hours };
};

export function PayoutPlayground({ invite }: { invite: string }) {
  const [split, setSplit] = useState<SplitState>(DEFAULT_SPLIT);
  const [received, setReceived] = useState<SplitState | null>(null);
  const [copied, setCopied] = useState<"idle" | "done" | "manual">("idle");
  const [link, setLink] = useState("");
  const receiptRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  // Restore a shared split from the URL once, on load.
  useEffect(() => {
    const s = decodeSplit(window.location.search);
    if (s) {
      // Reading the URL has to wait for the browser; the static HTML renders the default split.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSplit(s);
      setReceived(s);
      requestAnimationFrame(() => receiptRef.current?.scrollIntoView({ block: "start" }));
    }
    loaded.current = true;
  }, []);

  // Keep the URL in step with the playground, without adding history entries.
  useEffect(() => {
    if (!loaded.current) return;
    const url = `${window.location.pathname}?${encodeSplit(split)}#play`;
    // Leave a plain visit's URL alone until the visitor changes something.
    if (window.location.search || encodeSplit(split) !== encodeSplit(DEFAULT_SPLIT)) window.history.replaceState(null, "", url);
    setLink(window.location.origin + url);
    setCopied("idle");
  }, [split]);

  const { rate, invoice } = totals(split);
  const refundShare = split.refund ? REFUND : 0;
  const update = (patch: Partial<SplitState>) => setSplit((s) => ({ ...s, ...patch }));
  const setOne = (key: StreamKey, v: number) => setSplit((s) => ({ ...s, preset: "custom", rates: { ...s.rates, [key]: v } }));

  async function share() {
    try {
      await navigator.clipboard.writeText(link || window.location.href);
      setCopied("done");
    } catch {
      setCopied("manual");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {received && <Receipt ref={receiptRef} split={received} invite={invite} />}

      <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
        <div className="md-card-outlined p-6">
          <h3 className="md-title-large">Build the rate</h3>
          <p className="md-body-medium mt-1 text-on-surface-variant">Drag any slider. Set a share to $0 and it drops off the contract.</p>
          <md-chip-set class="mt-4" aria-label="Start from a preset">
            {PRESETS.map((p) => (
              <MdFilterChip key={p.id} label={p.label} selected={split.preset === p.id} onPick={() => update({ preset: p.id, rates: p.rates })} />
            ))}
          </md-chip-set>
          <ul className="mt-5 flex flex-col gap-3">
            {STREAMS.map((s) => (
              <li key={s.key} className={split.rates[s.key] === 0 ? "opacity-60" : undefined}>
                <div className="flex items-center justify-between gap-3">
                  <span className="md-label-large flex items-center gap-2">
                    <span className="size-3 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
                    {s.name}
                    <span className="md-body-medium hidden text-on-surface-variant sm:inline">· {s.who}</span>
                  </span>
                  <span className="figure md-body-medium">${split.rates[s.key]}/hr</span>
                </div>
                <MdSlider label={`${s.name}, dollars per hour`} min={0} max={rateMax(s.key)} step={1} value={split.rates[s.key]}
                  valueLabel={`$${split.rates[s.key]}`} onValue={(v) => setOne(s.key, v)} />
              </li>
            ))}
          </ul>
        </div>

        <div className="md-card p-6 lg:sticky lg:top-6 lg:self-start">
          <md-elevation />
          <h3 className="md-title-large">Where {money(invoice)} goes</h3>
          <p className="md-body-medium mt-1 text-on-surface-variant">
            {split.hours} hours at {money(rate)}/hr. The client sees one invoice for {money(invoice)}. Nobody gets a cent until it&apos;s paid.
          </p>
          <div className="mt-4"><SplitBar rates={split.rates} /></div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="md-label-large">Hours billed this month</span>
              <span className="figure md-body-medium">{split.hours} h</span>
            </div>
            <MdSlider label="Hours billed this month" min={HOURS.min} max={HOURS.max} step={HOURS.step} value={split.hours}
              valueLabel={`${split.hours}`} onValue={(v) => update({ hours: v })} />
          </div>
          <ul className="mt-2">
            {STREAMS.filter((s) => split.rates[s.key] > 0).map((s, i) => {
              const paid = split.rates[s.key] * split.hours;
              const back = paid * refundShare;
              return (
                <li key={s.key}>
                  {i > 0 && <md-divider />}
                  <div className="md-body-medium flex items-center justify-between gap-3 py-2.5">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: s.color }} aria-hidden />
                      {s.name}
                    </span>
                    <span className="figure">
                      {money(paid - back)}
                      {split.refund && <span className="ml-2 text-error">−{money(back)}</span>}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-surface-high px-4 py-3">
            <label htmlFor="refund" className="md-label-large flex items-center gap-2">
              <md-icon aria-hidden="true">undo</md-icon> Client disputes 20%
            </label>
            <MdSwitch id="refund" selected={split.refund} onSelected={(v) => update({ refund: v })} />
          </div>
          <p className="md-body-medium mt-3 text-on-surface-variant">
            {split.refund
              ? "Every share gives back the same 20%, taken from the next payout if it already went out. No one eats the whole loss."
              : "Flip the switch to see a refund roll back fairly across everyone."}
          </p>

          <div className="mt-5 rounded-xl bg-primary-container p-4 text-on-primary-container">
            <p className="md-title-medium">Show a contractor or partner what they&apos;d earn.</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <MdButton icon={copied === "done" ? "check" : "link"} onClick={share}>{copied === "done" ? "Link copied" : "Send this split"}</MdButton>
              <span role="status" className="md-body-medium">{copied === "done" ? "Paste it anywhere. It opens as a payout receipt." : ""}</span>
            </div>
            {copied === "manual" && (
              <div className="mt-3">
                <label htmlFor="share-link" className="md-body-medium">Copy this link:</label>
                <input id="share-link" readOnly value={link} autoFocus onFocus={(e) => e.currentTarget.select()}
                  className="figure mt-1 w-full rounded-md border border-outline bg-surface px-2 py-2 text-xs text-on-surface" />
              </div>
            )}
            <p className="md-label-medium mt-3 opacity-80">The link holds only these example numbers. No names, nothing about you.</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <MdButton kind="text" icon="restart_alt" onClick={() => setSplit(DEFAULT_SPLIT)}>Reset</MdButton>
            <p className="md-label-medium text-on-surface-variant">Example numbers only. You set every rate on your own contracts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Receipt({ split, invite, ref }: { split: SplitState; invite: string; ref: React.Ref<HTMLDivElement> }) {
  const { rate, invoice } = totals(split);
  const keep = split.refund ? 1 - REFUND : 1;
  return (
    <div ref={ref} className="md-card-filled scroll-mt-24 p-6 sm:p-8">
      <p className="md-label-large text-primary">Someone sent you a split</p>
      <h3 className="md-headline-small mt-1">Payout receipt</h3>
      <p className="md-body-large mt-2 text-on-surface-variant">
        The client pays <b className="text-on-surface">{money(invoice)}</b> for {split.hours} hours at {money(rate)}/hr
        {split.refund ? ", then disputes 20%" : ""}. Here&apos;s where every dollar goes.
      </p>
      <div className="mt-4"><SplitBar rates={split.rates} height={28} /></div>
      <dl className="mt-4">
        {STREAMS.filter((s) => split.rates[s.key] > 0).map((s) => (
          <div key={s.key}>
            <div className="md-body-medium flex items-center justify-between gap-3 py-2">
              <dt className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: s.color }} aria-hidden />
                {s.name} <span className="hidden text-on-surface-variant sm:inline">· {s.who}</span>
              </dt>
              <dd className="figure">{money(split.rates[s.key] * split.hours * keep)}</dd>
            </div>
            <md-divider />
          </div>
        ))}
        <div className="md-title-medium flex items-center justify-between gap-3 py-2">
          <dt>Total paid out</dt>
          <dd className="figure">{money(invoice * keep)}</dd>
        </div>
      </dl>
      <p className="md-label-medium mt-2 text-on-surface-variant">Each share is paid only after the client&apos;s payment clears. Example numbers, not an offer.</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <MdButton href={invite} external icon="arrow_forward" trailingIcon>Get paid like this: request an invite</MdButton>
        <span className="md-body-medium text-on-surface-variant">Or tweak the numbers below.</span>
      </div>
    </div>
  );
}
