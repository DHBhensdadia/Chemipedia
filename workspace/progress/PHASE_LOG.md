# Phase Log — ChemiPedia

The status of every phase, its verification evidence, and its commit range. This is the file that
answers *"is that phase actually finished?"* — so it records evidence, never optimism.

Update it **after every meaningful milestone**, not only at the end of a phase. A phase's row is
`COMPLETE` only when the close-out checklist in `docs/TESTING_STRATEGY.md` §7 is honestly ticked.

**Status vocabulary:** `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`

---

## Summary

| Phase | Name | Status | Commits |
|---|---|---|---|
| 0 | Foundation, tooling and working system | `COMPLETE` | `81bf871`..`a16d35e` |
| 1 | Design system and global shell | `COMPLETE` | `2ba459d`..`cc2151f`, plus the close-out commit |
| 2 | Data layer (elements and glossary) | `IN_PROGRESS` | `d985245`..`26229e2` |
| 3 | Periodic table engine | `NOT_STARTED` | — |
| 4 | Home page | `NOT_STARTED` | — |
| 5 | Routing and element detail pages | `NOT_STARTED` | — |
| 6 | Elements index and attribute rankings | `NOT_STARTED` | — |
| 7 | Alternate periodic table views | `NOT_STARTED` | — |
| 8 | Element group pages | `NOT_STARTED` | — |
| 9 | Glossary | `NOT_STARTED` | — |
| 10 | Calculators and secondary pages | `NOT_STARTED` | — |
| 11 | Quality, accessibility, performance, delivery | `NOT_STARTED` | — |

---

## Phase 0 — Foundation, tooling and working system

**Goal:** a resumable repository with a working system, a development server, and a source tree
shaped by the accepted architecture.

**Work items**

| ID | Item | Status | Notes |
|---|---|---|---|
| 0.0 | Reference site audit | `VERIFIED` | Live browser inspection; design tokens read from computed styles and recorded in `docs/research/01-reference-site-audit.md`. |
| 0.1 | Tooling and Git standards research | `VERIFIED` | Two searches; recorded in `docs/research/02-*` and `03-*` with sources. |
| 0.2 | Workspace documentation system | `COMPLETE` | `AGENTS.md`, `WORKING_AGREEMENT.md`, `RUN_STATE.md`, `HANDOFF.md`, `docs/**`, `guides/**`, this file. |
| 0.3 | Git initialised with author identity | `COMPLETE` | Identity set repo-locally; verified on every commit. Tool directory excluded via `.git/info/exclude` so the tracked `.gitignore` stays free of tool names. |
| 0.4 | Source tree scaffolded, with the route manifest | `COMPLETE` | `source/scripts/router/routes.js`, `source/pages/`, `source/tools/site-paths.js`, `source/tests/`; the manifest, the path rules and the document skeleton are unit-tested. Commits `517f51c`..`90abe82`. |
| 0.5 | Dev server and verification harness | `COMPLETE` | Dev server verified over HTTP, and the page visually verified at three widths. The harness is the recipe in `docs/TESTING_STRATEGY.md` §4, which now records how to make the preview composite before a capture. Commits `4dcca48`+ |

**Exit criteria**

- [x] `git log` shows several coherent commits, all authored by the project author, no AI trace.
- [x] `node source/tools/serve.js` serves a placeholder page with zero console errors.
- [x] Every file in the repository appears in `docs/MIND_MAP.md`.
- [x] A fresh reader can go from `AGENTS.md` to a running site unaided — one command, no install.

**Verification**

```
node --test source/tests ............................. tests 22 · pass 22 · fail 0
node --check on every tracked module under source/ ... all modules parse
Brand scan over source/ .............................. PASS: brand scan clean
AI-attribution scan over all commit messages ......... PASS: no AI attribution in any commit message
git log --format='%an <%ae> | committer: %cn <%ce>' ... one identity: Devansh <dhbhensdadia@gmail.com>
                                                       on every commit, author and committer
git status --short .................................... clean

Served by the dev server, loaded in the browser:
  200 GET / ............................................ the built home page
  200 GET /assets/brand/favicon.svg ..................... the declared icon
  404 GET /missing/ ..................................... our not-found document, with its status
  301 GET /probe -> /probe/ ............................. canonical redirect, then 200
  405 POST / ............................................ non-GET methods refused
  404 GET /../package.json .............................. a traversal attempt resolves nowhere
  400 GET /%2e%2e/package.json .......................... refused before it reaches the file system

Console and network, on a clean page load: 0 console messages, 1 request, 200.
Layout, at each of the three widths: no horizontal overflow, no clipped text.
```

**Appearance — captured and inspected**

Screenshots were taken at all three widths from the served build and looked at. What they show, and
what was recorded about each:

| Width | What was seen | Differences from the reference |
|---|---|---|
| 1280 px | Unstyled browser rendering: serif default, no shell, no measure. Lede on one line, both sections and the list present, order correct, page does not overflow. | Everything visual: no type scale, no ink, no dotted rules, no shell, and body text runs the full viewport width — roughly 160 characters a line against a measure of 68. All of it is Phase 1's deliverable, and none of it is a defect in this phase. |
| 768 px | The same document, wrapping. No overflow, nothing clipped. | Same as above. |
| 375 px | The same document, wrapping further. Longest paragraph holds, list indents correctly, no horizontal scroll. | Same as above. |

Capture failed on the first attempts with the tool reporting that the preview webview was not being
composited. Resizing the preview so that it fills the panel makes it composite, and capture then
works; that is now step zero of the visual recipe in `docs/TESTING_STRATEGY.md` §4, so the next
session does not lose time to it.

The one substantive observation is the line length at desktop width. It is not a defect here,
because no stylesheet exists yet, but it is the first thing Phase 1 must fix: the shell and the
measure are what stop the page reading as an unstyled document.

**Close-out checklist**

```
Phase 0 verification
[x] node --test source/tests ................ pass  (tests 22 · pass 22 · fail 0)
[x] node --check on every changed module .... pass  (every tracked module under source/ parses)
[x] Brand scan .............................. PASS: brand scan clean
[x] Console/network on every touched page ... zero errors, zero failed requests
[x] Accessibility tree reviewed ............. one main landmark, one article, h1 then two h2 in order,
                                              a list; header, nav and footer arrive with the global
                                              shell in the design-system phase
[x] Keyboard traversal ...................... pass — the page has no interactive elements yet, so
                                              there is nothing to reach and no focus trap
[x] Reduced motion .......................... not applicable — no animation or transition exists yet
[x] 1280 px screenshot vs reference ......... compared — no styling exists to compare; see the table
[x] 768 px  screenshot vs reference ......... compared — as above
[x] 375 px  screenshot vs reference ......... compared — as above
[x] Regression check on an earlier phase .... none to check: this is the first phase with a page
[x] Deliberate deviations recorded .......... the favicon delivered early; folders a later phase
                                              owns left uncreated; the unstyled rendition, which
                                              is this phase's agreed starting point
[x] docs/MIND_MAP.md updated ................ yes, inside each commit that added a file
[x] RUN_STATE.md + HANDOFF.md updated ....... yes
```

**Commits:** `81bf871` initialise repository · `0074445` source boundary · `68e1fed` working
agreement · `6eb2e48` checkpoint system · `6082a63` research · `e3f6f58` plan and ADRs ·
`898aa74` design system and brand · `9a1dd43` data sources · `2414ba0` verification and commit
conventions · `3de07ad` mind map · `e4f7fc4` developer guides · `0ea045d` initialisation
verification · `58e2365` adopt confirmed decisions · `517f51c` project definition · `b131544` path
rules · `5b044f3` path rule tests · `aa7a3e0` route manifest · `9828aab` manifest tests ·
`333f12f` static build · `c998a3a` skeleton tests · `4dcca48` development server · `9597a5c`
README · `90abe82` spec reconciliation · `112ebfe` foundation verification record · plus the
close-out commit that records the captures and closes the phase

---

## Phase 1 — Design system and global shell

**Goal:** the complete token layer, base styles, layout primitives, header, submenu bar, footer, and
a style guide page rendering every token and component.

**Deliverables:** `source/styles/tokens.css`, `base.css`, `layout.css`; the shell components
`site-header`, `submenu`, `site-footer`, `wordmark`, `search-field` with their stylesheets;
`source/styleguide/index.html`; the route manifest carrying the shell's information architecture.
One theme only — light (ADR-006), so there is no `theme.css`.

**Exit criteria**

- [x] Style guide renders every token and component at 1280 / 768 / 375 px.
- [x] Colour values match the reference's computed values, verified in the browser.
- [x] No literal colour or size value exists outside `tokens.css`, with two named exceptions — see
  the note below.
- [x] Focus visible on every interactive element; heading order valid.
- [x] Every group-colour foreground pairing passes WCAG AA.
- [x] `prefers-reduced-motion` honoured.
- [x] Renders identically under a dark operating-system colour preference, since the site ships the
  light theme only (ADR-006).
- [x] Navigation and footer contain no Learn or Games entry; footer columns re-cut.
- [x] Brand scan clean.

**Verification**

```
node --test source/tests ............................. tests 51 · pass 51 · fail 0
node --check on every tracked module under source/ ... all modules parse
Brand scan over source/ .............................. PASS: brand scan clean
AI-attribution scan over all commit messages ......... PASS: no AI attribution in any commit message
git log --format='%an <%ae>' ......................... one identity: Devansh <dhbhensdadia@gmail.com>
hex colours outside styles/tokens.css ................ none

Measured against the reference in the browser, at 1280 px:
  heading font-size ............ reference 54.88px   ours --step-4  54.88px   exact
  section heading .............. reference 30.98px   ours --step-2  30.98px   exact
  submenu item and label ....... reference 13.6px    ours --step--1  13.6px   exact
  navigation item .............. reference 17.6px    ours --step-0   17.6px   exact
  navigation item order ........ reference Periodic Table, Elements, Learn, Games, Glossary,
                                 Calculations — ours Periodic Table, Elements, Glossary, Calculators
the content column ............. 1100px and 24px of page padding at every width, in both

Layout facts at 375 px: no horizontal overflow, no clipped text, masthead wraps to three rows
(lockup, navigation, search) exactly as the reference does, the submenu band wraps to two rows,
the footer's link grid falls to two columns of 151.5px, which is the reference's own figure.

Console and network: 0 console messages on load, 9 requests, all 200. The style guide loads 8
modules and 9 stylesheets with 0 console messages, which is also the first end-to-end check that
the components build in a browser and not only in Node.

Dark operating-system preference: prefers-color-scheme resolves to dark and the page still renders
#fdfbfa paper with #15403d ink, which is ADR-006.

Screenshots taken and looked at at 1280, 768 and 375 px, for the home page and the style guide,
compared side by side with the reference in a second tab of the same session.
```

**Verification notes**

- **The one substantive mismatch found, and fixed.** Headings were set in the bold weight. The
  reference sets them in the regular weight with -0.02em of tracking: its 54.88px heading is
  weight 400, and so is its 30.98px section heading. Both sizes matched our scale exactly, so the
  fix was one declaration, and the reason is recorded in `base.css` where the next person will
  find it.
- **The brand scan's near miss.** Reading the reference's footer while checking the column layout
  showed its own note begins *An open reference for the periodic table*, which our draft tagline
  closely echoed. The footer note was rewritten on the spot to be about provenance only, because a
  brand rule that is satisfied by paraphrase is not satisfied.
- **Literal values outside the token layer.** No colour value exists outside `tokens.css`, and the
  only size literals are the three breakpoints inside media queries, which cannot read a custom
  property, plus the structural idioms of an off-screen box in `base.css`. The breakpoints are now
  recorded in `tokens.css` as the single place the design states them.

**Deviations and scope notes**

| Item | Decision |
|---|---|
| `legend-chips` was listed for this phase | Moved to the phase that has the element data. A chip carries a member count and a group colour, and neither exists yet, so building it now would mean inventing data to fill it. |
| `scripts/app.js` was listed for this phase | Deferred to the phase that needs it. With one light theme and no router, an entry point would install nothing: it would be a stub file, which the working agreement forbids. |
| The footer's five columns sit in one row | The reference lays its five groups into a four-column grid, so its last group wraps to a second row with one item in it. Our five columns are re-cut for a site without the learning and games sections and are deliberately even, so they share one row. A wrapped single-item row is the one thing that would look like a column that lost its entries. |
| The footer's columns hold three to five entries each | Two of the reference's five columns were the removed sections. Ours hold only real destinations rather than filler, so the counts differ between columns. |
| `/element-groups/` was added to the inventory | The group pages are per-slug, so a column or a submenu that links to *groups* had nowhere in-scope to point. An index of the eleven groups is a small page inside ADR-002's accepted scope, and it is listed for the phase that builds the group pages. |
| The search field submits to `/` | The elements index, which owns search, arrives in the elements phase. Until then the query goes to the home page, which is a real destination rather than a page that does not exist. |
| The navigation links destinations not built yet | Accepted construction state. The manifest declares the whole inventory so the shell is complete and does not need editing as phases land; a destination whose template is not written answers with our own not-found page and 404 status. The build reports the count on every run, so the gap is visible rather than forgotten. |
| The submenu's active underline | Implemented as a 1px rule in the ink colour. Not yet compared against the reference's active state, which lives on a table-view page that does not exist here yet; it is verified in the alternate-views phase. |
| The identity is typographic | Matching the reference, whose masthead is a text lockup with no drawn mark. The own-drawn mark exists as `assets/brand/favicon.svg` and is not yet needed in the header. |

**Commits:** `2ba459d` design token layer · `c659417` base and layout layers · `10207be` readable
foreground for a group fill · `ddc23cd` one escape for every interpolated value · `6cbcc97`
full static inventory in the route map · `0e667dd` shell navigation, submenu and footer arrangement ·
`fe2a113` shell components · `8d5ca6f` shell rendering in the build · `1392eec` headings in the
regular weight · `cc2151f` navigation order

---

## Phase 2 — Data layer

**Goal:** 118 elements and 418 glossary terms as a documented, tested, reproducible data layer.

**Deliverables:** `source/data/elements.json`, `glossary.json`, `categories.json`, `units.json`;
repositories; `source/tools/build-data.js`; tests.

**Exit criteria**

- [x] Exactly 118 elements; uniqueness, lookups and count asserted by tests.
- [ ] 418 glossary terms — **moved to Phase 9**, with the reason below.
- [x] Every element resolves by number, symbol and slug.
- [x] Category member counts match the eleven expected values, asserted by the build and by a test.
- [x] Six elements spot-checked against an authoritative external source.
- [x] `docs/DATA_SOURCES.md` complete: both datasets, URLs, licences, retrieval date, output commits.
- [x] Unit tests green.
- [ ] **Visual gate open.** No screenshot was captured this session; see Deviations.

**Exit criterion moved, and why.** The plan lists the 418 glossary terms under this phase;
`docs/DATA_SOURCES.md` §3 has always said the definitions are Phase 9's work. Both cannot be right.
Resolved in favour of the split the data-source document already described: this phase delivers the
glossary's **contract** — the record schema, the repository that reads it, and the rules for A–Z
grouping, lookup and search, tested against a six-term fixture — and the glossary phase writes the
definitions. Four hundred definitions are writing, and writing them in the remains of a phase that
already authored 590 element entries is how a phase ships bad chemistry.

**Verification**

```
node --test source/tests ............................. tests 126 · pass 126 · fail 0
node --check on every changed module ................. all modules parse
Brand scan over source/ .............................. PASS: brand scan clean
Brand scan, as a test over the whole tree ............ pass
AI-attribution scan over all commit messages ......... PASS: no AI attribution in any commit message
git log --format='%an <%ae>' ......................... one identity: Devansh <dhbhensdadia@gmail.com>
mind-map completeness loop over git ls-files ......... PASS: every tracked file is indexed

node source/tools/build-data.js ...................... 118 elements, verified
  categories  transition-metals 35, actinides 15, lanthanides 15, post-transition-metals 8,
              unknown 8, noble-gases 7, non-metals 7, alkali-metals 6, alkaline-earth-metals 6,
              metalloids 6, halogens 5
  no prose    none
  units       unconverted: specificHeat (1) — one element records it with no unit at all
  elements with no melting point 15, no boiling point 25, no density 22, no electronegativity 23

The data layer run in a real browser, through the shipped module, against the built output:
  /data/elements.json ................................ 200, 199 711 bytes, 118 records
  118 elements and 11 categories ..................... loaded by the repository themselves
  iron by slug ....................................... { column 8, row 4 }, shells [2, 8, 14, 2]
  formatted readings ................................. 1537.85 °C, 7.874 g/cm³, gold 1064.18 °C
  a value the sources do not carry ................... oganesson melting point renders "Unknown"
  a slug that does not exist ......................... null, not an exception
  console and network ................................ 0 console messages, 8 requests, all 200

Spot checks against sources outside the two the data came from. The hardest value to get
right is a shell population, because it is derived, so uranium was checked against four
independent references — Wikipedia, American Elements, Chemicool and SchoolMyKids all give
2, 8, 18, 32, 21, 9, 2 and the configuration [Rn] 5f3 6d1 7s2, which is what the build derived.
Iron at 55.845 u, gold at 19.282 g/cm³ and uranium at 238.0289 u are the CIAAW values, and the
same sources give iron's melting point as 1538 °C against our 1537.85 °C — the difference is the
dataset's kelvin figure, not our conversion.

Layout regression on the home page, measured in the browser:
  1280 px ... shell 1100px, h1 54.88px at weight 400 with -1.0976px tracking, no horizontal
              overflow, paper #fdfbfa, navigation in the required order, four submenu items
   375 px ... no horizontal overflow, h1 fluid to 39.955px, 17 footer links
```

**Deviations and scope notes**

| Item | Decision |
|---|---|
| **No screenshot was captured.** | The preview webview would not composite: every capture reported that it produced no frames. Filling the preview first, which fixed the same failure in the previous session, did not fix it this time, and neither did reloading or opening a fresh tab. Recorded as an **open gate**, not as a passed check. Phase 2 adds no page surface of its own, so what is missing is a regression capture of the home page, not a comparison of anything new. |
| The datasets are two, not one | No single openly licensed source was found that supplies the whole schema under a licence ADR-005 permits. PubChem is public domain and carries seventeen columns; Wikidata is CC0 and carries the thermal and atomic-scale properties PubChem omits. The community JSON files that dominate a search for this data are almost all ShareAlike, which would attach to our generated file. |
| Category assignment departs from the dataset in nine places | PubChem files 109, 110, 111 as transition metals, 113 to 116 as post-transition metals, 117 as a halogen and 84 as a metalloid. Its counts are therefore 38 / 11 / 7 / 6 / 0 against the required 35 / 8 / 6 / 5 / 8. Each of the nine corrections is recorded in `source/data/overrides.json` with the chemistry that justifies it, and a test holds the result to the required counts. |
| `covalentRadius` and `latticeParameters` are null for all 118 | Neither source carries them, and inventing a value is not an option. Kept in the schema so the shape does not change when a source is found. |
| `ionicRadius` was dropped from the schema | An ionic radius belongs to an ion, not an element: the same atom is a different size at every charge. Wikidata models one value per charge and printing one of them beside the name would assert something untrue of the element. Recorded in `docs/DATA_SOURCES.md` so the next person finds the argument rather than having to have it again. |
| `description` was dropped from the schema | It and `summary` are the same paragraph under two names, and a schema with two names for one thing drifts. |
| `ionizationEnergies` holds one value, not several | The dataset supplies the first ionisation energy only. The page will say so rather than imply a full series. |
| The 418 glossary definitions | Moved to Phase 9; see the note above the verification block. |
| Shell populations are read, not calculated | The Madelung filling order gets chromium, copper and palladium wrong. The dataset's own configuration is expanded instead, and the build refuses a configuration that does not account for every electron — which is the check that makes the difference visible. |

**Commits:** `d985245` record the datasets and licences · `9460ae0` build the element data layer ·
`ac0404f` write the notes for every element · `26229e2` add the glossary repository

---

## Phase 3 — Periodic table engine

**Goal:** one reusable, accessible, data-driven table component with four colour modes.

**Exit criteria**

- [ ] All 118 tiles in correct grid positions, asserted for every f-block element.
- [ ] Four colour modes render; legend counts match the data.
- [ ] Group isolation works by mouse and by keyboard.
- [ ] Arrow-key navigation traverses the grid; focus always visible.
- [ ] Horizontally scrollable on narrow screens without clipping the first or last column.
- [ ] Tile geometry and colour mapping visually compared against the reference.

**Verification:** _pending_ · **Commits:** _pending_

---

## Phase 4 — Home page

**Exit criteria**

- [ ] Section order, rhythm and spacing match the reference at all three widths.
- [ ] Hovering a legend chip isolates that group.
- [ ] Element search returns correct results and navigates correctly.
- [ ] Replaces the reference's Learn block with in-scope teasers.
- [ ] Zero console errors.

**Verification:** _pending_ · **Commits:** _pending_

---

## Phase 5 — Routing and element detail pages

**Exit criteria**

- [ ] All 118 detail pages render with complete, correct data.
- [ ] Deep links work from a cold load; back and forward behave; 404 handled.
- [ ] Electron shell diagram correct for H, C, Fe, Au, U.
- [ ] Generated FAQ answers agree with the element's own property values.
- [ ] Previous/next wraps correctly at both ends.
- [ ] Degrades to a plain multi-page site with JavaScript disabled.

**Verification:** _pending_ · **Commits:** _pending_

---

## Phase 6 — Elements index and attribute rankings

**Exit criteria**

- [ ] Search filters on name, symbol and atomic number.
- [ ] Rankings monotonic; unknown values sort last; extremes spot-checked.
- [ ] All 118 cards render and link correctly.

**Verification:** _pending_ · **Commits:** _pending_

---

## Phase 7 — Alternate periodic table views

**Exit criteria**

- [ ] Four views render correct colour mappings and legend counts.
- [ ] Continuous scales verified at both domain endpoints and for an out-of-range value.
- [ ] Each view visually compared against its reference counterpart.

**Verification:** _pending_ · **Commits:** _pending_

---

## Phase 8 — Element group pages

**Exit criteria**

- [ ] Eleven group pages; member counts match the expected values exactly.
- [ ] Every member link resolves.
- [ ] Group colour applied from the token layer, no literals.

**Verification:** _pending_ · **Commits:** _pending_

> **Reminder:** the reference's `/element-groups/:slug` family has not been audited yet. Audit it live
> before implementing, and append the findings to `docs/research/01-reference-site-audit.md` §3.6.

---

## Phase 9 — Glossary

**Exit criteria**

- [ ] 418 terms render; A–Z grouping and jump index correct and complete.
- [ ] Filtering works on term and definition text.
- [ ] Every term page resolves; no dead cross-links.
- [ ] Cross-links between glossary terms and element properties resolve.

**Verification:** _pending_ · **Commits:** _pending_

---

## Phase 10 — Calculators, downloads and secondary pages

**Goal:** the temperature calculator, the downloads area, and About and Contact. Scope fixed by
ADR-002.

**Exit criteria**

- [ ] Conversions round-trip; `0 °C = 32 °F = 273.15 K`; `−40 °C = −40 °F`.
- [ ] Invalid input handled gracefully, no console errors.
- [ ] About and Contact contain no reference prose or brand, and About carries the data-provenance
  section required by ADR-005.
- [ ] Every download target resolves in the built output, and the printable periodic table fits a
  single page at both A4 and Letter.

**Verification:** _pending_ · **Commits:** _pending_

---

## Phase 11 — Quality, accessibility, performance and delivery

**Exit criteria**

- [ ] Accessibility sweep passed: landmarks, headings, labels, contrast AA, reduced motion, full
  keyboard traversal, focus management on route change.
- [ ] Responsive audit passed at 375 / 768 / 1024 / 1440 px on every page.
- [ ] Performance measured and recorded; no render-blocking work.
- [ ] Per-page titles, descriptions, canonical, Open Graph, structured data; `sitemap.xml`;
  `robots.txt`.
- [ ] Print stylesheet for the table and element pages.
- [ ] Documentation current; no `TODO` in tracked files.
- [ ] Deployed; `v1.0.0` tagged.
- [ ] A clean clone runs and deploys following only the README.

**Verification:** _pending_ · **Commits:** _pending_

---

## Blockers and deviations log

Record anything that stopped progress, and any deliberate deviation from the reference.

| Date | Phase | Type | Detail | Resolution |
|---|---|---|---|---|
| 2026-10-01 | 0 | Decision pending | ADR-001 (architecture), ADR-002 (page scope), ADR-003 (commit convention) awaiting author confirmation | Raised with author. ADR-001 blocks work items 0.4 and 0.5, and therefore the whole source tree. ADR-002 only affects Phases 9–10. ADR-003 affects every future commit. |
| 2026-10-01 | 0 | Deviation | The agent tool directory is excluded through `.git/info/exclude` rather than the tracked `.gitignore`, so that the committed ignore rules never name a development tool. | Intentional. Local to this checkout; nothing to review. |
| 2026-10-01 | 0 | Deviation | **Single light theme.** The reference switches to a dark variant at runtime; we ship the light palette only (ADR-006). A side-by-side comparison in a dark-preference context will therefore differ on purpose. | Accepted by the author. Reversible without a refactor, because the token names are theme-neutral. |
| 2026-10-01 | 0 | Scope decision | The reference's blog and tutoring pages are excluded, while its glossary, group pages, calculator, downloads and about/contact pages are in scope (ADR-002). | Accepted by the author. Adds the downloads area and a print stylesheet to Phase 10 and Phase 11. |
| 2026-10-01 | 0 | Deviation | **The favicon was drawn in Phase 0 rather than Phase 1.** A document that declares no icon still makes every browser request one and fail, which is a failed request on every page and would fail the health gate for every phase. The rest of the brand — wordmark, mark, social image — stays in Phase 1, where the favicon is refined alongside them and given a raster fallback. | Accepted. The mark is our own drawing, uses two token colours, and is listed in `docs/MIND_MAP.md` as a Phase 0 and Phase 1 file. |
| 2026-10-01 | 0 | Deviation | **Folders a later phase owns were left uncreated** rather than created empty: `styles/`, `data/`, and most of the `scripts/` and `tests/` layers. Git does not track an empty directory, and the alternative — a placeholder file in each — is the stub the working agreement forbids. Each folder arrives with its first real file. | Accepted. The plan's Phase 0 deliverable list records the same exception. |
| 2026-10-01 | 0 | Blocker | **Screenshot capture failed at first.** The browser tool reported that the preview webview was not being composited, so no frame could be captured at any width. | Resolved in the same session: resizing the preview so that it fills the panel makes the webview composite, and all three captures then succeeded. The step is now the first line of the visual recipe in `docs/TESTING_STRATEGY.md` §4. |
| 2026-10-01 | 0 | Observation | **Body text runs the full viewport width at desktop** — about 160 characters a line against a measure of 68. Visible in the 1280 px screenshot. | Not a defect of this phase: the page is deliberately unstyled. Recorded as the first thing the design-system phase must fix, since the shell and the measure are what make it read as a designed page. |
| 2026-10-01 | 2 | Blocker | **Screenshot capture failed, again, and the known fix did not work.** Every attempt reported that the preview produced no frames because the webview was not being composited. Filling the preview first — which resolved the identical failure in the foundation phase, and is step zero of the recipe — did not resolve it; neither did reloading the tab nor opening a fresh one. | **Open.** The appearance gate for Phase 2 is not satisfied and is recorded as unmet rather than as passed. Layout was measured numerically in the browser instead, at 1280 and 375 px. Phase 2 adds no page surface, so what is outstanding is a regression capture of the home page. Retry at the start of the next session. |
| 2026-10-01 | 2 | Scope decision | **The 418 glossary definitions moved from this phase to the glossary phase.** The plan listed them here; `docs/DATA_SOURCES.md` §3 has always scoped them to Phase 9. Two documents disagreeing is a defect in itself. | Resolved in favour of the data-source document, and both documents now say the same thing. This phase delivers the glossary's schema, repository and tests; Phase 9 writes the definitions. |
| 2026-10-01 | 2 | Deviation | **The element dataset's category assignment is corrected in nine places** to reach the eleven counts this project asserts. PubChem files the superheavy elements under transition metal, post-transition metal, metalloid and halogen; their chemistry is unmeasured, so calling them any of those asserts more than is known. | Accepted and recorded per element in `source/data/overrides.json` with its chemistry, so the choice is defensible rather than convenient. A test holds the eleven counts to their required values. |
| 2026-10-01 | 2 | Deviation | **Two schema fields stay null for every element** (`covalentRadius`, `latticeParameters`) and **one was removed from the schema** (`ionicRadius`). | Recorded in `docs/DATA_SOURCES.md` §2.1 and §5. null means unknown and the UI renders it as such; the removed field was removed because an ionic radius belongs to an ion and not to an element. |

---

## How to record a phase close-out

1. Fill every line of the close-out checklist in `docs/TESTING_STRATEGY.md` §7 — honestly.
2. Paste the checklist, filled in, into that phase's **Verification** section above.
3. List the commit hashes that make up the phase.
4. Set the phase status to `COMPLETE` in the summary table.
5. Update `RUN_STATE.md` to point at the next phase, and rewrite `HANDOFF.md`.
6. Tag the milestone if it warrants one (`docs/GIT_WORKFLOW.md` §7).
