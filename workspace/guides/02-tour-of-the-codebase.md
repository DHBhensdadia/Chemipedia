# Guide 2 — Tour of the codebase

> **This describes the repository as it ships.** ADR-001 settled on the zero-dependency Node static
> site generator, every folder below exists, and `v1.1.0` closed the last phase of the feature: `v1.0.0`
> published the site and `v1.1.0` added the atom viewer — the four `atom-*` components, the `atom-*` lib
> modules and one page
> family. Where a name here and
> the code disagree, the code is right and this guide is a defect — fix it in the same commit.

## The one rule that decides everything

> **Does the browser load it?**
>
> - **Yes** → it belongs in `source/`.
> - **No** → it belongs in `workspace/`.

`source/` is shipped code and nothing else. `workspace/` is plans, research, documentation, guides,
logs and reference material. There is no third place, no "shared" folder, and no file that is
arguably both. A screenshot of the reference site does not go in `source/`. A `.js` module does not
go in `workspace/`.

This separation exists because the two kinds of file have opposite lifecycles: code is loaded by a
browser and optimised for the browser; documentation is read by humans and optimised for clarity.
Mixing them makes both harder to find and makes "what actually ships?" an unanswerable question.

## The four layers

The code is arranged in four layers. Each layer may only talk to the layer below it. Nothing skips a
layer, and nothing reaches sideways.

```
  Pages          one module per page family
     │           composes components, owns the URL, decides what navigation means
     ▼
  Components     periodic table, header, tiles, cards, legend chips
     │           reusable, data-driven, no knowledge of any URL
     ▼
  Repositories   element and glossary access, queries, derived values
     │           the ONLY code that reads raw JSON
     ▼
  Data           elements.json, glossary.json, categories.json
                 normalised, validated, immutable

  Lib            pure helpers used by any layer above: colour scales, grid maths,
                 formatters, keyboard handling. No DOM, no data, no side effects.
```

**Why the layers exist, concretely.** The periodic table appears on three different page families, in
five different colour modes. If the table were written inside the home page, it would be duplicated
wherever else it was needed, and the last copy would drift. Layering means the table engine was
written once, in Phase 3, and every later phase that needed a table was cheap — and the same engine
is what the build calls to write the home page's table into the HTML.

**The three rules that keep the layers honest:**

1. **Only repositories import raw JSON.** A component never reads `elements.json`; it asks the
   repository. This is what makes the dataset replaceable without touching the UI.
2. **Components do not know about URLs.** A component is *handed* its links and its navigation —
   `hrefFor`, `go` — and only falls back to `location` when nobody gave it one. The page module, the
   router, or a test decides what a click means, which is what lets the same tile be a link on the
   home page and part of a picture on an element page.
3. **`lib/` is pure.** No DOM, no data, no side effects — which makes it trivially testable, and
   means the trickiest maths in the project (colour interpolation, grid placement) can be tested
   without a browser.

## Folder by folder

```
source/
├── README.md                  what belongs in here, and the rule that decides it
├── styleguide/index.html      the design system on one page — development only, never built
├── styleguide/atom-demo.js    the viewer driven by hand: a picker over all 118 records, three
│                             free count fields, a speed, a shake and a reset
├── pages/                     one authored HTML template per page family, written as a fragment
│   ├── home.html
│   ├── elements-index.html
│   ├── element-detail.html
│   ├── element-groups-index.html
│   ├── group.html
│   ├── properties-and-states.html, orbitals.html,       the four alternate table views
│   ├── electronegativity.html, evolution.html
│   ├── melting-point.html, boiling-point.html,          the three rankings
│   ├── orbital-configuration.html
│   ├── glossary-index.html
│   ├── glossary-term.html
│   ├── temperature-calculator.html
│   ├── downloads.html
│   ├── atoms.html             the atom viewer, whose canvas is its enhancement
│   ├── about.html
│   ├── contact.html
│   └── 404.html               the not-found document, and the host's fallback
│
├── scripts/
│   ├── app.js                 the single entry point: boots routing, then the page's own behaviour
│   ├── router/
│   │   ├── routes.js          the route table, read by the build and the browser alike
│   │   ├── route-sheets.js    the stylesheet sets two or more routes share
│   │   └── router.js          link interception, history, scroll, 404, fallback
│   ├── data/                  ← Layer 3: REPOSITORIES. The only readers of JSON.
│   │   ├── elements-repository.js
│   │   ├── glossary-repository.js
│   │   ├── categories-repository.js
│   │   ├── units-repository.js
│   │   └── json-source.js     the one place a JSON file is fetched, with a cache
│   ├── components/            ← Layer 2: components, one file per component
│   │   ├── periodic-table.js  the engine: the grid, its five colour modes, its keyboard
│   │   ├── element-tile.js    one cell's markup, shared by the table and the miniatures
│   │   ├── element-card.js
│   │   ├── legend-chips.js
│   │   ├── element-search.js  the finder
│   │   ├── search-field.js
│   │   ├── bar-ranking.js
│   │   ├── property-list.js
│   │   ├── faq-block.js
│   │   ├── shell-diagram.js
│   │   ├── era-timeline.js
│   │   ├── atom-view.js       ← the WebGL2 layer: context, programs, buffers, one draw a frame
│   │   ├── atom-meshes.js     the sphere and the ring, and the per-particle buffers
│   │   ├── atom-shaders.js    the GLSL, and createProgram
│   │   ├── atom-scene.js      the model, alive: every particle this frame, and the camera
│   │   ├── atom-bar.js        the glass bar's markup
│   │   ├── atom-stage.js      the page's browser half: builds the scene, wires the bar
│   │   ├── frame-loop.js      when a frame is drawn
│   │   └── site-header.js, submenu.js, site-footer.js, wordmark.js
│   ├── pages/                 ← Layer 4: one module per page family
│   │   ├── home.js
│   │   ├── elements-index.js
│   │   ├── element-detail.js
│   │   ├── table-views.js     the four alternate views share one module
│   │   ├── group.js
│   │   ├── glossary.js, glossary-term.js
│   │   ├── ranking.js, orbital-configuration.js
│   │   ├── temperature-calculator.js
│   │   ├── atoms.js           the viewer's page family (build half)
│   │   └── downloads.js, about.js, contact.js
│   └── lib/                   pure helpers — no DOM, no data, no side effects
│       ├── colour-scale.js    numeric domain → colour, with clamps
│       ├── contrast.js        fill → readable foreground, and the alpha maths behind it
│       ├── grid.js            the frozen positions laid out as cells; which cell a step lands on
│       ├── keyboard.js        key → direction, and direction → destination cell
│       ├── format.js          value + unit → display string; `null` becomes "Unknown"
│       ├── slug.js            name → URL slug, and back
│       ├── html.js            escaping and attribute building
│       ├── electron-configuration.js, discovery.js, electronegativity.js
│       ├── temperature.js     three scales, one of them with a true zero
│       ├── matrix4.js         the 4×4 arithmetic the renderer hands to the GPU
│       ├── orbit-camera.js    spherical state, eased toward a target, polar limits
│       ├── primitive-geometry.js  a sphere and a ring, generated rather than loaded
│       ├── point-sphere.js    even points on a sphere: a nucleus's own packing
│       ├── atom-model.js      a record + three counts = every particle's place and kind
│       ├── atom-words.js      the sentences both halves of the page read
│       ├── site-path.js       the site's own path, for any URL written after load
│       └── glossary-links.js, plural.js
│
├── styles/
│   ├── tokens.css             ALL design values. No literal colour or size exists outside this file.
│   ├── base.css               reset, typography defaults, focus, selection, reduced motion
│   ├── layout.css             shell, ruled sections, spacing, the dotted-rule utilities
│   ├── components/            one stylesheet per component, same name as its module
│   └── pages/                 one stylesheet per page family, same name as its module
│                              one theme only: the light palette in tokens.css (ADR-006)
│
├── data/                      ← Layer 1: the data. JSON only, no logic.
│   ├── elements.json          118 records — a build artefact, committed on purpose
│   ├── glossary.json          418 terms
│   ├── categories.json        the eleven element groups, with palette and counts
│   ├── units.json             unit definitions used by the formatter
│   ├── element-notes.json     the prose we wrote, kept out of the fetched file
│   └── overrides.json         the nine category corrections, each with its reason
│
├── assets/
│   └── brand/favicon.svg      the only image file. The wordmark and the mark are inline SVG, and
│                             no webfont ships — `--font-body` names Inter and Work Sans and falls
│                             back to the system's own sans, which is the recorded typeface deviation
│
├── tools/                     development tooling. Plain Node. Never shipped to the browser.
│   ├── build.js               walks the route table and writes every page
│   ├── document.js            the <head>, the canonical link and the two crawl files
│   ├── site-origin.js         SITE_ORIGIN, and the absolute URLs built from it
│   ├── structured-data.js     the JSON-LD block every page carries
│   ├── serve.js               zero-dependency static server for local development
│   ├── build-data.js          fetches the open datasets and emits normalised JSON
│   └── data-sources/          the transforms: pubchem.js, wikidata.js, layout.js, configuration.js
│
└── tests/                     Node's built-in test runner. No dependencies. 681 tests.
    └── brand/  components/  data/  lib/  pages/  router/  tools/
```

## Naming rules

- **A file is named after the single thing it owns.** `elements-repository.js` owns element access.
  There is no `utils.js`, no `helpers.js`, no `misc.js`, no `common.js`. These names are how a
  codebase becomes unsearchable.
- **One component = one module + one stylesheet of the same name.** Nothing else styles a component.
- **Page modules are named after the page family**, not the route. `element-detail.js`, not
  `elements-slug.js`.
- **Repositories are named `<thing>-repository.js`** so the search for "where does data come from"
  has an obvious answer.
- **No file exceeds 400 lines.** If it does, it has more than one job; split it and say so in the
  commit message.
- **Test files mirror the source path** and end in `.test.js`.

## How to find things

| Looking for | Go to |
|---|---|
| The colours, type scale, spacing | `source/styles/tokens.css` |
| Where an element's data comes from | `source/scripts/data/elements-repository.js` |
| The raw data itself | `source/data/elements.json` |
| How the grid is laid out | `source/tools/data-sources/layout.js` — decided at data time and frozen into each record |
| Which cell a step lands on | `source/scripts/lib/grid.js` |
| The periodic table itself | `source/scripts/components/periodic-table.js` |
| What a URL renders | `source/scripts/router/routes.js` |
| What the home page does | `source/scripts/pages/home.js` |
| How a page becomes a document | `source/tools/document.js` |
| The 3D renderer | `source/scripts/components/atom-view.js`, with the maths beside it in `scripts/lib/{matrix4,orbit-camera,primitive-geometry}.js` |
| What the atom viewer draws | `source/scripts/lib/atom-model.js` (a record and three counts) and `source/scripts/components/atom-scene.js` (the same, alive) |
| What the atom viewer looks like | `source/styles/tokens.css` §21 — the renderer reads those values at runtime |
| How an element page reaches the viewer | `source/scripts/pages/element-detail.js` (`elementViewerLink`) and `elementFromFragment` in `components/atom-stage.js` |
| The dev server | `source/tools/serve.js` |
| Any file at all | `workspace/docs/MIND_MAP.md` |

`workspace/docs/MIND_MAP.md` is the authoritative index. It is updated in the same commit as any
file that is added, renamed, moved or deleted. If you cannot find something, that file is the first
place to look — and if it is out of date, fixing it is part of whatever you are doing.
