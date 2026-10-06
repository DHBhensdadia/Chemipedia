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
| 2 | Data layer (elements and glossary) | `COMPLETE` | `d985245`..`26229e2`, `30f203b`, plus the close-out commit |
| 3 | Periodic table engine | `COMPLETE` | `bf1d8e3`..`2f06018`, plus the close-out commit (`b7201a0`); visual criterion closed by `1db2fc7` |
| 4 | Home page | `COMPLETE` | `7587a66`..`7837dce`, plus the close-out commit |
| 5 | Routing and element detail pages | `COMPLETE` | `4763e89`..`2cd6460`, plus the close-out commit |
| 6 | Elements index and attribute rankings | `COMPLETE` | `6cd3b14`..`44e3493`, plus the close-out commit |
| 7 | Alternate periodic table views | `COMPLETE` | `a0b0df8`..`d1a4ad4`, plus the close-out commit |
| 8 | Element group pages | `COMPLETE` | `a49dd6d`..`54832b4`, plus the close-out commit |
| 9 | Glossary | `COMPLETE` | `5a05a1f`..`73fbb47`, plus the close-out commit |
| 10 | Calculators and secondary pages | `COMPLETE` | `df4d60e`..`b9999d3`, plus the close-out commit |
| 11 | Quality, accessibility, performance, delivery | `COMPLETE` | `f1cef8e`..`ec80c43`, plus the close-out commit; tagged `v1.0.0` |
| Publish | The push, and the deployment it corrected | `COMPLETE` | `e035c6f` pushed as the release, then `bd338dd` (the fix), plus the close-out commits; tagged `v1.0.1` |

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
- [x] Visual gate passed at the start of the next session, when the preview composited again. The
  home page was captured and compared against the reference at 1280 / 768 / 375 px. Two chrome
  differences it found were fixed; one difference is a recorded deviation.

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

Visual gate, taken at the start of the following session — this phase's one unmet criterion.
The preview composited on the first attempt, so all three captures were taken and looked at,
with the reference open in a second tab of the same session:
  1280 px ... shell 1100px at x 90, band 33px, masthead 59px, h1 54.88px at weight 400 with
              -1.0976px tracking, navigation in the required order, four submenu items, five
              footer columns on one row, 17 footer links, no horizontal overflow
   768 px ... no horizontal overflow, h1 46.95px, masthead 59px in one row, band 33px
   375 px ... no horizontal overflow, h1 39.955px with -0.7991px tracking, which is the
              reference's own figure for its own heading, shell 327px with 24px of page
              padding, band wraps to two rows, footer columns 152px, 17 footer links
Console and network: 0 console messages on the home page and on the style guide, whose 18
requests all answered 200. The accessibility tree was read: one banner, one Primary
navigation, one search landmark, one Section band, one main, one contentinfo, and a working
skip link ahead of all of them.

Two differences were found in the chrome and fixed rather than recorded as deviations. The
band's label read "Explore periodic tables" where the reference reads "Explore Periodic
Tables:", and the band measured 31.76px where the reference measures 33px, because the
reference gives its band row a height of 32px and ours took the height of its tallest item.
Both are corrected in `30f203b`.

One difference is deliberate and is recorded in the deviations table: at 768px the reference
wraps its search field onto a second masthead row and ours stays on one, because our
navigation carries four items where the reference carries six.
```

**Deviations and scope notes**

| Item | Decision |
|---|---|
| **The visual gate could not be run in the phase itself.** | The preview webview would not composite: every capture reported that it produced no frames, and filling the preview first — which fixed the same failure in the foundation phase — did not fix it this time, nor did reloading or opening a fresh tab. Recorded as an **open gate**, not as a passed check, and left as the phase's one unmet criterion. Phase 2 adds no page surface of its own, so what was missing was a regression capture of the home page. | **Run and passed at the start of the following session.** The preview composited on the first attempt, the two differences it found were fixed in `30f203b`, and the phase closed on those captures. |
| **The band's label and height did not match the reference.** | Found by the visual gate. The reference's label reads `Explore Periodic Tables:` where ours read `Explore periodic tables`, and its band measures 33px including the dotted rule where ours measured 31.76px. | Fixed in `30f203b`: the label is copied exactly from the reference's chrome, and `--height-submenu` was added to the token layer as a minimum row height — a minimum because the band wraps to two rows on a narrow screen and a fixed height would clip the second. |
| **The masthead stays on one row at 768px.** | The reference wraps its search field onto a second masthead row there. Its navigation carries six items and ours carries four, because the learning and games sections are out of scope, so its wrap follows from the length of its own navigation rather than from a rule we are declining. | Accepted. Measured, not assumed: the reference's masthead is 91px in two rows at 768px and ours is 59px in one. Forcing the wrap would separate our navigation from its search field for no reader's benefit. |
| The datasets are two, not one | No single openly licensed source was found that supplies the whole schema under a licence ADR-005 permits. PubChem is public domain and carries seventeen columns; Wikidata is CC0 and carries the thermal and atomic-scale properties PubChem omits. The community JSON files that dominate a search for this data are almost all ShareAlike, which would attach to our generated file. |
| Category assignment departs from the dataset in nine places | PubChem files 109, 110, 111 as transition metals, 113 to 116 as post-transition metals, 117 as a halogen and 84 as a metalloid. Its counts are therefore 38 / 11 / 7 / 6 / 0 against the required 35 / 8 / 6 / 5 / 8. Each of the nine corrections is recorded in `source/data/overrides.json` with the chemistry that justifies it, and a test holds the result to the required counts. |
| `covalentRadius` and `latticeParameters` are null for all 118 | Neither source carries them, and inventing a value is not an option. Kept in the schema so the shape does not change when a source is found. |
| `ionicRadius` was dropped from the schema | An ionic radius belongs to an ion, not an element: the same atom is a different size at every charge. Wikidata models one value per charge and printing one of them beside the name would assert something untrue of the element. Recorded in `docs/DATA_SOURCES.md` so the next person finds the argument rather than having to have it again. |
| `description` was dropped from the schema | It and `summary` are the same paragraph under two names, and a schema with two names for one thing drifts. |
| `ionizationEnergies` holds one value, not several | The dataset supplies the first ionisation energy only. The page will say so rather than imply a full series. |
| The 418 glossary definitions | Moved to Phase 9; see the note above the verification block. |
| Shell populations are read, not calculated | The Madelung filling order gets chromium, copper and palladium wrong. The dataset's own configuration is expanded instead, and the build refuses a configuration that does not account for every electron — which is the check that makes the difference visible. |

**Commits:** `d985245` record the datasets and licences · `9460ae0` build the element data layer ·
`ac0404f` write the notes for every element · `26229e2` add the glossary repository · `30f203b`
match the submenu band to the reference's label and measured height · plus this close-out commit

---

## Phase 3 — Periodic table engine

**Goal:** one reusable, accessible, data-driven table component with four colour modes.

**Deliverables:** `scripts/components/periodic-table.js`, `element-tile.js`, `legend-chips.js`;
`scripts/lib/grid.js`, `colour-scale.js`, `keyboard.js`; the three matching component
stylesheets and the table section of the token layer; logic and component tests; the table demo in
`source/styleguide/index.html`.

**Exit criteria**

- [x] All 118 tiles in correct grid positions, asserted for every f-block element. A test walks
  every element against its record's own `position`, and every f-block element against rows 9 and
  10, columns 3–17, with the `grid-column`/`grid-row` it is drawn with.
- [x] Four colour modes render; legend counts match the data. Group: eleven chips in taxonomy order
  carrying the declared counts. Block: 14/36/38/30. State: 104/2/12, with no zero-count chip. The
  numeric view bands every measurement into the data's own domain, six bands plus the unknown
  colour, and its legend prints 0.7, 3.98 and the unknown swatch.
- [x] Group isolation works by mouse and by keyboard. Verified in the browser through the shipped
  attachment: a click and a focus each isolated the halogens — five tiles matched, every other tile
  fell to `opacity: 0.22` with `saturate(0.35)` — and a press pinned and unpinned the key.
- [x] Arrow-key navigation traverses the grid; focus always visible. Right from hydrogen reaches
  helium, down from rutherfordium reaches cerium in the detached row, Home and End reach a row's
  ends, and an edge step neither moves nor swallows the key. One tile is in the tab order at a
  time and it follows focus; a focused tile is exempt from isolation's dimming; focus scrolls into
  view, and at a narrow width it lands inside the opaque part of the edge fade.
- [x] Horizontally scrollable on narrow screens without clipping the first or last column. At
  375px the grid keeps a 700px minimum, the first column begins at the 16px mark where the edge
  fade becomes opaque, and after a keyboard move to the last column the scroller is at its maximum
  and the final tile ends at the same 16px inset. At 768px the same holds with an 820px minimum,
  and the names are still shown.
- [x] Tile geometry and colour mapping visually compared against the reference. **Captured and
  diffed**, twice over. Within the session that built the engine the preview would not composite,
  so the criterion was left open on the measurements below; the next session built the harness in
  `workspace/tools/visual` (Track B of `docs/research/02`), which put both tables in one headless
  browser and compared them pixel by pixel. The table's crop is **2.28% different at 1280px, 4.22%
  at 375px**, every box identical in size and position, and the residual is the typeface the brand
  rules require us to choose for ourselves. See Phase 4's verification for the full method.

**Verification**

```
node --test source/tests ............................. tests 194 · pass 194 · fail 0
node --check on every changed module ................. all modules parse
Brand scan over source/, as a test ................... pass
Commit identities .................................... one: Devansh <dhbhensdadia@gmail.com>

Tile geometry, both tables measured in the same browser session at 1280px, light scheme pinned
(ours / the reference):
  container ......................... 1228.8px / 1228.8px
  gap ............................... 3.07199px / 3.07199px
  tile .............................. 65.36px / 65.37px        (one hundredth of a pixel)
  radius ............................ 3px / 3px
  padding ........................... 4px 2.4px / 4px 2.4px
  symbol / name / number ............ 26.4191 / 9.83037 / 10.4448px — identical on both sides
  grid .............................. 18 columns × 10 rows, 118 tiles, 11 group chips — both

Four modes, read from computed styles in the style guide:
  group   hydrogen #a6c6d5 with #12211f ink · 11 chips, counts exact against categories.json
  block   s #456683 cream · p #97c0aa dark · d #f9aa62 dark · f #d473a2 dark
  state   solid #456683 cream · liquid #559982 dark · gas #e57860 dark
  en      fluorine band 5 #15403d cream · francium band 0 #dce9f0 dark · helium none #e8e2dc
          domain 0.7–3.98 from the data · six band swatches plus the unknown swatch

Keyboard, through the listeners the shipped module attaches:
  right from H → He across period one's gap · down from H → Li
  down from Rf → Ce, across row eight and the empty cells of column 3
  Home / End → a row's ends · the left edge of H does not move and does not swallow the key
  exactly one tile carries tabindex 0, and it follows the focused tile

Isolation, by click and by focus:
  halogens → 5 tiles matched, everything else at opacity 0.22 and saturate(0.35)
  focusing another chip shows that key while the pressed one stays pinned; leaving returns to it;
  pressing it again clears the table
  a focused tile stays at opacity 1 while the grid is isolated

Narrow screens (the same session):
  375px  grid min-width 700 · scroller 375/732 · first column at 16px · after a move to the last
         column, scrollLeft 357 = max and the final tile ends at 359 = 375 − 16
  768px  grid min-width 820 · names shown · last column ends at 752 = 768 − 16 · masks on both

Health: with error and rejection listeners installed, all four modes switched, six key movements
and two chip presses produced 0 errors and 0 unhandled rejections; 32 resources loaded and none
answered 4xx or 5xx. The preview's own console/network capture recorded nothing this session, so
the instrumented listeners are the evidence rather than `preview_logs`.

The accessibility tree read in the browser: one named list of 118 items, each "Name, symbol X,
atomic number N"; the eleven chips named with their counts; the four mode controls with their
pressed states.

One thing the reference does not have and this phase adds, because the plan requires it: roving
focus. The reference's tiles are ordinary tab stops, so a keyboard user walks through 118 links.
Ours puts one tile in the tab order and moves it with the arrows.
```

**Deviations and scope notes**

| Item | Decision |
|---|---|
| **The visual capture could not be taken.** | The preview webview produced no frames for any capture, and neither `preview_resize {fill: true}` nor a freshly opened tab changed that. | Recorded as an **open gate**, not as a passed check, exactly as Phase 2's was: the criterion above stays unticked and the phase is `VERIFIED`, not `COMPLETE`. The measured comparison is written down above the table so the retry starts from evidence rather than from nothing. The retry at the start of the next session failed the same way — see the log at the foot of this file. |
| The state legend shows three chips, not four | Our dataset records a state for every element, so the unknown state has nothing behind it. | A chip with a zero beside it is noise, so the legend omits keys with no members. The `--state-unknown` token stays, because the taxonomy is four states even when the data fills three. |
| The scroll and hide-names breakpoints are 56rem and 40rem | The reference scrolls at 900px and hides names at 560px. | Our breakpoint scale is the project's own and is recorded in the token layer; 896px and 640px are the same two decisions expressed in the units the rest of the site uses. |
| The electronegativity band counts differ from the reference's | The reference bands 100 measured values; ours has 95 measured and 23 unknown. | The domain is computed from our own data rather than written down, so the legend and the tiles cannot disagree; the counts follow from the dataset, not from the reference's. |
| Colours are emitted as keys, not as custom properties | The reference writes `--fill` and `--on-fill` inline as hex values on every tile. | A hex literal in JavaScript is a colour outside `tokens.css`, which the project forbids. Tiles carry `data-key` or `data-band`; `periodic-table.css` maps each to a token. A test holds every pairing to the foreground `lib/contrast.js` chooses. |
| The legend's chips are buttons in the engine | On the reference's home page a chip links to its group page. | Buttons here, because the component's contract is isolation; the chip module renders a link when a caller passes a destination, which the group pages will use in Phase 8. |

**Commits:** `bf1d8e3` lay out the table grid, its colour scale and its keyboard rules · `2f06018`
render the periodic table in four colour modes · plus this close-out commit

---

## Phase 4 — Home page

**Goal:** the front door — the table itself, the two ideas it assumes (periods and groups), the ways
deeper into the site, and a way to find one element.

**Deliverables:** `pages/home.html` rewritten from the placeholder; `scripts/pages/home.js`;
`styles/pages/home.css`; `scripts/components/element-search.js` and its stylesheet; the engine's
optional hint line; the home page section of the token layer; and — found by this phase's first
measurement — the route manifest carrying the component stylesheets a page uses, with the build
linking them.

**Exit criteria**

- [x] Section order, rhythm and spacing match the reference at all three widths. **Measured,
  captured and diffed** at 1280, 768, 375 and 560px: screenshots of both pages, a pixel diff and a
  region-by-region comparison, all in one headless browser. Every box now matches — including the
  four differences the capture found and the closing source commit fixed. What remains is
  enumerated under Deviations, and it is typeface and copy rather than layout.
- [x] Hovering a legend chip isolates that group. On the built page, pressing the "Transition metal
  35" chip left 35 tiles matched and the other 83 at `opacity: 0.22` with `saturate(0.35)`;
  pressing it again returned all 118 to full.
- [x] Element search returns correct results and navigates correctly. "gold" offers one result — Au
  · Gold · 79 — linking `/elements/gold/`; "6" offers carbon by atomic number; "zzz" and
  "unobtainium" offer nothing; and Enter goes to the first match, proven by real navigation earlier
  in the session, the link it follows being the same destination.
- [x] Replaces the reference's Learn block with in-scope teasers. Three, each a page this site
  publishes — the glossary, the temperature calculator and the table views — and a test holds the
  list to those three.
- [x] Zero console errors. With error and unhandled-rejection listeners installed, six search
  queries, four chip presses and six keyboard moves produced 0 errors and 0 rejections over 28
  resources, none of which failed. The preview's own console capture recorded nothing for the
  second session running, so the instrumented listeners are the evidence.

**Verification**

```
node --test source/tests ..................... tests 221 · pass 221 · fail 0
node source/tools/build.js .................. 1 route + the not-found page; 14 awaiting templates
node --check over the changed modules ........ all modules parse
Brand scan over source/, as a test ........... pass

One browser session, the built page and the reference measured side by side at 1280px
(ours / the reference):
  h1 .......................... 54.88px over 1100px / 54.88px over 1100px
  hero paragraph .............. 848px wide at 23.2px / 851px wide at 23.2px
  table container ............. 1228.8px / 1228.8px
  gap · tile · symbol ......... 3.07199 · 65.36 · 26.4191px / 3.07199 · 65.37 · 26.4191px
  explainer columns ........... 300px + 688px, padded 48px 32px / 300px + 686px, same padding
  finder field ................ 260px, padding 12px 16px, type 17.6px, radius 2px,
                                1px solid #cfc5bc — the reference's, to the number, and 54.15px
                                tall in both after the closing commit; before it, 46.5
  finder button ............... 12px 24px on #15403d with #fdfbfa / identical
  closing section ............. "Looking for an element?" above the field / "Looking to find an
                                element?" above its own, near the foot of the page in both
  vertical rhythm ............. 32px above and below each dotted separator, 48px around the
                                explainers / a 64px rule block between sections, 48px inside
                                its explainers
  horizontal overflow ......... none at 1280 · 768 · 375

At 768px: the table goes full-bleed with an 820px grid minimum and its first column at the 16px
inset where the edge fade turns opaque; the explainer collapses to one 656px column; the teasers
sit two across; nothing overflows.
At 375px: grid minimum 700px, names hidden, the first column still at the 16px mark, the
explainer one 263px column, the finder wrapped to field above button, teasers one across, nothing
overflows.

The built page's structure: one h1, one main, headings in reading order, 118 list items inside a
list named "Periodic table of the elements", and the finder's form labelled and keyboard-reachable.
```

**Deviations and scope notes**

| Item | Decision |
|---|---|
| **The preview's own screenshots never worked, so the harness was built.** | Two sessions of `preview_screenshot` failing to composite; Track B of `docs/research/02` had been written down and never taken. | `workspace/tools/visual` now drives the system Chrome headlessly, captures both pages at the same width and colour scheme, diffs them pixel by pixel and compares every measurement. Dev-only, under `workspace/`, imported by nothing in `source/`. Its first run found four real differences the measurements had missed (the legend 64px off the page's column, a heading a pixel short, a measure 3px narrow, a finder breaking onto two rows) — all fixed in `7837dce`. |
| **What still differs from the reference, and why it never will match exactly** | The typeface: the reference sets a commercial face, and `docs/BRAND_GUIDELINES.md` §2 requires our own stack, so glyph widths differ by 0.6–3px and the table's crop stays 2.28% different. The copy: the hero, the legend labels and the hint line are our sentences, and the reference's own are its property. The content below the fold: its home carries an extra section and eleven article cards we do not publish (ADR-002). | Recorded rather than chased. Every box, gap, size, colour and breakpoint that is measurable matches; the differences left are the two the brand rules demand and one scope decision already on record. |
| **The build was not linking a page's component stylesheets.** | The manifest declared routes; the build linked the global layer, the shell and the page's own sheet. The first real page arrived with the table unstyled and the search field drawn by the browser. | Fixed in `7587a66`: a route names the component sheets it uses, the build links them in cascade order, and a test holds every declared path to a real file. The style guide had hidden this by linking the three sheets by hand. |
| The reference's Learn articles are not replicated | Its home carries article cards from a blog this project does not publish (ADR-002). | Three teasers into pages that exist: the glossary, the temperature calculator and the table views. A test holds the list to those three. |
| Our explainers say "Periods" and "Groups" in our own words | The reference's explainers carry their own copy, and its article titles are its brand. | The structure is measured from the reference — the same two-column explainer, the same 300px text column, a schematic in the second — and the sentences are ours. |
| The finder's field is the one search with a visible box | The masthead search stays bare, as the reference's is. | The finder is a destination rather than a shortcut, so it is drawn as a control: bordered in the stronger hairline, with the ink button beside it. |

**Commits:** `7587a66` link the component stylesheets a route declares · `596fc15` add the element
finder and the table's hint line · `0eab574` build the home page around the table · `74c168d` match
the finder's control height · `1db2fc7` the visual harness · `7837dce` match the page to the
reference's own measurements · plus this close-out commit

**The capture pass that closed both phases.** `workspace/tools/visual/compare.mjs` opened
`http://127.0.0.1:4180/` and the reference in the same headless Chrome, at 1280, 768, 375 and 560px,
light colour scheme and reduced motion pinned on both sides:

```
                        ours                      reference                 pixels
1280px  table crop      1228.8 × 625.52 at y422.39  1228.8 × 625.52 at y422.39   2.28%
        hero crop      1100 × 60.36    at y140     1100 × 60.36    at y140      6.80%
        finder crop    1100 × 54.14    at y2536    1100 × 54.14    at y3367     12.00%
768px   table crop      820 × 420.61    at y439.19  820 × 420.61    at y469.81   8.86%
        finder crop     720 × 52.8      at y2995    720 × 52.8      at y3521     6.97%
375px   table crop      700 × 360.16    at y850.81  700 × 360.16    at y827.92   4.22%
        finder crop     327 × 51.64     at y3306    327 × 51.64     at y3944     12.26%
560px   table crop      700 × 360.31    at y585.77  700 × 360.31    at y637.81   5.32%

whole viewport, the home page at 1280px ..................................... 4.87% different
  (2.28 points of it is the table's glyphs; the rest is copy and one section fewer)

boxes that differ in size: none at any width. Every gap, padding, radius, border, type size,
line-height and colour that both pages have an element for is equal to the reference's.
```

Four differences were found by looking at the pictures rather than at the numbers, and each was
read off the reference before it was changed: the legend and the hint sat inside the table's
bleeding container and so started 64px left of the page's column; the hint wrapped to two lines
where the reference's is one; the chips were 4px taller; and the finder broke onto two rows on a
phone where the reference's field shrinks instead. The measurements underneath had matched before
those fixes, which is the point of a capture.

---

## Phase 5 — Routing and element detail pages

**Goal:** the 118 deepest pages, from one template.

**Work items**

| ID | Item | Status | Notes |
|---|---|---|---|
| 5.0 | The router | `COMPLETE` | `navigationFor` is the whole decision — same origin, no modifiers, no download or new tab, no fragment on this page, no file with an extension — and returns a URL or null with no DOM in it. `createRouter` pushes the URL, fetches the document a full load would get, swaps the body while refusing the incoming scripts and carrying the running one, renames the page from the fetched body, moves focus to the main landmark, and restores the reader's place on a history move. A document the site answers 404 with is shown; anything else is handed back to the browser. |
| 5.1 | The element family, one template and one module | `COMPLETE` | `pages/element-detail.html` is the skeleton — eleven placeholders in reading order — and `pages/element-detail.js` computes every block from the record: strip, hero and miniature table, headline, lede, FAQ, prose, counts, properties, orbital figure, siblings, pager. |
| 5.2 | The property panel, the FAQ and the shell diagram | `COMPLETE` | Three components with their stylesheets. The FAQ's answers are the panel's own strings, and the diagram and the panel read the same `shells`. |
| 5.3 | One document, one script | `COMPLETE` | The build links one module per document and writes the template's name on `<body>`; `app.js` starts the page by that name, so a cold load and a client-side swap take the same path. The home page gives up its own script. |
| 5.4 | The family renderer | `COMPLETE` | `tools/render-template.js` and `tools/build-context.js`: placeholders filled strictly, an unknown or nested one refused, and the same three repositories the browser uses reading from disk. |
| 5.5 | The captures | `COMPLETE` | Six harness passes, hydrogen and iron at three widths plus a home regression. The element page's hero, card, miniature grid, columns, orbital, FAQ band, siblings and pager all match the reference's boxes; what is left is the typeface, the shorter copy and the recorded deviations below. |
| 5.6 | The tests | `COMPLETE` | 54 new tests: the router's decisions and its fakes, the template rules, the three components, and the family walked over all 118 records. |

**Exit criteria**

- [x] All 118 detail pages render with complete, correct data.
- [x] Deep links work from a cold load; back and forward behave; 404 handled.
- [x] The electron shell diagram is correct for H, C, Fe, Au, U.
- [x] Generated FAQ answers agree with the element's own property values.
- [x] Previous/next wraps correctly at both ends.
- [x] Degrades to a plain multi-page site with JavaScript disabled.
- [x] Visually compared against a reference element page.

**Verification**

```
Phase 5 verification
[x] node --test source/tests ................ pass  (tests 278 · pass 278 · fail 0)
[x] node --check on every changed module .... pass  (every module under source/ parses)
[x] Brand scan .............................. PASS: brand scan clean
[x] Console/network on every touched page ... zero errors, zero failed requests on /, /elements/hydrogen/,
                                              /elements/iron/, /elements/oganesson/. The one non-200 is
                                              /elements/unobtainium/ answering 404 with the not-found
                                              document, which is the designed behaviour.
[x] Accessibility tree reviewed ............. landmarks: header, nav, main, footer; one h1; the miniature
                                              table and the shell diagram carry accessible names; FAQ questions
                                              are h3s under their h2; the strip marks the current element.
[x] Keyboard traversal ...................... complete, focus visible (2px outline on every stop reached).
[x] Reduced motion .......................... honoured — the sibling tile's transition is 0.16s by default
                                              and 1e-05s under `prefers-reduced-motion: reduce`.
[x] 1280 px screenshot vs reference ......... compared — hydrogen 3.57%, iron 3.53% of the viewport; the
                                              miniature table 4.62%, the card 1.01%; differences listed below.
[x] 768 px  screenshot vs reference ......... compared — hydrogen 9.60%, iron 11.25%; the masthead wrap and
                                              the reference's shifted miniature table are recorded deviations.
[x] 375 px  screenshot vs reference ......... compared — hydrogen 10.54%, iron 11.05%; the miniature table's
                                              phone shift and the shorter copy are the largest contributors.
[x] Regression check on an earlier phase .... page: home — table crop 2.28%, hero 6.80%, finder 12.00%, the
                                              same numbers Phase 4 closed on; the table still fills with 118
                                              tiles, the finder still filters, and the home page now boots its
                                              table after an in-page navigation too.
[x] Deliberate deviations recorded .......... the eleven in the table below.
[x] docs/MIND_MAP.md updated ................ yes, in this close-out commit.
[x] RUN_STATE.md + HANDOFF.md updated ....... yes.
```

```
node --test source/tests .................... tests 278 · pass 278 · fail 0
node source/tools/build.js .................. Built 119 routes and the not-found page into dist/
                                              14 declared routes still waiting on their templates
Cold deep links, /elements/… ................ hydrogen, gold, uranium, oganesson — all 200
/elements/unobtainium/ ...................... 404 with the not-found document
JavaScript disabled (curl, no parser) ....... every block present in the served HTML, no placeholder left
Harness 1280px hydrogen ..................... 3.57% viewport · mini 4.62% · card 1.01% · pager 1.86%
Harness 1280px iron ......................... 3.53% viewport · mini 4.66% · card 2.37%
Harness 768px hydrogen / iron ............... 9.60% / 11.25%
Harness 375px hydrogen / iron ............... 10.54% / 11.05%
Home regression 1280px ...................... table 2.28%, the number Phase 4 closed on
The router, in a real browser ................ cold links; next-next; Back; Forward; the tail wrapping to
                                               hydrogen and the head wrapping back to oganesson; 1500px of
                                               scroll restored on Back and 0 on a forward move; a missing URL
                                               answered in-page with the not-found document.
```

**Deviations and scope notes**

| Item | Decision |
|---|---|
| **The hero's wash is the element's own colour.** | The reference tints each element page by its category. Measured across all eleven categories, its wash is that colour at 55% over the paper, softening to 22% by the 45% mark. Ours mixes `--fill` — the same key the table paints its tiles from — so a page and the table cannot disagree about a category's colour. Found by the iron capture, where a fixed blue tint was 21% wrong across the miniature table. |
| **The family's files are named after the template** (`element-detail.html`, `element-detail.js`), not `element.js` as the plan sketched. | A route names a template and the build looks its renderer up by that name; one name per family, in one place. |
| **The typeface stays ours.** | `docs/BRAND_GUIDELINES.md` §2 requires our own stack; the reference sets a commercial face. Glyph widths differ by 0.6–3px, and this is the largest remaining difference in the hero, the strip and the pager. |
| **The copy is ours.** | The reference's sentences are its property. Our pages are shorter, so the document is ~260px shorter at 1280 and the columns and facts regions differ where the prose is. |
| **Two particle tiles, not the reference's three.** | No neutron count: working one out means rounding the atomic weight, which is right for hydrogen and wrong for bromine. The reasoning is in `property-list.js`. |
| **27 property rows, not the reference's 30.** | Ours are one row per field with sentence-case labels. The reference's extra rows are `Orbitals` (our electron-configuration row and the diagram), `Ionic Radius` (dropped from the schema — an ionic radius belongs to an ion) and `Lattice Parameter 2/3` (our dataset carries one). |
| **The miniature table's caption is visually hidden.** | The reference prints it inside the grid. Ours is the figure's accessible name, because the grid is a `role="img"` landmark and a paragraph inside it would be read as part of the image. |
| **The current cell is marked with a rule, not a white fill.** | The reference fills its own cell white inside transparent outlined cells, which is nearly invisible on the pale wash. Ours draws a 1.5px ink outline — the same fact, legible on every category's colour. |
| **The masthead search reserves no underline.** | The reference keeps a 1px transparent border under its field for a focus underline; ours draws the project's focus ring instead, which is why the field measures 24px against the reference's 26.75px. At rest both are bare, and the Phase 1 record that they are stands. |
| **The reference's phone layout is not copied.** | Below 56rem the reference shifts its miniature table ~19.6px left of the shell and swaps its shell diagram for a square asset (200×200 against our 200×219.16). Ours stays in the column and keeps one drawing. |
| **The masthead stays on one row at 768px.** | The Phase 1 decision, unchanged: our navigation carries four items and the reference's six. |
| **The 404 answers 404 with a document.** | The router shows the not-found page without changing the address and hands any other failure — a dead network, a server error — back to the browser rather than papering over it. |

---

## Phase 6 — Elements index and attribute rankings

**Goal:** the browse-and-compare surfaces: the index of 118 cards and the three attribute pages.

**Work items**

| ID | Item | Status | Notes |
|---|---|---|---|
| 6.0 | The reference audit Phase 6 owed | `VERIFIED` | The index's card anatomy and grid, and the three attribute pages' skeleton, measured live at six widths and appended to `docs/research/01-reference-site-audit.md` (the index's own section corrected to the measured four columns, and a new §3.9 for the rankings). |
| 6.1 | The configuration lib | `COMPLETE` | `lib/electron-configuration.js`: the shorthand expanded through the noble gases' records, the Madelung prediction, and the subshells where the two differ. `6cd3b14` |
| 6.2 | The card and the ranking row | `COMPLETE` | `components/element-card.js` + `.css`, `components/bar-ranking.js` + `.css`, and the token sections they read. `e93c31f` |
| 6.3 | The elements index | `COMPLETE` | 118 cards written at build time, the filter over them, the status line, and the `?q=` the home finder submits. `44e3493` |
| 6.4 | The two rankings | `COMPLETE` | One module behind both, the field carried by the route, the order taken from the repository's own comparison, and the bar's scale in the component. `44e3493` |
| 6.5 | The configurations page | `COMPLETE` | The four blocks in the table's order, a sentence each, and the derived list of the nineteen elements that fill differently. `44e3493` |
| 6.6 | The route wiring | `COMPLETE` | Four templates join the manifest's ready set; `FAMILY_RENDERERS` gains four entries; the index joins `PAGE_BEHAVIOUR`. |

**Exit criteria**

- [x] Search filters on name, symbol and atomic number.
- [x] Rankings monotonic; unknown values sort last; extremes spot-checked.
- [x] All 118 cards render and link correctly.

**Verification**

```
node --test source/tests ............................. tests 320 · pass 320 · fail 0
node source/tools/build.js ........................... Built 123 routes and the not-found page into dist/
                                                       10 declared routes still waiting on their templates
                                                       (was 14; the four this phase built now render)
node --check on every changed module ................. all modules parse
Brand scan over source/ .............................. PASS: brand scan clean
git worktree add /tmp/phase6-check <commit> .......... 6cd3b14: 284 pass · e93c31f: 298 pass · 44e3493: 320 pass
git log --format='%an <%ae> | committer: %cn <%ce>' ... one identity: Devansh <dhbhensdadia@gmail.com>,
                                                       author and committer, on every commit
git status --short .................................... clean at the close-out commit

Served by the dev server and exercised in a real browser (Playwright, system Chrome):
  /elements/ .......................................... 200 · 118 cards · no console messages, no failed requests
    hero 270px · heading 54.88px · filter 420 × 54.14px — 1px dotted ink, 2px radius, 12px 16px,
    17.6px type — which is the reference's own field to the pixel
    grid: four 266px columns with 12px gaps at 1280; two 354px at 768; one 327px at 375. Matches the
    reference at every width measured, out of one auto-fill line rather than three breakpoints
    card: 266 × 97.64px (the reference's is 266 × 99.64) · tile 54px carrying the category fill
    filter: "hyd" → 1 card · "79" → gold · "zzz" → none · cleared → 118 · the status line says which
    /elements/?q=iron ................................... the field prefilled, one card left, status honest
  /properties/melting-point/ .......................... 118 rows of 47px, monotonic, helium first at
                                                       −272.2 °C and carbon last at 3549.85 °C, 15 unmeasured last
  /properties/boiling-point/ .......................... 118 rows, helium first at −268.93 °C, rhenium last
                                                       at 5595.85 °C, 25 unmeasured last
  the bar ............................................. 2.0% of the track at the floor, 100% at the top
  /properties/orbital-configuration/ .................. five sections — 14, 36, 38 and 30 elements, then the
                                                       19 exceptions — 137 rows, every configuration printed
  no horizontal overflow .............................. at 1280 / 768 / 375 on all four pages
  tab order on the index ............................... 8 stops, every one with a 2px visible outline
  in-app navigation .................................... index card → hydrogen (one script, data-page
                                                       element-detail) · Back → 118 cards with the filter
                                                       reattached and working · a ranking row → helium
  reduced motion ....................................... card and bar transitions 0.16s → 1e-05s
  accessibility bones .................................. one h1, ten h2, six landmarks, the filter labelled,
                                                       role=status on the count, one current navigation item

Harness against the reference (workspace/tools/visual, 1280 / 768 / 375):
  /elements/ vs /elements ............................ viewport 9.27% / 5.26% / 9.18%
    heading 54.88px against the reference's 54.4px, 11px lower — the site's own main padding
    lede one line at 28.14px, the same as the reference's; filter identical in every measured property,
    11.2px lower; card 266 × 97.64 against 266 × 99.64
    crops: heading 9.9%, masthead search 7.19% (the Phase 1 reserved-underline decision), submenu 5.18%
    document 4172px against the reference's 4354px — 30 rows two pixels shorter, plus its margins
  /properties/melting-point/ vs /melting-point ...... viewport 5.3% / — / 8.38%
    document 6447px against 6660px; rows the same 47px; the reference's sortable table is not reproduced
    (the index and ranking captures are in workspace/screenshots/{elements-index,ranking-melting}/)

Regression check on an earlier phase (the same harness, the same width):
  the home page at 1280 .............................. viewport 4.87%, table crop 2.28%, hero 6.80% and
                                                       finder 12.00% — Phase 4's own numbers exactly, so
                                                       the new token sections, the repository's exported
                                                       comparison and the build's renderer table took
                                                       nothing away from it
```

**Appearance — captured and inspected**

| Width | What was seen | Differences from the reference |
|---|---|---|
| 1280 px | The index's hero with one line of context and the filter, then four columns of cards, each a white panel with its tile on the left and three lines of words beside it; the ranking's 118 rows with a place, the element, a bar and the value; the configurations page's five sections with the notation in the mono face. | The reference's card is 2px taller; its heading 0.48px smaller and 11px higher; its masthead search 2.75px taller. Everything else measured matches. |
| 375 px | The index's single column of full-width cards, the filter across the column; the ranking's rows as two lines, the bar running the full width under the element and its value. | The reference's ranking keeps a 520px table inside a horizontal scroller; ours stacks, which is a recorded decision. Its index keeps four columns' worth of card at 327px wide — the same single column as ours. |

The one substantive fix the captures drove: the first browser pass showed grey tiles, because the key-to-colour map lives in `periodic-table.css` and the four new routes had not declared it. Declaring it on each route — the same sheet the element pages link for their hero and cards — restored the category colours, and the tile colours then measured as the four first elements' groups.

**Deliberate deviations**

| Deviation | Why |
|---|---|
| **The rankings are rankings, not sortable tables.** | The reference publishes a sortable, filterable table for each attribute. The plan's deliverable for these pages is "elements ranked, with a bar visualisation of relative magnitude", so ours has one order per page, the bar it asks for, and no column controls. The index carries the site's element search instead. |
| **The bar is an ordinal scale, not a length from zero.** | Most melting points in degrees Celsius are negative, so a bar drawn from zero would be a bar about a unit's origin rather than about the elements. The bar shows where a value sits between the page's own lowest and highest, the lowest keeps 2% of the track so it is visible, and the note above the list says so in a sentence. |
| **An unmeasured element says "Unknown".** | The reference prints "Not measured". Ours is the project's one word for not knowing, the same word the property panel and the FAQ use. |
| **The index's lede is one sentence.** | The reference's copy is its own. Ours is shorter — and shorter by measurement, not by accident: the longer version wrapped to two lines and pushed the filter 39px below the reference's, so the copy was cut to the one line the reference keeps. |
| **The index has a status line.** | Neither page of the reference says how many of its cards are left after a filter. A filter that hides 106 of 118 without a word leaves a reader wondering whether the page broke. |
| **The configurations are printed as the records hold them.** | The source lists iron as `[Ar]4s2 3d6` and chromium as `[Ar]3d5 4s1`. Normalising the term order would be a second opinion about notation that the data's own source does not share, so the page prints what the record says. |
| **The configurations page names the exceptions.** | The reference's page is a table with a Block column and no narrative. Ours derives the nineteen elements whose configurations differ from the predicted filling order and lists them, which is what the route's own description promised the page would do. |

**Commits:** `6cd3b14` (the configuration lib), `e93c31f` (the card and the bar), `44e3493` (the four pages and their wiring), plus the close-out commit.

---

## Phase 7 — Alternate periodic table views

**Goal:** the same table, answering four different questions.

**Work items**

| ID | Item | Status | Notes |
|---|---|---|---|
| 7.0 | The reference audit Phase 7 owed | `VERIFIED` | The four views measured live at 1280: the 240px hero (300px on evolution), the 33px band, the body's 32px, the four legends with their counts and every fill read off the tiles, and the discovery that the reference's note sits *under* its table. Appended to `docs/research/01-reference-site-audit.md` §3.5, which also corrects an earlier note that recorded the reference's own sentence as ours. |
| 7.1 | The discovery era model | `COMPLETE` | `lib/discovery.js`: the century a recorded year falls in, one bucket for the records with no year, the declared order, the counts and the grouped members. `a0b0df8` |
| 7.2 | The electronegativity derivation | `COMPLETE` | `lib/electronegativity.js`: the measured set, its two ends, the periods that rise at every step, the groups that never rise, and the unbroken tail of records with no value. `a0b0df8` |
| 7.3 | The engine's fifth mode | `COMPLETE` | `discovery` joins the engine's modes and the stylesheet's key map, and `attachPeriodicTable` is exported so a table the build already wrote can be brought to life without re-rendering it. `a0b0df8` |
| 7.4 | The era timeline | `COMPLETE` | `components/era-timeline.js` + `.css`: one card per era, its derived span, our sentence, and its elements as chips in the era's colour. `a0b0df8` |
| 7.5 | The four views | `COMPLETE` | `pages/table-views.js`, the four templates, `styles/pages/table-views.css`, and the token section they read. Each view is a colour mode and its own note; two of them add a section below the table. `d1a4ad4` |
| 7.6 | The route wiring | `COMPLETE` | Four routes gain the four stylesheets the views need — including the table's sheet, which is where a key becomes a colour — `FAMILY_RENDERERS` gains four entries, and `PAGE_BEHAVIOUR` four page names behind one module. `d1a4ad4` |

**Exit criteria**

- [x] Four views render correct colour mappings and legend counts.
- [x] Continuous scales verified at both domain endpoints and for an out-of-range value.
- [x] Each view visually compared against its reference counterpart.

**Verification**

```
node --test source/tests ............................. tests 369 · pass 369 · fail 0
node source/tools/build.js ........................... Built 127 routes and the not-found page into dist/
                                                       6 declared routes still waiting on their templates
                                                       (was 10; the four this phase built now render)
node --check on every changed module ................. all modules parse
Brand scan over source/ .............................. PASS: brand scan clean
MIND_MAP completeness over source/ ................... 131 files, 0 missing
git log --format='%an <%ae> | committer: %cn <%ce>' ... one identity: Devansh <dhbhensdadia@gmail.com>,
                                                       author and committer, on every commit
git status --short .................................... clean at the close-out commit

Served by the dev server and exercised in a real browser (Playwright, system Chrome):
  all four pages ....................................... 200 · 118 tiles each · no console messages, no
                                                       failed requests, no 4xx on any asset
  the legend, computed ................................. state: solid rgb(69,102,131) · liquid rgb(85,153,130)
                                                       · gas rgb(229,120,96). block: s rgb(69,102,131) ·
                                                       p rgb(85,153,130) · d rgb(249,170,98) · f rgb(212,115,162).
                                                       discovery: undated rgb(21,64,61) · 18th rgb(69,102,131)
                                                       · 19th rgb(85,153,130) · 20th rgb(151,192,170) ·
                                                       21st rgb(229,120,96). electronegativity: a six-span
                                                       ramp from rgb(220,233,240) to rgb(21,64,61) with
                                                       rgb(232,226,220) for no value — the same six tokens
                                                       and the same grey the reference renders
  isolation ............................................ pressing a chip dims the grid (opacity 0.22) and
                                                       leaves exactly that key's tiles bright: solid 104,
                                                       s-block 14, undated 2; aria-pressed true; released on
                                                       a second press
  keyboard ............................................. one tile in the tab order; ArrowRight moves it and
                                                       the roving tab stop stays single; the tab order runs
                                                       skip link → wordmark → the five navigation items,
                                                       every one with a 2px outline
  no horizontal overflow ............................... at 1280 / 768 / 375 on all four pages; below 56rem
                                                       the table scrolls and below 35rem the tile names drop
  reduced motion ....................................... tile, chip and main transitions 1e-05s
  accessibility bones .................................. one h1, five or six h2, six landmarks
  the evolution timeline ................................ six cards, 2/20/47/31/5/13 elements, ranges
                                                       1669–1670 · 1735–1798 · 1801–1899 · 1900–1998 ·
                                                       2000–2010 · no recorded year

Harness against the reference (workspace/tools/visual, 1280 / 768 / 375):
  properties-and-states vs the reference's states ..... page 10.24% / 21.12% / 22.73%
    table crop 8.94% / 12.06% / 7.26% · legend 17.66% (three chips against its four, and different counts)
  orbitals ............................................. page 6.64% / 20.65% / 25.05%
    table crop 4.16% / 6.86% / 5.72% · legend 13.38%
  electronegativity .................................... page 3.52% / 18.05% / 19.22%
    table crop 2.82% / 5.49% / 2.70% · the scale legend 1.8% — the same bar at the same size
  evolution ............................................ page 15.64% / 28.45% / 20.46%
    table crop 7.70% / 8.99% / 6.16% · timeline 9.23% / 12.52% / 15.09% · legend 54.06% (our six eras against
    its six, with different boundaries and different labels)
  alignment at 1280 .................................... our legend lands at y364, the reference's own y364;
                                                       the grid within 2.1px of the reference's on three views
                                                       and 23.8px above it on the evolution view
  colour agreement, tile by tile ....................... states 104/118 · orbitals 114/118 ·
                                                       electronegativity 113/118 · evolution 109/118
                                                       (each view's residual differences are recorded below)

Regression check on an earlier phase (the same harness, the same width):
  the home page at 1280 ............................... viewport 4.87%, table crop 2.28%, hero 6.80% and
                                                       finder 12.00% — Phase 4's own numbers exactly
```

**Appearance — captured and inspected**

| Width | What was seen | Differences from the reference |
|---|---|---|
| 1280 px | Four pages that are the same picture in four colourings: a hero over a legend and the full table, then the note. The gas tiles coral and the solids slate where the reference has them, the two liquids sage; the s-block slate, p sage, d orange, f pink; the scale a single ramp from the palest blue to the deepest pine with fluorine the only tile at its end; and on the evolution view the same table in six century colours with a card per era beneath it. | Its legend sits at the same y as ours and its grid within 2.1px on three views. It has one more state chip than we do (it files 14 superheavies as unknown), two fewer s-block and two more d-block, five more records with an electronegativity, and its own era set. Its note is one line of its own words below the table, as ours is above none. |
| 768 px | The same four pages with the table in a horizontal scroller that keeps its 65px tiles rather than shrinking them, and every page's content ~31px above the reference's. | The reference's masthead wraps its search field onto a second row at this width and ours does not — the Phase 2 deviation, unchanged, and the whole of the vertical difference. |
| 375 px | One column, the table scrolling sideways with its edge fades, the tile names dropped, the evolution timeline's cards stacked, the electronegativity ends list a row per line. | Our table sits 123–169px lower because our headings are the routes' own longer titles at the site's display size, while the reference shrinks its own three-word view headings to 33.6px. Recorded below rather than chased. |

What the captures drove: the first build put each view's note between the legend and the grid, which is where the home page's helper line lives. The reference puts its note *under* the table, and the paragraph's own height moved our grid 224px down the page and made the comparison meaningless. Moving the note below the table and giving the legend the reference's 24px gap brought our legend to the reference's own y and the grid to within 2px at 1280.

The audit also corrected three colour facts and one attribution. The orbital block palette is four of the reference's own group colours (our p-block had been a fifth colour, and now points at the actinide sage the reference uses); the electronegativity ramp and its grey are the six tokens and the `--scale-none` our own scale legend already prints; and the era colours now take the colour the reference gives the same century, which took the evolution view's tile-by-tile agreement from 6/118 to 109/118. The earlier audit had recorded the reference's orbitals sentence as "our own wording" — it is the reference's, and ours had to be written afresh.

**Deliberate deviations**

| Deviation | Why |
|---|---|
| **The eras are the centuries our own data's years fall in, not the reference's.** | The reference's first bucket is *Antiquity* — the seven metals its data lists with no discoverer — and its second is *Alchemical era*. We cannot derive that split: elements its dataset dates (carbon 1789, sulphur 1777, aluminium, calcium, arsenic 1250) carry no year in ours at all, so our undated bucket holds both the prehistoric metals and five elements a named chemist isolated in the eighteenth or nineteenth century. Calling all thirteen ancient would assert what the data does not say, so the bucket is named for what it is and placed last. |
| **Centuries, not the plan's decades.** | The plan asked for a colour by decade of discovery. Our years run from 1669 to 2010 and fall in thirty-one decades; thirty-one legend chips is a chart, not a legend, and the reference groups its own evolution view into six eras for the same reason. |
| **The reference's state counts are not ours.** | It prints Solid 90 · Liquid 2 · Gas 12 · Unknown 14. Our dataset holds a state for every one of the 118 (104 solid, 2 liquid, 12 gas), so our legend has no unknown chip — the same three-count legend, from the same records the tables are drawn from. |
| **The reference's block counts are not ours either.** | It prints s 12 · p 38 · d 40 · f 28; our records file helium under s (its configuration ends in 1s) and lanthanum and actinium under f, giving 14 · 36 · 38 · 30. Both are internally consistent and both add up to 118; ours follows the record's own block field, which is what the page's note says. |
| **Every view says what its legend does.** | The reference teaches the isolation on its evolution view only. Ours ends each note with one sentence — "Point at a state to pick its elements out of the table" — because a reader who arrives on a view page from the submenu has not seen the home page's helper line. |
| **The views keep the tab's title as their heading.** | The reference's three short view headings are 51.2px at 1280 and 33.6px at 375, smaller than its own display size and shorter than ours. Ours is the route title at the site's one page-heading size, so a page has one name in the tab, in the navigation and on the page — at the cost of a taller hero on a phone. |
| **A hero's band excludes the page's own top spacing.** | The reference's 240px hero band contains the 56px between its submenu and its first heading; ours is `main`'s, which every family pays. The views' token is the reference's band less that spacing, which is what puts the legend on the reference's own y rather than 48px below it. |

**Commits:** `a0b0df8` (the era model, the electronegativity derivation, the fifth mode and the timeline), `d1a4ad4` (the four views and their wiring), plus the close-out commit.

---

## Phase 8 — Element group pages

**Goal:** each of the table's eleven groups as a page about itself, and one page over all eleven.

**Work items**

| ID | Item | Status | Notes |
|---|---|---|---|
| 8.0 | The reference audit Phase 8 owed | `VERIFIED` | All eleven pages measured live at 1280 / 768 / 375: the 33px band that lists six groups and drops the current one, the hero's four derived facts, the table arriving already isolated (non-members at `opacity: 0.22`, `saturate(0.35)`), the member cards' 210px column floor, the sibling pills' 9.52px dot — and the finding that the reference publishes **no group index at all**: `/element-groups/` is a 404 and its band's `All` points at `/`. Its eleven counts match ours **member for member**, so the exit criterion is satisfiable as written. Appended to `docs/research/01-reference-site-audit.md` §3.6. `a49dd6d` |
| 8.1 | The table arrives isolated, and its legend is a door | `COMPLETE` | `createPeriodicTable` gains `isolate` and `legendLinks`; a table written isolated rests on its own `data-isolated`, so pointing at a chip previews that group and moving away restores the page's group rather than clearing the table. A tile gains a `match` mark, and `lib/plural.js` derives the eleven categories' plural rather than storing a second name. `3b5cd60` |
| 8.2 | The family module | `COMPLETE` | `pages/group.js`: the eleven pages' values and the index's, `GROUP_NOTES` (a lede and two paragraphs per group, deliberately free of counts), and the derived facts — `count`, atomic-number range, the block only where every member shares one, the states in member order. A route carrying no category, or a category with no copy, is refused rather than drawn in the wrong colour. `54832b4` |
| 8.3 | The two templates | `COMPLETE` | `pages/group.html`, one template behind all eleven, and `pages/element-groups-index.html`. `54832b4` |
| 8.4 | The family's sheet and its tokens | `COMPLETE` | `styles/pages/group.css` plus the group section of `tokens.css`. Nothing in the sheet names a colour: the hero's wash is `--fill` mixed 16% into the paper and the lede is `--fill-deep`, the pair the palette already owns. `54832b4` |
| 8.5 | The route wiring and the band | `COMPLETE` | `groupRoutes(categories)` beside `elementRoutes`, `GROUP_STYLES` declared by the eleven pages and by the index (which asks for the family's own sheet by name, because the build appends it only for the family's template), `allRoutes(elements, categories)`, the `group` behaviour name, and the band linking all eleven groups and the index. `54832b4` |
| 8.6 | The tests | `COMPLETE` | `tests/pages/group.test.js`: eleven routes and their titles and descriptions, the sheets each declares, the eleven memberships partitioning the 118 records at the asserted counts, the derived facts with the block stated only where it is shared, all 118 tiles with exactly the group's own marked, the note counting both halves, every member link resolving, every group's copy present and count-free, the index's eleven cards, and the band. The three tests that hold the family list and the manifest were widened to the whole manifest. `54832b4` |

**Exit criteria**

- [x] Eleven group pages; member counts match the expected values exactly.
- [x] Every member link resolves.
- [x] Group colour applied from the token layer, no literals.

**Verification**

```
node --test source/tests ............................. tests 383 · pass 383 · fail 0
                                                       (was 369; the family adds 14)
node source/tools/build.js ........................... Built 139 routes and the not-found page into dist/
                                                       5 declared routes still waiting on their templates
                                                       (was 6; /element-groups/ now renders)
node --check on every changed module ................. all modules parse
Brand scan over source/ .............................. PASS: brand scan clean
MIND_MAP completeness over source/ ................... 137 files, 0 missing (141 counting the four
                                                       .DS_Store files, which are not source)
git log --format='%an <%ae> | committer: %cn <%ce>' ... one identity: Devansh <dhbhensdadia@gmail.com>,
                                                       author and committer, on every commit
git status --short .................................... clean at the close-out commit

Served by the dev server and exercised in a real browser (Playwright, system Chrome):
  the seven URLs ....................................... all 200: /, /element-groups/, /element-groups/halogens/,
                                                       transition-metals/, unknown/, /elements/hydrogen/,
                                                       /periodic-table/orbitals/
  four group pages × three widths ...................... 0 console messages, 0 failed requests, no horizontal
                                                       overflow at 1280 / 768 / 375
  the table ............................................ 118 tiles on every page, data-isolated set to the page's
                                                       own slug, exactly 5 / 35 / 8 tiles bright on halogens /
                                                       transition metals / unknowns and the rest at opacity 0.22
                                                       with saturate(0.35)
  the legend ........................................... eleven links, no buttons and no aria-pressed, one roving
                                                       tab stop
  the hero's lede ...................................... the deep token: rgb(76,87,90) halogens ·
                                                       rgb(152,104,60) transition metals · rgb(129,111,57) unknowns
  the members .......................................... 5 / 3 / 1 columns at 1280 / 768 / 375
  the sibling pills .................................... padding 8px 16px, radius 999px, dot 9.52px
  the index ............................................ eleven cards at 3 / 2 / 1 columns, the right counts
  pointer and keyboard, reduced motion at 1280 .......... hovering "Alkali metal" isolates alkali-metals (6 matches);
                                                       moving away restores halogens (5); focus does the same and
                                                       blur restores; transitions 1e-05s; no errors
  a chip is a door at 1280 .............................. clicking "Noble gas" navigates through the router to
                                                       /element-groups/noble-gases/, h1 "Noble gas",
                                                       data-isolated noble-gases, body data-page="group"
  regression, earlier phases ............................ home: eleven button chips, hovering transition-metals gives
                                                       35 matches, cleared gives 0. orbitals: four button chips,
                                                       hovering s gives 14, cleared gives 0
  accessibility bones ................................... one h1, four content h2 (Where they sit, The halogens,
                                                       About the halogens, Other groups), six landmarks
                                                       (header, nav Primary, nav Section, main, footer, nav
                                                       Footer), no link without a name, no image without alt,
                                                       and the route's own title and description in the head

Harness against the reference (workspace/tools/visual, 1280 / 768 / 375; the reference's halogens page):
  page ................................................. 9.75% / 14.36% / 12.72%
  the table ............................................ 0.53% / 1.98% / 0.73% — and the same size at all three:
                                                       1228.8×625.52 at 1280, 820×420.61 at 768,
                                                       700×360.16 at 375
  the hero ............................................. 7.76% / 10.74% / 11.58%
  the band ............................................. 9.87% / 14.69% / 8.11% — the one structural difference,
                                                       recorded below: ours is 70.5px against its 33px at 1280
```

**Appearance — captured and inspected**

| Width | What was seen | Differences from the reference |
|---|---|---|
| 1280 px | The group's own colour three times over — the hero's wash, the lede beneath the name, and the member tiles — then the whole table with that group's cells at full colour and the rest dimmed to a ghost, the note counting them under the grid, the members five cards to a row, our two paragraphs, and the other ten groups as pills each carrying its own dot. The index is eleven cards, three to a row. | Its band is one row of eight where ours is two rows of twelve. Our table sits **67.6px lower** than its own (y674.55 against y606.97) — the band's second row plus a taller heading. Its hero text column is capped at 620px and its heading is 57.6px; ours is not capped and the heading is 54.88px, the site's single page-heading size. Its explainer runs to thousands of words where ours is two paragraphs. |
| 768 px | The same page with the table in a horizontal scroller that keeps its 65px tiles rather than shrinking them, the members three to a row and the pills wrapping. | Our table sits **104px above** the reference's at this width — its lede wraps to three lines against our two — and our band is still two rows against its one. |
| 375 px | One column: the hero, the table scrolling sideways behind its edge fades, the members one to a row, the prose, then the pills — and a band four rows deep. | Both bands wrap at this width — its three rows of eight, ours four rows of twelve, 142.19px against 101.89px. `Post-transition metal` wraps its heading to two lines in both. |

**Deliberate deviations**

| Deviation | Why |
|---|---|
| **Our band lists all eleven groups and the index; the reference's lists six and drops the current one.** | The reference's band carries Actinide, Alkali metal, Alkaline earth metal, Halogen, Lanthanide, Metalloid and Noble gas, removes the page's own group, and leaves Non-metal, Post-transition metal, Transition metal and Unknown reachable only from the page's foot. A reader who wants the noble gases should not have to know which page they are standing on to find them, so ours lists all eleven in the order a reader meets them reading the table, then `All groups`. |
| **The band therefore wraps at desktop, where the reference's does not.** | Twelve full group names at the shell's 1100px do not fit one row: ours is 70.5px tall at 1280 (ten items then two) and 68.88px at 768, against the reference's flat 33px at both. Shortening the names to fit 1280 exactly would still wrap at 768 — the row needs 1168px there — so it would buy one width at the cost of calling a page something the page does not call itself. |
| **We publish a group index, and the reference does not.** | `/element-groups/` is a 404 on the reference and its band's `All` link goes to the site root. Ours is a page of eleven cards, one per group, each in the group's own colour with its count and its sentence; the route was already declared in Phase 5 and waiting on this phase. |
| **The hero carries the group's colour as a wash.** | The reference's hero has no background of its own and spends the group's colour on the lede alone. Ours mixes it into the paper at 16%, the same device the element pages use, so the page announces its group before the first word is read. |
| **The lede is written in `--fill-deep`.** | The reference's lede colours — `#4c575a` halogens, `#98683c` transition metals, `#a85846` noble gases, `#816f39` unknowns — are exactly the `--g-*-deep` tokens transcribed from the same site in Phase 1. Spending the token rather than the value keeps the pairing in the one map that already owns it. |
| **The explainer is ours, and free of counts.** | The reference's "About the halogens" sections run to thousands of words of its own copy. Ours is two paragraphs per group, written here, and deliberately holds no number: the hero's facts are derived from the records, so a copy that also asserted a count could contradict them after any correction to the data. |
| **The note counts both halves of the table.** | The reference's line is `The 5 highlighted cells are the halogens.` Ours names the group and says how many of the 118 are not in it, because a reader who has just seen 113 dimmed tiles is owed the number. |
| **The table's legend is links here, buttons everywhere else.** | The engine's chips isolate on the home page and the four views; on a group page a chip leads to that group's own page, which is what makes the eleven reachable from each other. Pointing at one still previews it, and moving away restores the page's group rather than clearing the table. |
| **The hero's heading is not capped at the hero's measure.** | The reference caps its whole 620px hero text block, heading included. Ours caps the two elements long enough to need it — the lede and the facts. Every one of the eleven group names renders on one line at 1280 either way, and the same single name wraps at 375 in both. |

**Commits:** `a49dd6d` (the reference audit §3.6), `3b5cd60` (the table's resting isolation, the linking legend, the plural), `54832b4` (the family, its templates, its sheet, the wiring and the tests), plus the close-out commit.

---

## Phase 9 — Glossary

**Goal:** the site's vocabulary layer, and the internal-link backbone — `/glossary/` with the A–Z
index, the live filter and all 418 terms, a page per term, and the cross-links between a term and
the elements whose entries mention it.

**Work items**

| ID | Item | Status | Notes |
|---|---|---|---|
| 9.0 | The reference's own glossary, audited live | `COMPLETE` | The index is `/terms`, not `/glossary-of-terms`, which 404s; a term is `/glossary-of-terms/:slug`. Measured at 1280 / 768 / 375: the 230px hero with its 48px heading, the rail of letters down the left edge, the alphabet taking everything to its right, the 26 letter headings, the row's 352px/670px/112px grid and its 91.13px height, the definition's own 534px measure, and the badge's three ink and border colours — which are three of the eleven group colours. Written into `docs/research/01-reference-site-audit.md` §3.7 with the comparison table of what we take and what we add. `5a05a1f` |
| 9.1 | The 418 definitions | `COMPLETE` | `data/glossary.json`, written here: 418 records of `term`, `slug`, `level` and a definition of one to three sentences, in reading order, with every one of the 26 letters holding at least one term. `tests/data/glossary.test.js` grew a second half that reads the **shipped** file from disk: the count, the letters, no two terms sharing a slug or a name, and every definition finished prose of a publishable length rather than a placeholder. 387 tests at this commit. `39abcef` |
| 9.2 | The index family module | `COMPLETE` | `pages/glossary.js`: `termMatches` searches the term and the definition, `glossaryStatus` counts what is left and names the query, `levelBadge` refuses a level that is not one of the three rather than drawing an unstyled badge, `termRow`/`letterBlocks`/`jumpRail` write the 418 rows and the 26 letters at build time, and `startGlossaryIndex` is the filter — it hides what does not match, folds up a letter left with nothing under it, dims that letter's rail link, keeps the status line honest and honours a `?q=` the page arrived with. It asks the repository which letters exist rather than deciding. `be7a3d5` |
| 9.3 | The term family module | `COMPLETE` | `pages/glossary-term.js`: the definition, the badge, the way back to the term's letter, the terms it sits near (derived from the words two names share, with the words every name shares left out), the elements whose prose mentions it, and a pager that stops at both ends of the reading order. A route carrying no term, or one the glossary does not hold, is refused rather than half-drawn. `be7a3d5` |
| 9.4 | The two templates and the sheet | `COMPLETE` | `pages/glossary-index.html`, one template for the index, and `pages/glossary-term.html` behind all 418 term pages. `styles/pages/glossary.css` plus the glossary's section of `tokens.css`: the ledger as a grid whose first column is the rail — the one page in the project that leaves the shell on purpose — the row's three columns, and badges whose rules spend the three `--level-*` aliases of the group palette rather than naming a colour, which is why the family declares no component sheets. `be7a3d5` |
| 9.5 | The route wiring, the manifest and the behaviour | `COMPLETE` | `build-context.js` loads the glossary as a repository, because its pages ask it questions a copy of the array could not answer; `FAMILY_RENDERERS` gains the two families and `bodyFor` threads the repository through; `glossaryRoutes(terms)` derives 418 routes from the records and `allRoutes` takes all three families; the index earns a behaviour entry and a term page deliberately has none. The three tests that count the manifest were widened to the whole site. 558 routes built. `63f73d0` |
| 9.6 | The tests | `COMPLETE` | `tests/pages/glossary.test.js`: the 418 routes and their titles, descriptions and sheet; every term filed under its letter exactly once with the rail's 26 links landing on headings that exist; a row's term, definition and badge; the three levels accepted and any other refused; the filter's rule over both the term and the definition; the status line's four shapes; the filter driven through its own field, with a letter folded up and its rail link dimmed, the count kept, an arriving `?q=` honoured and a page with nothing to filter given a teardown; a term page's back link, badge, definition and pager; the derived relations; and every link the index and all 418 pages write held to the manifest. `tests/tools/render-template.test.js` widened to both glossary templates. 406 tests at that commit. `2d7b019` |
| 9.7 | The browser pass, and the defect it found | `COMPLETE` | The index, a term page and an element page at 1280 / 768 / 375: the ledger and its badges are the reference's measurements to the decimal, and both glossary headings wrapped to two lines on a phone because the reference steps its own down below the shell — fixed in `tokens.css` and `glossary.css`. The pass also caught a defect in the router, older than this phase and invisible until now: a browser fires `popstate` for a fragment move, and the handler could not tell one from a history move between pages, so every in-page anchor fetched the page it was already on and settled the reader at the top of it. The jump rail moved the address and nothing else with the script on, and worked perfectly with it off. `6787b6c`, `b9cafba` |
| 9.8 | The other end of the cross-linking | `COMPLETE` | The plan asks for a term mentioned in an element's entry to link to its definition, and only one end existed: a term page listed its elements. Both ends are now one rule in `lib/glossary-links.js` — one field list of the prose a reader sees, one whole-word match — so the two pages cannot disagree about which words are in an entry. An element page carries "Terms in this entry" as pills into the glossary; 17 of the 118 mention none and carry no section rather than a heading over an empty list. `73fbb47` |

**Exit criteria**

- [x] 418 terms render; A–Z grouping and jump index correct and complete.
- [x] Filtering works on term and definition text.
- [x] Every term page resolves; no dead cross-links.
- [x] Cross-links between glossary terms and element properties resolve.

**Verification**

```
node --test source/tests ............................. tests 413 · pass 413 · fail 0
                                                       (was 383 at Phase 8's close; the glossary adds 30)
node source/tools/build.js ........................... Built 558 routes and the not-found page into dist/
                                                       4 declared routes still waiting on their templates
                                                       (was 139 built and 5 waiting; the family adds the index
                                                       and 418 term pages)
node --check on every module under source/ ........... all modules parse
Brand scan over source/ .............................. PASS: brand scan clean
MIND_MAP completeness over source/ ................... 146 files, 0 missing (150 counting the four
                                                       .DS_Store files, which are not source)
git log --format='%an <%ae> | committer: %cn <%ce>' ... one identity: Devansh <dhbhensdadia@gmail.com>,
                                                       author and committer, on every commit
git status --short .................................... clean at the close-out commit
```

Served by the dev server and exercised in a real browser (Playwright, system Chrome):

```
  three URLs × three widths ............................ 0 console messages, 0 failed requests, no horizontal
                                                       overflow: /glossary/, /glossary/absolute-zero/ and
                                                       /elements/hydrogen/ at 1280 / 768 / 375
  the index ............................................ 418 rows, 26 letter blocks, 26 rail links, every one
                                                       of the 26 landing on a heading that exists
  the ledger at 1280 ................................... the rail 34px, sticky at 58px, 2px apart; the alphabet
                                                       1246px beside it (34 + 1246 = 1280); a row 91.13px
                                                       tall on a 352px/670px/112px grid with 24px gaps and
                                                       24px 32px padding; the term 30.976px; the definition
                                                       13.6px/21.08px capped at 534px — the reference's own
                                                       measurements, and the reference's own grid: its ledger
                                                       measures 34px 1246px too
  the letter headings .................................. 17.6px/19.36px, −0.352px tracking, 12px above and
                                                       below, 43.34px tall
  the badges ........................................... 11.52px on a 1px dotted rule, ink #1d4634 / #1d3d4d /
                                                       #38246b on #97c0aa / #a6c6d5 / #6e58ac — the
                                                       reference's three, and our own group tokens
  the filter ........................................... "zwitterion" 1 row with the count named, 25 letters
                                                       folded and 25 rail links dimmed; "gas" 33 rows;
                                                       nothing from "nothing matchezzz" and the line that says
                                                       so; cleared, 418 rows back and every letter unfolded
  the jump rail ........................................ clicking P scrolls to the heading at 59.56px under the
                                                       masthead, from 32,775px down the page
  a term page at 1280 .................................. "← Glossary · A" → /glossary/#letter-A; the 5px rule;
                                                       columns 776 and 260, 64px apart; the pager 48px below
                                                       with the next term; 6 cross-links, all 200
  the round trip ....................................... /elements/hydrogen/ → its seven term pills →
                                                       /glossary/electron/ → whose aside lists Hydrogen
  the router, re-checked after the fix ................. a row click, a pager click and two backs each land on
                                                       the right page with the right behaviour started, and the
                                                       index's filter still works after a swap back

Harness against the reference (workspace/tools/visual, 1280 / 768 / 375):
  the index against /terms .............................. page 4.66% / 4.53% / 5.55%; the h1 box the same size
                                                       at 1280 (1100×52.8) and identical at 375 (327×36.95)
  a term page against /glossary-of-terms/absolute-zero ... page 3.60% / 3.84% / 5.11%; the h1 56.31px tall at
                                                       1280 and 38.72px at 768 and 375 — the reference's own
                                                       heights, at all three widths
```

**Appearance — captured and inspected**

| Width | What was seen | Differences from the reference |
|---|---|---|
| 1280 px | The heading and our lede, then the filter and its count, then the rail of 26 letters down the left edge with the alphabet beside it — 418 ruled rows, each its term, two lines of definition and a dotted badge, filed under 26 headings. A term page is the heading with its badge, a 5px rule, the definition, and an aside of pills. | The one arrangement taken whole: the rail, the alphabet, the row, the row's own three columns and the badge are the reference's measurements. Ours starts 129px lower because the hero carries a filter the reference has none of, and the list is 8% taller because our definitions are longer than its one-liners. |
| 768 px | The rail dropped, a row one column at 16px, the badge under the definition. | The row is 154.3px against its 140, and the alphabet begins higher because our masthead is still one row where the reference's has two. |
| 375 px | The same single column, and both glossary headings on one line. | The h1 box is identical in size to the reference's (327×36.95). The row is 170.03px against its 156. |

**Deliberate deviations**

| Deviation | Why |
|---|---|
| **The index carries a filter and a status line; the reference's carries neither.** | The plan asks for live filtering, which the reference simply does not have. The hero's content is 232.97px against the reference's 92.94px — the field, its margin and the status line are the whole of that difference — and with our own 24px and 68px of padding the section is 324.97px against its flat 230, so the list starts 129px lower. Its own text block is still the reference's 92.94px to the decimal. |
| **A term page carries the definition and no expanded explanation.** | The plan's deliverables list an expanded explanation on a term page; the reference's own body is the definition and nothing else, and this is the phase's one deliverable not delivered. Two hundred and more words per term would be 418 further paragraphs with no source to audit them against, and the phase's exit criteria do not ask for them. The aside carries what the page can honestly derive — the terms the term sits near, and the elements that mention it. |
| **The difficulty levels are our own judgement, so the counts differ.** | Measured live, the reference splits 189 Beginner / 129 Novice / 99 Expert; ours is 107 / 168 / 143. A level describes how much the definition before it assumes the reader knows, so it is a judgement about a sentence only this project wrote; copying another site's distribution would be a claim about our prose that we have not checked. The badge's three colours, its dotted rule and its radius are the reference's. |
| **The term page's aside is ours, and the reference's is not portable.** | Its two rails link into its Learn and Games sections — pages this site does not build — so copying the arrangement would mean publishing two columns of links to nowhere. Ours spends the same column on the relations the records can prove. |
| **Our rows are taller at 768 and 375.** | 154.3px and 170.03px against the reference's 140 and 156. The arrangement is the same one column at 16px; the difference is that our definitions run to three and four lines where the reference's are one-liners, and the definition is the one place the two sites deliberately disagree. |
| **The index is 8% taller than the reference's.** | 46,287px against 42,755px at 1280, from the same cause: our definitions are sentences where the reference's are phrases. Nothing about the row's rhythm differs. |
| **The page's own heading sits 3.47px lower, and a term's 33px higher, than the reference's.** | Ours is at y131 against its y127.53 because `main` pays 48px above a hero where the reference pays 44.53; a term page's heading is at y151.14 against its y184.14 because the reference's back-link block is taller than ours. Both are the shell's and the back link's height, not the ledger's. |
| **The element pages gained a block this phase did not originally plan.** | "Terms in this entry" is the other end of the plan's cross-linking deliverable, which had only been built in one direction. It is derived, so it adds no prose, and 17 of the 118 entries mention no term and carry no section. |

**Commits:** `5a05a1f` (the reference's glossary in the audit), `39abcef` (the 418 definitions and the data tests), `be7a3d5` (the two family modules, the two templates and the sheet), `63f73d0` (the manifest, the build context and the behaviour), `2d7b019` (the family's tests), `6787b6c` (the headings step down below the shell), `b9cafba` (the router's fragment handling), `73fbb47` (the element side of the cross-linking), plus the close-out commit.

---

## Phase 10 — Calculators, downloads and secondary pages

**Goal:** the temperature calculator, the downloads area, and About and Contact. Scope fixed by
ADR-002.

**Work items**

| ID | Item | Status | Notes |
|---|---|---|---|
| 10.0 | The reference's calculator, downloads and secondary pages, audited live | `COMPLETE` | §3.8 for `/temperature-calculators` — three one-way cards of `data-from`/`data-to` over an `output` at `--step-2`, two-decimal rounding, Kelvin written `273.15°K`, and a polite `role=status` warning below absolute zero — and a new §3.10 for the other three. The reference's downloads page is four links into `/printables-and-pdfs/*` and **none of its targets is a file**; its About and Contact are a placeholder sentence each, so there is nothing to model. `df4d60e` |
| 10.1 | The temperature library | `COMPLETE` | `lib/temperature.js`: Celsius, Fahrenheit and Kelvin converted through Kelvin, the one scale whose zero is a fact, so three pairs are six functions rather than nine. Each scale carries its own absolute zero — `warningFor` says where the floor is — and rounding is offered rather than applied. Pure, with 129 lines of test. `5473e67` |
| 10.2 | The calculator page | `COMPLETE` | `pages/temperature-calculator.js` in two halves: the markup the build writes — all three fields carry the temperature zero converts to, and the notable-temperature table is filled by the same conversion — and the wiring that makes the three fields one as the reader types. **Iron's and tungsten's melting points are read from the element records, not written down**, because a page stating a number the element's own page contradicts is the defect Phase 6 found. `f05c447` |
| 10.3 | The print rules, shared | `COMPLETE` | The print rules live in the table's and the card's own stylesheets and in `layout.css`: one rendering path, so the sheet a reader prints is the page they were already reading. Three tokens carry what a printed sheet needs — the orientation, the margin, and a smaller title. `867ce7c` |
| 10.4 | The downloads page | `COMPLETE` | `pages/downloads.js`: three targets, of which only one is a file — `/data/elements.json`, carrying `download` and a link to the about page's provenance — the other two being pages of this site taught to print. Four ordered steps for getting a good sheet out of a browser. Deliberately **not a copy** of the reference's, for the reason recorded below. `867ce7c` |
| 10.5 | About and Contact, and ADR-005's provenance | `COMPLETE` | `pages/about.js` writes the sources **once as data** — `DATA_SOURCES`: PubChem PUG REST, public domain; Wikidata, CC0 1.0; both retrieved 1 October 2026, each with its transform script — and the page and its test both read that list, because a licence that changed in one place and not the other would be a claim the site could not support. `pages/contact.js` has no form, deliberately: a static build has no server to post to. One sheet, `styles/pages/about.css`, declared by contact and appended to about. `0602032` |
| 10.6 | The tests for the four pages | `COMPLETE` | `tests/pages/downloads.test.js` holds every target to the build and the disk; `tests/pages/about.test.js` holds each dataset against `docs/DATA_SOURCES.md` for its name, licence, host, transform script and retrieval date; `tests/pages/contact.test.js` covers the address, the four report parts and the one link out; `tests/pages/temperature-calculator.test.js` drives the three fields through the conversion. `tests/tools/render-template.test.js` widened to all four templates. `f04ae18` |
| 10.7 | The browser pass, and the two defects it found | `COMPLETE` | At 1280 / 768 / 375: the four headings were still at the glossary index's 3rem step on a phone, so "Temperature calculator", "Downloads and printables" and "About ChemiPedia" each wrapped to two lines — they now step down to 2.1rem as the glossary's already do (`7f8284d`). And the downloads cards' names were `h3` with no `h2` above them, so the page's outline ran `h1 → h3`; each card is a section, so its name is an `h2`, and a test now fails on any skipped level (`b9999d3`). |

**Exit criteria**

- [x] Conversions round-trip; `0 °C = 32 °F = 273.15 K`; `−40 °C = −40 °F`.
- [x] Invalid input handled gracefully, no console errors.
- [x] About and Contact contain no reference prose or brand, and About carries the data-provenance
  section required by ADR-005.
- [x] Every download target resolves in the built output, and the printable periodic table fits a
  single page at both A4 and Letter.

**Verification**

```
Phase 10 verification
[x] node --test source/tests ................ pass  (tests 458 · pass 458 · fail 0)
[x] node --check on every changed module .... pass
[x] Brand scan .............................. PASS: brand scan clean
[x] Console/network on every touched page ... zero errors, zero failed requests (4 pages × 3 widths)
[x] Accessibility tree reviewed ............. one h1 per page, no heading level skipped, a header, a
                                             main, a footer and two navs, every control named, no
                                             image without alt
[x] Keyboard traversal ..................... 26–28 stops in DOM order per page, every one with a
                                             visible focus ring
[x] Reduced motion ......................... honoured: 0 elements animating under
                                             prefers-reduced-motion
[x] 1280 px screenshot vs reference ......... the calculator compared — differences below; the other
                                             three have no reference page to compare with
[x] 768 px  screenshot vs reference ......... the calculator compared — differences below
[x] 375 px  screenshot vs reference ......... the calculator compared — the reference overflows the
                                             viewport by 40px, ours does not
[x] Regression check on an earlier phase .... /glossary/, /elements/hydrogen/ and / at 1280 and 375:
                                             all 200, 0 console errors, no horizontal overflow
[x] Deliberate deviations recorded .......... five, listed below
[x] docs/MIND_MAP.md updated ................ yes
[x] RUN_STATE.md + HANDOFF.md updated ....... yes
```

```
node --test source/tests ............................. tests 458 · pass 458 · fail 0
                                                       (was 413 at Phase 9's close; the four pages add 45)
node --check on every module under source/ ........... all modules parse
node source/tools/build.js ........................... Built 562 routes and the not-found page into dist/
                                                       0 declared routes still waiting
                                                       (was 558 built and 4 waiting; the four templates
                                                       now exist)
Brand scan over source/ .............................. PASS: brand scan clean
MIND_MAP completeness over source/ ................... 163 files, 0 missing (167 counting the four
                                                       .DS_Store files, which are not source)
git log --format='%an <%ae> | committer: %cn <%ce>' ... one identity: Devansh <dhbhensdadia@gmail.com>,
                                                       author and committer, on every commit
git status --short .................................... clean at the close-out commit
```

Served by the dev server and exercised in a real browser (Playwright, system Chrome):

```
  four URLs × three widths ............................. 200 on each, 0 console messages, 0 page
                                                       errors, no horizontal overflow; every same-origin
                                                       link on each page followed and answered 200 (16–17
                                                       of them), and a print stylesheet loaded
  the calculator's fields .............................. typing 37 °C writes 98.6 °F and 310.15 K;
                                                       100 °C writes 212 °F and 373.15 K; −40 writes −40
                                                       on both scales; clearing the Celsius field clears
                                                       the other two and says nothing
  below absolute zero .................................. −500 °C still converts (−226.85 K), the typed
                                                       field is marked `aria-invalid`, and the live region
                                                       reads "Below absolute zero (−273.15 °C), so this
                                                       temperature cannot exist."
  the headings at 375 and 768 .......................... 33.6px on one line for all four pages, and the
                                                       glossary's unchanged beside them
  the headings at 1280 ................................. 48px on one line for all four
  the four pages' geometry at 1280 ..................... calculator: the fields row 1100×90 and each
                                                       field 356×60, the table 753×400; downloads: three
                                                       cards 351×242 each and the steps 4 × 82; about:
                                                       four sections and the sources record 753×596 with
                                                       three 753×213 blocks; contact: three sections, four
                                                       parts and three destinations
  the four pages at 375 ................................ the calculator's table 327×611 inside its own
                                                       box, the downloads cards stacked to 327, the about
                                                       record 327×325 — no page scrolls sideways
```

Print — measured by rendering to PDF and counting the pages in it, not assumed:

```
  A4     1 sheet   /  /periodic-table/properties-and-states/  /elements/hydrogen/  /elements/iron/
  Letter 1 sheet   the same four pages
```

Harness against the reference (workspace/tools/visual, 1280 / 768 / 375):

```
  the calculator against /temperature-calculators ...... page 19.16% / 18.83% / 8.84%; the arrangement
                                                       is the deliberate difference — three synchronised
                                                       fields against three one-way cards, and a table of
                                                       notable temperatures the reference does not have.
                                                       Our headings measure 1100×52.8 at 1280 and
                                                       327×36.95 at 375, against its 460×86 and 367×68.09.
                                                       Our document is 1400px tall at 1280 to its 1524. At
                                                       375 its own document scrolls sideways to 415px;
                                                       ours is 375. Our page logged no console error; its
                                                       page logged a 404.
  the other three pages ................................ no reference page exists to compare with: the
                                                       reference's downloads page is a fifth of the site
                                                       ADR-002 leaves out of scope and none of its targets
                                                       is a file, and its About and Contact are a
                                                       placeholder sentence each.
```

**Appearance — inspected in a browser**

| Width | What was seen | Differences from the reference |
|---|---|---|
| 1280 px | The calculator opens on three number fields side by side — Celsius, Fahrenheit and Kelvin, each with its unit beside it — over a note and the table of notable temperatures. Downloads is three cards across the shell, the third flagged as the file, then four numbered steps. About is a hero and four sections, the third carrying the two datasets and their licences as a label-and-value record. Contact is three sections: what a correction needs, where each kind goes, and the address. | Only the calculator has a reference to differ from, and the difference is the arrangement, as above. The other three have no reference page; their shape follows this site's own shell and sheets. |
| 768 px | The calculator's fields stay one row and its table is 717px inside the shell. The three download cards go two-up; the About record's label column stays 112px. | The reference's calculator stacks its three cards at this width; ours keeps its one row of fields until the field's own floor turns it below 40rem. |
| 375 px | The fields stack, each full width, and the calculator's table scrolls inside its own box rather than the page. The download cards stack; the sources record goes one column with each label above its value; contact's parts and destinations are single columns. | The reference's calculator overflows the viewport by 40px at this width; ours does not. Its headings keep 30.4px on two lines where ours take 33.6px on one. |

**Deliberate deviations**

| Deviation | Why |
|---|---|
| **The downloads page is not a copy of the reference's.** | Measured live, its four targets are all `/printables-and-pdfs/*` pages — a fifth of the site ADR-002 leaves out of scope — and **none of them is a file**, so there is no downloadable asset to reproduce and no print rule to read off. Ours offers three things, only one of which is a file (`/data/elements.json`); the other two are pages of this site taught to print, which is what the plan asked for: one rendering path, so the sheet a reader prints cannot fall out of step with the page they read. |
| **The calculator is three synchronised fields, not three one-way cards.** | The reference has three cards each converting one way (F→C, C→F, C→K), so a reader who wants Kelvin must find the Celsius field. The plan asks for the synchronised form, and it removes that awkwardness. The measured vocabulary is kept: the field's shape, values at `--step-2`, two-decimal rounding, and a **polite** live region rather than an alert. |
| **Kelvin loses the degree sign.** | The reference writes `273.15°K`. Kelvin is not a scale with a degree, and every other figure on this site sets its unit off the number with a space. |
| **About and Contact are written from nothing.** | The reference's two pages are a placeholder sentence each — *"Content not yet migrated"* — so there is no prose to avoid and no layout to measure. What the audit settles is that neither page should be modelled on the reference. |
| **The four headings step down on a phone.** | The same defect Phase 9 fixed for the glossary, found again by this phase's browser pass: at the glossary index's 3rem step on a 375px screen, three of the four headings wrapped to two lines. They now take 2.1rem below 56rem, as the glossary's do — a change in the token layer, so every family that shares the step gets it. |

**Commits:** `df4d60e` (the reference's calculator, downloads and secondary pages in the audit), `5473e67` (the temperature library and its tests), `f05c447` (the calculator), `f29912c` (its table on a phone), `867ce7c` (the print rules and the downloads page), `0602032` (About, Contact and the provenance), `f04ae18` (the four pages' tests), `7f8284d` (the headings step down), `b9999d3` (the closing heading level and its test), plus the close-out commit.

---

## Phase 11 — Quality, accessibility, performance and delivery

**Goal:** turn a working replica into a finished product.

**Work items**

| ID | Item | Status | Notes |
|---|---|---|---|
| 11.0 | The accessibility sweep, and the 443 contrast failures it found | `COMPLETE` | `tools/visual/audit-a11y.mjs` answers the questions a code review cannot: heading order, control names, table captions, contrast against the surface a colour is **actually** composited over, the table's roving tab stop and its arrow keys, and reduced motion — one page per family, nineteen in all, exiting non-zero on a defect so a phase can gate on it. Its first run found **443 failures with one cause**: the reference's own tertiary ink, `#8a938f`, is **3.06:1** on our paper, below AA at the 13.6px step it is used at — every caption, the footer, a configuration row's atomic number, a discovery year, a calculator's unit. `--ink-faint` is now `#5b726e`, which costs the palette a visible fourth step, because any value that passes is within half a step of the secondary ink. The legend chips failed a second way: their count sat on a wash of the chip's own text colour, which lifts the background toward the text — **3.6:1** on the dark chips and **3.9:1** on the mid-tone ones — so the count is ringed rather than washed. The palette's ink-on-surface invariant is now a test that reads both sets of values from the stylesheet. `f1cef8e`, `969cbdf` |
| 11.1 | The responsive sweep over four widths | `COMPLETE` | `audit-responsive.mjs`: nineteen pages at 375 / 768 / 1024 / 1440 — 76 combinations — reporting each page's own horizontal overflow and naming the element that leaves the viewport, rather than only the page that scrolled. The table's own scroller is excluded because its eighteen columns are the recorded exception, so what fails is the page moving, never the table scrolling. Its first run found a real defect: at 375px the orbital-configuration row's element column took its full 22rem and left the notation at zero width, so `[He]2s1` and every other configuration spilled **68px** past the page; the row is one column below the first breakpoint now, and the two columns are unchanged from 640px up. `7269c9f`, `04a9e45` |
| 11.2 | Per-page metadata, and the two crawl files | `COMPLETE` | Every published document gains a `rel="canonical"` link, an Open Graph set (`og:site_name`, `og:type`, `og:title`, `og:description`, `og:url`) and a `summary` Twitter card; an element page's JSON-LD block is a `Thing` named after the element, with the symbol as an alternate name and the record's own atomic number and weight as `PropertyValue`s. The build writes `sitemap.xml` from the routes it **actually wrote** — not from the manifest, which declares pages whose templates may still be missing — 562 `<loc>` entries, and `robots.txt` naming it. The not-found document claims no canonical, because it has no published address. The origin is read from `SITE_ORIGIN` and defaults to a reserved `.example` address that cannot resolve: a confident, wrong canonical is worse than none, so the build says on every run that the placeholder is still in place. `bf44dd7` |
| 11.3 | The build split the 400-line law forced | `COMPLETE` | The home page's build-time rendering pushed `build.js` past the project's file-length limit, so the half of it that answers *what a document looks like* moved to `tools/document.js` (`renderDocument`, `sitemapFor`, `robotsFor`), and `build.js` keeps *what is on the site* — routes, templates, families, files. Behaviour unchanged: 472 tests, the same 562 routes and the same 562-loc sitemap. `3b3b09f` |
| 11.4 | The home page's table, diagrams and finder, drawn at build time | `COMPLETE` | The home page was the last page whose blocks were built after paint: the shipped document held four empty hosts and **118 tiles** arrived from the data layer once the script ran, growing the page by **926px** under the reader — a layout shift of **0.315** — and leaving a crawler, and a reader with the script off, with a table-less home page. `homePageValues` now computes the same four blocks through the same table engine the four views use, and `startHome` only **attaches** behaviour to markup that is already there. Measured after: `dist/index.html` is 71,361 bytes carrying 118 tiles, 236 diagram cells, one canonical and no duplicate id; with the script off a reader still sees all 118 tiles, both diagrams and the finder; after a client-side navigation the roving tab stop still moves and no id is duplicated; **layout shift 0**. `06c5e76` |
| 11.5 | The performance sweep, and the shift it found | `COMPLETE` | `audit-performance.mjs`: six pages — home, the elements index, an element, a table view, the glossary and the calculator — each in a fresh context on a cold cache, reporting the navigation timings, the bytes transferred by initiator, the element and tile counts, the layout shift after paint and every long task the main thread ran. It exits non-zero over a 0.1 shift or a 2000ms load, proved by forcing the budget negative and watching the run fail. It measured rather than assumed: the 0.315 shift above is its finding, and shift 0 on all six pages is its record. `8869b4c` |
| 11.6 | Lighthouse as the phase's outside opinion, and the four defects it found | `COMPLETE` | `audit-lighthouse.mjs` drives Lighthouse — mobile emulation, throttled — over seven pages: the six the performance sweep measures plus a group page, which is the only page that rests in the table's isolation state. It gates accessibility at 1.0 and best-practices at 0.95 and only records performance and SEO, because a 100 over loopback would be a claim about the harness. It found four things our own sweep had not caught, each fixed where it starts: a tile's number and name faded to 0.9 and 0.92 of the ink, and the actinide sage only has 4.96:1 to give, so they measured **4.32:1 at 8.8px** — the ceiling is now derived from the eleven pairings (0.93) and every fading token, the card's number included (**4.01:1** on the elements index), is held above it by a test; an isolated table dimmed **whole tiles** to 0.22, taking the text with it, so **109 tiles** on the group pages measured **1.5:1** — the drain now mixes the fill towards the paper and leaves the ink alone; the element page's miniature table is one picture, so a `role="listitem"` inside its `role="img"` was an ARIA orphan, and the tile's list role is now the caller's choice; and three families named their links with an `aria-label` that reworded what the link shows, hiding the card's group and measurement from a reader who cannot see them, so the visible content is the name now. Our own sweep was taught to composite an element's own `opacity`, which is why it had missed the first. `5cc54d1`, `964bf80` |
| 11.7 | The deployment, and the reference's own metadata audited live | `COMPLETE` | `.github/workflows/pages.yml` is the whole deployment: on a push to `main` it computes the address the site will be served from — the domain root for a repository named `<owner>.github.io`, a path named after the repository otherwise — builds with `SITE_ORIGIN` set to it, runs `node --test source/tests`, and hands `dist/` to Pages. The YAML was validated and the origin logic checked for both repository-name shapes. The README's status table, quality-gates section and Pages subsection were rewritten to state only what is measured. Separately, the reference's metadata was audited live into `research/01` §5: it ships **no JSON-LD**, declares no icon and answers `/favicon.ico` with a 404 on every page load, and its `/sitemap.xml` is itself a 404 behind a 922-entry child sitemap under an index. `b741a49`, `1c431ee` |
| 11.8 | Documentation close-out, and the `guides/` audit it turned up | `COMPLETE` | README (status, gates, publishing), `MIND_MAP.md` (the `.github/` node and its row, the two new tools, the audit row), `research/01` §5 with the reference's metadata, `RUN_STATE.md`, `HANDOFF.md` and this entry. The close-out also **audited all four guides against the source, and three of them had drifted**: the interview reference still carried 18 `(pending)` rows from Phases 2–6 and named functions that were never exported (`foregroundFor`, `byCategory`, `createScale`, `rovingFocus`, `hydrate`); the tour's file tree listed three files that do not exist (`index.html` at the source root, `converter-input.js`, `filter-bar.js`) and missed eighteen that do; and the page trace said the element page hydrates in the browser, which it never did — `element-detail` has **no** entry in `PAGE_BEHAVIOUR` at all, and its mini table, shell diagram, pager and FAQ are all built. All three now describe what ships, and where the truth was better than the old text (the 0.315 shift, the 4.32:1 label) it is written in. `MIND_MAP` completeness: **168 files under `source/`, 0 missing**. No `TODO` remains in a tracked file; the word appears only where the two documents that discuss it name it. |

**Exit criteria**

- [x] Accessibility sweep passed: landmarks, headings, labels, contrast AA, reduced motion, full
  keyboard traversal, focus management on route change. (19 pages, 0 defects, 27 informational
  lines; Lighthouse accessibility 100 on all 7 sampled pages.)
- [x] Responsive audit passed at 375 / 768 / 1024 / 1440 px on every page. (76 of 76.)
- [x] Performance measured and recorded; no render-blocking work. (Worst layout shift 0, slowest cold
  load 38ms on this close-out run and 41ms on the run that landed the sweep — the same six pages, cold
  cache, so the spread is the machine rather than the site; 0 long tasks. No script in the head but the JSON-LD data block, which does not execute;
  the module that does run is `type="module"` at the end of the body, so it is deferred; and the
  data layer is read at build time rather than fetched before paint. What is left blocking a first
  paint is the site's own 9–14 small same-origin stylesheets, which is what prevents a flash of
  unstyled content.)
- [x] Per-page titles, descriptions, canonical, Open Graph, structured data; `sitemap.xml`;
  `robots.txt`.
- [x] Print stylesheet for the table and element pages — **built and measured in Phase 10** (work
  item 10.3, one sheet per table page and per sampled card at A4 and Letter). Not rebuilt here.
- [x] Documentation current; no `TODO` in tracked files.
- [x] Deployment written, gated and documented, and `v1.0.0` tagged. The deployment is the committed
  Pages workflow with the host's own routing fallback, and the README's publishing steps; at the
  close of this phase the tag was local and the repository had no remote, so **the push itself was
  still the author's one-time step** (`docs/GIT_WORKFLOW.md` §8) — recorded as a deviation below
  rather than as done. It ran the day after, on the author's instruction; the publish entry below
  records what the live address then exposed.
- [x] A clean clone runs and deploys following only the README. Verified by cloning the repository
  into an empty directory: `node source/tools/build.js` writes 562 routes and `node --test
  source/tests` passes 482, with nothing installed, because the project declares no dependencies.

**Verification**

```
Phase 11 verification
[x] node --test source/tests ................ pass  (tests 482 · pass 482 · fail 0)
[x] node --check on every changed module .... pass  (111 modules under source/, every one parses)
[x] Brand scan .............................. PASS: brand scan clean
[x] Console/network on every touched page ... zero errors and zero failed requests on ours across all
                                             four sweeps (19 + 6 + 7 + 13 pages); in the same run the
                                             reference logged one 404 — its own undeclared favicon
[x] Accessibility tree reviewed ............. 0 defects and 27 informational lines over 19 pages —
                                             19 pages answered 200, six table-keyboard measurements,
                                             two live regions; Lighthouse accessibility 100 on 7
[x] Keyboard traversal ..................... the table's roving tab stop, on each of the six pages
                                             that carries the table: 118 tiles, 1 stop, ArrowRight
                                             moves Hydrogen to Helium and still leaves one stop
[x] Reduced motion ......................... honoured: 0 elements animating under
                                             prefers-reduced-motion
[x] 1280 px capture vs reference ........... compared (home): the table region identical to the
                                             pixel in size (1230 × 626, size delta 0 × 0) and the
                                             same 18 columns to a hundredth of a pixel, crop
                                             mismatch 2.31% — the typeface class, and unmoved by
                                             this phase's build-time rendering
[x] 768 px capture vs reference ............ compared (home): all five crops identical in width and
                                             within 2px of height; table crop 8.89%
[x] 375 px capture vs reference ............ compared (home): table crop 4.23%; no horizontal
                                             overflow on either page
[x] 1024 / 1440 px responsive sweep ........ 76 of 76 page-and-width combinations fit, every width
[x] Regression check on an earlier phase .... the home page, which this phase moved from client to
                                             build: 118 tiles, 236 diagram cells, 1 canonical, no
                                             duplicate id, layout shift 0, table keyboard intact
[x] Deliberate deviations recorded .......... seven, listed below
[x] docs/MIND_MAP.md updated ................ yes
[x] RUN_STATE.md + HANDOFF.md updated ....... yes
```

```
node --test source/tests ............................. tests 482 · pass 482 · fail 0
                                                       (was 458 at Phase 10's close; the four
                                                       accessibility defects and the home page's
                                                       rendering add 24)
node --check on every module under source/ ........... 111 modules, every one parses
node source/tools/build.js ........................... Built 562 routes and the not-found page into dist/
                                                       0 declared routes still waiting
Brand scan over source/ .............................. PASS: brand scan clean
MIND_MAP completeness ................................ 168 files under source/, 0 missing; the new
                                                       .github/workflows/pages.yml and the two new
                                                       visual tools are all listed
node workspace/tools/visual/audit-a11y.mjs ........... 0 defect(s) and 27 informational line(s) across
                                                       19 pages                              · exit 0
node workspace/tools/visual/audit-responsive.mjs ..... 76 of 76 page-and-width combinations fit their
                                                       viewport                             · exit 0
node workspace/tools/visual/audit-performance.mjs .... worst layout shift 0, slowest cold load 38ms,
                                                       0 long task(s)                       · exit 0
                                                       (the run recorded when the sweep landed read
                                                       41ms; both are cold-cache timings on a shared
                                                       machine, and the README quotes the pair)
node workspace/tools/visual/audit-lighthouse.mjs ..... accessibility 100 · best-practices 100 · seo 100
                                                       on all 7 pages; performance 89 mean (82–98),
                                                       recorded rather than gated · the run recorded at
                                                       the baseline commit was 92 mean (83–98), and the
                                                       two differ only by run-to-run throttling variance
                                                                                            · exit 0
clean clone in an empty directory, nothing installed . node source/tools/build.js → 562 routes;
                                                       node --test source/tests → 482 pass, 0 fail
git log --format='%an <%ae> | committer: %cn <%ce>' ... one identity, Devansh <dhbhensdadia@gmail.com>,
                                                       author and committer, on every commit
git status --short .................................... clean at the close-out commit
```

**Appearance — the one page this phase changed, compared**

Only the home page's own markup changed (work item 11.4): its four blocks moved from the browser to
the build. It was captured against the reference at three widths in the harness, and the numbers say
the change moved nothing.

| Width | Table crop | Size delta | What differs, and why |
|---|---|---|---|
| 1280 px | 2.31% | 0 × 0 | The grid's eighteen column widths match the reference's to a hundredth of a pixel and the tile box is identical (`37.94px`, radius `3px`, same background). The differing pixels are the typeface, plus this phase's deliberate changes: our tile numbers and names are at `0.95` / `0.96` where the reference's are at `0.9` / `0.92`, because 0.9 of the ink is 4.32:1 on the actinide sage. The whole table sits 22.89px lower, which is the hero above it measuring taller in our typeface, and it does so in both pages' boxes equally. |
| 768 px | 8.89% | 0 × ±1 | Every crop is identical in width; the ±1px is rounding in the captured band. Our legend wraps at this width where the reference's still fits, which is the known twelve-group-names deviation. |
| 375 px | 4.23% | 0 × 0 | Same table, same columns; neither page overflows its viewport. |

**Deliberate deviations**

| Deviation | Why |
|---|---|
| **The tertiary ink is darker than the reference's.** `--ink-faint` is `#5b726e` rather than the reference's `#8a938f`. | The reference's own value is 3.06:1 on our paper — 443 failures across nineteen pages at the 13.6px step it is used at. The cost is honest and recorded in `DESIGN_SYSTEM.md`: the palette's fourth step is compressed, because any value that passes AA at that size is within half a step of the secondary ink. |
| **Faded tile ink is capped by measurement, not by taste.** `--opacity-tile-number` 0.95, `--opacity-tile-name` 0.96, `--opacity-card-z` 0.95, against the reference's 0.9 / 0.92 / 0.85. | The actinide sage has 4.96:1 to give at full ink, so 0.9 of it is 4.32:1 at 8.8px. The ceiling is derived from the eleven pairings by `lowestAlphaForAA` (0.93) and every fading token is held above it by a test, so the next fade cannot reintroduce the defect. |
| **An isolated table drains the fill, not the tiles.** The reference sets `opacity: 0.22` on every non-member tile; ours mixes the tile's fill 30% towards the paper and leaves the ink alone. | Dimming the whole tile dims its text with it: 109 drained tiles measured **1.5:1** on the group pages. The isolation still reads — that is what the 30% mix is for — but the label stays legible, and `.is-match` and `:focus-visible` restore the full fill. |
| **The home page is rendered at build time.** The reference assembles its table after paint. | Server-rendering the same four blocks through the same engine removed a 0.926-page shift (0.315 CLS to 0), and it is also what makes the home page exist for a crawler and for a reader whose script did not run. |
| **`twitter:card` is `summary`, not `summary_large_image`.** | We have no social image. A large card with a missing image is the worse lie, and the reference's own `og:image` is a relative path no crawler can resolve. |
| **Three families' links carry no `aria-label`.** The element card, the ranking bar and a group's member card name themselves by their visible content. | An `aria-label` that rewords what a link shows is a label-content-name mismatch, and it was hiding the card's group and its measurement from a reader who cannot see them. |
| **The deployment was published by the author's one-time push, a day after this phase closed.** The workflow, the routing fallback and the README's publishing steps were committed here; the tags and the live site followed on the author's instruction. | `docs/GIT_WORKFLOW.md` §8 makes publishing a deliberate, author-approved step, and nothing was claimed live on the strength of a pipeline. It did go live — and the live address then exposed a defect **this phase's four sweeps could not see**, because all four run against a site served at a domain root: every URL was rooted at the domain rather than at the site's own path. Fixed in `bd338dd`; the publish entry below has the verification. |

**Commits:** `f1cef8e` (the tertiary ink and the legend counts meet AA), `969cbdf` (the accessibility sweep), `7269c9f` (the configuration rows stack on a phone), `04a9e45` (the responsive sweep), `bf44dd7` (canonical, Open Graph, JSON-LD, `sitemap.xml`, `robots.txt`), `3b3b09f` (the document skeleton out of the build), `06c5e76` (the home page drawn at build time), `8869b4c` (the performance sweep and its budgets), `5cc54d1` (the four accessibility defects), `964bf80` (Lighthouse and the baseline), `b741a49` (the Pages workflow and the README), `1c431ee` (the reference's metadata in the audit), `ec80c43` (the four guides corrected against the source), plus the close-out commits that carry this entry: the phase log, the run-state checkpoint and the handoff note, and the wording fix that makes the README and both checkpoints quote the sweep's two timings as one range.

**Tag:** `v1.0.0`, annotated, on the last commit of the phase's close-out.

---

## Publish — the push, and the deployment it corrected

**Goal:** put the finished site on the author's own GitHub account, under the author's own name, and
have the address that repository gives it serve the site.

Not a phase: nothing on the plan was open. This is the author's one-time publishing step of
`docs/GIT_WORKFLOW.md` §8, run on the author's instruction, plus the one class of defect that only a
live address can show.

**Work items**

| ID | Item | Status | Notes |
|---|---|---|---|
| P.1 | The repository, and the author's ownership of it | `COMPLETE` | The remote is `https://github.com/DHBhensdadia/Chemipedia.git`, public, and empty at the time. `main` and both tags were pushed: `e035c6f` as `main`, `v1.0.0` on it and `v0.1.0` on `a16d35e`, confirmed by `git ls-remote`. Authorship was then checked **on GitHub rather than locally**: every commit's `author.login` is `DHBhensdadia` (id 207889312, attested `type: User`), `commit_author` is `Devansh <dhbhensdadia@gmail.com>`, and the contributors endpoint counts **one** contributor with 106 contributions. No unlinked grey avatar, so §9 of the workflow — a commit-email mismatch — is not in play. `e035c6f` |
| P.2 | Pages enabled, and the first run made green | `COMPLETE` | The first run of `Publish` failed in `actions/configure-pages@v5` with *Get Pages site failed … Not Found*: the workflow was correct and the repository had no Pages site yet. Enabled through the API with `build_type=workflow` rather than by hand, and the run rerun: build ✓ 23s, deploy ✓ 38s, overall ✓. Only warnings are the Node 20 deprecation notices. |
| P.3 | The live address, and the defect a root build cannot show | `COMPLETE` | The site loaded **and was broken**: its documents asked for `/styles/tokens.css`, `/scripts/app.js` and `/assets/brand/favicon.svg` — the **domain** root, where nothing is, because a project site is served from `/Chemipedia/`. The page returned 200 while everything it needed 404'd, which is why the fix is in two places and not one: the build rewrites every URL a finished document roots at its own `/`, and the two requests the rewriting cannot reach — a data file, and the finder's link, which the browser writes after the page has loaded — ask `scripts/lib/site-path.js`, which reads the site's path off its own module's address. `bd338dd` |
| P.4 | Verified against the deployed shape, then on the deployment | `COMPLETE` | See the block below. Every check was run against a site served from a path, and then against the live address itself. |

**Verification**

```
node --test source/tests ............................. tests 497 · pass 497 · fail 0
                                                       (482 at Phase 11's close; the deployment
                                                       fix adds 15: 4 for the document rewriting,
                                                       1 for the origin's path, 6 for the runtime
                                                       site path, 4 for the data address)
SITE_ORIGIN=https://dhbhensdadia.github.io/Chemipedia
  node source/tools/build.js ......................... Built 562 routes and the not-found page into dist/
walk over every built document ....................... 563 files · 0 URLs outside /Chemipedia · 0 doubled
local Pages simulation (dist/ served under /Chemipedia at 127.0.0.1:4182)
  GET /Chemipedia/ ................................... 200
  GET /Chemipedia/styles/tokens.css .................. 200
  GET /Chemipedia/scripts/app.js ..................... 200
  GET /Chemipedia/assets/brand/favicon.svg ........... 200
  GET /Chemipedia/data/elements.json ................. 200   (this one was a 404 Fetch before P.3)
  GET /Chemipedia/elements/hydrogen/ ................. 200
                    · 118 tiles built from the data, 13 stylesheets applied, computed
                      border colour read off the rendered tile
                    · a client-side navigation from a tile: URL pushed, body swapped,
                      element-detail started, fetched document 200
Gh workflow run “Publish” on bd338dd ................. build ✓ 23s · deploy ✓ 38s · overall ✓
https://dhbhensdadia.github.io/Chemipedia/ ........... 200
  /styles/tokens.css, /scripts/app.js,
  /scripts/lib/site-path.js, /assets/brand/favicon.svg,
  /data/elements.json, /elements/hydrogen/, /glossary/,
  /sitemap.xml, /robots.txt ......................... 200 each
https://dhbhensdadia.github.io/styles/tokens.css ..... 404   (the domain root: correctly empty)
live, in a browser ................................... SITE_BASE “/Chemipedia” · DATA_ROOT “/Chemipedia/data”
                                                       · 118 tiles · favicon and all 13 sheets under
                                                       the site's path · finder's match link
                                                       “/Chemipedia/elements/gold/” · client-side
                                                       navigation landing on the element page
git log --format='%an <%ae>' ......................... one identity on every commit, author and
                                                       committer · no co-author footer anywhere
```

**Deliberate deviations**

| Deviation | Why |
|---|---|
| **`v1.0.0` was not moved, and `v1.0.1` was added instead.** | The tag was already pushed, so it is a statement the history has made: `v1.0.0` is the release whose publication exposed the subpath defect. `v1.0.1` is on `bd338dd`. Moving a pushed tag would need a force-push of the ref, and `docs/GIT_WORKFLOW.md` §8 forbids that without the author's in-the-moment instruction. |
| **Pages was enabled through the API rather than by hand.** | `POST /repos/:owner/:repo/pages` with `build_type=workflow` is the same setting as clicking **Source: GitHub Actions**, and it is reproducible. The alternative was telling the author to visit a settings page for a click. |
| **The Node 20 deprecation notices were left alone.** | Five actions target Node 20 and are being forced onto Node 24; both jobs succeeded with the notices on them. Bumping five action versions is a separate change from a deployment fix, and mixing them would make a failed deploy ambiguous. Recorded in `RUN_STATE.md` as a known risk instead. |
| **`package.json`'s `homepage` was corrected to the repository's real name.** | It said `chemipedia` where the repository is `Chemipedia`. GitHub redirects either way, but this is the address the project publishes, and the path case is what the deployment depends on. |

**Commits:** `e035c6f` (the README's run instructions — the last commit of `v1.0.0`, and the one that
went live first), `bd338dd` (the deployment fix), plus the close-out commits carrying this entry, the
run-state checkpoint, the handoff note and the README's status.

**Tag:** `v1.0.1`, annotated, on `bd338dd`.

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
| 2026-10-02 | 2 | Resolved | **The visual gate that blocked this phase.** The preview would not composite, so no capture could be taken and the phase could not honestly be closed. | **Resolved.** The preview composited on the first attempt of the following session. The home page was captured and compared at 1280 / 768 / 375 px against the reference in a second tab; the two chrome differences that turned up were fixed in `30f203b`, and the phase closed on those captures. |
| 2026-10-02 | 2 | Deviation | **The masthead stays on one row at 768px** where the reference wraps its search field onto a second row. Our navigation carries four items and the reference's carries six, the learning and games sections being out of scope (ADR-002). | Accepted. Measured: 91px in two rows against our 59px in one. |
| 2026-10-01 | 2 | Deviation | **Two schema fields stay null for every element** (`covalentRadius`, `latticeParameters`) and **one was removed from the schema** (`ionicRadius`). | Recorded in `docs/DATA_SOURCES.md` §2.1 and §5. null means unknown and the UI renders it as such; the removed field was removed because an ionic radius belongs to an ion and not to an element. |
| 2026-10-05 | 5 | Deviation | **The element page's hero is tinted by the element's own category colour**, which the earlier hydrogen-only measurement had recorded as one fixed blue wash. | Fixed in `2cd6460` after the iron capture measured the reference at all eleven categories: the wash is the category colour at 55% and 22%, mixed through `--fill`, the same key the table paints tiles from. Hydrogen 3.60%→3.57%, iron 11.94%→3.53% of the viewport. |
| 2026-10-05 | 5 | Fixed | **The router did not carry the arriving page's name.** `swap()` replaced the body's children but left the live `<body data-page>` from the page we came from, so a client-side navigation to the home page would have arrived with its table and finder never started; replacing the children also took the running app module out of the document. | Both fixed in `4763e89` and covered by `tests/router/router.test.js`: the page's name travels with the swap, and the running scripts are carried across while the incoming ones are still refused. Verified in a browser: home boots its table after an in-page navigation, and the DOM still holds the one app module afterwards. |
| 2026-10-05 | 5 | Deviation | **What still differs from the reference on an element page, and why it never will match exactly.** | Recorded rather than chased, each in the Phase 5 deviations table: the typeface and the copy (brand and provenance rules), two particle tiles instead of three and 27 property rows instead of 30 (both with reasons in the code), a visually hidden figure caption and a rule rather than a white fill on the current cell (accessibility and legibility), the masthead's reserved underline, and the reference's phone-only shift and square diagram asset. Every box that can be measured matches. |
| 2026-10-05 | 6 | Data observation | **Two promises the data disagreed with.** The melting-point route's description said the ranking runs "from helium to tungsten", and the dataset's highest melting point is carbon's 3549.85 °C — tungsten's 3422 °C is second. Separately, the source orders its configuration terms by its own convention, so iron is `[Ar]4s2 3d6` and chromium `[Ar]3d5 4s1`. | The description was corrected to "from helium at the bottom of the scale to carbon at the top" in `44e3493`, and `tests/pages/ranking.test.js` now holds both rankings' extremes. The configuration strings are printed as the records hold them, recorded as a deviation above rather than normalised. |
| 2026-10-05 | 6 | Fixed | **The new pages' tiles came out grey.** The key-to-colour map lives in `styles/components/periodic-table.css`, and the four routes this phase added declared their own sheets but not that one, so `--fill` resolved to nothing and every card's tile, every ranking chip and every configuration chip fell back to the sunken surface. | Fixed in `44e3493` by declaring the table's sheet on the four routes, as the element pages already do. Caught by measuring the computed background colour in a browser rather than by reading the markup, which is why the check is in the verification block. |
| 2026-10-05 | 3–4 | Resolved | **Screenshot capture failed for two sessions running.** `preview_screenshot` reported that the webview produced no frames — three times in the session that built the engine, twice more at the start of the next, with `preview_resize {fill: true}` and once in a freshly opened tab. | **Resolved by the author's instruction to fix the tooling.** Track B of `docs/research/02` was adopted: `workspace/tools/visual` drives the system Chrome headlessly and captures, diffs and measures both pages. Both phases now close `COMPLETE` on captures, and the panel's own screenshot tool is no longer on the critical path for any phase. |

---

## How to record a phase close-out

1. Fill every line of the close-out checklist in `docs/TESTING_STRATEGY.md` §7 — honestly.
2. Paste the checklist, filled in, into that phase's **Verification** section above.
3. List the commit hashes that make up the phase.
4. Set the phase status to `COMPLETE` in the summary table.
5. Update `RUN_STATE.md` to point at the next phase, and rewrite `HANDOFF.md`.
6. Tag the milestone if it warrants one (`docs/GIT_WORKFLOW.md` §7).
