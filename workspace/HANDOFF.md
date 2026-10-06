# HANDOFF.md — note to the next agent

**Written:** 2026-10-06 · **By:** the session that wrote the glossary's 418 definitions, built its
index and term pages, and closed Phase 9 · **After commit:** `73fbb47` plus the close-out commit

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

A reader can now look up any word the site uses, and the two halves of the site point at each other.

- `/glossary/` — 418 rows filed under 26 letters, written at build time like every other family, with
  a rail of letters sticky down the left edge and a live filter over both the term and the
  definition. It is the one page in the project that leaves the shell on purpose, because the
  alphabet takes everything to the right of the rail.
- `/glossary/:slug` — 418 term pages behind one template: the definition, its difficulty badge, the
  way back to its letter, the terms it sits near and the elements that mention it.
- **Element pages gained "Terms in this entry"** — the other end of the same relation, so
  `/elements/hydrogen/` now links to `/glossary/proton/` and back.
- `source/scripts/lib/glossary-links.js` — the relation between a term and an element's prose, read
  from both ends by one rule. **Do not write a second implementation of it.**
- 413 tests, all passing, still with nothing to install.
- The build renders 558 routes; **4** declared routes are still waiting on their templates, all
  Phase 10's.

**Phase 9 is `COMPLETE`.** The pages were audited against the reference, captured, pixel-diffed and
measured in one headless browser at 1280 / 768 / 375: the index is 4.66% / 4.53% / 5.55% of the
reference's page and a term page 3.60% / 3.84% / 5.11%. The ledger's row, its grid, its definition
measure and its badges are the reference's measurements to the decimal.

**The browser pass paid for itself twice.** It caught both glossary headings wrapping to two lines on
a phone — the reference steps its own down below the shell — and a defect in the router older than
this phase: a browser fires `popstate` for a fragment move, and the handler answered it by
re-rendering the page the reader was already on, at the top of it. Every in-page anchor on the site
was dead with the script on; the jump rail made it visible.

**One deliverable was not delivered, and it is recorded rather than omitted:** the plan lists an
expanded explanation on a term page. The reference's own body is the definition and nothing else, and
418 further paragraphs would have no source to audit them against. It is named in the deviations
table in `progress/PHASE_LOG.md`.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **Phase 10 — the calculator, the downloads and the two secondary pages**: four templates, the four
   the build still reports as waiting. Its exit criteria include `−40 °C = −40 °F`, so the conversion
   is the first thing to get right and the first thing to test.
3. **Audit the reference's calculator and downloads pages live before writing their CSS**, as Phases
   6, 7, 8 and 9 each audited their own family first. `docs/research/01-reference-site-audit.md` §3.8
   is a sketch, not measurements.
4. `glossaryRoutes(terms)` in `source/scripts/router/routes.js` is the newest example of a generated
   family, and `pages/glossary.js` of a build-time list with a filter laid over it.

## What is fragile or easy to get wrong

- **A fragment move is not a history move, and the router has to keep telling them apart.** `pageKey`
  compares path and query and deliberately ignores the fragment, because the browser has already moved
  the reader. Take that early return out and every in-page anchor silently stops working.
- **The glossary's filter improves the build's list; it is never the source of it.** The 418 rows are
  in the document before any script runs, so the page works with the script off and for a crawler, and
  the filter only hides what does not match. Do not move the rows into the browser.
- **Every page family must declare the stylesheets it depends on**, including
  `styles/components/periodic-table.css` when it resolves a category key to a colour. The glossary is
  the exception that shows the rule's limit: it wants three group colours as values, not a key, so it
  spends `--level-*` in the token layer and declares no component sheets.
- **A family whose template is not named after its sheet has to ask for the sheet by name.** The build
  appends `styles/pages/<template>.css`, so `glossary.css` is declared on both glossary routes and
  `group.css` only by the index. Declaring it twice links it twice — this bug has been found in the
  built HTML once already.
- **The router's swap has four rules that are easy to break.** Incoming scripts are refused, the
  running ones are carried across, the arriving body's `data-page` must be copied onto the live body
  before `startPage` is called, and a failure must be handed back to the browser rather than
  half-swapped. `tests/router/router.test.js` holds all four.
- **A page's behaviour is a name, not a script.** A page earns an entry in `app.js`'s
  `PAGE_BEHAVIOUR` or it runs nothing after a swap — and an attachment must tolerate being made again
  on the same document, because that is what Back does. The glossary index has one entry for its
  filter; the 418 term pages deliberately have none.
- **A heading that is one size at every width will wrap on a phone.** The glossary's step down below
  the shell in `tokens.css`, which is where the reference's do. Check any new family at 375 before
  believing it.
- **A value is formatted through the units data or not at all**, and **no literal values live outside
  `tokens.css`** — colours, sizes, radii and durations; breakpoints are the one recorded exception.
- **The preview is unreliable in two different ways.** It may not composite, so no screenshot can be
  taken; and its window has no operating-system focus, so `focus`, `blur` and real key events are never
  delivered. Use the Playwright pages in `workspace/tools/visual`. Do not retry the panel tool a third
  time.
- **The harness compares *boxes*, not tastes.** A crop that matches in size with a few per cent of
  differing pixels is a typeface or copy difference — read `fontFamily` and the measured text before
  changing any CSS. Its region lists are tuned per family; a new family needs its own selectors, and a
  missing region is a finding rather than a failure. Remember its `finder` region is the masthead's
  search field on both sites, not a page's own filter.
- **`source/tests/brand/brand.test.js` will fail the suite** if the reference's name appears anywhere
  under `source/`, comments included. Call it "the reference".
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer. Write commit messages with `git commit -F -` and a heredoc, and stage by
  explicit path.
- **A file that is added or renamed must appear in `docs/MIND_MAP.md` in the same commit.** Build the
  full map first, stage by path, and keep the map's row for each new file with that file's commit.

## Anything deliberately left in a half state

Nothing is half-done in the tree; the working tree is clean and no gate is open. Four routes the shell
already links are still waiting on their templates — `/downloads/`, `/calculators/temperature/`,
`/about/`, `/contact/` — which is the construction state the build reports on every run. Phase 10
closes all four.

Three deferrals stand: the trade-off that left the "expanded explanation" out of Phase 9, the two
schema fields no acceptable source supplies — `covalentRadius` and `latticeParameters` — and the
typeface, which is not the reference's and is recorded as a Phase 1 deviation.
