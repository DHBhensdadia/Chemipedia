# The living background and motion — audit

**Subject:** how reference-grade sites make a page field feel designed and alive, measured; what a
site with our constraints may take from that; and the exact budget our own field must stay inside.

**Status:** measured · **Recorded:** 2026-10-15 · **Measured by:** opening each site in the same
headless Chrome the visual harness uses (`channel: "chrome"`), capturing the hero and the page below
it at 1280 × 900, and reading the computed styles of every decorative layer — gradient stacks,
blur radii, blend modes, masks, textures and canvases — plus the site's own colour maths run against
our token layer. The same method as `01` and `04`.

**The one-line summary:** every site in this audit makes its field alive with the same small kit —
stacked low-alpha colour, a texture, a mask that keeps the text out of it, and motion that only ever
touches `transform` and `opacity` — and **our build ships none of it**: the field is one flat
`#fdfbfa` fill, and that is exactly what a review called out as reading like a static wiki.

---

## 1. The brief

The author brought back a review of the built site with one visual finding: the page reads like a
static document, a wiki, because the entire field behind the content is a flat near-white with
nothing happening anywhere on it. The instruction that follows is precise — make the surface
professional and alive, reactive or moving, in a way that matches the site's own identity and does
not look generated: no neon, no gradient clichés, nothing that breaks.

The site at `v1.1.0` is a faithful replica of the reference's *design language*, and §3 of
`BRAND_GUIDELINES.md` preserves that language deliberately: flat colour fills, no gradients, only
two soft shadows. The finding is about the one line of that language this program must evolve: **the
data surfaces stay flat; the page field becomes alive.** The replica judgement still stands for
structure, rhythm and interaction; the field becomes visibly ours.

**The constraints nothing in this audit may break** — each one is a gate the project already runs:

| Constraint | Where it binds |
|---|---|
| Zero runtime dependencies, no framework (ADR-004) | The field is CSS; the motion is the platform's own plus small modules |
| One light theme (ADR-006) | The field is warm paper with tint; it is not a second theme |
| WCAG AA everywhere, derived rather than asserted | The bound in §7 is computed from `--ink-faint`'s own shipped ratio |
| Layout shift 0, no long tasks, cold loads in tens of milliseconds | Every animated layer is compositor-only; measured by `audit-performance.mjs` |
| Reduced motion honoured without exception | The still composition is the default state, not a consolation |
| The printable pages are a feature | `@media print` strips the field; the print page counts are re-measured |
| No literal value outside `tokens.css` | The field's colours, alphas, sizes, durations and easings all live in §22 |
| 400-line ceiling; the mind map complete in the same commit | Stated per phase in the plan |

## 2. What was measured, and what will not survive from it

Nine pages were captured: our own build first, then eight sites chosen because each is known for a
field that reviewers describe as expensive — `stripe.com`, `linear.app`, `vercel.com`,
`raycast.com`, `apple.com`, `github.com`, `tailwindcss.com`, `resend.com`. For each: a hero capture,
a capture 1400 px down, and a layer report from the live DOM. The screenshots and
`measurements.json` are scratch, written to `workspace/screenshots/research06/` and gitignored; the
numbers are recorded here, which is the part meant to survive.

The layer rule, so the counts mean something: a **layer** is an element whose computed
`background-image` carries a gradient and whose box exceeds 250 000 px², or a positioned element
over 40 000 px² that carries a filter or a backdrop filter. Small decorative elements are counted
only when they blur. That rule is why the counts below are comparable between sites.

These are measurement subjects, not references: like the reference in `01` and the second reference
in `04`, their names live in this document and nowhere under `source/`, and nothing of theirs —
no palette, no asset, no copy — ships.

## 3. What the field is made of, site by site

| Site | Gradients | Blurred | Canvas | Textures | Masks | Text on the field |
|---|---|---|---|---|---|---|
| **ours, before** | **0** | **0** | 0 | none | none | — (a flat fill) |
| stripe | 18 | 5 | 2 | — | yes | some, over near-white zones |
| linear | 10 | 12 | 0 | grain (bitmap, `overlay` 0.6–0.9) | yes | some |
| vercel | 7 | 6 | 1 | — | yes | some |
| raycast | 21 | 24 | 1 | dotted grid | yes | some |
| apple | 9 | 2 | 0 | — | yes | most (imagery carries it) |
| github | 13 | 17 | 6 | — | yes | some |
| tailwind | 11 | 5 | 0 | a hatch in the margins | yes | some |
| resend | 51 | 9 | 1 | — | yes | almost none |

**What the numbers say, and what they do not.** The counts measure machinery, not taste: `resend`'s
51 gradients render as a near-black field where almost nothing is visible — the expense of that
field is *restraint*, not saturation. What is uniform across every site is the *shape* of the
answer: several large, low-alpha colour bodies, composed so that text sits on the calmest region;
texture or lattice for material; and a mask, 8 of 9 sites, doing the work of keeping the text out
of the colour.

Read again from the same data, technique by technique:

1. **Stacked radial blooms, low alpha, related hues.** Stripe's hero is five stacked
   `radial-gradient`s in violet, magenta and amber (`rgb(83, 58, 253)`, `rgb(243, 99, 243)`,
   `rgb(255, 207, 94)`) each under `filter: blur(10–15px)`, at opacity 0.85, over a
   `linear-gradient` field. Raycast's frame carries a peach bloom at **11 % alpha** and a lavender
   at **8 %** falling to nothing — the whole mood of the page is under an eighth of a colour.
   Their small glows (`radial-gradient(circle, rgba(255,255,255,0.04) …)`) are four per cent white.
2. **Motion that only touches `opacity` and `transform`.** Stripe animates its gradient stack by
   crossfading whole pre-composed layers (several 1280 × 970 layers at `opacity: 0` beside one at
   `1`), not by animating gradients. Nobody in this set animates a `background-position`, and the
   only long blur radius seen (`blur(120px)`) sits on a static decorative layer.
3. **The page colour is used as the mask.** Vercel's layers fade out through the *page's own*
   `rgb(250, 250, 250)` — `linear-gradient(to top, rgb(250,250,250), transparent)` and corner
   radials of the same colour — so decoration dissolves into the field by construction.
4. **Backdrop blur only on small surfaces.** Linear's header: `blur(20px)` behind an 80 % dark
   fill. Raycast's navbar: `blur(5px)`; its dock: `blur(10px)`; Apple's global nav:
   `saturate(1.8) blur(20px)`. Full-screen animated blur appears nowhere in the set.
5. **A lattice or a texture for material.** Raycast draws a **dotted grid** as
   `radial-gradient(rgb(47,48,49) 0.5px, transparent 0)`. Tailwind's margins carry a diagonal
   hatch. `linear` ships a **grain** bitmap blended `overlay` at 0.6–0.9 — the single most-copied
   material trick in the set, and the one our build can own in a smaller form: an inline SVG
   turbulence data-URI needs no request and no file.
6. **Blend modes as a finish, not a feature.** `multiply` on the reference's own divider (stripe),
   `plus-lighter` on GitHub's panels and Raycast's glass — used once each, on one element.
7. **Restraint in the numbers themselves.** Glows 3–4 %; tints 2–11 %; grain under 0.9 opacity of a
   texture that is itself subtle; blur radii 2, 5, 10, 20 — the big ones static. The expensive look
   is a *budget enforced at small values*, which is precisely what makes it reproducible inside our
   contrast rule: at these alphas, near-white stays near-white.

**What could not be measured from computed styles, honestly:** the drift durations. Only one
in-flow animation surfaced (an entrance at 1.5 s); the ambient motion on most of these sites is
canvas or JavaScript driven and invisible to a style read. Our own drift durations are therefore
chosen against our own clock (90–240 s, §6) and measured by our own audit, not copied.

## 4. What a light site can take — and what ours already proved is needed

The light sites in the set keep one habit our site cannot break: **the reading column stays at
paper luminance and the atmosphere lives in the hero band, the margins and the corners.** Stripe's
aurora occupies the top-right corner of its hero and dissolves before the text column; Tailwind's
hatch exists only in the page's gutters; Vercel's field is a near-white `rgb(250, 250, 250)` with
its colour confined to framed panels. The text zones are never the animated zones.

That habit is also the only way a moving field can hold AA at all. Our own numbers, from §7: the
shipped `--ink-faint` reaches 4.99:1 on the paper, which leaves almost no headroom — a single dark
bloom at 5 % already spends a third of it. So the doctrine this programme adopts is exactly the one
the reference-grade sites already obey, stated as a rule rather than a hope: **the field is a
hero-and-margin phenomenon; where prose sits, near-paper wins.**

And one thing our build already has that the others do not, which the field will use: **the atom
stage already draws a blueprint lattice** — `--atom-grid-pitch: 28px`, a stronger rule every
fourth line, a field that darkens towards the corners. The page's lattice will be that same grid at
paper strength. It is not a borrowed motif; it is the one the project already owns, escaping its
stage to become the whole site's drafting paper.

## 5. The design: the living paper

**One system, four layers, on every page, drawn in CSS with no markup and no script.**

| Layer | What it is | Why this and not something else |
|---|---|---|
| **The wash** | Three to four oversized radial blooms in the eleven group colours at capped alphas (5 % dark hues, 8 % light), anchored in the corners and the hero band, drifting on `transform` over 90–240 s | The site's identity is already its group palette; the field becomes colour the data already owns, instead of an imported gradient |
| **The lattice** | The stage's own grid — 28 px pitch — as hairlines at ≤ 2.5 % ink over paper, faded out at the shell's edges | One motif in two places reads as a system; a second, unrelated texture would read as decoration |
| **The grain** | An inline SVG turbulence data-URI at ≤ 2.5 %, multiplied | Kills the banding a large soft gradient shows on cheap panels — the difference between "expensive" and "broken" — and gives the paper a material |
| **The vignette** | A 2 % edge shade, top and corners | Grounds the masthead and stops the field reading as an endless sheet |

**The family fields.** Every page family gets its own emphasis on the wash — the home page's hero
the richest, the glossary calmest, calculators amber, the atoms page rimmed in the electron's own
pale blue, the element pages carrying their *element's group colour* the way their hero wash
already does. Every family hue resolves to a `--g-*` token the data layer already ships; a test
holds that, so the field can never drift into a palette of its own.

**The motion, four axes, each one measured:**

1. **Time** — the wash drifts (`transform` only, 90–240 s, alternate, eased): the page is never
   frozen, and never busy.
2. **Scroll** — sections and card grids rise once as they enter, using the platform's own
   scroll-driven animations (`animation-timeline: view()`), with `@supports` as the gate: a browser
   that has never heard of it shows the finished page, which is the correct failure.
3. **Pointer** — a soft warm **light** that follows the pointer across the field (fine pointers
   only, rAF-throttled, eased like the orbit camera). It is white-based, so it can only *raise*
   the field's luminance — it cannot fail the bound. Absent on touch and under reduced motion.
4. **Navigation** — a short crossfade between pages where the View Transitions API exists, feature-
   detected and reduced-motion-gated, with today's instant swap as the fallback.

**Rejections, recorded so taste survives the session** (the anti-pattern list this programme is
measured against): neon; saturated or multi-stop "AI" gradients; gradient text; glass on surfaces
that carry text; blur anywhere full-screen, animated, or behind prose; motion that carries
information; particles for their own sake; canvases added where CSS suffices; any colour outside
the eleven group hues, ink and paper; and drift durations short enough to notice.

## 6. The field's budget, derived

The one line that must not be crossed is `--ink-faint` (`#5b726e`) on the field: it is the site's
lightest small-text ink and it ships at **4.99 : 1** on the paper. Everything below is spent from
that number, not chosen.

| Step | Value | Result |
|---|---|---|
| `--ink-faint` on `--bg` today | 4.99 : 1 | headroom to AA: 0.49 |
| Maximum field luminance that keeps AA | **L ≤ 0.867** | the paper is L = 0.968; the field may spend 0.10 |
| One dark bloom, 5 % (alkaline earth `#15403d`) | L = 0.884 | `--ink-faint` **4.58 : 1** ✓ |
| Two dark blooms stacked, 5 % each | L = 0.820 | **4.27 : 1** ✗ |
| One pale bloom, 10 % (non-metals `#a6c6d5`) | L = 0.917 | **4.74 : 1** ✓ |

So the construction rule, which the token layer must express and a test must hold:

- **One bloom at a time where text sits.** No point of the reading field compounds two dark blooms;
  the wash's anchors and its ≤ 4 %-of-viewport drift keep them apart by construction, and the
  browser audit then samples real composited pixels at the drift's extremes.
- **Caps by hue:** the four dark group hues (alkaline-earth `#15403d`, halogens `#4c575a`, alkali
  `#456683`, metalloids `#6e58ac`) ≤ **5 %**; the seven light ones ≤ **8 %**.
- **Lattice ≤ 2.5 %, grain ≤ 2.5 %**, both of which cost a fraction of what one 5 % bloom costs.
- **The light only adds.** White at any alpha moves the field up towards L = 1, so pointer motion
  is outside the budget by construction.

`tests/lib/backdrop.test.js` derives these ceilings from `tokens.css` itself — the same pattern
`lowestAlphaForAA` already uses for the tile fades — and `audit-atmosphere.mjs` measures the real
pixels on top. A bound that is derived and then measured is the difference between a design and a
claim.

## 7. What this means for the build

- The field is **one new global sheet** (`styles/atmosphere.css`) attached to `html` and `body`
  through pseudo-elements — no markup changes on any page, no script, and nothing the router can
  forget to adopt. The build links it after `layout.css` beside the three global sheets it already
  ships.
- Its values are **one new token group** (`tokens.css` §22, "the living paper"): hues, alphas,
  geometry, the lattice, the grain, the drift, the family overrides, and the comment recording the
  derivation in §6.
- What is *motion* is added in a second step and is additive, measured, and reversible per axis:
  one small `reveal` behaviour only if the platform's own timelines prove insufficient after
  measurement, one `pointer-light` module, the masthead's scrolled state, and the router's
  transition — each with its own audit claims.
- The programme is planned as **three phases** (16–18, `docs/IMPLEMENTATION_PLAN.md` §3), and
  **ADR-008** records the line it walks: the reference's flat field becomes a deliberate deviation;
  the data surfaces stay flat; the field stays bounded; motion stays optional.

The honest summary of this audit, for the interview: eight fields were opened and their machinery
read, the techniques that recur are small and countable, the one that matters — keeping the text
out of the colour — is the one our own contrast maths independently demands, and everything else is
discipline about small numbers.
