"use client";

// Small React wrappers over Material Web (Material 3) for the agency app: fields, selects, dialogs, tabs, checkboxes,
// status chips and the snackbar. Colors and type come from the design system's roles only.
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Kind } from "./model";

export function useLoadMaterial() {
  useEffect(() => {
    void Promise.all([
      import("@material/web/button/filled-button.js"),
      import("@material/web/button/filled-tonal-button.js"),
      import("@material/web/button/outlined-button.js"),
      import("@material/web/button/text-button.js"),
      import("@material/web/iconbutton/icon-button.js"),
      import("@material/web/icon/icon.js"),
      import("@material/web/textfield/outlined-text-field.js"),
      import("@material/web/select/outlined-select.js"),
      import("@material/web/select/select-option.js"),
      import("@material/web/dialog/dialog.js"),
      import("@material/web/tabs/tabs.js"),
      import("@material/web/tabs/primary-tab.js"),
      import("@material/web/checkbox/checkbox.js"),
      import("@material/web/divider/divider.js"),
      import("@material/web/chips/chip-set.js"),
      import("@material/web/chips/filter-chip.js"),
    ]);
  }, []);
}

/** A native event on a custom element, with the latest handler. */
function useEl<T extends HTMLElement>(event: string, handler: (el: T, e: Event) => void) {
  const ref = useRef<T>(null);
  const saved = useRef(handler);
  useEffect(() => { saved.current = handler; });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fn = (e: Event) => saved.current(el, e);
    el.addEventListener(event, fn);
    return () => el.removeEventListener(event, fn);
  }, [event]);
  return ref;
}

type Valued = HTMLElement & { value: string };

export function Btn(props: {
  kind?: "filled" | "tonal" | "outlined" | "text"; icon?: string; onClick?: () => void; disabled?: boolean;
  type?: "button" | "submit"; children: ReactNode; label?: string;
}) {
  const ref = useEl<HTMLElement>("click", () => { if (!props.disabled) props.onClick?.(); });
  const Tag = ({ filled: "md-filled-button", tonal: "md-filled-tonal-button", outlined: "md-outlined-button", text: "md-text-button" } as const)[props.kind ?? "filled"];
  return (
    <Tag ref={ref} disabled={props.disabled || undefined} type={props.type} has-icon={props.icon ? true : undefined}
      aria-label={props.label}>
      {props.children}
      {props.icon && <md-icon slot="icon" aria-hidden="true">{props.icon}</md-icon>}
    </Tag>
  );
}

export function IconBtn({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  const ref = useEl<HTMLElement>("click", () => onClick());
  return <md-icon-button ref={ref} aria-label={label} title={label}><md-icon aria-hidden="true">{icon}</md-icon></md-icon-button>;
}

export function Field(props: {
  label: string; value: string; onValue: (v: string) => void; type?: string; required?: boolean; prefix?: string; suffix?: string;
  min?: number; max?: number; step?: number | string; supporting?: string; autoFocus?: boolean; name?: string; autocomplete?: string;
}) {
  const ref = useEl<Valued>("input", (el) => props.onValue(el.value));
  useEffect(() => { if (ref.current && ref.current.value !== props.value) ref.current.value = props.value; }, [props.value, ref]);
  return (
    <md-outlined-text-field ref={ref} label={props.label} type={props.type ?? "text"} required={props.required || undefined}
      prefix-text={props.prefix} suffix-text={props.suffix} min={props.min} max={props.max} step={props.step}
      supporting-text={props.supporting} autofocus={props.autoFocus || undefined} name={props.name}
      autocomplete={props.autocomplete} class="w-full"
      // Material text fields don't submit their form on Enter the way a plain input does.
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => { if (e.key === "Enter") { e.preventDefault(); e.currentTarget.closest("form")?.requestSubmit(); } }} />
  );
}

export function Select(props: { label: string; value: string; onValue: (v: string) => void; options: { value: string; label: string }[]; required?: boolean }) {
  const ref = useEl<Valued>("change", (el) => props.onValue(el.value));
  useEffect(() => { if (ref.current && ref.current.value !== props.value) ref.current.value = props.value; }, [props.value, props.options, ref]);
  return (
    <md-outlined-select ref={ref} label={props.label} required={props.required || undefined} menu-positioning="fixed" class="w-full">
      {props.options.map((o) => (
        <md-select-option key={o.value} value={o.value} selected={o.value === props.value || undefined}>
          <div slot="headline">{o.label}</div>
        </md-select-option>
      ))}
    </md-outlined-select>
  );
}

export function Check({ checked, label, onChange }: { checked: boolean; label: string; onChange: (v: boolean) => void }) {
  const ref = useEl<HTMLElement & { checked: boolean }>("change", (el) => onChange(el.checked));
  useEffect(() => { if (ref.current) ref.current.checked = checked; }, [checked, ref]);
  return <md-checkbox ref={ref} touch-target="wrapper" aria-label={label} checked={checked || undefined} />;
}

/** A Material dialog that opens when mounted. The form inside submits with Enter; Cancel closes it. */
export function Dialog(props: {
  title: string; onClose: () => void; onSubmit: () => void; submit: string; cancel: string; children: ReactNode; wide?: boolean;
}) {
  const ref = useEl<HTMLElement & { show(): void; close(): void }>("closed", () => props.onClose());
  useEffect(() => { void customElements.whenDefined("md-dialog").then(() => ref.current?.show()); }, [ref]);
  const formId = useId();
  return (
    <md-dialog ref={ref} class={props.wide ? "dialog-wide" : undefined}>
      <div slot="headline">{props.title}</div>
      <form slot="content" id={formId} method="dialog" className="flex flex-col gap-4 pt-1"
        onSubmit={(e) => { e.preventDefault(); props.onSubmit(); }}>
        {props.children}
      </form>
      <div slot="actions">
        <Btn kind="text" onClick={() => ref.current?.close()}>{props.cancel}</Btn>
        <Btn kind="filled" onClick={() => (document.getElementById(formId) as HTMLFormElement | null)?.requestSubmit()}>{props.submit}</Btn>
      </div>
    </md-dialog>
  );
}

export function Tabs({ tabs, active, onPick, label }: { tabs: string[]; active: number; onPick: (i: number) => void; label: string }) {
  const ref = useEl<HTMLElement & { activeTabIndex: number }>("change", (el) => onPick(el.activeTabIndex));
  useEffect(() => { if (ref.current && ref.current.activeTabIndex !== active) ref.current.activeTabIndex = active; }, [active, ref]);
  return (
    <md-tabs ref={ref} aria-label={label}>
      {tabs.map((t, i) => <md-primary-tab key={t} active={i === active || undefined}>{t}</md-primary-tab>)}
    </md-tabs>
  );
}

export function FilterChip({ label, selected, onPick }: { label: string; selected: boolean; onPick: () => void }) {
  const ref = useEl<HTMLElement & { selected: boolean }>("click", (el) => { el.selected = selected; onPick(); });
  useEffect(() => { if (ref.current) ref.current.selected = selected; }, [selected, ref]);
  return <md-filter-chip ref={ref} label={label} selected={selected || undefined} />;
}

export type Tone = "neutral" | "waiting" | "good" | "info" | "bad";
const TONES: Record<Tone, string> = {
  neutral: "bg-surface-container-highest text-on-surface-variant",
  waiting: "chip-warning",
  good: "chip-success",
  info: "bg-secondary-container text-on-secondary-container",
  bad: "bg-error-container text-on-error-container",
};

export function Chip({ tone, children }: { tone: Tone; children: ReactNode }) {
  return <span className={`md-label-medium inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-md px-2 ${TONES[tone]}`}>{children}</span>;
}

/** Person or AI agent: the same seat, one small badge. */
export function KindBadge({ kind, label }: { kind: Kind; label: string }) {
  return (
    <span className={`md-label-small inline-flex h-5 shrink-0 items-center gap-1 rounded-full px-2 ${kind === "agent" ? "bg-tertiary-container text-on-tertiary-container" : "bg-surface-container-highest text-on-surface-variant"}`}>
      <md-icon aria-hidden="true" class="icon-14">{kind === "agent" ? "smart_toy" : "person"}</md-icon>{label}
    </span>
  );
}

/** Round initials for a person; a robot for an agent. */
export function Avatar({ name, kind }: { name: string; kind: Kind }) {
  const initials = name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span aria-hidden="true" className={`md-label-large flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${kind === "agent" ? "bg-tertiary-container text-on-tertiary-container" : "bg-primary-container text-on-primary-container"}`}>
      {kind === "agent" ? <md-icon>smart_toy</md-icon> : initials}
    </span>
  );
}

/** The snackbar: one short message at the bottom, gone after a few seconds. */
export function useToast() {
  const [msg, setMsg] = useState<{ text: string; error?: boolean; n: number } | null>(null);
  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 5000);
    return () => clearTimeout(t);
  }, [msg]);
  const show = (text: string, error = false) => setMsg((m) => ({ text, error, n: (m?.n ?? 0) + 1 }));
  const node = (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      {msg && (
        <p key={msg.n} role={msg.error ? "alert" : "status"}
          className={`md-body-medium pointer-events-auto max-w-xl rounded-md px-4 py-3.5 shadow-level3 ${msg.error ? "bg-error-container text-on-error-container" : "bg-inverse-surface text-inverse-on-surface"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
  return { show, node };
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-outline-variant bg-surface p-4 sm:p-5 ${className}`}>{children}</section>;
}

export function PageHead({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 max-w-2xl">
        <h1 className="md-headline-medium">{title}</h1>
        {body && <p className="md-body-large mt-2 text-on-surface-variant">{body}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="md-body-large rounded-xl bg-surface-container-low px-4 py-8 text-center text-on-surface-variant">{children}</p>;
}
