# HANDOFF.md — note to the next agent

**Written:** 2026-10-01 · **By:** initialisation session · **After commit:** `0ea045d`

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

**No application code yet.** `source/` holds only an orientation README. That is the correct state:
the working system was built first, and the source tree is the first thing the next session creates.

What exists is the system that makes the build survivable:

- the folder separation and the rule that decides it,
- the binding rules (`AGENTS.md`, `WORKING_AGREEMENT.md`),
- the recovery checkpoint (`RUN_STATE.md`), the handoff note (this file) and the phase ledger
  (`progress/PHASE_LOG.md`),
- the specification: implementation plan, six accepted ADRs, design system, brand guidelines, data
  schema and provenance, commit conventions, verification standard,
- the research: reference design audit, tooling and visual verification, commit standards,
- the developer guides, including the walkthrough and the interview reference sheet,
- the mind map that indexes all of it.

## Decisions are settled — do not re-litigate them

All six ADRs are `ACCEPTED` in `docs/ARCHITECTURE.md`. The three that shaped this handoff:

| ADR | Outcome |
|---|---|
| ADR-001 | **Zero-dependency Node static site generator.** The 118 element pages and 418 glossary pages are generated from templates plus JSON. Generated output is ignored and rebuilt on demand. |
| ADR-002 | **Glossary, eleven group pages, temperature calculator, downloads, About and Contact are all in scope.** The reference's blog and tutoring pages are not. |
| ADR-003 | **Plain imperative commit prose.** No `feat:`/`fix:` prefixes. |
| ADR-006 | **Single light theme.** No dark variant, no switcher, no `theme.css`. |

To change one of these, write a **new** ADR that supersedes it. Do not edit an accepted one.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. Start **Phase 0 work item 0.4** — scaffold `source/` to the shape in `guides/02-tour-of-the-codebase.md`:
   the scripts, styles and data folders, the route manifest, and `source/tools/serve.js`.
3. Then work item 0.5: confirm the dev server serves a placeholder page with zero console errors,
   screenshot it at 1280 / 768 / 375 px, and fill in the Phase 0 close-out checklist in
   `progress/PHASE_LOG.md`.
4. Tag `v0.1.0` and set Phase 0 to `COMPLETE`.

## What is fragile or easy to get wrong

- **Branding.** Very easy to leak the reference brand into a `<title>`, an alt attribute, a CSS
  comment or a JSON field. Run the scan in `WORKING_AGREEMENT.md` §4 before every milestone commit.
- **Scope.** The learning and games sections are *deleted features*, not unfinished ones. Do not
  stub them, link to them, or leave a footer column looking short.
- **Attribution.** Repo-local git identity is `Devansh <dhbhensdadia@gmail.com>`. Do not change it, and
  never add an AI co-author or "generated with" trailer.
- **Shell quoting.** An apostrophe inside a commit message body breaks the heredoc-through-shell path
  used to write commits, because the command substitution cannot find its closing parenthesis.
  Phrase messages without contractions, or write the message to a file and use `git commit -F`.
- **The light theme is deliberate.** Do not "fix" the missing dark mode. It is ADR-006.
- **The mind map.** Only useful if updated in the same commit as the change.
- **Visual truth.** An agent cannot judge appearance by reading DOM. Screenshot it and look at it.
- **The reference site is live.** Re-open it with the browser tools when a phase needs it; do not
  trust a screenshot from an earlier session.

## Anything deliberately left in a half state

No half-finished work, and the working tree is clean. Phase 0 is `IN_PROGRESS` rather than `COMPLETE`
because two of its exit criteria — a running dev server and a verified visual check — require the
source tree that work item 0.4 has not yet created. That is recorded honestly in
`progress/PHASE_LOG.md` rather than marked done.
