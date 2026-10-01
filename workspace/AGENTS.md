# AGENTS.md — MANDATORY ENTRY POINT

> **STOP. Read this file completely before you write, edit, delete, or commit a single line.**
> This applies to every agent, every session, every phase — including a session that only
> "quickly fixes one thing". There are no exceptions and no "small change" exemption.

This file is the door to the project. It is short on purpose. Everything it points to is
binding; the pointer is not a suggestion, it is the rule.

---

## 0. The five-minute start sequence

Do these in order. Do not skip, do not reorder.

1. **Read this file to the end.**
2. **Read [`WORKING_AGREEMENT.md`](WORKING_AGREEMENT.md)** — the full set of project rules.
   AGENTS.md is the summary; the Agreement is the law.
3. **Read [`RUN_STATE.md`](RUN_STATE.md)** — the authoritative recovery checkpoint.
   This tells you where the previous agent actually stopped.
4. **Reconstruct the real state yourself.** Never trust `RUN_STATE.md` alone.
   Check all five sources and make them agree:
   - `RUN_STATE.md`
   - `git log --oneline -20` and `git status`
   - the working tree (read the files that changed)
   - the test run (`node --test source/tests`) and the dev server
   - the current phase file in [`progress/PHASE_LOG.md`](progress/PHASE_LOG.md)
   If any two of these disagree, **the working tree wins** and you must reconcile before coding.
5. **Read [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md)** — the phase you are in,
   its deliverables, and its exit criteria.
6. **Read [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md)** — you will be committing. The rules
   there are not optional and they are not conventional-optional either; the repository history
   is part of the deliverable.
7. **Read the relevant part of [`docs/MIND_MAP.md`](docs/MIND_MAP.md)** — it tells you which file
   owns the thing you are about to change. Change the owning file, not a convenient one.

Only after all seven: start work.

---

## 1. What this project is

**ChemiPedia** — an interactive periodic table and chemistry reference website, built as a
university JavaScript course capstone.

- **Language:** JavaScript (ES modules). **No TypeScript, anywhere, ever.**
- **Markup/styling:** HTML5 + modern CSS (custom properties, grid, container queries).
- **Design reference:** `https://www.breakingatom.com/` — we match its layout, interaction
  model, motion and information architecture, **not** its brand.
- **Brand:** everything branded is ours. See [`docs/BRAND_GUIDELINES.md`](docs/BRAND_GUIDELINES.md).
- **Deliberate omissions:** the reference site's **Learn** and **Games** sections are **out of
  scope**. Do not build them, do not link to them, do not scaffold placeholder pages for them.

## 2. Non-negotiable rules (the short version)

| # | Rule |
|---|------|
| 1 | Read `AGENTS.md` → `WORKING_AGREEMENT.md` → `RUN_STATE.md` → plan → git workflow, every session. |
| 2 | `source/` holds **code only**. `workspace/` holds **everything else**. Never mix. |
| 3 | JavaScript only. No TypeScript, no framework, no runtime dependency in shipped code. |
| 4 | One page family = one folder. No file may be a "miscellaneous" dumping ground. |
| 5 | Every file you create or rename must appear in `docs/MIND_MAP.md` in the same commit. |
| 6 | Verify visually with the browser tools after every phase. A phase is not done until seen. |
| 7 | Commits: imperative, professional, human. **No AI attribution of any kind.** |
| 8 | Commit in small, coherent, stable units. Never leave a large unstable working tree behind. |
| 9 | Update `RUN_STATE.md` after every milestone, not only at the start and end. |
| 10 | When a decision is consequential and hard to reverse, write an ADR in `docs/ARCHITECTURE.md`. |

## 3. Commit identity — already configured, do not change it

Repo-local identity is set to the project author. Every commit must be authored and committed by:

```
Devansh <dhbhensdadia@gmail.com>
```

**Never** add a `Co-Authored-By:` trailer, a "Generated with" footer, an emoji footer, or any
mention of an AI assistant, agent, model, or tool. The history must read as one developer's work.
If you find such a trailer already committed, report it — do not silently rewrite history.

## 4. If you are resuming after an interruption

Assume the previous agent stopped mid-sentence. The world is probably inconsistent.

- Never assume a task is finished because it is marked "in progress" in a document.
- Never assume it is finished because the file exists — read the file.
- Trust in this order: **working tree → tests → git log → RUN_STATE.md → prose docs.**
- Before starting new work, make the repository consistent: finish or revert the half-done unit,
  commit it, and record the outcome in `RUN_STATE.md`.

Full recovery procedure: [`WORKING_AGREEMENT.md`](WORKING_AGREEMENT.md) §7.

## 5. Map of the documentation

| File | Answers the question |
|------|----------------------|
| [`WORKING_AGREEMENT.md`](WORKING_AGREEMENT.md) | What are the rules? |
| [`RUN_STATE.md`](RUN_STATE.md) | Where did we stop, and what is next? |
| [`HANDOFF.md`](HANDOFF.md) | What does the next agent need to know right now? |
| [`progress/PHASE_LOG.md`](progress/PHASE_LOG.md) | What is the status of every phase? |
| [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) | What are we building, in what order? |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | How is it put together, and why those choices? |
| [`docs/DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) | What are the exact colours, type and spacing? |
| [`docs/BRAND_GUIDELINES.md`](docs/BRAND_GUIDELINES.md) | What is ChemiPedia, and what must never appear? |
| [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md) | How do I commit this correctly? |
| [`docs/TESTING_STRATEGY.md`](docs/TESTING_STRATEGY.md) | How do I prove it works and looks right? |
| [`docs/DATA_SOURCES.md`](docs/DATA_SOURCES.md) | Where did the element and glossary data come from? |
| [`docs/MIND_MAP.md`](docs/MIND_MAP.md) | Where is everything, and what owns what? |
| [`guides/`](guides/README.md) | A developer walking another developer through the code. |
| [`docs/research/`](docs/research/) | The evidence behind our decisions. |

## 6. Decision records

Tracked as ADRs in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md). Read the ADR **before** building
anything it governs: an `ACCEPTED` ADR is binding, and superseding one requires a new ADR rather
than an edit.

| ADR | Subject | Status |
|-----|---------|--------|
| ADR-001 | Site delivery architecture: zero-dependency Node static site generator | ACCEPTED |
| ADR-002 | Page scope: glossary, group pages, calculators, downloads, about and contact | ACCEPTED |
| ADR-003 | Commit message convention: plain imperative prose | ACCEPTED |
| ADR-004 | JavaScript-only, zero-runtime-dependency constraint | ACCEPTED |
| ADR-005 | Data provenance and licensing | ACCEPTED |
| ADR-006 | Single light theme; no dark variant, no switcher | ACCEPTED |

No decisions are currently open. Add a new ADR for anything consequential and awkward to reverse.

---

*This file is owned by the project author. Amend it only with a commit that explains why.*
