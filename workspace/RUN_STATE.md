# RUN_STATE.md — authoritative recovery checkpoint

> This file is the **first** thing a resuming agent reads and the **last** thing a finishing agent
> updates. It is a checkpoint, not a narrative. Keep it factual and current.
>
> **It is never sufficient on its own.** Always reconcile it with `git log`, `git status`, the
> working tree, and the tests before acting. See `WORKING_AGREEMENT.md` §7.

**Last updated:** 2026-10-05 (the session that built and routed the element pages, and closed Phase 5 on captures)

---

## Current position

| Field | Value |
|---|---|
| **Phase** | Phase 5 — Routing and element detail pages — `COMPLETE` |
| **Work item** | Phase 5 closed on captures, a browser pass over the router, and 278 green tests. Phase 6 — the elements index and the attribute rankings — is next |
| **Objective achieved** | All 118 element pages behind one template and one module, a router that swaps the document without dropping the page's name or its running script, and five components and sheets — strip, hero with a category-tinted wash, miniature table, property panel, FAQ, shell diagram, siblings, pager — measured against the reference |
| **Status** | `COMPLETE`. 278 tests pass, the build renders 119 routes plus the not-found page, and the element pages were captured, pixel-diffed and measured in one headless browser at 1280 / 768 / 375: hydrogen 3.57% / 9.60% / 10.54% and iron 3.53% / 11.25% / 11.05% of the viewport, with every box that can be measured matching. What is left is the typeface, the shorter copy, and eleven recorded deviations |
| **Current commit** | `2cd6460`, plus the close-out commit that follows (`4763e89` is the router and the family) |
| **Next action** | Phase 6 — `/elements/` with its 118 cards, and `/properties/{melting-point,boiling-point,orbital-configuration}`. The records already carry every field; `bar-ranking.js` and `element-card.js` are the two components the phase names. Run the harness on the reference's elements index before styling it, as Phase 5 did |

## Files expected to change in the next work item

```
(Phase 6)  source/scripts/router/routes.js                the index and ranking routes join the manifest
source/pages/elements-index.html              the index's own template
source/scripts/pages/elements-index.js        its module: the grid of cards and the live filter
source/scripts/components/element-card.js     (+ .css)  tile, name, group, weight, state
source/pages/ranking.html                     the shared template for the two rankings
source/scripts/pages/ranking.js               order, extremecase checks, the table
source/scripts/components/bar-ranking.js      (+ .css)  the magnitude bars
source/styles/pages/{elements-index,ranking}.css
source/tests/pages/*.test.js, source/tests/components/*.test.js
workspace/docs/MIND_MAP.md                    in the same commit as each file
```

The engine, the tile, the finder and the detail family need no changes. `elementTile`, the
repositories' `withCategory`/sorting helpers and `lib/format.js`'s unit-aware formatter are the
whole contract, and the records already carry `category`, `atomicWeight`, `state` and every ranked
field.

## Work item ledger

| Item | Status | Verification | Commit |
|---|---|---|---|
| 0.0–0.5 Foundation | `COMPLETE` | See the Phase 0 entry in `progress/PHASE_LOG.md` | `81bf871`..`a16d35e` |
| 1.0–1.8 Design system and shell | `COMPLETE` | See the Phase 1 entry; 51 tests at the time | `2ba459d`..`cc2151f` |
| 2.0–2.6 Data layer | `COMPLETE` | See the Phase 2 entry; the visual gate, run late, found and fixed two chrome differences | `d985245`..`97169ed` |
| 3.0–3.5 Table engine and its capture | `COMPLETE` | See the Phase 3 entry; every box measured against the reference | `bf1d8e3`..`2f06018`, `1db2fc7` |
| 4.0–4.6 Home page and the harness | `COMPLETE` | See the Phase 4 entry; table crop 2.28% at 1280px with no box differing in size | `7587a66`..`7837dce` |
| 5.0 The router | `COMPLETE` | Fourteen tests over `navigationFor` and the router under fakes, plus a browser pass: cold links, two in-app hops, Back and Forward, both wrap-arounds, scroll restore, an in-app 404 | `4763e89` |
| 5.1 The element family, one template and one module | `COMPLETE` | `tests/pages/element-detail.test.js` walks all 118 records: every block filled, none holding a placeholder | `4763e89` |
| 5.2 The property panel, the FAQ and the shell diagram | `COMPLETE` | Three component test files; the FAQ answer is the panel's own string, the diagram's dots are the element's electrons | `4763e89`, `2cd6460` |
| 5.3 One document, one script, one page name | `COMPLETE` | The build test holds the one script and `data-page`; the browser pass proves the arriving page boots after a swap | `4763e89` |
| 5.4 The family renderer | `COMPLETE` | `tests/tools/render-template.test.js`: order, strictness, the template/module key agreement, the 404 document unchanged | `4763e89`, `2cd6460` |
| 5.5 The captures | `COMPLETE` | Hydrogen and iron at 1280 / 768 / 375, and a home regression matching Phase 4's numbers exactly | `2cd6460` |
| 5.6 The detail tokens and the miniature table | `COMPLETE` | The hero's category wash, centred compact symbols, the siblings' centred tiles, the badge's corner, the facts panel's interior hairline | `2cd6460` |

Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Accepted decisions

All six ADRs stand; nothing is blocked on a decision. Three decisions from this phase are worth
carrying forward:

| Decision | Why |
|---|---|
| **One behaviour module per document, and the page's name travels on `<body>`.** | A module is evaluated once per URL, so re-inserting a script tag after a swap would do nothing. The build writes the template's name into the body, `app.js` turns that name into a call, and the router carries the name — and the running script — across a swap. The bug this replaces was silent: the arriving page simply never booted. |
| **The page's colour comes from the same key the table paints from.** | The element's category key is written on the strip's current item, the hero, the card, the lede and every value; `periodic-table.css` turns that key into `--fill` and `--fill-deep`. The hero's wash mixes it, so a category colour changed in one place changes the table, the card and the wash together. |
| **The router is an improvement laid over real documents.** | Every page is a real URL a cold load, a crawler or a curl sees in full. The router only takes over a click it can serve itself, and hands anything it cannot — an external link, a file, a fragment, a failed request — back to the browser. A URL the site does not publish answers 404 *with a document*, so the router shows the not-found page rather than guessing. |
| ADR-001..006 | Unchanged; see `docs/ARCHITECTURE.md` and the previous sessions' notes in the phase log. |

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| The preview webview does not composite | The panel's own screenshot tool may still fail; it is no longer on the critical path | `workspace/tools/visual` captures, diffs and measures both pages in headless Chrome. Use the panel tool first because it is cheaper, and fall back to the harness the moment it reports no frames — do not spend a second session on it. |
| The preview window has no operating-system focus | `focus`, `blur` and real key events are never delivered, so tab-order and hover behaviour cannot be exercised as a person would | Real clicks are delivered, and dispatching the event through the shipped listener exercises the same code path. Say which method was used. The harness's own Playwright pages are real browsers: use them for keyboard and focus checks, as Phase 5 did. |
| The shell links destinations whose pages are not built yet | A reader clicking through arrives at the not-found page | Accepted construction state; the build reports the count on every run. Still 14, and Phase 6 starts closing them. |
| A swap is easy to get subtly wrong | The router touches the document's title, description, body, focus and scroll | `tests/router/router.test.js` holds every one of them under fakes, and the browser pass in `PHASE_LOG.md` re-checks the four that only a real document can show: the arriving page's boot, the running script, the scroll restore and the in-app 404. |
| `covalentRadius` and `latticeParameters` are `null` for all 118 | Two rows of the element page read "Unknown" | Recorded in `docs/DATA_SOURCES.md`; filling them needs a third source and touches one adapter, no page. |
| The 418 glossary definitions are unwritten | The glossary phase is bigger than its page work | Deliberate and recorded; the schema and the arrangement are already built and tested. |

## Deliberately unfinished

**Nothing.** Phase 5 closed `COMPLETE` on captures taken with the harness, a browser pass over the
router, and 278 green tests, and the working tree is clean at the close-out commit. The remaining
differences from the reference are recorded decisions, not open work.

Deferred on purpose, as before:

1. **The 418 glossary definitions** — Phase 9, by recorded scope decision.
2. **Two schema fields** that no acceptable source supplies — see `docs/DATA_SOURCES.md`.

## How to resume in 60 seconds

```bash
git log --oneline -20             # what has actually been committed
git status --short                # anything half-done?
cat workspace/RUN_STATE.md        # this file
node --test source/tests          # is the last checkpoint real?  expect: 278 passing
node source/tools/build.js        # renders 119 routes and the not-found page into dist/
node source/tools/serve.js --port 4180   # the site; /styleguide/ carries the table's four modes
```

And when a page needs looking at:

```bash
cd workspace/tools/visual && npm install && \
  node compare.mjs --ours http://127.0.0.1:4180/elements/hydrogen/ \
    --reference https://www.breakingatom.com/elements/hydrogen --label element --widths 1280,768,375
```

Then open `workspace/progress/PHASE_LOG.md` at Phase 5. Phase 6 next: the elements index and the
attribute rankings.
