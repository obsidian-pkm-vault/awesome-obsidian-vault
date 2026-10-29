# Contributing

Thanks for helping grow this list! This is a curated, *awesome*-style list of
Obsidian vaults and Markdown knowledge bases.

## Quick start

- **Easiest:** open a [Suggest a vault](https://github.com/obsidian-pkm-vault/awesome-obsidian-vault/issues/new/choose) issue.
- **Faster:** open a pull request that adds an entry to `data/vaults.json`
  (or `data/resources.json` / `data/showcases.json`) — see below.

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer. No `npm install` needed —
  the script only uses the Node standard library.
- The field reference for each JSON file lives in [`data/README.md`](data/README.md).

## Adding a vault

The tables in `README.md` and the category guide in `TAXONOMY.md` are
**generated** — do not edit them by hand. `data/vaults.json` holds vault
entries; `data/categories.json` is the canonical category list and scope guide.
`node scripts/build-readme.mjs` renders both generated files.

1. Add an entry to `data/vaults.json`:
   ```json
   {
     "category": "Knowledge & Reference",
     "name": "Blue Book",
     "author": "lyz-code",
     "vault": "https://github.com/lyz-code/blue-book",
     "web": "https://lyz-code.github.io/blue-book/",
     "star": false
   }
   ```
2. Run `node scripts/build-readme.mjs` (no dependencies, Node 18+) and
   commit the regenerated `README.md` and `TAXONOMY.md` together with the JSON.
3. Open the PR. CI runs the script with `--check` and fails if `README.md`
   or `TAXONOMY.md` is out of date.

Rules:

1. **Category** — choose one primary category by the resource's main reader
   purpose. Use the definitions and boundary guidance in `TAXONOMY.md`; the
   source list is `data/categories.json`. If no category fits, propose a new
   category there with a scope and explain which existing entries, if any,
   should move. Sorting within a category is automatic.
2. **name / author** — `name` is the vault title, `author` the handle (or
   `null` if there is none). They render as `Name — author` with an em
   dash. No `|` characters.
3. **vault / web** — links to the source (usually a Git repo) and the
   published site. Use `null` if there is none; at least one is required
   (enforced by the script).
4. **star** — leave it `false`. Maintainers set `true` to mark a *standout
   pick*: a vault that is especially polished, complete, or widely used.
   Make your case for it in the PR/issue description.
5. **Counts** — automatic. The script recomputes the numbers in the section
   headings on every run.

## Adding a resource

Same flow, but the entry goes in `data/resources.json`:

```json
{
  "category": "Encyclopedia Resources",
  "name": "Kiwix Library",
  "links": [{ "label": "library", "url": "https://library.kiwix.org/#lang=eng" }]
}
```

`links` keeps the original link labels (`vault`, `web`, `wiki`,
`library`, …).

## Adding a showcase

Same flow, but the entry goes in `data/showcases.json`:

```json
{
  "name": "Quartz - Showcases",
  "url": "https://quartz.jzhao.xyz/showcase"
}
```

Showcases render as a bullet list under `List of Showcases`, the last
content section of `README.md` (after `Resources`).

## What belongs here

- Markdown-based vaults / knowledge bases, ideally Obsidian-compatible.
- Content that is publicly accessible (a repository or a live site).

Output from static-site generators (Hugo, Quartz, etc.) is welcome — note that
the syntax may not be 100% Obsidian-compatible, as mentioned in the README.

## Automated checks

- `list-check` (every PR/push): `node scripts/build-readme.mjs --check`
  verifies `README.md` and `TAXONOMY.md` match `data/*.json`.
- `link-check` (weekly): checks every link in the repo with
  [lychee](https://github.com/lycheeverse/lychee). Broken links open an issue
  automatically, so please make sure links you add resolve correctly.

## If CI fails on your PR

- **`README.md` or `TAXONOMY.md` is out of date** — you edited the JSON but
  didn't regenerate: run `node scripts/build-readme.mjs` and commit both.
- **Validation error naming your entry** — usually an unknown `category`,
  a malformed URL, or a duplicate: fix the JSON and re-run the script.
- **Broken link** — the URL doesn't resolve: double-check it (or use the
  canonical source).

## If your branch has gone stale

If your fork sat around for a while before you opened the PR, `README.md` on
`main` may have moved on to a newer generated format (comment markers,
section layout) than the one your branch started from. Editing `README.md`
by hand — including fixing up a link after the fact — will not match the
current format and can't be merged as a plain `git merge`. Rebase onto the
latest `main`, re-run `node scripts/build-readme.mjs` from there, and commit
only the regenerated `README.md` and `TAXONOMY.md`; never hand-patch generated
files, even for a one-line fix.

## License

By contributing, you agree that your contributions are dedicated to the public
domain under [CC0 1.0](LICENSE).
