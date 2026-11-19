import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";

export { viewport } from "@/components/site-shell";
export const metadata: Metadata = {
  title: "AgencyPro",
  description: "AgencyPro runs at agency.squared.pro.",
  robots: { index: false, follow: false },
};

// The old demo address's own root layout: one static page in both languages.
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell lang="en" pickLang={false}>{children}</SiteShell>;
}
