# HANDOFF.md — note to the next agent

**Written:** 2026-10-01 · **By:** data layer session · **After commit:** `26229e2` plus the close-out commit

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

The site has a design language, a shell, and the whole data layer behind them. `node
source/tools/serve.js`, then look at it.

- `source/data/elements.json` — 118 element records, ~40 fields each, generated and committed.
- `source/data/element-notes.json` — the authored half: what each element is, what it is used for,
  where it comes from, how it is said, where the name came from. 118 entries, five fields each.
- `source/data/categories.json`, `overrides.json`, `units.json` — the taxonomy, the nine recorded
  corrections to the dataset's own, and which unit each field prints in.
- `source/tools/build-data.js` — fetches both sources, merges the writing, derives the layout,
  verifies everything, and only then writes. `--dry-run` reports without writing.
- `source/tools/data-sources/` — one adapter per source, plus the two derivation modules.
- `source/scripts/data/` — the only readers of that JSON: elements, categories, units, glossary.
- `source/scripts/lib/slug.js`, `format.js` — names to URLs, and values to readings.
- 126 tests, all passing, still with nothing to install.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **Retry the visual gate.** The preview webview would not composite, so no screenshot was taken
   and Phase 2 is still `IN_PROGRESS` because of it. Try filling the preview, reloading, and a
   fresh tab. If it still fails, record that again — do not close the phase on a missing capture.
3. Then start **Phase 3 — the periodic table engine**. It needs no new data: `position` is already
   computed for every element, and `docs/DATA_SOURCES.md` §5 defines what the records hold.

## What is fragile or easy to get wrong

- **A missing value is `null` and it is not zero.** The dataset signals "unmeasured" with an empty
  string; passing that through `Number` gives zero, which is a measurement. Everything that reads
  a value has to keep that distinction, and the formatter turns it into the word `Unknown`.
- **Never compute shell populations from the Madelung filling order.** It gets chromium, copper and
  palladium wrong. They come from the dataset's own configuration, and `build-data.js` refuses a
  configuration that does not account for every electron. That check is what makes the difference
  visible rather than silent.
- **An unknown unit becomes `null`, never a guess.** A wrong number on a page cannot be noticed.
- **Rerunning `build-data.js` overwrites `elements.json` but never `element-notes.json`.** That
  separation is the whole reason the writing is in its own file; do not put prose back into the
  generated one.
- **Ask the layout module, do not recompute a grid cell.** `tools/data-sources/layout.js` is the
  single answer to where an element sits, and `position` in each record is that answer, frozen.
- **The route manifest is the single source of truth for URLs.** Adding a page means adding an
  entry, not a link. Fourteen routes are still waiting on templates.
- **`source/tests/brand/brand.test.js` will fail the suite** if the reference's name appears
  anywhere under `source/`, including in a comment or a data record. It is the phase log's scan,
  made unskippable.
- **No literal values.** A colour, size, radius or duration goes in `tokens.css`. The breakpoints
  are the one exception and are recorded there.
- **Headings are regular weight**, 54.88px at weight 400 with -0.02em of tracking. Bold is a
  regression.
- **Capture needs one step.** Resize the preview so it fills the panel before screenshotting. It
  did not work this session; that is recorded, not worked around.
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer.
- **Shell quoting.** Write commit messages to a file and use `git commit -F -`; an apostrophe in a
  heredoc breaks the path.

## Anything deliberately left in a half state

Nothing is half-done. Three things are deferred on purpose and all three are recorded in the phase
log: the 418 glossary definitions belong to the glossary phase and its schema, repository and tests
are already built; `covalentRadius` and `latticeParameters` are `null` because no acceptable source
supplies them; and `ionicRadius` was removed from the schema with its argument written down. The
visual gate is not deferred — it is blocked, and it is the first thing to try again.
