# Guide 3 — How a page gets built

> **Status note.** This is a trace of the intended build path under **ADR-001 Option A** (a
> zero-dependency Node static site generator). If ADR-001 is accepted as a different option, the
> "at build time" steps change and this guide is corrected in the same commit. The "in the browser"
> half is the same either way, because the shipped artifact is always HTML, CSS and JavaScript.

## The thirty-second version

1. **Data** — `source/data/elements.json` holds 118 records, one per element.
2. **Repository** — `elements-repository.js` loads that file once and answers questions about it:
   *give me element 26*, *give me everything in the halogens*, *give me all 118 sorted by melting
   point*.
3. **Template** — one HTML template per page family (`pages/element-detail.html`) has the shared
   chrome and a placeholder for the page-specific content.
4. **Build** — a plain Node script walks a list of routes. For each one it takes the template, asks
   the page module for a title and body, and writes a finished `.html` file.
5. **Browser** — the shipped JavaScript attaches behaviour to the finished HTML: the table, the
   search, the colour modes, the keyboard navigation.
6. **Result** — `/elements/iron/` is a real static file containing `<h1>Iron</h1>` and everything
   else, readable before any JavaScript runs.

The point of the split: **content is static, interaction is JavaScript.** Content that is static is
indexable, printable, and readable with JavaScript disabled. Interaction that is JavaScript is where
the interesting code lives.

---

## The full trace, following one URL

Let us follow `http://localhost:3000/elements/iron/` from start to finish.

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
  "meltingPoint": 1538,
  "boilingPoint": 2861,
  "shells": [2, 8, 14, 2],
  "electronConfiguration": "[Ar] 3d6 4s2",
  "summary": "…", "description": "…", "uses": "…", "sources": "…",
  "dataSource": "…"
}
```

### Step 1 — Build time: the route list

The build script enumerates what needs to exist. Two kinds of route:

- **Fixed routes** — `/`, `/elements/`, `/glossary/`, `/calculators/temperature/`, and so on. One
  entry each.
- **Generated routes** — one per data record. `/elements/:slug` becomes 118 routes; `/glossary/:slug`
  becomes 418.

```js
// illustrative
const routes = [
  { path: '/',                template: 'index.html',          page: 'home' },
  { path: '/elements/',       template: 'pages/elements-index.html', page: 'elements-index' },
  ...elements.all().map(el => ({
    path: `/elements/${el.slug}/`,
    template: 'pages/element-detail.html',
    page: 'element-detail',
    data: el,                                  // ← the record this page is about
  })),
];
```

That `map` is why there are 536 detail pages and one template per family instead of 536 hand-written
files. It is also the single most important idea in the codebase: **content pages are data plus a
template.**

### Step 2 — Build time: filling the template

For each route the build script:

1. reads the template,
2. asks the page module for the page's `<title>`, meta description and body markup,
3. substitutes those into the template's placeholders,
4. writes the result to the output path.

```js
// illustrative
const html = render(template, {
  title:       `${el.name} (${el.symbol}) — Atomic Number ${el.atomicNumber}`,
  description: el.summary,
  body:        pageModule.render(el),      // returns an HTML string
});
write(`dist/elements/${el.slug}/index.html`, html);
```

The page module's `render` is ordinary JavaScript producing an HTML string. No template language, no
framework, no build magic — which means it can be unit-tested, and a bug in it is a bug in code you
can read.

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

`scripts/app.js` runs on load and does three things, in order:

1. **Theme** — resolves the colour scheme and applies `data-theme` to the document root, so no
   component needs to know which theme is active.
2. **Routing** — installs the link interceptor and the history listener (see step 6).
3. **Page behaviour** — identifies the page family from the path and runs the matching module's
   `hydrate(el)`.

### Step 5 — Browser: the element page hydrates

`scripts/pages/element-detail.js` receives the already-rendered element and attaches behaviour to
it. It does not create content — the content is in the HTML. It:

- builds the **miniature periodic table** with this element highlighted, by asking the repository for
  all 118 and rendering tiles through the shared `element-tile` component;
- draws the **electron shell diagram** as generated SVG from `el.shells` — real geometry computed
  from the data, not an image;
- wires the **previous / next** controls from the repository's ordered list, wrapping at the ends;
- populates **"Explore other elements in this group"** from the repository's group query;
- makes the FAQ block's values come from the same record, so a page can never display a melting
  point that disagrees with its own property list.

That last point is a rule worth stating plainly: **derived content is computed from the data, never
duplicated in markup.** If an element's boiling point appears in three places on the page, all three
read from the same record.

### Step 6 — Browser: navigating to another element

A visitor clicks "Next — Cobalt". The router intercepts the click, pushes `/elements/cobalt/` onto
the history stack, and renders the new page — either by fetching the already-built HTML fragment for
that route and swapping the content, or, on a full load, by simply being a normal link.

This is the part of the design that must be careful, and the reason `router/` is its own folder:

- **Deep links work.** Each route is a real file, so a cold load of `/elements/cobalt/` serves the
  built HTML directly — no server rewrite, no 404 on a static host.
- **Back and forward work**, because history is real history.
- **If JavaScript fails**, links are ordinary `<a href>` elements. The site degrades to a plain,
  complete, browsable multi-page site. That is a deliberate property, not an accident.

### Step 7 — The table, specifically

The table is the one component with real algorithmic content, so it is worth its own trace.

1. `periodic-table.js` asks the repository for all elements.
2. For each, `lib/grid.js` computes a position. For most elements that is
   `row = period`, `column = group`. The lanthanides and actinides have no group, so they are placed
   in the two detached rows at the bottom via an explicit offset table. This is the single most
   error-prone piece of maths in the project, so it is pure, isolated, and unit-tested against every
   f-block element.
3. `lib/contrast.js` picks a foreground for each tile, so dark group colours get cream text and pale
   ones get ink.
4. `lib/colour-scale.js` handles the four numeric colour modes: it maps a property domain (say,
   electronegativity from 0.7 to 3.98) onto a colour, clamping values outside the domain.
5. The component renders 118 tiles into a CSS grid sized to 18 columns, and the f-block rows are
   positioned into the grid explicitly so they sit under the main body with a gap.
6. Hovering a legend chip sets one class on the container. CSS does the rest: the matching tiles
   stay at full opacity and everything else fades. The interaction is one DOM mutation and a CSS
   rule — no tile-by-tile JavaScript.
7. `lib/keyboard.js` adds roving focus so arrow keys move between tiles, and the whole grid is
   traversable without a mouse.

### Step 8 — Verifying it

Per `workspace/docs/TESTING_STRATEGY.md`: run the unit tests, read the accessibility tree, take
screenshots at 1280 / 768 / 375 px, compare against the reference, and check the console. Then write
down what you saw. A page that has not been looked at has not been verified.

---

## The three ideas worth remembering

1. **Content is data plus a template.** 536 detail pages come from two templates and one JSON file.
2. **Layers only talk downwards.** Pages know components, components know repositories, repositories
   know data. Nothing reaches back up, and nothing skips down.
3. **Derived content is computed, never copied.** A value shown in three places has one source, so it
   cannot disagree with itself.
