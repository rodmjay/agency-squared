"use client";

import { useEffect, useRef, useState } from "react";
import { SplitBar } from "@/components/split-bar";
import { MdButton, MdFilterChip, MdSlider } from "@/components/material";
import { PRESETS, STREAMS, money, type StreamKey } from "@/lib/streams";
import { useI18n } from "@/components/i18n";
import { fmt, rich } from "@/i18n";
import { DEFAULT_SPLIT, HOURS, decodeSplit, encodeSplit, rateMax, type SplitState } from "@/lib/split-url";

// "contractor $75, recruiter $5, …": each stream as a slice of one billed hour (Rod 11/18: never a wage of its own).
const slices = (s: SplitState, names: Record<StreamKey, { name: string }>) =>
  STREAMS.filter((x) => s.rates[x.key] > 0)
    .map((x) => `${x.key === "system" ? names[x.key].name : names[x.key].name.toLocaleLowerCase()} ${money(s.rates[x.key])}`)
    .join(", ");
const totals = (s: SplitState) => {
  const rate = STREAMS.reduce((sum, x) => sum + s.rates[x.key], 0);
  return { rate, invoice: rate * s.hours };
};

export function PayoutPlayground({ invite }: { invite: string }) {
  const { d } = useI18n();
  const t = d.play;
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
      setTimeout(() => receiptRef.current?.scrollIntoView({ block: "start" }), 250);
    }
    loaded.current = true;
  }, []);

  // Keep the URL in step with the playground, without adding history entries.
  useEffect(() => {
    if (!loaded.current) return;
    const url = `${window.location.pathname}?${encodeSplit(split)}#play`;
    // Leave a plain visit's URL alone until the visitor changes something.
    if (decodeSplit(window.location.search) || encodeSplit(split) !== encodeSplit(DEFAULT_SPLIT)) window.history.replaceState(null, "", url);
    setLink(window.location.origin + url);
    setCopied("idle");
  }, [split]);

  const { rate, invoice } = totals(split);
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
          <h3 className="md-title-large">{t.build}</h3>
          <p className="md-body-medium mt-1 text-on-surface-variant">{t.buildBody}</p>
          <p className="md-body-medium mt-2">{t.streamsNote}</p>
          <md-chip-set class="mt-4" aria-label={t.presetLabel}>
            {PRESETS.map((p) => (
              <MdFilterChip key={p.id} label={d.presets[p.id]} selected={split.preset === p.id} onPick={() => update({ preset: p.id, rates: p.rates })} />
            ))}
          </md-chip-set>
          <ul className="mt-5 flex flex-col gap-3">
            {STREAMS.map((s) => (
              <li key={s.key} className={split.rates[s.key] === 0 ? "opacity-60" : undefined}>
                <div className="flex items-center justify-between gap-3">
                  <span className="md-label-large flex items-center gap-2">
                    <span className="size-3 shrink-0 rounded-full" style={{ background: s.color }} aria-hidden />
                    {d.streams[s.key].name}
                    <span className="md-body-medium hidden text-on-surface-variant sm:inline">· {d.streams[s.key].who}</span>
                  </span>
                  <span className="figure md-body-medium shrink-0 whitespace-nowrap">{fmt(t.perHour, { amount: money(split.rates[s.key]) })}</span>
                </div>
                <MdSlider label={fmt(t.sliderLabel, { name: d.streams[s.key].name })} min={0} max={rateMax(s.key)} step={1} value={split.rates[s.key]}
                  valueLabel={`$${split.rates[s.key]}`} onValue={(v) => setOne(s.key, v)} />
              </li>
            ))}
          </ul>
        </div>

        <div className="md-card p-6 lg:sticky lg:top-6 lg:self-start">
          <md-elevation />
          <h3 className="md-title-large">{fmt(t.whereGoes, { amount: money(invoice) })}</h3>
          <p className="md-body-medium mt-1 text-on-surface-variant">
            {fmt(t.summary, { hours: split.hours, rate: money(rate), amount: money(invoice), shares: slices(split, d.streams) })}
          </p>
          <div className="mt-4"><SplitBar rates={split.rates} /></div>
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="md-label-large">{t.hours}</span>
              <span className="figure md-body-medium">{fmt(t.hoursValue, { hours: split.hours })}</span>
            </div>
            <MdSlider label={t.hours} min={HOURS.min} max={HOURS.max} step={HOURS.step} value={split.hours}
              valueLabel={`${split.hours}`} onValue={(v) => update({ hours: v })} />
          </div>
          <ul className="mt-2" aria-live="polite">
            {STREAMS.filter((s) => split.rates[s.key] > 0).map((s, i) => {
              const share = split.rates[s.key] * split.hours;
              return (
                <li key={s.key}>
                  {i > 0 && <md-divider />}
                  <div className="md-body-medium flex items-center justify-between gap-3 py-2.5">
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: s.color }} aria-hidden />
                      {d.streams[s.key].name}
                    </span>
                    <span className="figure">{money(share)}</span>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 rounded-xl bg-primary-container p-4 text-on-primary-container">
            <p className="md-title-medium">{t.shareTitle}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <MdButton icon={copied === "done" ? "check" : "link"} onClick={share}>{copied === "done" ? t.copied : t.send}</MdButton>
              <span role="status" className="md-body-medium">{copied === "done" ? t.copiedNote : ""}</span>
            </div>
            {copied === "manual" && (
              <div className="mt-3">
                <label htmlFor="share-link" className="md-body-medium">{t.copyLabel}</label>
                <input id="share-link" readOnly value={link} autoFocus onFocus={(e) => e.currentTarget.select()}
                  className="figure mt-1 w-full rounded-md border border-outline bg-surface px-2 py-2 text-xs text-on-surface" />
              </div>
            )}
            <p className="md-label-medium mt-3 opacity-80">{t.linkNote}</p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <MdButton kind="text" icon="restart_alt" onClick={() => setSplit(DEFAULT_SPLIT)}>{t.reset}</MdButton>
            <p className="md-label-medium text-on-surface-variant">{t.exampleNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Receipt({ split, invite, ref }: { split: SplitState; invite: string; ref: React.Ref<HTMLDivElement> }) {
  const { d } = useI18n();
  const r = d.receipt;
  const { rate, invoice } = totals(split);
  return (
    <div ref={ref} className="md-card-filled scroll-mt-24 p-6 sm:p-8">
      <p className="md-label-large text-primary">{r.eyebrow}</p>
      <h3 className="md-headline-small mt-1">{r.title}</h3>
      <p className="md-body-large mt-2 text-on-surface-variant">
        {rich(r.body, { amount: <b className="text-on-surface">{money(invoice)}</b>, hours: split.hours, rate: money(rate), shares: slices(split, d.streams) })}
      </p>
      <div className="mt-4"><SplitBar rates={split.rates} height={28} /></div>
      <dl className="mt-4">
        {STREAMS.filter((s) => split.rates[s.key] > 0).map((s) => (
          <div key={s.key}>
            <div className="md-body-medium flex items-center justify-between gap-3 py-2">
              <dt className="flex items-center gap-2">
                <span className="size-2.5 rounded-full" style={{ background: s.color }} aria-hidden />
                {d.streams[s.key].name} <span className="hidden text-on-surface-variant sm:inline">· {d.streams[s.key].who}</span>
              </dt>
              <dd className="figure">{money(split.rates[s.key] * split.hours)}</dd>
            </div>
            <md-divider />
          </div>
        ))}
        <div className="md-title-medium flex items-center justify-between gap-3 py-2">
          <dt>{r.total}</dt>
          <dd className="figure">{money(invoice)}</dd>
        </div>
      </dl>
      <p className="md-label-medium mt-2 text-on-surface-variant"><b className="text-on-surface">{r.never}</b> {r.example}</p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <MdButton href={invite} external icon="arrow_forward" trailingIcon>{r.cta}</MdButton>
        <span className="md-body-medium text-on-surface-variant">{r.tweak}</span>
      </div>
    </div>
  );
}
