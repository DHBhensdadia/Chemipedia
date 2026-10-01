# HANDOFF.md — note to the next agent

**Written:** 2026-10-01 · **By:** initialisation session · **After commit:** (see `git log -1`)

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

The repository contains **no application code**. What exists is the working system:

- `workspace/AGENTS.md` — mandatory entry point; read it first, it is binding.
- `workspace/WORKING_AGREEMENT.md` — the full rules: layout, branding, scope, quality gates,
  recovery protocol, git law.
- `workspace/RUN_STATE.md` — the recovery checkpoint.
- `workspace/docs/` — implementation plan, architecture + ADRs, design system, brand guidelines,
  data sources, git workflow, testing strategy, mind map, and `research/`.
- `workspace/guides/` — a developer explaining the project to another developer.
- `source/` — empty except for a README describing what will go there.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. The three ADRs marked `PROPOSED` in `docs/ARCHITECTURE.md` are **awaiting the author's
   decision**. Do not build `source/` until ADR-001 is `ACCEPTED` — the tree shape depends on it.
3. Then start **Phase 0, work item 0.3**: initialise Git identity and the source tree.

## What is fragile or easy to get wrong

- **Branding.** It is very easy to leave `Breaking Atom` in a `<title>`, an alt attribute, a CSS
  comment or a JSON field. Run the brand scan before every commit; the rule is in
  `WORKING_AGREEMENT.md` §4.
- **Scope.** Learn and Games are *deleted features*, not unfinished ones. Do not stub them.
- **Attribution.** Repo-local git identity is set to the author. Do not change it, and never add
  an AI co-author trailer of any kind.
- **The mind map.** It is only useful if it is updated in the same commit as the change.
- **Visual truth.** An agent cannot judge appearance by reading DOM. Screenshot it and look.

## Anything deliberately left in a half state

No. The tree is intended to be clean.
