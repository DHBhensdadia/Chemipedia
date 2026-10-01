# HANDOFF.md — note to the next agent

**Written:** 2026-10-01 · **By:** initialisation session · **After commit:** `e4f7fc4`

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

**No application code.** The repository contains the working system and its documentation, and
`source/` holds only an orientation README. That is deliberate — see below.

Eleven commits, in order:

```
81bf871  Initialise the repository with ignore rules and a project README
0074445  Define the source tree boundary between shipped code and documentation
68e1fed  Establish the working agreement that governs every development session
6eb2e48  Add a checkpoint system so interrupted work can be resumed safely
6082a63  Research the reference design, verification tooling and commit conventions
e3f6f58  Plan the phased build and record its architecture decisions
898aa74  Define the design token layer and the brand boundary
9a1dd43  Specify the element data schema and record its provenance
2414ba0  Set the verification standard and the commit conventions
3de07ad  Index every project file in a maintained mind map
e4f7fc4  Write developer guides that explain the project and its codebase
```

Working tree is clean. All eleven commits are authored and committed by the project author, with no
AI attribution anywhere.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **Read the three proposed ADRs in `docs/ARCHITECTURE.md`.** They are awaiting the author:

| ADR | Question | Blocks |
|---|---|---|
| ADR-001 | Delivery architecture: zero-dependency Node static site generator, plain multi-page static HTML, or a client-side router | The entire `source/` tree shape. Work items 0.4 and 0.5. |
| ADR-002 | Which supplementary page families to include (glossary, calculators, group pages, downloads, about/contact) | Phases 9–10 scope |
| ADR-003 | Commit message convention: plain imperative prose, or Conventional Commits with scopes | Every future commit |

3. **Do not scaffold `source/` until ADR-001 is `ACCEPTED`.** Everything downstream depends on it.
4. Once accepted: mark the ADR `ACCEPTED`, record the choice in `RUN_STATE.md`, then start work item
   0.4 — scaffold the source tree, add `source/tools/serve.js`, verify it serves a placeholder page
   with zero console errors, and tag `v0.1.0`.

## What is fragile or easy to get wrong

- **Branding.** Very easy to leak `Breaking Atom` into a `<title>`, an alt attribute, a CSS comment
  or a JSON field. Run the scan in `WORKING_AGREEMENT.md` §4 before every milestone commit.
- **Scope.** Learn and Games are *deleted features*, not unfinished ones. Do not stub them, link to
  them, or leave a footer column looking short.
- **Attribution.** Repo-local git identity is set to `Devansh <dhbhensdadia@gmail.com>`. Do not change
  it, and never add an AI co-author or "generated with" trailer of any kind.
- **Shell quoting.** Apostrophes inside a commit message body break the heredoc-through-shell path
  used to write commits, because the command substitution cannot find its closing parenthesis.
  Phrase messages without contractions, or write the message to a file and use `git commit -F`.
- **The mind map.** Only useful if updated in the same commit as the change.
- **Visual truth.** An agent cannot judge appearance by reading DOM. Screenshot it and look at it.
- **The reference site is still live.** Re-open it with the browser tools when a phase needs it; do
  not rely on a screenshot from an earlier session.

## Anything deliberately left in a half state

No half-finished work. One deliberate stop: Phase 0 is `IN_PROGRESS`, not `COMPLETE`, because two of
its exit criteria — a running dev server and a verified visual check — cannot be met until ADR-001
decides the source tree shape. That is recorded honestly in `progress/PHASE_LOG.md` rather than
marked done.
