# Taxonomy

This file is generated from [`data/categories.json`](data/categories.json).
That file is the canonical source for category names, scopes, and display order.

## Vaults and websites

Each entry gets exactly one primary category. Apply these rules in order:

- Assign exactly one category by the reader's main reason for using the resource; its file host and whether it has a website are link details, not categories.
- Choose Sample Vaults & Templates first when the main value is a reusable starter vault, template, example system, or note structure—even if it is about a specific subject.
- Choose Curated Directories when the entry primarily indexes links to other sites or media rather than presenting its own knowledge collection.
- Choose Food & Cooking for cooking-focused collections and Programming & Software for software, computing, or developer resources.
- Choose Publishing & Personal Sites for an author's own public notes, digital garden, or personal site; choose Knowledge & Reference for other wikis, documentation, reference works, and research collections.

The `vault` and `web` fields describe delivery links, not category facets.

| Category                    | Use it for                                                                                                                                                                        |
|-----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Curated Directories         | Link collections and directories whose main value is helping readers find external sites or media.                                                                                |
| Food & Cooking              | Recipe collections, cookbooks, meal-planning material, and other cooking-focused resources.                                                                                       |
| Knowledge & Reference       | Subject knowledge bases, wikis, documentation, reference works, and research collections, except resources whose primary purpose fits a more specific subject or format category. |
| Programming & Software      | Programming and computer-science learning, software documentation, developer tools, and computing-focused vaults.                                                                 |
| Publishing & Personal Sites | Personal websites, digital gardens, and published vaults whose main purpose is sharing the author's own notes or work, not providing a reusable template for others.              |
| Sample Vaults & Templates   | Reusable starter vaults, templates, example systems, and note structures intended to be copied or adapted.                                                                        |

## Resources

These categories apply to the separate `Resources` section, not to vault entries.

| Category                            | Use it for                                                                                                          |
|-------------------------------------|---------------------------------------------------------------------------------------------------------------------|
| Cheat Sheets and Miscellaneous      | Small standalone reference aids, study materials, or useful resources that do not form a larger subject collection. |
| Dictionaries and Language Resources | Dictionaries, word lists, and other language-reference resources.                                                   |
| Encyclopedia Resources              | Large general-knowledge collections, encyclopedias, and offline knowledge libraries.                                |

## Adding or changing a category

Update `data/categories.json`, recategorize affected entries in `data/*.json`,
and run `node scripts/build-readme.mjs`. The generator validates category use
and keeps this guide and the README in sync.
