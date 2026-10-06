# HANDOFF.md — note to the next agent

**Written:** 2026-10-06 · **By:** the session that built the temperature calculator, the downloads
page and the two secondary pages, and closed Phase 10 · **After commit:** `b9999d3` plus the
close-out commit

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

Every route the site declares is built. A reader can convert a temperature, print the table, save the
data, read where it came from, and find out how to correct it.

- `/calculators/temperature/` — Celsius, Fahrenheit and Kelvin as three fields that are one number.
  The build writes all three at 0 °C / 32 °F / 273.15 K and fills the notable-temperature table, so
  the page is useful with the script off; the script adds the conversion as the reader types.
- `/downloads/` — what can be put on paper and where the data file is. Three targets, one of them a
  file.
- `/about/` — what the site is, how it is built, and the provenance record ADR-005 requires: two
  datasets with their licences, transform scripts and retrieval dates, held to
  `docs/DATA_SOURCES.md` by a test.
- `/contact/` — four parts a usable correction needs, three destinations, one address. **No form, by
  design**: a static build has no server to post to.
- Print rules shared by the table and the element cards — **one sheet** for the table, a table view
  and an element card, at A4 and Letter, measured by counting the pages in a rendered PDF.
- 458 tests, all passing, still with nothing to install.
- The build renders 562 routes; **0** declared routes are waiting on their templates.

**Phase 10 is `COMPLETE`.** The four pages were exercised in one headless browser at 1280 / 768 /
375: 200 on each, 0 console errors, no horizontal overflow, every link on every page followed and
answered, keyboard traversal complete with a visible ring on every stop, and nothing animating under
`prefers-reduced-motion`. Only the calculator has a reference page to differ from, and it differs by
design.

**The browser pass paid for itself twice, again.** It caught the same defect Phase 9 fixed for the
glossary — three of the four new headings were still at the glossary index's 3rem step and wrapped to
two lines at 375 — and a hole in the downloads page's outline, where the three card names were `h3`
with no `h2` above them. Both are fixed with a test behind the second.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **Phase 11 — quality, accessibility, performance and delivery**: the accessibility sweep, the
   responsive audit at 375 / 768 / 1024 / 1440 on *every* page, the performance measurement,
   per-page metadata with `canonical` and Open Graph plus `sitemap.xml` and `robots.txt`, the
   deployment and the `v1.0.0` tag. **Its print-stylesheet criterion is already met** — Phase 10 built
   it and measured it; do not build a second one.
3. Audit what the reference's own metadata looks like before writing ours, as every phase has audited
   its own subject first. `docs/research/01-reference-site-audit.md` has no section for it yet.
4. The accessibility sweep is the largest of the four audits and the one most likely to find real
   work: start there, on the pages with the most structure — an element page, the glossary index and
   the calculator.

## What is fragile or easy to get wrong

- **A page that can only be computed in the browser is blank to a crawler and to a reader with the
  script off.** The calculator is the newest case: every field's opening value and the whole notable
  table are written at build time, and the script only adds. Keep it that way.
- **A number that appears on two pages must come from one place.** The calculator's iron and tungsten
  melting points are read from the element records; a page stating a number the element's own page
  contradicts is the defect Phase 6 found.
- **A heading that is one size at every width will wrap on a phone.** The glossary's and the four
  secondary pages' step down below 56rem in `tokens.css`; the element pages' name takes its larger
  step above it. Check any new family at 375 before believing it, and check the outline does not skip
  a level while you are there.
- **The downloads page must not offer a target the build does not produce.** `tests/pages/downloads.
  test.js` holds a route target to the manifest and a file target to the disk; add a target without a
  test and the page can promise a download that 404s.
- **`DATA_SOURCES` and `docs/DATA_SOURCES.md` are one record in two places**, and a test holds them
  together. Change a licence in one and the suite tells you about the other.
- **A family whose template is not named after its sheet has to ask for the sheet by name.** The build
  appends `styles/pages/<template>.css`, so `contact` declares `styles/pages/about.css` and the
  `about` route does not. Declaring it twice links it twice — this bug has been found in the built
  HTML once already.
- **Every page family must declare the stylesheets it depends on**, including
  `styles/components/periodic-table.css` when it resolves a category key to a colour.
- **A page's behaviour is a name, not a script.** A page earns an entry in `app.js`'s
  `PAGE_BEHAVIOUR` or it runs nothing after a swap, and an attachment must tolerate being made again
  on the same document. The calculator has one entry; downloads, about and contact deliberately have
  none.
- **The router's swap has four rules that are easy to break.** Incoming scripts are refused, the
  running ones are carried across, the arriving body's `data-page` must be copied onto the live body
  before `startPage` is called, and a failure must be handed back to the browser rather than
  half-swapped. `tests/router/router.test.js` holds all four.
- **A value is formatted through the units data or not at all**, and **no literal values live outside
  `tokens.css`** — colours, sizes, radii and durations; breakpoints are the one recorded exception.
- **The preview is unreliable in two different ways.** It may not composite, so no screenshot can be
  taken; and its window has no operating-system focus, so `focus`, `blur` and real key events are never
  delivered. Use the Playwright pages in `workspace/tools/visual`. Do not retry the panel tool a third
  time.
- **The harness compares *boxes*, not tastes.** A crop that matches in size with a few per cent of
  differing pixels is a typeface or copy difference — read `fontFamily` and the measured text before
  changing any CSS. A page with no reference counterpart has no diff to read; its evidence is the
  accessibility, keyboard, overflow, link and print checks instead.
- **`source/tests/brand/brand.test.js` will fail the suite** if the reference's name appears anywhere
  under `source/`, comments included. Call it "the reference".
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer. Write commit messages with `git commit -F -` and a heredoc, and stage by
  explicit path.
- **A file that is added or renamed must appear in `docs/MIND_MAP.md` in the same commit.** Build the
  full map first, stage by path, and keep the map's row for each new file with that file's commit.

## Anything deliberately left in a half state

Nothing is half-done in the tree; the working tree is clean and no gate is open. One pixel comparison
is deliberately absent: three of Phase 10's four pages have no reference page to compare with, because
the reference's About and Contact are placeholders and its downloads page is out of scope and offers no
file. The audit records that, and the evidence for those three is the accessibility, keyboard, overflow,
link and print checks.

Three deferrals stand: the trade-off that left the "expanded explanation" out of Phase 9, the two
schema fields no acceptable source supplies — `covalentRadius` and `latticeParameters` — and the
typeface, which is not the reference's and is recorded as a Phase 1 deviation.
