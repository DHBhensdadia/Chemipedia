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

Every page family below is one folder in `source/`. "Reference path" is what the reference site
uses; column four is ours.

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
| — | ~~Learn (courses, tracks, articles)~~ | `/learn-the-periodic-table/*` | **excluded** | — |
| — | ~~Games (quizzes, flash cards)~~ | `/periodic-table-games`, `/games/*` | **excluded** | — |

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
- `source/` skeleton per ADR-001: entry HTML, `scripts/`, `styles/`, `data/`, `assets/`, `tools/`,
  `tests/`.
- A **zero-dependency dev server** (`source/tools/serve.js`, plain Node) that runs the build when
  `dist/` is missing and resolves directory-style routes the way a static host does.
- A **verification harness**: a documented, repeatable recipe for serving the site and capturing
  screenshots. Optional Playwright-based visual diff script if it can stay dependency-free.
- The **route manifest** (`source/scripts/router/routes.js`) with its uniqueness and route-count
  tests, since the build enumerates routes from it (ADR-001 Part 3).

**Tasks**

| ID | Task | Output |
|---|---|---|
| 0.1 | Reference site audit | `docs/research/01-reference-site-audit.md` |
| 0.2 | Tooling + Git standards research | `docs/research/02-*.md`, `docs/research/03-*.md` |
| 0.3 | Working system authored | `workspace/**` |
| 0.4 | Git initialised, identity set | `.git/`, `.gitignore` |
| 0.5 | Source tree scaffolded | `source/**` skeleton |
| 0.6 | Dev server + harness | `source/tools/serve.js` |

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

- `source/scripts/pages/home.js` plus `source/index.html`.
- Hero: display heading and supporting paragraph.
- "Explore periodic tables" quickswitch strip linking the four table views.
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
```

Phases 6, 7 and 8 may be reordered freely. Phase 3 must precede 4, 7 and 8. Phase 5 is
independent of 3 but shares the design system.

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

## 6. Risks and how the plan absorbs them

| Risk | Absorption |
|---|---|
| Data source turns out to be unusable or wrongly licensed | Phase 2 is isolated; the repository layer is the only consumer, so swapping the dataset touches one module and its tests. |
| Visual drift from the reference accumulates | Every phase ends with a screenshot comparison, not just the final one. |
| A phase balloons across many sessions | The phase log and checkpoint are milestone-level, and commits are the recovery boundaries. |
| Scope creep toward the reference's Learn/Games sections | Explicitly out of scope in `WORKING_AGREEMENT.md` §5; navigation and footer are re-cut in Phase 1. |
| The architecture choice proves wrong mid-build | ADR-001 is recorded with its alternatives and consequences, so the reversal is a documented decision, not a rewrite from scratch. The layers are deliberately arranged so a reversal of the page layer leaves the data, repository and component layers intact. |
| The 418 glossary definitions and 118 element prose entries are a large authoring task | Both are content work, isolated in Phase 2 and Phase 9. The page machinery for each is small, so the phases can be split across several sessions without leaving the repository unusable. |

---

*This plan is a living document. Amend it with a commit that explains why, and update
`progress/PHASE_LOG.md` in the same commit.*
