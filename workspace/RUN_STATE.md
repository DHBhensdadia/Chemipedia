# RUN_STATE.md — authoritative recovery checkpoint

> This file is the **first** thing a resuming agent reads and the **last** thing a finishing agent
> updates. It is a checkpoint, not a narrative. Keep it factual and current.
>
> **It is not sufficient on its own.** Always reconcile it with `git log`, `git status`, the
> working tree, and the tests before acting. See `WORKING_AGREEMENT.md` §7.

**Last updated:** 2026-10-06 (the session that wrote the 418 definitions, built the glossary's index
and term pages, and closed Phase 9)

---

## Current position

| Field | Value |
|---|---|
| **Phase** | Phase 9 — Glossary — `COMPLETE` |
| **Work item** | Phase 9 closed on a live reference audit, the 418 definitions written here, `/glossary/` with the A–Z rail and the filter the plan asked for, a page per term, cross-links between a term and the elements whose entries mention it, a browser pass at three widths, harness captures against the reference's `/terms`, and 413 green tests. Phase 10 — the calculator, the downloads and the two secondary pages — is next |
| **Objective achieved** | The site's vocabulary layer and its internal-link backbone. The index is 418 ruled rows filed under 26 letters, with a rail of letters down the left edge, a live filter over both the term and the definition, and a count that stays honest. A term page is the definition, the difficulty badge, the way back to its letter, the terms it sits near, the elements that mention it, and a pager that stops at both ends. An element page gained "Terms in this entry" — the other end of the same relation. The reference's own term page is the definition and two rails into sections this site does not build |
| **Status** | `COMPLETE`. 413 tests pass, the build renders **558 routes** plus the not-found page, and the pages were captured, pixel-diffed and measured in one headless browser at 1280 / 768 / 375. The ledger and its badges are the reference's measurements to the decimal — the row 91.13px on a 352px/670px/112px grid, the term 30.976px, the definition 13.6px/21.08px capped at 534px, the badges 11.52px on dotted group-coloured rules — and the reference's own ledger measures `34px 1246px` against our `34px 1246px`. Page-level pixels: the index **4.66% / 4.53% / 5.55%**, a term page **3.60% / 3.84% / 5.11%**. Eight deviations are recorded in `progress/PHASE_LOG.md`, one of them an undelivered deliverable |
| **Current commit** | `73fbb47`, plus the close-out commit that follows. Phase 9 range: `5a05a1f`..`73fbb47` |
| **Next action** | Phase 10 — `/calculators/temperature/`, `/downloads/`, `/about/` and `/contact/`, whose templates are the four the build still reports as waiting. Audit the reference's calculator and downloads pages live first, as every phase with a page family has. ADR-005 requires About to carry the data-provenance section |

## Files expected to change in the next work item

```
(Phase 10) source/pages/temperature-calculator.html      the calculator
source/pages/downloads.html                              the downloads area
source/pages/about.html                                  About, with ADR-005's provenance section
source/pages/contact.html                                Contact
source/scripts/pages/temperature-calculator.js           the conversion, and its behaviour
source/scripts/pages/downloads.js                        the printable tables
source/styles/pages/*.css                                one sheet per family
source/scripts/router/routes.js                          styles for the four routes
source/tools/build.js                                    FAMILY_RENDERERS entries where a page is driven by data
source/tests/pages/*.test.js                             the conversions round-tripping, the targets resolving
source/assets/                                           the printables, if the downloads are generated
workspace/docs/research/01-reference-site-audit.md       §3.8 audited live first
workspace/docs/MIND_MAP.md                               in the same commit as each file
```

The pieces that already exist and need no change: `lib/units.js` and `data/units.json` for the
temperature scale's own units, the token layer for the calculator's field and button, and the page
skeleton every family already shares. `IMPLEMENTATION_PLAN.md` §Phase 10 fixes the scope: the
temperature calculator, the downloads area, About and Contact, and nothing else.

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
| 8.0–8.6 Element group pages | `COMPLETE` | See the Phase 8 entry; the table region 0.53% / 1.98% / 0.73% of the reference's and identical in size | `a49dd6d`..`54832b4` |
| 9.0 The reference's glossary, audited live | `VERIFIED` | `/terms` is the index and `/glossary-of-terms/:slug` a term; the hero, the rail, the ledger's grid, the row's height, the definition's measure and the badge's three colours all measured at 1280 / 768 / 375. `docs/research/01-reference-site-audit.md` §3.7 | `5a05a1f` |
| 9.1 The 418 definitions | `COMPLETE` | `data/glossary.json`: 418 records, 26 letters, no duplicate slug or name, every definition 60–400 characters of finished prose. `tests/data/glossary.test.js` grew a second half that reads the shipped file | `39abcef` |
| 9.2 The index family module | `COMPLETE` | `pages/glossary.js`: the rows, the letters, the rail, the badge, the status line and `startGlossaryIndex` | `be7a3d5` |
| 9.3 The term family module | `COMPLETE` | `pages/glossary-term.js`: the definition, the badge, the derived relations, the pager, and refusals for a route without a term | `be7a3d5` |
| 9.4 The two templates and the sheet | `COMPLETE` | `pages/glossary-index.html`, `pages/glossary-term.html`, `styles/pages/glossary.css` and the glossary's tokens. No colour is named: the badges spend three `--level-*` aliases of the group palette | `be7a3d5` |
| 9.5 The wiring | `COMPLETE` | The glossary loaded as a repository, 418 routes derived from the records, `allRoutes` over three families, the index's behaviour entry. 558 routes built | `63f73d0` |
| 9.6 The tests | `COMPLETE` | `tests/pages/glossary.test.js`, 19 tests, including the filter driven through its own field and every link on all 419 pages held to the manifest | `2d7b019` |
| 9.7 The browser pass, and the defect it found | `COMPLETE` | The headings step down below the shell, where the reference's do; and the router's `popstate` handler, which answered a fragment jump by re-rendering the page the reader was already on | `6787b6c`, `b9cafba` |
| 9.8 The element side of the cross-linking | `COMPLETE` | `lib/glossary-links.js`, one rule read from both ends; "Terms in this entry" on every element page that mentions one | `73fbb47` |

Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Accepted decisions

All six ADRs stand; nothing is blocked on a decision. Four decisions from Phase 9 join the Phase 8
set:

| Decision | Why |
|---|---|
| **A term and an element are related by one rule, held in one module.** | The relation is read from two ends — a term page lists the elements that mention it, an element page lists the terms its entry mentions — and two implementations of it would eventually disagree, which is a site telling a reader two different things about the same sentence. `lib/glossary-links.js` owns the field list and the whole-word match, and both ends ask it. |
| **A difficulty level is a judgement about our own definition.** | Measured live, the reference splits 189 / 129 / 99; ours is 107 / 168 / 143. Copying its distribution would be a claim about prose it did not write, so the levels describe our definitions and the counts differ. The badge's three colours are the reference's, and they are group colours. |
| **The index carries a filter the reference does not have, and the hero pays for it.** | The plan asks for live filtering. The hero's content is 232.97px against the reference's 92.94px, and with our own padding the section is 324.97px against its flat 230, so the list starts 129px lower; its own text block is still the reference's 92.94px. Recorded as a deviation rather than hidden. |
| **The router tells a fragment move from a history move.** | Chrome and Safari fire `popstate` for both, and the untold-apart version fetched the page the reader was already on and settled them at the top of it. A move to the page already on screen is the browser's own work: `pageKey` compares path and query, and the fragment is not part of it. |
| **Derive a claim rather than assert it.** | Unchanged, and now applied to seven families. |
| **A colour is a key, and the key-to-colour map is one stylesheet.** | Unchanged — with the glossary as the case that shows its limit: the badges want three of the group colours, not a key that resolves to one, so they spend `--level-*` in the token layer and the family declares no component sheets. |
| ADR-001..006 | Unchanged; see `docs/ARCHITECTURE.md` and the previous sessions' notes in the phase log. |

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| The preview webview does not composite | The panel's own screenshot tool may still fail; it is not on the critical path | `workspace/tools/visual` captures, diffs and measures both pages in headless Chrome. Use the panel tool first because it is cheaper, and fall back to the harness the moment it reports no frames. |
| The preview window has no operating-system focus | `focus`, `blur` and real key events are never delivered, so tab-order and hover behaviour cannot be exercised as a person would | The harness's own Playwright pages are real browsers: use them for keyboard and focus checks. |
| The shell links destinations whose pages are not built yet | A reader clicking through arrives at the not-found page | Accepted construction state; the build reports the count on every run. Now **4** (`/downloads/`, `/calculators/temperature/`, `/about/`, `/contact/`), all Phase 10's. |
| **Our group band wraps to two rows at desktop** | Twelve group names do not fit the shell's 1100px in one row, so our band is 70.5px against the reference's 33px | Recorded as a deliberate deviation in `progress/PHASE_LOG.md`, with the numbers. Shortening the names would fix 1280 and still wrap at 768, so it was rejected. |
| **Eight glossary deviations, one of them an undelivered deliverable** | The plan's deliverables list an expanded explanation on a term page; the reference has none, and 418 paragraphs of new prose have no source to audit against | Recorded at the top of its deviations table in `progress/PHASE_LOG.md`. The phase's exit criteria do not ask for it, and the aside carries what the records can prove. |
| A swap is easy to get subtly wrong | The router touches the document's title, description, body, focus and scroll | `tests/router/router.test.js` holds all of them under fakes, the fragment case is now one of them, and Phase 9 re-checked a real row click, a pager click and two backs in a browser |
| `covalentRadius` and `latticeParameters` are `null` for all 118 | Two rows of an element page read "Unknown" | Recorded in `docs/DATA_SOURCES.md`; filling them needs a third source and touches one adapter, no page. |
| The typeface is not the reference's | Every page's text measures a few per cent differently, which inflates the harness's page-level number | A Phase 1 deviation, recorded. The harness's region crops and its own `fontFamily` reading in `report.json` are how a typeface difference is told apart from a layout one. |

## Deliberately unfinished

**Nothing.** Phase 9 closed `COMPLETE` on a live reference audit, harness captures against the
reference's `/terms`, a browser pass over the index, a term page and an element page at three widths,
and 413 green tests, and the working tree is clean at the close-out commit. The remaining differences
from the reference are the eight recorded deviations in `progress/PHASE_LOG.md`, not open work — and
one of those is an undelivered deliverable, named as such rather than omitted.

Deferred on purpose, as before:

1. **The plan's "expanded explanation" on a term page** — recorded as not delivered, with the reason
   and what it would take: 418 paragraphs with no source to audit them against.
2. **Two schema fields** that no acceptable source supplies — see `docs/DATA_SOURCES.md`.
3. **Four declared routes still waiting on their templates** — `/downloads/`,
   `/calculators/temperature/`, `/about/`, `/contact/`. This is the construction state the build
   reports on every run, not an open work item.

## How to resume in 60 seconds

```bash
git log --oneline -20             # what has actually been committed
git status --short                # anything half-done?
cat workspace/RUN_STATE.md        # this file
node --test source/tests          # is the last checkpoint real?  expect: 413 passing
node source/tools/build.js        # renders 558 routes and reports 4 waiting
node source/tools/serve.js --port 4180   # the site; the glossary is /glossary/, a term is /glossary/<slug>/
```

And when a page needs looking at:

```bash
cd workspace/tools/visual && npm install && \
  node compare.mjs --ours http://127.0.0.1:4180/glossary/ \
    --reference https://www.breakingatom.com/terms --label glossary --widths 1280,768,375
```

Then open `workspace/progress/PHASE_LOG.md` at Phase 9. Phase 10 next: four pages, and the reference
audit comes before their CSS. Its exit criteria include `−40 °C = −40 °F`, so the conversion is the
first thing to get right.
