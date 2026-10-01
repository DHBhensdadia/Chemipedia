# Architecture and Decision Records — ChemiPedia

How the site is put together, and — more importantly — **why** each consequential choice was
made. Read this before building anything an ADR governs.

Vocabulary used throughout: an **ADR** (Architecture Decision Record) is a short, dated note that
captures one hard-to-reverse decision, the options that were on the table, and what we accept by
choosing. Once accepted, an ADR is binding until a later ADR supersedes it.

---

## Part 1 — Target architecture (shape, per ADR-001)

The build has four layers, each with one job. Nothing skips a layer.

```
            ┌──────────────────────────────────────────────┐
 Layer 4    │  Pages      one module per page family       │  composes components, owns the URL
            ├──────────────────────────────────────────────┤
 Layer 3    │  Components periodic table, header, cards…    │  reusable, data-driven, no page knowledge
            ├──────────────────────────────────────────────┤
 Layer 2    │  Repositories  elements, glossary, categories │  queries and derived values; the only
            │                                               │  code that reads raw JSON
            ├──────────────────────────────────────────────┤
 Layer 1    │  Data       elements.json, glossary.json,     │  normalised, validated, immutable
            │             categories.json                   │
            └──────────────────────────────────────────────┘
                 Lib: pure helpers (colour scales, grid maths, formatters, keys)
```

**The rules that keep it decoupled:**

1. **Only repositories import raw JSON.** A component never reads `elements.json`; it asks the
   repository. This is what lets the dataset be replaced in Phase 2 without touching a component.
2. **Components never know a URL.** A component emits an event or accepts a callback; the page
   module decides what navigation means.
3. **`lib/` is pure.** No DOM, no data, no side effects — therefore trivially testable.
4. **Data flows down as arguments, up as events.** Nothing reaches sideways into another module's
   state, and no module mutates a record it received.

**Why this shape:** the periodic table appears on five different page families with four different
colour modes. If the table were written inside the home page it would be duplicated four times.
Layer separation is what makes Phase 3 a one-time cost and Phases 4, 7 and 8 short.

---

## Part 2 — Decision records

### ADR-001 — Site delivery architecture

**Status:** `ACCEPTED` (2026-10-01)
**Date raised:** 2026-10-01
**Governs:** the entire shape of `source/`

**Context.** The reference site generates static HTML at build time from shared components and a
data file. We need a delivery model that (a) stays pure JavaScript, (b) has zero runtime
dependencies, (c) produces 500+ data-driven pages without hand-writing them, (d) is deployable to
a static host, and (e) is legible to an interviewer and a course grader.

**Options considered**

| Option | Description | Strengths | Costs |
|---|---|---|---|
| **A. Zero-dependency Node SSG** *(recommended)* | A plain-Node build script renders every route to a static HTML file from shared component modules and the JSON data. | Real HTML per URL, so deep links and per-page metadata work everywhere. 536 detail pages generated, not written. Shared components reused. Mirrors how the reference itself is built. Pure JS, no dependencies. | Introduces a build step: `node source/tools/build.js` before serving. |
| **B. Plain multi-page static HTML** | One hand-written HTML file per page family. No build step. | `open index.html` and it works. Trivial to explain. | Shared chrome either duplicated across files or injected by JavaScript; per-element pages cannot be hand-written, so element/glossary detail pages need a query-parameter trick. |
| **C. Client-side SPA with a router** | One entry HTML; the router renders every route in the browser from ES modules. | Best showcase of JavaScript. Fewest files. Natural component model. | "View source" is empty. Deep links need a server/inline fallback. Per-page SEO metadata is fragile. |

**Decision.** Option A: a zero-dependency Node static site generator, with shared components as ES
modules, and the detail pages generated from the data. The shipped site is static HTML, CSS and
JavaScript — nothing about the running site depends on the build step.

**Consequences**

- Every route has a real HTML file → GitHub Pages, deep links, crawling and print all work.
- The element and glossary detail pages are *generated*, so Phase 5 and Phase 9 cost one template
  each rather than 536 hand-written files.
- `source/tools/build.js` and the templates become part of the reviewable codebase — which is
  good, because a build script written in plain JavaScript is itself a demonstration of competence.
- Accepted cost: a reader must run one documented command to see the site. The README will make
  this the first line.
- Accepted cost: generated output must be clearly separated from authored source, and either
  committed (simplest, deployable directly) or ignored. This is recorded below in §3.

**Reversal cost.** Medium. Reverting to Option B or C means rewriting the page layer, but Layers 1
and 2 (data and repositories) and the components survive intact — which is exactly why the layers
are separated this way.

---

### ADR-002 — Page scope beyond the core reference surface

**Status:** `ACCEPTED` (2026-10-01)
**Governs:** Phases 6, 8, 9, 10 and the print rules in Phase 11

**Context.** The reference site carries pages that are peripheral to the periodic table itself:
downloadable printables, an about page, a contact page, a blog, and a tutoring page. Some are
cheap, some involve generated print output.

**Options considered:** the core surface only (home, elements index, element pages, four table
views, the three attribute rankings); the core plus the reference's reference-and-utility families;
or the core plus everything including generated printables.

**Decision.** Everything except the reference's blog and tutoring pages is in scope:

| In scope | Why |
|---|---|
| Glossary index and 418 term pages | The reference's reference layer, and the internal-link backbone of the site. The page machinery is small; the cost is authoring the definitions. |
| Eleven element group pages | Small, high value, and they reuse the table component already built in Phase 3. |
| Temperature calculator | Small, self-contained, and the cleanest unit-test target in the project. |
| Downloads area, with printable periodic table and per-element cards | Adds a printable-stylesheet requirement, but the print work is shared with Phase 11 and the element cards reuse the existing tile and card components. |
| About and Contact | Cheap, and needed to state the data provenance and attribution required by ADR-005. |

**Out of scope, and staying out of scope:** the reference's blog and tutoring pages, which are
content-marketing surfaces rather than part of a chemistry reference.

**Consequences.** Phase 10 grows to carry the downloads area, and Phase 11 must carry a print
stylesheet that satisfies both the periodic table and the per-element cards. The print rules are
therefore specified once, in the table and card stylesheets, rather than invented per page.
Because Phase 10 is a leaf in the dependency graph, a late reversal here still cannot affect any
other phase.

---

### ADR-003 — Commit message convention

**Status:** `ACCEPTED` (2026-10-01)
**Governs:** every commit for the life of the project

**Context.** The author requires a history that reads as one experienced developer's work, with no
trace of AI involvement, several coherent commits per phase.

**Options considered**

| Option | Example subject | Notes |
|---|---|---|
| **A. Plain imperative prose** *(recommended)* | `Build interactive periodic table grid with group filtering` | Reads like a human's history. No machine-looking prefixes. Nothing to explain when asked. |
| **B. Conventional Commits with scopes** | `feat(table): add group filtering` | Widely recognised and machine-parseable, but the `feat(...)` prefix is the single most common tell of a generated history, and a course project rarely needs automated release notes. |

**Decision.** Option A. Imperative mood, subject ≤ 72 characters, capitalised, no trailing period,
blank line, body wrapped at 72 characters explaining *why*. No `Co-Authored-By`, no emoji, no model
or tool attribution.

**Consequences.** No automated changelog can be generated from prefixes. Acceptable: the phase log
serves that purpose, and the plan calls for several commits per phase rather than a release
pipeline.

---

### ADR-004 — JavaScript only, zero runtime dependencies

**Status:** `ACCEPTED` (author instruction)
**Governs:** all of `source/`

**Context.** This is a university JavaScript course submission and an interview artefact. It must
demonstrate JavaScript competence, and it must be runnable for years without a dependency tree
rotting underneath it.

**Decision.** JavaScript ES modules only. No TypeScript, no React/Vue/Svelte/Alpine/jQuery, no
Tailwind or Bootstrap, no npm packages required by the running site. Only the standard platform:
HTML, CSS, and JavaScript. A plain Node script may be used for build and tooling, with no
third-party modules.

**Consequences**

- Positive: zero install, zero supply-chain risk, nothing breaks when a package is abandoned.
  Every line in the browser is ours and readable.
- Negative: no framework conveniences — routing, reactivity and templating are hand-built. This is
  a cost we accept deliberately, because those are exactly the skills the project exists to show.
- Negative: no third-party date, chart or animation library; the small amount needed is written
  in `source/scripts/lib/` and tested.

---

### ADR-005 — Data provenance and licensing

**Status:** `ACCEPTED`
**Governs:** Phase 2, and all prose content

**Context.** The site needs ~40 factual properties for each of 118 elements, plus 418 glossary
definitions. Copying the reference site's text would be both a licence problem and a brand problem
— the brief explicitly requires the site to read as ours.

**Decision.** Two kinds of content, handled separately:

1. **Facts** (atomic number, weight, melting point, configuration, discovery year, and so on) are
   not copyrightable. They are taken from an openly licensed structured dataset, transformed by a
   committed build script, and normalised into our schema.
2. **Prose** (descriptions, uses, sources, glossary definitions, explainer copy) is written by us,
   or adapted from openly licensed sources with attribution recorded in `docs/DATA_SOURCES.md`.
   The reference site's prose is never copied, closely paraphrased, or used as a structural crib.

**Consequences.** Phase 2 costs more effort than scraping would, and the data build script must
record its source and licence so provenance is auditable. In exchange, the site is legally clean
and genuinely ours, and the author can defend every sentence in an interview.

---

### ADR-006 — Single light theme

**Status:** `ACCEPTED` (2026-10-01, author instruction)
**Governs:** Phase 1 token layer, Phase 11 verification

**Context.** The reference design defines a warm-paper palette at its root (`--bg #fdfbfa`, ink
`#15403d`) and also renders a dark variant at runtime, observed as a near-black body background. We
had assumed both would be implemented.

**Decision.** Ship **light only**. The warm off-white paper with pine-green ink is the design. No
`data-theme` attribute, no switcher, no `prefers-color-scheme` branch, no second surface set, and no
`styles/theme.css`.

**Consequences**

- Positive: every component is verified against one background, so a legibility or contrast defect
  cannot hide in the variant nobody looked at. Each group colour needs one verified foreground
  rather than two, which halves the contrast invariants under test. The per-phase visual pass stays
  at three viewport widths instead of six.
- Positive: one fewer state to reach through keyboard, and no flash-of-wrong-theme problem to solve
  on first paint.
- Negative: the site does not follow a dark operating-system preference, and a side-by-side review
  against the reference at night will show a difference. This is an accepted deviation from the
  reference and belongs in the deviations log.
- Mitigation, and the reason this is safe to accept now: the token names are theme-neutral and no
  component reads a literal colour, so adding a second value set later is a contained change rather
  than a refactor. The omission is deliberate and reversible, not structural.

---

## Part 3 — Sub-questions resolved with ADR-001

**Generated output is ignored, and rebuilt on demand.** The repository holds authored source only;
`dist/` is in `.gitignore` and is regenerated by `node source/tools/build.js`. This keeps the
tracked tree reviewable — a reader sees templates and data, not five hundred generated files — and
it keeps the source of truth unambiguous. The trade-off accepted: the site must be built before it
can be deployed or served, so the build command is the first line of the README and the first step
of the development server.

**The development server is hand-rolled in plain Node**, at `source/tools/serve.js`. It must
resolve directory-style routes so that `/elements/hydrogen/` serves
`dist/elements/hydrogen/index.html`, matching how a static host behaves. It also runs the build
step on start if `dist/` is missing, so a fresh clone needs one command rather than two.

**The style guide is a development-only page.** It lives at `source/styleguide/`, is excluded from
the route manifest that the build renders, and is therefore absent from `dist/`, from the sitemap
and from `robots.txt`.

**Route manifest is explicit and testable.** Because the build enumerates routes rather than
discovering files, the manifest is a plain array in `source/scripts/router/routes.js`, unit-tested
for uniqueness and for the expected route count. This is what makes "all 118 element pages exist"
an assertion rather than a hope.

---

*Add a new ADR for any decision that is consequential and awkward to reverse. Mark it `PROPOSED`,
then `ACCEPTED` once the author confirms. Never rewrite an accepted ADR — supersede it.*
