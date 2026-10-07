# Guide 4 — Interview quick reference

> **Complete as of `v1.0.1`, with the atom viewer on `feature/atom-3d`.** Every row names a real file
> and a real function, and the function name is the one the code actually exports. If a row here and
> the code disagree, the code is right and this file is a defect — fix it in the same commit.

Two ways to use this. **Before an interview**, read the "Thirty-second pitch" and the top ten rows.
**During preparation**, pick a question, open the file it names, and read the code until you can
explain it without the file.

---

## The thirty-second pitch

> "It's a periodic table reference site built in plain JavaScript — no framework, no dependencies,
> nothing to install to build it or test it. The build writes 562 pages: 118 element pages, 418
> glossary terms, the group and ranking pages, the alternate table views, a temperature calculator
> and four secondary pages. Everything a reader is meant to read is rendered at build time, so the
> pages work with the script off and a crawler sees them; the browser only attaches behaviour to
> markup that is already there. The trickiest parts — computing where each element sits, mapping a
> numeric property onto a colour scale, and stepping a focus ring across a 118-cell grid — are
> isolated in pure modules with unit tests. There are 482 tests, and four browser sweeps behind the
> accessibility, responsive, performance and Lighthouse numbers.
>
> On the branch that adds it: **563 pages and 658 tests**, and one more page — `/atoms/`, which draws
> any element's atom in three dimensions. That one is hand-written WebGL2: matrices, a spherical
> camera, mesh generation and a point distribution, all under `lib/` so they are testable in Node,
> and a drawing layer proved by reading the pixels back out of the canvas. No library, still no
> dependency, and the page a reader without WebGL sees is the element's own shell diagram."

## If asked "walk me through your architecture"

Four layers, each talking only to the one below: **pages → components → repositories → data**, plus a
`lib/` of pure helpers used from anywhere. Say why: the table appears on three page families in five
colour modes, so it had to be written once; only repositories touch raw JSON, so the dataset is
replaceable; `lib/` is pure, so the hard maths is testable without a browser. And the build sits
beside the browser rather than behind it: a page family is a module that both `tools/build.js` calls
at build time and `scripts/app.js` calls after a swap, which is what keeps one rendering path for
both. Full detail in `workspace/guides/02-tour-of-the-codebase.md`.

---

## Where is … ?

| Question | File | Function / symbol |
|---|---|---|
| Where do you get the element data? | `source/scripts/data/elements-repository.js` | `createElementsRepository()` → `all()`, `count()`, `byNumber()`, `bySymbol()`, `bySlug()`, `withCategory()`, `withBlock()` |
| Where is the raw data? | `source/data/elements.json` | 118 records, committed; written by `tools/build-data.js` |
| How do you look up an element by symbol? | `elements-repository.js` | `bySymbol("Fe")` — a `Map` lookup, not a scan |
| How do you get every element in a group? | `elements-repository.js` | `withCategory("noble-gas")` |
| How do you sort elements by melting point? | `elements-repository.js` | `compareByField("meltingPoint")` — a comparator, so `Array.sort` runs once |
| Where is the grid position maths? | `source/tools/data-sources/layout.js` | `positionFor(atomicNumber)`, with `periodFor`, `groupFor`, `blockFor` — computed at build time and frozen into every record |
| How does the grid know which cell is next? | `source/scripts/lib/grid.js` | `createGrid(elements).neighbour(cell, direction)` — the nearest **occupied** cell, skipping the holes |
| How do you choose text colour on a tile? | `source/scripts/lib/contrast.js` | `readableForeground(fill)`, plus `contrastRatio`, `compositeOver`, `lowestAlphaForAA` |
| How does the electronegativity colour scale work? | `source/scripts/lib/colour-scale.js` | `createColourScale({ stops, domain, bands })`, with `bandFor` and `positionIn` |
| How do you format a `null` property? | `source/scripts/lib/format.js` | `formatMeasurement(value, definition)` — `null` becomes `UNKNOWN` |
| How does arrow-key navigation work? | `source/scripts/lib/keyboard.js` | `directionFor(key)` and `destinationFor({ grid, cell, key })`, driven by the table's one roving tab stop |
| Where's the periodic table component? | `source/scripts/components/periodic-table.js` | `renderPeriodicTable()`, `attachPeriodicTable()`, `createPeriodicTable()`, `MODES` |
| How does a group isolate the rest of the table? | `periodic-table.js` + `styles/components/periodic-table.css` | `data-isolated` on the grid; the sheet dims the **fill**, never the tile's text |
| How does the electron shell diagram get drawn? | `source/scripts/components/shell-diagram.js` | `shellDiagram({ shells, label })` — generated SVG from `shellGeometry()` |
| How are the FAQ answers generated? | `source/scripts/components/faq-block.js` | `faqEntries(element)` — read from the record, not written twice |
| How does the element finder work? | `source/scripts/components/element-search.js` | `matchesFor(elements, query)` for the answer, `attachElementSearch()` for the keyboard |
| Where do the routes live? | `source/scripts/router/routes.js` | `routes` for the fixed pages, then `allRoutes()`, `elementRoutes()`, `groupRoutes()`, `glossaryRoutes()` |
| How do you handle a deep link on a static host? | the build, plus `source/scripts/router/router.js` | every route is a real built file; `createRouter()` swaps the body in between |
| How is a page turned into a document? | `source/tools/document.js` | `renderDocument()`, `sitemapFor()`, `robotsFor()` |
| Where are the social and search tags? | `source/tools/structured-data.js` | `structuredDataFor()` / `structuredDataScript()` — JSON-LD, one `WebPage` per page |
| Where's the canonical address built? | `source/tools/site-origin.js` | `absoluteUrl(path)` over `SITE_ORIGIN`, defaulting to a reserved `.example` address |
| Where are the design tokens? | `source/styles/tokens.css` | the only file allowed a literal colour, size, radius or duration |
| Why is there only one theme? | `workspace/docs/ARCHITECTURE.md` | ADR-006 — light only, by decision |
| Where is the 3D renderer? | `source/scripts/components/atom-view.js` | `createAtomView(canvas, options)` → `available()`, `setParticles()`, `setRings()`, `draw()`, `start()`, `stop()` |
| Where is the 3D maths? | `source/scripts/lib/{matrix4,orbit-camera,primitive-geometry,point-sphere}.js` | `multiply`, `createOrbitCamera`, `sphereGeometry`, `ringGeometry`, `pointSphere` |
| Where does an element become an atom? | `source/scripts/lib/atom-model.js` | `buildAtom({ record, protons, neutrons, electrons, scale })`, `neutronsFor(record)`, `placeElectrons()` |
| What moves the electrons? | `source/scripts/components/atom-scene.js` | `createAtomScene({ view, tokens, atom, speed })` — the scene owns the clock, not the model |
| Where does the atom viewer get its colours? | `source/styles/tokens.css` §21 via `getComputedStyle` | `atomScale(tokens)` and `tokenReader(doc)` in `components/atom-stage.js` |
| How does an element page reach the viewer? | `source/scripts/pages/element-detail.js`, `components/atom-stage.js` | `elementViewerLink({ element })` writes `/atoms/#<slug>`; `elementFromFragment(hash, repository)` opens on it |
| Why is the 3D written by hand? | `workspace/docs/ARCHITECTURE.md` | ADR-007 — raw WebGL2, no library, tokens as the palette |
| Where's the dev server? | `source/tools/serve.js` | — |
| Where does the data build script live? | `source/tools/build-data.js` | fetches, merges, verifies, **then** writes |
| How do I find any file in this project? | `workspace/docs/MIND_MAP.md` | — |

---

## Likely questions, and the honest answers

**"Why no framework?"**
Because the point of the project is the JavaScript. React would have done the rendering, the routing
and the state, and the interesting parts — grid placement for the f-block, colour-scale
interpolation, keyboard navigation across 118 cells — would have been behind an abstraction I did not
write. Hand-writing them is the deliverable. It also means zero dependencies, so the site cannot
break because a package was abandoned, and a clean clone builds and passes its whole suite with
`node` and nothing else.

**"Why is there a build step if you have no dependencies?"**
Because 536 element and glossary pages should not be 536 hand-written files. The build is plain Node:
it takes a template, asks a page family module for the content, and writes finished HTML — 562
routes plus a not-found page, in about a second. The output is a static site, so deep links, print
and search engines all work, and the site degrades to plain multi-page HTML if JavaScript never runs.

**"Why do you render at build time instead of in the browser?"**
Because the home page used to do it in the browser and it cost a 0.315 layout shift: four empty hosts
shipped, and 118 tiles arrived after paint and grew the page by 926px under the reader. It was also a
home page that a crawler could not see. Every family now computes its markup through a `*Values`
function that both the build and the browser call, and the browser only attaches behaviour. That is
the one architectural decision this project made twice.

**"Why JavaScript and not TypeScript?"**
It's a JavaScript course project and the brief was JavaScript. Types are covered by tests on the pure
modules — the parts where a wrong type actually produces a wrong answer.

**"How do you place the lanthanides and actinides?"**
They have no group number, so period and group alone cannot position them. `positionFor()` in
`tools/data-sources/layout.js` computes a row and column from the atomic number alone, including the
detached f-block rows, and the build freezes that answer into every record — so the layout is decided
once, at data time, and no stylesheet gets to disagree with it. What `lib/grid.js` then owns is the
other hard question: which cell a keypress lands on next. A step is "the nearest occupied cell in
that direction", which handles the d-block holes, the deliberately empty row 8, and the two detached
rows with one rule, and is asserted for all 118 elements in four directions.

**"How do you colour the tiles?"**
Group colours are fixed custom properties in `tokens.css`, set per tile as `--fill` with a matching
`--on-fill` chosen by `readableForeground()` — so a pale group gets dark ink and a dark group gets
cream, and no component hard-codes a colour. For the numeric views, `lib/colour-scale.js` maps a
property's domain onto a scale and clamps out-of-range values. Where a tile fades its own ink, the
ceiling is **derived** from the eleven group fills by `lowestAlphaForAA()` rather than chosen, and a
test holds every fading token above it — because 0.9 of the ink felt fine and was 4.32:1.

**"How do you test something visual?"**
Unit tests cover the logic: 482 on the published site, 658 on the branch that adds the atom viewer,
with nothing installed. Structure and appearance are checked by sweeps in `workspace/tools/visual`,
which drive the real Chrome through Playwright: an accessibility sweep over 20 pages, a responsive
sweep at 375 / 768 / 1024 / 1440, a performance sweep that measures layout shift and long tasks on a
cold cache, and Lighthouse over eight pages. Each exits non-zero on the defect it owns, so a phase can
gate on them. That is how both of the defects I am proudest of finding were found — by measurement,
not by looking. The viewer adds three of its own: they read the drawing buffer back out of the canvas
and classify its pixels against the same tokens the renderer was handed. The full procedure is in
`docs/TESTING_STRATEGY.md`.

**"How do you test a WebGL renderer, then?"**
By splitting it so that almost nothing needs a browser. Every awkward part — 4×4 matrices, the
spherical camera, generating a sphere and a ring, spreading points evenly on a sphere, turning a
record and three counts into positions — is a pure module under `lib/`, and each has unit tests that
run in Node. What is left is the drawing layer, and that is where the interesting failure lives: a
particle draw once used a vertex array that carried the per-particle buffers but not the sphere's own
attributes, so every sphere collapsed to a point at its centre — **and every unit test passed**,
because the calls were issued exactly as designed. Reading the pixels back found it. The lesson is in
the tests now: the stub canvas holds the call sequence, and a browser audit holds the picture.

**"What's the hardest bug you hit?"**
Two, and both are specific. **The home page's 0.315 layout shift**: the shipped document held four
empty hosts and the table arrived after paint, so the page grew by 926px under the reader — and a
crawler saw nothing. The fix was to compute the same four blocks at build time through the same table
engine the four views already used and leave the browser only the attaching. It measures 0 now.
**And a contrast defect our own tool could not see**: a tile's faded label was 4.32:1 against the
actinide sage, below AA at 8.8px, because our sweep read the text colour but did not composite the
element's own `opacity` before checking it. Lighthouse caught it. The sweep now composites, the
fading ceiling is derived from the eleven fills rather than chosen, and a test keeps it there.

**"Where does your content come from?"**
Facts come from two openly licensed sources — PubChem's PUG REST service (public domain) and Wikidata
(CC0) — merged and derived by transform scripts that are committed, so anyone can rerun them and get
the same file. Prose is written by me. Provenance, licences and the two fields no acceptable source
supplies are recorded in `docs/DATA_SOURCES.md`, and the About page reads that record as data so the
two cannot drift.

**"Is this a copy of that site?"**
The design language is reproduced deliberately — the grid, the rhythm, the dotted rule, the motion,
the information architecture. The product is mine: different brand, different wordmark, my own prose,
my own data pipeline, and two whole sections removed. Where accessibility and fidelity disagreed —
its tertiary ink is 3.06:1 on our paper and its isolation dims text to 1.5:1 — accessibility won, and
both deviations are written down rather than quietly absorbed. The boundary is in
`docs/BRAND_GUIDELINES.md` and enforced by an automated scan before every milestone commit.

**"What would you do differently?"**
Good answers exist and should be specific. Candidates: build the data layer before the design layer,
because the data shape constrains everything; or render every page at build time from the first
phase, since doing it page by page is how the home page kept its client-rendered table until the
quality phase found it; or write the accessibility sweep in Phase 1 rather than Phase 11, because
the 443 contrast failures it found had been in the palette since the design system landed.

---

## Things to be able to demonstrate live

Five, in this order, because each one gets harder than the last:

1. **Hover a legend chip** on the home page — the group isolates in the table. One attribute on one
   element; the sheet does the rest, and it dims the fill rather than the text so the labels stay
   readable. Shows you avoided the naive per-tile JavaScript **and** the naive per-tile dimming.
2. **Open an element page** and point at where its FAQ answers and its property list read from the
   same record. Shows derived content is computed, not copied.
3. **Open `lib/grid.js` and its test file** and show a step from one element to the next skipping the
   holes, then open `tools/data-sources/layout.js` and show where the position came from. Shows the
   hard part is isolated, decided once, and proven.
4. **Turn the script off and reload the home page**, then turn it back on and resize to 375px and
   scroll the table, then enable reduced motion. Shows the build-time rendering, the responsive work
   and the accessibility work — which is usually where a student project stops.
5. **Open `/atoms/#uranium`**, drag the stage, then open `atom-view.js` and `atom-model.js` beside it.
   Shows a real 3D renderer written without a library — one instanced draw call for the whole atom,
   and the matrices, the camera and the geometry generation all as pure modules with tests. Then turn
   the script off and reload: the same page is still a finished one, with the element's shell diagram
   in place of the scene. That is the answer to "what happens when it does not work?"
