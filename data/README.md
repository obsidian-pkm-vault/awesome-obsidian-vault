# `data/` — source of truth for the lists

`README.md` tables are **generated** from these files. Edit the JSON, then run
`node scripts/build-readme.mjs` from the repo root and commit both.

| File                   | Renders as                        | Section in `README.md`              |
| ---------------------- | --------------------------------- | ----------------------------------- |
| `vaults.json`          | Markdown table                    | Vaults and websites grouped by topic |
| `resources.json`       | Markdown table                    | Resources                            |
| `showcases.json`       | Bullet list                       | List of Showcases                    |

Counts in section headings and table ordering are computed by the script —
never edit them by hand.

## `vaults.json`

Array of entries. Displayed as `Name — author` in the `Name and author`
column (or just `Name` when `author` is `null`).

| Field      | Required | Meaning                                                        |
| ---------- | -------- | -------------------------------------------------------------- |
| `category` | yes      | Must be an existing category (see `TAXONOMY.md`)               |
| `name`     | yes      | Vault title                                                    |
| `author`   | yes      | Author/handle, or `null`                                       |
| `vault`    | one of the two | Source download (usually a Git repo), or `null`        |
| `web`      | one of the two | Published site, or `null`                             |
| `star`     | yes      | Leave `false` — maintainers set standout picks (`✨`)          |

## `resources.json`

Array of entries with free-form link labels.

| Field      | Required | Meaning                                              |
| ---------- | -------- | ---------------------------------------------------- |
| `category` | yes      | `Encyclopedia Resources`, `Dictionaries and Language Resources`, or `Cheat Sheets and Miscellaneous` |
| `name`     | yes      | Resource name                                        |
| `links`    | yes      | Non-empty array of `{ "label", "url" }` (`vault`, `web`, `wiki`, `library`, …) |
| `note`     | yes      | Short description, or `""`                          |

## `showcases.json`

Array of `{ "name", "url" }` links to other lists and showcase threads.
