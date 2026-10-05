import { test } from "node:test";
import assert from "node:assert/strict";

import {
  ERAS,
  UNDATED,
  eraCounts,
  eraGroups,
  eraKeyFor,
  eraOf,
  eraSpan,
  yearOf,
} from "../../scripts/lib/discovery.js";
import { buildContext } from "../../tools/build-context.js";

const context = await buildContext();
const elements = context.elements;
const bySymbol = (symbol) => elements.find((element) => element.symbol === symbol);
const ERA_KEYS = new Set(ERAS.map((era) => era.key));

test("a year falls in its own century, and everything older is one era of its own", () => {
  assert.equal(eraKeyFor(1669), "before-1700");
  assert.equal(eraKeyFor(1699), "before-1700");
  assert.equal(eraKeyFor(1700), "18th-century");
  assert.equal(eraKeyFor(1799), "18th-century");
  assert.equal(eraKeyFor(1800), "19th-century");
  assert.equal(eraKeyFor(1899), "19th-century");
  assert.equal(eraKeyFor(1900), "20th-century");
  assert.equal(eraKeyFor(1999), "20th-century");
  assert.equal(eraKeyFor(2000), "21st-century");
  assert.equal(eraKeyFor(2010), "21st-century");
});

test("a record with no year is undated, and a year that is not a number is no year", () => {
  for (const value of [null, undefined, "", "1900", Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(eraKeyFor(value), UNDATED, `${String(value)} was filed in an era`);
  }

  assert.equal(yearOf(bySymbol("Fe")), null, "iron is recorded without a year");
  assert.equal(yearOf(bySymbol("P")), 1669);
  assert.equal(yearOf({}), null);
});

test("the eras are declared oldest first, with the undated records last", () => {
  assert.deepEqual(
    ERAS.map((era) => era.key),
    ["before-1700", "18th-century", "19th-century", "20th-century", "21st-century", UNDATED],
  );

  for (const era of ERAS) {
    assert.ok(era.label.length > 0, `${era.key} has no label`);
  }
});

test("every element falls in exactly one era, at the counts the dataset holds", () => {
  const counts = eraCounts(elements);
  const byKey = Object.fromEntries(counts.map((era) => [era.key, era.count]));

  assert.deepEqual(byKey, {
    "before-1700": 2,
    "18th-century": 20,
    "19th-century": 47,
    "20th-century": 31,
    "21st-century": 5,
    [UNDATED]: 13,
  });
  assert.equal(
    counts.reduce((total, era) => total + era.count, 0),
    elements.length,
    "an element belongs to no era",
  );
});

test("the groups hold every element once, in year order inside a dated era", () => {
  const groups = eraGroups(elements);
  const seen = groups.flatMap((group) => group.elements.map((element) => element.symbol));

  assert.equal(seen.length, elements.length, "an element appears twice or not at all");
  assert.deepEqual([...new Set(seen)].sort(), elements.map((element) => element.symbol).sort());

  for (const group of groups) {
    if (group.key === UNDATED) {
      continue;
    }

    const years = group.elements.map(yearOf);

    assert.deepEqual(
      years,
      [...years].sort((one, other) => one - other),
      `the ${group.key} card is not in year order`,
    );
  }

  const undated = groups.find((group) => group.key === UNDATED);

  assert.equal(undated.elements[0].symbol, "C", "the undated era keeps atomic order");
});

test("every element's era record is the one its year belongs to", () => {
  for (const element of elements) {
    const era = eraOf(element);

    assert.equal(era.key, eraKeyFor(yearOf(element)), `${element.symbol}`);
    assert.ok(ERA_KEYS.has(era.key), `${element.symbol} is in an era nobody declared`);
  }
});

test("a span is read off the members, not off the century the era is named after", () => {
  const groups = Object.fromEntries(eraGroups(elements).map((group) => [group.key, group]));

  assert.deepEqual(eraSpan(groups["18th-century"].elements), { from: 1735, to: 1798 });
  assert.deepEqual(eraSpan(groups["before-1700"].elements), { from: 1669, to: 1670 });
  assert.deepEqual(eraSpan(groups["21st-century"].elements), { from: 2000, to: 2010 });
  assert.equal(eraSpan(groups[UNDATED].elements), null, "a record with no year has no span");
  assert.equal(eraSpan([]), null, "an empty era has no span");
});
