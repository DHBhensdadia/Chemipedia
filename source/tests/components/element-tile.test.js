import { test } from "node:test";
import assert from "node:assert/strict";

import { elementTile } from "../../scripts/components/element-tile.js";

const hydrogen = {
  atomicNumber: 1,
  symbol: "H",
  name: "Hydrogen",
  slug: "hydrogen",
  position: { row: 1, column: 1 },
};

test("a tile is a link carrying its cell and its three facts", () => {
  const markup = elementTile({ element: hydrogen });

  assert.match(markup, /^<a /);
  assert.match(markup, /href="\/elements\/hydrogen\/"/);
  assert.match(markup, /style="grid-column:1;grid-row:1"/);
  assert.match(markup, /data-row="1" data-column="1"/);
  assert.match(markup, /role="listitem"/);
  assert.match(markup, /aria-label="Hydrogen, symbol H, atomic number 1"/);
  assert.match(markup, /title="Hydrogen · H · 1"/);
  assert.match(markup, /<span class="tile__z">1<\/span>/);
  assert.match(markup, /<span class="tile__sym">H<\/span>/);
  assert.match(markup, /<span class="tile__name">Hydrogen<\/span>/);
});

test("a tile starts out of the tab order, and the roving one is put in it", () => {
  assert.match(elementTile({ element: hydrogen }), /tabindex="-1"/);
  assert.match(elementTile({ element: hydrogen, tabbable: true }), /tabindex="0"/);
});

test("the colour a tile should take is a key or a band, never a colour", () => {
  const keyed = elementTile({ element: hydrogen, key: "non-metals" });
  const banded = elementTile({ element: hydrogen, band: 3 });
  const missing = elementTile({ element: hydrogen, band: "none" });
  const plain = elementTile({ element: hydrogen });

  assert.match(keyed, /data-key="non-metals"/);
  assert.match(banded, /data-band="3"/);
  assert.match(missing, /data-band="none"/);
  assert.doesNotMatch(plain, /data-key/);
  assert.doesNotMatch(plain, /data-band/);
  assert.doesNotMatch(`${keyed}${banded}${missing}`, /#[0-9a-f]{3,6}/i, "a colour reached the markup");
});

test("the compact variant drops the name and says so", () => {
  const compact = elementTile({ element: hydrogen, compact: true });

  assert.match(compact, /class="tile tile--compact"/);
  assert.doesNotMatch(compact, /tile__name/);
});

test("the page's own element is marked with aria-current", () => {
  assert.match(elementTile({ element: hydrogen, current: true }), /aria-current="page"/);
  assert.doesNotMatch(elementTile({ element: hydrogen }), /aria-current/);
});

test("a name that could end an attribute cannot", () => {
  const tricky = { ...hydrogen, name: 'Hy"drogen & <co>' };
  const markup = elementTile({ element: tricky });

  assert.doesNotMatch(markup, /Hy"drogen/);
  assert.match(markup, /&quot;/);
  assert.match(markup, /&amp;/);
  assert.match(markup, /&lt;/);
});

test("a custom href can point somewhere else", () => {
  assert.match(elementTile({ element: hydrogen, href: "/elements/" }), /href="\/elements\/"/);
});

test("an element with no cell is refused", () => {
  assert.throws(() => elementTile({ element: { symbol: "Xx" } }), /Xx/);
});
