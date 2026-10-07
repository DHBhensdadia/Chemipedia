# HANDOFF.md — note to the next agent

**Written:** 2026-10-07 · **By:** the session that took the atom viewer's last phase as far as it goes
without the author — the two remaining gates, the page's own frame-time budget, ADR-007 and the
documentation — on `feature/atom-3d` · **After commit:** this session's Phase 15 commit on
`feature/atom-3d`

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

**The site is live** at <https://dhbhensdadia.github.io/Chemipedia/> and is untouched by this branch.
**The atom viewer is finished, measured and documented, and it is not delivered** — it lives on
`feature/atom-3d`, and the delivery is the author's step.

- `/atoms/` draws any element's atom in three dimensions: a nucleus, electrons on their shells, a
  camera a reader can swing, and a translucent bar pinned to the bottom of the stage driving it. It is
  hand-written WebGL2 (ADR-007), it adds no dependency and no data, and a reader without it gets the
  element's own shell diagram rather than a blank stage. Every element page links into it at
  `/atoms/#<slug>`.
- **All four gates pass with the new page included**: accessibility 0 defects / 29 informational lines
  across **20** pages; responsive **80 of 80**; performance **worst layout shift 0, slowest cold load
  35 ms, 0 long tasks** across seven pages; Lighthouse **100 / 100 / 100** for accessibility,
  best-practices and SEO with performance **78** recorded and not gated.
- **The page keeps the browser's cadence on its heaviest atom**: median **16.70 ms** a frame with
  oganesson turning, the same as the same page held still, worst frame 16.80 ms over ninety, no long
  task. `audit-atom.mjs` asks **57** claims and they all hold with 0 console messages and 0 failed
  requests; the scene and renderer audits ask 33 and 25.
- `node --test source/tests` → **658 passing, 0 failing**, with nothing installed.
- `node source/tools/build.js` → **563 routes** plus the not-found page, **0 waiting**.
- The documentation is closed out: **ADR-007**, `DESIGN_SYSTEM` §1.7 and §7, `BRAND_GUIDELINES` §9,
  `DATA_SOURCES` §7, all four guides, the README, the measurements file, the phase log and
  `RUN_STATE.md`. The second reference's name is now **enforced** by the brand scan rather than
  checked by hand.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **The only work item left is the delivery, and it needs the author's word.** In the plan's order:
   merge `feature/atom-3d` into `main` with `--no-ff`, push, watch the Pages run go green, verify
   `/atoms/` **in a browser** at <https://dhbhensdadia.github.io/Chemipedia/atoms/> with the same
   checks the publish entry used, and tag `v1.1.0` on the close-out commit. **Do not merge, push or
   tag without being asked**, and never move an existing tag.
3. If the author asks for something else, the feature's own state is in `RUN_STATE.md`, and the phase
   log's Phase 15 entry records what was measured and what was not.
4. Before believing anything about the deployment, build for the address it actually lives at:
   `SITE_ORIGIN=https://dhbhensdadia.github.io/Chemipedia node source/tools/build.js`, then grep
   `dist/` for a `href="/` that is not `href="/Chemipedia/`. A local root build cannot catch this class
   of defect, which is why it reached production once.

## What is fragile or easy to get wrong

- **A test that passes is not a page that works.** The feature was taught this three times, and it
  wrote the third one down: a function written to take a list of records was handed the elements
  **repository**, so the page threw and the canvas never appeared — while the unit test passed, because
  it was handed the same wrong thing. The test now builds a real repository off disk. **When a
  function's argument has an interface, build the real one in the test.**
- **A passing build is not a rendered page.** A page family is only rendered if it is registered in
  `FAMILY_RENDERERS` in `source/tools/build.js`; a missing entry renders the template with its
  placeholders still in it and **no test catches it**. Read the built document.
- **A colour is only as readable as what it is painted on.** The bar's symbol link measured 1.47:1 on
  first run because a link's colour is the site's ink and the stage is dark. Anything added to a dark
  surface must name its own colour, and `audit-a11y.mjs` is what tells you.
- **The 3D cannot be verified in Node.** The arithmetic is pure and tested there; the drawing is not,
  and a draw call that succeeds can paint nothing — which is exactly what happened. **Ask what the
  pixels say, not what the calls say**, and run the feature's three browser audits after any change to
  the layer.
- **A page that can only be computed in the browser is blank to a crawler and to a reader with the
  script off.** Every family computes its markup through a `*Values` function the build calls, and a
  `start*` function that only attaches.
- **The scene owns the clock, not the model**, and the renderer's palette comes from `tokens.css` §21
  at runtime, because a graphics card cannot read a stylesheet. No design value exists outside that
  file.
- **Every URL belongs to one of two sides, and only one of them is rewritten.** The build rewrites the
  paths it writes into a finished document; a URL the *browser* writes after load, or a data fetch
  asks for, must go through `scripts/lib/site-path.js`.
- **A fragment is not part of a route.** `/atoms/#iron` is one page with an element named in it; the
  page reads it itself, through `elementFromFragment(hash, repository)` — which takes the repository,
  not a list.
- **No literal values outside `tokens.css`** — colours, sizes, radii, durations; breakpoints are the one
  recorded exception. Files stay under 400 lines, and ten of them do not: seven under `source/`
  (including `styles/pages/element-detail.css` at 520 and `styles/tokens.css` at 795) and three
  workspace tools. They are recorded in `progress/PHASE_LOG.md` rather than fixed. **Do not add a file
  to that list; split or record instead.**
- **`source/tests/brand/brand.test.js` fails the suite** if **either** reference's name appears
  anywhere under `source/`, comments included — the first reference's and the atom viewer's own. Call
  them "the reference" and "the second reference".
- **The preview is unreliable in two ways**: it may not composite, so no screenshot can be taken, and
  its window has no operating-system focus, so real key events are never delivered. Use
  `workspace/tools/visual`, and remember the dev server serves `dist/` — re-run
  `node source/tools/build.js` after any source change or the page you are looking at is the old one.
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer. Commit with `git commit -F -` and a heredoc, and stage by explicit path.
- **A file that is added or renamed must appear in `docs/MIND_MAP.md` in the same commit.** The last
  completeness check found 214 files under `source/`, with only macOS `.DS_Store` unlisted.

## Anything deliberately left in a half state

One thing, and it is deliberate: **the delivery has not happened.** The feature is complete, committed
and green on `feature/atom-3d`; merging, pushing, the Pages run, the live check and `v1.1.0` are the
author's step, and the plan's exit criteria for the last phase are met only by that order. Nothing else
on the plan is outstanding, and the working tree is clean.

`v1.0.0` stays on `e035c6f` — the release whose publication exposed the subpath defect — and `v1.0.1`
is on `bd338dd`, which fixes it; neither tag was moved.

Three deferrals from earlier phases stand, plus the over-ceiling files: the "expanded explanation"
Phase 9 left out, the two schema fields no acceptable source supplies (`covalentRadius`,
`latticeParameters`), the typeface, which is not the reference's, and ten files over the 400-line
ceiling — all recorded where they belong rather than forgotten.
