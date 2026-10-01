# RUN_STATE.md — authoritative recovery checkpoint

> This file is the **first** thing a resuming agent reads and the **last** thing a finishing agent
> updates. It is a checkpoint, not a narrative. Keep it factual and current.
>
> **It is never sufficient on its own.** Always reconcile it with `git log`, `git status`, the
> working tree, and the tests before acting. See `WORKING_AGREEMENT.md` §7.

**Last updated:** 2026-10-01 (foundation build session, closed)

---

## Current position

| Field | Value |
|---|---|
| **Phase** | Phase 0 — Foundation, Tooling and Working System — `COMPLETE`, tagged `v0.1.0` |
| **Work item** | 0.5 — Development server and verification harness — `COMPLETE` |
| **Objective** | Prove the pipeline end to end: a declared route is rendered to static HTML, copied into a build directory, and served the way a static host serves it. |
| **Status** | `COMPLETE`. Built, committed, unit-tested, verified over HTTP, and visually inspected at 1280 / 768 / 375 px. |
| **Current commit** | `112ebfe`, plus the close-out commit that follows it (working tree clean) |
| **Next action** | Start **Phase 1 — Design system and global shell**. Write `source/styles/tokens.css` from the values in `docs/DESIGN_SYSTEM.md`, then `base.css`, the layout primitives, the header, the submenu and the footer, and the development-only style guide at `source/styleguide/`. The build must then link the stylesheet and the entry script from the document skeleton — the one edit `tools/build.js` needs — and the first thing to fix is the measure, since body text currently runs the full viewport width. |

## Files expected to change in the next work item

```
source/styles/tokens.css                    every design value in the project
source/styles/base.css                      reset, typography, focus, reduced motion
source/styles/layout.css                    shell, ruled sections, the dotted-rule utilities
source/styles/components/site-header.css    one stylesheet per component, from here on
source/scripts/app.js                       the single entry point
source/scripts/components/site-header.js
source/scripts/components/site-footer.js
source/scripts/components/submenu.js
source/styleguide/index.html                the development-only style guide
source/tools/build.js                       link the stylesheet and the entry script
source/tests/**                             tests for any new pure logic
workspace/docs/MIND_MAP.md                  as always, in the same commits
workspace/progress/PHASE_LOG.md
workspace/RUN_STATE.md
workspace/HANDOFF.md
```

## Work item ledger

| Item | Status | Verification | Commit |
|---|---|---|---|
| 0.0 Reference site audit | `VERIFIED` | Live inspection via browser tools; tokens read from computed styles; recorded in `docs/research/01-reference-site-audit.md` | `6082a63` |
| 0.1 Tooling and Git standards research | `VERIFIED` | Two web searches with sources recorded; `docs/research/02-*.md`, `docs/research/03-*.md` | `6082a63` |
| 0.2 Workspace documentation and tracking system | `COMPLETE` | All documentation files authored; brand scan clean; 13 commits, all authored and committed by the project author, no AI attribution | `81bf871`..`58e2365` |
| 0.3 Git repository initialised with author identity | `COMPLETE` | `git config --local user.name/user.email` verified; `git log --format='%an <%ae>'` shows one identity, the project author, on every commit | `81bf871` |
| 0.4 Source tree scaffolded, with the route manifest | `COMPLETE` | Route manifest, path rules and document skeleton built and unit-tested; `node --test source/tests` → 22 passed | `517f51c`..`90abe82` |
| 0.5 Development server and verification harness | `COMPLETE` | Dev server verified over HTTP: 200 on the page and the icon, 404 with our document for a miss, 301 to the canonical URL, 405 for a non-GET, traversal refused, zero console messages on load. Visually inspected at 1280 / 768 / 375 px; the recipe in `docs/TESTING_STRATEGY.md` §4 now records how to make the preview composite before capturing. | `4dcca48`+ |
| 0.6 Decision records confirmed and accepted | `COMPLETE` | ADR-001/002/003 accepted by the author, ADR-006 raised and accepted, ADR-004 and ADR-005 confirmed; all six `ACCEPTED` in `docs/ARCHITECTURE.md` | `58e2365` |

Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Accepted decisions

All six ADRs are accepted; nothing is blocked on a decision. The ones that shape the code:

| ADR | Outcome | Where it shows up |
|---|---|---|
| ADR-001 | **Zero-dependency Node static site generator**, five hundred pages generated from templates and JSON. Output ignored and rebuilt; templates in `source/pages/`; the route manifest is explicit and tested. | `source/tools/build.js`, `source/scripts/router/routes.js` |
| ADR-002 | Glossary, eleven group pages, temperature calculator, downloads, About and Contact are in scope; the reference's blog and tutoring pages are not. | Phases 8–10 |
| ADR-003 | **Plain imperative commit prose.** No `feat:`/`fix:` prefixes, no phase numbers as subjects. | every commit |
| ADR-004 | JavaScript only, zero runtime dependencies, no framework. | all of `source/` |
| ADR-005 | Facts from an openly licensed dataset via a committed transform; all prose written for this project. | Phase 2 |
| ADR-006 | **Single light theme.** No dark variant, no switcher, no `theme.css`. | Phase 1 tokens |

To change one of these, write a **new** ADR that supersedes it. Do not edit an accepted one.

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| **A browser preview that is not filling the panel produces no frames, so capture fails** | Without a screenshot the visual gate cannot run, and a phase could be closed on measured geometry alone | Resolved once and written down: resize the preview so that it fills the panel before capturing. It is step zero of the visual recipe in `docs/TESTING_STRATEGY.md` §4. A failed capture is never a passed check. |
| The element and glossary data must come from an openly licensed source and be normalised | Phase 2 cannot start without it | Source shortlist and licence notes already in `docs/DATA_SOURCES.md`; the repository layer is the only consumer, so a swap touches one module |
| Visual parity is judged by eye, which an agent does not have | Phases 1–11 could "pass" while looking wrong | Screenshot-driven verification is mandatory per phase; deviations must be recorded with a reason |
| Shipping one light theme diverges visibly from the reference's dark variant | A side-by-side review may read as a mismatch rather than a decision | Accepted deviation in ADR-006 and in the phase log; reversible without a refactor |
| Reference site copy could leak into our prose | Brand rule violation | All prose authored by us or sourced from an openly licensed dataset; the brand scan gates every phase |
| Long phases spanning sessions | Lost context | Milestone-level checkpoint updates; small commits as recovery boundaries |

## Deliberately unfinished

**Nothing.** The working tree is clean at the close-out commit, and every line of the Phase 0
close-out checklist is ticked with its evidence recorded in `progress/PHASE_LOG.md`.

The `styles/`, `data/` and most `scripts/` and `tests/` folders do not exist yet. That is a planned
stop, not an abandoned task: git does not track an empty directory, a placeholder file would be a
stub, and each folder arrives with its first real file in the phase that owns it.

## How to resume in 60 seconds

```bash
git log --oneline -20             # what has actually been committed
git status --short                # anything half-done?
cat workspace/RUN_STATE.md        # this file
node --test source/tests          # is the last checkpoint real?  expect: 22 passing
node source/tools/serve.js        # look at the site; it builds dist/ first if missing
```

Then read `workspace/progress/PHASE_LOG.md` for the phase you are in and resume from its
"Next action" line. Phase 0 is closed; Phase 1 starts at the design tokens.
