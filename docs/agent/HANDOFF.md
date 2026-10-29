# Handoff — awesome-obsidian-vault

Updated: 2026-10-29

Read with [`AGENTS.md`](../../AGENTS.md).

## Completed task

The taxonomy now has six primary categories based on reader intent, with
definitions and decision rules in `data/categories.json`. The same source
drives validation, README ordering, and generated `TAXONOMY.md`. Entries were
reclassified and the README regenerated. No secondary-tag schema was added.

Reviewed and committed: the category mapping checked out (60 entries
preserved, no drops/dupes) and matched the boundary rules in
`data/categories.json`. Fixed two small issues found during review — a
6-space/5-space indentation mismatch in the `CONTRIBUTING.md` JSON sample, and
misaligned Markdown table columns in `data/README.md` — then committed.

## Baseline

- Branch `main` at `7b61a1d` before this task; now carries the taxonomy
  commit on top.
- 60 vault entries, 6 primary categories, 9 resources.
- `node --check scripts/build-readme.mjs` passed.
- `node scripts/build-readme.mjs --check` passed after regeneration.
- Committed locally only — not pushed (`AGENTS.md` requires an explicit ask
  before submitting remote changes).

## Next steps

None outstanding for this task. Push to `origin/main` only if the user asks.
