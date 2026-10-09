#!/usr/bin/env node
/**
 * Build README tables from data/vaults.json and data/resources.json.
 *
 * Source of truth: data/*.json (LF, UTF-8).
 * Generated artifacts: Markdown tables and heading counts in README.md.
 *
 * No dependencies (Node stdlib only). Runs in CI via:
 *   node scripts/build-readme.mjs --check
 *
 * Usage: node scripts/build-readme.mjs [--check]
 *   --check: exit 1 if README.md is out of date (for CI/PRs).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const README = join(ROOT, "README.md");
const VAULTS_JSON = join(ROOT, "data", "vaults.json");
const RESOURCES_JSON = join(ROOT, "data", "resources.json");
const SHOWCASES_JSON = join(ROOT, "data", "showcases.json");

// Display order of vault categories (matches TAXONOMY.md / README).
const VAULT_CATEGORY_ORDER = [
  "Digital Gardens & Publishing",
  "Documentation & Knowledge",
  "Food & Lifestyle",
  "Knowledge Bases & Wiki Vaults",
  "Personal Websites & Indie Web",
  "Programming & Software",
  "Sample Vaults & Templates",
  "Science & Research",
  "Web Directories & Media",
];

const RESOURCE_CATEGORY_ORDER = [
  "Cheat Sheets and Miscellaneous",
  "Dictionaries and Language Resources",
  "Encyclopedia Resources",
];

/** Escape HTML text content. */
function esc(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Escape HTML attribute value (quotes included). */
function escAttr(text) {
  return esc(text).replace(/"/g, "&quot;");
}

function vaultLinksCell(v) {
  const parts = [];
  if (v.vault) parts.push(`<a href="${escAttr(v.vault)}">vault</a>`);
  if (v.web) parts.push(`<a href="${escAttr(v.web)}">web</a>`);
  return parts.join(" / ");
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function assertUrl(url, where) {
  if (typeof url !== "string" || !/^https?:\/\//.test(url)) {
    throw new Error(`bad URL ${JSON.stringify(url)} in ${where}`);
  }
}

function validateVaults(vaults) {
  const seen = new Set();
  for (const v of vaults) {
    for (const key of ["category", "name", "vault", "web", "star"]) {
      if (!(key in v)) throw new Error(`vault entry missing ${key}: ${JSON.stringify(v)}`);
    }
    if (!VAULT_CATEGORY_ORDER.includes(v.category)) {
      throw new Error(`unknown category ${JSON.stringify(v.category)}`);
    }
    if (v.vault == null && v.web == null) {
      throw new Error(`entry needs at least one link: ${v.category} / ${v.name}`);
    }
    if (v.vault != null) assertUrl(v.vault, `${v.category} / ${v.name}`);
    if (v.web != null) assertUrl(v.web, `${v.category} / ${v.name}`);
    const dup = `${v.category}\n${v.name.toLowerCase()}\n${(v.author ?? "").toLowerCase()}`;
    if (seen.has(dup)) throw new Error(`duplicate entry: ${v.category} / ${v.name}`);
    seen.add(dup);
  }
}

function validateResources(resources) {
  for (const r of resources) {
    for (const key of ["category", "name", "links"]) {
      if (!(key in r)) throw new Error(`resource entry missing ${key}: ${JSON.stringify(r)}`);
    }
    if (!RESOURCE_CATEGORY_ORDER.includes(r.category)) {
      throw new Error(`unknown resource category ${JSON.stringify(r.category)}`);
    }
    if (!Array.isArray(r.links) || r.links.length === 0) {
      throw new Error(`resource has no links: ${r.name}`);
    }
    for (const l of r.links) assertUrl(l.url, r.name);
  }
}

function validateShowcases(showcases) {
  const seen = new Set();
  for (const s of showcases) {
    for (const key of ["name", "url"]) {
      if (!(key in s)) throw new Error(`showcase entry missing ${key}: ${JSON.stringify(s)}`);
    }
    assertUrl(s.url, s.name);
    if (seen.has(s.url)) throw new Error(`duplicate showcase: ${s.name}`);
    seen.add(s.url);
  }
}

function group(entries, order) {
  const grouped = new Map(order.map((c) => [c, []]));
  for (const e of entries) grouped.get(e.category).push(e);
  for (const list of grouped.values()) {
    list.sort((a, b) =>
      a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : 0,
    );
  }
  return [...grouped.entries()].filter(([, list]) => list.length > 0);
}

function vaultDisplay(v) {
  return v.author ? `${v.name} — ${v.author}` : v.name;
}

function renderVaultTable(grouped) {
  const lines = [
    '<table class="vault-table">',
    "  <thead>",
    "    <tr>",
    '      <th class="col-category">Category</th>',
    '      <th class="col-name">Name and author</th>',
    '      <th class="col-links">Links</th>',
    '      <th class="col-star">★</th>',
    "    </tr>",
    "  </thead>",
  ];
  for (const [cat, entries] of grouped) {
    lines.push("  <tbody>");
    lines.push('    <tr class="section-row">');
    lines.push(`      <th rowspan="${entries.length}" class="category-cell">${esc(cat)}</th>`);
    lines.push(`      <td>${esc(vaultDisplay(entries[0]))}</td>`);
    lines.push(`      <td>${vaultLinksCell(entries[0])}</td>`);
    lines.push(`      <td>${entries[0].star ? "✨" : ""}</td>`);
    lines.push("    </tr>");
    for (const v of entries.slice(1)) {
      lines.push(
        `    <tr><td>${esc(vaultDisplay(v))}</td><td>${vaultLinksCell(v)}</td><td>${v.star ? "✨" : ""}</td></tr>`,
      );
    }
    lines.push("  </tbody>");
  }
  lines.push("</table>");
  return lines.join("\n");
}

function resourceLinksCell(r) {
  return r.links.map((l) => `<a href="${escAttr(l.url)}">${esc(l.label)}</a>`).join(" / ");
}

function renderResourceTable(grouped) {
  const lines = [
    '<table class="vault-table">',
    "  <thead>",
    "    <tr>",
    '      <th class="col-category">Category</th>',
    '      <th class="col-name">Name</th>',
    '      <th class="col-links">Links</th>',
    "    </tr>",
    "  </thead>",
  ];
  for (const [cat, entries] of grouped) {
    lines.push("  <tbody>");
    lines.push('    <tr class="section-row">');
    lines.push(`      <th rowspan="${entries.length}" class="category-cell">${esc(cat)}</th>`);
    lines.push(`      <td>${esc(entries[0].name)}</td>`);
    lines.push(`      <td>${resourceLinksCell(entries[0])}</td>`);
    lines.push("    </tr>");
    for (const r of entries.slice(1)) {
      lines.push(`    <tr><td>${esc(r.name)}</td><td>${resourceLinksCell(r)}</td></tr>`);
    }
    lines.push("  </tbody>");
  }
  lines.push("</table>");
  return lines.join("\n");
}

function renderShowcases(showcases) {
  return showcases.map((s) => `- [${s.name}](${s.url})`).join("\n");
}

function main() {
  const check = process.argv.includes("--check");
  const vaults = loadJson(VAULTS_JSON);
  const resources = loadJson(RESOURCES_JSON);
  const showcases = loadJson(SHOWCASES_JSON);
  validateVaults(vaults);
  validateResources(resources);
  validateShowcases(showcases);
  const vaultGrouped = group(vaults, VAULT_CATEGORY_ORDER);
  const resGrouped = group(resources, RESOURCE_CATEGORY_ORDER);

  let src = readFileSync(README, "utf8");
  const totalVaults = vaultGrouped.reduce((n, [, l]) => n + l.length, 0);
  const totalRes = resGrouped.reduce((n, [, l]) => n + l.length, 0);

  if (!/## Vaults and websites grouped by topic \(\d+\)/.test(src)) {
    throw new Error("vault heading not found");
  }
  src = src.replace(
    /## Vaults and websites grouped by topic \(\d+\)/,
    `## Vaults and websites grouped by topic (${totalVaults})`,
  );

  const vaultBlock = `<!-- VAULTS:START -->\n${renderVaultTable(vaultGrouped)}\n<!-- VAULTS:END -->`;
  // Matches the generated markers, plus the pre-migration HTML table as a
  // one-time bridge for branches created before the Markdown conversion.
  const VAULT_BLOCK_RE =
    /(?:<table class="vault-table">[\s\S]*?<\/table>|<!-- VAULTS:START -->[\s\S]*?<!-- VAULTS:END -->)/;
  if (!VAULT_BLOCK_RE.test(src)) {
    throw new Error(
      "vault table not found in README.md — expected <!-- VAULTS:START --> … <!-- VAULTS:END --> markers",
    );
  }
  src = src.replace(VAULT_BLOCK_RE, vaultBlock);

  const resBlock = `## Resources (${totalRes})\n\n<!-- RESOURCES:START -->\n${renderResourceTable(resGrouped)}\n<!-- RESOURCES:END -->`;
  if (!/## Resources \(\d+\)[\s\S]*?\n---\n\n## List of Showcases/.test(src)) {
    throw new Error("resources block not found");
  }
  src = src.replace(
    /## Resources \(\d+\)[\s\S]*?\n---\n\n## List of Showcases/,
    resBlock + "\n\n---\n\n## List of Showcases",
  );
  if (!src.endsWith("\n")) src += "\n";

  const showcaseBlock =
    `## List of Showcases (${showcases.length})\n\n<!-- SHOWCASES:START -->\n` +
    `${renderShowcases(showcases)}\n<!-- SHOWCASES:END -->\n`;
  if (!/## List of Showcases \(\d+\)[\s\S]*?(?=\nFeel free to explore)/.test(src)) {
    throw new Error("showcases block not found");
  }
  src = src.replace(/## List of Showcases \(\d+\)[\s\S]*?(?=\nFeel free to explore)/, showcaseBlock);
  if (!src.endsWith("\n")) src += "\n";

  if (check) {
    const current = readFileSync(README, "utf8");
    if (current !== src) {
      console.error("README.md is out of date; run: node scripts/build-readme.mjs");
      process.exit(1);
    }
    console.log("README.md is up to date.");
  } else {
    writeFileSync(README, src, "utf8");
    console.log(`wrote README.md: ${totalVaults} vaults, ${totalRes} resources, ${showcases.length} showcases`);
  }
}

try {
  main();
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
