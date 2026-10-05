# HANDOFF.md — note to the next agent

**Written:** 2026-10-06 · **By:** the session that built the eleven element group pages and closed
Phase 8 · **After commit:** `54832b4` plus the close-out commit

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

A reader can now ask what the halogens have in common, and get an answer.

- `/element-groups/:slug` for all eleven categories and `/element-groups/` over them — the family
  module, two templates and one stylesheet. Each group page is a hero in the group's colour, the
  table arriving **already isolated to that group**, its members as cards, two paragraphs on what
  the group shares, and the other ten groups as pills with a coloured dot each.
- `source/scripts/pages/group.js` — the family: the derived facts (count, atomic-number range, the
  block only where the whole group shares one, the states in member order), `GROUP_NOTES` (a lede
  and two paragraphs per group, deliberately free of counts), the member and sibling lists, and the
  index's cards.
- `source/scripts/lib/plural.js` — derives "halogens" and "noble gases" rather than storing a
  second name beside each category.
- The engine gained `isolate` and `legendLinks`, and a table written isolated now rests on its own
  `data-isolated`: pointing at a chip previews that group and moving away restores the page's group.
- 383 tests, all passing, still with nothing to install.
- The build renders 139 routes; **5** declared routes are still waiting on their templates.

**Phase 8 is `COMPLETE`.** The pages were audited against the reference, captured, pixel-diffed and
measured in one headless browser at 1280 / 768 / 375. The table region is within 0.53% / 1.98% /
0.73% of the reference's own and identical in size at all three widths. The reference's eleven
counts match ours member for member. What is left is the typeface, our taller band and the nine
recorded deviations in `progress/PHASE_LOG.md`.

**The reference audit paid for itself again.** It found that the reference publishes **no group
index at all** — `/element-groups/` is a 404 there — so `/element-groups/` is ours alone rather than
a copy; and it confirmed the exit criterion "member counts match the reference exactly" against the
reference's own numbers instead of assuming them.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **Phase 9 — the glossary**: `/glossary/` with an A–Z jump index and live filtering, and
   `/glossary/:slug` for each of the 418 terms. The schema, the repository and their tests exist
   from Phase 2; **the definitions do not** — `docs/DATA_SOURCES.md` §3 scopes writing them to this
   phase, and `progress/PHASE_LOG.md` records the scope decision that moved them here.
3. **Audit the reference's glossary pages live before writing their CSS.** §3.7 of
   `docs/research/01-reference-site-audit.md` is a sketch, not measurements. Phases 6, 7 and 8 each
   audited their own family first, and each time it changed what got built.
4. `groupRoutes(categories)` in `source/scripts/router/routes.js` is the newest example of a
   generated family, and `pages/group.js` of a family module behind several routes.

## What is fragile or easy to get wrong

- **Every page family must declare the stylesheets it depends on**, including
  `styles/components/periodic-table.css` — that sheet is where a category key becomes a colour, so a
  page of tiles, chips or bars needs it even though nothing on it is a periodic table. The group
  index is the proof: it is a page of cards and it still declares it.
- **The build appends `styles/pages/<template>.css` for the family's own template.** A route that
  declares that sheet as well links it twice. The group pages rely on the append; the index, whose
  template is `element-groups-index`, has to ask for it by name. This bug was found in the built
  HTML once already.
- **The router's swap has four rules that are easy to break.** Incoming scripts are refused, the
  running ones are carried across, the arriving body's `data-page` must be copied onto the live body
  before `startPage` is called, and a failure must be handed back to the browser rather than
  half-swapped. `tests/router/router.test.js` holds all four; the bug it was written for was silent.
- **A page's behaviour is a name, not a script.** A page earns an entry in `app.js`'s
  `PAGE_BEHAVIOUR` or it runs nothing after a swap — and an attachment must tolerate being made
  again on the same document, because that is what Back does. All eleven group pages share one name
  and one module; the index deliberately has none.
- **The legend's chips are buttons in the engine and links on a group page.** If a new family wants
  them to lead somewhere, pass `legendLinks`; if it wants them to only isolate, pass nothing. Both
  behaviours still have to coexist on the same table.
- **A value is formatted through the units data or not at all.** The card, the ranking row and the
  property panel all ask `units.json` for the unit and `lib/format.js` for the text, which is what
  keeps a measurement from reading two ways on two pages.
- **The preview is unreliable in two different ways, and both can waste a session.** It may not
  composite, so no screenshot can be taken; and its window has no operating-system focus, so `focus`,
  `blur` and real key events are never delivered. Use the Playwright pages in
  `workspace/tools/visual` for keyboard and focus checks. Do not retry the panel tool a third time.
- **The harness compares *boxes*, not tastes.** A crop that matches in size with a few per cent of
  differing pixels is a typeface or copy difference — read `fontFamily` and the two pages' text in
  `report.json` before changing any CSS. Its region selector lists are tuned to the page family; a
  new family needs its own selectors, and a missing region is a finding rather than a failure.
- **A tile's colour is a key, never a value.** Components emit `data-key` or `data-band`;
  `periodic-table.css` maps both to tokens. Do not inline a hex, and remember `color-mix()`
  percentages count as colour values too.
- **No literal values.** Colours, sizes, radii and durations go in `tokens.css`; breakpoints are the
  one recorded exception. A number that comes from the data — a tile's grid cell, a bar's ratio — is
  not a design value and may travel in a `style` attribute.
- **`source/tests/brand/brand.test.js` will fail the suite** if the reference's name appears
  anywhere under `source/`, comments included. Call it "the reference".
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer.
- **Shell quoting.** Write commit messages with `git commit -F -` and a heredoc; an apostrophe in an
  inline `-m` breaks the path. Stage by explicit path, never `git add -A`.
- **A file that is added or renamed must appear in `docs/MIND_MAP.md` in the same commit.** Build the
  full map first, stage by path, and keep the map's row for each new file with that file's commit.

## Anything deliberately left in a half state

Nothing is half-done in the tree; the working tree is clean and no gate is open. Five routes the
shell already links are still waiting on their templates — `/downloads/`,
`/calculators/temperature/`, `/glossary/`, `/about/`, `/contact/` — which is the construction state
the build reports on every run. Phase 9 closes `/glossary/`.

Two older deferrals stand: the 418 glossary definitions belong to Phase 9, and `covalentRadius` and
`latticeParameters` are `null` because no acceptable source supplies them.
