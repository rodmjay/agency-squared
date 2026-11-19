import type { Metadata } from "next";
import { SiteShell } from "@/components/site-shell";

export { viewport } from "@/components/site-shell";
export const metadata: Metadata = {
  title: "AgencyPro demo",
  description: "A demo agency with made-up people, agents and clients.",
  robots: { index: false, follow: false },
};

// The demo app's own root layout: one static page, language chosen in the browser (no redirect to the home page).
export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell lang="en" pickLang={false}>{children}</SiteShell>;
}
