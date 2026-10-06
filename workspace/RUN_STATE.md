# RUN_STATE.md — authoritative recovery checkpoint

> This file is the **first** thing a resuming agent reads and the **last** thing a finishing agent
> updates. It is a checkpoint, not a narrative. Keep it factual and current.
>
> **It is not sufficient on its own.** Always reconcile it with `git log`, `git status`, the
> working tree, and the tests before acting. See `WORKING_AGREEMENT.md` §7.

**Last updated:** 2026-10-06 (the session that closed Phase 11 — quality, accessibility, performance
and delivery — and delivered `v1.0.0`)

---

## Current position

| Field | Value |
|---|---|
| **Phase** | Phase 11 — Quality, accessibility, performance and delivery — `COMPLETE` |
| **Work item** | Phase 11 closed on four sweeps that measure rather than inspect, seven accessibility defects found and fixed (two by our own sweep, four by Lighthouse, one by the browser's own contrast maths), one performance defect found and fixed at its cause, per-page metadata with the two crawl files, a Pages workflow, and 482 green tests. **All twelve phases are `COMPLETE`.** The only thing the plan asks for that is not done is the one-time push that makes the site live, which `docs/GIT_WORKFLOW.md` §8 assigns to the author |
| **Objective achieved** | The replica is a finished product. Every page is rendered at build time rather than assembled by the browser, so a crawler and a reader whose script did not run both see the site. Every page carries a title, a description, a canonical link, Open Graph metadata and JSON-LD, and the build writes `sitemap.xml` from the routes it actually wrote plus a `robots.txt` naming it. Nineteen pages pass an accessibility sweep with 0 defects, all 76 page-and-width combinations fit their viewport, the worst layout shift on any page is 0, and Lighthouse scores accessibility, best-practices and SEO at 100 across seven sampled pages |
| **Status** | `COMPLETE`. `node --test source/tests` → **482 pass, 0 fail**. The build writes **562 routes** plus the not-found page and reports **0 waiting**. The four gates all exit 0: accessibility **0 defects / 27 informational lines across 19 pages**; responsive **76 of 76**; performance **worst shift 0, slowest cold load 38ms, 0 long tasks**; Lighthouse **accessibility 100, best-practices 100, SEO 100, performance 89 mean (82–98, recorded not gated)**. A clone into an empty directory builds and passes the suite with nothing installed |
| **Current commit** | `ec80c43`, plus the close-out commit. Phase 11 range: `f1cef8e`..`ec80c43`, tagged `v1.0.0` |
| **Next action** | Nothing is open on the plan. If the site should go live, the author's one-time step is `git remote add origin <url>` then `git push -u origin main && git push --tags`, and GitHub Pages enabled with **Source: GitHub Actions** — the workflow does the rest. Otherwise the next work item is whatever the author chooses: the three long-standing deferrals are listed under *Deliberately unfinished* |

## Files expected to change in the next work item

```
(nothing is pending) workspace/RUN_STATE.md, workspace/HANDOFF.md   only if work resumes
.github/workflows/pages.yml                                        only if the deployment changes
```

The plan is delivered end to end. The one command the project still owes is the author's push, and
it changes no file but `README.md`'s claim that the site is published — which it deliberately does
not yet make. If a later phase reopens a page, the pieces to touch are the page's family module, its
template, its sheet, its entry in the route manifest and its tests; `docs/MIND_MAP.md` §4 answers
"which file owns this" for every case, and every new file must appear there in the same commit.

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
| 9.0–9.8 The glossary | `COMPLETE` | See the Phase 9 entry; 413 tests, the index 4.66% / 4.53% / 5.55% of the reference's and a term page 3.60% / 3.84% / 5.11% | `5a05a1f`..`73fbb47` |
| 10.0–10.7 Calculators and secondary pages | `COMPLETE` | See the Phase 10 entry; 458 tests, the calculator audited live, print measured by page count at A4 and Letter | `df4d60e`..`b9999d3`, `dc59554` |
| 11.0 The accessibility sweep, and the 443 contrast failures it found | `COMPLETE` | `tools/visual/audit-a11y.mjs` measures 19 pages for landmarks, heading order, names, captions, contrast against the surface each colour is composited over, the table's roving tab stop and reduced motion, exiting non-zero on a defect. `--ink-faint` `#5b726e`; the legend counts are ringed rather than washed | `f1cef8e`, `969cbdf` |
| 11.1 The responsive sweep over four widths | `COMPLETE` | `tools/visual/audit-responsive.mjs`: 19 pages at 375 / 768 / 1024 / 1440 → **76 of 76** fit, exit 0. Found the orbital-configuration rows spilling 68px at 375px | `7269c9f`, `04a9e45` |
| 11.2 Per-page metadata, and the two crawl files | `COMPLETE` | `tools/document.js` writes canonical, Open Graph, a `summary` Twitter card, JSON-LD per page (a `Thing` naming the element on its own page), a 562-`loc` `sitemap.xml` from the routes actually written, and `robots.txt`. `SITE_ORIGIN` with a reserved `.example` default | `bf44dd7` |
| 11.3 The build split the 400-line law forced | `COMPLETE` | `tools/document.js` owns what a document looks like; `build.js` owns what is on the site. Behaviour unchanged: same 562 routes, same sitemap | `3b3b09f` |
| 11.4 The home page's blocks drawn at build time | `COMPLETE` | `homePageValues` computes the table, both diagrams and the finder; `startHome` only attaches. Layout shift **0.315 → 0**; 118 tiles and 236 diagram cells present with the script off; no duplicate id | `06c5e76` |
| 11.5 The performance sweep, and the shift it found | `COMPLETE` | `tools/visual/audit-performance.mjs`: six pages cold, reporting timings, bytes, shift and long tasks; exits non-zero over a 0.1 shift or a 2000ms load. Worst shift 0, slowest load 38ms, 0 long tasks | `8869b4c` |
| 11.6 Lighthouse, and the four defects it found | `COMPLETE` | `tools/visual/audit-lighthouse.mjs` over seven pages, gating accessibility at 1.0 and best-practices at 0.95. Fixed the faded tile ink (4.32:1), the drained tiles (1.5:1), the element page's orphaned list items and three label-content-name mismatches | `5cc54d1`, `964bf80` |
| 11.7 The deployment, and the reference's metadata audited | `COMPLETE` | `.github/workflows/pages.yml` computes its own origin, builds, tests and hands `dist/` to Pages. `research/01` §5 records the reference's metadata live: no JSON-LD, a 404ing favicon, a 404ing `/sitemap.xml` | `b741a49`, `1c431ee` |
| 11.8 Documentation close-out, and the `guides/` audit it turned up | `COMPLETE` | README, `MIND_MAP.md`, `research/01` §5, this file, `HANDOFF.md`, the Phase 11 entry — and all four guides audited against the source, which found three of them drifted: 18 `(pending)` rows and functions that were never exported, a file tree naming three files that do not exist, and a page trace that had the element page hydrating when it runs no script at all. MIND_MAP completeness: 168 files under `source/`, 0 missing | `ec80c43`, plus the close-out commit |

Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Accepted decisions

All six ADRs stand; nothing is blocked on a decision. Four decisions from Phase 11 join the set:

| Decision | Why |
|---|---|
| **Everything a reader is meant to read is written at build time.** | The home page was the last exception and it cost a 0.315 layout shift and a table-less page for a crawler and for a reader whose script did not run. Every family is now rendered by the build from the same functions the browser would have used, and a page's behaviour only **attaches** to markup that is already there. |
| **Where the reference's own value fails AA, accessibility wins and the deviation is recorded.** | The reference's tertiary ink is 3.06:1 on our paper and its isolation dims text to 1.5:1. We darkened the ink and drain the fill instead of the tile, and both costs are written down in `DESIGN_SYSTEM.md` and in the Phase 11 deviations table rather than quietly absorbed. |
| **A canonical link is configuration, and the default cannot resolve.** | `site-origin.js` reads `SITE_ORIGIN` and falls back to a reserved `.example` address, and the build says on every run that the placeholder is in place. A confident, wrong canonical is worse than none, and the workflow passes the real origin in. |
| **The deployment is a workflow; publication is the author's step.** | `docs/GIT_WORKFLOW.md` §8 makes publishing deliberate and author-approved. The workflow, the routing fallback and the README's steps are the deliverable; the push is not claimed until it happens. |
| **Derive a claim rather than assert it.** | Unchanged, and now applied to nine families: the fading ceiling is derived from the eleven group fills by `lowestAlphaForAA` rather than chosen, and a test holds every fading token above it. |
| ADR-001..006 | Unchanged; see `docs/ARCHITECTURE.md` and the previous sessions' notes in the phase log. |

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| **Nothing is published** | The plan's deployment criterion is met on the pipeline, not on a live URL: there is no remote, so no Pages build has run | `docs/GIT_WORKFLOW.md` §8 is the author's one-time step; the README documents both the workflow and the push. Recorded as a Phase 11 deviation rather than as done. |
| The preview webview does not composite | The panel's own screenshot tool may still fail; it is not on the critical path | `workspace/tools/visual` captures, diffs and measures in headless Chrome. Phase 11 closed on its four sweeps rather than on a capture, because the only page whose markup changed was compared numerically. |
| The preview window has no operating-system focus | `focus`, `blur` and real key events are never delivered, so tab-order and hover behaviour cannot be exercised as a person would | The harness's own Playwright pages are real browsers; every keyboard check this project has run went through them. |
| Three pages have no reference to compare with | About, Contact and the downloads page cannot be pixel-diffed against anything | Accepted since Phase 10: the evidence for those three is the accessibility, keyboard, overflow and link checks rather than a diff. |
| Our group band wraps to two rows at desktop | Twelve group names do not fit the shell's 1100px in one row | Recorded as a deliberate deviation in `progress/PHASE_LOG.md`. Visible again in this phase's 768px home capture as the legend wrapping, where the reference's does not. |
| Nine glossary deviations, one of them an undelivered deliverable | The plan's deliverables list an expanded explanation on a term page; the reference has none, and 418 paragraphs of new prose have no source to audit against | Recorded at the top of its deviations table in `progress/PHASE_LOG.md`. The phase's exit criteria do not ask for it. |
| A swap is easy to get subtly wrong | The router touches the document's title, description, body, focus and scroll | `tests/router/router.test.js` holds all of them under fakes, and this phase re-checked the roving tab stop after an in-page navigation. |
| `covalentRadius` and `latticeParameters` are `null` for all 118 | Two rows of an element page read "Unknown" | Recorded in `docs/DATA_SOURCES.md`; filling them needs a third source and touches one adapter, no page. |
| The typeface is not the reference's | Every page's text measures a few per cent differently, which inflates the harness's crop numbers | A Phase 1 deviation, recorded. It is the class of difference the 1280px home capture's 2.31% belongs to. |
| Lighthouse's performance score moves between runs | A recorded number can look like a regression when the machine is busy | `audit-lighthouse.mjs` records performance and SEO rather than gating them, and the Phase 11 entry states both readings (89 and 92 mean) with the reason. Only accessibility and best-practices gate. |

## Deliberately unfinished

**Nothing on the plan.** All twelve phases are `COMPLETE` and the working tree is clean at the
close-out commit, tagged `v1.0.0`.

Three deferrals stand, each recorded where it belongs:

1. **The plan's "expanded explanation" on a term page** — not delivered in Phase 9, because 418
   paragraphs would have no source to audit them against.
2. **Two schema fields** that no acceptable source supplies (`covalentRadius`, `latticeParameters`) —
   see `docs/DATA_SOURCES.md`.
3. **The one-time push** — the deployment exists and is documented; nothing is live. That is the
   author's step, not an omission.

## How to resume in 60 seconds

```bash
git log --oneline -20             # what has actually been committed
git status --short                # anything half-done?
cat workspace/RUN_STATE.md        # this file
node --test source/tests          # is the last checkpoint real?  expect: 482 passing
node source/tools/build.js        # renders 562 routes, 0 waiting
node source/tools/serve.js --port 4180   # the site
```

And the four gates, from `workspace/tools/visual` after `npm install`:

```bash
node audit-a11y.mjs         # 0 defects across 19 pages
node audit-responsive.mjs   # 76 of 76 fit
node audit-performance.mjs  # shift 0, load 38ms, no long task
node audit-lighthouse.mjs   # accessibility 100, best-practices 100, seo 100
```

Then open `workspace/progress/PHASE_LOG.md` at Phase 11 for the evidence behind each number.
