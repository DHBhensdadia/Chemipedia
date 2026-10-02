# HANDOFF.md — note to the next agent

**Written:** 2026-10-02 · **By:** the session that closed the data layer · **After commit:** `30f203b`
plus the close-out commit

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

The site has a design language, a shell, and the whole data layer behind them. The data layer has
now been **seen** in a browser and compared against the reference, which is what the previous
session could not do. `node source/tools/serve.js`, then look at it.

- `source/data/elements.json` — 118 element records, one field set each, generated and committed.
- `source/data/element-notes.json` — the authored half: what each element is, what it is used for,
  where it comes from, how it is said, where the name came from. 118 entries, five fields each.
- `source/data/categories.json`, `overrides.json`, `units.json` — the taxonomy, the nine recorded
  corrections to the dataset's own, and which unit each field prints in.
- `source/tools/build-data.js` — fetches both sources, merges the writing, derives the layout,
  verifies everything, and only then writes. `--dry-run` reports without writing.
- `source/scripts/data/` — the only readers of that JSON: elements, categories, units, glossary.
- `source/scripts/lib/slug.js`, `format.js` — names to URLs, and values to readings.
- 126 tests, all passing, still with nothing to install.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. Open **Phase 3 — the periodic table engine** in `progress/PHASE_LOG.md` and build to its exit
   criteria. It needs no new data: `position` is computed for every element already, and
   `docs/DATA_SOURCES.md` §5 defines what a record holds.
3. **The reference's table page is the specification, and it is worth ten minutes with the
   inspector before writing a line.** It is a live ASTRO site in light theme: each tile is
   `<a class="cell">` with `data-key` for the category, an inline `style` carrying
   `grid-column`, `grid-row`, `--fill` and `--on-fill`, and three children
   (`.cell__z`, `.cell__sym`, `.cell__name`). Measured at 1280px: a 65.367px square, 3px radius,
   `--step-0` type, 4px by 2.4px of padding, no border. The lanthanides occupy row 9 columns 3–17
   and the actinides row 10, and the superheavies carry `data-key="unknown"`.

## What is fragile or easy to get wrong

- **The reference is theme-adaptive.** Its screenshot can come back light while `getComputedStyle`
  resolves the dark palette, so the pixels and the numbers disagree until you pin the tab to the
  light colour scheme. Do that before any side-by-side comparison. Our own site is light only
  (ADR-006), so a dark capture is always the wrong side of the comparison.
- **The preview must be filled before capturing.** `preview_resize {fill: true}` first, then set the
  width. It failed for a whole session once and worked on the first attempt the next; if a capture
  does fail, say so rather than treating a missing screenshot as a passed check.
- **A missing value is `null` and it is not zero.** The dataset signals "unmeasured" with an empty
  string; passing that through `Number` gives zero, which is a measurement. Everything that reads
  a value has to keep that distinction, and the formatter turns it into the word `Unknown`.
- **Never compute shell populations from the Madelung filling order.** It gets chromium, copper and
  palladium wrong. They come from the dataset's own configuration, and `build-data.js` refuses a
  configuration that does not account for every electron.
- **An unknown unit becomes `null`, never a guess.** A wrong number on a page cannot be noticed.
- **Rerunning `build-data.js` overwrites `elements.json` but never `element-notes.json`.**
- **Ask the layout module, do not recompute a grid cell.** `tools/data-sources/layout.js` is the
  single answer to where an element sits, and `position` in each record is that answer, frozen.
- **The route manifest is the single source of truth for URLs.** Adding a page means adding an
  entry, not a link. Fourteen routes are still waiting on templates.
- **`source/tests/brand/brand.test.js` will fail the suite** if the reference's name appears
  anywhere under `source/`, including in a comment or a data record.
- **No literal values.** A colour, size, radius or duration goes in `tokens.css`. The breakpoints
  are the one exception and are recorded there.
- **Headings are regular weight**, 54.88px at weight 400 with -0.02em of tracking. Bold is a
  regression. At 375px the same heading is 39.955px, which is where the reference's own heading
  sits, so the fluid scale is confirmed at both ends rather than assumed.
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer.
- **Shell quoting.** Write commit messages with `git commit -F -` and a heredoc; an apostrophe in an
  inline `-m` breaks the path.

## Anything deliberately left in a half state

Nothing is half-done. Two things are deferred on purpose and both are recorded in the phase log:
the 418 glossary definitions belong to the glossary phase, whose schema, repository and tests are
already built; and `covalentRadius` and `latticeParameters` are `null` because no acceptable source
supplies them, while `ionicRadius` was removed from the schema with its argument written down.

One difference from the reference is deliberate and measured rather than accidental: at 768px the
reference wraps its search field onto a second masthead row and ours stays on one, because our
navigation carries four items where the reference's carries six now that the learning and games
sections are out of scope (ADR-002).
