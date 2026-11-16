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

export type Stream = {
  key: StreamKey;
  name: string;
  who: string;
  blurb: string;
  color: string;
};

export const STREAMS: Stream[] = [
  { key: "contractor", name: "Contractor", who: "Does the work", blurb: "The person on the keyboard. Their rate is locked on the contract.", color: "var(--s-contractor)" },
  { key: "recruiter", name: "Recruiter", who: "Found the contractor", blurb: "Whoever brought the talent in keeps earning while that talent bills.", color: "var(--s-recruiter)" },
  { key: "recruiting", name: "Recruiting agency", who: "The recruiter's firm", blurb: "Their shop gets its own line, paid straight to it.", color: "var(--s-recruiting)" },
  { key: "marketer", name: "Marketer", who: "Brought the client", blurb: "Referral partners earn a cut of every hour the client they sent pays for.", color: "var(--s-marketer)" },
  { key: "marketing", name: "Marketing agency", who: "The marketer's firm", blurb: "Agencies that send you work get paid like partners, not with a thank-you note.", color: "var(--s-marketing)" },
  { key: "pm", name: "Project manager", who: "Keeps the work moving", blurb: "Coordination is work too. It gets its own line.", color: "var(--s-pm)" },
  { key: "am", name: "Account manager", who: "Keeps the client happy", blurb: "Owns the relationship and earns from it, hour by hour.", color: "var(--s-am)" },
  { key: "agency", name: "Your agency", who: "Your margin", blurb: "What's left for the business, without spreadsheet surgery.", color: "var(--s-agency)" },
  { key: "system", name: "AgencyPro", who: "The platform fee", blurb: "Our cut, shown as its own line. No hidden spread.", color: "var(--s-system)" },
];

export type Rates = Record<StreamKey, number>;

export const PRESETS: { id: string; label: string; rates: Rates }[] = [
  {
    id: "referral",
    label: "Referral deal",
    rates: { contractor: 80, recruiter: 0, recruiting: 0, marketer: 6, marketing: 0, pm: 0, am: 5, agency: 25, system: 9 },
  },
  {
    id: "bench",
    label: "Agency + contractors",
    rates: { contractor: 70, recruiter: 6, recruiting: 4, marketer: 0, marketing: 0, pm: 10, am: 6, agency: 30, system: 9 },
  },
  {
    id: "everyone",
    label: "The full stack",
    rates: { contractor: 75, recruiter: 5, recruiting: 3, marketer: 5, marketing: 3, pm: 9, am: 6, agency: 26, system: 8 },
  },
];

export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
