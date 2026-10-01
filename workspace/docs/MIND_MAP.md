# Mind Map — ChemiPedia

The master index. **Every file in this repository appears here, with what it is and what owns it.**

> **Maintenance rule (`WORKING_AGREEMENT.md` §9):** a file that is added, renamed, moved or deleted
> is reflected here **in the same commit**. A stale mind map is a defect, and it is listed on the
> phase close-out checklist. If you cannot find something, look here first; if it is out of date,
> updating it is part of whatever you are doing.

**Legend**

| Mark | Meaning |
|---|---|
| ✅ | Exists and is current |
| 🚧 | Planned — not yet created. Do not look for it. |
| 📌 | Navigation aid — no content of its own |

---

## 1. Top level

```
WDW/                        the project root (the git repository)
├── .gitignore              ✅  files git must never track
├── package.json            ✅  the Node project definition: ES modules for the tooling, and the build, serve and test commands. Declares no dependencies.
├── README.md               ✅  the front door: what this is and how to run it
├── source/                 ✅  ALL shipped code, and nothing that is not shipped code
└── workspace/              ✅  ALL planning, research, documentation and tracking
```

**The one rule:** *does the browser load it?* Yes → `source/`. No → `workspace/`. There is no third
place. See `workspace/guides/02-tour-of-the-codebase.md`.

---

## 2. `workspace/` — everything that is not shipped code

### 2.1 Root of `workspace/` — the working system

| File | What it is | Read it when |
|---|---|---|
| `workspace/AGENTS.md` | **The mandatory entry point.** The five-minute start sequence, the ten non-negotiable rules, the commit identity, the resume procedure, and a map of all documentation. Short, binding, points to everything else. | **First, every session, no exceptions.** |
| `workspace/WORKING_AGREEMENT.md` | **The law.** The session start ritual, the `source`/`workspace` separation, technology constraints, brand rules, scope rules, the eight quality gates, the full interruption and recovery protocol, git law, documentation rules, testing rules. | Immediately after `AGENTS.md`. Read end to end. |
| `workspace/RUN_STATE.md` | **The authoritative recovery checkpoint.** Current phase, current work item, objective, files expected to change, current commit, status, work-item ledger, open decisions, risks, and a 60-second resume recipe. Updated after every milestone. | Every session start, and after every milestone. |
| `workspace/HANDOFF.md` | The short note to whoever comes next: what exists, what to do first, what is fragile, what was deliberately left half-done. Rewritten at the end of every session. | Every session start. |
| `workspace/progress/PHASE_LOG.md` | The status of all twelve phases, their work items, exit criteria, verification evidence and commit ranges, plus a blockers-and-deviations log. | When you need to know whether a phase is genuinely finished. |

### 2.2 `workspace/docs/` — the specification

| File | What it is | Answers the question |
|---|---|---|
| `docs/IMPLEMENTATION_PLAN.md` | The phased plan. Page inventory with reference-to-our path mapping, then Phase 0–11 each with goal, deliverables, tasks, exit criteria and an illustrative commit breakdown; a dependency graph; an estimate; a risk register. | *What are we building, in what order, and how do I know a phase is done?* |
| `docs/ARCHITECTURE.md` | The target architecture (four layers, and the rules that keep them decoupled) plus five ADRs: delivery architecture, page scope, commit convention, the JS-only constraint, and data provenance. Records options considered and consequences accepted. | *How is it put together, and why that way?* |
| `docs/DESIGN_SYSTEM.md` | The implementation spec for the visual layer: full token set (surfaces, ink, eleven group colours, type scale, space, radii, motion), naming conventions, the 15-component inventory, responsive strategy, accessibility requirements, and the Phase 1 style-guide deliverable. | *What exact colour, size or easing do I use?* |
| `docs/BRAND_GUIDELINES.md` | The ChemiPedia identity: name, wordmark structure, the mark, the tagline, the exhaustive replacement table, the prohibited-string list, the brand-scan command, what must be preserved, the typeface position, voice and copy rules, and the re-cut navigation and footer. | *What is ours, what is theirs, and what must never appear?* |
| `docs/DATA_SOURCES.md` | Provenance and licensing. Facts vs. prose, the requirements for the element dataset, the glossary's authoring position, the eleven-category taxonomy, the complete element JSON schema with conventions, attribution practice, and the tests that guard the document. | *Where did every fact and sentence come from?* |
| `docs/GIT_WORKFLOW.md` | The operational git rules: identity, message format with the imperative-mood test, what and how much to commit, the eight-point pre-commit checklist, staging by path, branches, tags, publishing, and what to do when something goes wrong. | *How do I commit this correctly?* |
| `docs/TESTING_STRATEGY.md` | The four verification layers (logic, structure, appearance, health), the standardised visual-verification procedure, the deviation rule, accessibility checks, and the phase close-out checklist to copy into the phase log. | *How do I prove it works — and that it looks right?* |
| `docs/MIND_MAP.md` | 📌 This file. The index of every file in the repository. | *Where is everything?* |

### 2.3 `workspace/docs/research/` — the evidence

| File | What it is |
|---|---|
| `research/01-reference-site-audit.md` | **The most important research artefact.** A live audit of the reference site: what it is built with, the full URL inventory, page anatomy family by family (home, elements index, element detail with all ~40 property rows, table views, glossary, calculators), the extracted design tokens in full, the signature visual motif, what we deliberately change, and a list of outstanding audit work. |
| `research/02-tooling-and-visual-verification.md` | How an agent that cannot see verifies appearance. The tools available, Playwright and Playwright MCP and their dependency conflict with ADR-004, the two-track resolution, and the standardised ten-step visual verification recipe. |
| `research/03-git-and-github-standards.md` | The seven rules of a great commit message with sources, why Conventional Commits was considered and rejected, the audit table of what makes a history look machine-generated, branching and history shape, author identity, and practical hygiene. |

### 2.4 `workspace/guides/` — a developer explaining the codebase

| File | What it is |
|---|---|
| `guides/README.md` | The index: what to read in what order, a five-minute path, and which document answers which kind of question. |
| `guides/01-project-overview.md` | The product in plain language, why it exists, the design brief stated honestly, the two deliberately missing sections, the constraints and what each one changed in the code, and what "done" looks like. |
| `guides/02-tour-of-the-codebase.md` | The folder-by-folder tour: the one rule that decides placement, the four layers and why they exist, the full intended `source/` tree, naming rules, and a "how to find things" lookup table. |
| `guides/03-how-a-page-gets-built.md` | An end-to-end trace of one URL from JSON record to pixels, in nine steps, including the table's algorithmic content. The three ideas worth remembering. |
| `guides/04-interview-quick-reference.md` | The thirty-second pitch, the architecture answer, a "Where is …?" table mapping questions to files and functions, the likely questions with honest answers, and four things to be able to demonstrate live. |

---

## 3. `source/` — shipped code

> Files marked 🚧 are planned per `docs/IMPLEMENTATION_PLAN.md` and `guides/02-tour-of-the-codebase.md`.
> They are created phase by phase. If a ✅ file is missing from this section, the mind map is stale.

### 3.1 Root and templates

| File | What it is | Phase |
|---|---|---|
| `source/README.md` | ✅ A short orientation note for the code root: what lives where, and where the real guide is. | 0 |
| `source/pages/home.html` | ✅ The home page's authored markup, as a fragment: the build wraps it in the document skeleton. A foundation placeholder until the home-page phase fills it in. | 0, 4 |
| `source/pages/404.html` | ✅ The not-found markup, served with a 404 status for any URL that matches no route. | 0 |
| `source/styleguide/index.html` | ✅ **The design system on one page**, development only: every token, the type and spacing scales, all eleven group colours with the foreground the site would choose for each and the contrast ratio it reaches, and the shell components rendered by the components themselves. Not a route, never built, never deployed; the development server maps `/styleguide/` onto the source tree so it can still be looked at. | 1 |
| `source/pages/*.html` | 🚧 The remaining authored templates: `elements-index`, `element-detail`, `glossary-index`, `glossary-term`, `element-groups-index`, `group`, `properties-and-states`, `orbitals`, `electronegativity`, `evolution`, `melting-point`, `boiling-point`, `orbital-configuration`, `downloads`, `temperature-calculator`, `about`, `contact`. A family shares one template when the difference between its pages is data — the 118 element pages, the eleven group pages, the 418 glossary terms. Where the difference is written copy, each page has its own template. | 5–10 |

### 3.2 `source/scripts/` — JavaScript

| File | What it owns | Phase |
|---|---|---|
| `scripts/app.js` | 🚧 The single entry point. Resolves the theme, installs routing, dispatches to the page module. | 1 |
| `scripts/router/routes.js` | ✅ **The route manifest.** Every URL the site publishes, with its template, title and description, plus the label and order it takes in the navigation and the section whose submenu it carries. The build renders this list and nothing else, so the manifest is the single answer to "which pages exist?" — and since the shell reads the same list, the navigation cannot point at a page the site does not publish. The static inventory is declared in full; a route whose template is not written yet is reported by the build and skipped. Generated families append entries derived from the data layer. Plain data, readable by Node and by the browser alike. | 0–1 |
| `scripts/router/navigation.js` | ✅ Where the shell's links come from: the primary navigation derived from the manifest, the contextual submenu for each section, and the footer's five columns. Pure data and pure functions, so the arrangement can change without touching a route, and a test proves every path it names is a declared route. | 1 |
| `scripts/router/router.js` | 🚧 Link interception, history, scroll restoration, 404, static-host fallback. | 5 |
| `scripts/data/elements-repository.js` | 🚧 The only reader of `elements.json`. Lookups by number, symbol and slug; queries by group, block, period and state; sorted views; derived values. | 2 |
| `scripts/data/glossary-repository.js` | 🚧 The only reader of `glossary.json`. A–Z grouping, prefix search, slug lookup. | 9 |
| `scripts/data/categories-repository.js` | 🚧 The eleven element categories, their palette keys and member counts. | 2 |
| `scripts/components/periodic-table.js` | 🚧 The centrepiece. The 18×10 grid, four colour modes, group isolation, keyboard navigation, tooltips. | 3 |
| `scripts/components/element-tile.js` | 🚧 One tile: atomic number, symbol, name; compact and detailed variants. | 3 |
| `scripts/components/element-card.js` | 🚧 The index card: tile plus name, group, weight and state. | 6 |
| `scripts/components/legend-chips.js` | 🚧 One pill per colour key, with its count; emits the isolation event. | 3 |
| `scripts/components/wordmark.js` | ✅ The two-line lockup, as a link in the masthead and as plain text in the footer. | 1 |
| `scripts/components/search-field.js` | ✅ The masthead search: a form, not a script, so it works without JavaScript and needs no behaviour module. | 1 |
| `scripts/components/site-header.js` | ✅ The masthead: lockup, primary navigation from the manifest, and the search field. Rendered into the HTML at build time, so the chrome exists before any script runs. | 1 |
| `scripts/components/site-footer.js` | ✅ The five link columns, the identity block, the provenance note and the copyright. | 1 |
| `scripts/components/submenu.js` | ✅ The contextual band, with the site's dotted rule across its full width. Returns nothing for a section that has no submenu. | 1 |
| `scripts/components/element-search.js` | 🚧 Live filtering and quick-jump to an element. | 4 |
| `scripts/components/property-list.js` | 🚧 The ~40-row labelled property table, with unknown-value handling. | 5 |
| `scripts/components/faq-block.js` | 🚧 Generates question/answer pairs from an element's own record. | 5 |
| `scripts/components/shell-diagram.js` | 🚧 Draws the electron shell diagram as generated SVG from the shell data. | 5 |
| `scripts/components/bar-ranking.js` | 🚧 Horizontal magnitude bars for the ranking pages. | 6 |
| `scripts/components/converter-input.js` | 🚧 One synchronised numeric input in the temperature calculator. | 10 |
| `scripts/components/filter-bar.js` | 🚧 Search input plus letter jump index. | 9 |
| `scripts/pages/home.js` | 🚧 The home page family. | 4 |
| `scripts/pages/elements-index.js` | 🚧 The elements index. | 6 |
| `scripts/pages/element-detail.js` | 🚧 The element detail family — all 118 pages. | 5 |
| `scripts/pages/table-views.js` | 🚧 The four alternate table views. | 7 |
| `scripts/pages/group.js` | 🚧 The eleven element group pages. | 8 |
| `scripts/pages/glossary.js` | 🚧 The glossary index. | 9 |
| `scripts/pages/glossary-term.js` | 🚧 A single glossary term. | 9 |
| `scripts/pages/ranking.js` | 🚧 The melting and boiling point rankings. | 6 |
| `scripts/pages/calculators.js` | 🚧 The calculators. | 10 |
| `scripts/lib/grid.js` | 🚧 Atomic number → row/column, including the detached f-block rows. Pure. | 3 |
| `scripts/lib/colour-scale.js` | 🚧 Numeric domain → colour, with clamping. Pure. | 3 |
| `scripts/lib/html.js` | ✅ Building HTML strings safely: escape text, build an attribute list, join class names. Every value that reaches markup goes through here, because a stray ampersand in an attribute ends the attribute early and the browser builds a different element than the one that was written. Pure and trivial on purpose. | 1 |
| `scripts/lib/contrast.js` | ✅ Colour maths, pure: hex normalisation, relative luminance, the WCAG contrast ratio, and the rule that picks the foreground for a group fill — the better of the two dark and cream candidates, never merely the acceptable one. | 1 |
| `scripts/lib/format.js` | 🚧 Value and unit → display string, with first-class handling of unknown. Pure. | 2 |
| `scripts/lib/keyboard.js` | 🚧 Roving focus and arrow-key grid navigation. | 3 |
| `scripts/lib/slug.js` | 🚧 Name → slug, and back. Pure. | 2 |

### 3.3 `source/styles/` — CSS

| File | What it owns | Phase |
|---|---|---|
| `styles/tokens.css` | ✅ **Every design value in the project.** No literal colour, size, radius, duration or easing exists outside this file. Surfaces and ink, the eleven group colours and the four block colours, the fluid type scale, spacing, shape, motion, and the handful of measurements the shell needs. One theme only: the light palette at the root (ADR-006). | 1 |
| `styles/base.css` | ✅ The reset and the element defaults: typography, links, the focus ring, selection, the skip link, and the mandatory reduced-motion block. | 1 |
| `styles/layout.css` | ✅ The shell, the page's vertical rhythm, the dotted-rule section and separator, prose measurement, and the shared page-heading block. | 1 |
| `styles/components/wordmark.css` | ✅ The stacked lockup. | 1 |
| `styles/components/search-field.css` | ✅ The masthead search: bare by design, findable by its focus ring. | 1 |
| `styles/components/site-header.css` | ✅ The masthead band, the wrapping row, and the navigation item's rule. | 1 |
| `styles/components/submenu.css` | ✅ The contextual band and its dotted rule. | 1 |
| `styles/components/site-footer.css` | ✅ The footer's two blocks and the five-column link grid. | 1 |
| `styles/components/*.css` | 🚧 The remaining one-stylesheet-per-component files, named to match their modules. Never styles anything else. | 3–10 |
| `styles/pages/*.css` | 🚧 One stylesheet per page family, named to match its module. | 4–10 |

### 3.4 `source/data/` — the data

| File | What it holds | Phase |
|---|---|---|
| `data/elements.json` | 🚧 118 element records against the schema in `docs/DATA_SOURCES.md` §5. | 2 |
| `data/glossary.json` | 🚧 418 glossary terms with definition and difficulty level. | 2, 9 |
| `data/categories.json` | 🚧 The eleven element groups: slug, display name, palette key, expected member count. | 2 |
| `data/units.json` | 🚧 Unit definitions used by the formatter. | 2 |

### 3.5 `source/assets/` — brand artwork

| File | What it holds | Phase |
|---|---|---|
| `assets/brand/favicon.svg` | ✅ Our own-drawn mark, serving as the favicon. Delivered with the foundation rather than with the rest of the brand, because a document that declares no icon makes the browser request one on every page and fail; it is refined alongside the wordmark in the design-system phase. | 0, 1 |
| `assets/brand/*` | 🚧 The two-line wordmark, the mark, the raster icon fallback and the social image. **All drawn by us.** | 1 |
| `assets/fonts/*` | 🚧 Self-hosted webfonts, if any. Licence must be recorded in `docs/DATA_SOURCES.md`. | 1 |

### 3.6 `source/tools/` — development tooling

| File | What it does | Phase |
|---|---|---|
| `tools/site-paths.js` | ✅ Where the repository, the source tree and the build directory are, and which file in the built output a published URL owns. Pure path arithmetic with no file-system access, which is what makes it testable on its own. | 0 |
| `tools/build.js` | ✅ Renders every ready route in the manifest into `dist/`, wrapping each authored template in the document skeleton, the masthead, the contextual band and the footer, with the stylesheets that page needs. A route whose template is not written yet is skipped and reported rather than rendered as a stub. Copies the browser-facing directories across. | 0–1 |
| `tools/serve.js` | ✅ The zero-dependency development server. Serves `dist/` the way a static host does: directory-style URLs, a redirect to the canonical form, and the built not-found page for anything else. Builds on start when `dist/` is missing, and maps the one development-only prefix, `/styleguide/`, onto the source tree. | 0–1 |
| `tools/build-data.js` | 🚧 Fetches the openly licensed dataset and emits our normalised JSON. The reason the data is reproducible rather than magic. | 2 |

### 3.7 `source/tests/` — tests

| Path | What it covers | Phase |
|---|---|---|
| `tests/lib/contrast.test.js` | ✅ The colour rules, plus a walk over every group colour that the token stylesheet actually declares: each one must take a foreground that passes AA for text, and the module's two foreground constants must match the stylesheet. | 1 |
| `tests/tools/site-paths.test.js` | ✅ The URL-to-file rules: directory-style resolution, file paths left alone, normalisation, and refusal of a path that would escape the build directory. | 0 |
| `tests/router/routes.test.js` | ✅ The manifest kept honest: unique, absolute, directory-style paths, a title and description per route, plain data rather than functions, one navigation order per labelled route, and at least one route the build can already render. | 0–1 |
| `tests/router/navigation.test.js` | ✅ The shell kept honest: the navigation is the manifest's in order, every path the shell links to is a declared route, no destination repeats inside a set, every submenu belongs to a section that exists, and the footer carries its five columns. | 1 |
| `tests/tools/build.test.js` | ✅ The document skeleton: doctype, language, the icon link, and escaping of the metadata it injects. | 0 |
| `tests/lib/html.test.js` | ✅ The escaping rules: the five characters that end a text node or an attribute, absent attributes omitted, a true one written bare, and an attribute value that cannot break out of its quotes. | 1 |
| `tests/lib/*.test.js` | 🚧 Grid placement, colour scales, contrast pairing, formatters, keyboard helpers. | 2–3 |
| `tests/data/*.test.js` | 🚧 Counts, uniqueness, category membership, lookup correctness, prose completeness. | 2 |
| `tests/pages/*.test.js` | 🚧 FAQ generation, shell diagram geometry, ranking order, search filtering, conversions. | 5–10 |
| `tests/brand/*.test.js` | 🚧 Asserts no prohibited brand string appears in any data record or prose field. | 2 |

---

## 4. Quick lookup — "I need to change…"

| I need to change… | Open |
|---|---|
| A colour, size, radius or animation timing | `source/styles/tokens.css` |
| Why the site has one light theme only | `docs/ARCHITECTURE.md` — ADR-006 |
| What an element's data contains | `source/data/elements.json` and `docs/DATA_SOURCES.md` §5 |
| Where element data is fetched from | `source/tools/build-data.js` and `docs/DATA_SOURCES.md` §2 |
| How an element is looked up | `source/scripts/data/elements-repository.js` |
| The periodic table's appearance or behaviour | `source/scripts/components/periodic-table.js` + `source/styles/components/periodic-table.css` |
| The f-block grid placement | `source/scripts/lib/grid.js` |
| The colour scale for a numeric view | `source/scripts/lib/colour-scale.js` |
| Which URLs the site publishes | `source/scripts/router/routes.js` |
| How a URL becomes a file in `dist/` | `source/tools/site-paths.js` |
| How the site is built, and what gets copied | `source/tools/build.js` |
| Why the dev server redirected or 404'd | `source/tools/serve.js` |
| How to build, serve or test the site | `README.md` |
| A whole page family's behaviour | `source/scripts/pages/<family>.js` |
| The header, footer or submenu | `source/scripts/components/site-header.js` / `site-footer.js` / `submenu.js` |
| What may never appear in the code | `docs/BRAND_GUIDELINES.md` §2 |
| Which pages exist and in what order they ship | `docs/IMPLEMENTATION_PLAN.md` §2 and §3 |
| Whether a phase is really done | `workspace/progress/PHASE_LOG.md` |
| What to do next, right now | `workspace/RUN_STATE.md` then `workspace/HANDOFF.md` |
| The rules I must follow | `workspace/AGENTS.md` then `workspace/WORKING_AGREEMENT.md` |
