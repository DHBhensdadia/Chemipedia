# HANDOFF.md — note to the next agent

**Written:** 2026-10-07 · **By:** the session that closed **Phase 14** of the atom viewer — the page, the
bar, and the way in from every element page — on `feature/atom-3d` · **After commit:** `190a08b` on
`feature/atom-3d`

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

**The site is live** at <https://dhbhensdadia.github.io/Chemipedia/> and is untouched by this branch.
**The atom viewer is a page a reader can reach** — `/atoms/`, in the navigation as **Atoms** between
*Periodic Table* and *Elements* — and **Phases 12, 13 and 14 are complete**. **Phase 15, the delivery,
has not been started**: nothing is merged, pushed or tagged.

- `/atoms/` is built, not assembled: the hero, the element's shell diagram, the counts in words and the
  whole bar are in the document before any script runs, and the WebGL canvas replaces the diagram only
  once a frame has actually been drawn. A reader with no WebGL2, no scripting or a reduced-motion
  preference is looking at a finished page, and the last of those still gets one still frame and a
  Play control.
- The bar is the site's one piece of glass: pinned to the bottom centre of the stage, and every control
  in it a native control — a select over all 118 elements, three number fields with their own step
  buttons, a speed range, and Shake, Reset view and Pause. Protons stop at 118; neutrons and electrons
  go past anything an element has, and a count that is not an element says so rather than inventing a
  symbol.
- **Every element page carries one link into it**, under the shell diagram that is the still version of
  the same atom: *See Iron in three dimensions*, at `/atoms/#iron`. The page opens on the element the
  fragment names and falls back to the element it was built for when the fragment names none.
- `tools/visual/audit-atom.mjs` asks **54 questions** and they all hold with **0 console messages and 0
  failed requests**: the stage paints in the token layer's colours, every control changes the render by
  hash, the bar is walked **by the keyboard alone**, a paused loop is byte-identical frame to frame, the
  no-WebGL2 and no-script paths keep the built page, and the fragment and the element-page link are
  followed with real clicks through the router.
- The two site-wide sweeps now include `/atoms/`: accessibility **0 defects / 29 informational across 20
  pages**, responsive **80 of 80**. Performance and Lighthouse have **not** been re-run with it — their
  page lists still need it, and that is Phase 15's first job.
- `node --test source/tests` → **658 passing, 0 failing**, with nothing installed.
- `node source/tools/build.js` → **563 routes** plus the not-found page, **0 waiting**.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **You are on `feature/atom-3d` unless someone has merged it.** Read the Phase 14 entry in
   `progress/PHASE_LOG.md` and the Phase 14 rows in `RUN_STATE.md`, then start **Phase 15** in
   `docs/IMPLEMENTATION_PLAN.md` §3: `/atoms/` into the performance and Lighthouse sweeps, the
   documentation the plan names (`DESIGN_SYSTEM.md`, `ARCHITECTURE.md`'s **ADR-007**,
   `BRAND_GUIDELINES.md`, `DATA_SOURCES.md`, the guides, the README's route count), and then the
   delivery.
3. **Delivery is the author's to authorise**: a `--no-ff` merge to `main`, a push, a green Pages run, a
   live check of `/atoms/` and the `v1.1.0` tag. Do not do any of it unasked, and do not move an
   existing tag.
4. Before believing anything about the deployment, build for the address it actually lives at:
   `SITE_ORIGIN=https://dhbhensdadia.github.io/Chemipedia node source/tools/build.js`, then grep
   `dist/` for a `href="/` that is not `href="/Chemipedia/`. A local root build cannot catch this class
   of defect, which is why it reached production once.

## What is fragile or easy to get wrong

- **A test that passes is not a page that works.** This feature has now been taught that three times,
  and the third one is the sharpest: a function written to take a list of records was handed the
  elements **repository**, so the page's own arithmetic threw and the canvas never appeared — while the
  unit test passed, because it was handed the same wrong thing. The test now builds a **real**
  repository off disk, the way `element-search.test.js` does. **When a function's argument has an
  interface, build the real one in the test.**
- **A colour is only as readable as what it is painted on.** The bar's element symbol measured
  **1.47:1** on first run: `.at-bar` sets the light ink and every other control reads it, but the symbol
  is an `<a>`, and a link's colour is the site's own dark ink, which wins. Anything added to a dark
  surface must name its own colour, and `audit-a11y.mjs` is what tells you. Run it with `/atoms/` in its
  list before closing anything.
- **A passing build is not a rendered page.** A page family is only rendered if it is registered in
  `FAMILY_RENDERERS` in `source/tools/build.js`; a missing entry renders the template with its
  placeholders still in it and **no test catches it**, because the manifest tolerates a missing
  renderer. That happened once, in this phase. Read the built document.
- **A page that can only be computed in the browser is blank to a crawler and to a reader with the
  script off.** Every family computes its markup through a `*Values` function the build calls, and a
  `start*` function that only attaches. Keep it that way.
- **The scene owns the clock, not the model**, so a speed change cannot make the electrons jump; the
  scene reads its palette from `tokens.css` at runtime, because no design value exists outside that
  file; and the electron counts come from the reader's own fields rather than from a copy held beside
  them, so the page and the picture cannot disagree.
- **A draw call that succeeds can paint nothing.** This happened here: the particle draw used a vertex
  array that carried the per-particle buffers and not the sphere's own attributes, so every sphere
  collapsed to a point while the call was issued exactly as designed, and every unit test passed. What
  caught it was reading the drawing buffer in a browser. **Ask what the pixels say, not what the calls
  say.**
- **`audit-a11y.mjs` composites an element's own `opacity` before it checks contrast**, and it does not
  know about a canvas: the stage's dark backdrop is a real background colour on `.at-stage`, so the
  sweep can composite it. If you make a surface's colour come from anywhere else, the sweep will
  measure the page behind it instead — and it will be wrong silently.
- **Every URL belongs to one of two sides, and only one of them is rewritten.** The build rewrites the
  paths it writes into a finished document (`rootedAt`), which reaches markup and nothing else. A URL
  the *browser* writes after load, and the URL a *data fetch* asks for, must go through
  `scripts/lib/site-path.js`. Adding a runtime link anywhere else reintroduces the defect that reached
  production once.
- **A fragment is not part of a route.** `/atoms/#iron` is one page with an element named in it, which
  is why the router hands a same-page fragment to the browser and why the page reads the fragment
  itself. If you add another fragment URL, read `elementFromFragment` first — it takes the repository,
  not a list.
- **No literal values outside `tokens.css`** — colours, sizes, radii, durations; breakpoints are the one
  recorded exception. Files stay under 400 lines, and the manifest crossed it in this phase:
  `router/routes.js` is 362 plus `router/route-sheets.js`. Ten files are still over — seven under
  `source/`, three workspace tools — and they are recorded in `progress/PHASE_LOG.md` rather than fixed.
  **Do not add a file to that list; split or record instead.**
- **`source/tests/brand/brand.test.js` will fail the suite** if either reference's name appears anywhere
  under `source/`, comments included. Call them "the reference".
- **The preview is unreliable in two different ways.** It may not composite, so no screenshot can be
  taken; and its window has no operating-system focus, so `focus`, `blur` and real key events are never
  delivered. Use the Playwright pages in `workspace/tools/visual`, and run the dev server as a
  background process on 4188 with `node source/tools/build.js` re-run first — the server serves `dist/`,
  so a source change is invisible until the build runs again.
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer. Write commit messages with `git commit -F -` and a heredoc, and stage by
  explicit path.
- **A file that is added or renamed must appear in `docs/MIND_MAP.md` in the same commit.** The last
  completeness check (Phase 14) found 214 files under `source/` with only macOS `.DS_Store` unlisted.
- **The guides drifted once and were corrected.** They are worth re-reading before you trust any prose
  about this codebase — including this file. If you change a page family's rendering or its exports,
  grep the guides for the old name in the same commit.

## Anything deliberately left in a half state

Nothing is half-done in the tree, and nothing on this branch has been merged, pushed or tagged. The
feature's first three phases are `COMPLETE` and the fourth is not started; the four gates' page lists
for performance and Lighthouse still name no `/atoms/`, which is the first thing Phase 15 fixes.

`v1.0.0` stays on `e035c6f` — the release whose publication exposed the subpath defect — and `v1.0.1` is
on `bd338dd`, which fixes it; neither tag was moved, because a pushed tag is a statement the history
has already made.

Three deferrals from earlier phases stand, plus one this feature inherited: the "expanded explanation"
Phase 9 left out, the two schema fields no acceptable source supplies (`covalentRadius`,
`latticeParameters`), the typeface, which is not the reference's, and the ten files over the 400-line
ceiling — all four recorded where they belong rather than forgotten.
