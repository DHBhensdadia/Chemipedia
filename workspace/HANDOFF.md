# HANDOFF.md — note to the next agent

**Written:** 2026-10-05 · **By:** the session that built the home page · **After commit:** `74c168d`
plus the close-out commit

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

**Phase 3 and Phase 4 are both `VERIFIED`, not `COMPLETE`.** In each, every criterion was verified
by measurement in a browser; what is missing is the screenshot. The preview webview produced no
frames for any capture in two consecutive sessions — five attempts, one of them in a freshly opened
tab and others with `preview_resize {fill: true}` — so neither phase closes on a measurement alone.
Every number a retry needs is written into the phase log.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **Try the capture once.** Reload the preview, `preview_resize {fill: true}`, then capture the
   built home page at 1280 / 768 / 375 with the reference open in a second tab and pinned to its
   light colour scheme. The phase log lists the exact metrics to re-read. If it composites, capture
   the style guide's table too, tick both phases' open criteria, and close them. If it does not,
   leave both gates open and move on — three sessions on one screenshot is not a good use of one.
3. Then **Phase 5 — routing and element detail pages**: 118 URLs, one template, one module, plus
   `property-list.js`, `shell-diagram.js` and `faq-block.js`. Read its exit criteria in
   `progress/PHASE_LOG.md`. The data is already there: every record carries `position`, `shells`,
   `valence`, the discovery block and the prose, so the family is data rather than markup.

## What is fragile or easy to get wrong

- **The preview is unreliable in two different ways, and both can waste a session.** It may not
  composite, so no screenshot can be taken; and its window has no operating-system focus, so
  `focus`, `blur` and real key events are never delivered. Real clicks *are* delivered, and
  dispatching an event exercises exactly the listener the shipped code attaches — say which method
  you used rather than implying a person's hands did it.
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

Nothing is half-done in the tree; the working tree is clean. One gate is open on purpose and now
covers two phases: the visual capture, recorded in the phase log with the measurements that stand in
for it until a compositing session can take the pictures.

Two older deferrals stand: the 418 glossary definitions belong to Phase 9, and `covalentRadius` and
`latticeParameters` are `null` because no acceptable source supplies them.
