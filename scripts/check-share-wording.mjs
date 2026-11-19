// Every stream amount is a share of the contractor's billed hour, never a wage of its own (Rod 11/18: "Recruiter: $5/hr"
// read like the recruiter's hourly pay). Fails the build on an amount shown per hour without "billed" (EN) or
// "facturad" (ES) in the same sentence, or on "dollars per hour" / "hourly stream" style wording.
// Usage: node scripts/check-share-wording.mjs src/i18n/en.json src/i18n/es.json [more files or dirs of .tsx]
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const AMOUNT = String.raw`(?:\{(?:amount|rate)\}|\$\s?\d[\d,.]*)`;
const PER_HOUR = String.raw`(?:\s*\/\s*h(?:r|ora)?\b|\s+(?:an|a|per|each)\s+hour\b|\s+(?:por|la|cada)\s+hora\b)`;
const perHour = new RegExp(AMOUNT + PER_HOUR, "gi");
const wage = /\b(?:dollars per hour|hourly (?:stream|share|rate) of|per-hour revenue stream|d[oó]lares por hora)\b/gi;
const anchored = /billed|factur/i;

const bad = [];
function check(file, where, text) {
  for (const sentence of text.split(/(?<=[.!?:;])\s+/)) {
    for (const m of sentence.matchAll(perHour)) if (!anchored.test(sentence)) bad.push(`${file}: ${where}: "${m[0]}" reads like an hourly wage (anchor it to the billed hour)`);
    for (const m of sentence.matchAll(wage)) bad.push(`${file}: ${where}: "${m[0]}" reads like an hourly wage`);
  }
}
function walkJson(file, node, path) {
  if (typeof node === "string") check(file, path, node);
  else if (Array.isArray(node)) node.forEach((v, i) => walkJson(file, v, `${path}[${i}]`));
  else if (node && typeof node === "object") for (const [k, v] of Object.entries(node)) walkJson(file, v, path ? `${path}.${k}` : k);
}
function scan(p) {
  if (statSync(p).isDirectory()) return readdirSync(p).forEach((f) => scan(join(p, f)));
  if (p.endsWith(".json")) walkJson(p, JSON.parse(readFileSync(p, "utf8")), "");
  else if (p.endsWith(".tsx")) readFileSync(p, "utf8").split("\n").forEach((line, i) => {
    // Only text the page shows: JSX text and string literals, not code comments.
    if (!/^\s*(\/\/|\*|\/\*)/.test(line)) check(p, `line ${i + 1}`, line);
  });
}
process.argv.slice(2).forEach(scan);
if (bad.length) { console.error(bad.join("\n")); process.exit(1); }
console.log("share wording OK");
