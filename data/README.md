# `data/` — source of truth for the lists

`README.md` tables and `TAXONOMY.md` are **generated** from these files. Edit
the source JSON, then run `node scripts/build-readme.mjs` from the repo root
and commit the sources plus both generated files.

| File              | Renders as                           | Output / section                                |
| ----------------- | ------------------------------------ | ------------------------------------------------ |
| `categories.json` | Canonical category names and scopes  | `TAXONOMY.md` and README category order          |
| `vaults.json`     | HTML table (`rowspan` per category)  | Vaults and websites grouped by topic or purpose  |
| `resources.json`  | HTML table (`rowspan` per category)  | Resources                                        |
| `showcases.json`  | Bullet list                          | List of Showcases                                |

Counts, `rowspan`s, generated taxonomy, and ordering (A–Z within each
category) are computed by the script — never edit them by hand.

## `categories.json`

Defines the canonical ordered category lists and one-sentence scope for vaults
and resources. Add or rename a category here; the generator validates every
entry and renders the definitions into `TAXONOMY.md`.

## `vaults.json`

Array of entries. Displayed as `Name — author` in the `Name and author`
column (or just `Name` when `author` is `null`).

| Field      | Required       | Meaning                                                  |
| ---------- | -------------- | --------------------------------------------------------- |
| `category` | yes            | Must match a category in `categories.json` (see `TAXONOMY.md`) |
| `name`     | yes            | Vault title                                                |
| `author`   | yes            | Author/handle, or `null`                                   |
| `vault`    | one of the two | Source download (usually a Git repo), or `null`           |
| `web`      | one of the two | Published site, or `null`                                 |
| `star`     | yes            | Leave `false` — maintainers set standout picks (`✨`)      |

## `resources.json`

Array of entries with free-form link labels.

| Field      | Required | Meaning                                              |
| ---------- | -------- | ---------------------------------------------------- |
| `category` | yes      | Must match a resource category in `categories.json`             |
| `name`     | yes      | Resource name                                        |
| `links`    | yes      | Non-empty array of `{ "label", "url" }` (`vault`, `web`, `wiki`, `library`, …) |

## `showcases.json`

Array of `{ "name", "url" }` links to other lists and showcase threads.
