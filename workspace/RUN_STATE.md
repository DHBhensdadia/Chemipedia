# RUN_STATE.md — authoritative recovery checkpoint

> This file is the **first** thing a resuming agent reads and the **last** thing a finishing agent
> updates. It is a checkpoint, not a narrative. Keep it factual and current.
>
> **It is never sufficient on its own.** Always reconcile it with `git log`, `git status`, the
> working tree, and the tests before acting. See `WORKING_AGREEMENT.md` §7.

**Last updated:** 2026-10-06 (the session that built the four alternate table views and closed Phase 7)

---

## Current position

| Field | Value |
|---|---|
| **Phase** | Phase 7 — Alternate periodic table views — `COMPLETE` |
| **Work item** | Phase 7 closed on a reference audit of the four views, a browser pass over all four built pages, harness captures against the reference, and 369 green tests. Phase 8 — the element group pages — is next |
| **Objective achieved** | `/periodic-table/properties-and-states/`, `/orbitals/`, `/electronegativity/` and `/evolution/` — the Phase 3 engine answering four different questions. Each view is a colour mode plus the line written under its table; two of the four add a section below the table (the electronegativity trend, the evolution timeline). The discovery mode and the era timeline are new; the block palette was corrected to the reference's own four group colours |
| **Status** | `COMPLETE`. 369 tests pass, the build renders 127 routes plus the not-found page, and all four pages were captured, pixel-diffed and measured in one headless browser at 1280 / 768 / 375. Our legend lands on the reference's own y (364) and the grid within 2.1px on three views; tile-by-tile colour agreement is 104–114/118 on the three keyed views and 109/118 on evolution. What is left is the typeface, the reference's own era boundaries and the seven recorded deviations |
| **Current commit** | `d1a4ad4`, plus the close-out commit that follows (`a0b0df8` is the era model, the electronegativity model and the timeline). Phase 7 range: `a0b0df8`..`d1a4ad4` |
| **Next action** | Phase 8 — `/element-groups/:slug` for the eleven categories, and the `/element-groups/` landing page. **Audit the reference's group pages live before writing their CSS**, as Phase 6 and Phase 7 each audited their own families: `docs/research/01-reference-site-audit.md` §3.6 is still a one-line expectation, not measurements. Check the exit criterion "member counts match the reference exactly" against our own taxonomy before adopting its numbers |

## Files expected to change in the next work item

```
(Phase 8)  source/scripts/router/routes.js            a groupRoutes(elements) family beside elementRoutes
source/pages/group.html                                one template behind the eleven pages
source/pages/element-groups-index.html                 the /element-groups/ landing page (route already declared)
source/scripts/pages/group.js                          the family module: hero, count, members, isolation
source/styles/pages/group.css
source/tests/pages/group.test.js
workspace/docs/research/01-reference-site-audit.md     §3.6 is not yet audited; capture it live first
workspace/docs/MIND_MAP.md                             in the same commit as each file
```

The pieces already exist and need little or no change: `categories-repository.js` holds the eleven
categories with their display names, palette tokens and asserted member counts; `elementRoutes` is the
pattern a generated family follows; `legend-chips.js` already renders a **link** when a caller passes a
destination, which is what the group pages will use. The one decision to make first is where the eleven
groups' shared-character sentences live — a data file beside `element-notes.json`, or written in the
module like the table views' notes.

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
| 7.0 The reference audit Phase 7 owed | `VERIFIED` | The four views measured live at 1280: the hero bands, the body, the four legends with their counts and every fill read off the tiles, and that the reference's note sits *under* its table. Appended to `docs/research/01-reference-site-audit.md` §3.5 | before `a0b0df8` |
| 7.1 The discovery era model | `COMPLETE` | `tests/lib/discovery.test.js`: every century boundary, the undated bucket, the declared order, six counts summing to 118, members in year order | `a0b0df8` |
| 7.2 The electronegativity derivation | `COMPLETE` | `tests/lib/electronegativity.test.js`: 95 measured of 118, ends francium 0.7 and fluorine 3.98, two rising periods, six of sixteen falling groups, the fifteen-element tail | `a0b0df8` |
| 7.3 The engine's fifth mode | `COMPLETE` | `tests/components/periodic-table.test.js`: discovery added to the keyed-mode test with the centuries derived independently, its legend counts, `attachPeriodicTable` exported | `a0b0df8` |
| 7.4 The era timeline | `COMPLETE` | `tests/components/era-timeline.test.js`: the range line's four wordings, chips with and without a year, six cards, an era with members but no sentence refused | `a0b0df8` |
| 7.5 The four views | `COMPLETE` | `tests/pages/table-views.test.js`; in a browser: 118 tiles each, isolation, keyboard, no overflow, reduced motion, zero console errors | `d1a4ad4` |
| 7.6 The route wiring | `COMPLETE` | The build renders 127 routes and reports 6 waiting; four routes declare the table's sheet; four `FAMILY_RENDERERS` entries and four `PAGE_BEHAVIOUR` names | `d1a4ad4` |

Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Accepted decisions

All six ADRs stand; nothing is blocked on a decision. Four decisions from Phase 7 join the Phase 6 set:

| Decision | Why |
|---|---|
| **The page's note sits under its table.** | The reference puts its note there. Our first build kept the note between the legend and the grid, which is where the home page's helper line lives, and the paragraph's own height pushed our table 224px down the page and made the comparison meaningless. Moving it below the table and giving the legend the reference's 24px gap brought our legend to the reference's own y. |
| **A hero's band excludes the page's own top spacing.** | The reference's 240px hero contains the 56px between its submenu and its first heading; ours is `main`'s, which every family pays. The views' token is the reference's band less that spacing — which is why the token is `calc(240px - var(--sp-7))` and not a bare 240px. |
| **The block colours are four of the eleven group colours.** | The reference's orbitals view paints s/p/d/f with its alkali, actinide, transition and lanthanide colours. Pointing `--g-s-block` and its siblings at those group tokens means a correction to a group colour moves both views at once; a literal here would be a fifth opinion. |
| **The eras are centuries, not the plan's decades.** | The plan asked for a colour per decade of discovery. Our years run 1669–2010 and fall in thirty-one decades; thirty-one legend chips is a chart, not a legend, and the reference groups its own evolution view into six eras for the same reason. The undated bucket is named for what it is and placed last, because five of the thirteen records without a year name a chemist who isolated the element in the eighteenth or nineteenth century. |
| **Derive a claim rather than assert it.** | Carried forward from Phase 6 and applied again: the discovery eras, the electronegativity trend, the two liquids, the four warm-room solids and the missing-value counts are all read off the records, so a correction to the data changes the sentence instead of contradicting it. |
| **A colour is a key, and the key-to-colour map is one stylesheet.** | Unchanged: every route of a page family must declare `styles/components/periodic-table.css`, because that sheet is where a `data-key`/`data-band` becomes `--fill`/`--on-fill`. |
| ADR-001..006 | Unchanged; see `docs/ARCHITECTURE.md` and the previous sessions' notes in the phase log. |

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| The preview webview does not composite | The panel's own screenshot tool may still fail; it is not on the critical path | `workspace/tools/visual` captures, diffs and measures both pages in headless Chrome. Use the panel tool first because it is cheaper, and fall back to the harness the moment it reports no frames. |
| The preview window has no operating-system focus | `focus`, `blur` and real key events are never delivered, so tab-order and hover behaviour cannot be exercised as a person would | The harness's own Playwright pages are real browsers: use them for keyboard and focus checks. |
| The shell links destinations whose pages are not built yet | A reader clicking through arrives at the not-found page | Accepted construction state; the build reports the count on every run. Now **6** (`/downloads/`, `/calculators/temperature/`, `/glossary/`, `/element-groups/`, `/about/`, `/contact/`). Phase 8 closes `/element-groups/`. |
| **Phase 8's exit criteria say "member counts match the reference exactly".** | The reference's taxonomy may file an element in a different group than our `category` field does (as its states, blocks and eras each already differ) | Audit the reference's group pages live first, then compare its counts with ours before adopting them. Our own counts are transition metals 35 · lanthanides 15 · actinides 15 · post-transition metals 8 · unknown 8 · non-metals 7 · noble gases 7 · alkali metals 6 · alkaline earth metals 6 · metalloids 6 · halogens 5 (total 118). The plan's own examples — 35, 5, 8 — already match ours |
| A swap is easy to get subtly wrong | The router touches the document's title, description, body, focus and scroll | `tests/router/router.test.js` holds every one of them under fakes, and Phase 6 re-checked the two that only a real document shows |
| `covalentRadius` and `latticeParameters` are `null` for all 118 | Two rows of an element page read "Unknown" | Recorded in `docs/DATA_SOURCES.md`; filling them needs a third source and touches one adapter, no page. |
| The 418 glossary definitions are unwritten | The glossary phase is bigger than its page work | Deliberate and recorded; the schema and the arrangement are already built and tested. |

## Deliberately unfinished

**Nothing.** Phase 7 closed `COMPLETE` on a reference audit, harness captures against the reference, a
browser pass over all four pages, and 369 green tests, and the working tree is clean at the close-out
commit. The remaining differences from the reference are the seven recorded deviations in
`progress/PHASE_LOG.md`, not open work.

Deferred on purpose, as before:

1. **The 418 glossary definitions** — Phase 9, by recorded scope decision.
2. **Two schema fields** that no acceptable source supplies — see `docs/DATA_SOURCES.md`.
3. **Six declared routes still waiting on their templates** — `/downloads/`,
   `/calculators/temperature/`, `/glossary/`, `/element-groups/`, `/about/`, `/contact/`. This is the
   construction state the build reports on every run, not an open work item.

## How to resume in 60 seconds

```bash
git log --oneline -20             # what has actually been committed
git status --short                # anything half-done?
cat workspace/RUN_STATE.md        # this file
node --test source/tests          # is the last checkpoint real?  expect: 369 passing
node source/tools/build.js        # renders 127 routes and reports 6 waiting
node source/tools/serve.js --port 4180   # the site; the four views are under /periodic-table/
```

And when a page needs looking at:

```bash
cd workspace/tools/visual && npm install && \
  node compare.mjs --ours http://127.0.0.1:4180/periodic-table/orbitals/ \
    --reference https://www.breakingatom.com/periodic-table/orbitals --label view-orbitals --widths 1280,768,375
```

Then open `workspace/progress/PHASE_LOG.md` at Phase 7. Phase 8 next: the eleven element group pages.
Audit the reference's group pages and the `/element-groups/` landing page live before writing their CSS.
