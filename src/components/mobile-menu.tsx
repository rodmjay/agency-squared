"use client";

import { useEffect, useRef, useState } from "react";

export function MobileMenu({ links, label, navLabel }: { links: [string, string][]; label: string; navLabel: string }) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => !box.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); };
  }, [open]);

  return (
    <div ref={box} className="relative xl:hidden">
      <button type="button" aria-expanded={open} aria-controls="mobile-menu" aria-label={label} onClick={() => setOpen((o) => !o)}
        className="grid size-10 place-items-center rounded-full hover:bg-surface-high focus-visible:outline-2 focus-visible:outline-primary">
        <md-icon aria-hidden="true">{open ? "close" : "menu"}</md-icon>
      </button>
      {open && (
        <nav id="mobile-menu" aria-label={navLabel} className="md-card absolute right-0 top-12 z-50 w-56 py-2" style={{ ["--md-elevation-level" as string]: 3 }}>
          <md-elevation />
          {links.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}
              className="md-label-large relative block px-4 py-3 hover:bg-surface-high focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary">
              {label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}
