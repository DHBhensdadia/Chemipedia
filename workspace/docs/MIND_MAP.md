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

### 2.5 `workspace/tools/visual/` — the visual verification harness

> Track B of `docs/research/02-tooling-and-visual-verification.md`, adopted on 2026-10-05 after two
> sessions in which the in-panel screenshot tool could not composite. **Development only:** nothing
> in `source/` imports it, the site runs and the tests pass with its `node_modules` deleted, and it
> is not build tooling. Its directory sits inside `workspace/` so it can be versioned without ever
> being shipped.

| File | What it is |
|---|---|
| `tools/visual/README.md` | How to run it, how to read its output, and what it must never become. |
| `tools/visual/compare.mjs` | The harness: opens the reference and the build in the same headless Chrome at the same width and colour scheme, captures both, diffs them pixel by pixel, crops the table, the hero, the finder, the elements index's card grid, a ranking's list, and — on an element page — the strip, hero, card, miniature table, columns, counts, facts, orbital, FAQ, siblings and pager, and reports every measurement taken from both pages. A comma list inside one selector string is split before it is queried, so a metric's own order of preference decides which element it describes. |
| `tools/visual/package.json` | Its three dev-only dependencies (`playwright`, `pixelmatch`, `pngjs`) and its one script. Separate from the repository's own dependency-free `package.json` on purpose. |
| `tools/visual/package-lock.json` | The pinned install, so a later run compares against the same version. |
| `tools/visual/node_modules/` | 📌 Installed, never committed (`.gitignore`). |
| `screenshots/` | 📌 Where the captures and `report.json` are written. Gitignored: working evidence, not artefacts. |

---

## 3. `source/` — shipped code

> Files marked 🚧 are planned per `docs/IMPLEMENTATION_PLAN.md` and `guides/02-tour-of-the-codebase.md`.
> They are created phase by phase. If a ✅ file is missing from this section, the mind map is stale.

### 3.1 Root and templates

| File | What it is | Phase |
|---|---|---|
| `source/README.md` | ✅ A short orientation note for the code root: what lives where, and where the real guide is. | 0 |
| `source/pages/home.html` | ✅ The home page's authored markup, as a fragment: the build wraps it in the document skeleton. Its sections in reading order — the hero, the table's host, the card into the explainers, the period and group explainers with the hosts for their diagrams, three teasers into the rest of the site, and the question that leads into the search — plus the empty hosts `pages/home.js` fills at load. | 0, 4 |
| `source/pages/404.html` | ✅ The not-found markup, served with a 404 status for any URL that matches no route. | 0 |
| `source/pages/element-detail.html` | ✅ The element detail family's template — one template behind all 118 pages. The blocks in reading order — strip, hero with its miniature table, headline, lede, FAQ, prose, counts, properties, orbital figure, siblings row, pager — are placeholders the family module fills at build time; the one `<div class="el">` wrapper declares the colour mode the tiles and the hero are painted by. `tools/render-template.js` refuses to render it with a placeholder left over. | 5 |
| `source/styleguide/index.html` | ✅ **The design system on one page**, development only: every token, the type and spacing scales, all eleven group colours with the foreground the site would choose for each and the contrast ratio it reaches, the shell components rendered by the components themselves, and the periodic table engine with a switch for its four colour modes. Not a route, never built, never deployed; the development server maps `/styleguide/` onto the source tree so it can still be looked at. | 1, 3 |
| `source/pages/elements-index.html` | ✅ The elements index: a hero with the heading, one line of context, the filter and the status line, then the grid of cards the family module fills at build time. | 6 |
| `source/pages/melting-point.html` | ✅ The melting point ranking: the hero copy, then the note about what the bar measures and the ranked rows the page module fills. | 6 |
| `source/pages/boiling-point.html` | ✅ The boiling point ranking, its own copy over the same ranked rows. | 6 |
| `source/pages/orbital-configuration.html` | ✅ The configurations page: the hero copy that explains the notation, then the blocks the page module fills — the four orbital blocks and the exceptions. | 6 |
| `source/pages/*.html` | 🚧 The remaining authored templates: `glossary-index`, `glossary-term`, `element-groups-index`, `group`, `properties-and-states`, `orbitals`, `electronegativity`, `evolution`, `downloads`, `temperature-calculator`, `about`, `contact`. A family shares one template when the difference between its pages is data — the 118 element pages, the eleven group pages, the 418 glossary terms. Where the difference is written copy, each page has its own template. | 5–10 |

### 3.2 `source/scripts/` — JavaScript

| File | What it owns | Phase |
|---|---|---|
| `scripts/app.js` | ✅ The site's one behaviour module, linked by every document. It installs the router and starts the page it is on: the build writes the template's name into `<body data-page>`, and `PAGE_BEHAVIOUR` turns that name into a call, importing a page's module the first time that page is seen. Two pages have behaviour so far — the home page's table and finder, and the elements index's filter. A page with no behaviour has no entry, which is the intended default: the element pages run the router and nothing else. | 5, 6 |
| `scripts/router/routes.js` | ✅ **The route manifest.** Every URL the site publishes, with its template, title and description, plus the label and order it takes in the navigation, the section whose submenu it carries, and the component stylesheets the page uses. The build renders this list and nothing else, so the manifest is the single answer to "which pages exist?" — and since the shell reads the same list, the navigation cannot point at a page the site does not publish. The static inventory is declared in full; a route whose template is not written yet is reported by the build and skipped. Generated families append entries derived from the data layer. Plain data, readable by Node and by the browser alike. | 0–1 |
| `scripts/router/navigation.js` | ✅ Where the shell's links come from: the primary navigation derived from the manifest, the contextual submenu for each section, and the footer's five columns. Pure data and pure functions, so the arrangement can change without touching a route, and a test proves every path it names is a declared route. | 1 |
| `scripts/router/router.js` | ✅ The router, as an improvement laid over real documents rather than a replacement for them. `navigationFor` is the whole decision — same origin, no modifier keys, no download or new tab, no fragment on this page, no file with an extension — and returns a URL or null with no DOM in it, which is what lets it be tested in Node. `createRouter` pushes the URL, fetches the same document a full load would get, swaps the body while refusing the incoming scripts and carrying the running ones, renames the page from the fetched body, moves focus to the main landmark, and restores the reader's scroll place on a history move. A response the site answers 404 with a document is shown; anything else hands the navigation back to the browser. | 5 |
| `scripts/data/json-source.js` | ✅ The one place that knows how a data file is fetched: a file name in the data folder becomes parsed JSON. Owned by the data layer, so no component ever learns a URL. | 2 |
| `scripts/data/elements-repository.js` | ✅ The only reader of `elements.json`. Lookups by number, symbol and slug, queries by category, block, period, group and state, and sorting that always puts the unknowns last. The comparison it sorts with is exported, so a page that ranks a list it already holds sorts by the repository's rule rather than by a second one. A lookup that finds nothing returns null, because a URL for an element that does not exist is a 404 and a page is not an exception. | 2 |
| `scripts/data/categories-repository.js` | ✅ The only reader of `categories.json`. The eleven categories, their display names, their palette tokens and the member counts the legend asserts. | 2 |
| `scripts/data/units-repository.js` | ✅ The only reader of `units.json`. Turns a field name into the unit to print and the number of figures to print it to, which is what keeps the unit next to the value instead of inside the page. | 2 |
| `scripts/data/glossary-repository.js` | ✅ The only reader of `glossary.json`, and the glossary's arrangement rather than its content: reading order, the A–Z letters that actually have terms under them, lookup by slug, and a search that matches the definition as well as the term, because a reader who wants a word often knows the idea and not the name. The 418 definitions arrive in the glossary phase; this knows only what shape they take. | 2, 9 |
| `scripts/components/periodic-table.js` | ✅ **The centrepiece.** The 18×10 grid drawn from the element records in four colour modes — group, block, state, and a banded electronegativity with its own scale legend — plus the legend, group isolation, and arrow-key navigation with a single roving tab stop. It emits colour keys and bands rather than colours; `periodic-table.css` maps them to tokens. `renderPeriodicTable` returns markup for a build-time caller; `createPeriodicTable` returns the markup, its grid model and the function that attaches the behaviour in a browser. | 3 |
| `scripts/components/element-tile.js` | ✅ One tile: the atomic number, the symbol and, at most widths, the name, as the link to the element's page. It carries its grid cell, its colour key or band, and an accessible name that says all three facts. Compact and detailed variants. | 3 |
| `scripts/components/element-card.js` | ✅ One card on the elements index: the element's tile, its name, its group, its weight with the unit the units data gives it, and its state. The tile is the fact the table draws, hidden from assistive technology because the link's own name says the same three things; the group is the categories repository's display name rather than the slug; a missing weight keeps its place and says so. The card emits the element's category as `data-key` and lets the table's stylesheet paint it, and carries the name, symbol and atomic number as `data-` attributes for the index's filter to read. | 6 |
| `scripts/components/legend-chips.js` | ✅ One pill per colour key, with its counted data behind it: a button the table owns (press isolates) or a link to a page. It also binds the isolation behaviour, reporting the key under the pointer, the focus or the press — and `null` when there is nothing to isolate — to the table. | 3 |
| `scripts/components/wordmark.js` | ✅ The two-line lockup, as a link in the masthead and as plain text in the footer. | 1 |
| `scripts/components/search-field.js` | ✅ The masthead search: a form, not a script, so it works without JavaScript and needs no behaviour module. | 1 |
| `scripts/components/site-header.js` | ✅ The masthead: lockup, primary navigation from the manifest, and the search field. Rendered into the HTML at build time, so the chrome exists before any script runs. | 1 |
| `scripts/components/site-footer.js` | ✅ The five link columns, the identity block, the provenance note and the copyright. | 1 |
| `scripts/components/submenu.js` | ✅ The contextual band, with the site's dotted rule across its full width. Returns nothing for a section that has no submenu. | 1 |
| `scripts/components/element-search.js` | ✅ The finder: a form first, so it submits the query to the elements index by the browser's own means and works with no script, and live filtering with Enter-goes-to-the-first-match when the module is attached. The ranking is its own function — exact symbol and atomic number first, then names that begin with the query, then symbols, then names that contain it — with atomic order deciding inside a rank. | 4 |
| `scripts/components/property-list.js` | ✅ The property panel: 27 labelled rows in the order a reader wants them, each field formatted by `lib/format.js` with the unit `units.json` gives it. An unknown value keeps its row and says so. A category slug becomes its display name through the categories repository. The particles panel is protons and electrons only — both the atomic number — and there is deliberately no neutron count, because a rounded atomic weight is right for one element and wrong for the next. Pure: records in, strings out. | 5 |
| `scripts/components/faq-block.js` | ✅ The questions a reader asks about one element, answered from that element's own record. The question list is fixed copy; every answer comes from the same formatter and the same units definition as the property panel, so the two cannot disagree. A question whose value the record does not have is left out rather than answered "Unknown", and an element with nothing to answer renders no block at all. | 5 |
| `scripts/components/shell-diagram.js` | ✅ The electron shell diagram, drawn as generated SVG from the record's own `shells`: one ring per shell, one dot per electron, the nucleus a fixed mark at the centre. The geometry is a pure function of the counts, so a test can prove that a shell with one electron gets one dot rather than a filled ring. No colour is written here — the stylesheet paints the classes from the token layer — and an element with no shells gets no diagram rather than an empty picture. | 5 |
| `scripts/components/bar-ranking.js` | ✅ The ranked rows of a ranking page: place, element, bar and value. The bar is an ordinal scale — where a value sits between the page's own lowest and highest, not a length measured from zero, which most melting points in degrees Celsius would make meaningless — with a token keeping a little length on the lowest bar so it is visible rather than absent. An element the source has not measured keeps its row, gets no place and no bar, and says Unknown. Rows are rendered in the order they arrive in: the ranking is the page module's decision. | 6 |
| `scripts/components/converter-input.js` | 🚧 One synchronised numeric input in the temperature calculator. | 10 |
| `scripts/components/filter-bar.js` | 🚧 Search input plus letter jump index. | 9 |
| `scripts/pages/home.js` | ✅ The home page's composition and its two diagrams. It fills the table's and the finder's hosts from the data layer and draws the period and group schematics from the same `lib/grid.js` model the table is laid out from, so a change to where an element sits moves the diagrams with it. Both diagrams are exported so Node can check them without a document; the boot at the foot runs only in a browser. | 4 |
| `scripts/pages/elements-index.js` | ✅ The elements index: the cards written at build time so the page is a real document, and the filter as an improvement over them — a pure `indexMatches` answering name, symbol and an exactly-matched atomic number, the status line that says how many are left, and an attach that hides the cards which do not match and reattaches after a client-side navigation. It reads the `?q=` the home finder submits, so a form submission lands on a filtered page. | 6 |
| `scripts/pages/element-detail.js` | ✅ The element detail family — all 118 pages behind one module. It turns a record into the blocks the template asks for: the strip and the pager take the element's neighbours, wrapping at both ends; the miniature table draws the whole 118 with this one marked and nothing tabbable; the sibling row takes the same category in atomic order, capped at twelve; and the FAQ, the properties and the shell diagram all read the same values. Runs at build time in Node, so the test suite calls it directly. | 5 |
| `scripts/pages/table-views.js` | 🚧 The four alternate table views. | 7 |
| `scripts/pages/group.js` | 🚧 The eleven element group pages. | 8 |
| `scripts/pages/glossary.js` | 🚧 The glossary index. | 9 |
| `scripts/pages/glossary-term.js` | 🚧 A single glossary term. | 9 |
| `scripts/pages/ranking.js` | ✅ The two rankings, one module behind both: the route carries the field it ranks and the direction, and the order is the elements repository's own comparison, so a ranking and a repository query cannot disagree about where an unmeasured element goes. Refuses a route that names no field, or one no record carries, rather than rendering a page of Unknowns. | 6 |
| `scripts/pages/orbital-configuration.js` | ✅ Every element's configuration grouped by the block its last electron fills, with a sentence per block and a closing section naming the elements whose configurations differ from the predicted filling order — derived, not asserted. Runs at build time in Node. | 6 |
| `scripts/pages/calculators.js` | 🚧 The calculators. | 10 |
| `scripts/lib/grid.js` | ✅ Where each element sits and which cell a keypress lands on next. It does not re-derive the layout — `position` on every record is the frozen answer — it lays the 118 records out as a grid and answers the two questions the engine asks: which element is in a cell, and which cell is one step away, skipping the table's holes. Pure, no DOM. | 3 |
| `scripts/lib/colour-scale.js` | ✅ A number's position on a scale, the band of a legend it belongs to, and — for callers that hold colours — the interpolated colour, with the domain's ends exact and outliers clamped. The table uses the band alone, because the six colours are tokens in `tokens.css` rather than constants here. Pure. | 3 |
| `scripts/lib/html.js` | ✅ Building HTML strings safely: escape text, build an attribute list, join class names. Every value that reaches markup goes through here, because a stray ampersand in an attribute ends the attribute early and the browser builds a different element than the one that was written. Pure and trivial on purpose. | 1 |
| `scripts/lib/contrast.js` | ✅ Colour maths, pure: hex normalisation, relative luminance, the WCAG contrast ratio, and the rule that picks the foreground for a group fill — the better of the two dark and cream candidates, never merely the acceptable one. | 1 |
| `scripts/lib/format.js` | ✅ Value and unit → the string a reader sees. An unknown is a word rather than an empty cell, and a measurement is formatted with its unit or not at all, because half of a value's meaning lives in the unit. The definitions that say which unit a field takes arrive as an argument, so this stays pure. | 2 |
| `scripts/lib/electron-configuration.js` | ✅ Electron configurations, read and predicted. It expands the shorthand a record is written in (`[Ar]4s2 3d6`) through the noble gases' own records, predicts what a filling order would give an element — the Madelung order, `n + l` and then `n`, stopped at the subshell the table's last element fills — and reports the subshells where a measured configuration and the prediction differ. That comparison is how the orbital configurations page names the elements that break the rule instead of asserting a number. Pure: records in, plain values out. | 6 |
| `scripts/lib/keyboard.js` | ✅ What a keypress means: the four arrows plus Home and End, and the cell each one moves to — asked of `lib/grid.js` rather than computed here, which is what lets the rule be tested without a browser. The table component owns the DOM half: moving focus and the tab stop. Pure. | 3 |
| `scripts/lib/slug.js` | ✅ Name → URL segment, and back. British spellings are applied before the slug is built rather than after, because a URL cannot be taken back. | 2 |

### 3.3 `source/styles/` — CSS

| File | What it owns | Phase |
|---|---|---|
| `styles/tokens.css` | ✅ **Every design value in the project.** No literal colour, size, radius, duration or easing exists outside this file. Surfaces and ink, the eleven group colours and the four block colours, the fluid type scale, spacing, shape, motion, the measurements the shell needs, the periodic table's geometry, its colour scales, and the home page's measured sections. One theme only: the light palette at the root (ADR-006). | 1 |
| `styles/base.css` | ✅ The reset and the element defaults: typography, links, the focus ring, selection, the skip link, and the mandatory reduced-motion block. | 1 |
| `styles/layout.css` | ✅ The shell, the page's vertical rhythm, the dotted-rule section and separator, prose measurement, and the shared page-heading block. | 1 |
| `styles/components/wordmark.css` | ✅ The stacked lockup. | 1 |
| `styles/components/search-field.css` | ✅ The masthead search: bare by design, findable by its focus ring. | 1 |
| `styles/components/element-search.css` | ✅ The home page's finder: the measured field and button on one line, the results list under it, and the empty state in the soft ink. | 4 |
| `styles/components/site-header.css` | ✅ The masthead band, the wrapping row, and the navigation item's rule. | 1 |
| `styles/components/submenu.css` | ✅ The contextual band and its dotted rule. | 1 |
| `styles/components/site-footer.css` | ✅ The footer's two blocks and the five-column link grid. | 1 |
| `styles/components/element-tile.css` | ✅ The tile's shape: the square, the three lines of type sized against the table's container, the hover/focus lift, and the current element's outline. It consumes `--fill` and `--on-fill`, which the table's modes set. | 3 |
| `styles/components/legend-chips.css` | ✅ The pill, its count badge mixed from the chip's own text colour, and the hover/focus/pinned lift. Consumes the same two custom properties as the tile. | 3 |
| `styles/components/periodic-table.css` | ✅ The eighteen-column grid and its rows, the four colour modes as key-to-token maps, isolation and the focused-tile exemption, the numeric scale legend, and the narrow-screen scroll container with its edge fade. The miniature table on an element page reuses the same map: transparent outlined cells, the atomic number hidden, the symbol centred, and a thin rule on the page's own element. | 3, 5 |
| `styles/components/property-list.css` | ✅ The panel's dotted border, its symbol head, its labelled rows, the particle tiles and the discovery list. The interior row rules are the brand ink at a tenth, which is what the reference draws. | 5 |
| `styles/components/faq-block.css` | ✅ The questions band: one row per question, a rule between them, and the answer in the body face under its question. | 5 |
| `styles/components/element-card.css` | ✅ The index card's shape: the raised white surface, the 54px tile consuming `--fill` and `--on-fill`, the three lines of words beside it, and the lift a hover or a focus gives it. How wide a card is belongs to the grid that holds it, and hiding one belongs to the page's filter. | 6 |
| `styles/components/bar-ranking.css` | ✅ The ranked row: the four columns, the 30px symbol chip painted by `--fill-deep`, the track and the fill whose length is the data's ratio between the token layer's floor and its full width, and the two-line arrangement a narrow screen gets instead of four squeezed columns. | 6 |
| `styles/components/shell-diagram.css` | ✅ The drawing's box and the paints for its rings, dots and nucleus, from the token layer. The box keeps the reference's own ratio so the figure's height matches; the drawing itself is square and centres inside it. | 5 |
| `styles/components/*.css` | 🚧 The remaining one-stylesheet-per-component files, named to match their modules. Never styles anything else. | 3–10 |
| `styles/pages/home.css` | ✅ The home page's own pieces: the hero paragraph wider than the prose measure, the explainer's text-and-diagram columns, the schematic's geometry — the table's rows and columns in miniature — the card, and the three teasers. Rhythm and separators come from the layout layer. | 4 |
| `styles/pages/elements-index.css` | ✅ The index's hero, its filter field and its grid. The grid's floor is the reference's own 266px card, so its four columns at the shell, three at 1024 and two at 768 fall out of one `auto-fill` line rather than out of three breakpoints. | 6 |
| `styles/pages/ranking.css` | ✅ The ranking pages' hero, note and list — one sheet for both, declared by both routes, because the pages differ in the field they rank and in their copy and in nothing else. | 6 |
| `styles/pages/orbital-configuration.css` | ✅ The configuration page's five sections, the two-column row whose first column is fixed so a configuration always starts in the same place, and the notation in the mono face. | 6 |
| `styles/pages/element-detail.css` | ✅ The element page's layout: the strip, the hero and its category-tinted wash, the overhanging card, the two columns, the prose, the siblings row and the pager. The hero's tint names no colour — it mixes `--fill`, which the table's mode map sets from the element's own category key. | 5 |
| `styles/pages/*.css` | 🚧 One stylesheet per page family, named to match its module. | 4–10 |

### 3.4 `source/data/` — the data

| File | What it holds | Phase |
|---|---|---|
| `data/elements.json` | ✅ 118 element records against the schema in `docs/DATA_SOURCES.md` §5. **Generated** by `tools/build-data.js` and committed anyway, so the data is reproducible *and* readable without a network. Facts come from PubChem, the second tier from Wikidata, the prose from `element-notes.json`, and the layout from `tools/data-sources/layout.js`. | 2 |
| `data/categories.json` | ✅ The eleven element groups: slug, display name, palette token and asserted member count. Hand-written, because it is the taxonomy rather than a product of one, and its counts are what the legend prints. | 2 |
| `data/overrides.json` | ✅ The nine places this project files an element differently from the dataset that supplied it, each with the chemical reason. A correction without a reason is indistinguishable from a mistake. | 2 |
| `data/units.json` | ✅ Which unit each field is stored in and how many figures it is printed to, used by `scripts/data/units-repository.js`. | 2 |
| `data/element-notes.json` | ✅ The authored prose, keyed by symbol: pronunciation, name origin, and the summary, uses and sources paragraphs, all 118 of them. Kept apart from `elements.json` so that rerunning the build cannot overwrite writing, and validated so that an entry which is present but blank stops the build rather than reaching a page half-finished. | 2 |
| `data/glossary.json` | 🚧 418 glossary terms with definition and difficulty level. | 9 |

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
| `tools/build.js` | ✅ Owns the five renderers the families are built by, hands each of them the route, the records, the categories and the units repository, and renders every ready route in the manifest into `dist/`, wrapping each authored template in the document skeleton, the masthead, the contextual band and the footer, with the stylesheets that page needs: the global layer, the shell, the component sheets the route declares, and the page's own sheet last. A family's template is filled by its module through `tools/render-template.js`. Every document carries the page's template name on `<body data-page>` and links the one app module, which is what lets a client-side navigation start the arriving page. A route whose template is not written yet is skipped and reported rather than rendered as a stub. Copies the browser-facing directories across. | 0–1, 4, 5 |
| `tools/build-context.js` | ✅ The data a build renders from: the same three repositories the browser uses, each handed a `fetch` that reads the file from disk, so there is one reader and one set of checks in both places. Returns the records, the categories and the units repository itself. | 5 |
| `tools/render-template.js` | ✅ Filling a family's template, and refusing to render one that does not add up. Two functions: the placeholder names a template asks for, and the fill. An unknown placeholder is an error rather than an empty string, and a placeholder that survives inside a value is an error too, because a section silently rendering as nothing is the bug that reaches a reader. | 5 |
| `tools/serve.js` | ✅ The zero-dependency development server. Serves `dist/` the way a static host does: directory-style URLs, a redirect to the canonical form, and the built not-found page for anything else. Builds on start when `dist/` is missing, and maps the one development-only prefix, `/styleguide/`, onto the source tree. | 0–1 |
| `tools/build-data.js` | ✅ Fetches both sources, merges the authored prose, derives the layout, verifies the result and only then writes `data/elements.json`. Nothing is written that has not passed verification, because a half-updated data file is worse than a day-old one. `--dry-run` reports without writing. | 2 |
| `tools/data-sources/pubchem.js` | ✅ The primary dataset: one request, 118 rows, seventeen columns. All the unit conversion happens here — kelvin to Celsius, picometres to ångströms — so nothing downstream has to remember where a number came from. | 2 |
| `tools/data-sources/wikidata.js` | ✅ The supplementary properties PubChem does not carry. Converts against an explicit unit table and **sets a field to null rather than guessing** when it meets a unit it does not know, because a wrong number cannot be noticed on a page and an empty one can. | 2 |
| `tools/data-sources/layout.js` | ✅ Period, group, block and grid cell, from the atomic number alone. The datasets publish values; they do not publish geometry, and the table engine and the element page must not be able to disagree about which cell an element occupies. | 2 |
| `tools/data-sources/configuration.js` | ✅ Expands an electron configuration string into shell populations. Does not use the Madelung filling order, which gets chromium, copper and palladium wrong, and reports the electron total so the build can refuse a configuration that does not add up. | 2 |

### 3.7 `source/tests/` — tests

| Path | What it covers | Phase |
|---|---|---|
| `tests/lib/contrast.test.js` | ✅ The colour rules, plus a walk over every group colour that the token stylesheet actually declares: each one must take a foreground that passes AA for text, and the module's two foreground constants must match the stylesheet. | 1 |
| `tests/tools/site-paths.test.js` | ✅ The URL-to-file rules: directory-style resolution, file paths left alone, normalisation, and refusal of a path that would escape the build directory. | 0 |
| `tests/router/routes.test.js` | ✅ The manifest kept honest: unique, absolute, directory-style paths, a title and description per route, plain data rather than functions, one navigation order per labelled route, and at least one route the build can already render. | 0–1 |
| `tests/router/navigation.test.js` | ✅ The shell kept honest: the navigation is the manifest's in order, every path the shell links to is a declared route, no destination repeats inside a set, every submenu belongs to a section that exists, and the footer carries its five columns. | 1 |
| `tests/tools/build.test.js` | ✅ The document skeleton: doctype, language, the icon link, and escaping of the metadata it injects. | 0 |
| `tests/lib/html.test.js` | ✅ The escaping rules: the five characters that end a text node or an attribute, absent attributes omitted, a true one written bare, and an attribute value that cannot break out of its quotes. | 1 |
| `tests/lib/slug.test.js` | ✅ The three preferred spellings, punctuation dropped rather than turned into a separator, accent folding, and the honest inverse: a slug reads back as a label, not as the name it came from. | 2 |
| `tests/lib/format.test.js` | ✅ Significant figures against decimals, trailing zeros, zero kept as a value, an unknown rendered as a word, and a measurement that never loses its unit. | 2 |
| `tests/lib/grid.test.js` | ✅ The layout held to the real data: 118 cells, row eight empty, both detached rows contiguous from column three, every f-block element in its row, hole-skipping steps in all four directions, and refusals of a missing position, a shared cell and an unknown direction. | 3 |
| `tests/lib/colour-scale.test.js` | ✅ Positions from 0 to 1 with clamping, bands including the domain's top end, exact endpoint colours, interpolation between stops, legend swatches with and without a stop per band, and the constructor's refusals. | 3 |
| `tests/lib/keyboard.test.js` | ✅ The six keys, their destinations across a row's holes, Home and End against a row's ends, the edges where nothing moves, and the keys the table does not own. | 3 |
| `tests/lib/electron-configuration.test.js` | ✅ The filling order's shape and its edge, what a simple filling predicts for helium, carbon, chromium and iron, a shorthand expanded through the noble gas it names and through one that is itself a shorthand, a parenthetical "(predicted)" ignored rather than read as a subshell, the nineteen elements whose configurations differ from the prediction — chromium, copper and palladium among them, helium and iron not — and the two subshells by which chromium differs. | 6 |
| `tests/lib/contrast.test.js` | ✅ The colour rules, plus a walk over every group colour that the token stylesheet actually declares. | 1 |
| `tests/lib/html.test.js` | ✅ The escaping rules: the five characters that end a text node or an attribute. | 1 |
| `tests/tools/layout.test.js` | ✅ The table's shape held to account: no two elements in a cell, row eight empty, every main-table element in a real group, both detached rows contiguous from column three. | 2 |
| `tests/tools/configuration.test.js` | ✅ Shell populations for iron, gold, uranium and a predicted superheavy, and refusal of a configuration that cannot be read. | 2 |
| `tests/data/elements.test.js` | ✅ The repository against the real file: 118 records, every lookup, unique slugs, the counts the legend asserts, shells that account for every electron, unknown values that are neither empty nor undefined, and six elements checked against what an authoritative table says. | 2 |
| `tests/data/repositories.test.js` | ✅ The categories and units repositories, including that every palette token a category names is one the token layer actually declares. | 2 |
| `tests/data/glossary.test.js` | ✅ The glossary's arrangement, against a six-term fixture: reading order, derived letters, lookup, and a search that finds a word that appears only in a definition. | 2 |
| `tests/brand/brand.test.js` | ✅ Walks the whole of `source/` and fails the suite if the reference's name appears anywhere in it, so the phase log's scan cannot be the only thing standing between a slip and a commit. | 2 |
| `tests/components/periodic-table.test.js` | ✅ The engine against the real data: 118 cells, every f-block placement, the four modes' keys and legend counts, the banding of every measurement, the aria structure, and the stylesheet held to the contrast rule — every fill's foreground is the one `lib/contrast.js` chooses. | 3 |
| `tests/components/element-tile.test.js` | ✅ Tile markup: position, link, accessible name, colour key or band, the compact variant, the current element, escaping and the refusal of a cell-less element. | 3 |
| `tests/components/legend-chips.test.js` | ✅ Buttons versus links, the count pill, the pressed state, the empty guard, and that a chip carries a key rather than a colour. | 3 |
| `tests/components/element-card.test.js` | ✅ The card against the real records: the link and its name saying the same three facts a tile does, the group printed as its name rather than its slug, the weight with its unit and the state capitalised, the three searchable facts as `data-` attributes, a missing weight keeping its place, one card per element in atomic order, and an element with no category record still getting a card. | 6 |
| `tests/components/bar-ranking.test.js` | ✅ The scale: endpoints, the midpoint, clamping, a one-value domain at full length and no domain at none, zero kept as a measurement while a null is not, the row's markup and the ratio it carries, an unmeasured element placed nowhere and drawn as nothing, places counting only the measured elements, and the real 103 melting points running from 0 to 1 across the track. | 6 |
| `tests/components/element-search.test.js` | ✅ The ranking rules against the real 118 — exact matches first, prefixes before substrings, atomic order inside a rank, the cap — and the form's markup: its action, its hidden label, its live region and the options a caller can replace. | 4 |
| `tests/pages/home.test.js` | ✅ The home page against the real data: the sections in reading order, the one heading and the closing question, the hosts the module fills, each diagram drawing all 118 elements on the labelled axis, and the empty axis refused. | 4 |
| `tests/components/property-list.test.js` | ✅ The panel against the real records: every declared row rendered with a label and a value, an unknown value keeping its row, a category printed as its name, a measurement keeping its unit, the particle tiles, the discovery rows, and escaping. | 5 |
| `tests/components/shell-diagram.test.js` | ✅ The geometry for H, C, Fe, Au and U: one ring per shell, one dot per electron, rings ordered and inside the drawing, a single electron as a single dot, non-counts dropped, and the SVG's own structure and label. | 5 |
| `tests/components/faq-block.test.js` | ✅ The questions in order, every answer equal to the property panel's own value for four elements, an unknown left out rather than answered, and an element with nothing to answer rendering no block. | 5 |
| `tests/router/router.test.js` | ✅ `navigationFor`'s decisions in full, and the router under fakes: a click fetching and swapping, the arriving page's name travelling with the swap, the running script carried across, a 404 document shown, a failure handed back to the browser, a second navigation ignored while one is in flight, a history move restoring the reader's place, and `stop()` removing what `start()` installed. | 5 |
| `tests/pages/element-detail.test.js` | ✅ The whole family against the real data: 118 routes whose titles come from the records, every page filling every block it can with none holding a placeholder, the three blocks that may be empty empty only when the record is, strip and pager agreeing on both neighbours and wrapping at both ends, the sibling row's category and cap, the miniature table's 118 untabbable tiles with one marked, the shell diagram right for H, C, Fe, Au and U, and every FAQ answer present in the same element's property panel. | 5 |
| `tests/tools/render-template.test.js` | ✅ The template rules: placeholders read in order and once each, filling substituting every one, an unknown placeholder refused, a nested one refused, the element template and the element module asking for the same blocks in the same order, every page family filling its own template with no placeholder left over, and the not-found page filling to itself. | 5, 6 |
| `tests/pages/elements-index.test.js` | ✅ The index against the real 118: the route's declaration and the query parameter the home finder submits, the filter rule on names, symbols and exact atomic numbers, a query nobody matches returning nothing, a digit query finding one element, atomic order kept with no reordering, the status line's four wordings, and the filled page's 118 cards, each of them a link to a distinct element page. | 6 |
| `tests/pages/ranking.test.js` | ✅ Both rankings against the real records: the route's field and direction and its stylesheets, no step backwards anywhere in the order, the unmeasured elements all last in both directions, the extremes the reference agrees on (helium to carbon, helium to rhenium), the counts of measured and missing, every measured row printing its unit, and a route that names no field refused. | 6 |
| `tests/pages/orbital-configuration.test.js` | ✅ The page against the real records: the four blocks in the table's order at the counts the dataset asserts, every element in exactly one block, each row printing the record's own configuration and linking to the element, the derived nineteen exceptions named, and the filled page holding four blocks and the exception. | 6 |
| `tests/pages/*.test.js` | 🚧 The remaining page families: group pages, glossary, calculators. | 7–10 |

---

## 4. Quick lookup — "I need to change…"

| I need to change… | Open |
|---|---|
| A colour, size, radius or animation timing | `source/styles/tokens.css` |
| Why the site has one light theme only | `docs/ARCHITECTURE.md` — ADR-006 |
| What an element's data contains | `source/data/elements.json` and `docs/DATA_SOURCES.md` §5 |
| Where element data is fetched from | `source/tools/data-sources/pubchem.js`, `…/​wikidata.js`, and `docs/DATA_SOURCES.md` §2 |
| How an element is looked up | `source/scripts/data/elements-repository.js` |
| How many elements are in a category, or which ones | `source/data/categories.json` and `elements-repository.withCategory()` |
| Why an element is filed differently from the dataset | `source/data/overrides.json` |
| What unit a value is printed in | `source/data/units.json` and `scripts/data/units-repository.js` |
| Where an element sits on the table | `source/tools/data-sources/layout.js`, precomputed into `elements.json` |
| How many electrons are in each shell | `source/tools/data-sources/configuration.js`, precomputed into `elements.json` |
| The description, uses or sources paragraph for an element | `source/data/element-notes.json` |
| How to regenerate the element data | `node source/tools/build-data.js` |
| The periodic table's appearance or behaviour | `source/scripts/components/periodic-table.js` + `source/styles/components/periodic-table.css` |
| How the site finds an element by name, symbol or number | `source/scripts/components/element-search.js` |
| How the elements index filters its 118 cards | `source/scripts/pages/elements-index.js` |
| Which field a ranking orders by, and which way | `source/scripts/router/routes.js` (`ranking`), `source/scripts/pages/ranking.js` |
| Why an element is called an exception to the filling order | `source/scripts/lib/electron-configuration.js` |
| The f-block grid placement | `source/scripts/lib/grid.js` |
| The colour scale for a numeric view | `source/scripts/lib/colour-scale.js` |
| The home page's sections and its two diagrams | `source/pages/home.html` + `source/scripts/pages/home.js` |
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
