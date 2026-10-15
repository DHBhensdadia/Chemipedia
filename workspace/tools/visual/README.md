# The visual verification harness

Track B of `workspace/docs/research/02-tooling-and-visual-verification.md`, adopted because Track A's
screenshot tool could not composite for two sessions running.

**What it does.** It opens the reference and our build in the same headless browser, at the same
width, in the same colour scheme, and reports three things: the pixel difference between the two
views (and between named regions of them — the table, the hero, the finder), the worst differing
horizontal bands, and a row-by-row comparison of measured geometry: boxes, gaps, paddings, type
sizes, colours, font stacks.

**Why it is allowed to exist.** It is development-only. It lives under `workspace/`, nothing in
`source/` imports it, the site runs and the tests pass with `node_modules` deleted, and it ships
nowhere. It is not build tooling — the build is still plain, dependency-free Node.

**How to run it.** Node 20+. Chrome installed (it drives the system Chrome — `channel: "chrome"` —
so no browser download is needed).

```bash
cd workspace/tools/visual
npm install                 # playwright, pixelmatch, pngjs — dev only
node compare.mjs \
  --ours http://127.0.0.1:4180/ \
  --reference https://www.breakingatom.com/ \
  --label home \
  --widths 1280,768,375
```

Serve the build first: `node source/tools/serve.js --port 4180`.

**The accessibility sweep.** `node audit-a11y.mjs` — with the build served on 4180, or with `BASE=`
pointing at it — walks one page per family, nineteen in all, and reports what a code review cannot:
one `h1` and no skipped heading level, each landmark exactly once, a name on every control, a
caption on every table, every text colour against the surface it is actually painted on (it
composites the translucent layers and every `color-mix()` between the text and the page), one roving
tab stop in the table with the arrow keys moving it, and nothing animating under
`prefers-reduced-motion`. It exits non-zero on a defect, so a phase can gate on it; the HTTP status,
the live regions a page declares and the table's stop count are printed but do not fail the run.

**The responsive sweep.** `node audit-responsive.mjs` does the same for layout at 375, 768, 1024 and
1440: it reports a page that scrolls sideways and names the elements that leave the viewport. The
periodic table is excluded on purpose — its eighteen columns are the recorded exception, and it
scrolls inside its own box rather than moving the page. It exits non-zero on an overflow.

**The Lighthouse baseline.** `node audit-lighthouse.mjs` runs Lighthouse's own four categories over
seven pages — the six the performance sweep measures plus a group page, which is the one page that
rests in the table's isolation state — and prints a score per category per page plus every failing
accessibility, best-practices and SEO audit. Chrome comes from `chrome-launcher` and the categories
from Lighthouse itself, so the numbers are not ours to argue with. It exits non-zero when
accessibility is not perfect or best-practices drops below 0.95; performance and SEO are recorded
rather than gated, because a 100 on loopback would be a claim about the harness. It is the slowest
of these tools — a run over the default pages takes about a minute — so run it last.

**The living paper's gate.** `node audit-atmosphere.mjs` is the field's own gate, because the field
is composited by a browser: one page per family, each read as pixels in four states — still under
reduced motion, the drift frozen at each of its extremes, print, scripting off — with every
on-field text run's background sampled and asked the WCAG question, the family bloom's anchor
compared against the composite derived from the geometry tokens with the site's own contrast
library, a kill switch requiring the pixels to move when the family pair is zeroed, an opaque
surface proving the field stays under it, and a lived-in window holding a drift cycle to no long
task and no shift. It reads its pixels through `lib/pixels.mjs`. It exits non-zero on any failed
claim.

**The motion gate.** `node audit-motion.mjs` holds what only a browser can say about the motion
layer: the light follows the pointer without dropping a pixel, and is absent under stillness and on
a touch screen; the frosted masthead is sampled over the dark stage it scrolls across and its
faintest ink asked the WCAG question, on the scroll-timeline path and the class fallback alike;
every family's page is walked so every reveal settles, with a census proving a page runs exactly
its designed animations — and that a page under reduced motion runs zero; a cross-fade is counted,
timed at the house's 0.3s and required to land at the top of the right page with focus on the
content, while a history move stays a cut that puts the reader's place back; every rung of the
elevation ladder is read back from a hovered surface with the keyboard's equal; and a drift window
is timed turning and still. It exits non-zero on any failed claim.

**The performance sweep.** `node audit-performance.mjs` measures six pages — home, the elements
index, an element, a table view, the glossary and the calculator — in a fresh context each and on a
cold cache, and reports what the browser saw rather than what a file size suggests: response, first
paint, DOMContentLoaded and load, the bytes transferred by initiator, the element and tile counts,
cumulative layout shift after paint, and every long task the main thread ran. Shift is the number
that found the home page's defect — 118 tiles arriving after paint moved the page by 0.315 of a
viewport — and that proved the fix at 0. It exits non-zero on a page that shifts more than 0.1 or
loads slower than two seconds; long tasks are printed and do not fail the run.

**What it writes.**

`workspace/screenshots/<label>/` — `ours-<w>.png`, `reference-<w>.png`,
`diff-<w>.png`, one crop per region, `*-diff-<w>.png`, and `report.json` with every measurement
from both pages. That directory is gitignored: captures are working evidence, not artefacts.

**How to read it.** A box that differs in size is a layout defect. A box that matches while pixels
differ is a typeface or copy difference — check `*.fontFamily` and `counts` before chasing it. A
region whose two boxes are the same size and whose pixels are within a few per cent is as close to
identical as two different fonts and two different sentences can be.

**What it is not.** It is not part of a phase's automated suite. `node --test source/tests` remains
the only gate that must pass, and it must never require this harness.
