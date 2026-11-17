// Writes a public copy of the design system build: comments and package headers removed, agency brand only.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [from, to] = process.argv.slice(2);
const read = (f) => readFileSync(join(from, f), "utf8");
const blockComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, "");
const lineComments = (s) => s.split("\n").filter((l) => !/^\s*\/\/(?!\/)/.test(l) || l.startsWith("#!")).join("\n");
const tidy = (s) => s.replace(/[ \t]+$/gm, "").replace(/\n{3,}/g, "\n\n").trimStart();

// Brand blocks look like "/* Brand: … */\n<selector> {\n…\n}". Keep agency's, on :root too.
const tokens = read("tokens.css").replace(/\/\* Brand: [^*]*\*\/\n([^{]*)\{[^}]*\}\n?/g, (block, sel) =>
  sel.includes('"agency"') ? block.replace(sel, ':root,\n[data-brand="agency"] ') : "");

const out = {
  "tokens.css": tidy(blockComments(tokens)),
  "tailwind.css": tidy(blockComments(read("tailwind.css"))),
  "i18n.js": tidy(lineComments(blockComments(read("i18n.js")))),
  "check-i18n.mjs": tidy(lineComments(blockComments(read("check-i18n.mjs")))),
};
for (const [f, body] of Object.entries(out)) {
  if (/@[\w-]+\/design-system|data-brand="(?!agency")/.test(body)) throw new Error(`${f}: still has a package header or another brand`);
  writeFileSync(join(to, f), body);
}
console.log(`design system copied (stripped, agency only) into ${to}`);
