# HANDOFF.md — note to the next agent

**Written:** 2026-10-15 · **By:** the **Phase 17** session — the motion and the depth built, audited
and closed · **After commit:** the Phase 17 close-out commits on `feature/living-paper` (`main` is
unchanged at `0ba6b04`; `v1.1.0` stays on the release line)

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

**The site is live at `v1.1.0`** — <https://dhbhensdadia.github.io/Chemipedia/> — unchanged: nothing
was merged, pushed or deployed this session.

**On `feature/living-paper` (local only — not merged, not pushed), Phases 16–17 are `COMPLETE`.**
Phase 16 is the field (`tokens.css` §22, `styles/atmosphere.css`, the backdrop tests, the field's
gate). Phase 17 is the motion and the depth:

- `source/scripts/components/pointer-light.js` (224 lines) — the white light that follows the
  pointer across the field: fine pointers only, absent under reduced motion (both watched, so the
  preference flips both ways), a touch never drives it, eased at the orbit camera's own 8/s off the
  shared frame loop — which stops the moment the light arrives. It can only raise luminance.
- `source/scripts/components/masthead-frost.js` (109) — paper at a derived 0.96 behind an 8 px blur
  over 160 px of scroll, as a scroll animation where the platform has one, as the `is-frosted` class
  where it does not. No listener on the timeline path.
- `source/styles/motion.css` (65) — the rise (an 8 px settle over a fixed 300 px through the fold,
  `view()` inside `@supports`, scrubbed `linear`) and the cross-fade's house timing (0.3 s). **The
  reveal moves and never fades** — no opacity is animated anywhere.
- `source/scripts/router/router.js` — `commit(next, top)`/`mayFade()` wrap only the swap and the
  settle in a view transition: feature-detected, refused under reduce, history moves never fade, the
  wrap lands after the head so the arriving page fades in its own sheets.
- `source/styles/tokens.css` §23 — the light, the frost, the reveal range, the cross-fade duration,
  and `--shadow-lg: 0 10px 30px #15403d12` (the depth pass, placed on cards, tiles, chips and group
  rows; panels stay flat).
- `workspace/tools/visual/audit-motion.mjs` — the motion layer's own gate: **62 of 62 claims, exit
  0**, in real pixels and real frame time (light 5,660 samples lifted ≤ 4 LSB with no drop; frost
  `#f3f2f1`, faint **4.61 : 1**; twelve family pages walked and every reveal settled; reduced motion
  **0 animations** on all twelve, print likewise; cross-fade 0.3 s, history restoring 800 px; frame
  clock 16.7 ms turning against 16.7 ms still, 0 long tasks). `tools/visual/lib/pixels.mjs` now owns
  the pixel readings both audits share; `audit-atmosphere.mjs` came back under the ceiling (394 →
  370) with **106 of 106** still holding.
- The record: `docs/research/06` §9, the Phase 17 entry in `progress/PHASE_LOG.md`, `RUN_STATE.md`
  ledger rows 17.1–17.6.

Suite **732 pass, 0 fail**; build **563 routes**; the sweeps with the motion layer in: accessibility
**0 defects / 29 informational across 20 pages**, responsive **80 of 80**, performance **worst shift
0, 79 ms slowest load, 0 long tasks**, Lighthouse **accessibility 100 and best-practices 100 on all
eight pages** (performance recorded, mean 88).

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **Nothing is outstanding and nothing is half-written.** Phase 17 is closed; **Phase 18 — quality
   and delivery — is the next work item** on the same approved programme
   (`docs/IMPLEMENTATION_PLAN.md` §3). Read its deliverables and exit criteria before starting.
3. **The delivery still waits.** Merging, pushing and tagging (`v1.2.0` at the end) each wait for the
   author (`docs/GIT_WORKFLOW.md` §8); the word given for the `v1.1.0` delivery does not carry over.
   Tags are never moved: `v1.1.0` on the release close-out, `v1.0.1` on `bd338dd`, `v1.0.0` on
   `e035c6f`.
4. Confirm the start line: `node --test source/tests` → **732 passing**;
   `node source/tools/build.js` → **563 routes, 0 waiting**; with the dev server up on 4180,
   `node workspace/tools/visual/audit-motion.mjs` → **62 of 62 claims** and
   `node workspace/tools/visual/audit-atmosphere.mjs` → **106 of 106 claims**.
5. Before believing anything about a deployment, build for the address it actually lives at:
   `SITE_ORIGIN=https://dhbhensdadia.github.io/Chemipedia node source/tools/build.js`, then grep
   `dist/` for a `href="/` that is not `href="/Chemipedia/`. A local root build cannot catch this
   class of defect, which is why it reached production once.

## What is fragile or easy to get wrong

- **The reveal moves and never fades.** Keep it that way: an entrance that spends opacity draws text
  below the contrast every token promises for a stretch of the scroll, and the Lighthouse gate failed
  five pages for the first version. `tests/lib/motion.test.js` fails if opacity appears in the
  keyframes, and `audit-motion.mjs` holds a mid-rise section moved and fully opaque.
- **A contrast sweep must composite ancestors.** `audit-a11y.mjs` multiplies every ancestor's opacity
  into the text's alpha the way a browser composites it — that blind spot passed the pages Lighthouse
  failed. Do not weaken it.
- **Never alias a family token at `:root`.** A `var()` inside a custom property is substituted where
  the property is **declared**, so an alias froze the default hue before any `body[data-page]`
  override could apply: every computed property read correct and every page wore the same green.
  Only the pixel audit caught it. The family pair is read on the sheet that paints it.
- **The field's bound is not an opinion, and motion is optional by construction.** The caps in
  `docs/research/06` §6 were derived from `--ink-faint`'s shipped ratio; anything that raises them
  spends contrast the site does not have. The still composition is the page: reduced motion, print
  and no-script readers all get the same layers, held, and no animation may carry meaning — or spend
  a contrast the tokens never promised.
- **The palette is closed.** Every field hue resolves to a `--g-*` token — a test holds that. Neon,
  gradient text, glass behind prose and any imported colour are on the rejected list in
  `docs/research/06` §5.
- **The phone's family bloom is a known, recorded composition question** (`docs/research/06` §8): at
  375 px the masthead's paper band covers the bloom's core, so the family's tint is not readable at
  phone width. Phase 17 left the composition as it stands; it is not a defect to hotfix.
- **Print counts are measured by counting the page objects in the rendered PDF.** `mdls` does not
  index `$TMPDIR` on this machine; render with `page.pdf()` at A4 and Letter and count `/Type /Page`
  in the file (plain objects plus inflated streams).
- **A page family is only rendered if it is registered in `FAMILY_RENDERERS`** in
  `source/tools/build.js`; a missing entry renders the template with its placeholders still in it and
  no test catches it. Read the built document.
- **"Close to the reference" is a measurement, not an impression**, and a test that passes is not a
  page that works; when a function's argument has an interface, build the real one in the test.
- **No literal values outside `tokens.css`** — colours, sizes, radii, durations; breakpoints are the
  one recorded exception. Files stay under 400 lines: the over-ceiling list stands — **sixteen
  files** (twelve under `source/`, four in `workspace/tools/visual/`), recorded in `RUN_STATE.md` and
  `progress/PHASE_LOG.md`, with a named seam for each. Do not add a file to that list; split or
  record instead.
- **`source/tests/brand/brand.test.js` fails the suite** if **either** reference's name appears
  anywhere under `source/`, comments included. The audit's new subjects are the same class of thing:
  their names live in `workspace/` only, and nothing of theirs ships.
- **The preview is unreliable in two ways**: it may not composite, so no screenshot can be taken, and
  its window has no operating-system focus, so real key events are never delivered. Use
  `workspace/tools/visual`, and remember the dev server serves `dist/` — re-run
  `node source/tools/build.js` after any source change or the page you are looking at is the old one.
- **Attribution.** Identity is `Devansh <dhbhensdadia@gmail.com>`. Never add a co-author or a
  generated-with footer. Commit with `git commit -F -` and a heredoc, and stage by explicit path.
- **A file that is added or renamed must appear in `docs/MIND_MAP.md` in the same commit.**

## Anything deliberately left in a half state

**Nothing.** The tree is clean; `main` is unchanged and clean of this work; `feature/living-paper`
carries the finished Phases 16–17. The deferrals — the "expanded explanation" Phase 9 left out, the
two schema fields no acceptable source supplies (`covalentRadius`, `latticeParameters`), the
typeface, and the over-ceiling files — stand recorded rather than in flight.

`v1.0.0` stays on `e035c6f`, `v1.0.1` on `bd338dd`, `v1.1.0` on the release close-out; no tag was
moved.
