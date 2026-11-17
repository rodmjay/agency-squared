import { SiteShell, siteMetadata } from "@/components/site-shell";

export { viewport } from "@/components/site-shell";
export const metadata = siteMetadata("es");

export default function Layout({ children }: { children: React.ReactNode }) {
  return <SiteShell lang="es">{children}</SiteShell>;
}
