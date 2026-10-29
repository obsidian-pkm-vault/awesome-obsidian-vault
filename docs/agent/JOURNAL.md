# Journal — awesome-obsidian-vault

Newest first. The handoff carries current state.

## 2026-10-29 — Reviewed and committed taxonomy normalization

Checked the uncommitted taxonomy work from the entry below: all 60 vault
entries preserved (no drops/dupes across the recategorization), category
boundaries matched the rules in `data/categories.json`, and generator output
was already in sync. Fixed two small issues before committing — an
indentation mismatch in `CONTRIBUTING.md`'s sample JSON, and misaligned
table columns in `data/README.md`. Committed locally; not pushed (no
explicit push request, and `AGENTS.md` requires one for remote changes).

## 2026-10-29 — Taxonomy normalization

Consolidated the 9 vault categories into 6 reader-intent categories. Moved
templates/starter systems (including Dashboard++, Digital Garden Docs, and
Kepano's template) to `Sample Vaults & Templates`; moved Obsidian Tasks docs
to `Programming & Software`; merged documentation/wiki/research into
`Knowledge & Reference`; combined publishing/personal-site labels; renamed
food and directory categories. Added `data/categories.json` as the canonical
ordered taxonomy source and made the generator produce both README and
`TAXONOMY.md`. Updated contribution guidance and CI. `node --check` and the
generator `--check` passed. The repo changes are uncommitted.
