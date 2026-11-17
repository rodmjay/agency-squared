export type StreamKey =
  | "contractor"
  | "recruiter"
  | "recruiting"
  | "marketer"
  | "marketing"
  | "pm"
  | "am"
  | "agency"
  | "system";

// Names and descriptions are in the dictionary (src/i18n, streams.<key>).
export type Stream = { key: StreamKey; color: string };

export const STREAMS: Stream[] = [
  { key: "contractor", color: "var(--s-contractor)" },
  { key: "recruiter", color: "var(--s-recruiter)" },
  { key: "recruiting", color: "var(--s-recruiting)" },
  { key: "marketer", color: "var(--s-marketer)" },
  { key: "marketing", color: "var(--s-marketing)" },
  { key: "pm", color: "var(--s-pm)" },
  { key: "am", color: "var(--s-am)" },
  { key: "agency", color: "var(--s-agency)" },
  { key: "system", color: "var(--s-system)" },
];

export type Rates = Record<StreamKey, number>;

// Labels: presets.<id> in the dictionary.
export const PRESETS: { id: "referral" | "bench" | "everyone"; rates: Rates }[] = [
  {
    id: "referral",
    rates: { contractor: 80, recruiter: 0, recruiting: 0, marketer: 6, marketing: 0, pm: 0, am: 5, agency: 25, system: 9 },
  },
  {
    id: "bench",
    rates: { contractor: 70, recruiter: 6, recruiting: 4, marketer: 0, marketing: 0, pm: 10, am: 6, agency: 30, system: 9 },
  },
  {
    id: "everyone",
    rates: { contractor: 75, recruiter: 5, recruiting: 3, marketer: 5, marketing: 3, pm: 9, am: 6, agency: 26, system: 8 },
  },
];

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
