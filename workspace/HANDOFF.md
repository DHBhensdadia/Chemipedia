# HANDOFF.md — note to the next agent

**Written:** 2026-10-06 · **By:** the session that built the four alternate table views and closed
Phase 7 · **After commit:** `d1a4ad4` plus the close-out commit

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

The table could name an element; it can now answer four questions about the whole set.

- `/periodic-table/properties-and-states/`, `/orbitals/`, `/electronegativity/` and `/evolution/` —
  one module and four templates over the Phase 3 engine. Each view is a colour mode plus the line
  written under its table; two of them add a section below it (the electronegativity trend, the
  evolution timeline).
- `source/scripts/lib/discovery.js` — reads a discovery year, splits 118 elements into six eras plus
  an undated bucket, and derives the count in each.
- `source/scripts/lib/electronegativity.js` — 95 measured of 118, ends francium 0.7 and fluorine 3.98,
  derives the two rising periods and the direction of each group.
- `source/scripts/components/era-timeline.js`, `source/styles/components/era-timeline.css` — the
  timeline under the evolution view, one card per era.
- The engine gained a fifth mode (`discovery`) and now exports `attachPeriodicTable`; the block
  palette was corrected to the reference's own four group colours.
- 369 tests, all passing, still with nothing to install.
- The build renders 127 routes; **6** declared routes are still waiting on their templates.

**Phase 7 is `COMPLETE`.** All four pages were audited against the reference, captured, pixel-diffed
and measured in one headless browser at 1280 / 768 / 375. Our legend lands on the reference's own
y (364) and the grid within 2.1px on three views; tile-by-tile colour agreement is 104–114/118 on the
three keyed views and 109/118 on evolution. What is left is the typeface, the reference's own era
boundaries and the seven recorded deviations in `progress/PHASE_LOG.md`.

**The reference audit paid for itself again.** Moving the page's note *below* the table — where the
reference keeps it — took 224px off the top of the comparison; the earlier build had put it between
the legend and the grid. Reading our own markup would never have shown that.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **Phase 8 — the element group pages**: `/element-groups/:slug` for the eleven categories, plus the
   `/element-groups/` landing page (its route is already declared, waiting on `element-groups-index`).
   Read the exit criteria in `progress/PHASE_LOG.md`; `elementRoutes(elements)` in
   `source/scripts/router/routes.js` is the family pattern to follow.
3. **Audit the reference's group pages live before writing their CSS.** §3.6 of
   `docs/research/01-reference-site-audit.md` is still a one-line expectation, not measurements.
4. **Check "member counts match the reference exactly" against our own taxonomy** before adopting its
   numbers. Our counts: transition metals 35 · lanthanides 15 · actinides 15 · post-transition metals 8
   · unknown 8 · non-metals 7 · noble gases 7 · alkali metals 6 · alkaline earth metals 6 · metalloids
   6 · halogens 5 (total 118). The plan's own examples — 35, 5, 8 — already match ours.

## What is fragile or easy to get wrong

- **Every page family must declare the stylesheets it depends on**, including
  `styles/components/periodic-table.css` — that sheet is where a category key becomes a colour, so a
  page of tiles, chips or bars needs it even though nothing on it is a periodic table.
- **The router's swap has four rules that are easy to break.** Incoming scripts are refused, the
  running ones are carried across, the arriving body's `data-page` must be copied onto the live body
  before `startPage` is called, and a failure must be handed back to the browser rather than
  half-swapped. `tests/router/router.test.js` holds all four; the bug it was written for was silent.
- **A page's behaviour is a name, not a script.** A page earns an entry in `app.js`'s
  `PAGE_BEHAVIOUR` or it runs nothing after a swap — and an attachment must tolerate being made
  again on the same document, because that is what Back does.
- **A value is formatted through the units data or not at all.** The card, the ranking row and the
  property panel all ask `units.json` for the unit and `lib/format.js` for the text, which is what
  keeps a measurement from reading two ways on two pages.
- **The preview is unreliable in two different ways, and both can waste a session.** It may not
  composite, so no screenshot can be taken; and its window has no operating-system focus, so `focus`,
  `blur` and real key events are never delivered. Use the Playwright pages in
  `workspace/tools/visual` for keyboard and focus checks. Do not retry the panel tool a third time.
- **The harness compares *boxes*, not tastes.** A crop that matches in size with a few per cent of
  differing pixels is a typeface or copy difference — read `fontFamily` and the two pages' text in
  `report.json` before changing any CSS. Its region selector lists are tuned to the page family; a
  new family needs its own selectors, and a missing region is a finding rather than a failure.
- **A tile's colour is a key, never a value.** Components emit `data-key` or `data-band`;
  `periodic-table.css` maps both to tokens. Do not inline a hex, and remember `color-mix()`
  percentages count as colour values too.
- **No literal values.** Colours, sizes, radii and durations go in `tokens.css`; breakpoints are the
  one recorded exception. A number that comes from the data — a tile's grid cell, a bar's ratio — is
  not a design value and may travel in a `style` attribute.
- **`source/tests/brand/brand.test.js` will fail the suite** if the reference's name appears
  anywhere under `source/`, comments included. Call it "the reference".
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer.
- **Shell quoting.** Write commit messages with `git commit -F -` and a heredoc; an apostrophe in an
  inline `-m` breaks the path. Stage by explicit path, never `git add -A`.

## Anything deliberately left in a half state

Nothing is half-done in the tree; the working tree is clean and no gate is open. Six routes the shell
already links are still waiting on their templates — `/downloads/`, `/calculators/temperature/`,
`/glossary/`, `/element-groups/`, `/about/`, `/contact/` — which is the construction state the build
reports on every run. Phase 8 closes `/element-groups/`.

Two older deferrals stand: the 418 glossary definitions belong to Phase 9, and `covalentRadius` and
`latticeParameters` are `null` because no acceptable source supplies them.
