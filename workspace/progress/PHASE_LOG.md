# Phase Log — ChemiPedia

The status of every phase, its verification evidence, and its commit range. This is the file that
answers *"is that phase actually finished?"* — so it records evidence, never optimism.

Update it **after every meaningful milestone**, not only at the end of a phase. A phase's row is
`COMPLETE` only when the close-out checklist in `docs/TESTING_STRATEGY.md` §7 is honestly ticked.

**Status vocabulary:** `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`

---

## Summary

| Phase | Name | Status | Commits |
|---|---|---|---|
| 0 | Foundation, tooling and working system | `IN_PROGRESS` | — |
| 1 | Design system and global shell | `NOT_STARTED` | — |
| 2 | Data layer (elements and glossary) | `NOT_STARTED` | — |
| 3 | Periodic table engine | `NOT_STARTED` | — |
| 4 | Home page | `NOT_STARTED` | — |
| 5 | Routing and element detail pages | `NOT_STARTED` | — |
| 6 | Elements index and attribute rankings | `NOT_STARTED` | — |
| 7 | Alternate periodic table views | `NOT_STARTED` | — |
| 8 | Element group pages | `NOT_STARTED` | — |
| 9 | Glossary | `NOT_STARTED` | — |
| 10 | Calculators and secondary pages | `NOT_STARTED` | — |
| 11 | Quality, accessibility, performance, delivery | `NOT_STARTED` | — |

---

## Phase 0 — Foundation, tooling and working system

**Goal:** a resumable repository with a working system, a development server, and a source tree
shaped by the accepted architecture.

**Work items**

| ID | Item | Status | Notes |
|---|---|---|---|
| 0.0 | Reference site audit | `VERIFIED` | Live browser inspection; design tokens read from computed styles and recorded in `docs/research/01-reference-site-audit.md`. |
| 0.1 | Tooling and Git standards research | `VERIFIED` | Two searches; recorded in `docs/research/02-*` and `03-*` with sources. |
| 0.2 | Workspace documentation system | `IN_PROGRESS` | `AGENTS.md`, `WORKING_AGREEMENT.md`, `RUN_STATE.md`, `HANDOFF.md`, `docs/**`, `guides/**`, this file. |
| 0.3 | Git initialised with author identity | `NOT_STARTED` | |
| 0.4 | Source tree scaffolded | `NOT_STARTED` | Blocked on ADR-001. |
| 0.5 | Dev server and verification harness | `NOT_STARTED` | |

**Exit criteria**

- [ ] `git log` shows several coherent commits, all authored by the project author, no AI trace.
- [ ] `node source/tools/serve.js` serves a placeholder page with zero console errors.
- [ ] Every file in the repository appears in `docs/MIND_MAP.md`.
- [ ] A fresh reader can go from `AGENTS.md` to a running site unaided.

**Verification**

_Pending. Record the brand scan output, the test summary line, and the screenshot comparisons here._

**Commits:** _pending_

---

## Phase 1 — Design system and global shell

**Goal:** the complete token layer, base styles, layout primitives, header, submenu bar, footer, and
a style guide page rendering every token and component.

**Deliverables:** `source/styles/tokens.css`, `base.css`, `layout.css`, `theme.css`, component
stylesheets and modules for `site-header`, `submenu`, `site-footer`, `legend-chips`,
`search-field`; `source/styleguide/`.

**Exit criteria**

- [ ] Style guide renders every token and component at 1280 / 768 / 375 px.
- [ ] Colour values match the reference's computed values, verified in the browser.
- [ ] No literal colour or size value exists outside `tokens.css`.
- [ ] Focus visible on every interactive element; heading order valid.
- [ ] Every group-colour foreground pairing passes WCAG AA.
- [ ] `prefers-reduced-motion` honoured.
- [ ] Navigation and footer contain no Learn or Games entry; footer columns re-cut.
- [ ] Brand scan clean.

**Verification:** _pending_

**Commits:** _pending_

---

## Phase 2 — Data layer

**Goal:** 118 elements and 418 glossary terms as a documented, tested, reproducible data layer.

**Deliverables:** `source/data/elements.json`, `glossary.json`, `categories.json`, `units.json`;
repositories; `source/tools/build-data.js`; tests.

**Exit criteria**

- [ ] Exactly 118 elements and 418 glossary terms; uniqueness and count asserted by tests.
- [ ] Every element resolves by number, symbol and slug.
- [ ] Category member counts match the eleven expected values.
- [ ] Six elements spot-checked against an authoritative external source.
- [ ] `docs/DATA_SOURCES.md` complete: dataset, URL, licence, retrieval date, output commit.
- [ ] Unit tests green.

**Verification:** _pending_ · **Commits:** _pending_

---

## Phase 3 — Periodic table engine

**Goal:** one reusable, accessible, data-driven table component with four colour modes.

**Exit criteria**

- [ ] All 118 tiles in correct grid positions, asserted for every f-block element.
- [ ] Four colour modes render; legend counts match the data.
- [ ] Group isolation works by mouse and by keyboard.
- [ ] Arrow-key navigation traverses the grid; focus always visible.
- [ ] Horizontally scrollable on narrow screens without clipping the first or last column.
- [ ] Tile geometry and colour mapping visually compared against the reference.

**Verification:** _pending_ · **Commits:** _pending_

---

## Phase 4 — Home page

**Exit criteria**

- [ ] Section order, rhythm and spacing match the reference at all three widths.
- [ ] Hovering a legend chip isolates that group.
- [ ] Element search returns correct results and navigates correctly.
- [ ] Replaces the reference's Learn block with in-scope teasers.
- [ ] Zero console errors.

**Verification:** _pending_ · **Commits:** _pending_

---

## Phase 5 — Routing and element detail pages

**Exit criteria**

- [ ] All 118 detail pages render with complete, correct data.
- [ ] Deep links work from a cold load; back and forward behave; 404 handled.
- [ ] Electron shell diagram correct for H, C, Fe, Au, U.
- [ ] Generated FAQ answers agree with the element's own property values.
- [ ] Previous/next wraps correctly at both ends.
- [ ] Degrades to a plain multi-page site with JavaScript disabled.

**Verification:** _pending_ · **Commits:** _pending_

---

## Phase 6 — Elements index and attribute rankings

**Exit criteria**

- [ ] Search filters on name, symbol and atomic number.
- [ ] Rankings monotonic; unknown values sort last; extremes spot-checked.
- [ ] All 118 cards render and link correctly.

**Verification:** _pending_ · **Commits:** _pending_

---

## Phase 7 — Alternate periodic table views

**Exit criteria**

- [ ] Four views render correct colour mappings and legend counts.
- [ ] Continuous scales verified at both domain endpoints and for an out-of-range value.
- [ ] Each view visually compared against its reference counterpart.

**Verification:** _pending_ · **Commits:** _pending_

---

## Phase 8 — Element group pages

**Exit criteria**

- [ ] Eleven group pages; member counts match the expected values exactly.
- [ ] Every member link resolves.
- [ ] Group colour applied from the token layer, no literals.

**Verification:** _pending_ · **Commits:** _pending_

> **Reminder:** the reference's `/element-groups/:slug` family has not been audited yet. Audit it live
> before implementing, and append the findings to `docs/research/01-reference-site-audit.md` §3.6.

---

## Phase 9 — Glossary

**Exit criteria**

- [ ] 418 terms render; A–Z grouping and jump index correct and complete.
- [ ] Filtering works on term and definition text.
- [ ] Every term page resolves; no dead cross-links.
- [ ] Cross-links between glossary terms and element properties resolve.

**Verification:** _pending_ · **Commits:** _pending_

---

## Phase 10 — Calculators and secondary pages

**Exit criteria**

- [ ] Conversions round-trip; `0 °C = 32 °F = 273.15 K`; `−40 °C = −40 °F`.
- [ ] Invalid input handled gracefully, no console errors.
- [ ] About and Contact contain no reference prose or brand.

**Verification:** _pending_ · **Commits:** _pending_

---

## Phase 11 — Quality, accessibility, performance and delivery

**Exit criteria**

- [ ] Accessibility sweep passed: landmarks, headings, labels, contrast AA, reduced motion, full
  keyboard traversal, focus management on route change.
- [ ] Responsive audit passed at 375 / 768 / 1024 / 1440 px on every page.
- [ ] Performance measured and recorded; no render-blocking work.
- [ ] Per-page titles, descriptions, canonical, Open Graph, structured data; `sitemap.xml`;
  `robots.txt`.
- [ ] Print stylesheet for the table and element pages.
- [ ] Documentation current; no `TODO` in tracked files.
- [ ] Deployed; `v1.0.0` tagged.
- [ ] A clean clone runs and deploys following only the README.

**Verification:** _pending_ · **Commits:** _pending_

---

## Blockers and deviations log

Record anything that stopped progress, and any deliberate deviation from the reference.

| Date | Phase | Type | Detail | Resolution |
|---|---|---|---|---|
| 2026-10-01 | 0 | Decision pending | ADR-001, ADR-002, ADR-003 awaiting author confirmation | Raised with author; ADR-001 blocks work item 0.4 |

---

## How to record a phase close-out

1. Fill every line of the close-out checklist in `docs/TESTING_STRATEGY.md` §7 — honestly.
2. Paste the checklist, filled in, into that phase's **Verification** section above.
3. List the commit hashes that make up the phase.
4. Set the phase status to `COMPLETE` in the summary table.
5. Update `RUN_STATE.md` to point at the next phase, and rewrite `HANDOFF.md`.
6. Tag the milestone if it warrants one (`docs/GIT_WORKFLOW.md` §7).
