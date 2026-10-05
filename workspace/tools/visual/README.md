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

**What it writes.** `workspace/screenshots/<label>/` — `ours-<w>.png`, `reference-<w>.png`,
`diff-<w>.png`, one crop per region, `*-diff-<w>.png`, and `report.json` with every measurement
from both pages. That directory is gitignored: captures are working evidence, not artefacts.

**How to read it.** A box that differs in size is a layout defect. A box that matches while pixels
differ is a typeface or copy difference — check `*.fontFamily` and `counts` before chasing it. A
region whose two boxes are the same size and whose pixels are within a few per cent is as close to
identical as two different fonts and two different sentences can be.

**What it is not.** It is not part of a phase's automated suite. `node --test source/tests` remains
the only gate that must pass, and it must never require this harness.
