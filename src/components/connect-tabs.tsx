"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/components/i18n";

const TABS = [
  { id: "claude", label: "tabClaude", icon: "forum" },
  { id: "api", label: "tabApi", icon: "code" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const apiSample = (instructions: string, doc: string) => `POST /human-steps
Idempotency-Key: 7f3c…

{
  "projectId": "prj_acme_yearend",
  "type": "cpa_review",
  "jurisdiction": "US-UT",
  "instructions": "${instructions}",
  "dueAt": "2026-12-04T17:00:00Z",
  "inputs": [{
    "kind": "document",
    "name": "${doc}",
    "url": "https://…/reconciliation.pdf",
    "sha256": "9f2c…"
  }]
}

→ 202 Accepted  { "id": "hs_91…", "status": "Queued" }`;

export function ConnectTabs() {
  const { d } = useI18n();
  const [tab, setTab] = useState<Tab>("claude");
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: React.KeyboardEvent, i: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = (i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length;
    setTab(TABS[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div className="md-card-outlined overflow-hidden bg-surface">
      <div role="tablist" aria-label={d.connect.tabs} className="flex border-b border-outline-variant">
        {TABS.map((t, i) => (
          <button key={t.id} ref={(el) => { refs.current[i] = el; }} role="tab" id={`tab-${t.id}`} aria-controls={`panel-${t.id}`}
            aria-selected={tab === t.id} tabIndex={tab === t.id ? 0 : -1} onClick={() => setTab(t.id)} onKeyDown={(e) => onKey(e, i)}
            className={`md-title-medium flex flex-1 items-center justify-center gap-2 border-b-[3px] px-4 py-3 transition-colors focus-visible:outline-2 focus-visible:outline-primary ${tab === t.id ? "border-primary text-primary" : "border-transparent text-on-surface-variant hover:bg-surface-high"}`}>
            <md-icon aria-hidden="true">{t.icon}</md-icon>{d.connect[t.label]}
          </button>
        ))}
      </div>

      {tab === "claude" ? (
        <div role="tabpanel" id="panel-claude" aria-labelledby="tab-claude" className="flex flex-col gap-3 p-5 sm:p-6">
          <div className="md-body-large self-end rounded-2xl rounded-br-md bg-secondary-container px-4 py-2.5 text-on-secondary-container sm:max-w-[80%]">
            {d.connect.ask}
          </div>
          <div className="figure md-label-medium flex items-center gap-2 self-start rounded-lg bg-surface-high px-3 py-2 text-on-surface-variant">
            <md-icon aria-hidden="true" style={{ ["--md-icon-size" as string]: "16px" }}>build</md-icon>
            agencypro · log_time(contractId: &quot;ctr_…&quot;, hours: 1.5)
          </div>
          <div className="md-body-large self-start rounded-2xl rounded-bl-md bg-surface-high px-4 py-2.5 sm:max-w-[80%]">
            {d.connect.reply}
          </div>
          <p className="md-label-medium mt-1 text-on-surface-variant">{d.connect.example}</p>
        </div>
      ) : (
        <div role="tabpanel" id="panel-api" aria-labelledby="tab-api" className="p-5 sm:p-6">
          <pre className="figure overflow-x-auto rounded-xl bg-inverse-surface p-4 text-[13px] leading-relaxed text-inverse-on-surface"><code>{apiSample(d.connect.apiInstructions, d.connect.apiDoc)}</code></pre>
          <p className="md-label-medium mt-3 text-on-surface-variant">{d.connect.apiNote}</p>
        </div>
      )}
    </div>
  );
}
