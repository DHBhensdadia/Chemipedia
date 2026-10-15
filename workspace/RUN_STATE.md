# RUN_STATE.md — authoritative recovery checkpoint

> This file is the **first** thing a resuming agent reads and the **last** thing a finishing agent
> updates. It is a checkpoint, not a narrative. Keep it factual and current.
>
> **It is not sufficient on its own.** Always reconcile it with `git log`, `git status`, the
> working tree, and the tests before acting. See `WORKING_AGREEMENT.md` §7.

**Last updated:** 2026-10-16 (the **Phase 18** session: every gate re-run with the programme in,
the documentation finished, and the delivery done on the author's word — merged `--no-ff` as
`ba3e783`, pushed, **Pages `38803355815` green**, the live field verified **in a browser** at
**11 of 11 checks**, and **`v1.2.0` tagged** on the close-out commit. **The programme is closed.**)

---

## Current position

| Field | Value |
|---|---|
| **Phase** | **All phases are `COMPLETE` — 0 through 18.** The site is published at **`v1.2.0`**, and the live field was verified in a browser, not only by `curl`. **ADR-008 is `ACCEPTED`** and delivered |
| **Branch** | `main`, carrying the whole programme; its history is `0ba6b04` (the `v1.1.0` line) → `ba3e783` (the `--no-ff` merge) → the Phase 18 close-out commit, with **`v1.2.0`** tagged on it |
| **Objective (this programme)** | Answer the review finding that the page field is a flat fill and a reader's first impression is a static document. The field is four CSS layers drawn from the site's own group colours — the wash with the page family's own bloom, the lattice (the atom stage's own 28 px grid at paper strength), and the grain — with a slow compositor-only drift; the planned fourth layer, the vignette, was **cut in the build** and the cut recorded (`docs/research/06` §8). Phase 17 added the motion-and-depth layer: platform-native reveals that rise and never fade, a pointer light that only brightens, a masthead that frosts on scroll, a route cross-fade that refuses under reduced motion, and one measured depth pass over the elevation ladder. Every hue is a `--g-*` token, the contrast bound is derived from `--ink-faint`'s own 4.99:1, print and reduced motion get the designed still field, nothing depends on script, and no animation spends a contrast the tokens never promised. Planned in `docs/IMPLEMENTATION_PLAN.md` §3; measured in `docs/research/06`; **ADR-008 governs and is delivered** |
| **Work item (previous phase)** | 18.3 `COMPLETE` — the delivery: merge `ba3e783`, Pages `38803355815` green, the live checks 11 of 11, `v1.2.0` tagged. **It was the programme's last item** |
| **Status (this feature)** | **The living paper is built, gated, documented and delivered.** Phase 18 re-ran every gate on the programme's final tree — **a11y 0 defects / 29 informational across 20 pages; responsive 80 of 80; performance worst shift 0 (107 ms and 102 ms slowest cold loads across the two closing runs; one 77 ms long task on `/atoms/` in the busier run and none quiet — the recorded run-to-run spread, not a gate); Lighthouse a11y 100 and BP 100 on all eight pages (SEO 100; performance recorded, mean 89); atmosphere 106 of 106; motion 62 of 62; suite 732 pass, 0 fail; print `8 sheets × 1`** — and the live delivery check held **11 of 11** (four sheets drawn, both drifts running, reduced motion still at 0 animations, 0 console errors, 0 failed requests, no response over 400) |
| **Current commit** | `main` at the Phase 18 close-out commit, **`v1.2.0`** tagged on it, `origin/main` in sync; `feature/living-paper` merged and deleted |
| **Next action** | **None — the programme is closed and the plan has no next phase.** A new finding opens a new phase in `docs/IMPLEMENTATION_PLAN.md` §3 first; publishing stays the author's step (`docs/GIT_WORKFLOW.md` §8) |

## No work item is open

The programme closed with `v1.2.0`. Scope for anything new lives in `docs/IMPLEMENTATION_PLAN.md`
§3 first, and a change to what exists lands where the mind map says it lives:

```
the field                 source/styles/atmosphere.css + the §22 tokens in source/styles/tokens.css
the motion                source/styles/motion.css, scripts/components/{pointer-light,masthead-frost}.js
the cross-fade            source/scripts/router/router.js
the gates                 workspace/tools/visual/audit-atmosphere.mjs, audit-motion.mjs
the record                progress/PHASE_LOG.md · docs/research/06 · docs/ARCHITECTURE.md (ADR-008)
```

Every new file must appear in `docs/MIND_MAP.md` in the same commit; `styles/tokens.css` is over the
ceiling and remains the standing exception; `motion.css` shipped at 69 lines, `pointer-light.js` at
224 and `masthead-frost.js` at 109, all under the 400-line law; and
`tests/components/pointer-light.test.js` crossed the ceiling at 412 — recorded in the Phase 17 entry
with its seam named.

## Work item ledger

| Item | Status | Verification | Commit |
|---|---|---|---|
| 0.0–0.5 Foundation | `COMPLETE` | See the Phase 0 entry in `progress/PHASE_LOG.md` | `81bf871`..`a16d35e` |
| 1.0–1.8 Design system and shell | `COMPLETE` | See the Phase 1 entry; 51 tests at the time | `2ba459d`..`cc2151f` |
| 2.0–2.6 Data layer | `COMPLETE` | See the Phase 2 entry; the visual gate, run late, found and fixed two chrome differences | `d985245`..`97169ed` |
| 3.0–3.5 Table engine and its capture | `COMPLETE` | See the Phase 3 entry; every box measured against the reference | `bf1d8e3`..`2f06018`, `1db2fc7` |
| 4.0–4.6 Home page and the harness | `COMPLETE` | See the Phase 4 entry; table crop 2.28% at 1280px with no box differing in size | `7587a66`..`7837dce` |
| 5.0–5.6 Routing and the element pages | `COMPLETE` | See the Phase 5 entry; 278 tests, the router verified in a browser | `4763e89`..`2cd6460` |
| 6.0–6.6 Elements index and attribute rankings | `COMPLETE` | See the Phase 6 entry; the index's card grid and the ranking pages' skeletons measured live | `6cd3b14`..`44e3493` |
| 7.0–7.6 The four alternate table views | `COMPLETE` | See the Phase 7 entry; 369 tests, four pages captured and pixel-diffed | `a0b0df8`..`d1a4ad4` |
| 8.0–8.6 Element group pages | `COMPLETE` | See the Phase 8 entry; the table region 0.53% / 1.98% / 0.73% of the reference's and identical in size | `a49dd6d`..`54832b4` |
| 9.0–9.8 The glossary | `COMPLETE` | See the Phase 9 entry; 413 tests, the index 4.66% / 4.53% / 5.55% of the reference's and a term page 3.60% / 3.84% / 5.11% | `5a05a1f`..`73fbb47` |
| 10.0–10.7 Calculators and secondary pages | `COMPLETE` | See the Phase 10 entry; 458 tests, the calculator audited live, print measured by page count at A4 and Letter | `df4d60e`..`b9999d3`, `dc59554` |
| 11.0 The accessibility sweep, and the 443 contrast failures it found | `COMPLETE` | `tools/visual/audit-a11y.mjs` measures 19 pages for landmarks, heading order, names, captions, contrast against the surface each colour is composited over, the table's roving tab stop and reduced motion, exiting non-zero on a defect. `--ink-faint` `#5b726e`; the legend counts are ringed rather than washed | `f1cef8e`, `969cbdf` |
| 11.1 The responsive sweep over four widths | `COMPLETE` | `tools/visual/audit-responsive.mjs`: 19 pages at 375 / 768 / 1024 / 1440 → **76 of 76** fit, exit 0. Found the orbital-configuration rows spilling 68px at 375px | `7269c9f`, `04a9e45` |
| 11.2 Per-page metadata, and the two crawl files | `COMPLETE` | `tools/document.js` writes canonical, Open Graph, a `summary` Twitter card, JSON-LD per page (a `Thing` naming the element on its own page), a 562-`loc` `sitemap.xml` from the routes actually written, and `robots.txt`. `SITE_ORIGIN` with a reserved `.example` default | `bf44dd7` |
| 11.3 The build split the 400-line law forced | `COMPLETE` | `tools/document.js` owns what a document looks like; `build.js` owns what is on the site. Behaviour unchanged: same 562 routes, same sitemap | `3b3b09f` |
| 11.4 The home page's blocks drawn at build time | `COMPLETE` | `homePageValues` computes the table, both diagrams and the finder; `startHome` only attaches. Layout shift **0.315 → 0**; 118 tiles and 236 diagram cells present with the script off; no duplicate id | `06c5e76` |
| 11.5 The performance sweep, and the shift it found | `COMPLETE` | `tools/visual/audit-performance.mjs`: six pages cold, reporting timings, bytes, shift and long tasks; exits non-zero over a 0.1 shift or a 2000ms load. Worst shift 0, slowest load 38–41ms across runs, 0 long tasks | `8869b4c` |
| 11.6 Lighthouse, and the four defects it found | `COMPLETE` | `tools/visual/audit-lighthouse.mjs` over seven pages, gating accessibility at 1.0 and best-practices at 0.95. Fixed the faded tile ink (4.32:1), the drained tiles (1.5:1), the element page's orphaned list items and three label-content-name mismatches | `5cc54d1`, `964bf80` |
| 11.7 The deployment, and the reference's metadata audited | `COMPLETE` | `.github/workflows/pages.yml` computes its own origin, builds, tests and hands `dist/` to Pages. `research/01` §5 records the reference's metadata live: no JSON-LD, a 404ing favicon, a 404ing `/sitemap.xml` | `b741a49`, `1c431ee` |
| Publish — the push, and the deployment it corrected | `COMPLETE` | The author's one-time step ran on request: `git remote add origin`, `main` and both tags pushed, every commit attributed on GitHub to `DHBhensdadia` with `Devansh <dhbhensdadia@gmail.com>` and a single contributor in the API's own count. Pages enabled with `build_type=workflow` — the first run failed in `configure-pages` for want of a Pages site, and its rerun was green. The live address then showed the defect a local root cannot: every URL was rooted at the domain instead of at `/Chemipedia/`. Fixed in `bd338dd`: the finished document is rewritten once at build time, the data fetch and the browser's own link read the site's path from `scripts/lib/site-path.js`. Verified: 497 tests, a simulated subpath build of 563 documents with no URL outside the site and none doubled, 118 tiles from the live data, and a live client-side navigation. | `e035c6f` (the push), `bd338dd` (the fix), tagged `v1.0.1` |
| 11.8 Documentation close-out, and the `guides/` audit it turned up | `COMPLETE` | README, `MIND_MAP.md`, `research/01` §5, this file, `HANDOFF.md`, the Phase 11 entry — and all four guides audited against the source, which found three of them drifted: 18 `(pending)` rows and functions that were never exported, a file tree naming three files that do not exist, and a page trace that had the element page hydrating when it runs no script at all. MIND_MAP completeness: 168 files under `source/`, 0 missing | `ec80c43`, plus the close-out commit |
| 12.0 The plan, the branch and the second reference's audit | `COMPLETE` | `docs/IMPLEMENTATION_PLAN.md` §2 row 17 and §3's four phases, `docs/research/04` (the reference's scene parameters and the bottom bar's geometry, measured from its own bundles and stylesheets), `MIND_MAP.md`, this file and `HANDOFF.md`. Branch `feature/atom-3d` cut from `main` at `a22c0d2`; no source file exists yet | this branch's first two commits |
| 12.1 The 4x4 arithmetic | `COMPLETE` | Column-major throughout, the product's order asserted, every malformed argument refused. 13 tests | `e748de5` |
| 12.2 The orbit camera | `COMPLETE` | Spherical state with an aim the camera eases toward at a frame-rate-independent rate; polar limits strictly inside the poles. 10 tests | `19bc719` |
| 12.3 The two meshes | `COMPLETE` | A sphere and a tube, generated rather than loaded, every triangle wound counter-clockwise from outside, index width named rather than truncated. 10 tests. Named `primitive-geometry.js` rather than `sphere-geometry.js`, and the ring is a tube rather than a flat band — a band vanishes when the camera looks along an orbit's plane | `f557ea3` |
| 12.4 The layer | `COMPLETE` | The GLSL and `createProgram`; the meshes and their buffers; the frame loop, injectable and tested without a canvas; the WebGL2 view, where everything hangs on `available()` and a program that will not build is a viewer that says so. 46 tests through a recording WebGL stub. `atom-meshes.js` and `frame-loop.js` came out of `atom-view.js` to bring it under the line ceiling | `adcbbe5` |
| 12.5 Proved on the style guide, and the numbers recorded | `COMPLETE` | `styleguide/atom-demo.js` drives the layer on the stage; `tools/visual/audit-atom-renderer.mjs` asks 25 questions and they all hold with **0 console messages and 0 failed requests**. Numbers in `docs/research/05`. Measuring found a defect the stub could not — the particle draw used a vertex array that left the sphere's own attributes unbound, so every sphere collapsed to a point at its centre — fixed with a regression test proved against the defective revision | `cb570b3` |
| 13.1 The point distribution a nucleus is built on | `COMPLETE` | `scripts/lib/point-sphere.js` and its 11 tests: the count asked for, an empty set at zero rather than an error, the furthest point on the radius with nothing outside it, the centroid on the origin, nearest-neighbour spacing even to within 14%, a mean distance above 0.97 so it is a ball and not a shell, and the refusals | `c3b2aaf` |
| 13.2 The atom model | `COMPLETE` | `scripts/lib/atom-model.js` (348 lines) held by **28 tests** in `tests/lib/atom-model.test.js` and `tests/lib/atom-electrons.test.js` over the shared `tests/lib/atom-fixtures.js`: a nucleus of the count it was given with nothing outside its own radius, protons spread through the point order, an orbit clearing the nucleus from hydrogen to oganesson, one ring per shell with Kepler's three-halves asserted as a ratio, the textbook shell capacity as a fallback and the record's own value winning, the isotope and the charge in words and the honest sentence where neither applies, and the refusals. Suite: **636 pass, 0 fail**; `node --check` clean on every module | `7223652` |
| 13.3 The atom, alive on the layer | `COMPLETE` | `scripts/components/atom-scene.js` (289 lines): the two lists the layer takes, one instanced draw a frame, the cells of `pointSphere`'s own scale, the electrons moved on the scene's clock, the atom's slow turn from `--atom-spin`, the shake as an impulse decaying as `e^(−decay · dt)`, and one token reader feeding both the model's scale and the draw, so a nucleus cannot be built at one size and drawn at another. **20 tests** in `tests/components/atom-scene.test.js`, `atom-motion.test.js` and `atom-camera.test.js` over the shared `tests/components/atom-harness.js`, which reads `tokens.css` itself: on a machine with no WebGL2 a scene draws nothing and still answers, a shake measured over one second turns the atom more than four times its idle rate and is back inside five per cent four seconds later, a speed of three moves the electrons three times as far, and changing the speed mid-flight does not move them at the instant it changes. Suite: **636 pass, 0 fail** | `b1e7761` |
| 13.4 The style guide driving the model, and the scene's numbers recorded | `COMPLETE` | `styleguide/atom-demo.js` drives the model and the scene from a picker over all 118 records, three free count fields, a speed, a shake and a reset; `tools/visual/audit-atom-scene.mjs` asks 33 questions and they all hold with **0 console messages and 0 failed requests** — all 118 elements drawn as themselves, five elements and three count changes proved to be different frames by hash, every extreme the plan names, and the heaviest atom the feature allows (382 particles, 7 rings, 8 draw calls) at **0.258 ms** a frame against a 16.70 ms cadence at 1280 x 800. The run is recorded in `docs/research/05`. Measuring found a defect the unit tests could not: `buildAtom` with no protons and no neutrons asked `pointSphere` for a cluster of radius zero and threw, so a reader's three zeros were an error on a page — fixed with an empty point set, held by a model test and a scene test. Suite: **636 pass, 0 fail** | `3cf6661` |
| 14.1 The route, the navbar item and the order | `COMPLETE` | `/atoms/` declared with `nav: { label: "Atoms", order: 2 }`; *Periodic Table* stays at 1 and *Elements*, *Glossary* and *Calculators* move to 3, 4 and 5, which `tests/router/navigation.test.js` now holds as the author's order. The build renders 563 routes | `861307d` |
| 14.2 The page, the bar and the three fallbacks | `COMPLETE` | `pages/atoms.js` writes a finished page — hero, the element's shell diagram, the counts in words and the whole bar — and `components/atom-stage.js` replaces the diagram with the scene once a frame is drawn; `lib/atom-words.js` holds the sentences both halves use. Protons stop at 118 and the free counts go past every element, and the card names the element when the counts name one and says so plainly when they do not. `tools/visual/audit-atom.mjs` asks 38 questions and all hold with **0 console messages**: the stage paints in the token layer's colours, every control changes the render by pixel hash, the live region and the canvas' name follow the counts, a paused loop is still, a reduced-motion reader gets a still frame and a working Play control, a reader with no WebGL2 keeps the diagram and is told why, a reader with no scripting keeps the whole built bar, and three widths fit with no overflow. Suite: **656 pass, 0 fail** | `861307d` |
| 14.3 The way in, the fragment, the two sweeps and the split | `COMPLETE` | Every element page carries one link into the viewer under its shell diagram — `/atoms/#<slug>`, named for the element — and `elementFromFragment` opens the page on the element a fragment names, falling back to the built element when it names none; both are held by tests, and the browser audit follows the link with a real click through the router. `/atoms/` joined the site-wide sweeps: **0 defects / 29 informational across 20 pages** and **80 of 80** page-and-width combinations, both exit 0. The page's own audit now asks **54** questions, all held, with 0 console messages and 0 failed requests — including the keyboard walk of the bar and the ring on the dark stage. Measuring found two defects (a repository passed where a list was expected; the bar's link at 1.47:1) and the working agreement found a third (`routes.js` at 401 lines, split into 362 + `router/route-sheets.js`). Suite: **658 pass, 0 fail** | `190a08b` |
| 15.1 The last two gates, with the page in them | `COMPLETE` | `/atoms/` added to the performance and Lighthouse page lists and both re-run: performance **worst shift 0, slowest load 35 ms, 0 long tasks** across seven pages, with the new page at 25 ms cold, 428 KB, shift 0; Lighthouse **accessibility 100, best-practices 100, SEO 100, performance 78** (mean over eight pages 100/100/100/89). Performance recorded, not gated, as Phase 11 decided. Re-measured on the review build — the split module and the new light, one run later — the same shape: **worst shift 0, slowest load 40 ms**, `/atoms/` at 29 ms cold and 442 KB, still 0 long tasks | this commit |
| 15.2 The page's own frame time, measured against itself | `COMPLETE` | `audit-atom.mjs` measures the browser's own `requestAnimationFrame` timings over 90 frames twice — with the heaviest atom the published controls allow turning, and with the same page held still — and counts long tasks in both windows. The page is vsync-bound and stays vsync-bound: **median 16.70 ms turning, 16.70 ms still, worst 16.80 ms, 0 long tasks**. 54 → **57** claims, all held, exit 0; recorded in `docs/research/05` | this commit |
| 15.3 ADR-007 and the documentation | `COMPLETE` | `ARCHITECTURE.md` gains **ADR-007** (raw WebGL2, no library, tokens as the palette, progressive enhancement, the model pure and the scene clocked) with its options, consequences and reversal cost; `DESIGN_SYSTEM.md` gains §1.7 (the 53-value token group) and §7 (the dark stage's four rules); `BRAND_GUIDELINES.md` §9 (the second reference: what we took, what never enters the repository); `DATA_SOURCES.md` §7 (no new data, and copper as the derived number's visible exception); all four guides and the tour corrected against the source; the README at the branch's own counts. **And the second reference's name is now enforced** by `tests/brand/brand.test.js` rather than verified by hand | this commit |
| 15.4 The delivery | `COMPLETE` | **Done on the author's word.** `feature/atom-3d` merged `--no-ff` as `ad58ee2` and pushed; the **Pages run `37638178700` succeeded** (build and deploy, with the two known Node 20 deprecation notices); the subpath build wrote **564 documents with 0 URLs outside `/Chemipedia/`**; six browser audits on that build held — atom **57**, scene **33**, renderer **25**, accessibility **0 defects / 29 informational across 20 pages**, responsive **80 of 80**, performance **worst shift 0, 38 ms slowest cold load, 0 long tasks**; and **live in a browser**: `/atoms/` answers, draws (the canvas not hidden, the atom's name on it, 0 console errors, 0 failed requests) and a real click from `/periodic-table/properties-and-states/` to `/elements/` lands on the same 11 stylesheets, the same measured styles and the same screenshot as a full load. `v1.1.0` is tagged on the close-out commit | `ad58ee2` + the close-out commit |
| 16.0 The plan, the branch and the living-paper audit | `COMPLETE` | `docs/IMPLEMENTATION_PLAN.md` §3's Phases 16–18, with §2's programme paragraph, §4's graph, §5's estimate and §6's six new risks; `docs/research/06-living-background-and-motion-audit.md` — eight reference-grade sites' fields measured in the same headless Chrome the visual harness uses, the seven techniques that recur, and the contrast budget derived from `--ink-faint`'s own 4.99:1; `docs/ARCHITECTURE.md` ADR-008 `PROPOSED`; `MIND_MAP.md`; `AGENTS.md`'s ADR table brought current; this file and `HANDOFF.md`. Branch `feature/living-paper` cut from `main` at `0ba6b04`; no source file exists yet | this branch's first two commits |
| 16.1 The field: tokens, the sheet, the bound and the gate | `COMPLETE` | `tokens.css` §22 — every bloom a `--g-*` reference with its anchor and its alpha cut under its own derived ceiling, the lattice at the table's own 28 px pitch and 1.1 %, the grain at 1 % effective, the 4 % bleed corrected by the 1.08 scale, the drift at 180 s / 240 s, the family map, and the narrow query's 0.88 wash. `styles/atmosphere.css` (273 lines): four fixed pseudo-elements on `html`/`body` at `z-index: -1`, no background on `html` so the canvas keeps propagating, the family overrides keyed off `body[data-page]` — nine names, four default templates — two animations inside the no-preference gate, print strips all four; the build links it as the fourth global sheet. `tests/lib/backdrop.test.js` grew to **14 tests**, including the plan's overlap bound scanned over every family × four reference viewports with the texture charged at its worst: floor **4.575 : 1**. `audit-atmosphere.mjs`: **106 of 106 claims, exit 0** — worst on-field text **4.79 : 1**, the kill switch moving 4–7 LSB, print bare paper, the no-script anchor `#f8f8f6`, three phone frames at 0 px, and a lived-in drift window at **120 frames / 16.7 ms median / 0 long tasks / 0 shift**. The family-pair defect the pixels caught (a `:root` alias froze the family hue before any page override; the fix reads the pair on the sheet that paints it) is recorded in the Phase 16 entry. Suite **695 pass, 0 fail** | `ae2fad9` · `ba1647a` · `e4b4c00` · `27115dc` · `53c5715` · `6336dc0` · `a34b552` |
| 16.2 The style guide, the widths and the close-out | `COMPLETE` | The guide's **the living paper** section: a swatch per bloom and per family — each the composite the tokens draw — the pages each family covers read off the atmosphere sheet, all **54** `--field-*` tokens listed with computed values, and a live reduced-motion line; everything read from the stylesheets the page renders. Seen at 1280/768/375, with two small repairs (the token rows and the type scale's demo words now wrap; the guide fits every width). One page per family seen at all three widths, differences named in the entry (family anchors from `#fcf6f3` table to `#f8f7f5` default at 1280/768; at 375 the masthead's paper band covers the bloom's core — recorded in `research/06` §8). The three site-wide sweeps unchanged: **0 defects / 29 informational across 20 pages**, **80 of 80**, **worst shift 0, 37 ms slowest load, 0 long tasks**; print re-measured as **8 PDFs, 1 sheet each**; console and network clean across twelve pages and the guide. `research/06` §8, the Phase 16 entry, this file and `HANDOFF.md` | `6b1cb2d` + the close-out commit |
| 17.1 The light that only brightens | `COMPLETE` | `scripts/components/pointer-light.js` (224 lines): a 46vmax white disc at α 0.4, clean again at 70 % of its radius, driven through three custom properties (tokens §23), one more gradient on the near sheet (`atmosphere.css` grew 260 → 273); fine pointers only and absent under reduced motion, each watched so the preference flips both ways; a touch never drives it even where the primary pointer is fine; eased at the orbit camera's own 8/s and off the shared frame loop the moment it arrives — a page nobody is pointing at writes nothing. 16 tests; wired once in `app.js` | `6016588` |
| 17.2 The frosted band | `COMPLETE` | `scripts/components/masthead-frost.js` (109 lines) answers for the readers the timeline gate leaves out — no scroll-driven animations, or reduce — with the `is-frosted` class, the same frost applied instantly; where the timeline runs, `site-header.css` frosts the band at paper 0.96 behind an 8 px blur over 160 px, derived so the faintest ink keeps AA over the darkest ground the site can scroll beneath it (4.64 : 1 over the stage, 4.57 : 1 over black). No listener where the timeline runs | `d232d30` |
| 17.3 The rise | `COMPLETE` | `styles/motion.css` (69 lines): sections and the `-list`/`-grid`/`-cards` lists rise as they enter through `animation-timeline: view()` inside `@supports`, over a fixed 300 px of scroll, scrubbed `linear`; the unsupported and reduced-motion baselines are the finished page; the build links it as a global sheet. The first build faded as it rose — 17.6 records what the gate did with that | `9fa4267` |
| 17.4 The cross-fade | `COMPLETE` | `commit(next, top)`/`mayFade()` in `router.js` wrap only the swap and the settle, feature-detected and refused under reduce; history moves never fade; the wrap lands after the head so the arriving page is only ever faded in in its own sheets; `motion.css` gives both root snapshots the house's 0.3 s instead of the platform's default. `tests/router/dom-fixtures.js` extracted — `router.test.js` 484 → 342, back under the ceiling — and `tests/router/crossfade.test.js` holds the four decisions | `5279ae0` |
| 17.5 The ladder, one step | `COMPLETE` | `--shadow-lg: 0 10px 30px #15403d12` (α 0.071, under md's 0.078; faint over the wash 4.51 / 4.35 / 4.43 : 1 across sm / md / lg). Cards, tiles, chips and the similar-element tiles lift on hover and focus alike; the pinned chip holds md (its own rule, so hover wins); member rows stay sm; panels stay flat; the group surfaces gained their `:focus-visible` twins | `a357370` |
| 17.6 The gate, the split, and the fade the gate refused | `COMPLETE` | `tools/visual/lib/pixels.mjs` extracted (audit-atmosphere 394 → 370, **106 of 106** still holding); `audit-motion.mjs` written — **62 of 62 claims, exit 0**: the light follows to 1.000 and lifts 5,660 samples ≤ 4 LSB with none dropped, absent under stillness and on a coarse pointer; the frost over the stage `#f3f2f1`, faint **4.61 : 1**, the fallback identical; twelve family pages walked, every reveal settled (7/7 home, 53/53 glossary); reduce settles everything at load with **0 animations**, print likewise; a forward move is one fade at 0.3 s landing at the top with focus on `main`, history restoring 800 px without one; the ladder read back to the token; 16.7 ms median turning against 16.7 ms still, 0 long tasks. The battery's first run failed where the eye could not — Lighthouse a11y 96–97 on five pages, against a fade the a11y sweep could not see — so the reveal became the movement alone, the a11y sweep composites the ancestor chain, and a mid-rise section is held fully opaque. After: **Lighthouse a11y 100 on all eight pages**, a11y **0 defects / 29 informational**, responsive **80 of 80**, performance **worst shift 0, 79 ms slowest, 0 long tasks**; suite **732 pass, 0 fail** | `54a44a6` + the close-out commit |
| 18.1 Every gate, re-run with the programme in | `COMPLETE` | All six exit 0 on the programme's final tree: a11y **0 defects / 29 informational across 20 pages**; responsive **80 of 80**; performance **worst shift 0**, 107 ms and 102 ms slowest cold loads across the two closing runs (one 77 ms long task on `/atoms/` in the busier run, none quiet — the run-to-run spread recorded, not gated); Lighthouse **a11y 100 / BP 100 on all eight, SEO 100** (performance recorded, mean 89); atmosphere **106 of 106**; motion **62 of 62**; suite **732 pass, 0 fail**; print re-measured **eight sheets, one each**. Logs in `workspace/screenshots/phase-18-*.txt` (local run records) | recorded in the Phase 18 entry, committed `511be78` |
| 18.2 The documentation close-out | `COMPLETE` | `DESIGN_SYSTEM.md` §1.8 + §9; `BRAND_GUIDELINES.md` §3's one recorded exception with ADR-008 as the reason; ADR-008's measured numbers and its delivery clause; `docs/research/06` §9–10; all four guides and their README; the README's living-paper paragraph and gate lines; `AGENTS.md`'s ADR note in the past tense. MIND_MAP checked against the tree — **225 files under `source/`, none missing** (nothing added, renamed or moved). `TESTING_STRATEGY.md` audited and left untouched: it carries no stale claim | `511be78` |
| 18.3 The delivery | `COMPLETE` | **Done on the author's word (2026-10-16).** `feature/living-paper` merged `--no-ff` into `main` as `ba3e783` and pushed; the **Pages run `38803355815` succeeded** (build 22 s, deploy 12 s, with the known Node 20 deprecation notices); and the live field was verified **in a browser** rather than by `curl` — the four sheets drawn, both drifts running with their clocks advancing, reduced motion still at **0 animations**, **0 console errors / 0 failed requests / no response over 400** — **11 of 11 live checks** (captures in `workspace/screenshots/live-v1.2.0-*`, local only). **`v1.2.0`** tagged on the close-out commit; the branch deleted | `ba3e783` + the close-out commit |

Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Accepted decisions

All **eight** ADRs stand, and **ADR-008 (the living paper) is `ACCEPTED` and delivered** — the author
approved the plan in `docs/IMPLEMENTATION_PLAN.md` §3, and the measured numbers of its three phases
joined the record when Phase 18 closed the programme and delivered `v1.2.0` (the ADR's closing
block; `docs/research/06` §8–10). Four decisions from Phase 11 join the set:

| Decision | Why |
|---|---|
| **Everything a reader is meant to read is written at build time.** | The home page was the last exception and it cost a 0.315 layout shift and a table-less page for a crawler and for a reader whose script did not run. Every family is now rendered by the build from the same functions the browser would have used, and a page's behaviour only **attaches** to markup that is already there. |
| **Where the reference's own value fails AA, accessibility wins and the deviation is recorded.** | The reference's tertiary ink is 3.06:1 on our paper and its isolation dims text to 1.5:1. We darkened the ink and drain the fill instead of the tile, and both costs are written down in `DESIGN_SYSTEM.md` and in the Phase 11 deviations table rather than quietly absorbed. |
| **A canonical link is configuration, and the default cannot resolve.** | `site-origin.js` reads `SITE_ORIGIN` and falls back to a reserved `.example` address, and the build says on every run that the placeholder is in place. A confident, wrong canonical is worse than none, and the workflow passes the real origin in. |
| **The deployment is a workflow; publication is the author's step.** | `docs/GIT_WORKFLOW.md` §8 makes publishing deliberate and author-approved. The workflow, the routing fallback and the README's steps are the deliverable; the push was not claimed until it happened, and both it and the `v1.2.0` delivery happened on the author's instruction. |
| **A site that declares where it lives must place every URL inside that path.** | The live address is a project site, served from `/Chemipedia/`. A path written from the site's own root is right locally and leaves the site in production, and two of them cannot be rewritten after the fact: a request for a data file, and a link the browser writes after the page has loaded. So the deployment's path is read once in the build (`tools/site-origin.js` → `rootedAt` in `tools/document.js`) and once in the browser (`scripts/lib/site-path.js`, off the module's own address) — and a deployment served from a path is a case the suite covers, not a hope. |
| **Derive a claim rather than assert it.** | Unchanged, and now applied to nine families: the fading ceiling is derived from the eleven group fills by `lowestAlphaForAA` rather than chosen, and a test holds every fading token above it. |
| **The field's contrast budget is derived from the ink ladder, not chosen.** | The living paper's caps — one bloom at a time where text sits, ≤ 5 % for the four dark group hues, ≤ 8 % for the light ones, lattice and grain ≤ 2.5 % — are spent from `--ink-faint`'s own shipped 4.99:1 on the paper, derived in `docs/research/06` §6 and **held** by `tests/lib/backdrop.test.js` (the overlap scan floors at 4.575 : 1); the browser audit reads the real pixels at the drift's extremes and finds **4.79 : 1** at its worst on the closing run. The pointer light is white-based, so it can only raise the field's luminance and sits outside the budget by construction. |
| **The reveal moves and never fades.** | The entrance fade was real for one day of the build: it made a section mid-flight draw its text below the contrast every token promises, and the Lighthouse gate failed five pages for it while a still-page sweep could not see it. The reveal is the rise alone — no opacity is animated anywhere — and `audit-motion.mjs` holds a mid-rise section moved and fully opaque. The general rule: an animation may not spend a contrast the tokens never promised. |
| ADR-001..008, all accepted | Unchanged; ADR-008's numbers were measured across its three phases and are recorded in the ADR's closing block and `docs/research/06` §8–10. See `docs/ARCHITECTURE.md` and the phase log. |

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| **The deployed address is not a domain root** | It is a project site served from `/Chemipedia/`, so a URL written from the site's own root leaves the site and 404s — which is what the first deployment did | The path is read from the origin once (`tools/site-origin.js`), the finished document is rewritten once (`rootedAt`), the data fetch and the browser's own link go through `scripts/lib/site-path.js`, and a subpath-simulated build is part of the recovery steps below. `v1.0.1` is the fix; `v1.0.0` is the release that exposed it, deliberately left where it is. |
| **Deprecation notices on every Pages run** | `checkout@v4`, `setup-node@v4`, `configure-pages@v5`, `upload-artifact@v4` and `deploy-pages@v4` target Node 20 and are being forced onto Node 24; `ubuntu-latest` moves to Ubuntu 26 on 2026-10-19 | Cosmetic today: both jobs succeeded in every run with the notices on them, the `v1.2.0` run included. Bumping the action versions is one line each and is deliberately not bundled into a deployment fix. |
| The preview webview does not composite | The panel's own screenshot tool may still fail; it is not on the critical path | `workspace/tools/visual` captures, diffs and measures in headless Chrome. The programme closed on its six gates and a live browser check rather than on a capture. |
| The preview window has no operating-system focus | `focus`, `blur` and real key events are never delivered, so tab-order and hover behaviour cannot be exercised as a person would | The harness's own Playwright pages are real browsers; every keyboard check this project has run went through them. |
| Three pages have no reference to compare with | About, Contact and the downloads page cannot be pixel-diffed against anything | Accepted since Phase 10: the evidence for those three is the accessibility, keyboard, overflow and link checks rather than a diff. |
| Our group band wraps to two rows at desktop | Twelve group names do not fit the shell's 1100px in one row | Recorded as a deliberate deviation in `progress/PHASE_LOG.md`. Visible again in the programme's 768px home captures as the legend wrapping, where the reference's does not. |
| Nine glossary deviations, one of them an undelivered deliverable | The plan's deliverables list an expanded explanation on a term page; the reference has none, and 418 paragraphs of new prose have no source to audit against | Recorded at the top of its deviations table in `progress/PHASE_LOG.md`. The phase's exit criteria do not ask for it. |
| A swap is easy to get subtly wrong | The router touches the document's title, description, body, focus and scroll | `tests/router/router.test.js` holds all of them under fakes, and the programme re-checked the roving tab stop after an in-page navigation. |
| `covalentRadius` and `latticeParameters` are `null` for all 118 | Two rows of an element page read "Unknown" | Recorded in `docs/DATA_SOURCES.md`; filling them needs a third source and touches one adapter, no page. |
| The typeface is not the reference's | Every page's text measures a few per cent differently, which inflates the harness's crop numbers | A Phase 1 deviation, recorded. It is the class of difference the 1280px home capture's 2.31% belongs to. |
| Lighthouse's performance score moves between runs | A recorded number can look like a regression when the machine is busy | `audit-lighthouse.mjs` records performance and SEO rather than gating them, and the phase entries state the readings (88 last run, 89 closing) with the reason. Only accessibility and best-practices gate. |
| The living paper's field moves, so one screenshot cannot verify it | A moving field behind text is where a contrast defect would hide, and every existing sweep screenshots still pages | The caps are derived from `tokens.css` in `tests/lib/backdrop.test.js` (fourteen tests, overlap floor 4.575 : 1), and `audit-atmosphere.mjs` — holding **106 of 106 claims** — samples real composited pixels behind every sampled text run at the drift's extremes, where the field is darkest (worst **4.79 : 1**); `audit-motion.mjs` — **62 of 62 claims** — holds the same discipline for the motion layer, from the light's lifted pixels to a mid-rise section that must stay fully opaque. The live delivery check is one-shot for the same reason and is recorded in the Phase 18 entry. The programme's full risk register is `docs/IMPLEMENTATION_PLAN.md` §6. |
| **A custom-property alias at `:root` can freeze a per-page hue** | A `var()` inside a custom property is substituted where the property is **declared**, so an alias on `:root` resolves before any `body[data-page]` override can matter — every computed property and token test reads correct while every page wears one colour. This happened once, in the family bloom, and only the pixel audit caught it | The family pair is read on the sheet that paints it (`atmosphere.css`), never through a root alias; `tests/lib/backdrop.test.js` holds both halves — no root alias for the family hue, and the sheet reads `--field-family-hue`/`--field-family-alpha` itself — and the audit's anchors must differ per family, with the kill switch stopping a vacuous pass on a pale page. Recorded in the Phase 16 entry and `docs/research/06` §8. |
| **At 375 px the family bloom's core sits behind the masthead** | The masthead's own paper band is 280-odd pixels tall on phones, so the family's tint is not readable at phone width (≤ 2 LSB below the band); the field there is the lattice, the grain and the far sheet's corner blooms | Recorded, not patched: `docs/research/06` §8 and the Phase 16 entry. The delivery left the composition as it stands — recorded rather than patched — and the family differences are measured present at 1280 and 768. |
| **An animated ancestor can hide a contrast defect from a still sweep** | Text is composited at its own alpha times every ancestor's; the entrance fade lived on a section, and a sweep reading the text element's own opacity passed the five pages Lighthouse failed | `audit-a11y.mjs` multiplies the whole ancestor chain into the text's alpha the way a browser composites it; no opacity is animated anywhere; and `audit-motion.mjs` holds a mid-rise section fully opaque. Recorded in `docs/research/06` §9 and the Phase 17 deviations table. |

## Deliberately unfinished

**Nothing is in flight. All phases are `COMPLETE` — 0 through 18 — and the site is published at
`v1.2.0`**, verified live in a browser at <https://dhbhensdadia.github.io/Chemipedia/>. The
delivery was the plan's last item: merging, pushing, the Pages run, the live checks and the tag all
ran on the author's word on 2026-10-16, and each is recorded with its evidence in the Phase 18
entry.

Four deferrals stand, each recorded where it belongs:

1. **The plan's "expanded explanation" on a term page** — not delivered in Phase 9, because 418
   paragraphs would have no source to audit them against.
2. **Two schema fields** that no acceptable source supplies (`covalentRadius`, `latticeParameters`) —
   see `docs/DATA_SOURCES.md`.
3. **The typeface** — not the reference's, recorded as a Phase 1 deviation.
4. **Twelve files over the 400-line ceiling under `source/`, inherited rather than fixed** —
   `styles/tokens.css` (**995** — the standing exception, the programme's §22–23 additions included),
   `styles/pages/element-detail.css` (523),
   `tests/lib/atom-model.test.js` (518),
   `tests/pages/glossary.test.js` (473),
   `tests/components/periodic-table.test.js` (444),
   `styles/components/periodic-table.css` (457),
   `scripts/components/atom-view.js` (441),
   `scripts/lib/matrix4.js` (421),
   `tests/components/pointer-light.test.js` (412 — the light's easing and its two environmental
   answers in one file, seam named in the Phase 17 entry),
   `tests/components/atom-view.test.js` (412),
   `tests/lib/backdrop.test.js` (418 — the Phase 16 overlap scan, seam named there) and
   `scripts/components/periodic-table.js` (418) — plus four in `workspace/tools/visual/`, which ships
   to no page: `audit-atom.mjs` (596), `compare.mjs` (505), **`audit-motion.mjs` (729 — larger than
   `audit-atom.mjs`; its six question blocks are self-contained and the frost and the frame clock are
   the two that would move out first)** and `audit-atom-scene.mjs` (424). Phase 17 took
   `tests/router/router.test.js` **off** the list (484 → 342, the fake page moved to
   `router/dom-fixtures.js`) and brought `audit-atmosphere.mjs` back under (394 → 370): twelve under
   `source/` before the motion, twelve after. Phase 14 split the one file its own work pushed over
   (`router/routes.js`, now 362 lines plus `router/route-sheets.js` at 64); the rest is a two-file
   refactor each, and they are recorded in `progress/PHASE_LOG.md` rather than quietly kept.

No tag was moved: `v1.0.0` stays on `e035c6f`, `v1.0.1` on `bd338dd`, `v1.1.0` on the release
close-out, and **`v1.2.0` on the Phase 18 close-out commit**.

## How to resume in 60 seconds

```bash
git log --oneline -20             # the merge `ba3e783`, the close-out commit on top, `v1.2.0` tagged
git status --short                # expect a clean tree
cat workspace/RUN_STATE.md        # this file
node --test source/tests          # is the last checkpoint real?  expect: 732 passing
node source/tools/build.js        # renders 563 routes, 0 waiting
SITE_ORIGIN=https://<owner>.github.io/<repo> node source/tools/build.js   # the deployed shape
node source/tools/serve.js --port 4180   # the site
```

That third command is the one worth running before believing anything about a deployment: it renders
the same 563 routes for an address that is not a domain root, and a document that names the domain
root instead of its own path is visible in the output with one `grep`. The live site is
<https://dhbhensdadia.github.io/Chemipedia/>.

And the gates, from `workspace/tools/visual` after `npm install` — all of them name `/atoms/`:

```bash
node audit-a11y.mjs         # 0 defects across 20 pages
node audit-responsive.mjs   # 80 of 80 fit
node audit-performance.mjs  # seven pages: shift 0, slowest load 102ms on the closing quiet run, no long task
node audit-lighthouse.mjs   # eight pages: accessibility 100, best-practices 100, seo 100 (performance recorded)
node audit-atmosphere.mjs   # 106 of 106 claims: the field itself, at the drift's extremes (same server)
node audit-motion.mjs       # 62 of 62 claims: the light, the frost, the reveals, the cross-fade, the ladder, the frame clock (same server)
```

Then open `workspace/progress/PHASE_LOG.md` at Phase 11 for the evidence behind each number, at
Phase 14 for the page's, at Phase 15 for the gates and the frame time, at **Phase 16** for the
field — its numbers, the alias defect the pixels caught and the recorded deviations — at **Phase
17** for the motion — its numbers, the fade the Lighthouse gate refused, and the discipline
`audit-a11y.mjs` and `audit-motion.mjs` now share — and at **Phase 18** for the closing gates, the
documentation and the delivery's live checks.

The atom viewer's own audits run the same way, against a server on 4188:

```bash
node source/tools/build.js                 # the page is served from dist/
node source/tools/serve.js --port 4188     # in another shell (background it)
BASE=http://127.0.0.1:4188 node audit-atom.mjs        # 57 claims, the page itself
BASE=http://127.0.0.1:4188 node audit-atom-scene.mjs  # 33 claims, the style guide driving the scene
BASE=http://127.0.0.1:4188 node audit-atom-renderer.mjs # 25 claims, the drawing layer alone
```

**The programme is closed and the plan has no next phase.** The living paper's gates are
`node audit-motion.mjs` — real pixels and real frame time: **62 claims, exit 0** — and
`node audit-atmosphere.mjs` — **106 of 106**. If a review ever returns a finding, it opens a new
phase in `docs/IMPLEMENTATION_PLAN.md` §3 first, and publishing stays the author's step
(`docs/GIT_WORKFLOW.md` §8).
