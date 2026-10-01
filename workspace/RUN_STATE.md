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
| **Work item** | 0.2 — Workspace documentation and tracking system |
| **Objective** | Establish the folder separation, the binding rules, the recovery system, and the phased plan before any application code exists. |
| **Status** | `IN_PROGRESS` |
| **Current commit** | see `git log -1 --format='%h %s'` (updated on each commit) |
| **Next action** | Confirm ADR-001/002/003 with the author, then scaffold `source/` per the accepted architecture. |

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
| 0.0 Reference site audit | `VERIFIED` | Live inspection via browser tools; tokens extracted from computed styles | pending |
| 0.1 Tooling and Git standards research | `VERIFIED` | Two web searches; findings recorded in `docs/research/` | pending |
| 0.2 Workspace documentation and tracking system | `IN_PROGRESS` | Files authored; not yet committed | pending |
| 0.3 Git repository initialisation and identity | `NOT_STARTED` | — | — |
| 0.4 Source tree scaffold (per accepted ADR-001) | `NOT_STARTED` | — | — |
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

Nothing. The working tree is expected to be clean at every checkpoint. If it is not, that is a
defect and the resuming agent must resolve it before starting new work (`WORKING_AGREEMENT.md` §7.3).

## How to resume in 60 seconds

```bash
git log --oneline -10            # what has actually been committed
git status --short               # anything half-done?
cat workspace/RUN_STATE.md       # this file
node --test source/tests         # is the last checkpoint real?
```

Then read `workspace/progress/PHASE_LOG.md` for the phase you are in and resume from its
"Next action" line.
