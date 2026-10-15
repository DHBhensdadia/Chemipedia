# Design System — ChemiPedia

The implementation spec for the visual layer. Values are the ones extracted from the reference and
recorded in `docs/research/01-reference-site-audit.md`; this file is how they are organised in code.

**One rule governs the whole layer:** no literal colour, size, radius, duration or easing may appear
outside `source/styles/tokens.css`. Every other stylesheet references tokens only. A phase that
introduces a raw hex value fails its exit criteria.

---

## 1. Token layer — `source/styles/tokens.css`

### 1.1 Surfaces and ink

```css
:root {
  /* Warm paper and pine-green ink — the identity */
  --bg:            #fdfbfa;
  --surface:       #ffffff;
  --surface-sunk:  #f6f2ef;

  --ink:           #15403d;   /* brand ink: rules, headings, the dotted motif */
  --ink-body:      #24312f;   /* body copy */
  --ink-soft:      #5d6b68;   /* secondary */
  --ink-faint:     #5b726e;   /* tertiary, captions — darkened from the reference's
                                 #8a938f; see the note under the palette */
  --ink-inverse:   #fdfbfa;   /* text on ink */

  --line:          #e4ddd7;
  --line-strong:   #cfc5bc;

  --accent:        var(--ink);
  --on-accent:     var(--ink-inverse);
}
```

**ChemiPedia ships one theme: light.** The warm-paper palette above is the design, and it is the
only palette. There is no `data-theme` attribute, no theme switcher, no `prefers-color-scheme`
branch, and no second set of surface tokens. See ADR-006 in `docs/ARCHITECTURE.md` for the decision
and the reasoning.

This simplifies the layer in three ways worth noting, because each one removes a class of bug:

- Every component is authored, reviewed and screenshotted against exactly one background, so a
  contrast or legibility problem cannot hide in the other theme.
- Each of the eleven element-group colours has one verified foreground rather than two, which halves
  the contrast invariants the tests must assert.
- The visual verification pass at the end of each phase stays at three viewport widths instead of
  doubling into six.

The reference site does render a dark variant, and its `:root` values are in fact the light ones —
we are adopting the palette it defines at the root, not the variant it switches to at runtime.

### 1.2 Element group colours — eleven fixed values

```css
:root {
  --g-transition-metals:      #f9aa62;   /* orange       */
  --g-actinides:              #559982;   /* sage         */
  --g-lanthanides:            #d473a2;   /* pink         */
  --g-post-transition-metals: #97c0aa;   /* pale green   */
  --g-unknown:                #efce69;   /* yellow       */
  --g-noble-gases:            #e57860;   /* coral        */
  --g-non-metals:             #a6c6d5;   /* pale blue    */
  --g-alkali-metals:          #456683;   /* slate blue   */
  --g-alkaline-earth-metals:  #15403d;   /* deep pine    */
  --g-metalloids:             #6e58ac;   /* violet       */
  --g-halogens:               #4c575a;   /* grey blue    */
}
```

**The ink ladder had to be compressed.** The reference's own tertiary ink, `#8a938f`, is 3.06:1 on
our paper and 2.84:1 on the sunken surface — below AA at the 13.6px it is used at (captions, the
footer, an element's atomic number in a configuration row, a discovery year, a field's unit). Any
value that passes AA is within half a step of `--ink-soft`, so the four-step ladder the reference
uses is now three visible steps plus a fourth that reads as faint only by weight and placement
rather than by lightness. That is the honest cost of the requirement, and a browser sweep over every
page is what found it: the failure was invisible in the code and obvious on measurement.

**Invariant to test:** every ink token reaches WCAG AA on every surface token it is used on. A test
in `tests/lib/contrast.test.js` reads both sets of values from `styles/tokens.css` and holds them.

**Invariant to test:** every group colour has a paired foreground that reaches WCAG AA contrast
against it. The pairs live in `source/data/categories.json` (or a single derived function in
`lib/contrast.js`), not in each component. Dark groups (`alkaline-earth-metals`, `halogens`,
`alkali-metals`, `metalloids`) take the cream foreground; pale groups take the dark ink. The
reference does the same thing with its `--fill` / `--on-fill` custom properties.

**A group colour may only be faded as far as its tightest pairing allows.** A tile sets its atomic
number and its name in the symbol's own colour and fades them, and that fade is the tile's whole
hierarchy — but fading moves the ink towards the fill behind it. On `--g-actinides` (`#559982`) the
dark ink is 4.96:1, so 0.9 of it lands at 4.32:1: below AA at the 8.8px an atomic number is actually
set at. `--opacity-tile-number`, `--opacity-tile-name` and `--opacity-card-z` are therefore capped
by the tightest of the eleven pairings, which is 0.93, rather than chosen for taste — and it was
Lighthouse, not a code review, that caught the two that were not.

**Invariant to test:** `lowestAlphaForAA(ink, fill)` in `lib/contrast.js` derives that ceiling from
the pairings themselves, and `tests/lib/contrast.test.js` holds every fading token above it.

**An isolated table drains its fill, never its tiles.** A group page rests with one key at full
colour and the rest quietened. Fading the whole tile to 0.22 takes its text with it: an ink and a
fill that both move towards the paper converge on the paper, and the drained tiles measured 1.5:1.
The drain is a `color-mix()` towards the paper instead, which leaves the text at full strength on a
pale tint of its own group, where the dark ink reaches AA.

**How to apply a group colour:** set the custom property on the element, do not add a modifier class
per group.

```html
<a href="/elements/hydrogen" style="--fill: var(--g-non-metals); --on-fill: #12211f">
```

```css
.tile { background: var(--fill); color: var(--on-fill); }
```

### 1.3 Block colours (alternate table view)

```css
--g-s-block: var(--g-alkali-metals);        /* slate blue  */
--g-p-block: var(--g-actinides);            /* sage green  */
--g-d-block: var(--g-transition-metals);    /* orange      */
--g-f-block: var(--g-lanthanides);          /* pink        */
```

The four blocks point at four of the eleven group colours rather than repeating their values: the
reference's orbitals view uses the same four, so a correction to a group colour moves both views at
once.

### 1.4 Typography

```css
--font-body:    "Inter", "Work Sans", ui-sans-serif, system-ui, "Helvetica Neue", Arial, sans-serif;
--font-display: var(--font-body);
--font-mono:    ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;

--step--1: clamp(0.79rem,  0.77rem + 0.10vw, 0.85rem);
--step-0:  clamp(1.00rem,  0.96rem + 0.18vw, 1.10rem);
--step-1:  clamp(1.25rem,  1.18rem + 0.35vw, 1.45rem);
--step-2:  clamp(1.56rem,  1.44rem + 0.62vw, 1.94rem);
--step-3:  clamp(1.95rem,  1.74rem + 1.05vw, 2.58rem);
--step-4:  clamp(2.44rem,  2.08rem + 1.78vw, 3.43rem);
--step-5:  clamp(3.05rem,  2.45rem + 2.98vw, 4.58rem);

--leading-tight: 1.08;   /* display headings */
--leading-body:  1.6;
--leading-prose: 1.7;
--measure:       68ch;   /* max prose width  */
```

Usage: hero `<h1>` → `--step-4`/`--step-5`; section `<h2>` → `--step-2`; card title → `--step-1`;
body → `--step-0`; caption/badge → `--step--1`.

### 1.5 Space, shape, layout

```css
--sp-1: 0.25rem;  --sp-2: 0.5rem;  --sp-3: 0.75rem;  --sp-4: 1rem;
--sp-5: 1.5rem;   --sp-6: 2rem;    --sp-7: 3rem;     --sp-8: 4rem;   --sp-9: 6rem;

--radius:    2px;   /* the default: near-square */
--radius-lg: 8px;   /* raised panels only       */
--shell:     1100px;
--pad-shell: var(--sp-5);   /* horizontal page padding, reduced on small screens */

--rule-solid:  1px solid var(--ink);
--rule-dotted: 1px dotted var(--ink);
--shadow-sm: 0 1px 2px  #15403d0f;
--shadow-md: 0 4px 16px #15403d14;
--shadow-lg: 0 10px 30px #15403d12;   /* the elevation ladder's third step — Phase 17 */
```

### 1.6 Motion

```css
--dur-fast: 0.16s;
--dur-base: 0.30s;
--dur-slow: 0.62s;
--ease-out:  cubic-bezier(0.22, 1, 0.36, 1);
--ease-soft: cubic-bezier(0.33, 1, 0.68, 1);

--rise:    14px;   /* entrance offset */
--rise-sm:  8px;
--stagger:     70ms;
--stagger-sm:  45ms;
```

Character: short, decelerating, upward. Never bouncy, never longer than `--dur-slow`.

**Mandatory:**

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### 1.7 The atom viewer — `tokens.css` §21

The one part of this layer that is not read by a browser's style engine alone. The atom viewer is
hand-written WebGL2 (ADR-007), and **a graphics card cannot read a stylesheet** — so the renderer asks
`getComputedStyle` for the same custom properties every other surface reads, at start-up. The rule
this keeps is the project's oldest one, applied where it is hardest: how the atom looks is a change to
this file and never to a shader, a buffer or a page.

```css
--atom-stage: #0d2b28;        /* deep pine: darker than --ink, so the page around it reads as paper */
--atom-stage-height: 34rem;
--atom-grid-line: #1c423b;  --atom-grid-pitch: 28;  --atom-grid-major: 4;   /* the field's grid */
--atom-grid-major-strength: 1.9;  --atom-grid-fade: 0.55;
--atom-proton:  #e57860;      /* the table's noble-gas coral, tuned for a dark ground */
--atom-neutron: #cfc5bc;      /* the site's own warm rule grey */
--atom-electron:#7fd2e8;      /* the non-metals' pale blue, raised to carry a glow */
--atom-orbit: #d7e6e2;  --atom-orbit-opacity: 0.18;  --atom-orbit-tube: 0.007;
--atom-nucleon-radius: 0.2;   --atom-nucleus-packing: 0.9;   --atom-electron-radius: 0.1;
--atom-orbit-base: 2;  --atom-orbit-step: 1.2;  --atom-orbit-spread: 0.15;  --atom-orbit-speed: 0.9;
--atom-spin: 0.16;  --atom-shake-speed: 6;  --atom-shake-decay: 1.6;
--atom-light-direction: 10 10 5;   --atom-light-strength: 0.85;
--atom-light-sky: #ffffff;  --atom-light-ground: #bbbbbb;  --atom-ambient: 0.75;
--atom-light-roughness: 0.4;  --atom-light-metalness: 0.2;  --atom-light-specular: 0.5;
--atom-camera-distance: 13.1;  --atom-camera-fov: 50;  --atom-drag-sensitivity: 0.01;
--atom-bar-fill: rgba(9, 34, 31, 0.55);  --atom-bar-blur: 15px;  --atom-bar-radius: 0.75rem;
--atom-bar-glow: rgba(127, 210, 232, 0.06);  --atom-bar-glow-radius: 40px;
--atom-bar-ink: #eef4f2;  --atom-on-particle: #10201f;  --atom-focus: #ffd9a0;  /* …67 in all */
```

The three particle colours are this design system's own family rather than a new palette: the coral
the noble gases already use, the warm grey of the rules, and the non-metals' pale blue — renamed for
the scene and tuned for a dark ground, where a pale group colour that earns its keep on paper is
either mud or a glare. The second reference's own values are recorded in
`docs/research/04-reference-atom-viewer-audit.md` precisely so that they are not shipped by accident.

**The light is three tokens and not one.** A surface takes a sky over a ground (`--atom-light-sky`,
`--atom-light-ground`, `--atom-ambient`) plus one directional light (`--atom-light-strength`,
`--atom-light-direction`), and its highlight's width and tint come from a roughness and a metalness the
same way a physical material's would. The reason is the same one the rest of this system runs on: the
difference between a sphere that looks like a dark disc with a bright side and one that looks like a
sphere *is* a design decision, so it is declared here — at 0.4 roughness and 0.2 metalness, which are
the reference's own numbers — rather than buried in a shader.

**The field is five tokens, and it is drawn rather than styled.** `--atom-grid-line` is the line's colour
written as it comes out of the shader rather than as a line over the field, because the renderer mixes
towards one colour and because the pixel audits have to be able to name a pixel as the panel's rather
than the scene's; `--atom-grid-pitch` is CSS pixels between lines, multiplied by the surface's own ratio
in the pass so the grid is the same size on any display; `--atom-grid-major` and
`--atom-grid-major-strength` are the stronger rule every fourth line; and `--atom-grid-fade` is how much
darker the field goes towards the corners. The reference draws the same idea as a page pattern behind a
transparent canvas; ours is the scene's own first draw, because a canvas transparent enough to show a
stylesheet through it cannot also blend a translucent ring into the field — which is measured, and is
recorded in `docs/research/05-atom-renderer-measurements.md`.

The rest of the group is geometry, motion and glass in the units the renderer works in — radii and
orbit distances in the atom's own scale, angles in radians, mesh detail as segment counts — followed by
the bar's measured glass values. Nothing here is a colour chosen twice: the bar's fill **is** the
stage's colour carried as an alpha, so the glass shows the scene behind it, and its halo is the
electron's own hue at six percent rather than the reference's cyan.

### 1.8 The living paper — `tokens.css` §22–23, the file's two closing groups

The programme that closes the site (ADR-008) treats the page's own field as a designed surface. The
ground is still paper (`--bg`, §1.1); everything in §22 is weather on it — four blooms of the site's
own group hues, anchored in the frame's outer tenth; the atom stage's lattice at hairline weight;
grain — and two of the sheets drift on a slow compositor-only turn. §23 carries the motion: the
pointer light, the masthead's frost and the reveal's travel.

```css
/* §22 — the field. Every hue resolves to a --g-* group token; every alpha was solved, not chosen. */
--field-bloom-radius: 68vmax;   --field-bloom-fade: 72%;
--field-bloom-2-hue: var(--g-noble-gases);      --field-bloom-2-alpha: 0.042;
--field-family-element-hue: var(--g-actinides); --field-family-element-alpha: 0.048;  /* one pair per page family */
--field-drift-duration-a: 180s; --field-drift-duration-b: 240s; --field-drift-x: 2.2%;
--field-lattice-alpha: 0.011;   --field-lattice-pitch: 28px;    /* the stage's own pitch (§21) */
--field-grain-alpha: 0.02;      --field-wash-focus: 1;          /* 0.88 on a narrow frame — the width query's one factor */

/* §23 — the motion. */
--pointer-light-size: 46vmax;   --pointer-light-alpha: 0.4;     /* white-based: it can only add */
--pointer-light-damping: 8;     /* how fast it reaches the pointer — the camera's own rate (§21) */
--masthead-frost-paper: 0.96;   --masthead-frost-blur: 8px;     --masthead-frost-range: 160px;
--reveal-travel: 300px;         /* a rise, not a fade — the reveal spends no opacity */
```

**Every number here was solved, not chosen.** The book is `--ink-faint`'s shipped 4.99:1 on bare
paper: under the whole field at its worst — grain at its darkest pixel, a lattice line under the
text, every bloom stacked as the geometry allows — the conservative model's floor is 4.53:1, so no
point of any page can leave AA (`docs/research/06-living-background-and-motion-audit.md` §6 holds
the derivation). What a bloom may carry alone was computed per hue with the site's own
`scripts/lib/contrast.js`: the deepest saturates at 5.35%, the light hues at 9.15–11.95%, and every
shipped alpha sits at least 15% under its hue's own ceiling. The washes mix from the very tokens the
table paints its tiles with, so a group's colour is one fact about the data and not two; a test
(`source/tests/lib/backdrop.test.js`) re-derives the ceilings from this file, and the browser audit
(`workspace/tools/visual/audit-atmosphere.mjs`) re-measures the composite in real pixels at the
drift's extremes. A change to any number here has to pass both.

One trap is documented in the file itself because it cost a phase: writing
`--field-bloom-1-hue: var(--field-family-hue)` on `:root` would substitute the default hue where the
property is **declared**, before any page family could override it — every page would wear the same
green, with every test passing. The family pair is read on the sheet that paints it; the test holds
the alias's absence and the pixel audit holds the result.

## 2. Base layer — `source/styles/base.css`

Reset and element defaults: `box-sizing: border-box` everywhere, margin reset, `text-rendering`,
`font-synthesis: none`, a sensible media default, a visible `:focus-visible` ring built from
`--ink` and `--accent`, and `::selection`. No component styles here.

## 3. Naming conventions

Follow the reference's own scheme — it is conventional, readable, and already proven in this exact
design:

- **Components** use a block name and element suffixes: `.tile`, `.tile__z`, `.tile__sym`;
  `.meta`, `.meta__name`, `.meta__sub`.
- **Modifiers** use a double dash: `.lvl--beginner`, `.tile--placeholder`.
- **State** uses `is-` / `has-`: `.is-active`, `.is-isolated`, `.has-error`.
- **Utility** classes are rare and named for what they do, not where they are: `.visually-hidden`,
  `.stack`, `.rule-dotted`.
- No nested selectors deeper than three levels. No `!important` outside the reduced-motion block
  and `.visually-hidden`.
- No IDs as style hooks.

## 4. Component inventory

Each component is one JS module in `source/scripts/components/` and one stylesheet of the same name
in `source/styles/components/`. Styles never bleed across files.

| Component | Owns | Used by |
|---|---|---|
| `site-header` | wordmark, primary nav, search field, responsive collapse | every page |
| `submenu` | contextual secondary nav, active-item underline | every page family |
| `site-footer` | five link columns, tagline, copyright | every page |
| `periodic-table` | the 18×10 grid, colour modes, isolation, keyboard nav, tooltips | home, 4 table views, group pages |
| `element-tile` | one tile: number, symbol, name; compact and detailed variants | table, index, cards |
| `element-card` | index card: tile + name + group + weight · state | elements index, rankings, group pages |
| `legend-chips` | one pill per colour key, with count; emits isolate events, or links to a key's own page | home, 4 table views, group pages |
| `element-search` | input, live filtering, quick-jump behaviour | home, elements index |
| `property-list` | the ~40-row labelled property table, with sentinel handling | element detail |
| `definition-list` | key/value pairs for Discovery and similar | element detail, glossary |
| `faq-block` | generated question/answer pairs from element data | element detail |
| `shell-diagram` | generated SVG electron shell diagram | element detail, the atoms page (its fallback) |
| `atom-view` | the WebGL2 layer: context, programs, buffers, one instanced draw a frame | atoms page, style guide |
| `atom-scene` | the model, alive: where every particle is this frame, and the camera | atoms page, style guide |
| `atom-bar` | the glass bar under the stage: card, three count steppers, speed, Shake/Reset/Pause, legend, element chooser | atoms page |
| `atom-stage` | the page's browser half: builds the scene, wires the bar, and replaces the diagram on the first frame drawn | atoms page |

The last four are the one place the inventory's "one stylesheet of the same name" does not hold: the
drawing modules carry no sheet of their own, because every value they draw with is a token in §21 read
at runtime, and the stage's own rules live in `styles/pages/atoms.css` beside the page they belong to.
| `bar-ranking` | horizontal magnitude bars for the ranking pages | melting/boiling point pages |
| `converter-input` | one synchronised numeric input in the temperature calculator | calculators |
| `filter-bar` | search + letter jump index | glossary, elements index |

## 5. Responsive strategy

- Mobile-first CSS. Base styles target narrow screens; `min-width` media queries add complexity.
- Breakpoints: `40rem`, `56rem`, `72rem`.
- The periodic table is the one intentional exception: it keeps its 18-column geometry and scrolls
  horizontally rather than reflowing out of shape. A narrow-screen affordance plus keyboard
  scrolling makes it reachable.
- Element index cards: one column → two columns at `40rem`.
- Never hide content to make a breakpoint fit. Reflow it.

## 6. Accessibility requirements for this layer

- Every group colour pairing meets WCAG AA (4.5:1 for text, 3:1 for the tile as a graphic element
  against its background).
- Focus is always visible, and never removed without an equal-or-better replacement.
- The dotted rule must not be the only signal carrying meaning.
- Tiles are real links or buttons with accessible names, not `div`s with click handlers.
- `prefers-reduced-motion` is honoured everywhere, without exception.

## 6.1 If a dark theme is ever wanted

The semantic token names are already theme-neutral: nothing in `tokens.css` is named after the light
palette, and no component reads a literal colour. Adding a second theme later is therefore a
contained change — a second value set under a root attribute — rather than a refactor. It is recorded
here as a deliberate, reversible omission rather than an oversight.

## 7. The atom stage — a dark scene inside a light page

`/atoms/` is one dark rectangle in an otherwise paper-light site, and that is a palette decision
rather than a second theme (ADR-006 stands: there is one theme, one `:root`, and no `data-theme`).
Four rules govern it, and every one of them exists because a colour on a dark ground behaves
differently from the same colour on paper:

1. **The stage owns the dark, and nothing else does.** The masthead, the submenu band, the footer,
the page's prose and its headings stay paper-light. `--atom-stage` is set on the stage element, so the
page around it is unchanged and a reader scrolling past cannot mistake the site for a dark one.
2. **Nothing on the stage inherits a colour.** A link's colour is the site's ink by default, which is
invisible here; the focus ring is the site's ink too. So every control in the bar names its own ink
(`--atom-bar-ink`, `--atom-bar-ink-dim`), the bar has its own ring (`--atom-focus`), and the
accessibility sweep measures the result against the composited glass rather than against the page.
   The first run of that sweep measured the bar's symbol link at **1.47:1** for exactly this reason.
3. **The glass shows the scene behind it.** The bar is translucent — the stage's own colour at an
alpha, with a backdrop blur — because the atom is the point and the controls are the annotation. It
was the site's only blurred surface until the living paper's masthead learned to frost (§9), and the
two are not the same kind of blur: the bar shows a *drawing* behind it, and its controls are read
against the composited glass, while the frost is paper at a derived 0.96 behind an 8 px blur — near
enough to opaque that the band is paper with a suggestion of what is under it, its minimum derived so
the faintest ink the band carries keeps AA over anything a page can scroll beneath it. No text is
read against a scene anywhere else on the site, and no third blurred surface exists.
4. **The stage is sized by the page, not by the viewport.** `--atom-stage-height` is the stage's own
height, and the bar floats inside it at `--atom-bar-inset`; the bar wraps to two rows under `40rem`
rather than scrolling, and the stage grows to hold them. A horizontally scrolling control bar on a
phone is one nobody finishes using.

## 8. Phase 1 deliverable

A **style guide page** rendering every token and every component in isolation: the palette swatches,
the type scale, the spacing scale, all eleven group colours with their foregrounds and a contrast
result, each component in each state. It is a development tool, excluded from the built output and
from the sitemap, and it is the fastest possible way to verify this layer.

## 9. The living paper — the field and its bound

The page's field is a designed surface, not a leftover: three layers compose it — a wash of four
group-hue blooms, one of them the page family's own (read from the hue-and-alpha pair the family
sheet itself paints), the atom stage's lattice at hairline weight, and grain — with two sheets
drifting on a slow compositor-only turn. Over it sit the programme's motion and its one depth step:
sections rise once as they enter, a white light follows a fine pointer, the masthead frosts after
the first scroll, a forward navigation dissolves, and the elevation ladder gains its third step.
The light is white-based, so it can only raise luminance; the frost's paper minimum and the drift's
extent are derived, not chosen; and the reveal is the movement alone — **opacity is animated
nowhere on the site**, so no scroll position draws text below the contrast its tokens promise.

The bound comes first in the arithmetic, and §1.8 states it: `--ink-faint` keeps 4.99:1 on bare
paper, the whole field at its worst leaves the conservative model's floor at 4.53:1, and each
bloom's ceiling is computed per hue against those two before anything is drawn. Then it is measured
in real pixels behind real text, at the drift's extremes, by
`workspace/tools/visual/audit-atmosphere.mjs` — 106 of 106 claims, with the motion layer's own gate
beside it at 62 of 62 (`audit-motion.mjs`). Reduced motion is the designed still composition rather
than a blank page; print renders all four printable sheets as `display: none` over bare paper;
without scripting the field is drawn and stays still. The derivation is
`docs/research/06-living-background-and-motion-audit.md` §6, the decision record is ADR-008, and the
single amendment to the brand's preserved list is recorded in `BRAND_GUIDELINES.md` §3 with ADR-008
as its reason.
