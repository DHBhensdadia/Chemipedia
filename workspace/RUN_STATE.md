# RUN_STATE.md — authoritative recovery checkpoint

> This file is the **first** thing a resuming agent reads and the **last** thing a finishing agent
> updates. It is a checkpoint, not a narrative. Keep it factual and current.
>
> **It is never sufficient on its own.** Always reconcile it with `git log`, `git status`, the
> working tree, and the tests before acting. See `WORKING_AGREEMENT.md` §7.

**Last updated:** 2026-10-02 (the session that closed the data layer and opened the table engine)

---

## Current position

| Field | Value |
|---|---|
| **Phase** | Phase 2 — Data Layer — `COMPLETE` |
| **Work item** | Phase 3 — the periodic table engine. Not started. |
| **Objective achieved** | 118 element records, fetched from two openly licensed sources, merged with authored prose, verified, readable by the shipped repositories in a browser, and now **seen** in one: the visual gate was taken, compared against the reference, and passed. |
| **Status** | `COMPLETE`. 126 tests pass. Every exit criterion is met; the only criterion that moved was the 418 glossary definitions, which are Phase 9's by recorded decision. |
| **Current commit** | `30f203b`, plus the close-out commit that follows it |
| **Next action** | Build Phase 3. Start by pulling the reference's tile markup and behaviour from the tab that is already open on it, then write `lib/grid.js` and `element-tile.js` against what the reference actually renders: a 65.367px square tile, 3px radius, `--step-0` type, `data-key` carrying the category, and `--fill` / `--on-fill` custom properties for the colour. |

## Files expected to change in the next work item

```
source/scripts/components/periodic-table.js     the 18-column grid from the element records
source/scripts/components/element-tile.js       one tile, compact and detailed
source/scripts/components/legend-chips.js       one chip per category, with its count
source/scripts/lib/grid.js                      atomic number to grid cell, from the data's position
source/scripts/lib/keyboard.js                  roving focus and arrow-key movement
source/styles/components/*.css                  one stylesheet per component, named to match
source/tests/pages/**.test.js                   tile geometry, colour mapping, keyboard movement
workspace/docs/MIND_MAP.md                      in the same commits, as always
workspace/progress/PHASE_LOG.md
workspace/RUN_STATE.md
workspace/HANDOFF.md
```

The table engine reads `elements.json` through `scripts/data/elements-repository.js` and does not
need `build-data.js` to be rerun. `position` is already precomputed for every element.

## Work item ledger

| Item | Status | Verification | Commit |
|---|---|---|---|
| 0.0–0.5 Foundation | `COMPLETE` | See the Phase 0 entry in `progress/PHASE_LOG.md` | `81bf871`..`a16d35e` |
| 1.0–1.8 Design system and shell | `COMPLETE` | See the Phase 1 entry; 51 tests at the time | `2ba459d`..`cc2151f` |
| 2.0 Datasets chosen, licences recorded | `COMPLETE` | PubChem (public domain) and Wikidata (CC0); both inside ADR-005's list | `d985245` |
| 2.1 The transform, the derivation and the element file | `COMPLETE` | `build-data.js` refuses to write anything it has not verified; 118 records, eleven category counts exact | `9460ae0` |
| 2.2 The authored notes for all 118 elements | `COMPLETE` | Five written fields per element; the build refuses a blank one and a test refuses two elements sharing a sentence | `ac0404f` |
| 2.3 The glossary contract | `COMPLETE` | Schema, repository and arrangement tested against a six-term fixture; the 418 definitions are Phase 9's | `26229e2` |
| 2.4 The data layer running in a browser | `COMPLETE` | The shipped module loaded from the built output in a real page: 118 records, lookups, formatting, 0 console messages | `26229e2` |
| 2.5 Visual gate | `COMPLETE` | **Captured, not merely measured.** Home page at 1280 / 768 / 375 px against the reference in a second tab; 0 console messages; the style guide's 18 requests all 200. Found two chrome differences, both fixed. | `30f203b` |
| 2.6 The two chrome differences the gate found | `COMPLETE` | The band's label now reads `Explore Periodic Tables:` and the band measures 33px including its rule, both matching the reference. | `30f203b` |

Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Accepted decisions

All six ADRs stand; nothing is blocked on a decision. What the last two sessions exercised:

| ADR | Outcome | Where it shows up |
|---|---|---|
| ADR-001 | The build pipeline is a committed transform plus a committed artefact: rerunnable, and readable without a network. | `source/tools/build-data.js`, `source/data/elements.json` |
| ADR-002 | The learning and games sections are out of scope, and the visual gate is where that shows: our navigation is four items where the reference's is six, so ours stays on one masthead row at 768px. | `scripts/router/navigation.js`, the deviations table in `progress/PHASE_LOG.md` |
| ADR-003 | Plain imperative commit prose; the glossary split is explained in the commit that makes it, not in a phase number. | every commit |
| ADR-004 | Zero dependencies. The transform fetches with the runtime's own `fetch`; the tests use a stand-in and never touch the network. | all of `source/` |
| ADR-005 | Two sources, both public domain or CC0. A unit that cannot be converted becomes `null` rather than a guess, because a wrong number on a page cannot be noticed and an empty one can. | `docs/DATA_SOURCES.md`, `tools/data-sources/` |
| ADR-006 | Single light theme. The reference switches to a dark variant at runtime, which is why a capture of it can come back dark; **set the reference tab to light before comparing.** | `source/styles/tokens.css` |

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| The reference is theme-adaptive and a capture can come back in its dark palette | A side-by-side done carelessly compares our light theme against its dark one, which reads as a colour catastrophe that is not there | Set the reference tab to the light colour scheme before capturing, and read the computed styles rather than trusting the pixels alone. Both were needed this session: the screenshot came back light while `getComputedStyle` resolved `prefers-color-scheme: dark`, so the two disagreed until the scheme was pinned. |
| `covalentRadius` and `latticeParameters` are `null` for all 118 | Two rows of the element page will read "Unknown" | Recorded in `docs/DATA_SOURCES.md`; filling them needs a third source and touches one adapter, no page. |
| Two datasets and a live SPARQL endpoint | A rerun of `build-data.js` depends on Wikidata being reachable and on its property values not changing | The generated file is committed, so nothing depends on the network until someone chooses to rerun the transform. First value wins where the wiki disagrees with itself, so row order cannot change the output. |
| The category taxonomy is nine corrections away from its dataset | A dataset edit could silently move an element | The corrections are explicit and per-element, and both the build and a test assert the eleven counts. |
| The 418 glossary definitions are unwritten | The glossary phase is bigger than its page work | Deliberate and recorded. The schema and the arrangement are already built and tested. |
| The shell links destinations whose pages are not built yet | A reader clicking through arrives at the not-found page | Accepted construction state; the build reports the count on every run. It is still 14. |

## Deliberately unfinished

**Nothing is half-done in the tree.** The working tree is clean at the close-out commit.

Two things are deferred on purpose:

1. **The 418 glossary definitions** — Phase 9, by recorded scope decision.
2. **Two schema fields** that no acceptable source supplies — see DATA_SOURCES.

The visual gate is no longer among them. It was blocked, it was retried first as instructed, and it
passed.

## How to resume in 60 seconds

```bash
git log --oneline -20             # what has actually been committed
git status --short                # anything half-done?
cat workspace/RUN_STATE.md        # this file
node --test source/tests          # is the last checkpoint real?  expect: 126 passing
node source/tools/build.js        # renders the ready routes into dist/
node source/tools/serve.js        # the site; /data/elements.json is served from it
node source/tools/build-data.js --dry-run   # re-verifies the data without rewriting it
```

Then read `workspace/progress/PHASE_LOG.md` for Phase 3 and resume from its exit criteria.
