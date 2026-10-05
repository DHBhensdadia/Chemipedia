# HANDOFF.md — note to the next agent

**Written:** 2026-10-05 · **By:** the session that built the element pages and routed them ·
**After commit:** `2cd6460` plus the close-out commit

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

The site has a front door and now it has somewhere to go. All 118 element pages are built from one
template and one module, and a reader can move between them without a reload.

- `source/pages/element-detail.html` + `source/scripts/pages/element-detail.js` — the family: strip,
  hero and miniature table, headline, lede, FAQ, prose, counts, properties, orbital figure, siblings,
  pager. It runs at build time; nothing in it touches the DOM.
- `source/scripts/components/property-list.js`, `faq-block.js`, `shell-diagram.js` — the three new
  components, each with a stylesheet. The FAQ's answers are the panel's own strings, and the diagram
  and the panel read the same `shells`.
- `source/scripts/router/router.js` + `source/scripts/app.js` — the router and the one behaviour
  module every document links. A click fetches the built document, swaps the body, carries the
  arriving page's name and the running script, focuses the main landmark, and restores the reader's
  scroll place on a history move.
- `source/tools/render-template.js` + `source/tools/build-context.js` — the family renderer and the
  build's data, so a template cannot render with a placeholder left over.
- The element page's hero is tinted by the element's own category colour, mixed from `--fill` — the
  same key the table paints its tiles from.
- 278 tests, all passing, still with nothing to install.
- The built pages are at `/elements/<slug>/` when the dev server runs.

**Phase 5 is `COMPLETE`.** Captured, pixel-diffed and measured against the reference in one headless
browser at three widths: hydrogen 3.57% / 9.60% / 10.54% and iron 3.53% / 11.25% / 11.05% of the
viewport, every box that can be measured matching; what is left is the typeface, the copy and eleven
recorded deviations. A browser pass over the router checked the four things only a real document
shows: cold deep links, two in-app hops with Back and Forward, both wrap-arounds, the scroll restore,
and an in-app 404.

**Use the harness before you style anything.** Its first run on an element page found four real
differences the numbers had missed (tiles not centred, a badge unpositioned, a symbol resting on its
cell's top edge, a facts hairline of the wrong colour), and the iron capture found the biggest one
of the phase: a fixed blue hero wash where the reference tints each page by its category.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **Phase 6 — the elements index and the attribute rankings**: `/elements/`, and the three
   `/properties/...` pages. Read the exit criteria in `progress/PHASE_LOG.md`. The data is already
   there; `element-card.js` and `bar-ranking.js` are the components the phase names.
3. **Run the harness on the reference's elements index before writing its CSS**, exactly as Phase 5
   did for the element page.

## What is fragile or easy to get wrong

- **The router's swap has four rules that are easy to break.** Incoming scripts are refused, the
  running ones are carried across, the arriving body's `data-page` must be copied onto the live body
  before `startPage` is called, and a failure must be handed back to the browser rather than
  half-swapped. `tests/router/router.test.js` holds all four; the bug it was written for was silent,
  so do not simplify that test away.
- **A page's behaviour is a name, not a script.** A page earns an entry in `app.js`'s
  `PAGE_BEHAVIOUR` or it runs nothing after a swap. The element pages deliberately have none.
- **The preview is unreliable in two different ways, and both can waste a session.** It may not
  composite, so no screenshot can be taken; and its window has no operating-system focus, so
  `focus`, `blur` and real key events are never delivered. Use the Playwright pages in
  `workspace/tools/visual` for keyboard and focus checks. Do not retry the panel tool a third time.
- **The harness compares *boxes*, not tastes.** A crop that matches in size with a few per cent of
  differing pixels is a typeface or copy difference — read `fontFamily` and the two pages' text in
  `report.json` before changing any CSS.
- **A page's component stylesheets must be declared on its route**, or the page renders the component
  unstyled and every test but one passes.
- **A tile's colour is a key, never a value.** The components emit `data-key` or `data-band`;
  `periodic-table.css` maps both to tokens, and the element page's hero, card, lede, strip marker and
  every value rely on that map. Do not inline a hex.
- **No literal values.** Colours, sizes, radii and durations go in `tokens.css`; breakpoints are the
  one recorded exception. `color-mix()` percentages count as colour values — they live in the token
  layer too, with a comment saying where the measurement came from.
- **`source/tests/brand/brand.test.js` will fail the suite** if the reference's name appears
  anywhere under `source/`, comments included.
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer.
- **Shell quoting.** Write commit messages with `git commit -F -` and a heredoc; an apostrophe in an
  inline `-m` breaks the path.

## Anything deliberately left in a half state

Nothing is half-done in the tree; the working tree is clean and no gate is open. Fourteen routes the
shell already links are still waiting on their templates — the elements index, the three ranking
pages, the four table views, the glossary, the calculators, the groups index and About and Contact —
which is the construction state the build reports on every run.

Two older deferrals stand: the 418 glossary definitions belong to Phase 9, and `covalentRadius` and
`latticeParameters` are `null` because no acceptable source supplies them.
