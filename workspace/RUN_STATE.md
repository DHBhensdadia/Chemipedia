# RUN_STATE.md — authoritative recovery checkpoint

> This file is the **first** thing a resuming agent reads and the **last** thing a finishing agent
> updates. It is a checkpoint, not a narrative. Keep it factual and current.
>
> **It is never sufficient on its own.** Always reconcile it with `git log`, `git status`, the
> working tree, and the tests before acting. See `WORKING_AGREEMENT.md` §7.

**Last updated:** 2026-10-05 (the session that built the periodic table engine)

---

## Current position

| Field | Value |
|---|---|
| **Phase** | Phase 3 — Periodic table engine — `VERIFIED`, one criterion open |
| **Work item** | Phase 3's visual capture. The preview would not composite, so the capture could not be taken; everything else is verified in a browser. |
| **Objective achieved** | One reusable, accessible, data-driven table engine: 118 tiles in their cells, four colour modes with counted legends, isolation by pointer and by keyboard, arrow-key navigation with a roving tab stop, and a narrow-screen scroll treatment — 68 new tests, and every colour pairing held to the contrast rule. |
| **Status** | `VERIFIED`. 194 tests pass; five of six exit criteria verified in the browser; the sixth — tile geometry and colour mapping *captured* against the reference — is measured and matching but not captured, so the phase is not `COMPLETE`. |
| **Current commit** | `2f06018`, plus the close-out commit that follows it |
| **Next action** | Try the capture first, before anything else: reload the preview, `preview_resize {fill: true}`, and capture the style guide's table section at 1280 / 768 / 375 against the reference tab. If the webview composites, the measurements in the phase log give the checklist; tick the criterion and close the phase. If it does not, leave the gate open again and start Phase 4 — the home page — which uses this engine and must not wait on a screenshot. |

## Files expected to change in the next work item

```
(finishing Phase 3)  workspace/progress/PHASE_LOG.md, workspace/RUN_STATE.md, workspace/HANDOFF.md
                     PHASE_LOG.md — tick the visual criterion with the captures
(Phase 4)            source/pages/home.html                 the home page's authored markup
source/scripts/pages/home.js                                the page family: sections and the table
source/styles/pages/home.css                                its one stylesheet
source/tests/pages/*.test.js                                home-page tests as they are written
```

The table engine needs no changes for the home page: `createPeriodicTable({ elements, categories,
mode })` renders it and `attach(root)` installs isolation and navigation. The home page passes the
repositories' `all()` and nothing else.

## Work item ledger

| Item | Status | Verification | Commit |
|---|---|---|---|
| 0.0–0.5 Foundation | `COMPLETE` | See the Phase 0 entry in `progress/PHASE_LOG.md` | `81bf871`..`a16d35e` |
| 1.0–1.8 Design system and shell | `COMPLETE` | See the Phase 1 entry; 51 tests at the time | `2ba459d`..`cc2151f` |
| 2.0–2.6 Data layer | `COMPLETE` | See the Phase 2 entry; the visual gate, run late, found and fixed two chrome differences | `d985245`..`97169ed` |
| 3.0 The grid, the scale and the keyboard rules | `COMPLETE` | `lib/grid.js`, `lib/colour-scale.js`, `lib/keyboard.js`, and 35 logic tests against the real dataset | `bf1d8e3` |
| 3.1 The tile, the legend and the table | `COMPLETE` | Three components, three stylesheets, the table's token section, 33 component tests | `2f06018` |
| 3.2 Four colour modes with counted legends | `COMPLETE` | Read from computed styles in the browser: group, block, state, electronegativity; counts exact against `categories.json` | `2f06018` |
| 3.3 Isolation and keyboard navigation | `COMPLETE` | Verified through the shipped attachment: click and focus isolate, press pins, arrows cross the table's holes, one roving tab stop, focused tile undimmed | `2f06018` |
| 3.4 Narrow-screen scrolling | `COMPLETE` | Measured at 375px and 768px: first and last columns land inside the opaque part of the edge fade, at rest and after a keyboard move | `2f06018` |
| 3.5 Tile geometry against the reference | `VERIFIED` | Two tables measured in one session with the reference in a second tab; every metric identical. **Not captured** — the preview produced no frames. | `2f06018` |

Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Accepted decisions

All six ADRs stand; nothing is blocked on a decision. What the last three sessions exercised:

| ADR | Outcome | Where it shows up |
|---|---|---|
| ADR-001 | The build pipeline is a committed transform plus a committed artefact: rerunnable, and readable without a network. | `source/tools/build-data.js`, `source/data/elements.json` |
| ADR-002 | The learning and games sections are out of scope, and the visual gate is where that shows: our navigation is four items where the reference's is six, so ours stays on one masthead row at 768px. | `scripts/router/navigation.js`, the deviations table in `progress/PHASE_LOG.md` |
| ADR-003 | Plain imperative commit prose; why a change exists is in the commit that makes it. | every commit |
| ADR-004 | Zero dependencies. The table engine is plain modules and strings; the tests use a stand-in for `fetch` and never touch the network. | all of `source/` |
| ADR-005 | Two sources, both public domain or CC0. A unit that cannot be converted becomes `null` rather than a guess. | `docs/DATA_SOURCES.md`, `tools/data-sources/` |
| ADR-006 | Single light theme, so a table capture must be taken with the reference pinned to light or the comparison is against its dark palette. | `source/styles/tokens.css`, the pinning recipe in `docs/TESTING_STRATEGY.md` |

One design decision of this phase is worth carrying forward: **a tile's colour is a key, not a
value**. The components emit `data-key` / `data-band`, and `periodic-table.css` maps them to tokens,
so no JavaScript holds a hex colour and a test can hold every pairing to `lib/contrast.js`.

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| The preview webview may not composite for a whole session | The visual gate cannot be captured, and a phase cannot close on a measurement alone | Retry first thing in the next session. This has now happened twice (Phase 2 and Phase 3), which suggests it is environmental rather than caused by the page. `preview_resize {fill: true}` is part of the recipe; when it does not work, say so rather than treating a missing screenshot as a pass. |
| The preview window has no operating-system focus | `focus`, `blur` and real key events are not delivered to the page at all, so hover-and-tab behaviour cannot be exercised the way a person would | Use real clicks (they work), and dispatch the focus and key events through the shipped listeners. Every handler reads only `event.key` or fires on the element it is bound to, so the code path is the same one a person's keypress takes. |
| `html { scroll-behavior: smooth }` | Programmatic focus scrolling does not progress without animation frames, so a screenshot-less session cannot watch focus travel | The destination is proven with an instant scroll and by reading the resulting scroll offsets; the smooth animation is the browser's own. |
| The reference is theme-adaptive | A capture can come back in its dark palette and read as a colour catastrophe that is not there | Pin the reference tab to light before capturing, and read computed styles as well as pixels. |
| `covalentRadius` and `latticeParameters` are `null` for all 118 | Two rows of the element page will read "Unknown" | Recorded in `docs/DATA_SOURCES.md`; filling them needs a third source and touches one adapter, no page. |
| The 418 glossary definitions are unwritten | The glossary phase is bigger than its page work | Deliberate and recorded; the schema and the arrangement are already built and tested. |
| The shell links destinations whose pages are not built yet | A reader clicking through arrives at the not-found page | Accepted construction state; the build reports the count on every run. Still 14. |

## Deliberately unfinished

**One thing, and it is Phase 3's visual capture.** Five of its exit criteria are verified in a real
browser; the sixth is measured but uncaptured, and the phase log says exactly which numbers the
retry should re-measure. Nothing is half-done in the tree: the working tree is clean at the
close-out commit.

Deferred on purpose, as before:

1. **The 418 glossary definitions** — Phase 9, by recorded scope decision.
2. **Two schema fields** that no acceptable source supplies — see `docs/DATA_SOURCES.md`.

## How to resume in 60 seconds

```bash
git log --oneline -20             # what has actually been committed
git status --short                # anything half-done?
cat workspace/RUN_STATE.md        # this file
node --test source/tests          # is the last checkpoint real?  expect: 194 passing
node source/tools/build.js        # renders the ready routes into dist/
node source/tools/serve.js        # the site; /styleguide/ carries the table in all four modes
```

Then open `workspace/progress/PHASE_LOG.md` at Phase 3. The capture first, then Phase 4.
