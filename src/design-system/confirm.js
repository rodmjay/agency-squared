export const STRINGS = {
  en: {
    action: "Delete", cancel: "Cancel", code_label: "6-digit code",
    window_days: "You can restore it for {days} days. After that it's gone for good.",
    window_none: "This can't be undone.",
    sent: "To make sure it's on purpose, enter the 6-digit code we sent to {to}.",
    resend: "Send a new code", resend_in: "New code in {s}s", resent: "We sent a new code.",
    wrong_plain: "That code doesn't match.", wrong: "That code doesn't match. {n} tries left.", wrong_one: "That code doesn't match. 1 try left.",
    expired: "That code expired. Send a new one.", locked: "Too many tries. Try again in {m} minutes.",
    checking: "Checking…",
  },
  es: {
    action: "Eliminar", cancel: "Cancelar", code_label: "Código de 6 dígitos",
    window_days: "Puedes restaurarlo durante {days} días. Después se borra para siempre.",
    window_none: "Esto no se puede deshacer.",
    sent: "Para asegurarnos de que es a propósito, escribe el código de 6 dígitos que enviamos a {to}.",
    resend: "Enviar un código nuevo", resend_in: "Código nuevo en {s} s", resent: "Enviamos un código nuevo.",
    wrong_plain: "Ese código no coincide.", wrong: "Ese código no coincide. Te quedan {n} intentos.", wrong_one: "Ese código no coincide. Te queda 1 intento.",
    expired: "Ese código venció. Pide uno nuevo.", locked: "Demasiados intentos. Vuelve a intentarlo en {m} minutos.",
    checking: "Verificando…",
  },
};

const ICON = '<svg class="ds-dialog-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 21h20L12 3z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 10v4.5M12 17.5v.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const fill = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => (v && k in v ? v[k] : ""));
let seq = 0;

export function confirmCode(opts = {}) {
  const lang = (opts.lang || document.documentElement.lang || "en").toLowerCase().startsWith("es") ? "es" : "en";
  const S = Object.assign({}, STRINGS[lang], opts.strings);
  const t = (k, v) => fill(S[k], v);
  const id = "ds-confirm-" + ++seq;
  const resendAfter = opts.resendAfter ?? 30;

  const dlg = document.createElement("dialog");
  dlg.className = "ds-dialog ds-confirm";
  dlg.setAttribute("aria-labelledby", id + "-h");
  dlg.setAttribute("aria-describedby", id + "-d");
  dlg.innerHTML =
    `<form method="dialog" class="ds-dialog-body" novalidate>${ICON}<h2 id="${id}-h">${esc(opts.title || "")}</h2>` +
    `<div id="${id}-d" style="display:grid;gap:var(--space-3)">` +
    (opts.lost && opts.lost.length ? `<ul class="ds-confirm-lost">${opts.lost.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : "") +
    `<p class="ds-confirm-window">${esc(opts.restoreDays ? t("window_days", { days: opts.restoreDays }) : t("window_none"))}</p>` +
    `<p>${esc(t("sent", { to: opts.sentTo || "" }))}</p></div>` +
    `<div class="ds-code"><label for="${id}-c">${esc(t("code_label"))}</label>` +
    `<div class="ds-code-field"><input id="${id}-c" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]*" maxlength="6" aria-describedby="${id}-m">` +
    `<span></span><span></span><span></span><span></span><span></span><span></span></div>` +
    `<p class="ds-code-msg" id="${id}-m" aria-live="polite"></p>` +
    `<button type="button" class="ds-code-resend"></button></div>` +
    `<div class="ds-dialog-actions"><button type="button" class="ds-btn text" value="cancel">${esc(t("cancel"))}</button>` +
    `<button type="submit" class="ds-btn error" disabled>${esc(opts.action || t("action"))}</button></div></form>`;
  document.body.appendChild(dlg);

  const form = dlg.querySelector("form"), input = dlg.querySelector("input"), field = dlg.querySelector(".ds-code-field");
  const slots = [...field.querySelectorAll("span")], msg = dlg.querySelector(".ds-code-msg");
  const resendBtn = dlg.querySelector(".ds-code-resend"), go = dlg.querySelector('[type="submit"]');
  let locked = false, busy = false, timer = null;

  function say(text, isError) { msg.textContent = text || ""; msg.classList.toggle("error", !!isError); field.classList.toggle("invalid", !!isError); input.setAttribute("aria-invalid", isError ? "true" : "false"); }
  function draw() {
    const v = input.value;
    slots.forEach((s, i) => { s.textContent = v[i] || ""; s.classList.toggle("next", i === Math.min(v.length, 5)); });
    go.disabled = locked || busy || v.length !== 6;
  }
  function countdown(sec) {
    clearInterval(timer);
    let left = sec;
    const tick = () => { resendBtn.disabled = locked || left > 0; resendBtn.textContent = left > 0 ? t("resend_in", { s: left }) : t("resend"); left--; if (left < -1) clearInterval(timer); };
    tick(); timer = setInterval(tick, 1000);
  }
  function lock(minutes) { locked = true; clearInterval(timer); input.value = ""; input.disabled = true; resendBtn.hidden = true; field.classList.add("disabled"); resendBtn.disabled = true; say(t("locked", { m: minutes || 15 }), true); draw(); }

  input.addEventListener("input", () => { input.value = input.value.replace(/\D/g, "").slice(0, 6); if (!locked) say(""); draw(); });
  resendBtn.addEventListener("click", async () => {
    if (locked) return;
    resendBtn.disabled = true;
    try { await (opts.resend ? opts.resend() : null); input.value = ""; draw(); say(t("resent")); countdown(resendAfter); input.focus(); }
    catch (e) { resendBtn.disabled = false; }
  });

  return new Promise((resolve) => {
    let result = false;
    const close = () => { clearInterval(timer); dlg.close(); };
    dlg.querySelector('[value="cancel"]').addEventListener("click", close);
    dlg.addEventListener("close", () => { dlg.remove(); resolve(result); });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (go.disabled) return;
      busy = true; draw(); say(t("checking"));
      let r;
      try { r = await (opts.verify ? opts.verify(input.value) : { ok: false, reason: "wrong", triesLeft: 0 }); }
      catch (err) { r = { ok: false, reason: "wrong" }; }
      busy = false;
      if (r && r.ok) { result = true; close(); return; }
      const reason = (r && r.reason) || "wrong";
      if (reason === "locked" || (reason === "wrong" && r.triesLeft === 0)) { lock(r.retryMinutes); return; }
      input.value = ""; draw();
      if (reason === "expired") { say(t("expired"), true); countdown(0); }
      else say(r.triesLeft === 1 ? t("wrong_one") : r.triesLeft != null ? t("wrong", { n: r.triesLeft }) : t("wrong_plain"), true);
      input.focus();
    });
    draw(); countdown(resendAfter);
    dlg.showModal();
    input.focus();
  });
}
