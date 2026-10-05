# HANDOFF.md — note to the next agent

**Written:** 2026-10-05 · **By:** the session that built the elements index and the attribute pages ·
**After commit:** `44e3493` plus the close-out commit

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

The site had a front door and somewhere to go; it now has a way to browse and compare.

- `/elements/` — 118 cards written at build time, each a link with the element's tile, name, group,
  atomic weight and state, and a live filter over name, symbol and atomic number. The filter walks
  the cards the document already holds and reads the `?q=` the home page's finder submits.
- `/properties/melting-point/` and `/properties/boiling-point/` — one module behind both, ranked by
  the field the route carries, with a bar showing where each value sits between the page's own lowest
  and highest. The elements the source has not measured are listed last and say Unknown.
- `/properties/orbital-configuration/` — all 118 grouped by block (14 / 36 / 38 / 30), with a
  sentence per block and a closing section naming the nineteen elements whose configurations differ
  from the predicted filling order.
- `source/scripts/components/element-card.js`, `bar-ranking.js` — the two new components, each with a
  stylesheet, both painted by the category key the table already uses.
- `source/scripts/lib/electron-configuration.js` — reads a configuration shorthand, predicts the
  Madelung filling, and reports where the two differ.
- 320 tests, all passing, still with nothing to install.
- The build renders 123 routes; ten declared routes are still waiting on their templates.

**Phase 6 is `COMPLETE`.** All four pages were captured, pixel-diffed and measured against the
reference in one headless browser at 1280 / 768 / 375: the index 9.27% / 5.26% / 9.18% of the
viewport and the melting-point ranking 5.3% / — / 8.38%. The index's filter is 420 × 54.14px — the
reference's field to the pixel — and its grid resolves to the same four, three and two columns at the
same widths, out of one `auto-fill` line. What is left is the typeface, our shorter copy, and the
seven recorded deviations in `progress/PHASE_LOG.md`.

**The first browser pass earned its place again.** Every tile came out grey: the key-to-colour map
lives in `periodic-table.css`, and the four new routes had not declared it. Measuring the computed
background colour caught it; reading the markup would not have.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **Phase 7 — the four alternate table views**: `/periodic-table/{properties-and-states,orbitals,
   electronegativity,evolution}`. Read the exit criteria in `progress/PHASE_LOG.md`. The engine
   already takes a mode, so this is mostly copy, one module and four templates.
3. **Audit the reference's four views live before writing their CSS.** §3.5 of
   `docs/research/01-reference-site-audit.md` is a summary written from the navigation, not from
   measurements.

## What is fragile or easy to get wrong

- **Every page family must declare the stylesheets it depends on**, including
  `styles/components/periodic-table.css` — that sheet is where a category key becomes a colour, so a
  page of cards, chips or bars needs it even though nothing on it is a periodic table.
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
  `periodic-table.css` maps both to tokens. Do not inline a hex.
- **No literal values.** Colours, sizes, radii and durations go in `tokens.css`; breakpoints are the
  one recorded exception, and `color-mix()` percentages count as colour values. A number that comes
  from the data — a tile's grid cell, a bar's ratio — is not a design value and may travel in a
  `style` attribute.
- **`source/tests/brand/brand.test.js` will fail the suite** if the reference's name appears
  anywhere under `source/`, comments included.
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer.
- **Shell quoting.** Write commit messages with `git commit -F -` and a heredoc; an apostrophe in an
  inline `-m` breaks the path.

## Anything deliberately left in a half state

Nothing is half-done in the tree; the working tree is clean and no gate is open. Ten routes the shell
already links are still waiting on their templates — the four table views, the glossary index and
term, the calculators, the groups index and About and Contact — which is the construction state the
build reports on every run.

Two older deferrals stand: the 418 glossary definitions belong to Phase 9, and `covalentRadius` and
`latticeParameters` are `null` because no acceptable source supplies them.
