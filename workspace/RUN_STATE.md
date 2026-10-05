# RUN_STATE.md — authoritative recovery checkpoint

> This file is the **first** thing a resuming agent reads and the **last** thing a finishing agent
> updates. It is a checkpoint, not a narrative. Keep it factual and current.
>
> **It is never sufficient on its own.** Always reconcile it with `git log`, `git status`, the
> working tree, and the tests before acting. See `WORKING_AGREEMENT.md` §7.

**Last updated:** 2026-10-06 (the session that built the eleven element group pages and closed Phase 8)

---

## Current position

| Field | Value |
|---|---|
| **Phase** | Phase 8 — Element group pages — `COMPLETE` |
| **Work item** | Phase 8 closed on a live reference audit, eleven generated pages plus an index, a browser pass over four pages at three widths, harness captures against the reference, and 383 green tests. Phase 9 — the glossary — is next |
| **Objective achieved** | `/element-groups/:slug` for the eleven categories and `/element-groups/` over them. Each group page is a hero in the group's own colour, the table arriving already isolated to it, the members as cards, our two paragraphs on what the group has in common, and the other ten as pills. Every figure is derived from the members; the written copy is deliberately free of counts. The reference publishes **no group index at all** |
| **Status** | `COMPLETE`. 383 tests pass, the build renders 139 routes plus the not-found page, and the pages were captured, pixel-diffed and measured in one headless browser at 1280 / 768 / 375. The table region is within **0.53% / 1.98% / 0.73%** of the reference's own and identical in size at all three widths; the page is 9.75% / 14.36% / 12.72%. The reference's eleven counts match ours member for member. What is left is the typeface, our taller band and the nine recorded deviations |
| **Current commit** | `54832b4`, plus the close-out commit that follows (`a49dd6d` is the audit, `3b5cd60` the table's resting isolation). Phase 8 range: `a49dd6d`..`54832b4` |
| **Next action** | Phase 9 — the glossary: `/glossary/` with an A–Z jump index and live filtering, and `/glossary/:slug` per term, over the 418 terms. The schema, the repository and their tests already exist from Phase 2; the definitions are unwritten. **Audit the reference's glossary pages live before writing their CSS**, as Phases 6, 7 and 8 each audited their own families: `docs/research/01-reference-site-audit.md` §3.7 is a sketch, not measurements |

## Files expected to change in the next work item

```
(Phase 9)  source/data/glossary.json                    the 418 definitions, currently a schema with no content
source/scripts/pages/glossary.js                        the index: hero, A-Z jump index, filter
source/scripts/pages/glossary-term.js                   a single term, with its cross-links
source/pages/glossary-index.html                        one template for the index
source/pages/glossary-term.html                         one template behind the 418 terms
source/styles/pages/glossary.css
source/scripts/router/routes.js                         glossaryRoutes(terms) beside groupRoutes
source/tools/build.js                                   two FAMILY_RENDERERS entries
source/tests/pages/glossary.test.js
workspace/docs/research/01-reference-site-audit.md      §3.7 audited live first
workspace/docs/MIND_MAP.md                              in the same commit as each file
```

The pieces already exist and need little or no change: `glossary-repository.js` holds the reading
order, the letters that actually have terms under them, lookup by slug and a search that matches the
definition as well as the term; `filter-bar.js` is sketched for the index's search input plus letter
jump index; `/glossary/` is a declared route waiting on its template. The one decision to make first
is the shape of the 418 records — `docs/DATA_SOURCES.md` §3 scopes the definitions to this phase and
the record schema is already fixed by the repository and its tests.

## Work item ledger

| Item | Status | Verification | Commit |
|---|---|---|---|
| 0.0–0.5 Foundation | `COMPLETE` | See the Phase 0 entry in `progress/PHASE_LOG.md` | `81bf871`..`a16d35e` |
| 1.0–1.8 Design system and shell | `COMPLETE` | See the Phase 1 entry; 51 tests at the time | `2ba459d`..`cc2151f` |
| 2.0–2.6 Data layer | `COMPLETE` | See the Phase 2 entry; the visual gate, run late, found and fixed two chrome differences | `d985245`..`97169ed` |
| 3.0–3.5 Table engine and its capture | `COMPLETE` | See the Phase 3 entry; every box measured against the reference | `bf1d8e3`..`2f06018`, `1db2fc7` |
| 4.0–4.6 Home page and the harness | `COMPLETE` | See the Phase 4 entry; table crop 2.28% at 1280px with no box differing in size | `7587a66`..`7837dce` |
| 5.0–5.6 Routing and the element pages | `COMPLETE` | See the Phase 5 entry; 278 tests, the router verified in a browser | `4763e89`..`2cd6460` |
| 6.0–6.6 Elements index and attribute rankings | `COMPLETE` | See the Phase 6 entry; the index's card grid and the ranking pages' skeletons measured live | `6cd3b14`..`44e3493` |
| 7.0–7.6 The four alternate table views | `COMPLETE` | See the Phase 7 entry; 369 tests, four pages captured and pixel-diffed | `a0b0df8`..`d1a4ad4` |
| 8.0 The reference audit Phase 8 owed | `VERIFIED` | All eleven group pages measured live at 1280 / 768 / 375; the counts match ours member for member; the reference has no group index. Appended to `docs/research/01-reference-site-audit.md` §3.6 | `a49dd6d` |
| 8.1 The table's resting isolation and its linking legend | `COMPLETE` | `createPeriodicTable`'s `isolate` and `legendLinks`, `attachPeriodicTable`'s `data-isolated` resting rule, the tile's `match` mark, `lib/plural.js` | `3b5cd60` |
| 8.2 The family module | `COMPLETE` | `pages/group.js`: the derived facts, `GROUP_NOTES` free of counts, the member and sibling lists, the index's values, `startGroup` | `54832b4` |
| 8.3 The two templates | `COMPLETE` | `pages/group.html` behind all eleven, and `pages/element-groups-index.html` | `54832b4` |
| 8.4 The family sheet and its tokens | `COMPLETE` | `styles/pages/group.css` names no colour; the hero's wash and the lede come from `--fill` and `--fill-deep` | `54832b4` |
| 8.5 The route wiring and the band | `COMPLETE` | `groupRoutes(categories)`, `GROUP_STYLES`, `allRoutes(elements, categories)`, the `group` behaviour name, and a twelve-item band — the build renders 139 routes and reports 5 waiting | `54832b4` |
| 8.6 The tests | `COMPLETE` | `tests/pages/group.test.js`, fourteen tests; the manifest-holding tests widened. 383 pass | `54832b4` |

Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Accepted decisions

All six ADRs stand; nothing is blocked on a decision. Three decisions from Phase 8 join the Phase 7 set:

| Decision | Why |
|---|---|
| **A table written isolated rests on its own `data-isolated`.** | A group page's subject is one key, so the table has to be right before any script runs — which means the isolation cannot live only in the behaviour. Reading the resting key back off the markup gives a group page the behaviour it wants for free: pointing at a chip previews that group and moving away restores the page's own, where a table that was never written isolated correctly clears. One rule, and both kinds of page get the right answer. |
| **A group's copy holds no counts.** | Carried forward from Phases 6 and 7 and applied hardest here: the hero's count, its range, its block and its states are all read off the members, so a copy that also asserted a number could contradict the page after any correction to the data. `GROUP_NOTES` is written in prose that stays true. |
| **The band lists all eleven groups, not the reference's six.** | The reference's band on these pages carries seven of the eleven names, removes the page's own group, and hides four groups in the page foot. Ours lists all eleven in the order a reader meets them reading the table, then the index. The cost is recorded: twelve full names do not fit one row at the shell's width, so our band wraps to two rows at desktop where the reference's stays one. |
| **The engine's legend is links on a group page and buttons elsewhere.** | The chips' contract is isolation, but on a group page the useful thing a chip can do is lead to the group it names. Pointing at one still previews it, so the page keeps the home page's behaviour as well as gaining the door. |
| **A hero's band excludes the page's own top spacing.** | Unchanged from Phase 7: the reference's 240px hero contains the 56px between its submenu and its first heading; ours is `main`'s, which every family pays. |
| **Derive a claim rather than assert it.** | Unchanged and now applied to six families. |
| **A colour is a key, and the key-to-colour map is one stylesheet.** | Unchanged: every route of a page family must declare `styles/components/periodic-table.css`, because that sheet is where a `data-key`/`data-band` becomes `--fill`/`--on-fill`. The group index is the case that proves it — nothing on it is a periodic table, and it still needs the sheet. |
| ADR-001..006 | Unchanged; see `docs/ARCHITECTURE.md` and the previous sessions' notes in the phase log. |

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| The preview webview does not composite | The panel's own screenshot tool may still fail; it is not on the critical path | `workspace/tools/visual` captures, diffs and measures both pages in headless Chrome. Use the panel tool first because it is cheaper, and fall back to the harness the moment it reports no frames. |
| The preview window has no operating-system focus | `focus`, `blur` and real key events are never delivered, so tab-order and hover behaviour cannot be exercised as a person would | The harness's own Playwright pages are real browsers: use them for keyboard and focus checks. |
| The shell links destinations whose pages are not built yet | A reader clicking through arrives at the not-found page | Accepted construction state; the build reports the count on every run. Now **5** (`/downloads/`, `/calculators/temperature/`, `/glossary/`, `/about/`, `/contact/`). Phase 9 closes `/glossary/`. |
| **Our group band wraps to two rows at desktop** | Twelve group names do not fit the shell's 1100px in one row, so our band is 70.5px against the reference's 33px and the page's content starts 37px lower | Recorded as a deliberate deviation in `progress/PHASE_LOG.md`, with the numbers. Shortening the names would fix 1280 and still wrap at 768, so it was rejected. Revisit only if the band's contents change. |
| A swap is easy to get subtly wrong | The router touches the document's title, description, body, focus and scroll | `tests/router/router.test.js` holds every one of them under fakes, and Phase 8 re-checked the swap with a real navigation between two group pages |
| `covalentRadius` and `latticeParameters` are `null` for all 118 | Two rows of an element page read "Unknown" | Recorded in `docs/DATA_SOURCES.md`; filling them needs a third source and touches one adapter, no page. |
| The 418 glossary definitions are unwritten | Phase 9 is bigger than its page work | Deliberate and recorded; the schema and the arrangement are already built and tested. |
| The typeface is not the reference's | Every page's text measures a few per cent differently, which inflates the harness's page-level number | A Phase 1 deviation, recorded. The harness's region crops and its own `fontFamily` reading in `report.json` are how a typeface difference is told apart from a layout one. |

## Deliberately unfinished

**Nothing.** Phase 8 closed `COMPLETE` on a live reference audit, harness captures against the
reference, a browser pass over four group pages at three widths, and 383 green tests, and the working
tree is clean at the close-out commit. The remaining differences from the reference are the nine
recorded deviations in `progress/PHASE_LOG.md`, not open work.

Deferred on purpose, as before:

1. **The 418 glossary definitions** — Phase 9, by recorded scope decision.
2. **Two schema fields** that no acceptable source supplies — see `docs/DATA_SOURCES.md`.
3. **Five declared routes still waiting on their templates** — `/downloads/`,
   `/calculators/temperature/`, `/glossary/`, `/about/`, `/contact/`. This is the construction state
   the build reports on every run, not an open work item.

## How to resume in 60 seconds

```bash
git log --oneline -20             # what has actually been committed
git status --short                # anything half-done?
cat workspace/RUN_STATE.md        # this file
node --test source/tests          # is the last checkpoint real?  expect: 383 passing
node source/tools/build.js        # renders 139 routes and reports 5 waiting
node source/tools/serve.js --port 4180   # the site; the groups are under /element-groups/
```

And when a page needs looking at:

```bash
cd workspace/tools/visual && npm install && \
  node compare.mjs --ours http://127.0.0.1:4180/element-groups/halogens/ \
    --reference https://www.breakingatom.com/element-groups/halogens --label group-halogens --widths 1280,768,375
```

Then open `workspace/progress/PHASE_LOG.md` at Phase 8. Phase 9 next: the glossary. Audit the
reference's `/terms` index and its term pages live before writing their CSS.
