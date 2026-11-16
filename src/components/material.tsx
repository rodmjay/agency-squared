"use client";

// Google's Material Web components (@material/web). They're custom elements, so they load in the
// browser only; the static HTML renders their tags and they upgrade on load.
import { useEffect, useRef } from "react";

export function MaterialElements() {
  useEffect(() => {
    void Promise.all([
      import("@material/web/button/filled-button.js"),
      import("@material/web/button/filled-tonal-button.js"),
      import("@material/web/button/outlined-button.js"),
      import("@material/web/button/text-button.js"),
      import("@material/web/chips/chip-set.js"),
      import("@material/web/chips/filter-chip.js"),
      import("@material/web/divider/divider.js"),
      import("@material/web/elevation/elevation.js"),
      import("@material/web/icon/icon.js"),
      import("@material/web/slider/slider.js"),
      import("@material/web/switch/switch.js"),
      import("@material/web/textfield/outlined-text-field.js"),
    ]);
  }, []);
  return null;
}

/** Listens to a native event on a custom element (React doesn't wire these for us). */
function useElementEvent<T extends HTMLElement>(event: string, handler: (el: T) => void) {
  const ref = useRef<T>(null);
  const saved = useRef(handler);
  useEffect(() => { saved.current = handler; });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fn = () => saved.current(el);
    el.addEventListener(event, fn);
    return () => el.removeEventListener(event, fn);
  }, [event]);
  return ref;
}

type SliderEl = HTMLElement & { value: number };
type SwitchEl = HTMLElement & { selected: boolean };

export function MdSlider(props: {
  value: number; min: number; max: number; step: number; label: string; onValue: (v: number) => void; valueLabel?: string;
}) {
  const ref = useElementEvent<SliderEl>("input", (el) => props.onValue(Number(el.value)));
  useEffect(() => { if (ref.current && Number(ref.current.value) !== props.value) ref.current.value = props.value; }, [props.value, ref]);
  return (
    <md-slider ref={ref} min={props.min} max={props.max} step={props.step} value={props.value}
      labeled aria-label={props.label} value-label={props.valueLabel} />
  );
}

export function MdSwitch(props: { selected: boolean; id: string; onSelected: (v: boolean) => void }) {
  const ref = useElementEvent<SwitchEl>("change", (el) => props.onSelected(el.selected));
  useEffect(() => { if (ref.current) ref.current.selected = props.selected; }, [props.selected, ref]);
  return <md-switch ref={ref} id={props.id} icons selected={props.selected || undefined} />;
}

export function MdFilterChip(props: { label: string; selected: boolean; onPick: () => void }) {
  const ref = useElementEvent<SwitchEl>("click", () => props.onPick());
  useEffect(() => { if (ref.current) ref.current.selected = props.selected; }, [props.selected, ref]);
  return <md-filter-chip ref={ref} label={props.label} selected={props.selected || undefined} />;
}

export function MdButton(props: {
  kind?: "filled" | "tonal" | "outlined" | "text"; href?: string; external?: boolean; icon?: string; trailingIcon?: boolean;
  onClick?: () => void; children: React.ReactNode;
}) {
  const ref = useElementEvent<HTMLElement>("click", () => props.onClick?.());
  const Tag = ({ filled: "md-filled-button", tonal: "md-filled-tonal-button", outlined: "md-outlined-button", text: "md-text-button" } as const)[props.kind ?? "filled"];
  return (
    <Tag ref={ref} href={props.href} target={props.external ? "_blank" : undefined} rel={props.external ? "noopener" : undefined}
      trailing-icon={props.trailingIcon || undefined} has-icon={props.icon ? true : undefined}>
      {props.children}
      {props.icon && <md-icon slot="icon" aria-hidden="true">{props.icon}</md-icon>}
    </Tag>
  );
}
