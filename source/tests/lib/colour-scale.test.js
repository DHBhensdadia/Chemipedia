import { test } from "node:test";
import assert from "node:assert/strict";

import { bandFor, createColourScale, mixColours, positionIn } from "../../scripts/lib/colour-scale.js";

/** The reference's own ramp and domain, so the edges the tests pin are the shipped ones. */
const STOPS = ["#dce9f0", "#a6c6d5", "#6f9fb5", "#3f7488", "#22525a", "#15403d"];
const DOMAIN = [0.7, 3.98];

test("a mix of two colours runs from one end to the other", () => {
  assert.equal(mixColours("#000000", "#ffffff", 0), "#000000");
  assert.equal(mixColours("#000000", "#ffffff", 1), "#ffffff");
  assert.equal(mixColours("#000000", "#ffffff", 0.5), "#808080");
  assert.equal(mixColours("#abc", "#abcdef", 0), "#aabbcc", "a short hex is expanded");
});

test("a mix clamps rather than extrapolating past either end", () => {
  assert.equal(mixColours("#000000", "#ffffff", -3), "#000000");
  assert.equal(mixColours("#000000", "#ffffff", 4), "#ffffff");
});

test("a mix refuses a value that is not a colour", () => {
  assert.throws(() => mixColours("rebeccapurple", "#ffffff", 0.5), TypeError);
  assert.throws(() => mixColours("#12345", "#ffffff", 0.5), TypeError);
});

test("a position is 0 at the low end, 1 at the high end, and clamped outside", () => {
  assert.equal(positionIn(0.7, DOMAIN), 0);
  assert.equal(positionIn(3.98, DOMAIN), 1);
  assert.ok(Math.abs(positionIn(2.34, DOMAIN) - 0.5) < 1e-9, "the midpoint is not halfway");
  assert.equal(positionIn(-100, DOMAIN), 0);
  assert.equal(positionIn(100, DOMAIN), 1);
});

test("a missing or unreadable measurement has no position", () => {
  for (const value of [null, undefined, "", "not a number", Number.NaN, Number.POSITIVE_INFINITY]) {
    assert.equal(positionIn(value, DOMAIN), null, `${String(value)} was placed`);
  }
});

test("a zero is a value and is placed like any other", () => {
  assert.equal(positionIn(0, [0, 1]), 0);
  assert.equal(positionIn(0, [0, 2]), 0);
});

test("a band covers its own sliver of the domain", () => {
  const scale = { domain: DOMAIN, bands: 6 };

  assert.equal(bandFor(0.7, scale), 0, "the low end is in the lowest band");
  assert.equal(bandFor(3.98, scale), 5, "the high end is in the highest band, not past it");
  assert.equal(bandFor(-100, scale), 0);
  assert.equal(bandFor(100, scale), 5);
  assert.equal(bandFor(null, scale), null);

  const width = (DOMAIN[1] - DOMAIN[0]) / 6;

  assert.equal(bandFor(DOMAIN[0] + width, scale), 1, "a band boundary starts the next band");
  assert.equal(bandFor(DOMAIN[0] + width - 0.0001, scale), 0);
});

test("a scale needs two colours, a rising domain and whole bands", () => {
  assert.throws(() => createColourScale({ stops: ["#000000"], domain: [0, 1] }), TypeError);
  assert.throws(() => createColourScale({ stops: STOPS, domain: [1, 1] }), TypeError);
  assert.throws(() => createColourScale({ stops: STOPS, domain: [2, 1] }), TypeError);
  assert.throws(() => createColourScale({ stops: ["#oops", "#ffffff"], domain: [0, 1] }), TypeError);
  assert.throws(() => createColourScale({ stops: STOPS, domain: [0, 1], bands: 0 }), TypeError);
  assert.throws(() => createColourScale({ stops: STOPS, domain: [0, 1], bands: 2.5 }), TypeError);
});

test("the domain's ends get the ramp's ends exactly", () => {
  const scale = createColourScale({ stops: STOPS, domain: DOMAIN, bands: 6 });

  assert.equal(scale.colourFor(0.7), "#dce9f0");
  assert.equal(scale.colourFor(3.98), "#15403d");
  assert.equal(scale.colourFor(-100), "#dce9f0", "an outlier clamps to the nearest end");
  assert.equal(scale.colourFor(100), "#15403d");
  assert.equal(scale.colourFor(null), null, "a missing value has no colour");
});

test("a value between two stops interpolates between their colours", () => {
  const scale = createColourScale({ stops: STOPS, domain: [0, 1], bands: 6 });

  assert.equal(scale.colourFor(0.5), mixColours("#6f9fb5", "#3f7488", 0.5));
});

test("the legend's swatches are the stops themselves when the counts match", () => {
  const scale = createColourScale({ stops: STOPS, domain: DOMAIN, bands: 6 });

  STOPS.forEach((stop, band) => assert.equal(scale.bandColour(band), stop));

  assert.equal(scale.bandColour(-1), STOPS[0], "out of range bands clamp to the ends");
  assert.equal(scale.bandColour(99), STOPS.at(-1));
});

test("with fewer bands than colours, a swatch samples that band's middle", () => {
  const scale = createColourScale({ stops: STOPS, domain: DOMAIN, bands: 3 });

  for (let band = 0; band < 3; band += 1) {
    const colour = scale.bandColour(band);

    assert.match(colour, /^#[0-9a-f]{6}$/);
    assert.ok(!STOPS.includes(colour), `band ${band} copied a stop instead of sampling between them`);
  }
});

test("a band reports the two values it spans", () => {
  const scale = createColourScale({ stops: STOPS, domain: DOMAIN, bands: 6 });
  const width = (DOMAIN[1] - DOMAIN[0]) / 6;

  assert.deepEqual(scale.bandRange(0), [DOMAIN[0], DOMAIN[0] + width]);
  assert.deepEqual(scale.bandRange(5), [DOMAIN[0] + 5 * width, DOMAIN[1]]);
  assert.equal(scale.bandRange(5)[1], 3.98, "the top band includes the maximum");
});

test("the band edges are where each band begins", () => {
  const scale = createColourScale({ stops: STOPS, domain: DOMAIN, bands: 6 });

  assert.equal(scale.edges.length, 6);
  assert.equal(scale.edges[0], 0.7);
  assert.equal(scale.edges[5], 0.7 + (5 * (3.98 - 0.7)) / 6);
});

test("the scale's own methods and the standalone functions agree", () => {
  const scale = createColourScale({ stops: STOPS, domain: DOMAIN, bands: 6 });

  for (const value of [null, 0.5, 0.7, 1.246, 2.34, 3.0, 3.98, 10]) {
    assert.equal(scale.positionOf(value), positionIn(value, DOMAIN));
    assert.equal(scale.bandFor(value), bandFor(value, { domain: DOMAIN, bands: 6 }));
  }

  assert.deepEqual(scale.domain, DOMAIN);
  assert.equal(scale.bands, 6);
});
