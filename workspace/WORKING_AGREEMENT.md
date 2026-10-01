# Working Agreement — ChemiPedia

**Status:** binding · **Owner:** Devansh (project author) · **Applies to:** every agent, every session

`AGENTS.md` is the door. This document is the law behind it. If a future instruction, prompt,
habit or "obvious optimisation" conflicts with anything written here, **this document wins** and
the conflict must be raised with the author rather than resolved silently.

---

## 1. How to begin every session

Non-negotiable, in order:

1. Read `AGENTS.md` end to end.
2. Read this file end to end.
3. Read `RUN_STATE.md`.
4. Reconstruct the actual state from the five sources listed in `AGENTS.md` §0.4 and make them agree.
5. Read the current phase in `docs/IMPLEMENTATION_PLAN.md` and `progress/PHASE_LOG.md`.
6. Read `docs/GIT_WORKFLOW.md`.
7. Consult `docs/MIND_MAP.md` to find the owning file before editing anything.

A session that has not done this has not started. If context is tight, read the plan section for
the current phase only — but never skip steps 1–4.

---

## 2. Repository layout — the hard separation

```
WDW/
├── source/       ← CODE ONLY. Nothing that is not shipped code.
└── workspace/    ← EVERYTHING ELSE. Plans, research, docs, guides, logs, reference material.
```

**`source/` must never contain** a plan, a note, a research dump, a screenshot of the reference
site, a scratch file, a TODO list, or a JSON file whose only purpose is bookkeeping.

**`workspace/` must never contain** application code, page templates, stylesheets, or component
modules. Documentation may *quote* code; it may not *be* code.

If a file is ambiguous, ask: *does the browser load it?* If yes → `source/`. If no →
`workspace/`. There is no third answer and no "shared" folder.

### 2.1 Source layout rules

- One **page family** = one top-level folder under `source/`. A page family is a group of URLs
  that share a template, e.g. all 118 element pages are one family.
- One **component** = one module, in `source/scripts/components/`, with its own stylesheet in
  `source/styles/components/` of the same name.
- Shared behaviour never lives in a page file. If two pages need it, it is a module.
- No file may exceed **400 lines**. If it does, split it by responsibility and say so in the commit.
- No file may be named `utils.js`, `helpers.js`, `misc.js`, `common.js`, or `main.js` beyond the
  single genuine entry point. A file must be named after the single thing it owns.

---

## 3. Technology constraints

| Constraint | Detail |
|---|---|
| Language | JavaScript, ES modules, `"use strict"` semantics. |
| **Forbidden** | TypeScript, `.ts`/`.tsx`, JSDoc-typedef-only pseudo-typing that implies a TS codebase. |
| Frameworks | None. No React, Vue, Svelte, jQuery, Alpine, Tailwind, Bootstrap. |
| Runtime dependencies | Zero. Nothing in `source/` may require `npm install` to run in a browser. |
| Build tooling | Permitted only if plain Node.js and dependency-free. Preferred: none. |
| CSS | Hand-written, modern. Custom properties, `clamp()`, grid, logical properties. |
| HTML | Semantic. Landmarks, headings in order, `aria-*` only where semantics fall short. |

Rationale and the full argument live in ADR-004 (`docs/ARCHITECTURE.md`). The course is a
JavaScript course; the grader must be able to open the source and read JavaScript.

---

## 4. Branding rules — "the same, but ours"

The project is a **faithful structural replica** of the reference design language. It must **not**
look like a lifted copy of the reference *brand*.

Must be replaced everywhere (code, markup, meta tags, filenames, data, comments):

| Reference brand | Ours |
|---|---|
| Breaking Atom / BreakingAtom | **ChemiPedia** |
| `breakingatom.com` | our own domain / local paths |
| Reference logo lockup | our own wordmark + mark |

Must be **preserved**: layout, grid, spacing rhythm, colour relationships, typography *character*,
motion timing, component behaviour, information architecture, content categories.

**Forbidden in `source/`, in any form** — including inside comments, test fixtures, page titles,
`<meta>` tags, alt text, and data files:

- the strings `breaking atom`, `breakingatom`, `Breaking Atom`
- any link to `breakingatom.com`
- the reference site's logo, favicon, or any of its image assets
- the reference site's prose. Prose is **written by us** or sourced from the openly-licensed
  sources recorded in `docs/DATA_SOURCES.md`.

Before every phase-completion commit, run the brand scan described in `docs/TESTING_STRATEGY.md`
and paste its output into that phase's entry in `progress/PHASE_LOG.md`. A non-empty result blocks
the commit.

---

## 5. Scope rules

**In scope:** the periodic table, elements index, element detail pages, alternate table views
(properties/states, orbitals, electronegativity, evolution), element group pages, glossary,
temperature calculators, and the interactive/visual behaviour that ties them together.

**Explicitly out of scope — do not build, scaffold, stub, or link:**

- the reference site's **Learn** section (courses, tracks, articles, tutoring)
- the reference site's **Games** section (quizzes, flash cards, find-the-element)

Navigation must not contain a Learn or Games item. Do not create a route, a placeholder page, a
"coming soon" panel, or a disabled menu entry for them. Their absence is a product decision, not
an unfinished task. Footer columns must be re-cut so that no column looks like it lost two entries.

---

## 6. Quality gates

A unit of work is complete only when **all** of the following hold. "It looks fine to me" is not
a gate.

1. **It runs.** The dev server starts, the page loads, zero console errors, zero failed requests.
2. **It is typed-checked as far as JS allows** — i.e. `node --check` passes on every module.
3. **It is tested.** Data transforms, routing and pure logic have unit tests under `source/tests/`.
   New logic without a test is unfinished work.
4. **It is seen.** A screenshot at desktop, tablet and mobile width has been taken and compared
   against the reference. Layout, spacing, colour, and motion match. Recorded in the phase log.
5. **It is accessible.** Keyboard reachable, visible focus, sensible heading order, contrast
   passes WCAG AA, and `prefers-reduced-motion` is honoured.
6. **It is branded.** The brand scan is clean.
7. **It is documented.** `docs/MIND_MAP.md` lists every new or renamed file in the same commit.
8. **It is committed.** In small, coherent commits, with professional messages, by the correct author.

A phase is not finished until **every** gate above passes for **every** deliverable in that phase.

---

## 7. Interruption, recovery and continuity

This project is built in phases across many sessions. Connections drop, context runs out,
processes are killed. The system must survive that, and the next agent must be able to pick up
without guessing.

### 7.1 The checkpoint file

`RUN_STATE.md` is the authoritative recovery checkpoint. It records:

- current phase and current work item
- the objective of that work item
- files expected to change
- current Git commit hash
- execution status (`NOT_STARTED` / `IN_PROGRESS` / `BLOCKED` / `VERIFIED` / `COMPLETE`)
- known risks, blockers, and anything half-finished on purpose

It is updated **after every meaningful milestone**, not only at the start and end of a session.
A milestone is: a component rendered, a test written and passing, a page visually verified, a
commit made.

### 7.2 Git commits as recovery boundaries

Whenever a stable logical unit of work is complete, **commit it**. Do not leave a large amount of
unrelated, unfinished work uncommitted when a stable checkpoint can reasonably be created. The
rule is not "commit often", it is "never leave the repository in a state another developer could
not resume from".

### 7.3 The recovery rule

> If execution stops unexpectedly, the next agent must first reconstruct the actual state from
> `RUN_STATE.md`, Git history, `git status`, the working tree, tests, and the existing source
> files. Never assume the previous agent finished a task merely because the task was recorded as
> in progress. A completed checkpoint must explicitly record its completion status, its
> verification result, the relevant commit hash, and the next action.

Corollary rules the next agent must follow:

- Trust order: **working tree → tests → `git log` → `RUN_STATE.md` → prose documentation.**
- Uncommitted changes that belong to the previous agent's work item are **finished or reverted**,
  never discarded silently and never committed alongside unrelated work.
- If `RUN_STATE.md` claims `VERIFIED` but the tests fail or the screenshot does not match, the
  claim is **wrong**. Fix the state, then correct the checkpoint, and note the correction.
- If two documents contradict each other, that contradiction is itself a defect: resolve it in
  the same session and record the resolution.

### 7.4 The handoff file

`HANDOFF.md` is the short, human-readable note to whoever comes next: what changed, what is
fragile, what to do first. It is rewritten at the end of every session and is never allowed to be
older than the last commit.

---

## 8. Git and GitHub rules

Full detail in `docs/GIT_WORKFLOW.md`. The laws:

1. **Author and committer:** `Devansh <dhbhensdadia@gmail.com>`. Set repo-locally. Never change it.
2. **No AI attribution.** No `Co-Authored-By`, no "Generated with", no emoji footers, no mention
   of any assistant, agent, model or tool in any commit message, branch name, PR body, or comment.
3. **No phase numbers as commit subjects.** `Add phase 3` is a violation. A commit subject states
   what the software now does.
4. **Imperative mood, ≤ 72 characters, no trailing period, capitalised.** Body wrapped at 72
   characters, explaining *why*, separated from the subject by a blank line.
5. **Several commits per phase.** A phase is decomposed into coherent units — data, then
   component, then page, then tests, then docs. One giant commit per phase is a violation.
6. **Atomic.** One commit = one logical change. It should build and pass tests on its own.
7. **No secrets.** No tokens, keys, personal paths, or credentials, ever.
8. **Do not rewrite published history.** No force-push to `main` without the author's explicit,
   in-the-moment instruction.
9. **Branches:** short-lived, one per phase or per substantial unit, named `feature/...`,
   `fix/...`, `docs/...`, `refactor/...`. Merged with `--no-ff` so the phase remains visible.

---

## 9. Documentation rules

- **`docs/MIND_MAP.md` is kept current or it is worthless.** Every file added, renamed, moved or
  deleted is reflected there in the same commit. A stale mind map is a defect.
- **`docs/ARCHITECTURE.md` carries ADRs.** When a decision is consequential and hard to reverse,
  write an ADR: context, options considered, decision, consequences. Mark it `PROPOSED`, then
  `ACCEPTED` once the author confirms.
- **`guides/` is written for a human.** Plain language, no assumed context, one idea per file.
  It is the author's answer to "explain your codebase" and it must stay true to the code.
- **Research lives in `docs/research/`** with the sources that produced it.
- Docs are updated **in the same commit** as the change they describe. Never "later".

---

## 10. Testing and visual verification rules

- A **phase is not complete until it has been visually verified.** Navigate to the built page,
  take screenshots at ≥1280px, 768px and 375px, read the accessibility tree, and check the
  console. Compare against the reference site for layout, spacing, colour and motion.
- Where the reference and our build differ, either fix our build or record the deviation and the
  reason in the phase log. Silent deviation is a defect.
- **Test everything at the end of every phase**, not only the new surface. Regressions in earlier
  phases are found here.
- Never mark a visual check as done without having actually captured and looked at the screenshot.
- Never claim a test passes without the command output in the session.

---

## 11. Definition of done for the project

- Every in-scope page family implemented and visually matched.
- All unit tests green; zero console errors anywhere.
- Brand scan clean; Learn and Games entirely absent.
- `AGENTS.md`, `WORKING_AGREEMENT.md`, `RUN_STATE.md`, `HANDOFF.md`, `docs/MIND_MAP.md`,
  `docs/IMPLEMENTATION_PLAN.md` and `guides/` all current and accurate.
- Git history reads as a single experienced developer's work, phase by phase, no AI traces.
- A README that a stranger can follow from `git clone` to running site.

---

*Amend this document only with a commit that explains why. Amendments do not apply retroactively:
if a rule changes, say in the commit which earlier work needs revisiting.*
