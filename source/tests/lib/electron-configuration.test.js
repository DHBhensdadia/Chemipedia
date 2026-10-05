import { test } from "node:test";
import assert from "node:assert/strict";

import { buildContext } from "../../tools/build-context.js";
import {
  NOBLE_GASES,
  configurationDifferences,
  configurationSubshells,
  coreConfigurations,
  irregularElements,
  predictedSubshells,
  subshellOrder,
} from "../../scripts/lib/electron-configuration.js";

const context = await buildContext();
const elements = context.elements;
const bySymbol = (symbol) => elements.find((element) => element.symbol === symbol);

test("the filling order is the Madelung order, and holds no subshell that cannot exist", () => {
  const subshells = subshellOrder().map((entry) => entry.subshell);

  assert.deepEqual(subshells.slice(0, 8), ["1s", "2s", "2p", "3s", "3p", "4s", "3d", "4p"]);
  assert.equal(subshells.includes("1p"), false, "there is no 1p subshell");
  assert.equal(subshells.includes("2d"), false, "there is no 2d subshell");
  assert.equal(subshells.includes("3f"), false, "there is no 3f subshell");
  assert.equal(subshells.at(-1), "7p", "7p is the last subshell the 118 elements reach");
});

test("the predicted configuration is the one a simple filling gives", () => {
  assert.deepEqual(
    [...predictedSubshells(6)],
    [
      ["1s", 2],
      ["2s", 2],
      ["2p", 2],
    ],
  );

  // Iron fills as predicted: six d electrons after the argon core.
  assert.equal(predictedSubshells(26).get("3d"), 6);
  assert.equal(predictedSubshells(26).get("4s"), 2);

  // A half-filled shell is what the rule predicts, which is exactly what chromium declines.
  assert.equal(predictedSubshells(24).get("3d"), 4);
  assert.equal(predictedSubshells(24).get("4s"), 2);
});

test("a shorthand is expanded through the noble gas it names", () => {
  const cores = coreConfigurations(elements);
  const iron = configurationSubshells(bySymbol("Fe").electronConfiguration, cores);

  assert.deepEqual(
    Object.keys(cores).sort(),
    [...NOBLE_GASES].sort(),
    "every noble gas's own configuration is available to expand",
  );
  assert.equal(iron.get("1s"), 2);
  assert.equal(iron.get("2p"), 6);
  assert.equal(iron.get("3d"), 6);
  assert.equal(iron.get("4s"), 2);

  // Radon is itself written as a shorthand, so expanding it recurses once more.
  const radon = configurationSubshells(bySymbol("Rn").electronConfiguration, cores);
  assert.equal(radon.get("4d"), 10);
  assert.equal(radon.get("6p"), 6);
});

test("a parenthetical the data adds for an unmeasured configuration is not read as a subshell", () => {
  const cores = coreConfigurations(elements);
  const meitnerium = configurationSubshells(bySymbol("Mt").electronConfiguration, cores);

  assert.equal(meitnerium.get("6d"), 7);
  assert.equal(meitnerium.has("predicted"), false);
});

test("the elements that depart from the filling order are found, not listed by hand", () => {
  const irregular = irregularElements(elements).map((element) => element.symbol);

  assert.equal(irregular.length, 19);
  for (const symbol of ["Cr", "Cu", "Nb", "Mo", "Pd", "Ag", "Au", "U", "Cm"]) {
    assert.ok(irregular.includes(symbol), `${symbol} should be an exception`);
  }

  assert.equal(irregular.includes("He"), false, "helium fills exactly as predicted");
  assert.equal(irregular.includes("Fe"), false, "iron fills exactly as predicted");
  assert.equal(irregular.includes("Og"), false, "oganesson fills exactly as predicted");
});

test("the details of one exception are the subshells that differ", () => {
  const cores = coreConfigurations(elements);
  const chromium = configurationDifferences(bySymbol("Cr"), cores);

  // Chromium takes one electron out of 4s and puts it in 3d to half-fill the d subshell.
  assert.deepEqual(chromium.sort(), ["3d", "4s"]);
  assert.deepEqual(configurationDifferences(bySymbol("Fe"), cores), []);
});
