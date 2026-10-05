# RUN_STATE.md — authoritative recovery checkpoint

> This file is the **first** thing a resuming agent reads and the **last** thing a finishing agent
> updates. It is a checkpoint, not a narrative. Keep it factual and current.
>
> **It is never sufficient on its own.** Always reconcile it with `git log`, `git status`, the
> working tree, and the tests before acting. See `WORKING_AGREEMENT.md` §7.

**Last updated:** 2026-10-05 (the session that built the elements index and the three attribute pages, and closed Phase 6)

---

## Current position

| Field | Value |
|---|---|
| **Phase** | Phase 6 — Elements index and attribute rankings — `COMPLETE` |
| **Work item** | Phase 6 closed on a browser pass over all four pages, harness captures against the reference, and 320 green tests. Phase 7 — the four alternate table views — is next |
| **Objective achieved** | `/elements/` with its 118 build-time cards and a live filter over name, symbol and atomic number; `/properties/melting-point/` and `/properties/boiling-point/` as one page about two fields, ranked with the repository's own comparison and drawn with bars; `/properties/orbital-configuration/` grouped by block, with the nineteen elements whose filling differs from the prediction derived rather than asserted |
| **Status** | `COMPLETE`. 320 tests pass, the build renders 123 routes plus the not-found page, and the four pages were captured, pixel-diffed and measured in one headless browser at 1280 / 768 / 375: the index 9.27% / 5.26% / 9.18% of the viewport and the melting-point ranking 5.3% / — / 8.38%, with the index's filter, grid, card and hero matching the reference's own measurements. What is left is the typeface, our shorter copy, and the seven recorded deviations |
| **Current commit** | `44e3493`, plus the close-out commit that follows (`e93c31f` is the card and the bar, `6cd3b14` the configuration lib) |
| **Next action** | Phase 7 — `/periodic-table/{properties-and-states,orbitals,electronegativity,evolution}`. Four pages that reuse the Phase 3 engine with a different colour mode, legend and explainer, so the work is mostly copy, one `pages/table-views.js` module and four templates. Audit the reference's four views live first, as Phase 6 audited its own pages |

## Files expected to change in the next work item

```
(Phase 7)  source/scripts/router/routes.js            four `styles` lists and a mode per route
source/pages/{properties-and-states,orbitals,electronegativity,evolution}.html
source/scripts/pages/table-views.js                   one module, four modes
source/styles/pages/{...}.css                         the view-specific copy layout
source/tests/pages/table-views.test.js
workspace/docs/research/01-reference-site-audit.md    §3.5 is a summary; the four views need measuring
workspace/docs/MIND_MAP.md                            in the same commit as each file
```

The engine, the tile, the legend and the four colour modes already exist and need no change:
`createPeriodicTable({ elements, categories, mode, hint })` takes the mode, `renderPeriodicTable`
returns markup for a build-time caller, and `periodic-table.css` already maps all four modes' keys
and bands. The electronegativity view's continuous scale is the one part that needs a decision —
`lib/colour-scale.js` has the banding and the legend swatches for it.

## Work item ledger

| Item | Status | Verification | Commit |
|---|---|---|---|
| 0.0–0.5 Foundation | `COMPLETE` | See the Phase 0 entry in `progress/PHASE_LOG.md` | `81bf871`..`a16d35e` |
| 1.0–1.8 Design system and shell | `COMPLETE` | See the Phase 1 entry; 51 tests at the time | `2ba459d`..`cc2151f` |
| 2.0–2.6 Data layer | `COMPLETE` | See the Phase 2 entry; the visual gate, run late, found and fixed two chrome differences | `d985245`..`97169ed` |
| 3.0–3.5 Table engine and its capture | `COMPLETE` | See the Phase 3 entry; every box measured against the reference | `bf1d8e3`..`2f06018`, `1db2fc7` |
| 4.0–4.6 Home page and the harness | `COMPLETE` | See the Phase 4 entry; table crop 2.28% at 1280px with no box differing in size | `7587a66`..`7837dce` |
| 5.0–5.6 Routing and the element pages | `COMPLETE` | See the Phase 5 entry; 278 tests, the router verified in a browser | `4763e89`..`2cd6460` |
| 6.0 The reference audit Phase 6 owed | `VERIFIED` | The index's card anatomy and grid and the three attribute pages' skeleton, measured live at six widths and appended to `docs/research/01` (§3.3 corrected, §3.9 new) | before `6cd3b14` |
| 6.1 The configuration lib | `COMPLETE` | `tests/lib/electron-configuration.test.js`: the order and its edge, the prediction, the shorthand expanded, and the nineteen exceptions derived | `6cd3b14` |
| 6.2 The card and the ranking row | `COMPLETE` | `tests/components/{element-card,bar-ranking}.test.js`: the card's five facts and its `data-` attributes, the scale's endpoints, clamping and floor | `e93c31f` |
| 6.3 The elements index | `COMPLETE` | `tests/pages/elements-index.test.js`; in a browser: 118 cards, `hyd` → 1, `79` → gold, `zzz` → none, `?q=iron` prefilled | `44e3493` |
| 6.4 The two rankings | `COMPLETE` | `tests/pages/ranking.test.js`: monotonic, unknowns last, helium→carbon and helium→rhenium; in a browser: 118 rows of 47px, the bar 2%→100% | `44e3493` |
| 6.5 The configurations page | `COMPLETE` | `tests/pages/orbital-configuration.test.js`: blocks 14/36/38/30, every element once, the 19 exceptions; in a browser: 137 rows | `44e3493` |
| 6.6 The route wiring | `COMPLETE` | The build renders 123 routes and reports 10 waiting; the index joins `PAGE_BEHAVIOUR` | `44e3493` |

Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Accepted decisions

All six ADRs stand; nothing is blocked on a decision. Four decisions from this phase are worth
carrying forward:

| Decision | Why |
|---|---|
| **A page of data is written at build time, and its behaviour improves it.** | The index's 118 cards are in the built document, so a cold load, a crawler and a curl see the whole page; the filter walks the cards already there. This is the element pages' rule — the page is a real document and the router is an improvement over it — applied to a page with a control of its own. |
| **A colour is a key, and the key-to-colour map is one stylesheet.** | The index card, the ranking chip and the configuration chip are painted from `--fill` / `--fill-deep`, which `periodic-table.css` sets from the element's own category. That is why all four new routes declare that sheet, and why the first browser pass — which showed grey tiles — was a missing declaration rather than a missing colour. |
| **A ranking takes its order from the data layer, not from the page.** | `elements-repository.compareByField` is exported so that a page handed a list of records sorts it by the same rule a query would: unknowns last in both directions, ties in atomic order. Two answers to "where does an unmeasured element go?" is one too many. |
| **Derive a claim rather than assert it.** | The configurations page says nineteen elements fill differently because the module compares every record's own configuration with the predicted order. A correction to the data would change the sentence instead of contradicting it. |
| ADR-001..006 | Unchanged; see `docs/ARCHITECTURE.md` and the previous sessions' notes in the phase log. |

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| The preview webview does not composite | The panel's own screenshot tool may still fail; it is not on the critical path | `workspace/tools/visual` captures, diffs and measures both pages in headless Chrome. Use the panel tool first because it is cheaper, and fall back to the harness the moment it reports no frames. |
| The preview window has no operating-system focus | `focus`, `blur` and real key events are never delivered, so tab-order and hover behaviour cannot be exercised as a person would | The harness's own Playwright pages are real browsers: use them for keyboard and focus checks. Type into a field with `page.fill` and count the cards the filter leaves, as Phase 6 did. |
| The shell links destinations whose pages are not built yet | A reader clicking through arrives at the not-found page | Accepted construction state; the build reports the count on every run. Now 10, and Phase 7 starts closing them. |
| A swap is easy to get subtly wrong | The router touches the document's title, description, body, focus and scroll | `tests/router/router.test.js` holds every one of them under fakes, and Phase 6 re-checked the two that only a real document shows: a card click arrives at the element page with one script and the right `data-page`, and Back restores the index with its filter reattached and working. |
| `covalentRadius` and `latticeParameters` are `null` for all 118 | Two rows of an element page read "Unknown" | Recorded in `docs/DATA_SOURCES.md`; filling them needs a third source and touches one adapter, no page. |
| The 418 glossary definitions are unwritten | The glossary phase is bigger than its page work | Deliberate and recorded; the schema and the arrangement are already built and tested. |

## Deliberately unfinished

**Nothing.** Phase 6 closed `COMPLETE` on captures taken with the harness, a browser pass over all
four pages, and 320 green tests, and the working tree is clean at the close-out commit. The
remaining differences from the reference are the seven recorded deviations in `progress/PHASE_LOG.md`,
not open work.

Deferred on purpose, as before:

1. **The 418 glossary definitions** — Phase 9, by recorded scope decision.
2. **Two schema fields** that no acceptable source supplies — see `docs/DATA_SOURCES.md`.

## How to resume in 60 seconds

```bash
git log --oneline -20             # what has actually been committed
git status --short                # anything half-done?
cat workspace/RUN_STATE.md        # this file
node --test source/tests          # is the last checkpoint real?  expect: 320 passing
node source/tools/build.js        # renders 123 routes and the not-found page into dist/
node source/tools/serve.js --port 4180   # the site; /styleguide/ carries the table's four modes
```

And when a page needs looking at:

```bash
cd workspace/tools/visual && npm install && \
  node compare.mjs --ours http://127.0.0.1:4180/elements/ \
    --reference https://www.breakingatom.com/elements --label elements-index --widths 1280,768,375
```

Then open `workspace/progress/PHASE_LOG.md` at Phase 6. Phase 7 next: the four alternate table views.
