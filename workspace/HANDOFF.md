# HANDOFF.md — note to the next agent

**Written:** 2026-10-05 · **By:** the session that built the home page and then made it verifiable ·
**After commit:** `7837dce` plus the close-out commit

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

A design language, a shell, a data layer, the table engine — and now the page that shows it off.
The home page mounts the engine from the repositories, draws two explainer schematics from the same
grid model, offers three ways deeper into the site, and ends with a finder that works without
JavaScript and improves with it.

- `source/pages/home.html`, `source/scripts/pages/home.js`, `source/styles/pages/home.css` — the page.
- `source/scripts/components/element-search.js` + its stylesheet — the finder.
- `source/scripts/router/routes.js` now carries the **component stylesheets each route uses**, and
  `source/tools/build.js` links them. This was a real defect: the first real page arrived with the
  table unstyled, because the build had only ever linked the global layer, the shell and the page's
  own sheet. The style guide had hidden it by linking the three component sheets by hand.
- The table gained an optional `hint` line, printed between its legend and its grid.
- 221 tests, all passing, still with nothing to install.
- The built home page is at `/` when the dev server runs; `/styleguide/` still carries the table in
  all four modes.

**Phase 3 and Phase 4 are both `COMPLETE`.** The panel's screenshot tool never composited — five
attempts across two sessions — so the author had the tooling fixed instead of the gap recorded:
`workspace/tools/visual` drives the system Chrome headlessly, captures both pages at the same width
and colour scheme, diffs them pixel by pixel and compares every measurement. On the home page no
box differs in size from the reference's at 1280 / 768 / 375 / 560px; the table's crop is 2.28%
different at 1280px, and what is left is the typeface and the copy, both recorded decisions.

**Use it before you style anything.** Its first run found four differences that four phases of
measured comparison had not: the legend and the hint sitting 64px left of the page's text column,
a heading a pixel short, a measure 3px narrow, a finder breaking onto two rows on a phone. Measure
the reference's boxes first, then write the CSS.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **Phase 5 — routing and element detail pages**: 118 URLs, one template, one module, plus
   `property-list.js`, `shell-diagram.js` and `faq-block.js`. Read its exit criteria in
   `progress/PHASE_LOG.md`. The data is already there: every record carries `position`, `shells`,
   `valence`, the discovery block and the prose, so the family is data rather than markup.
3. **Run the harness on one element page before writing the CSS for it.**
   `cd workspace/tools/visual && node compare.mjs --ours http://127.0.0.1:4180/ --reference <an
   element page> --label element --widths 1280,768,375`. Every box it reports is a box the detail
   page must match; every difference it reports is one to fix or record before the phase closes.

## What is fragile or easy to get wrong

- **The preview is unreliable in two different ways, and both can waste a session.** It may not
  composite, so no screenshot can be taken; and its window has no operating-system focus, so
  `focus`, `blur` and real key events are never delivered. Real clicks *are* delivered, and
  dispatching an event exercises exactly the listener the shipped code attaches — say which method
  you used rather than implying a person's hands did it. When it cannot composite, go straight to
  `workspace/tools/visual`; do not retry the panel tool a third time.
- **The harness compares *boxes*, not tastes.** A crop that matches in size with a few per cent of
differing pixels is a typeface or copy difference — read `fontFamily` and the two pages' text in
`report.json` before changing any CSS. The reference sets a commercial typeface and `BRAND_GUIDELINES`
§2 forbids us shipping one, so glyph widths will never be equal; every box, gap and colour can be.
- **A page's component stylesheets must be declared on its route.** Adding a component to a page and
  forgetting its `styles` entry produces a page that looks broken in the browser and passes every
  test except the one that checks declared paths exist. Check it first when styling goes missing.
- **`html { scroll-behavior: smooth }` means programmatic scrolling needs animation frames.** When
  the webview is not compositing, `scrollIntoView` appears to do nothing. Prove the destination with
  an instant scroll and read the resulting offsets.
- **A tile's colour is a key, never a value.** The components emit `data-key` or `data-band`;
  `periodic-table.css` maps both to tokens. Do not inline a hex: it breaks the one rule about
  literals and the test that holds every pairing to `lib/contrast.js`.
- **The finder is a form before it is a script.** Keep the submit path working with JavaScript off;
  the module is an improvement on it, not a replacement. Its ranking is exported and tested against
  the real 118 — change the ranking and the test will tell you which element moved.
- **The f block is rows 9 and 10, columns 3–17; row 8 is the gap.** `position` in each record is the
  frozen answer; never recompute a cell. Down from rutherfordium is cerium, not thorium.
- **No literal values.** Colours, sizes, radii and durations go in `tokens.css`; breakpoints are the
  one recorded exception. A measurement taken from the reference belongs in the token layer with a
  comment saying which page it came from.
- **`source/tests/brand/brand.test.js` will fail the suite** if the reference's name appears
  anywhere under `source/`, comments included.
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer.
- **Shell quoting.** Write commit messages with `git commit -F -` and a heredoc; an apostrophe in an
  inline `-m` breaks the path.

## Anything deliberately left in a half state

Nothing is half-done in the tree; the working tree is clean, and no gate is open for the first time
in this project's history — Phases 3 and 4 both closed on captures taken by the harness.

Two older deferrals stand: the 418 glossary definitions belong to Phase 9, and `covalentRadius` and
`latticeParameters` are `null` because no acceptable source supplies them.
