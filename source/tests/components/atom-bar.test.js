import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  ATOM_CONTROLS,
  ELECTRON_LIMIT,
  NEUTRON_LIMIT,
  PROTON_LIMIT,
  atomBar,
} from "../../scripts/components/atom-bar.js";
import { countsFor } from "../../scripts/lib/atom-words.js";

const records = JSON.parse(await readFile(new URL("../../data/elements.json", import.meta.url), "utf8"));
const record = (atomicNumber) => records.find((entry) => entry.atomicNumber === atomicNumber);
const carbon = record(6);
const markup = atomBar({ record: carbon, counts: countsFor(carbon), elements: records });

/** One control of the bar, by its id: the block from the tag that carries it to the end of that tag. */
function partOf(id) {
  const at = markup.indexOf(`id="${id}"`);

  assert.ok(at > 0, `the bar has nothing with the id ${id}`);

  const from = markup.lastIndexOf("<", at);

  return markup.slice(from, markup.indexOf(">", at) + 1);
}

test("every control the page looks for is in the markup it looks through", () => {
  for (const [name, id] of Object.entries(ATOM_CONTROLS)) {
    assert.match(markup, new RegExp(`id="${id}"`), `the bar has no ${name} for the page to find`);
  }

  // The behaviour queries inside the stage, so the controls have to be in the one block the page renders.
  assert.equal(markup.includes("<script"), false, "the bar would boot a script of its own");
});

test("the picker offers every element, in atomic order, with the opening one chosen", () => {
  const options = [...markup.matchAll(/<option value="(\d+)"( selected)?>/g)];

  assert.equal(options.length, records.length);
  assert.deepEqual(
    options.map(([, value]) => Number(value)),
    records.map((entry) => entry.atomicNumber),
  );
  assert.equal(options.filter(([, , selected]) => selected).length, 1, "two elements are chosen at once");
  assert.equal(options[5][1], "6", "the chosen element is not the one the page opens on");
  assert.match(markup, /▶?Carbon · C|Carbon · C/);
});

test("every count has a label, a field and two steps, and the field carries the page's ceiling", () => {
  const limits = { protons: PROTON_LIMIT, neutrons: NEUTRON_LIMIT, electrons: ELECTRON_LIMIT };

  for (const [name, limit] of Object.entries(limits)) {
    const field = partOf(ATOM_CONTROLS[name]);

    assert.match(field, new RegExp(`name="${name}"`), `${name} has no field`);
    assert.match(field, /type="number"/, `${name}'s field is not a number field`);
    assert.match(field, /min="0"/, `${name}'s field can go negative`);
    assert.match(field, new RegExp(`max="${limit}"`), `${name}'s field has the wrong ceiling`);
    assert.match(field, new RegExp(`value="${countsFor(carbon)[name]}"`), `${name} opens on the wrong count`);
    assert.match(markup, new RegExp(`<label class="visually-hidden" for="${ATOM_CONTROLS[name]}"`), `${name} has no label`);
    assert.match(markup, new RegExp(`data-atom-step="${name}" data-atom-by="1"`), `${name} cannot be stepped up`);
    assert.match(markup, new RegExp(`data-atom-step="${name}" data-atom-by="-1"`), `${name} cannot be stepped down`);
  }

  // The page's rules: protons stop where the elements do, and the free counts go past every element.
  assert.equal(PROTON_LIMIT, records.at(-1).atomicNumber);
  assert.ok(NEUTRON_LIMIT > Math.max(...records.map((entry) => countsFor(entry).neutrons)));
  assert.ok(ELECTRON_LIMIT > Math.max(...records.map((entry) => entry.atomicNumber)));
});

test("the card names the isotope and links to the element's page", () => {
  assert.match(partOf(ATOM_CONTROLS.link), /href="\/elements\/carbon\/"/);
  assert.match(markup, />C<\/a>/, "the card does not show the element's symbol");
  assert.match(markup, /Carbon · C-12/, "the card does not name the isotope");
});

test("the legend's dots are the token layer's own colours", () => {
  const dots = [...markup.matchAll(/--dot: var\((--atom-[a-z]+)\)/g)].map(([, name]) => name);
  const items = [...markup.matchAll(/<li class="at-bar__legend-item[^"]*"/g)];

  assert.deepEqual(dots, ["--atom-proton", "--atom-neutron", "--atom-electron"]);
  assert.equal(items.length, dots.length + 1, "the legend is not its title and one item per particle");
  assert.match(markup, /<li class="at-bar__legend-item at-bar__legend-title">Legend<\/li>/);
});

test("the speed, the buttons and the picker are real controls", () => {
  assert.match(partOf(ATOM_CONTROLS.speed), /type="range"/);
  assert.match(markup, /<label class="at-bar__control-label" for="atom-speed">Speed<\/label>/);
  assert.match(partOf(ATOM_CONTROLS.shake), /<button[^>]*type="button"/);
  assert.match(partOf(ATOM_CONTROLS.reset), /<button[^>]*type="button"/);
  assert.match(partOf(ATOM_CONTROLS.motion), /aria-pressed="false"/);
  assert.match(partOf(ATOM_CONTROLS.picker), /<select/);
  assert.equal(markup.includes("undefined"), false, "a value did not reach the markup");
});
