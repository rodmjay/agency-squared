import { MdButton } from "@/components/material";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-start justify-center gap-4 px-4 py-24 sm:px-6">
      <p className="md-label-large text-primary">Page not found</p>
      <h1 className="md-display-medium">This step didn&apos;t clear.</h1>
      <p className="md-body-large text-on-surface-variant">The page you&apos;re looking for isn&apos;t here. Nothing is owed.</p>
      <MdButton href={`${process.env.PAGES_BASE_PATH ?? ""}/`} icon="home">Back to AgencyPro</MdButton>
    </main>
  );
}
