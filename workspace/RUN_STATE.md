# RUN_STATE.md — authoritative recovery checkpoint

> This file is the **first** thing a resuming agent reads and the **last** thing a finishing agent
> updates. It is a checkpoint, not a narrative. Keep it factual and current.
>
> **It is never sufficient on its own.** Always reconcile it with `git log`, `git status`, the
> working tree, and the tests before acting. See `WORKING_AGREEMENT.md` §7.

**Last updated:** 2026-10-01 (initialisation session)

---

## Current position

| Field | Value |
|---|---|
| **Phase** | Phase 0 — Foundation, Tooling and Working System |
| **Work item** | 0.4 — Source tree scaffold |
| **Objective** | Establish the folder separation, the binding rules, the recovery system, and the phased plan before any application code exists. |
| **Status** | `IN_PROGRESS` — unblocked, awaiting the author's go-ahead to start the phase build |
| **Current commit** | `0ea045d`, plus the decision records commit that follows it |
| **Next action** | Begin work item 0.4: scaffold `source/` to the shape fixed by ADR-001, add `source/tools/serve.js` and the route manifest, verify it serves a placeholder page with zero console errors at three widths, then tag `v0.1.0` and close Phase 0. |

## Files expected to change in this work item

```
workspace/AGENTS.md
workspace/WORKING_AGREEMENT.md
workspace/RUN_STATE.md
workspace/HANDOFF.md
workspace/progress/PHASE_LOG.md
workspace/docs/**
workspace/guides/**
.gitignore
README.md
```

## Work item ledger

| Item | Status | Verification | Commit |
|---|---|---|---|
| 0.0 Reference site audit | `VERIFIED` | Live inspection via browser tools; tokens read from computed styles; recorded in `docs/research/01-reference-site-audit.md` | `6082a63` |
| 0.1 Tooling and Git standards research | `VERIFIED` | Two web searches with sources recorded; `docs/research/02-*.md`, `docs/research/03-*.md` | `6082a63` |
| 0.2 Workspace documentation and tracking system | `COMPLETE` | All documentation files authored; brand scan clean; tree clean; 11 commits, all authored and committed by the project author, no AI attribution | `81bf871`..`e4f7fc4` |
| 0.3 Git repository initialised with author identity | `COMPLETE` | `git config --local user.name/user.email` verified; `git log --format='%an <%ae>'` shows the project author on every commit | `81bf871` (init) |
| 0.4 Source tree scaffold (per ADR-001 Option A) | `NOT_STARTED` | Unblocked; ready to start | — |
| 0.5 Dev server + verification harness | `NOT_STARTED` | — | — |
| 0.6 Decision records confirmed and accepted | `COMPLETE` | ADR-001/002/003 accepted by the author, ADR-006 raised and accepted; all six now `ACCEPTED` in `docs/ARCHITECTURE.md` | this commit |

Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Decisions — resolved

All decisions are confirmed. Nothing is blocked on a decision any more.

| ADR | Question | Outcome |
|---|---|---|
| ADR-001 | Delivery architecture | **Zero-dependency Node static site generator.** The 118 element pages and 418 glossary pages are generated from one template each. Generated output is ignored and rebuilt; the dev server runs the build when `dist/` is missing; the route manifest is explicit and unit-tested. |
| ADR-002 | Page scope | **All in except the reference's blog and tutoring pages.** Glossary, eleven group pages, temperature calculator, downloads area, and About and Contact are all in scope. Phase 10 grows accordingly. |
| ADR-003 | Commit message convention | **Plain imperative prose.** No Conventional Commits prefixes. |
| ADR-006 | Themes | **Light only.** No dark variant, no switcher, no `theme.css`. Recorded as an accepted deviation from the reference. |

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| Element/glossary data must be obtained from an openly-licensed source and normalised | Phase 2 cannot start without it | Source shortlist and licence notes already recorded in `docs/DATA_SOURCES.md` |
| Visual parity is judged by eye, which an agent does not have | Phases 1–11 could "pass" while looking wrong | Screenshot-driven verification is mandatory per phase (`docs/TESTING_STRATEGY.md`) |
| Shipping one light theme diverges visibly from the reference's dark variant | A side-by-side review may read as a mismatch rather than a decision | Recorded as an accepted deviation in ADR-006 and in the phase log; it is reversible without a refactor if the author changes their mind |
| Reference site copy could leak into our prose | Brand rule violation | All prose authored by us or sourced from openly-licensed datasets; brand scan gates every phase |
| Long phases spanning sessions | Lost context | Milestone-level checkpoint updates; small commits as recovery boundaries |

## Deliberately unfinished

Nothing. The working tree is clean as of `e4f7fc4`.

The `source/` tree is intentionally empty apart from its orientation README, because ADR-001 decides
its shape and that decision is the author's. This is a planned stop, not an abandoned task — see the
open decisions table above.

## How to resume in 60 seconds

```bash
git log --oneline -10            # what has actually been committed
git status --short               # anything half-done?
cat workspace/RUN_STATE.md       # this file
node --test source/tests         # once tests exist: is the last checkpoint real?
```

`source/tests/` does not exist yet — that is expected until Phase 2. Until then, treat the commit
history and the working tree as the only evidence.

Then read `workspace/progress/PHASE_LOG.md` for the phase you are in and resume from its
"Next action" line.
