# RUN_STATE.md — authoritative recovery checkpoint

> This file is the **first** thing a resuming agent reads and the **last** thing a finishing agent
> updates. It is a checkpoint, not a narrative. Keep it factual and current.
>
> **It is not sufficient on its own.** Always reconcile it with `git log`, `git status`, the
> working tree, and the tests before acting. See `WORKING_AGREEMENT.md` §7.

**Last updated:** 2026-10-15 (the **Phase 16** session: the living paper was built, bounded and
audited — `tokens.css` §22, `styles/atmosphere.css`, the backdrop tests at fourteen, the field's own
gate at **106 of 106 claims**, and the style guide's section — and **Phase 16 closed `COMPLETE`** on
`feature/living-paper`, local only. **Nothing is merged, pushed or tagged; the delivery waits for the
author's word.**)

---

## Current position

| Field | Value |
|---|---|
| **Phase** | Phases 0–15 are `COMPLETE` and the site is published at `v1.1.0`. **Phase 16 — the field — is `COMPLETE` on `feature/living-paper`** (its own entry in `progress/PHASE_LOG.md`); **Phases 17–18 — the motion and depth, then quality and delivery — are `NOT_STARTED`**. **ADR-008 is `ACCEPTED`** |
| **Branch** | `feature/living-paper`, cut from `main` at `0ba6b04`, carries the whole feature so far — the plan, the audit, the field and its gate. **Local only — not merged, not pushed** (`docs/GIT_WORKFLOW.md` §8): merging, pushing and tagging wait for the author's word |
| **Objective (this programme)** | Answer the review finding that the page field is a flat fill and a reader's first impression is a static document. The field is four CSS layers drawn from the site's own group colours — the wash with the page family's own bloom, the lattice (the atom stage's own 28 px grid at paper strength), and the grain — with a slow compositor-only drift; the planned fourth layer, the vignette, was **cut in the build** and the cut recorded (`docs/research/06` §8). Phase 17 then adds the motion-and-depth layer: platform-native reveals, a pointer light that only brightens, a masthead that frosts on scroll, a route crossfade, and one measured depth pass. Every hue is a `--g-*` token, the contrast bound is derived from `--ink-faint`'s own 4.99:1, print and reduced motion get the designed still field, and nothing depends on script. Planned in `docs/IMPLEMENTATION_PLAN.md` §3; measured in `docs/research/06`; ADR-008 governs |
| **Work item (previous phase)** | 15.4 `COMPLETE`: the delivery — merged `--no-ff` as `ad58ee2`, pushed, Pages run `37638178700` green, six browser audits held on the delivery build, `/atoms/` and a live client-side navigation verified **in a browser**, `v1.1.0` tagged. The atom viewer is live and nothing of it is outstanding |
| **Status (this feature)** | **Phase 16 `COMPLETE`.** Delivered: `tokens.css` §22, `styles/atmosphere.css` (260 lines), `tests/lib/backdrop.test.js` (14 tests; overlap floor **4.575 : 1**), `workspace/tools/visual/audit-atmosphere.mjs` (**106 of 106 claims, exit 0**; worst real on-field text **4.79 : 1**; kill switch 4–7 LSB; lived-in 120 frames at 16.7 ms, 0 long tasks, 0 shift), and the style guide's living-paper section. Suite **695 pass, 0 fail**; the three site-wide sweeps unchanged; print at **1 sheet** on the four measured pages; one page per family seen at 1280/768/375. **Phase 17 is the next work item and may begin**; merging, pushing and tagging remain the author's call |
| **Current commit** | `feature/living-paper` at the Phase 16 close-out commit, clean. `main` at `0ba6b04` with `v1.1.0` on the release line. Nothing is pushed |
| **Next action** | Begin **Phase 17 — the motion and the depth** (`docs/IMPLEMENTATION_PLAN.md` §3): platform-native reveals, the pointer light (fine pointers only), the frosted masthead on scroll, the route crossfade, one measured depth pass — then extend `audit-atmosphere.mjs` with the motion and depth claims. The delivery is Phase 18, on the author's word |

## Files expected to change in the next work item

```
Phase 17  source/scripts/components/pointer-light.js 🚧 the pointer light, fine pointers only
          source/scripts/app.js                   🚧 wire it once
          source/scripts/router/router.js         🚧 the route crossfade, feature-detected
          source/styles/components/site-header.css 🚧 the frosted scrolled state
          source/styles/components/*.css          🚧 the depth pass over tiles, chips, cards, panels
          source/tests/components/pointer-light.test.js 🚧 the pure parts
          source/tests/router/router.test.js      🚧 the transition's refusals
          workspace/tools/visual/audit-atmosphere.mjs 🚧 the motion and depth claims
Phase 18  workspace/tools/visual/*.mjs            🚧 the four site-wide gates re-run
          workspace/docs/*, guides/, README.md    🚧 the close-out documentation
          the delivery                            🚧 merge --no-ff, push, live check, tagged v1.2.0
                                                     — on the author's word only
```

Phase 16's files now exist (the block above listed them while they were planned; the ledger and the
Phase 16 entry are their record). The programme touches the global layer, not the page families: the
family fields key off the body's existing `data-page`, and no page's markup changed. If a family
needs a stronger field than the shell can express, the owner is that family's sheet, and
`docs/MIND_MAP.md` §4 answers "which file owns this" for everything else. Every new file must appear
in the mind map in the same commit; `styles/tokens.css` is already over the ceiling and the §22
additions were kept to one group; `atmosphere.css` shipped at 260 lines, under the 400-line law.
`tests/lib/backdrop.test.js` crossed the ceiling with the overlap bound the plan asked it to hold —
recorded in the Phase 16 entry with its seam named.

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
| 16.1 The field: tokens, the sheet, the bound and the gate | `COMPLETE` | `tokens.css` §22 — every bloom a `--g-*` reference with its anchor and its alpha cut under its own derived ceiling, the lattice at the table's own 28 px pitch and 1.1 %, the grain at 1 % effective, the 4 % bleed corrected by the 1.08 scale, the drift at 180 s / 240 s, the family map, and the narrow query's 0.88 wash. `styles/atmosphere.css` (260 lines): four fixed pseudo-elements on `html`/`body` at `z-index: -1`, no background on `html` so the canvas keeps propagating, the family overrides keyed off `body[data-page]` — nine names, four default templates — two animations inside the no-preference gate, print strips all four; the build links it as the fourth global sheet. `tests/lib/backdrop.test.js` grew to **14 tests**, including the plan's overlap bound scanned over every family × four reference viewports with the texture charged at its worst: floor **4.575 : 1**. `audit-atmosphere.mjs`: **106 of 106 claims, exit 0** — worst on-field text **4.79 : 1**, the kill switch moving 4–7 LSB, print bare paper, the no-script anchor `#f8f8f6`, three phone frames at 0 px, and a lived-in drift window at **120 frames / 16.7 ms median / 0 long tasks / 0 shift**. The family-pair defect the pixels caught (a `:root` alias froze the family hue before any page override; the fix reads the pair on the sheet that paints it) is recorded in the Phase 16 entry. Suite **695 pass, 0 fail** | `ae2fad9` · `ba1647a` · `e4b4c00` · `27115dc` · `53c5715` · `6336dc0` · `a34b552` |
| 16.2 The style guide, the widths and the close-out | `COMPLETE` | The guide's **the living paper** section: a swatch per bloom and per family — each the composite the tokens draw — the pages each family covers read off the atmosphere sheet, all **54** `--field-*` tokens listed with computed values, and a live reduced-motion line; everything read from the stylesheets the page renders. Seen at 1280/768/375, with two small repairs (the token rows and the type scale's demo words now wrap; the guide fits every width). One page per family seen at all three widths, differences named in the entry (family anchors from `#fcf6f3` table to `#f8f7f5` default at 1280/768; at 375 the masthead's paper band covers the bloom's core — recorded in `research/06` §8). The three site-wide sweeps unchanged: **0 defects / 29 informational across 20 pages**, **80 of 80**, **worst shift 0, 37 ms slowest load, 0 long tasks**; print re-measured as **8 PDFs, 1 sheet each**; console and network clean across twelve pages and the guide. `research/06` §8, the Phase 16 entry, this file and `HANDOFF.md` | `6b1cb2d` + the close-out commit |

Status vocabulary: `NOT_STARTED` · `IN_PROGRESS` · `BLOCKED` · `VERIFIED` · `COMPLETE`.
A `VERIFIED` row **must** name the evidence. A `COMPLETE` row **must** name its commit hash.

## Accepted decisions

All **eight** ADRs stand, and **ADR-008 (the living paper) is `ACCEPTED`** — the author approved the
plan in `docs/IMPLEMENTATION_PLAN.md` §3, and the measured numbers of its three phases join the
record when Phase 18 closes the programme. Four decisions from Phase 11 join the set:

| Decision | Why |
|---|---|
| **Everything a reader is meant to read is written at build time.** | The home page was the last exception and it cost a 0.315 layout shift and a table-less page for a crawler and for a reader whose script did not run. Every family is now rendered by the build from the same functions the browser would have used, and a page's behaviour only **attaches** to markup that is already there. |
| **Where the reference's own value fails AA, accessibility wins and the deviation is recorded.** | The reference's tertiary ink is 3.06:1 on our paper and its isolation dims text to 1.5:1. We darkened the ink and drain the fill instead of the tile, and both costs are written down in `DESIGN_SYSTEM.md` and in the Phase 11 deviations table rather than quietly absorbed. |
| **A canonical link is configuration, and the default cannot resolve.** | `site-origin.js` reads `SITE_ORIGIN` and falls back to a reserved `.example` address, and the build says on every run that the placeholder is in place. A confident, wrong canonical is worse than none, and the workflow passes the real origin in. |
| **The deployment is a workflow; publication is the author's step.** | `docs/GIT_WORKFLOW.md` §8 makes publishing deliberate and author-approved. The workflow, the routing fallback and the README's steps are the deliverable; the push was not claimed until it happened, and it happened on the author's instruction. |
| **A site that declares where it lives must place every URL inside that path.** | The live address is a project site, served from `/Chemipedia/`. A path written from the site's own root is right locally and leaves the site in production, and two of them cannot be rewritten after the fact: a request for a data file, and a link the browser writes after the page has loaded. So the deployment's path is read once in the build (`tools/site-origin.js` → `rootedAt` in `tools/document.js`) and once in the browser (`scripts/lib/site-path.js`, off the module's own address) — and a deployment served from a path is a case the suite covers, not a hope. |
| **Derive a claim rather than assert it.** | Unchanged, and now applied to nine families: the fading ceiling is derived from the eleven group fills by `lowestAlphaForAA` rather than chosen, and a test holds every fading token above it. |
| **The field's contrast budget is derived from the ink ladder, not chosen.** | The living paper's caps — one bloom at a time where text sits, ≤ 5 % for the four dark group hues, ≤ 8 % for the light ones, lattice and grain ≤ 2.5 % — are spent from `--ink-faint`'s own shipped 4.99:1 on the paper, derived in `docs/research/06` §6 and **now held** by `tests/lib/backdrop.test.js` (the overlap scan floors at 4.575 : 1); the browser audit reads the real pixels at the drift's extremes and finds **4.79 : 1** at its worst. The pointer light is white-based, so it can only raise the field's luminance and sits outside the budget by construction. |
| ADR-001..008, all accepted | Unchanged; ADR-008's numbers were measured with Phase 16 and are recorded in the phase entry and `docs/research/06` §8. See `docs/ARCHITECTURE.md` and the previous sessions' notes in the phase log. |

## Known risks and blockers

| Risk | Impact | Mitigation |
|---|---|---|
| **The deployed address is not a domain root** | It is a project site served from `/Chemipedia/`, so a URL written from the site's own root leaves the site and 404s — which is what the first deployment did | The path is read from the origin once (`tools/site-origin.js`), the finished document is rewritten once (`rootedAt`), the data fetch and the browser's own link go through `scripts/lib/site-path.js`, and a subpath-simulated build is part of the recovery steps below. `v1.0.1` is the fix; `v1.0.0` is the release that exposed it, deliberately left where it is. |
| **Deprecation notices on every Pages run** | `checkout@v4`, `setup-node@v4`, `configure-pages@v5`, `upload-artifact@v4` and `deploy-pages@v4` target Node 20 and are being forced onto Node 24; `ubuntu-latest` moves to Ubuntu 26 on 2026-10-19 | Cosmetic today: both jobs succeeded in both runs with the notices on them. Bumping the action versions is one line each and is deliberately not bundled into a deployment fix. |
| The preview webview does not composite | The panel's own screenshot tool may still fail; it is not on the critical path | `workspace/tools/visual` captures, diffs and measures in headless Chrome. Phase 11 closed on its four sweeps rather than on a capture, because the only page whose markup changed was compared numerically. |
| The preview window has no operating-system focus | `focus`, `blur` and real key events are never delivered, so tab-order and hover behaviour cannot be exercised as a person would | The harness's own Playwright pages are real browsers; every keyboard check this project has run went through them. |
| Three pages have no reference to compare with | About, Contact and the downloads page cannot be pixel-diffed against anything | Accepted since Phase 10: the evidence for those three is the accessibility, keyboard, overflow and link checks rather than a diff. |
| Our group band wraps to two rows at desktop | Twelve group names do not fit the shell's 1100px in one row | Recorded as a deliberate deviation in `progress/PHASE_LOG.md`. Visible again in this phase's 768px home capture as the legend wrapping, where the reference's does not. |
| Nine glossary deviations, one of them an undelivered deliverable | The plan's deliverables list an expanded explanation on a term page; the reference has none, and 418 paragraphs of new prose have no source to audit against | Recorded at the top of its deviations table in `progress/PHASE_LOG.md`. The phase's exit criteria do not ask for it. |
| A swap is easy to get subtly wrong | The router touches the document's title, description, body, focus and scroll | `tests/router/router.test.js` holds all of them under fakes, and this phase re-checked the roving tab stop after an in-page navigation. |
| `covalentRadius` and `latticeParameters` are `null` for all 118 | Two rows of an element page read "Unknown" | Recorded in `docs/DATA_SOURCES.md`; filling them needs a third source and touches one adapter, no page. |
| The typeface is not the reference's | Every page's text measures a few per cent differently, which inflates the harness's crop numbers | A Phase 1 deviation, recorded. It is the class of difference the 1280px home capture's 2.31% belongs to. |
| Lighthouse's performance score moves between runs | A recorded number can look like a regression when the machine is busy | `audit-lighthouse.mjs` records performance and SEO rather than gating them, and the Phase 11 entry states both readings (89 and 92 mean) with the reason. Only accessibility and best-practices gate. |
| The living paper's field moves, so one screenshot cannot verify it | A moving field behind text is where a contrast defect would hide, and every existing sweep screenshots still pages | The caps are derived from `tokens.css` in `tests/lib/backdrop.test.js` (fourteen tests, overlap floor 4.575 : 1), and `audit-atmosphere.mjs` — built and holding **106 of 106 claims** — samples real composited pixels behind every sampled text run at the drift's extremes, where the field is darkest (worst **4.79 : 1**). The programme's full risk register is `docs/IMPLEMENTATION_PLAN.md` §6. |
| **A custom-property alias at `:root` can freeze a per-page hue** | A `var()` inside a custom property is substituted where the property is **declared**, so an alias on `:root` resolves before any `body[data-page]` override can matter — every computed property and token test reads correct while every page wears one colour. This happened once, in the family bloom, and only the pixel audit caught it | The family pair is read on the sheet that paints it (`atmosphere.css`), never through a root alias; `tests/lib/backdrop.test.js` holds both halves — no root alias for the family hue, and the sheet reads `--field-family-hue`/`--field-family-alpha` itself — and the audit's anchors must differ per family, with the kill switch stopping a vacuous pass on a pale page. Recorded in the Phase 16 entry and `docs/research/06` §8. |
| **At 375 px the family bloom's core sits behind the masthead** | The masthead's own paper band is 280-odd pixels tall on phones, so the family's tint is not readable at phone width (≤ 2 LSB below the band); the field there is the lattice, the grain and the far sheet's corner blooms | Recorded, not patched: `docs/research/06` §8 and the Phase 16 entry. Whether the family bloom should follow the masthead's height is a composition question for Phase 17, and the family differences are measured present at 1280 and 768. |

## Deliberately unfinished

**Phases 0–15 are `COMPLETE` and the site is published at `v1.1.0`** — the atom viewer, the
review change that brought its geometry, light and field to the reference's own measured numbers, and
the head a client-side navigation used to leave behind are all live at
<https://dhbhensdadia.github.io/Chemipedia/atoms/>, verified in a browser rather than by `curl`.

**Phase 16 is `COMPLETE` on `feature/living-paper` — local only; Phases 17–18 remain.** The field is
built, audited and closed per its entry in `progress/PHASE_LOG.md`, and the branch carries the whole
feature so far: the plan, the audit, the field and its gate, and the style guide's section. The rule
that got the site here still stands: **nothing is merged, pushed or tagged without being asked**
(`docs/GIT_WORKFLOW.md` §8) — the word was given for the `v1.1.0` delivery, and this delivery will
need its own.

Four deferrals stand, each recorded where it belongs:

1. **The plan's "expanded explanation" on a term page** — not delivered in Phase 9, because 418
   paragraphs would have no source to audit them against.
2. **Two schema fields** that no acceptable source supplies (`covalentRadius`, `latticeParameters`) —
   see `docs/DATA_SOURCES.md`.
3. **The typeface** — not the reference's, recorded as a Phase 1 deviation.
4. **Twelve files over the 400-line ceiling under `source/`, inherited rather than fixed** —
   `styles/tokens.css` (946 — it grew from 824 with §22 and remains the standing exception),
   `styles/pages/element-detail.css` (520, of which this feature's link is about twenty lines),
   `tests/lib/atom-model.test.js` (518), `tests/router/router.test.js` (484),
   `tests/pages/glossary.test.js` (473), `styles/components/periodic-table.css` (457),
   `tests/components/periodic-table.test.js` (444), `scripts/components/atom-view.js` (441),
   `scripts/lib/matrix4.js` (421), `tests/components/atom-view.test.js` (412),
   `tests/lib/backdrop.test.js` (412 — the Phase 16 overlap scan crossed it, on the plan's own
   instruction to hold the bound in that file; the seam is named in the phase entry) and
   `scripts/components/periodic-table.js` (418) — plus three in `workspace/tools/visual/`, which ships
   to no page: `audit-atom.mjs` (596), `compare.mjs` (505) and `audit-atom-scene.mjs` (424)
   (`audit-atmosphere.mjs` ships at 394, under). Phase 14 split the one file its own work pushed over
   (`router/routes.js`, now 362 lines plus `router/route-sheets.js` at 64), and this work brought
   `atom-model.js` back under by splitting out `lib/atom-orbit.js`; the rest is a two-file refactor
   each, and they are recorded in `progress/PHASE_LOG.md` rather than quietly kept.

The one-time push is no longer on this list: it ran on the author's instruction on 2026-10-06, and
the site it published is live.

## How to resume in 60 seconds

```bash
git log --oneline -20             # what has actually been committed
git status --short                # anything half-done?
cat workspace/RUN_STATE.md        # this file
node --test source/tests          # is the last checkpoint real?  expect: 695 passing
node source/tools/build.js        # renders 563 routes, 0 waiting
SITE_ORIGIN=https://<owner>.github.io/<repo> node source/tools/build.js   # the deployed shape
node source/tools/serve.js --port 4180   # the site
```

That third command is the one worth running before believing anything about a deployment: it renders
the same 562 routes for an address that is not a domain root, and a document that names the domain
root instead of its own path is visible in the output with one `grep`. The live site is
<https://dhbhensdadia.github.io/Chemipedia/>.

And the four gates, from `workspace/tools/visual` after `npm install` — all four now name `/atoms/`:

```bash
node audit-a11y.mjs         # 0 defects across 20 pages
node audit-responsive.mjs   # 80 of 80 fit
node audit-performance.mjs  # seven pages: shift 0, slowest load 35–40ms across runs, no long task
node audit-lighthouse.mjs   # eight pages: accessibility 100, best-practices 100, seo 100 (performance recorded)
node audit-atmosphere.mjs   # 106 of 106 claims: the field itself, at the drift's extremes (same server)
```

Then open `workspace/progress/PHASE_LOG.md` at Phase 11 for the evidence behind each number, at Phase
14 for the page's, at **Phase 15** for the gates and the frame time, and at **Phase 16** for the
field — its numbers, the alias defect the pixels caught and the recorded deviations.

The atom viewer's own audits run the same way, against a server on 4188:

```bash
node source/tools/build.js                 # the page is served from dist/
node source/tools/serve.js --port 4188     # in another shell (background it)
BASE=http://127.0.0.1:4188 node audit-atom.mjs        # 57 claims, the page itself
BASE=http://127.0.0.1:4188 node audit-atom-scene.mjs  # 33 claims, the style guide driving the scene
BASE=http://127.0.0.1:4188 node audit-atom-renderer.mjs # 25 claims, the drawing layer alone
```

Phase 16 is **closed**; Phase 17 — the motion and the depth — begins next at
`docs/IMPLEMENTATION_PLAN.md` §3, on branch `feature/living-paper`. The field's own gate is
`node audit-atmosphere.mjs`, which samples real composited pixels behind text at the drift's extremes
rather than trusting a still frame: **106 claims, exit 0**. The delivery (merge, push, tag `v1.2.0`)
is Phase 18 and waits for the author's word.
