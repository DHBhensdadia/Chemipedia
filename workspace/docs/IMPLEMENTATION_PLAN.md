# ChemiPedia — Implementation Plan

**Project:** an interactive periodic table and chemistry reference website
**Course:** University JavaScript capstone
**Design reference:** `https://www.breakingatom.com/` (structure and behaviour only — never brand or prose)
**Status:** accepted. ADR-001, ADR-002 and ADR-003 confirmed 2026-10-01; see `docs/ARCHITECTURE.md`.

---

## 1. What we are building

A static, dependency-free chemistry reference site whose centrepiece is an interactive periodic
table of all 118 elements. A visitor can:

- see the whole table at a glance, colour-coded by element group, orbital block, state at room
  temperature, or a numeric property such as electronegativity;
- isolate one group by hovering its legend chip, so the table answers a question by shape;
- open any element and read its properties, electron configuration, uses, sources and discovery;
- browse all 118 elements as a searchable index, or ranked by melting or boiling point;
- look up any of the 418 glossary terms and drill into an individual definition;
- convert temperatures between Celsius, Fahrenheit and Kelvin in a live calculator.

### 1.1 Objectives

1. Reproduce the reference's **information architecture, layout, motion and interaction model**
   faithfully enough to be judged a replica of the *design*.
2. Be unmistakably **our own product**: ChemiPedia branding, our own prose, our own assets.
3. Be **readable JavaScript**. A stranger — or an interviewer — can open the repository, find the
   code that does a specific thing, and follow it without a build tool or a framework in the way.
4. Survive being built in pieces: a stopped session never leaves the project unresumable.

### 1.2 Non-goals

- The reference's **Learn** section and **Games** section. Out of scope entirely, no stubs.
- User accounts, comments, persistence, any server-side runtime.
- Any framework, any TypeScript, any runtime dependency.
- Pixel-plagiarism of the reference's brand, logo, copy or imagery.

---

## 2. Deliverable: the page inventory

Each page family below is one template, one page module and one stylesheet, all named after the
family; the source tree is laid out by layer, as ADR-001 fixes it. "Reference path" is what the
reference site uses; column four is ours.

| # | Page family | Reference path | Our path | Phase |
|---|---|---|---|---|
| 1 | Home + interactive periodic table | `/` | `/` | 4 |
| 2 | Elements index (searchable, 118 cards) | `/elements` | `/elements` | 6 |
| 3 | Element detail (×118) | `/elements/:slug` | `/elements/:slug` | 5 |
| 4 | Properties and states view | `/periodic-table/element-properties` | `/periodic-table/properties-and-states` | 7 |
| 5 | Orbitals and configurations view | `/periodic-table/orbitals` | `/periodic-table/orbitals` | 7 |
| 6 | Electronegativity view | `/periodic-table/electronegativity` | `/periodic-table/electronegativity` | 7 |
| 7 | Evolution and history view | `/periodic-table/evolution-and-history-of-the-periodic-table` | `/periodic-table/evolution` | 7 |
| 8 | Element group pages (×11) | `/element-groups/:slug` | `/element-groups/:slug` | 8 |
| 9 | Glossary index (418 terms, A–Z) | `/terms` | `/glossary` | 9 |
| 10 | Glossary term detail (×418) | `/glossary-of-terms/:slug` | `/glossary/:slug` | 9 |
| 11 | Temperature calculators | `/temperature-calculators` | `/calculators/temperature` | 10 |
| 12 | Melting point ranking | `/melting-point` | `/properties/melting-point` | 6 |
| 13 | Boiling point ranking | `/boiling-point` | `/properties/boiling-point` | 6 |
| 14 | Orbital configurations index | `/orbital-configurations` | `/properties/orbital-configuration` | 6 |
| 15 | About / Contact | `/about`, `/contact` | `/about`, `/contact` | 10 |
| 16 | Downloads / printables | `/downloads` | `/downloads` | 10 |
| 17 | Atom viewer (3D) | `/` — of the **second** reference | `/atoms` | 12–15 |
| — | ~~Learn (courses, tracks, articles)~~ | `/learn-the-periodic-table/*` | **excluded** | — |
| — | ~~Games (quizzes, flash cards)~~ | `/periodic-table-games`, `/games/*` | **excluded** | — |

Row 17 is the only page that does not come from the reference this project was planned against. The
author supplied a **second** reference for one page of it — a three-dimensional atom viewer that
spins electrons around a nucleus of protons and neutrons — and asked for that page alone: its
periodic-table and statistics pages are out of scope. Nothing of that reference enters this
repository but the idea of the page and the shape of its controls. The measurements live in
[`docs/research/04-reference-atom-viewer-audit.md`](research/04-reference-atom-viewer-audit.md).

---

## 3. Phase plan

Each phase is a shippable increment. Each has explicit **exit criteria**; a phase does not close
until every one is met and recorded in `progress/PHASE_LOG.md`.

Every phase follows the same ritual:

1. **Reconstruct state** — `AGENTS.md` §0 sequence.
2. **Build** — small units, committing as you go.
3. **Test** — unit tests and `node --check`.
4. **Verify visually** — screenshots at 1280 / 768 / 375 px against the reference; check the
   accessibility tree and the console.
5. **Reconcile** — fix deviations, or record them with a reason.
6. **Document** — update the mind map, phase log, `RUN_STATE.md`, `HANDOFF.md`.
7. **Close** — set the phase `COMPLETE` with its commit range.

---

### Phase 0 — Foundation, Tooling and Working System

**Goal:** a repository that can be resumed by a stranger, and a source tree shaped by the accepted
architecture. No user-facing features.

**Deliverables**

- `workspace/` documentation set: `AGENTS.md`, `WORKING_AGREEMENT.md`, `RUN_STATE.md`,
  `HANDOFF.md`, `progress/PHASE_LOG.md`, `docs/*`, `guides/*`, `docs/research/*`.
- Git repository initialised with repo-local author identity `Devansh <dhbhensdadia@gmail.com>`.
- `.gitignore` and a root `README.md`.
- `source/` skeleton per ADR-001: a template per page family in `source/pages/`, then `scripts/`,
  `styles/`, `data/`, `assets/`, `tools/`, `tests/`. Folders a later phase owns are created with their
  first real file, since git does not track an empty directory and a placeholder would be a stub.
- A **zero-dependency dev server** (`source/tools/serve.js`, plain Node) that runs the build when
  `dist/` is missing and resolves directory-style routes the way a static host does.
- A **verification harness**: a documented, repeatable recipe for serving the site and capturing
  screenshots. Optional Playwright-based visual diff script if it can stay dependency-free.
- The **route manifest** (`source/scripts/router/routes.js`) with its uniqueness and route-count
  tests, since the build enumerates routes from it (ADR-001 Part 3).

**Tasks**

| ID | Task | Output |
|---|---|---|
| 0.0 | Reference site audit | `docs/research/01-reference-site-audit.md` |
| 0.1 | Tooling and Git standards research | `docs/research/02-*.md`, `docs/research/03-*.md` |
| 0.2 | Working system authored | `AGENTS.md`, `WORKING_AGREEMENT.md`, `RUN_STATE.md`, `docs/**`, `guides/**` |
| 0.3 | Git initialised with the author's identity | `.git/`, `.gitignore`, `README.md` |
| 0.4 | Source tree scaffolded, with the route manifest | `source/**`, `source/scripts/router/routes.js` |
| 0.5 | Build, development server and verification harness | `source/tools/build.js`, `source/tools/serve.js`, the recipe in `docs/TESTING_STRATEGY.md` §4 |

**Exit criteria**

- `git log` shows several coherent commits, all authored by the project author, with no AI trace.
- `node source/tools/serve.js` starts and serves a placeholder page with zero console errors.
- Every file in the repository appears in `docs/MIND_MAP.md`.
- A fresh reader can go from `AGENTS.md` to running the site unaided.

**Commit breakdown (illustrative):** `Ignore build and editor artefacts` → `Scaffold repository
layout and workspace documentation` → `Add project implementation plan and decision records` →
`Introduce dependency-free development server`.

---

### Phase 1 — Design System and Global Shell

**Goal:** the visual language, and the chrome that wraps every page.

**Deliverables**

- `source/styles/tokens.css` — the full design-token layer, transcribed from the audit:
  palette, the eleven element-group colours, type scale, spacing scale, radii, motion durations
  and easings, shell width and measure.
- `source/styles/base.css` — reset, typography, links, focus rings, selection, reduced-motion.
- Layout primitives: `.shell`, ruled sections, the dotted-rule motif, spacing utilities.
- **Header**: two-line wordmark, primary navigation, search field, responsive behaviour.
- **Submenu bar**: the contextual secondary nav that changes per section.
- **Footer**: five link columns, tagline, copyright — with the Learn and Games columns re-cut.
- Reusable components: `site-header`, `site-footer`, `submenu`, `legend-chips`, `search-field`.
- A **style guide page** (`source/styleguide/index.html`) rendering every token and component.
  This is a development tool, not a shipped page, and it is the fastest way to see the design
  system in one screen.

**Exit criteria**

- The style guide page renders every token and component correctly at all three widths.
- Colour values in `tokens.css` match the reference's computed values, verified in the browser.
- Keyboard focus is visible on every interactive element; heading order is valid.
- No literal colour or size values exist outside `tokens.css`.

---

### Phase 2 — The Data Layer

**Goal:** all 118 elements and 418 glossary terms as a clean, documented, tested JavaScript data
layer. This is the phase that makes every later phase short.

**Deliverables**

- `source/data/elements.json` — 118 records against our own documented schema (~40 fields each:
  identity, atomic structure, physical properties, thermal and electrical properties, discovery,
  description, uses, sources).
- `source/data/glossary.json` — 418 terms with definition and difficulty level.
- `source/data/categories.json` — the eleven element groups with slug, display name, palette key.
- `source/scripts/data/elements-repository.js` — indexed access: by atomic number, symbol, slug,
  group, block, period, state; sorted views (by melting point, boiling point, density,
  electronegativity); derived values (state at 293 K, valence electrons, category membership).
- `source/scripts/data/glossary-repository.js` — A–Z grouping, prefix search, slug lookup.
- A **data build script** (`source/tools/build-data.js`, plain Node) that fetches the openly
  licensed source dataset and emits our normalised JSON. Committed output, reproducible build.
- Unit tests: `source/tests/data/*.test.js`.

**Exit criteria**

- Exactly 118 elements and 418 glossary terms; a test asserts the counts and every slug's uniqueness.
- Every element resolves through the repository by number, symbol and slug.
- Spot-check at least six elements (H, He, Fe, Au, U, Og) against an authoritative external source.
- Unit tests green.
- `docs/DATA_SOURCES.md` records provenance and licence for every field group.

---

### Phase 3 — The Periodic Table Engine

**Goal:** the centrepiece component. Built once, reused by five page families.

**Deliverables**

- `source/scripts/components/periodic-table.js` — a custom element that renders the 18×10 grid
  with the lanthanide and actinide rows pulled out, from data.
- Colour modes: group (default), block, state, and numeric scales (electronegativity, atomic
  radius, density, melting point) with generated legends.
- Hover-a-group-to-isolate interaction, driven by the legend chips and by keyboard.
- Tile anatomy: atomic number, symbol, name, group fill; the reference's compact and detailed
  variants.
- Keyboard navigation across the grid with arrow keys, roving focus, and a visible focus ring.
- Responsive behaviour: horizontal scroll on narrow screens with an accessible scroll affordance.
- Tooltip / detail preview on hover and focus.
- `source/scripts/lib/` — the small pure helpers the component needs (grid position maths,
  colour-scale interpolation, key handling), each with tests.
- Tests for grid placement, isolation logic and colour-scale interpolation.

**Exit criteria**

- All 118 tiles render in the correct grid position; a test asserts row/column for a sample of
  elements including every lanthanide and actinide.
- Every colour mode renders and its legend counts match the data.
- Group isolation works by mouse and by keyboard.
- Visually compared against the reference table's tile geometry and colour mapping.

---

### Phase 4 — Home Page

**Goal:** the first thing a visitor sees.

**Deliverables**

- `source/scripts/pages/home.js` plus the home template, `source/pages/home.html`.
- Hero: display heading and supporting paragraph.
- The "Explore Periodic Tables:" quickswitch strip linking the four table views, labelled as the
  reference labels it.
- Legend chips for the eleven groups, with counts, wired to the isolation interaction.
- The periodic table component in group mode.
- **"Understanding the Periodic Table"** explainer: the Periods and Groups panels.
- A find-an-element search that jumps straight to an element.
- Section teasers replacing the reference's Learn block with in-scope content (glossary,
  calculators, table views).

**Exit criteria**

- The page matches the reference's section order, rhythm and spacing at all three widths.
- Hovering a chip isolates that group in the table.
- The element search returns correct results and navigates correctly.
- Zero console errors; screenshots recorded.

---

### Phase 5 — Routing and Element Detail Pages

**Goal:** the 118 deepest pages, from one template.

**Deliverables**

- Routing: URL patterns for every family, link interception, back/forward handling, scroll
  restoration, and a documented no-server fallback (ADR-001). `404` handling.
- `source/scripts/pages/element.js` — the element detail template, which renders:
  - the previous / current / next element strip;
  - a miniature periodic table with this element highlighted and its position captioned;
  - the large element tile with atomic number and symbol;
  - name, pronunciation, one-line summary and long description;
  - a generated **FAQ** block derived from the element's own properties;
  - Uses, Sources, and a Discovery definition list (discovered by, year, place, name origin);
  - the properties sidebar: ~40 labelled values, plus a generated **electron shell diagram** (SVG,
    drawn from the element's shell configuration, not a static image);
  - "Explore other elements in this group", and previous/next navigation.
- Tests: every element slug resolves; FAQ answers match the underlying data; shell diagram
  geometry is correct for known elements.

**Exit criteria**

- All 118 detail pages render with complete, correct data.
- Deep links work from a cold load, and back/forward behave.
- The electron shell diagram is generated and correct for H, C, Fe, Au, U.
- Visually compared against a reference element page.

---

### Phase 6 — Elements Index and Attribute Rankings

**Goal:** the browse-and-compare surfaces.

**Deliverables**

- `/elements` — hero, live search by name and symbol, and a two-column grid of 118 element cards
  (tile, name, group, atomic weight, state).
- `/properties/melting-point` and `/properties/boiling-point` — elements ranked, with a bar
  visualisation of relative magnitude and a unit-aware formatter.
- `/properties/orbital-configuration` — every element's configuration, grouped by block.
- Tests for the ranking order, the formatter and the search filter.

**Exit criteria**

- Search filters instantly and correctly on name, symbol and atomic number.
- Rankings are monotonic and spot-checked against the reference for the extremes.
- All cards link correctly.

---

### Phase 7 — Alternate Periodic Table Views

**Goal:** the same table, answering four different questions.

**Deliverables**

Four pages that reuse the Phase 3 component with a different colour mode, legend and explainer:

1. **Properties and states** — colour by state at 293 K, with state counts and a transition note.
2. **Orbitals and configurations** — colour by s/p/d/f block, with block counts.
3. **Electronegativity** — a continuous scale, with the trend explained and the outliers named.
4. **Evolution and history** — colour by decade of discovery, with a timeline and a narrative of
   how the table's shape came to be.

**Exit criteria**

- Each page renders the correct colour mapping and legend counts.
- The continuous scales interpolate correctly across their domain, verified at both extremes.
- Visual comparison against the corresponding reference page.

---

### Phase 8 — Element Group Pages

**Goal:** eleven landing pages, one per element category.

**Deliverables**

- `/element-groups/:slug` for alkali metals, alkaline earth metals, transition metals,
  post-transition metals, metalloids, non-metals, halogens, noble gases, lanthanides, actinides
  and unknown.
- Each page: group hero in the group's colour, member count, the group's shared chemical
  character written in our own words, the member grid, and the table with the group isolated.
- Tests asserting each group's membership and count.

**Exit criteria**

- Member counts match the reference exactly (e.g. transition metals 35, halogens 5, unknown 8).
- Every member link resolves.
- Group colour is applied consistently from the token layer.

---

### Phase 9 — Glossary

**Goal:** the site's vocabulary layer, and the internal-link backbone.

**Deliverables**

- `/glossary` — hero, an A–Z jump index, live filtering, and all 418 terms grouped by initial
  letter, each showing term, definition and difficulty badge.
- `/glossary/:slug` — term detail: definition, expanded explanation, difficulty, related
  elements, related terms, and cross-links back into the element pages.
- Cross-linking between glossary terms and element properties (a term mentioned in an element's
  entry links to its definition).
- Tests for grouping, filtering, slug resolution and cross-link generation.

**Exit criteria**

- 418 terms render; letter grouping and the jump index are correct and complete.
- Filtering works on term and definition text.
- Every cross-link resolves; no dead ends.

---

### Phase 10 — Calculators, Tools and Secondary Pages

**Goal:** the interactive utilities, plus the remaining static pages.

**Deliverables** (scope fixed by ADR-002)

- `/calculators/temperature` — three synchronised inputs (Celsius, Fahrenheit, Kelvin) that
  convert live as you type, with input validation, sensible rounding, and keyboard-friendly behaviour.
- `/downloads` — the printable periodic table and per-element cards. Both print from the stylesheet
  rules introduced here and shared with Phase 11, rather than from a separate rendering path.
- `/about` — describing ChemiPedia, and carrying the **data provenance and attribution section**
  required by ADR-005, linking each dataset and its licence.
- `/contact` — in our own words.
- Tests for conversion round-tripping and validation edge cases, and an assertion that every
  download target exists in the built output.

**Exit criteria**

- Conversions round-trip correctly and match authoritative values at known reference points
  (0 °C = 32 °F = 273.15 K; −40 °C = −40 °F).
- Invalid input is rejected gracefully with no console errors.
- About/Contact contain no reference-site prose or brand.
- Every download target resolves in the built output, and the printable periodic table fits a single
  page at both A4 and Letter.

---

### Phase 11 — Quality, Accessibility, Performance and Delivery

**Goal:** turn a working replica into a finished product.

**Deliverables**

- **Accessibility sweep:** landmarks, heading order, labels, `aria-live` for dynamic regions,
  focus management on route change, contrast audit against WCAG AA, `prefers-reduced-motion`,
  full keyboard traversal of the table.
- **Responsive sweep:** audit every page at 375 / 768 / 1024 / 1440 px and fix failures.
- **Performance:** render strategy for 118 tiles, avoiding layout thrash; no render-blocking
  work; measured load timings recorded.
- **SEO and metadata:** per-page `<title>`, description, canonical, Open Graph, structured data
  for the element pages, `sitemap.xml`, `robots.txt`.
- **Print stylesheet** for the table and element pages.
- **Documentation close-out:** README, finished `guides/`, finalised mind map, refreshed
  architecture ADRs.
- **Deployment:** GitHub Pages (or equivalent static host) with the documented routing fallback,
  plus a tagged `v1.0.0` release.

**Exit criteria**

- Lighthouse: accessibility and best-practices pass; performance and SEO recorded with a baseline.
- Every page passes the responsive and keyboard audits.
- A clean clone runs and deploys following only the README.
- All documentation current; no `TODO`s left in tracked files.

---

### Phases 12–15 — the atom viewer

The site is complete at `v1.0.0` and published, and this is the first feature added to a finished
product rather than the next step of a plan. It is planned as four phases because it is four
different kinds of work, and because the first two are maths that must be provable before a page
depends on them.

**What the feature is.** A new page family at `/atoms/`, in the navigation between *Periodic Table*
and *Elements* as **Atoms**, that draws the selected element as a three-dimensional atom: a nucleus
of protons and neutrons, electrons orbiting on rings, a speed control, a shake, a reset, and a
translucent bar pinned to the bottom centre carrying the element card, the three particle steppers,
the speed and the legend. Protons, neutrons and electrons are free to set, exactly as the reference
allows, so the page can also show what is *not* an element and say so plainly.

**What it must respect.** The three constraints that shape every decision below:

1. **No library (ADR-004).** The reference's scene is three.js behind React. Ours is hand-written
   WebGL2, plain ES modules, no dependency, and it renders on a canvas the build does not have to
   wait for. That is the largest piece of engineering in the feature, and it is why Phase 12 exists
   as its own phase with its own tests rather than as the first thing the page does.
2. **Progressive enhancement, as Phase 11 taught it.** A page whose content exists only after
   scripting is a page a crawler and a reader whose script did not run cannot see. The atom is
   decoration and interaction over content that is built: the element card, the counts, the shell
   diagram — the one the element pages already draw — and the page's own prose are all written at
   build time, and the canvas replaces the diagram only once it has a context and a first frame.
3. **One theme, and one place for its values (ADR-006).** The stage is dark where the page around it
   is paper-light, because that is what makes a glowing nucleus read; but every colour, radius,
   duration and blur it uses is a token in `tokens.css`, and the renderer *reads its palette from
   the token layer at runtime* rather than carrying hex literals. A dark stage inside a light site is
   a palette decision, not a second theme.

**What is explicitly not in this feature:** the second reference's periodic-table and statistics
pages, its element dataset (ours already holds every fact the model needs), its copy, its assets, and
any dependency of any kind. Its brand values are recorded in the audit as *measurements* precisely so
that they are not shipped by accident.

### Phase 12 — The renderer: WebGL2 without a library

**Goal:** the project's one piece of 3D, isolated in a layer of its own and proven on the
development-only styleguide page before any page depends on it.

**Deliverables**

- `scripts/lib/matrix4.js` — the 4×4 arithmetic a renderer needs and nothing else: perspective,
  look-at, multiply, translate, rotate, scale.
- `scripts/lib/orbit-camera.js` — the camera as pure state: distance, azimuth and polar angle,
  damping from the current value toward its target, zoom and swing limits, and the view matrix. No
  DOM, so the whole of the camera's behaviour is testable in Node.
- `scripts/lib/primitive-geometry.js` — vertices, normals and indices for the two shapes the viewer
  draws, generated rather than loaded: a sphere for every particle, as a latitude/longitude sheet
  whose seam and poles are counted correctly, and a ring for every orbit. *Amended while building it:*
  the plan first called this file `sphere-geometry.js` and the ring a flat band; a flat band vanishes
  when the camera looks along an orbit's plane and this camera orbits, so the ring is a tube — a
  torus — and the file is named for the pair of shapes it owns rather than for one of them.
- `scripts/components/atom-shaders.js` — the GLSL and the program handling: a lit sphere for
  nucleons and electrons, a translucent tube for an orbit, and a backdrop that gives the stage its
  depth.
- `scripts/components/atom-view.js` — the WebGL2 layer around them: context acquisition, canvas
  sizing with a device-pixel-ratio cap, instanced draws so that a kind of particle costs one draw
  call, the frame loop, pause when the document is hidden or the canvas is out of view, and a
  `destroy()` that releases everything.
- A section on `/styleguide/` (development-only) that renders a field of spheres and drives the
  camera, so the layer can be seen, timed and tuned before a page exists.

**Exit criteria**

- `node --check` clean on every new module; unit tests for `matrix4`, `orbit-camera` and
  `sphere-geometry`, including their refusals.
- The styleguide section renders a moving frame with zero console errors and zero failed requests.
- Draw-call and frame-time numbers are recorded, not asserted from memory.
- No literal colour, radius, duration or size in any file of the layer: values arrive as arguments.
- The existing accessibility and responsive sweeps still pass on every page they already cover.

### Phase 13 — The atom model and the live scene

**Goal:** from an element record to a picture that moves, with the parts that are arithmetic kept
apart from the parts that draw.

**Deliverables**

- `scripts/lib/point-sphere.js` — the even distribution of N points on a sphere (the golden-angle
  spiral the reference uses): deterministic, and testable for count, radius, uniqueness and spread.
- `scripts/lib/atom-model.js` — the feature's core, pure: an element record plus the three counts
  becomes the whole model the renderer draws — nucleon positions and their kinds (deterministic, so
  the same element looks the same on every visit), the nucleus radius from the nucleon count, the
  shells taken from the record's own `shells` array, one electron per electron distributed by shell,
  each with a stable phase, the orbit radii from our own scale, and the labels: mass number, isotope,
  charge, and the honest words for the states that are not an element.
- `scripts/components/atom-scene.js` — the model brought to life on top of the view: orbit rings,
  instanced nucleons and electrons, per-shell angular speed from the speed setting, the shake impulse
  and its decay, the camera reset, and the update path when the element or any count changes.
- Tests: the model against real records (hydrogen, carbon, iron, uranium, oganesson) and against the
  extremes (no protons, no electrons, the heaviest isotope, more neutrons than any element has), the
  point distribution's geometry, and the speed mapping.

**Exit criteria**

- Every element and every extreme renders on the styleguide page without an error.
- The model's rules and refusals are covered by tests, run with nothing installed.
- Frame time at 1280 × 800 is measured for the heaviest atom the page allows, and written down.
- Switching element, and changing a count, changes the picture — verified by comparing frames, not
  by reading the code.

### Phase 14 — The page, the bar and the navigation

**Goal:** the feature a reader can reach: one navbar item, one page, and the translucent bar the
author asked for by name.

**Deliverables**

- The route: `/atoms/`, template `atoms`, in the manifest with `nav: { label: "Atoms", order: 2 }`;
  *Periodic Table* stays at 1 and *Elements*, *Glossary* and *Calculators* move to 3, 4 and 5.
- `scripts/pages/atoms.js` — `atomsPageValues` for the build and `startAtoms` for the browser: the
  card and counts for the element the page opens on, the shell diagram the fallback shows, the bar's
  markup, and the wiring of the canvas, the element picker, the three steppers, the speed, the shake,
  the reset and the announcements.
- `styles/pages/atoms.css` and the scene's and the bar's component sheets: the deep pine stage, the
  glass bar, the steppers, the slider and the legend.
- A new token group in `tokens.css` (the atom viewer): the stage and its vignette, the glass surface
  with its border and glow, the three particle colours with the foreground each needs for its label,
  the ring colour and opacity, the motion, and the bar's geometry.
- The fallbacks: without WebGL, without scripting, or with reduced motion asked for, the page shows
  the element's shell diagram with its counts written out, and under reduced motion one still frame
  with a play control. Each path is seen in a browser, not assumed.
- Accessibility: the canvas is `role="img"` with a name that states the current atom; every control
  is a real button, range input or select with a label; a polite live region announces the atom after
  a change; the bar is operable by keyboard alone with a focus ring that is visible on the dark stage.
- Each element page gains one link into the viewer, so the feature is reachable from the content a
  reader is already reading.

**Exit criteria**

- The page renders at 1280 / 768 / 375 px with no console error and no failed request.
- The navbar item sits between *Periodic Table* and *Elements*, and every path the shell links to is
  still a declared route (the shell test holds this).
- The bar is usable with the keyboard alone and announces each change once.
- The no-script and no-WebGL paths show the built diagram and the counts, and the reduced-motion path
  holds a still frame.
- The brand scan is clean: the second reference's name appears nowhere under `source/`.

### Phase 15 — Quality, delivery and the second reference's line

**Goal:** close the feature the way Phase 11 closed the site: measured, documented, deployed, tagged.

**Deliverables**

- The sweeps extended to the new page: the accessibility sweep (19 → 20 pages), the responsive sweep
  at four widths, and Lighthouse over it.
- `workspace/tools/visual/audit-atom.mjs` — a development-only sweep for what no other sweep can see:
  that the canvas actually paints (frames differ), that each control changes the render (a pixel hash
  before and after), that reduced motion holds one frame, that the page survives WebGL being
  unavailable, the frame-time budget, the counts it draws, and captures at three widths.
- Documentation: `DESIGN_SYSTEM.md` (the token group and the stage's rules), `ARCHITECTURE.md`
  (**ADR-007**: raw WebGL2, progressive enhancement, palette read from tokens, no library),
  `MIND_MAP.md`, `BRAND_GUIDELINES.md` (the second reference: what we take, what never enters the
  repository), `DATA_SOURCES.md` (no new data, and why), the guides, `progress/PHASE_LOG.md`,
  `RUN_STATE.md`, `HANDOFF.md`, and the README's route count and status.
- Delivery: merged to `main` with `--no-ff`, pushed, the Pages run green, the live page verified in a
  browser at `https://dhbhensdadia.github.io/Chemipedia/atoms/` with the same checks the publish
  entry used, and tagged `v1.1.0`.

**Exit criteria**

- All four gates pass with the new page included, and the numbers are recorded.
- The live page is verified in a browser, not only by `curl`.
- The mind map has no missing file and no document contradicts another.
- `v1.1.0` is tagged on the last commit of the close-out.

---

## 4. Phase dependency graph

```
Phase 0  Foundation
   │
Phase 1  Design System ────────────┐
   │                               │
Phase 2  Data Layer ──┐            │
   │                  │            │
Phase 3  Table Engine ┘            │
   │                               │
   ├── Phase 4  Home               │
   ├── Phase 6  Index + Rankings   │
   ├── Phase 7  Table Views ───────┘
   └── Phase 8  Group Pages
   │
Phase 5  Routing + Element Pages  (needs 1, 2)
   │
Phase 9  Glossary      (needs 2, 5 for cross-links)
Phase 10 Calculators + Secondary pages
Phase 11 Quality, A11y, Performance, Delivery
   │
Phase 12 The renderer      (needs 1: the tokens and the styleguide to be seen on)
   │
Phase 13 The atom model    (needs 2 for the records, 12 for the camera and the geometry)
   │
Phase 14 The page + nav + bar  (needs 1, 2, 13)
   │
Phase 15 Quality, delivery  (needs 14; closes on the live page)
```

Phases 6, 7 and 8 may be reordered freely. Phase 3 must precede 4, 7 and 8. Phase 5 is
independent of 3 but shares the design system. Phase 12 depends on no feature phase — it is the one
piece of work in the project that can be built, seen and tested on its own — and Phase 13 can begin
as soon as the camera and the sphere geometry exist, before the view has its backdrop.

## 5. Estimate

| Phase | Relative size |
|---|---|
| 0 Foundation | medium |
| 1 Design system and shell | large |
| 2 Data layer | large (mostly data wrangling) |
| 3 Table engine | large |
| 4 Home | medium |
| 5 Routing and element pages | large |
| 6 Index and rankings | medium |
| 7 Table views | medium |
| 8 Group pages | small |
| 9 Glossary | medium, and content-heavy: 418 definitions to author |
| 10 Calculators, downloads and secondary pages | medium |
| 11 Quality and delivery | medium |
| 12 The renderer (WebGL2, camera, geometry, the frame loop) | large — the largest single piece of new engineering since the table engine |
| 13 The atom model and the live scene | medium-large, and mostly arithmetic that tests can hold |
| 14 The page, the bar and the navigation | medium — the design work is the bar |
| 15 Quality, delivery and documentation | medium, and it ends with a live page and a tag |

## 6. Risks and how the plan absorbs them

| Risk | Absorption |
|---|---|
| Data source turns out to be unusable or wrongly licensed | Phase 2 is isolated; the repository layer is the only consumer, so swapping the dataset touches one module and its tests. |
| Visual drift from the reference accumulates | Every phase ends with a screenshot comparison, not just the final one. |
| A phase balloons across many sessions | The phase log and checkpoint are milestone-level, and commits are the recovery boundaries. |
| Scope creep toward the reference's Learn/Games sections | Explicitly out of scope in `WORKING_AGREEMENT.md` §5; navigation and footer are re-cut in Phase 1. |
| The architecture choice proves wrong mid-build | ADR-001 is recorded with its alternatives and consequences, so the reversal is a documented decision, not a rewrite from scratch. The layers are deliberately arranged so a reversal of the page layer leaves the data, repository and component layers intact. |
| The 418 glossary definitions and 118 element prose entries are a large authoring task | Both are content work, isolated in Phase 2 and Phase 9. The page machinery for each is small, so the phases can be split across several sessions without leaving the repository unusable. |
| A hand-written renderer is the largest new surface since the table engine, and it cannot be unit-tested in a browser | The layer is split so that almost all of it *is* testable: matrices, camera, geometry and the atom model are pure modules under `source/scripts/lib/` with tests in Node, and only the drawing calls need a browser. Phase 12 exists to prove the layer on the styleguide page before a page depends on it, and the frame time is measured rather than assumed. |
| WebGL may be unavailable, refused or software-rendered | The page is built around a fallback rather than a hope: the element's shell diagram and its counts are written at build time and are what a reader sees until a first frame exists, so a machine without WebGL loses the animation and nothing else. The path is verified by disabling WebGL in a browser in Phase 14 and again in Phase 15. |
| A canvas is invisible to assistive technology, and a dark stage is a contrast risk | The canvas is `role="img"` with a name that states the current atom, every control is a native control with a label, a polite live region announces changes, and the bar's labels are contrast-checked against the glass they sit on — which is exactly what `audit-a11y.mjs` composites. |
| The second reference is a different site with its own brand | Its palette, copy, datasets and assets are recorded in `docs/research/04` as measurements and never shipped; the brand scan already walks `source/` for the name of a reference, and Phase 14's exit criteria require the scan to stay clean. |
| Scope creep from the second reference's other pages | `/periodic-table` and `/statistics` are excluded by the author's instruction and recorded as such in `docs/research/04` §1, so their absence is a decision rather than an unfinished task. |

---

*This plan is a living document. Amend it with a commit that explains why, and update
`progress/PHASE_LOG.md` in the same commit.*
