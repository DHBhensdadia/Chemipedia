# Guide 3 — How a page gets built

> **This traces the shipped architecture.** ADR-001 settled on the zero-dependency Node static site
> generator, so every "at build time" step below is what the build actually does. Since Phase 11 that
> is true of **every** page, the home page included: a page family is a module the build calls and
> the browser only attaches behaviour to, so there is one rendering path rather than two.

## The thirty-second version

1. **Data** — `source/data/elements.json` holds 118 records, one per element.
2. **Repository** — `elements-repository.js` loads that file once and answers questions about it:
   *give me element 26*, *give me everything in the halogens*, *give me all 118 sorted by melting
   point*.
3. **Template** — one HTML template per page family (`pages/element-detail.html`) has the shared
   chrome and a placeholder for the page-specific content.
4. **Build** — a plain Node script walks a list of routes. For each one it calls the family's
   `*Values()` function, fills the template's slots with the result, and writes a finished `.html`
   file — 562 of them.
5. **Browser** — on the pages that have behaviour at all, the shipped JavaScript attaches it to the
   finished HTML: the table and its colour modes, the finder, the keyboard navigation. The markup is
   already there either way.
6. **Result** — `/elements/iron/` is a real static file containing `<h1>Iron</h1>` and everything
   else, readable before any JavaScript runs.

The point of the split: **content is static, interaction is JavaScript.** Content that is static is
indexable, printable, and readable with JavaScript disabled. Interaction that is JavaScript is where
the interesting code lives.

---

## The full trace, following one URL

Let us follow `http://127.0.0.1:4173/elements/iron/` from start to finish. (That is the dev server's
default port; `node source/tools/serve.js --port 4180` if something else has it.)

### Step 0 — Where the data came from

`source/tools/build-data.js` fetched an openly licensed dataset, transformed it into our schema, and
wrote `source/data/elements.json`. The transform is a committed script, so the JSON is reproducible
rather than magic. Provenance and licence: `workspace/docs/DATA_SOURCES.md`.

```jsonc
// source/data/elements.json — the Iron record, abridged
{
  "atomicNumber": 26,
  "symbol": "Fe",
  "name": "Iron",
  "slug": "iron",
  "category": "transition-metals",
  "period": 4,
  "block": "d",
  "position": { "row": 4, "column": 8 },
  "meltingPoint": 1537.85,
  "boilingPoint": 2860.85,
  "shells": [2, 8, 14, 2],
  "electronConfiguration": "[Ar]4s2 3d6",
  "summary": "…", "description": "…", "uses": "…", "sources": "…",
  "dataSource": "…"
}
```

### Step 1 — Build time: the route list

`source/scripts/router/routes.js` is the one route table, and **both halves of the site read it**:
the build walks it to decide what to write, and the browser router reads it to decide what a link
means. Two kinds of route:

- **Fixed routes** — `/`, `/elements/`, `/glossary/`, `/calculators/temperature/`, and so on, listed
  by hand in `routes` with the title, description and stylesheets only they can know.
- **Generated routes** — one per data record, from `elementRoutes(elements)`,
  `groupRoutes(categories)` and `glossaryRoutes(terms)`, which `allRoutes()` joins together.
  `/elements/:slug` becomes 118 routes; `/glossary/:slug` becomes 418.

```js
// illustrative
{ path: "/elements/iron/", template: "element-detail", element: iron,
  title: "Iron (Fe) — atomic number 26", description: "…" }
```

That widening is why there are 536 detail pages and one template per family instead of 536
hand-written files. It is also the single most important idea in the codebase: **content pages are
data plus a template.**

### Step 2 — Build time: filling the template

For each route the build script:

1. looks the route's `template` up in `FAMILY_RENDERERS` and calls that family's `*Values()` function,
   which returns the markup for each of its template's named slots,
2. reads the template and fills those slots,
3. hands the filled body to `tools/document.js`'s `renderDocument()` along with the route's own
   `title` and `description`, the stylesheets the route declared, and the chrome `shellFor()` builds,
4. writes the result to the output path, remembering it so `sitemapFor()` can write a sitemap from
   the routes that were **actually** written.

```js
// illustrative — the element family's slot-filling function
const values = renderer({ route, element, elements, categories, units, glossary });

// …and what it returns, abridged: eleven named slots, each an HTML string
export function elementPageValues({ element, elements, categories, units, glossary }) {
  return {
    strip: elementStrip({ element, previous, next }),
    hero:  elementHero({ element, elements }),
    faq:   faqBlock({ element, units }),
    // …sections, glossary, counts, properties, orbital, similar, pager
  };
}
```

The title and description live on the route, because the route is the thing that knows its own
address and what it is about; the body lives in the family module, because only it knows the shape of
its page. Nothing in between is a template language, a framework or build magic — which means it can
be unit-tested, and a bug in it is a bug you can read. The **one** rendering path is that the browser
calls none of this: a client-side navigation fetches the page that was already built (see step 6).

### Step 3 — Build time: what the visitor receives

`dist/elements/iron/index.html` is a complete document. Its content is already in the file:

```html
<h1>Iron</h1>
<p class="element__summary">…</p>
<dl class="property-list"> …40 rows… </dl>
```

The stylesheets and the JavaScript are referenced, but nothing in the content depends on them. A
search engine, a screen reader, and a `curl` request all see the same complete page. That is the
whole reason this architecture is worth its build step.

### Step 4 — Browser: the shell boots

`scripts/app.js` runs on load — `startApp()` — and does exactly two things, in order:

1. **Routing** — installs the link interceptor and the history listener (see step 6).
2. **Page behaviour** — reads `document.body.dataset.page`, which the build stamped into the
   document, and calls the matching `start*` function from `PAGE_BEHAVIOUR`.

The chrome needs no step here: the header, the submenu and the footer are rendered by the build from
`shellFor()`, and the search field is an ordinary form that goes to the elements index. There is also
no theme resolution, because the site ships a single light theme (ADR-006).

Note which pages are **missing** from `PAGE_BEHAVIOUR`, because it is the clearest statement of the
architecture in the whole codebase: the 118 element pages, the 418 glossary terms, the elements index
and the group index have no entry. They are markup, links and the router, and they need nothing else.

### Step 5 — Browser: nothing happens, and that is the design

An element page has no entry in `PAGE_BEHAVIOUR`, so `scripts/app.js` starts nothing on it. Every
piece of that page arrived finished, built by `elementPageValues()` and its helpers:

- the **miniature periodic table**, with this element highlighted, from `elementMiniTable()`, which
  renders the 118 tiles through the shared `element-tile` component with the list roles turned off —
  it is one picture, not a list of 118 links;
- the **electron shell diagram** as generated SVG from `el.shells`, by `shellDiagram()` over
  `shellGeometry()` — real geometry computed from the data, not an image;
- the **previous / next** controls as ordinary links, from `neighbouringElements()`, which wraps at
  the ends;
- **"Explore other elements in this group"** from `similarElements()` over the same records;
- the **FAQ** from `faqEntries(element)`, reading the same record the property list does.

That last point is a rule worth stating plainly: **derived content is computed from the data, never
duplicated in markup.** If an element's boiling point appears in three places on the page, all three
read from one record — and because all three are built from it, a page cannot print a number that
contradicts itself.

### Step 6 — Browser: navigating to another element

A visitor clicks "Next — Cobalt". The router intercepts the click, pushes `/elements/cobalt/` onto
the history stack, and fetches the **whole built document** for that route — the same file a cold load
would get — then replaces the body with it, updates the title and description, and calls the page's
behaviour by the name the arriving body carries. Scripts in the incoming body are dropped, because
the module that would run them is already loaded. A cold load needs none of this: every route is a
real file, so it is simply a normal link.

This is the part of the design that must be careful, and the reason `router/` is its own folder:

- **Deep links work.** Each route is a real file, so a cold load of `/elements/cobalt/` serves the
  built HTML directly — no server rewrite, no 404 on a static host.
- **Back and forward work**, because history is real history.
- **If JavaScript fails**, links are ordinary `<a href>` elements. The site degrades to a plain,
  complete, browsable multi-page site. That is a deliberate property, not an accident.

### Step 7 — The table, specifically

The table is the one component with real algorithmic content, so it is worth its own trace.

1. A family's `*Values()` function calls `renderPeriodicTable({ elements, categories, mode, hint })`,
   and the build puts the returned markup in the page.
2. Each record's `position` was **decided at data time**, by `positionFor(atomicNumber)` in
   `tools/data-sources/layout.js`, and frozen into `elements.json`. For most elements that is
   `row = period`, `column = group`; the lanthanides and actinides have no group, so they are given
   their detached rows there. The table component never re-derives a position, and no stylesheet gets
   to disagree with it.
3. `lib/grid.js` owns the **other** hard question: which cell a step lands on. `createGrid(elements)`
   lays the records out as cells and its `neighbour(cell, direction)` returns the nearest **occupied**
   cell — one rule that handles the d-block holes, the deliberately empty row 8 and the two detached
   rows at once, and is asserted for all 118 elements in four directions.
4. `lib/contrast.js` picks a foreground for each tile with `readableForeground(fill)`, so dark group
   colours get cream text and pale ones get ink. Where a tile fades its own ink, the ceiling comes
   from `lowestAlphaForAA()` over the eleven fills rather than from taste.
5. `lib/colour-scale.js` handles the numeric modes with `createColourScale({ stops, domain, bands })`:
   it maps a property domain (say, electronegativity from 0.7 to 3.98) onto a colour and clamps values
   outside it. There are five colour modes in all — group, block, state, electronegativity and
   discovery — and the four non-group ones are the alternate table views.
6. The grid is 18 columns of CSS grid, and the f-block rows sit in it explicitly, under the body with
   the gap row between.
7. Hovering a legend chip sets `data-isolated` on the grid. CSS does the rest: the matching tiles keep
   their fill and everything else has its fill **mixed 30% towards the paper**. Dimming the whole
   tile would take its text with it — that measured 1.5:1 — so the drain never touches the ink. One
   attribute and a CSS rule, no tile-by-tile JavaScript.
8. `attachPeriodicTable()` adds the keyboard behaviour: one roving tab stop for 118 tiles, with
   `directionFor(key)` and `destinationFor({ grid, cell, key })` from `lib/keyboard.js` deciding where
   a keypress lands. `lib/keyboard.js` itself is pure — no DOM — which is why the stepping is
   testable without a browser.

### Step 8 — Verifying it

Per `workspace/docs/TESTING_STRATEGY.md`: run the unit tests (`node --test source/tests`), then run
the four sweeps in `workspace/tools/visual` — accessibility over 19 pages, responsive at
375 / 768 / 1024 / 1440, performance on a cold cache, and Lighthouse over seven pages — and compare
against the reference at the widths that matter. Check the console. Then write down what you saw; each
sweep exits non-zero on the defect it owns, so "it passed" is a measurement and not an impression.
A page that has not been measured has not been verified — and the two defects this project is
proudest of finding (a 0.315 layout shift and a 4.32:1 tile label) were both invisible to the eye.

---

## The three ideas worth remembering

1. **Content is data plus a template.** 536 detail pages come from two templates and one JSON file.
2. **Layers only talk downwards.** Pages know components, components know repositories, repositories
   know data. Nothing reaches back up, and nothing skips down.
3. **Derived content is computed, never copied.** A value shown in three places has one source, so it
   cannot disagree with itself.
