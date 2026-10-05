# RUN_STATE.md — authoritative recovery checkpoint

> This file is the **first** thing a resuming agent reads and the **last** thing a finishing agent
> updates. It is a checkpoint, not a narrative. Keep it factual and current.
>
> **It is never sufficient on its own.** Always reconcile it with `git log`, `git status`, the
> working tree, and the tests before acting. See `WORKING_AGREEMENT.md` §7.

**Last updated:** 2026-10-05 (the session that built the home page)

---

## Current position

| Field | Value |
|---|---|
| **Phase** | Phase 4 — Home page — `VERIFIED`, with the project's standing capture gate open |
| **Work item** | Phase 4 is closed; Phase 5 — routing and element detail pages — is next |
| **Objective achieved** | The front door: the table engine mounted from the data layer, two explainer schematics drawn from the same grid model, three in-scope teasers, and an element finder that is a form before it is a script — plus the defect it exposed, the build not linking a page's component stylesheets |
| **Status** | `VERIFIED`. 221 tests pass; every exit criterion verified by measurement in a browser, except that no visual capture could be taken — the same failure as Phase 3, so the phase is not `COMPLETE` |
| **Current commit** | `74c168d`, plus the close-out commit that follows it |
| **Next action** | One capture retry, then Phase 5. Reload the preview, `preview_resize {fill: true}`, capture the built home page at 1280 / 768 / 375 against the reference tab pinned to light. If it composites, capture the style guide's table too, tick both phases' criteria and close them. If it does not, leave both gates open and start Phase 5 — 118 element detail pages must not wait on a screenshot. |

## Files expected to change in the next work item

```
(Phase 5)  source/scripts/router/router.js            link interception, history, scroll, 404
source/scripts/router/routes.js                       the derived element routes, one per element
source/tools/build.js                                 writing the generated family
source/pages/element-detail.html                      the family's one template
source/scripts/pages/element-detail.js                the family's one module — all 118 pages
source/styles/pages/element-detail.css                its stylesheet
source/scripts/components/property-list.js  (+ .css)  the ~40-row labelled property table
source/scripts/components/shell-diagram.js  (+ .css)  generated SVG from the shell data
source/scripts/components/faq-block.js      (+ .css)  question/answer pairs from the record
source/tests/pages/*.test.js, source/tests/components/*.test.js
workspace/docs/MIND_MAP.md                            in the same commit as each file
```

The table and the finder need no changes. `createPeriodicTable({ elements, categories, mode, hint })`
plus `attach(root)` is the whole contract, and the element records already carry every field the
detail page prints — including `position`, `shells`, `valence` and the discovery block.

## Work item ledger

| Item | Status | Verification | Commit |
|---|---|---|---|
| 0.0–0.5 Foundation | `COMPLETE` | See the Phase 0 entry in `progress/PHASE_LOG.md` | `81bf871`..`a16d35e` |
| 1.0–1.8 Design system and shell | `COMPLETE` | See the Phase 1 entry; 51 tests at the time | `2ba459d`..`cc2151f` |
| 2.0–2.6 Data layer | `COMPLETE` | See the Phase 2 entry; the visual gate, run late, found and fixed two chrome differences | `d985245`..`97169ed` |
| 3.0 The grid, the scale and the keyboard rules | `COMPLETE` | `lib/grid.js`, `lib/colour-scale.js`, `lib/keyboard.js`, and 35 logic tests against the real dataset | `bf1d8e3` |
| 3.1–3.4 The engine, four modes, isolation, keyboard, narrow screens | `COMPLETE` | See the Phase 3 entry: measured in a browser at 1280 / 768 / 375, all four modes with exact legend counts | `2f06018` |
| 3.5 Tile geometry against the reference | `VERIFIED` | Two tables measured in one session, every metric identical. **Not captured.** | `2f06018` |
| 4.0 The route's component stylesheets | `COMPLETE` | `routes.js` carries a `styles` list; `build.js` links it; two tests hold it, including every declared path against a real file | `7587a66` |
| 4.1 The finder and the engine's hint | `COMPLETE` | 23 tests: ranking against the real 118, the form's markup, the hint escaped and optional | `596fc15` |
| 4.2 The page: sections and two diagrams | `COMPLETE` | 12 tests: section order, the hosts, both diagrams drawing all 118 from the grid model | `0eab574` |
| 4.3 The finder's control height | `COMPLETE` | Field and button both 54.15px, the reference's own height | `74c168d` |
| 4.4 The page against the reference at three widths | `VERIFIED` | Measured side by side in one session: h1, hero measure, table container, explainer columns, finder geometry, closing section, rhythm, and no horizontal overflow. **Not captured.** | `74c168d` |

Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Accepted decisions

All six ADRs stand; nothing is blocked on a decision. One new decision is worth carrying forward:

| Decision | Why |
|---|---|
| **A route names the component stylesheets it uses.** | Without a bundler nothing can discover a component's sheet, and a page that renders a component without its CSS looks broken in a way no test noticed until the first real page arrived. The manifest is already the single answer to "which pages exist?", so it is also the answer to "what does this page need?" — and a test holds every declared path to a real file. |
| **The finder is a form first.** | It submits to the elements index by the browser's own means, so it works with scripting off, and the module is an improvement on top of that rather than a replacement. The same shape as the rest of `components/`: pure matching, string markup, one attachment. |
| **The diagrams are drawn from `lib/grid.js`, not hand-written.** | A schematic of the table that could disagree with the table is worse than no schematic. Both come from the model the engine lays the grid out from, so they cannot drift. |
| ADR-001..006 | Unchanged; see `docs/ARCHITECTURE.md` and the previous sessions' notes in the phase log. |

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| The preview webview does not composite | The visual gate cannot be captured, and neither Phase 3 nor Phase 4 can honestly close | Retry once at the start of the session. This has happened in two consecutive sessions, so it now reads as environmental; if the third retry fails, raise it with the author. `preview_resize {fill: true}` is step zero of the recipe. Never present a measurement as a capture. |
| The preview window has no operating-system focus | `focus`, `blur` and real key events are never delivered, so tab-order and hover behaviour cannot be exercised as a person would | Real clicks are delivered, and dispatching the event through the shipped listener exercises the same code path. Say which method was used. |
| Generated routes multiply the build's surface | 118 element pages must be written, linked and tested without a bundler | The manifest already supports derived entries and the build reports what it skipped; the family shares one template and one module, so the 118 pages are data, not markup. |
| The shell links destinations whose pages are not built yet | A reader clicking through arrives at the not-found page | Accepted construction state; the build reports the count on every run. Still 14. |
| `covalentRadius` and `latticeParameters` are `null` for all 118 | Two rows of the element page will read "Unknown" | Recorded in `docs/DATA_SOURCES.md`; filling them needs a third source and touches one adapter, no page. |
| The 418 glossary definitions are unwritten | The glossary phase is bigger than its page work | Deliberate and recorded; the schema and the arrangement are already built and tested. |

## Deliberately unfinished

**The visual capture, for the second phase running.** Phase 3's criterion and Phase 4's appearance
evidence are measurements, written out in full in the phase log; neither phase is `COMPLETE` until
some session can take the pictures. Everything else in the tree is finished: the working tree is
clean at the close-out commit.

Deferred on purpose, as before:

1. **The 418 glossary definitions** — Phase 9, by recorded scope decision.
2. **Two schema fields** that no acceptable source supplies — see `docs/DATA_SOURCES.md`.

## How to resume in 60 seconds

```bash
git log --oneline -20             # what has actually been committed
git status --short                # anything half-done?
cat workspace/RUN_STATE.md        # this file
node --test source/tests          # is the last checkpoint real?  expect: 221 passing
node source/tools/build.js        # renders the ready routes into dist/
node source/tools/serve.js --port 4180   # the site; /styleguide/ carries the table's four modes
```

Then open `workspace/progress/PHASE_LOG.md` at Phase 4. The capture first, then Phase 5 — the
element detail family, one template and one module behind 118 URLs.
