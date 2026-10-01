# Architecture and Decision Records — ChemiPedia

How the site is put together, and — more importantly — **why** each consequential choice was
made. Read this before building anything an ADR governs.

Vocabulary used throughout: an **ADR** (Architecture Decision Record) is a short, dated note that
captures one hard-to-reverse decision, the options that were on the table, and what we accept by
choosing. Once accepted, an ADR is binding until a later ADR supersedes it.

---

## Part 1 — Target architecture (shape, once ADR-001 is settled)

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

**Status:** `PROPOSED` — awaiting author confirmation
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

**Decision (proposed).** Option A: a zero-dependency Node static site generator, with shared
components as ES modules, and the detail pages generated from the data. The shipped site is static
HTML, CSS and JavaScript — nothing about the running site depends on the build step.

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

**Status:** `PROPOSED` — awaiting author confirmation
**Governs:** Phases 9 and 10

**Context.** The reference site carries pages that are peripheral to the periodic table itself:
downloadable printables, an about page, a contact page, a blog, and a tutoring page. Some are
cheap, some involve generated PDFs.

**Decision (proposed).** All in scope: glossary index and term pages, temperature calculator,
element group pages, and our own About and Contact. Optional and to be confirmed: a
downloads/printables area, a molar mass calculator, and a chemical-formula parser.

**Consequences.** Confirming the optional set adds work to Phase 10 and a printable-stylesheet
dependency to Phase 11. Declining it does not affect any other phase, because Phase 10 is a leaf.

---

### ADR-003 — Commit message convention

**Status:** `PROPOSED` — awaiting author confirmation
**Governs:** every commit for the life of the project

**Context.** The author requires a history that reads as one experienced developer's work, with no
trace of AI involvement, several coherent commits per phase.

**Options considered**

| Option | Example subject | Notes |
|---|---|---|
| **A. Plain imperative prose** *(recommended)* | `Build interactive periodic table grid with group filtering` | Reads like a human's history. No machine-looking prefixes. Nothing to explain when asked. |
| **B. Conventional Commits with scopes** | `feat(table): add group filtering` | Widely recognised and machine-parseable, but the `feat(...)` prefix is the single most common tell of a generated history, and a course project rarely needs automated release notes. |

**Decision (proposed).** Option A. Imperative mood, subject ≤ 72 characters, capitalised, no
trailing period, blank line, body wrapped at 72 characters explaining *why*. No `Co-Authored-By`,
no emoji, no model or tool attribution.

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

## Part 3 — Open sub-questions for ADR-001

To be resolved when ADR-001 is accepted:

- **Generated output:** commit the built HTML (deploys directly to any static host, and the diff
  shows content changes) or ignore it (keeps the tree clean, requires a build before deploy)?
  *Leaning: ignore it, and run the build in the deploy step, so the repository contains only
  authored code.*
- **Development server:** hand-rolled plain-Node static server in `source/tools/` — it must know
  about directory-style routes so `/elements/hydrogen/` resolves the way it would on a host.
- **Style guide:** a development-only page, excluded from the built output and from the sitemap.

---

*Add a new ADR for any decision that is consequential and awkward to reverse. Mark it `PROPOSED`,
then `ACCEPTED` once the author confirms. Never rewrite an accepted ADR — supersede it.*
