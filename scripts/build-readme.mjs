#!/usr/bin/env node
/**
 * Build README tables and TAXONOMY.md from data/*.json.
 *
 * Source of truth: data/*.json (LF, UTF-8), including the category catalog.
 * Generated artifacts: Markdown tables/counts in README.md and category
 * definitions in TAXONOMY.md.
 *
 * No dependencies (Node stdlib only). Runs in CI via:
 *   node scripts/build-readme.mjs --check
 *
 * Usage: node scripts/build-readme.mjs [--check]
 *   --check: exit 1 if README.md or TAXONOMY.md is out of date (for CI/PRs).
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const README = join(ROOT, "README.md");
const TAXONOMY = join(ROOT, "TAXONOMY.md");
const CATEGORIES_JSON = join(ROOT, "data", "categories.json");
const VAULTS_JSON = join(ROOT, "data", "vaults.json");
const RESOURCES_JSON = join(ROOT, "data", "resources.json");
const SHOWCASES_JSON = join(ROOT, "data", "showcases.json");

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

function assertNonEmptyString(value, what) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${what} must be a non-empty string, got ${JSON.stringify(value)}`);
  }
}

function assertStringOrNull(value, what) {
  if (value !== null && typeof value !== "string") {
    throw new Error(`${what} must be a string or null, got ${JSON.stringify(value)}`);
  }
}

function assertArray(value, what) {
  if (!Array.isArray(value)) {
    throw new Error(`${what} must be an array`);
  }
}

function validateCategoryDefinitions(categories) {
  if (!categories || typeof categories !== "object" || Array.isArray(categories)) {
    throw new Error("categories.json must be an object");
  }
  for (const key of ["vaults", "resources"]) {
    assertArray(categories[key], `categories.json ${key}`);
    if (categories[key].length === 0) {
      throw new Error(`categories.json ${key} must contain at least one category`);
    }
    const seen = new Set();
    for (const category of categories[key]) {
      assertNonEmptyString(category.name, `category name in ${key}`);
      assertNonEmptyString(category.scope, `scope for category ${JSON.stringify(category.name)}`);
      if (seen.has(category.name)) {
        throw new Error(`duplicate category in ${key}: ${category.name}`);
      }
      seen.add(category.name);
    }
  }
  assertArray(categories.vaultRules, "categories.json vaultRules");
  if (categories.vaultRules.length === 0) {
    throw new Error("categories.json vaultRules must contain at least one rule");
  }
  for (const rule of categories.vaultRules) {
    assertNonEmptyString(rule, "vault classification rule");
  }
}

function validateVaults(vaults, categoryNames) {
  assertArray(vaults, "vaults.json");
  const seen = new Set();
  for (const v of vaults) {
    for (const key of ["category", "name", "vault", "web", "star"]) {
      if (!(key in v)) throw new Error(`vault entry missing ${key}: ${JSON.stringify(v)}`);
    }
    if (!categoryNames.has(v.category)) {
      throw new Error(`unknown category ${JSON.stringify(v.category)}`);
    }
    assertNonEmptyString(v.name, "vault name");
    assertStringOrNull(v.author, `author of ${JSON.stringify(v.name)}`);
    if (typeof v.star !== "boolean") {
      throw new Error(`star of ${JSON.stringify(v.name)} must be true or false (no quotes), got ${JSON.stringify(v.star)}`);
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

function validateResources(resources, categoryNames) {
  assertArray(resources, "resources.json");
  for (const r of resources) {
    for (const key of ["category", "name", "links"]) {
      if (!(key in r)) throw new Error(`resource entry missing ${key}: ${JSON.stringify(r)}`);
    }
    if (!categoryNames.has(r.category)) {
      throw new Error(`unknown resource category ${JSON.stringify(r.category)}`);
    }
    assertNonEmptyString(r.name, "resource name");
    if (!Array.isArray(r.links) || r.links.length === 0) {
      throw new Error(`resource has no links: ${r.name}`);
    }
    for (const l of r.links) {
      assertNonEmptyString(l.label, `link label in ${JSON.stringify(r.name)}`);
      assertUrl(l.url, r.name);
    }
  }
}

function validateShowcases(showcases) {
  assertArray(showcases, "showcases.json");
  const seen = new Set();
  for (const s of showcases) {
    for (const key of ["name", "url"]) {
      if (!(key in s)) throw new Error(`showcase entry missing ${key}: ${JSON.stringify(s)}`);
    }
    assertNonEmptyString(s.name, "showcase name");
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

function markdownCell(text) {
  return String(text).replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}

function renderTaxonomy(categories) {
  const lines = [
    "# Taxonomy",
    "",
    "This file is generated from [`data/categories.json`](data/categories.json).",
    "That file is the canonical source for category names, scopes, and display order.",
    "",
    "## Vaults and websites",
    "",
    "Each entry gets exactly one primary category. Apply these rules in order:",
    "",
  ];
  for (const rule of categories.vaultRules) lines.push(`- ${markdownCell(rule)}`);
  lines.push(
    "",
    "The `vault` and `web` fields describe delivery links, not category facets.",
    "",
    "| Category | Use it for |",
    "|---|---|",
  );
  for (const category of categories.vaults) {
    lines.push(`| ${markdownCell(category.name)} | ${markdownCell(category.scope)} |`);
  }
  lines.push(
    "",
    "## Resources",
    "",
    "These categories apply to the separate `Resources` section, not to vault entries.",
    "",
    "| Category | Use it for |",
    "|---|---|",
  );
  for (const category of categories.resources) {
    lines.push(`| ${markdownCell(category.name)} | ${markdownCell(category.scope)} |`);
  }
  lines.push(
    "",
    "## Adding or changing a category",
    "",
    "Update `data/categories.json`, recategorize affected entries in `data/*.json`,",
    "and run `node scripts/build-readme.mjs`. The generator validates category use",
    "and keeps this guide and the README in sync.",
    "",
  );
  return lines.join("\n");
}

function main() {
  const check = process.argv.includes("--check");
  const categories = loadJson(CATEGORIES_JSON);
  const vaults = loadJson(VAULTS_JSON);
  const resources = loadJson(RESOURCES_JSON);
  const showcases = loadJson(SHOWCASES_JSON);
  validateCategoryDefinitions(categories);
  const vaultCategoryNames = new Set(categories.vaults.map((category) => category.name));
  const resourceCategoryNames = new Set(categories.resources.map((category) => category.name));
  validateVaults(vaults, vaultCategoryNames);
  validateResources(resources, resourceCategoryNames);
  validateShowcases(showcases);
  const vaultGrouped = group(vaults, categories.vaults.map((category) => category.name));
  const resGrouped = group(resources, categories.resources.map((category) => category.name));

  let src = readFileSync(README, "utf8");
  const totalVaults = vaultGrouped.reduce((n, [, l]) => n + l.length, 0);
  const totalRes = resGrouped.reduce((n, [, l]) => n + l.length, 0);

  const vaultHeading = /## Vaults and websites grouped by topic(?: or purpose)? \(\d+\)/;
  if (!vaultHeading.test(src)) {
    throw new Error("vault heading not found");
  }
  src = src.replace(vaultHeading, `## Vaults and websites grouped by topic or purpose (${totalVaults})`);

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

  const taxonomy = renderTaxonomy(categories);
  if (check) {
    const stale = [];
    if (readFileSync(README, "utf8") !== src) stale.push("README.md");
    if (readFileSync(TAXONOMY, "utf8") !== taxonomy) stale.push("TAXONOMY.md");
    if (stale.length) {
      console.error(`${stale.join(" and ")} ${stale.length === 1 ? "is" : "are"} out of date; run: node scripts/build-readme.mjs`);
      process.exitCode = 1;
      return;
    }
    console.log("README.md and TAXONOMY.md are up to date.");
  } else {
    writeFileSync(README, src, "utf8");
    writeFileSync(TAXONOMY, taxonomy, "utf8");
    console.log(`wrote README.md: ${totalVaults} vaults, ${totalRes} resources, ${showcases.length} showcases`);
    console.log("wrote TAXONOMY.md");
  }
}

try {
  main();
} catch (err) {
  console.error(`Error: ${err.message}`);
  process.exit(1);
}
