import { PRESETS, STREAMS, type Rates } from "@/lib/streams";

export type SplitState = { preset: string; rates: Rates; hours: number; refund: boolean };

export const DEFAULT_SPLIT: SplitState = { preset: PRESETS[2].id, rates: PRESETS[2].rates, hours: 80, refund: false };

export const HOURS = { min: 10, max: 200, step: 5 };
export const rateMax = (key: string) => (key === "contractor" ? 150 : 40);

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

// Query string: ?p=<preset|custom>&r=<9 comma-separated $/h>&h=<hours>&d=1
export function encodeSplit(s: SplitState): string {
  const preset = /^[a-z]+$/.test(s.preset) ? s.preset : "custom";
  const rates = STREAMS.map((x) => Math.round(s.rates[x.key])).join(",");
  return `p=${preset}&r=${rates}&h=${Math.round(s.hours)}${s.refund ? "&d=1" : ""}`;
}

/** Returns null unless the query holds a complete, valid split. Every number is clamped. */
export function decodeSplit(search: string): SplitState | null {
  const q = new URLSearchParams(search);
  const parts = (q.get("r") ?? "").split(",");
  if (parts.length !== STREAMS.length) return null;
  const nums = parts.map((v) => (/^\d{1,4}$/.test(v) ? Number(v) : NaN));
  if (nums.some(Number.isNaN)) return null;
  const rates = Object.fromEntries(STREAMS.map((x, i) => [x.key, clamp(nums[i], 0, rateMax(x.key))])) as Rates;
  if (STREAMS.every((x) => rates[x.key] === 0)) return null;
  const h = Number(q.get("h"));
  const hours = Number.isFinite(h) ? clamp(Math.round(h / HOURS.step) * HOURS.step, HOURS.min, HOURS.max) : DEFAULT_SPLIT.hours;
  const named = PRESETS.find((p) => p.id === q.get("p") && STREAMS.every((x) => p.rates[x.key] === rates[x.key]));
  return { preset: named ? named.id : "custom", rates, hours, refund: q.get("d") === "1" };
}
