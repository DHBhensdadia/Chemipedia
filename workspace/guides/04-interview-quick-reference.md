# Guide 4 — Interview quick reference

> **Living document.** Rows are filled in as each phase lands. A row marked *(pending)* is not yet
> implemented — do not claim it in an interview until it is. Every row must name a real file and a
> real function, and the answer must match the code.

Two ways to use this. **Before an interview**, read the "Thirty-second pitch" and the top ten rows.
**During preparation**, pick a question, open the file it names, and read the code until you can
explain it without the file.

---

## The thirty-second pitch

> "It's a periodic table reference site built in plain JavaScript — no framework, no dependencies.
> The home page is an 18-column grid of all 118 elements that you can recolour by group, orbital
> block, state, or by any numeric property. Each element has its own page with its full property
> set, electron configuration, uses and discovery history. There are 118 element pages and 418
> glossary pages, and they're generated from JSON data through one template each, so the codebase
> stays small. The state and routing are hand-written, and the trickiest parts — place the f-block
> correctly, map a numeric property onto a colour scale, and make a 118-cell grid keyboard
> navigable — are isolated in pure modules with unit tests."

## If asked "walk me through your architecture"

Four layers, each talking only to the one below: **pages → components → repositories → data**, plus a
`lib/` of pure helpers used from anywhere. Say why: the table appears on five page families in four
colour modes, so it had to be written once; only repositories touch raw JSON so the dataset is
replaceable; `lib/` is pure so the hard maths is testable without a browser. Full detail in
`workspace/guides/02-tour-of-the-codebase.md`.

---

## Where is … ?

| Question | File | Function / symbol |
|---|---|---|
| Where do you get the element data? | `source/scripts/data/elements-repository.js` | *(pending — Phase 2)* |
| Where is the raw data? | `source/data/elements.json` | — |
| How do you look up an element by symbol? | `elements-repository.js` | *(pending)* `bySymbol()` |
| How do you get all elements in a group? | `elements-repository.js` | *(pending)* `byCategory()` |
| How do you sort elements by melting point? | `elements-repository.js` | *(pending)* `sortedBy()` |
| Where is the grid position maths? | `source/scripts/lib/grid.js` | *(pending)* `positionOf()` |
| Where do you handle the lanthanide offset? | `source/scripts/lib/grid.js` | *(pending)* `fBlockOffset()` |
| How do you choose text colour on a tile? | `source/scripts/lib/contrast.js` | *(pending)* `foregroundFor()` |
| How does the electronegativity colour scale work? | `source/scripts/lib/colour-scale.js` | *(pending)* `createScale()` |
| How do you format `null` properties? | `source/scripts/lib/format.js` | *(pending)* `formatValue()` |
| How does arrow-key navigation work? | `source/scripts/lib/keyboard.js` | *(pending)* `rovingFocus()` |
| Where's the periodic table component? | `source/scripts/components/periodic-table.js` | *(pending)* `PeriodicTable` |
| How does group hovering isolate a group? | `periodic-table.js` + its stylesheet | *(pending)* — one class on the container; CSS does the fading |
| How does the electron shell diagram get drawn? | `source/scripts/components/shell-diagram.js` | *(pending)* `draw()` — generated SVG, not an image |
| How are the FAQ answers generated? | `source/scripts/components/faq-block.js` | *(pending)* `fromElement()` |
| Where do the routes live? | `source/scripts/router/routes.js` | *(pending)* `routes` |
| How do you handle a deep link into a static host? | `source/scripts/router/router.js` | *(pending)* — each route is a real built file |
| Where are the design tokens? | `source/styles/tokens.css` | — |
| Why is there only one theme? | `workspace/docs/ARCHITECTURE.md` | ADR-006 — light only, by decision |
| Where's the dev server? | `source/tools/serve.js` | — |
| Where does the data build script live? | `source/tools/build-data.js` | — |
| How do I find any file in this project? | `workspace/docs/MIND_MAP.md` | — |

---

## Likely questions, and the honest answers

**"Why no framework?"**
Because the point of the project is the JavaScript. React would have done the rendering, the routing
and the state, and the interesting parts — grid placement for the f-block, colour scale
interpolation, keyboard navigation across 118 cells — would have been behind an abstraction I did not
write. Hand-writing them is the deliverable. It also means zero dependencies, so the site cannot
break because a package was abandoned.

**"Why is there a build step if you have no dependencies?"**
Because 118 element pages and 418 glossary pages should not be 536 hand-written files. The build
script is plain Node — it takes a template, asks a page module for the content, and writes finished
HTML. The output is a static site, so deep links, print, and search engines all work, and the site
degrades to plain multi-page HTML if JavaScript fails.

**"Why JavaScript and not TypeScript?"**
It's a JavaScript course project, and the brief was JavaScript. Types are covered by tests on the
pure modules — the parts where a wrong type actually causes a wrong answer.

**"How do you place the lanthanides and actinides?"**
They have no group number, so `period`/`group` alone cannot position them. They get an explicit
offset table and are placed into two detached rows at the bottom of the grid. It's isolated in
`lib/grid.js` and unit-tested against every single f-block element, because it is the easiest thing
in the project to get subtly wrong.

**"How do you colour the tiles?"**
Group colours are fixed CSS custom properties, set per tile as `--fill` with a matching `--on-fill`
chosen for contrast — so a pale group gets dark ink and a dark group gets cream, and no component
hard-codes a colour. For the numeric views, `lib/colour-scale.js` maps a property's domain onto a
colour and clamps out-of-range values.

**"How do you test something visual?"**
Unit tests cover the logic. Structure is checked by reading the accessibility tree. Appearance is
checked by screenshotting at 1280, 768 and 375 pixels and comparing against the reference — and by
actually looking at the screenshots. Measured values like colours and sizes are read from computed
styles rather than guessed. The full procedure is in `docs/TESTING_STRATEGY.md`.

**"What's the hardest bug you hit?"**
Tell the truth, and name the file. Likely candidates, based on the design: the f-block row offset;
ensuring the table's empty top cells keep their size instead of collapsing; keeping the foreground
colour readable across eleven very different group colours; making the 118-tile grid keyboard
navigable without a tab stop per tile.

**"Where does your content come from?"**
Facts come from an openly licensed structured dataset, transformed by a committed script. Prose is
written by me. Provenance and licences are recorded in `docs/DATA_SOURCES.md`. Nothing is copied from
the site whose design I reproduced — that site's text is not a source.

**"Is this a copy of that site?"**
The design language is reproduced deliberately — the grid, the rhythm, the dotted rule, the motion,
the information architecture. The product is mine: different brand, different wordmark, my own prose,
my own data pipeline, and two whole sections removed. The boundary is written down in
`docs/BRAND_GUIDELINES.md` and enforced by an automated scan before every milestone commit.

**"What would you do differently?"**
Good answers exist and should be specific. Candidates: build the data layer before the design layer,
because the data shape constrains everything; or write the style guide page before any real page, so
tokens get exercised before they get copied.

---

## Things to be able to demonstrate live

Four, in this order, because each one gets harder than the last:

1. **Hover a legend chip** on the home page — the group isolates in the table. One class on one
   element; CSS does the rest. Shows you avoided the naive per-tile JavaScript.
2. **Open an element page** and point at where its FAQ answers and its property list read from the
   same record. Shows derived content is computed, not copied.
3. **Open `lib/grid.js` and its test file** and show the f-block offset being asserted for all 30
   lanthanides and actinides. Shows the hard part is isolated and proven.
4. **Resize to 375 px and scroll the table.** Then enable reduced motion. Shows the responsive and
   accessibility work, which is usually where a student project stops.
