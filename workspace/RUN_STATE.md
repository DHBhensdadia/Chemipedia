# RUN_STATE.md — authoritative recovery checkpoint

> This file is the **first** thing a resuming agent reads and the **last** thing a finishing agent
> updates. It is a checkpoint, not a narrative. Keep it factual and current.
>
> **It is never sufficient on its own.** Always reconcile it with `git log`, `git status`, the
> working tree, and the tests before acting. See `WORKING_AGREEMENT.md` §7.

**Last updated:** 2026-10-01 (design system and global shell session)

---

## Current position

| Field | Value |
|---|---|
| **Phase** | Phase 1 — Design System and Global Shell — `COMPLETE` |
| **Work item** | — (the phase is closed; its exit criteria and evidence are in `progress/PHASE_LOG.md`) |
| **Objective achieved** | The visual language exists as a token layer, the layers that read it, and the chrome every page carries, all visible on one screen in the style guide. |
| **Status** | `COMPLETE`. Unit-tested, verified against the reference by measurement in the browser, and looked at at 1280 / 768 / 375 px. |
| **Current commit** | `cc2151f`, plus the close-out commit that follows it |
| **Next action** | Start **Phase 2 — the data layer**: fetch an openly licensed element dataset, write `source/tools/build-data.js` to normalise it into the documented schema, emit `data/elements.json`, `data/glossary.json`, `data/categories.json` and `data/units.json`, write the repositories that are the only readers of that JSON, and test the counts, the lookups and the category memberships. Check the licence and the retrieval date into `docs/DATA_SOURCES.md` in the same session. |

## Files expected to change in the next work item

```
source/tools/build-data.js                    the transform, committed so the data is reproducible
source/data/elements.json                     118 records against the documented schema
source/data/glossary.json                     418 terms
source/data/categories.json                   the eleven groups, with palette keys and counts
source/data/units.json                        unit definitions for the formatter
source/scripts/data/elements-repository.js    the only reader of elements.json
source/scripts/data/glossary-repository.js    the only reader of glossary.json
source/scripts/data/categories-repository.js  the only reader of categories.json
source/scripts/lib/format.js                  value and unit to display string
source/scripts/lib/slug.js                    name to slug, and back
source/tests/data/**.test.js                  counts, uniqueness, lookups, membership
source/tests/lib/**.test.js                   the formatter and the slug rules
workspace/docs/DATA_SOURCES.md                dataset, URL, licence, retrieval date
workspace/docs/MIND_MAP.md                    in the same commits, as always
workspace/progress/PHASE_LOG.md
workspace/RUN_STATE.md
workspace/HANDOFF.md
```

No route changes are expected: the element pages are declared by the data layer in Phase 5, and the
group pages in Phase 8.

## Work item ledger

| Item | Status | Verification | Commit |
|---|---|---|---|
| 0.0 Reference site audit | `VERIFIED` | Live inspection; tokens read from computed styles; `docs/research/01-reference-site-audit.md` | `6082a63` |
| 0.1 Tooling and Git standards research | `VERIFIED` | Two searches with sources; `docs/research/02-*.md`, `03-*.md` | `6082a63` |
| 0.2 Workspace documentation and tracking system | `COMPLETE` | All documentation authored; brand scan clean; no AI attribution | `81bf871`..`58e2365` |
| 0.3 Git repository initialised with author identity | `COMPLETE` | One identity, the project author, on every commit | `81bf871` |
| 0.4 Source tree scaffolded, with the route manifest | `COMPLETE` | 22 tests passing at the time; manifest, path rules and skeleton unit-tested | `517f51c`..`90abe82` |
| 0.5 Development server and verification harness | `COMPLETE` | HTTP behaviour verified; three widths captured and inspected | `4dcca48`+ |
| 0.6 Decision records confirmed and accepted | `COMPLETE` | All six ADRs `ACCEPTED` in `docs/ARCHITECTURE.md` | `58e2365` |
| 1.0 Design token layer | `COMPLETE` | 51 tests passing; no hex colour outside `tokens.css`; breakpoints recorded | `2ba459d` |
| 1.1 Base and layout layers | `COMPLETE` | Shell, rhythm and the dotted rule; prose measured by the measure | `c659417` |
| 1.2 Group-colour foreground rule | `COMPLETE` | Every group colour the stylesheet declares takes a foreground that passes AA | `10207be` |
| 1.3 HTML escaping for generated chrome | `COMPLETE` | Escapes the five characters that end a text node or an attribute | `ddc23cd` |
| 1.4 Route map carries the shell's information architecture | `COMPLETE` | Full static inventory declared; navigation order pinned by test | `6cbcc97`, `cc2151f` |
| 1.5 Shell components and their styles | `COMPLETE` | Rendered by the components themselves in the browser, with zero console messages | `fe2a113` |
| 1.6 Shell rendered by the build | `COMPLETE` | Every page carries the masthead, band and footer; unbuilt routes skipped and reported | `8d5ca6f` |
| 1.7 Style guide | `COMPLETE` | Every token and the shell components on one page; never built, never deployed | `8d5ca6f` |
| 1.8 Visual verification against the reference | `COMPLETE` | Sizes measured in both; one mismatch found and fixed; three widths captured | `1392eec` |

Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Accepted decisions

All six ADRs are accepted; nothing is blocked on a decision. The ones that shaped this session:

| ADR | Outcome | Where it shows up |
|---|---|---|
| ADR-001 | Zero-dependency Node static site generator. Output ignored and rebuilt; templates in `source/pages/`; the route manifest is explicit, and it now also carries the shell's navigation. | `source/tools/build.js`, `source/scripts/router/` |
| ADR-002 | Glossary, eleven group pages, temperature calculator, downloads, About and Contact are in scope. A group index was added inside that scope. | the manifest's inventory |
| ADR-003 | Plain imperative commit prose. No prefixes, no phase numbers. | every commit |
| ADR-004 | JavaScript only, zero runtime dependencies, no framework. | all of `source/` |
| ADR-005 | Facts from an openly licensed dataset via a committed transform; all prose written for this project. | Phase 2, next |
| ADR-006 | Single light theme, verified under a dark operating-system preference. | `source/styles/tokens.css` |

To change one of these, write a **new** ADR that supersedes it. Do not edit an accepted one.

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| **The element and glossary data must come from an openly licensed source** | Phase 2 cannot start without it, and a licence chosen carelessly is expensive to undo | Source shortlist and licence notes already in `docs/DATA_SOURCES.md`; the repository layer is the only consumer, so a swap touches one module and its tests |
| The shell links destinations whose pages are not built yet | A reader clicking through the navigation arrives at the not-found page | Accepted and recorded as a construction state. The build reports the count on every run, the not-found page is ours and links home, and the links heal themselves as templates appear |
| Visual parity is judged by eye, which an agent does not have | Later phases could pass while looking wrong | Screenshot-driven verification per phase, with the reference open in a second tab and the numbers measured in both |
| The reference's runtime dark theme is not reproduced | A side-by-side review at night shows a difference | Accepted deviation in ADR-006, and the light palette is the one the reference declares at its root |
| The reference's typeface is commercial and is not reproduced | Letterforms differ from the reference | Documented substitution; the character is matched by weight, size and tracking, which are measured against the reference rather than guessed |
| Long phases spanning sessions | Lost context | Milestone-level checkpoint updates; small commits as recovery boundaries |

## Deliberately unfinished

**Nothing is half-done.** The working tree is clean at the close-out commit.

Two items are deliberately deferred rather than abandoned, and both are recorded in the phase log:
`legend-chips` moves to the phase that has the element data its counts come from, and
`scripts/app.js` waits for the phase that has behaviour to install.

## How to resume in 60 seconds

```bash
git log --oneline -20             # what has actually been committed
git status --short                # anything half-done?
cat workspace/RUN_STATE.md        # this file
node --test source/tests          # is the last checkpoint real?  expect: 51 passing
node source/tools/serve.js        # the site; the style guide is at /styleguide/
```

Then read `workspace/progress/PHASE_LOG.md` for the phase you are in and resume from its
"Next action" line — currently Phase 2, the data layer.
