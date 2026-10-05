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
| 2026-10-02 | 2 | Resolved | **The visual gate that blocked this phase.** The preview would not composite, so no capture could be taken and the phase could not honestly be closed. | **Resolved.** The preview composited on the first attempt of the following session. The home page was captured and compared at 1280 / 768 / 375 px against the reference in a second tab; the two chrome differences that turned up were fixed in `30f203b`, and the phase closed on those captures. |
| 2026-10-02 | 2 | Deviation | **The masthead stays on one row at 768px** where the reference wraps its search field onto a second row. Our navigation carries four items and the reference's carries six, the learning and games sections being out of scope (ADR-002). | Accepted. Measured: 91px in two rows against our 59px in one. |
| 2026-10-01 | 2 | Deviation | **Two schema fields stay null for every element** (`covalentRadius`, `latticeParameters`) and **one was removed from the schema** (`ionicRadius`). | Recorded in `docs/DATA_SOURCES.md` §2.1 and §5. null means unknown and the UI renders it as such; the removed field was removed because an ionic radius belongs to an ion and not to an element. |
| 2026-10-05 | 5 | Deviation | **The element page's hero is tinted by the element's own category colour**, which the earlier hydrogen-only measurement had recorded as one fixed blue wash. | Fixed in `2cd6460` after the iron capture measured the reference at all eleven categories: the wash is the category colour at 55% and 22%, mixed through `--fill`, the same key the table paints tiles from. Hydrogen 3.60%→3.57%, iron 11.94%→3.53% of the viewport. |
| 2026-10-05 | 5 | Fixed | **The router did not carry the arriving page's name.** `swap()` replaced the body's children but left the live `<body data-page>` from the page we came from, so a client-side navigation to the home page would have arrived with its table and finder never started; replacing the children also took the running app module out of the document. | Both fixed in `4763e89` and covered by `tests/router/router.test.js`: the page's name travels with the swap, and the running scripts are carried across while the incoming ones are still refused. Verified in a browser: home boots its table after an in-page navigation, and the DOM still holds the one app module afterwards. |
| 2026-10-05 | 5 | Deviation | **What still differs from the reference on an element page, and why it never will match exactly.** | Recorded rather than chased, each in the Phase 5 deviations table: the typeface and the copy (brand and provenance rules), two particle tiles instead of three and 27 property rows instead of 30 (both with reasons in the code), a visually hidden figure caption and a rule rather than a white fill on the current cell (accessibility and legibility), the masthead's reserved underline, and the reference's phone-only shift and square diagram asset. Every box that can be measured matches. |
| 2026-10-05 | 3–4 | Resolved | **Screenshot capture failed for two sessions running.** `preview_screenshot` reported that the webview produced no frames — three times in the session that built the engine, twice more at the start of the next, with `preview_resize {fill: true}` and once in a freshly opened tab. | **Resolved by the author's instruction to fix the tooling.** Track B of `docs/research/02` was adopted: `workspace/tools/visual` drives the system Chrome headlessly and captures, diffs and measures both pages. Both phases now close `COMPLETE` on captures, and the panel's own screenshot tool is no longer on the critical path for any phase. |

---

## How to record a phase close-out

1. Fill every line of the close-out checklist in `docs/TESTING_STRATEGY.md` §7 — honestly.
2. Paste the checklist, filled in, into that phase's **Verification** section above.
3. List the commit hashes that make up the phase.
4. Set the phase status to `COMPLETE` in the summary table.
5. Update `RUN_STATE.md` to point at the next phase, and rewrite `HANDOFF.md`.
6. Tag the milestone if it warrants one (`docs/GIT_WORKFLOW.md` §7).
