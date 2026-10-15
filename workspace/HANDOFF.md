# HANDOFF.md — note to the next agent

**Written:** 2026-10-15 · **By:** the planning session for **the living paper** — the audit of eight
reference-grade fields, the three phases that came out of it, and ADR-008 · **After commit:** the
planning commits on `feature/living-paper` (`main` is unchanged at `0ba6b04`; `v1.1.0` stays on the
release line)

Rewrite this file at the end of every session. It must never be older than the last commit.
Keep it short. Detail belongs in `RUN_STATE.md` and `progress/PHASE_LOG.md`.

---

## What exists right now

**The site is live at `v1.1.0`** — <https://dhbhensdadia.github.io/Chemipedia/> — and nothing about it
has changed in this session: no site file was touched.

**On `feature/living-paper` (local only — not merged, not pushed):**

- `docs/research/06-living-background-and-motion-audit.md` — the evidence. Our own build ships
  **zero** decorative layers on its field (measured, not assumed); then eight reference-grade sites
  were opened in the same headless Chrome the visual harness uses and their fields read layer by
  layer — gradient stacks, blur radii, blend modes, masks, textures, canvases. It records the seven
  techniques that recur, the reading-column rule every light site already obeys, the design that
  follows (four layers — the wash, the lattice, the grain, the vignette; the family fields; four
  motion axes; the anti-pattern list), and the contrast budget **derived** from `--ink-faint`'s own
  shipped 4.99:1: one bloom at a time where text sits, ≤ 5 % for the four dark group hues, ≤ 8 % for
  the light ones, lattice and grain ≤ 2.5 %.
- `docs/IMPLEMENTATION_PLAN.md` §3's **Phases 16–18** — the field (CSS only, bounded, audited), the
  motion and the depth, then quality and delivery — with §2, §4, §5 and §6 amended.
- **ADR-008 `PROPOSED`** in `docs/ARCHITECTURE.md`: the living paper — the data surfaces stay flat,
  the page field becomes four bounded layers, every hue a `--g-*` token, compositor-only motion, and
  nothing hidden before the platform arrives.
- `MIND_MAP.md`, `AGENTS.md`'s ADR table, `RUN_STATE.md` and this file brought current; ledger row
  16.0 recorded.

## What to do first

1. Follow the start sequence in `AGENTS.md` §0. Do not skip it.
2. **Nothing is outstanding and nothing is half-written.** The author asked for the plan first: the
   next move is theirs — review the plan, then say continue. **Do not begin Phase 16 without that
   word.** When it comes: `git checkout feature/living-paper`, work through Phase 16's deliverables,
   and hold its exit criteria.
3. **The word also gates the ADR and the delivery.** ADR-008 moves `PROPOSED` → `ACCEPTED` when the
   plan is approved; merging, pushing and tagging (`v1.2.0` at the end) each wait for the author
   (`docs/GIT_WORKFLOW.md` §8). Tags are never moved: `v1.1.0` is on the release close-out, `v1.0.1`
   on `bd338dd`, `v1.0.0` on `e035c6f`.
4. Before believing anything about a deployment, build for the address it actually lives at:
   `SITE_ORIGIN=https://dhbhensdadia.github.io/Chemipedia node source/tools/build.js`, then grep
   `dist/` for a `href="/` that is not `href="/Chemipedia/`. A local root build cannot catch this
   class of defect, which is why it reached production once.
5. Confirm the start line: `node --test source/tests` → **681 passing**;
   `node source/tools/build.js` → **563 routes, 0 waiting**.

## What is fragile or easy to get wrong

- **The field's bound is not an opinion.** The caps in `docs/research/06` §6 were derived from
  `--ink-faint`'s shipped ratio; anything that raises those alphas spends contrast the site does not
  have. Derive and measure — never eyeball it, and never verify a moving field from one still frame.
- **Motion is optional by construction.** The still composition is the page: reduced motion, print
  and no-script readers all get the same four layers, held. Nothing may be hidden by CSS that only a
  script can reveal, and no animation may carry meaning.
- **The palette is closed.** Every field hue resolves to a `--g-*` token — a test will hold that.
  Neon, gradient text, glass behind prose and any imported colour are on the rejected list in
  `docs/research/06` §5; the review is against that list, not only against the gates.
- **A page family is only rendered if it is registered in `FAMILY_RENDERERS`** in
  `source/tools/build.js`; a missing entry renders the template with its placeholders still in it and
  no test catches it. Read the built document.
- **"Close to the reference" is a measurement, not an impression**, and a test that passes is not a
  page that works; when a function's argument has an interface, build the real one in the test.
- **No literal values outside `tokens.css`** — colours, sizes, radii, durations; breakpoints are the
  one recorded exception. Files stay under 400 lines: the over-ceiling list stands — fourteen files,
  recorded in `RUN_STATE.md` and `progress/PHASE_LOG.md`, with a named seam for each. Do not add a
  file to that list; split or record instead.
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

**Nothing.** The tree is clean; `main` is unchanged and clean of this work; the planning commits sit
on `feature/living-paper` and are complete as planning. The deferrals — the "expanded explanation"
Phase 9 left out, the two schema fields no acceptable source supplies (`covalentRadius`,
`latticeParameters`), the typeface, and the over-ceiling files — stand recorded rather than in
flight.

`v1.0.0` stays on `e035c6f`, `v1.0.1` on `bd338dd`, `v1.1.0` on the release close-out; no tag was
moved.
