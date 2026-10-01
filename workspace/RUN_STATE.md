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
| **Work item** | 0.4 — Source tree scaffold (blocked) |
| **Objective** | Establish the folder separation, the binding rules, the recovery system, and the phased plan before any application code exists. |
| **Status** | `BLOCKED` on ADR-001 |
| **Current commit** | `e4f7fc4` (documentation set complete; see range below) |
| **Next action** | Author confirms ADR-001 (delivery architecture), ADR-002 (page scope) and ADR-003 (commit convention). Then begin work item 0.4: scaffold `source/` to the accepted shape, add `source/tools/serve.js`, and tag `v0.1.0`. |

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
| 0.4 Source tree scaffold (per accepted ADR-001) | `BLOCKED` | Awaiting ADR-001 | — |
| 0.5 Dev server + verification harness | `NOT_STARTED` | — | — |

Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Open decisions blocking progress

| ADR | Question | Blocks | Status |
|---|---|---|---|
| ADR-001 | Delivery architecture: zero-dependency Node SSG, plain multi-page static, or client-side SPA router | The entire `source/` tree shape | `PROPOSED` — awaiting author |
| ADR-002 | Which supplementary page families to include (glossary, calculators, group pages, downloads/about/contact) | Phase 9–10 scope | `PROPOSED` — awaiting author |
| ADR-003 | Commit message convention | All commits | `PROPOSED` — awaiting author |

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| Element/glossary data must be obtained from an openly-licensed source and normalised | Phase 2 cannot start without it | Source shortlist and licence notes already recorded in `docs/DATA_SOURCES.md` |
| Visual parity is judged by eye, which an agent does not have | Phases 1–11 could "pass" while looking wrong | Screenshot-driven verification is mandatory per phase (`docs/TESTING_STRATEGY.md`) |
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
