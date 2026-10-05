# HANDOFF.md — note to the next agent

**Written:** 2026-10-05 · **By:** the session that built the periodic table engine · **After commit:**
`2f06018` plus the close-out commit

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

The site has a design language, a shell, a data layer — and now the table the whole project is
named after. The engine renders all 118 elements from the records, in four colour modes, with a
legend that is counted from the same data it paints.

- `source/scripts/lib/grid.js` — the 118 positions laid out, and hole-skipping steps between cells.
- `source/scripts/lib/colour-scale.js` — a number's band on a scale; the colour maths is there for
  callers that hold colours, and the table asks for the band alone.
- `source/scripts/lib/keyboard.js` — the six movement keys and where focus lands, asked of the grid.
- `source/scripts/components/element-tile.js`, `legend-chips.js`, `periodic-table.js` — the engine.
- `source/styles/components/element-tile.css`, `legend-chips.css`, `periodic-table.css` — and the
  table section of `tokens.css`.
- `source/tests/components/` — the engine against the real data, including every mode's fill held
  to the foreground `lib/contrast.js` chooses.
- 194 tests, all passing, still with nothing to install.
- `source/styleguide/index.html` renders the table with a switch for its four modes — that is where
  to look at it.

**Phase 3 is `VERIFIED`, not `COMPLETE`.** Five of its six exit criteria were verified in a real
browser. The sixth — the visual capture — could not be taken because the preview webview produced
no frames this session, and this project does not close a phase on a measurement alone. Every
number the retry needs is in the phase log.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **Try the capture before anything else.** Reload the preview, `preview_resize {fill: true}`,
   then capture the style guide's table section at 1280 / 768 / 375 with the reference open in a
   second tab and pinned to its light colour scheme. The phase log lists the exact metrics to
   re-read. If it composites, tick the criterion, close Phase 3, and rewrite the three workspace
   files. If it does not, leave the gate open again and move on — the phase log records why.
3. Then **Phase 4 — the home page**, which mounts this engine and adds the element search. Read its
   exit criteria in `progress/PHASE_LOG.md`. The engine needs no changes: `createPeriodicTable({
   elements: repository.all(), categories: categories.all(), mode: "group" })`, then `attach(root)`.
   The legend chips render as buttons and already isolate on hover, which is the home page's own
   criterion.

## What is fragile or easy to get wrong

- **The preview is unreliable in two different ways, and both can waste a session.** It may not
  composite, so no screenshot can be taken; and its window has no operating-system focus, so the
  browser never delivers `focus`, `blur` or real key events to the page. Real clicks work, and
  dispatching a `KeyboardEvent` or a `FocusEvent` exercises exactly the listeners the shipped code
  attaches — say which method you used rather than implying a person's hands did it.
- **`html { scroll-behavior: smooth }` means programmatic scrolling needs animation frames.** When
  the webview is not compositing, `scrollIntoView` appears to do nothing. Prove the destination
  with an instant scroll and read the resulting offsets.
- **A tile's colour is a key, never a value.** The components emit `data-key` or `data-band`;
  `periodic-table.css` maps both to tokens. Do not "helpfully" inline a hex: it breaks the one rule
  about literals and the test that holds every pairing to the contrast rule.
- **Keys are scoped by mode for a reason.** `unknown` is both a category and a state, and `s`–`f`
  are block keys; the stylesheet selects them under `.pt[data-mode="…"]` so one view cannot repaint
  another's meaning.
- **The numeric view bands into six plus a missing colour.** The domain is computed from our own
  data (0.7–3.98, 95 measured, 23 unknown), not written down, and the six stop colours live in
  `tokens.css` as `--scale-1..6`.
- **The f block is rows 9 and 10, columns 3–17; row 8 is the gap.** `position` in each record is the
  frozen answer; never recompute a cell. Down from rutherfordium is cerium, not thorium.
- **Isolation dims everything but the isolated key — except the focused tile.** That exemption is
  deliberate: a focus ring at 22 per cent opacity is not a focus ring.
- **No literal values.** Colours, sizes, radii and durations go in `tokens.css`; breakpoints are the
  one recorded exception.
- **`source/tests/brand/brand.test.js` will fail the suite** if the reference's name appears
  anywhere under `source/`, comments included.
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer.
- **Shell quoting.** Write commit messages with `git commit -F -` and a heredoc; an apostrophe in an
  inline `-m` breaks the path.

## Anything deliberately left in a half state

Nothing is half-done in the tree; the working tree is clean. One gate is open on purpose: Phase 3's
visual capture, recorded in the phase log with the measurement that stands in for it until a
compositing session can take the picture.

Two older deferrals stand: the 418 glossary definitions belong to Phase 9, and `covalentRadius` and
`latticeParameters` are `null` because no acceptable source supplies them.
