# RUN_STATE.md — authoritative recovery checkpoint

> This file is the **first** thing a resuming agent reads and the **last** thing a finishing agent
> updates. It is a checkpoint, not a narrative. Keep it factual and current.
>
> **It is not sufficient on its own.** Always reconcile it with `git log`, `git status`, the
> working tree, and the tests before acting. See `WORKING_AGREEMENT.md` §7.

**Last updated:** 2026-10-06 (the session that built the temperature calculator, the downloads page
and the two secondary pages, and closed Phase 10)

---

## Current position

| Field | Value |
|---|---|
| **Phase** | Phase 10 — Calculators and secondary pages — `COMPLETE` |
| **Work item** | Phase 10 closed on the reference's calculator audited live, a temperature library converted through the one scale with an absolute zero, a calculator built from three synchronised fields, print rules shared by the table and the element cards, a downloads page whose one file target is real, About with ADR-005's provenance record, a Contact page with no form, tests for all four pages, a browser pass at three widths, and 458 green tests. Phase 11 — quality, accessibility, performance and delivery — is next |
| **Objective achieved** | The last four routes the build called waiting are built. `/calculators/temperature/` is three fields that are one number, opening on 0 °C / 32 °F / 273.15 K at build time so the page works with the script off, with the notable temperatures converted by the same functions and iron's and tungsten's melting points read from the records rather than written down. `/downloads/` answers what a reader can put on paper, and only one of its three targets is a file. `/about/` is the public face of `docs/DATA_SOURCES.md`: the two datasets, their licences, their transform scripts and their retrieval dates, written once as data and read by both the page and its test. `/contact/` says what a correction needs and where to send it, and deliberately has no form |
| **Status** | `COMPLETE`. 458 tests pass, the build renders **562 routes** plus the not-found page and reports **0 waiting**, and the four pages were exercised in one headless browser at 1280 / 768 / 375: 200 on each, 0 console messages, 0 page errors, no horizontal overflow, and every link on each page followed and answered. Print was measured by counting the pages in a rendered PDF: one sheet for the table, a table view and two element cards at A4 and Letter. The calculator differs from the reference's own by design — three synchronised fields against three one-way cards — so the harness reads 19.16% / 18.83% / 8.84%; the reference's page scrolls sideways at 375px and ours does not |
| **Current commit** | `b9999d3`, plus the close-out commit that follows. Phase 10 range: `df4d60e`..`b9999d3` |
| **Next action** | Phase 11 — the four audits Phase 10 did not own: accessibility, responsive at four widths on every page, performance, and delivery (per-page metadata, canonical, Open Graph, structured data, `sitemap.xml`, `robots.txt`, a deployment and a tag). The print stylesheet its exit criteria name already exists and was measured in Phase 10 |

## Files expected to change in the next work item

```
(Phase 11) workspace/docs/ACCESSIBILITY.md              the sweep, if it does not exist yet
workspace/docs/PERFORMANCE.md                           the measurements, if it does not exist yet
source/tools/build.js                                   sitemap.xml, robots.txt, per-page metadata
source/tools/render-document.js (or build.js)           canonical, Open Graph, structured data
source/pages/*.html, source/scripts/pages/*.js           whatever the accessibility sweep finds
source/styles/*.css                                     only if a contrast or motion finding needs it
workspace/docs/MIND_MAP.md                              in the same commit as each file
workspace/progress/PHASE_LOG.md                         the Phase 11 entry
```

The pieces that already exist and need no change: the print stylesheet and its three tokens (added
and measured in Phase 10), `source/tools/site-paths.js` for the output layout, the token layer the
contrast check reads, and the assets the metadata will point at. `IMPLEMENTATION_PLAN.md` §Phase 11
fixes the scope: the audits, the metadata, the deployment and the tag, and nothing else.

## Work item ledger

| Item | Status | Verification | Commit |
|---|---|---|---|
| 0.0–0.5 Foundation | `COMPLETE` | See the Phase 0 entry in `progress/PHASE_LOG.md` | `81bf871`..`a16d35e` |
| 1.0–1.8 Design system and shell | `COMPLETE` | See the Phase 1 entry; 51 tests at the time | `2ba459d`..`cc2151f` |
| 2.0–2.6 Data layer | `COMPLETE` | See the Phase 2 entry; the visual gate, run late, found and fixed two chrome differences | `d985245`..`97169ed` |
| 3.0–3.5 Table engine and its capture | `COMPLETE` | See the Phase 3 entry; every box measured against the reference | `bf1d8e3`..`2f06018`, `1db2fc7` |
| 4.0–4.6 Home page and the harness | `COMPLETE` | See the Phase 4 entry; table crop 2.28% at 1280px with no box differing in size | `7587a66`..`7837dce` |
| 5.0–5.6 Routing and the element pages | `COMPLETE` | See the Phase 5 entry; 278 tests, the router verified in a browser | `4763e89`..`2cd6460` |
| 6.0–6.6 Elements index and attribute rankings | `COMPLETE` | See the Phase 6 entry; the index's card grid and the ranking pages' skeletons measured live | `6cd3b14`..`44e3493` |
| 7.0–7.6 The four alternate table views | `COMPLETE` | See the Phase 7 entry; 369 tests, four pages captured and pixel-diffed | `a0b0df8`..`d1a4ad4` |
| 8.0–8.6 Element group pages | `COMPLETE` | See the Phase 8 entry; the table region 0.53% / 1.98% / 0.73% of the reference's and identical in size | `a49dd6d`..`54832b4` |
| 9.0–9.8 The glossary | `COMPLETE` | See the Phase 9 entry; 413 tests, the index 4.66% / 4.53% / 5.55% of the reference's and a term page 3.60% / 3.84% / 5.11% | `5a05a1f`..`73fbb47` |
| 10.0 The reference's calculator, downloads and secondary pages, audited live | `COMPLETE` | §3.8 records the calculator's three one-way cards, the `output` at `--step-2`, the two-decimal rounding, `273.15°K`, and the polite warning below absolute zero; the new §3.10 records that the downloads page's four targets are all out of scope and none is a file, and that About and Contact are a placeholder sentence each. `docs/research/01-reference-site-audit.md` | `df4d60e` |
| 10.1 The temperature library | `COMPLETE` | `lib/temperature.js` and `tests/lib/temperature.test.js`: the conversions at the values a textbook agrees on, the point where the two everyday scales meet, absolute zero written three ways, a round trip, and the one warning a temperature can earn | `5473e67` |
| 10.2 The calculator page | `COMPLETE` | `pages/temperature-calculator.js`: the build-time fields and table, and the wiring that makes the three fields one. `pages/temperature-calculator.html`, `styles/pages/temperature-calculator.css`, the route, the renderer and the behaviour entry | `f05c447`, `f29912c` |
| 10.3 The print rules, shared | `COMPLETE` | The print rules in `styles/components/periodic-table.css`, `styles/layout.css` and the four page sheets, plus three tokens. Measured: one sheet per table page and per sampled card at A4 and Letter | `867ce7c` |
| 10.4 The downloads page | `COMPLETE` | `pages/downloads.js` — `DOWNLOAD_TARGETS` (three, one of them a file with `download`) and `PRINT_STEPS` (four, ordered) — and `styles/pages/downloads.css` | `867ce7c` |
| 10.5 About and Contact, and ADR-005's provenance | `COMPLETE` | `pages/about.js` (`DATA_SOURCES`, `AUTHORED`, four sections) and `pages/contact.js` (`CONTACT_EMAIL`, four report parts, three destinations, no form), their templates, routes and shared sheet | `0602032` |
| 10.6 The tests for the four pages | `COMPLETE` | `tests/pages/{downloads,about,contact,temperature-calculator}.test.js`, and `tests/tools/render-template.test.js` widened to all four templates. 45 new tests | `f04ae18`, `b9999d3` |
| 10.7 The browser pass, and the two defects it found | `COMPLETE` | The four headings step down to 2.1rem below 56rem, as the glossary's do; and the downloads cards' names became `h2`, closing the `h1 → h3` hole in the page's outline | `7f8284d`, `b9999d3` |

Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Accepted decisions

All six ADRs stand; nothing is blocked on a decision. Four decisions from Phase 10 join the Phase 9
set:

| Decision | Why |
|---|---|
| **A temperature is converted through one scale, and that scale is Kelvin.** | Kelvin's zero is a fact rather than a convention, so three pairs of scales are six functions rather than nine, and a fourth scale would add two. Each scale carries its own absolute zero, which is the whole of the validation: below it a temperature is not cold but impossible. |
| **The calculator's three fields are one number, written at build time as well as run.** | The page opens on 0 °C / 32 °F / 273.15 K in the markup, so it is useful with the script off and for a crawler; the script turns the three fields into one for a reader who types. A page whose only content were computed in the browser would be blank to both. |
| **The downloads page offers pages taught to print, not a second rendering of the table.** | The plan asks for one rendering path, so the sheet a reader prints is the page they were already reading and cannot fall out of step with it. Only one of the three targets is a file, and it is the same `data/elements.json` the build ships. |
| **The provenance record is data, and the page and its test both read it.** | ADR-005 requires the attribution to be auditable. `DATA_SOURCES` in `pages/about.js` is held by `tests/pages/about.test.js` against `docs/DATA_SOURCES.md` for the dataset's name, licence, host, transform script and retrieval date — so a licence cannot change in one place and not the other. |
| **Derive a claim rather than assert it.** | Unchanged, and now applied to eight families: the calculator's two melting points are read from the element records rather than typed twice. |
| **A colour is a key, and the key-to-colour map is one stylesheet.** | Unchanged — with the glossary as the case that shows its limit, and Phase 10 adding nothing that names a colour outside `tokens.css`. |
| ADR-001..006 | Unchanged; see `docs/ARCHITECTURE.md` and the previous sessions' notes in the phase log. |

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| The preview webview does not composite | The panel's own screenshot tool may still fail; it is not on the critical path | `workspace/tools/visual` captures, diffs and measures both pages in headless Chrome. Use the panel tool first because it is cheaper, and fall back to the harness the moment it reports no frames. |
| The preview window has no operating-system focus | `focus`, `blur` and real key events are never delivered, so tab-order and hover behaviour cannot be exercised as a person would | The harness's own Playwright pages are real browsers: use them for keyboard and focus checks. Phase 10's tab-order and reduced-motion checks were run that way. |
| Three pages have no reference to compare with | About, Contact and the downloads page cannot be pixel-diffed against anything, because the reference's two are placeholders and its downloads page is out of scope and fileless | Accepted: the audit records why there is nothing to model, and the evidence for those three is the accessibility, keyboard, overflow and link checks rather than a diff. |
| **Our group band wraps to two rows at desktop** | Twelve group names do not fit the shell's 1100px in one row, so our band is 70.5px against the reference's 33px | Recorded as a deliberate deviation in `progress/PHASE_LOG.md`, with the numbers. Shortening the names would fix 1280 and still wrap at 768, so it was rejected. |
| **Nine glossary deviations, one of them an undelivered deliverable** | The plan's deliverables list an expanded explanation on a term page; the reference has none, and 418 paragraphs of new prose have no source to audit against | Recorded at the top of its deviations table in `progress/PHASE_LOG.md`. The phase's exit criteria do not ask for it, and the aside carries what the records can prove. |
| A swap is easy to get subtly wrong | The router touches the document's title, description, body, focus and scroll | `tests/router/router.test.js` holds all of them under fakes, the fragment case is one of them, and Phase 9 re-checked a real row click, a pager click and two backs in a browser |
| `covalentRadius` and `latticeParameters` are `null` for all 118 | Two rows of an element page read \"Unknown\" | Recorded in `docs/DATA_SOURCES.md`; filling them needs a third source and touches one adapter, no page. |
| The typeface is not the reference's | Every page's text measures a few per cent differently, which inflates the harness's page-level number | A Phase 1 deviation, recorded. The harness's region crops and its own `fontFamily` reading in `report.json` are how a typeface difference is told apart from a layout one. |

## Deliberately unfinished

**Nothing.** Phase 10 closed `COMPLETE` on the reference audited live, print output measured by page
count at two paper sizes, a browser pass over all four pages at three widths with the accessibility,
keyboard, reduced-motion and link checks recorded in `progress/PHASE_LOG.md`, and 458 green tests. The
working tree is clean at the close-out commit.

Deferred on purpose, as before:

1. **The plan's "expanded explanation" on a term page** — recorded as not delivered in Phase 9, with
   the reason: 418 paragraphs with no source to audit them against.
2. **Two schema fields** that no acceptable source supplies — see `docs/DATA_SOURCES.md`.
3. **A pixel comparison for three of the four Phase 10 pages** — there is no reference page to
   compare with; the audit records why.

Four routes the shell used to link while their templates were missing are now built; the build reports
**0 waiting**.

## How to resume in 60 seconds

```bash
git log --oneline -20             # what has actually been committed
git status --short                # anything half-done?
cat workspace/RUN_STATE.md        # this file
node --test source/tests          # is the last checkpoint real?  expect: 458 passing
node source/tools/build.js        # renders 562 routes, 0 waiting
node source/tools/serve.js --port 4180   # the site; the calculator is /calculators/temperature/
```

And when a page needs looking at:

```bash
cd workspace/tools/visual && npm install && \
  node compare.mjs --ours http://127.0.0.1:4180/calculators/temperature/ \
    --reference https://www.breakingatom.com/temperature-calculators \
    --label calculator --widths 1280,768,375
```

Then open `workspace/progress/PHASE_LOG.md` at Phase 10. Phase 11 next: the accessibility sweep, the
responsive audit at 375 / 768 / 1024 / 1440, the performance measurement, per-page metadata with
`canonical` and Open Graph, `sitemap.xml` and `robots.txt`, the deployment and the `v1.0.0` tag. Its
print-stylesheet criterion is already met and measured — do not build a second one.
