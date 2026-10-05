/**
 * Electron configuration — read, predicted, and compared.
 *
 * An element's record carries its configuration as the shorthand a chemist writes it in:
 * `[Ar]3d6 4s2` for iron. That string is what a page prints. This module is for the two questions a
 * page cannot answer by printing it:
 *
 *   - what subshells does the string actually hold? `[Ar]` is a noble gas's own configuration, so
 *     the answer means expanding it, and expanding it means reading that noble gas's record rather
 *     than carrying a copy of the table here.
 *   - which elements do not fill the way a simple energy order predicts? The order is real — the
 *     Madelung order, subshells sorted by `n + l` and then by `n` — and comparing it with the
 *     measured configurations is how the page can name the seventeen or so elements that depart
 *     from it instead of asserting the number.
 *
 * Both answers are derived from the records, so a corrected configuration changes the page's
 * answer rather than contradicting it. Pure: records in, plain values out, no data file and no DOM.
 *
 * One deliberate limit: this module knows the shape of the notation and nothing about chemistry's
 * exceptions. It predicts what it predicts and reports where the record differs; it does not
 * decide that the record is wrong.
 */

/** The noble gases whose shorthand the notation may refer to, in table order. */
export const NOBLE_GASES = ["He", "Ne", "Ar", "Kr", "Xe", "Rn"];

/** How many electrons each subshell holds when it is full. */
const CAPACITY = { s: 2, p: 6, d: 10, f: 14 };

/** A subshell term: a principal number, a letter, and the electron count. */
const TERM = /(\d)([spdf])(\d+)/g;

/** The table's own edge: seven periods, and a filling order no deeper than 7p, which is the last
 * subshell the 118 elements occupy. `n + l` reaches eight at 5f, 6d and 7p, and nothing in the
 * table goes past it. Staying inside the edge keeps subshells no element occupies — a 6f, a 7d, an
 * 8s — out of the order; a prediction that named one would report every element after it as an
 * exception to a rule nothing is filling under. */
const PERIODS = 7;
const LIMIT = 8;

/**
 * The order subshells fill in, as the Madelung rule states it.
 *
 * Subshells are sorted by `n + l` and then by `n`; `l` is 0, 1, 2, 3 for s, p, d and f. The rule is
 * why 4s fills before 3d and 6s before 4f, and the shape of the periodic table follows from it.
 *
 * Only subshells that can exist and that the table reaches are generated: a 1p and a 2d are not
 * subshells anyone has measured, and a 6f or a 7d is a subshell no element of the 118 occupies.
 * A prediction that invented either would flag most of the table as irregular.
 *
 * @returns {{ subshell: string, n: number, l: number }[]} in filling order
 */
export function subshellOrder() {
  const shells = [];

  for (let n = 1; n <= PERIODS; n += 1) {
    for (const [l, letter] of ["s", "p", "d", "f"].entries()) {
      if (l < n && n + l <= LIMIT) {
        shells.push({ subshell: `${n}${letter}`, n, l });
      }
    }
  }

  return shells.sort((one, other) => one.n + one.l - (other.n + other.l) || one.n - other.n);
}

/**
 * The subshells a simple filling order would give an element, keyed by their names.
 *
 * @param {number} atomicNumber
 * @returns {Map<string, number>} subshell name to electron count
 */
export function predictedSubshells(atomicNumber) {
  const predicted = new Map();
  let left = Math.max(0, Math.trunc(atomicNumber));

  for (const { subshell } of subshellOrder()) {
    if (left <= 0) {
      break;
    }

    const electrons = Math.min(CAPACITY[subshell[1]], left);

    predicted.set(subshell, electrons);
    left -= electrons;
  }

  return predicted;
}

/**
 * The configuration of each noble gas in a list of records, for expanding a shorthand.
 *
 * A record may itself be written with a shorthand — radon is `[Xe]4f14 5d10 6p6` — so the map is
 * built from the records as they are and the expansion recurses through it.
 *
 * @param {object[]} elements
 * @returns {Record<string, string>}
 */
export function coreConfigurations(elements) {
  const cores = {};

  for (const symbol of NOBLE_GASES) {
    const core = elements.find((element) => element.symbol === symbol);

    if (core?.electronConfiguration) {
      cores[symbol] = core.electronConfiguration;
    }
  }

  return cores;
}

/**
 * The subshells a configuration string holds, keyed by their names.
 *
 * The shorthand is expanded through `cores` as far as it goes, then the terms are read off. A
 * parenthetical suffix the data uses for an unmeasured configuration — `(predicted)`, as the last
 * few elements carry — is not a subshell and is ignored, which is what lets those elements be
 * compared at all.
 *
 * @param {string} configuration
 * @param {Record<string, string>} cores the noble gases' own configurations
 * @returns {Map<string, number>}
 */
export function configurationSubshells(configuration, cores = {}) {
  const subshells = new Map();

  let text = String(configuration ?? "");
  const shorthand = text.match(/^\[([A-Za-z]+)\]/);

  if (shorthand) {
    for (const [subshell, electrons] of configurationSubshells(cores[shorthand[1]] ?? "", cores)) {
      subshells.set(subshell, (subshells.get(subshell) ?? 0) + electrons);
    }

    text = text.slice(shorthand[0].length);
  }

  for (const [, n, letter, electrons] of text.matchAll(TERM)) {
    const subshell = `${n}${letter}`;

    subshells.set(subshell, (subshells.get(subshell) ?? 0) + Number(electrons));
  }

  return subshells;
}

/**
 * Where a record's configuration differs from the order a simple filling would give.
 *
 * An empty array means the element fills as predicted. A list of subshell names means it does not —
 * chromium's `3d` and `4s`, for instance, because the atom prefers a half-filled d subshell to the
 * extra 4s electron the order expects.
 *
 * @param {object} element
 * @param {Record<string, string>} cores
 * @returns {string[]}
 */
export function configurationDifferences(element, cores = {}) {
  const actual = configurationSubshells(element.electronConfiguration, cores);
  const predicted = predictedSubshells(element.atomicNumber);
  const names = new Set([...actual.keys(), ...predicted.keys()]);

  return [...names].filter((name) => (actual.get(name) ?? 0) !== (predicted.get(name) ?? 0));
}

/**
 * The elements whose configurations do not fill in the predicted order, in atomic order.
 *
 * @param {object[]} elements
 * @returns {object[]}
 */
export function irregularElements(elements) {
  const cores = coreConfigurations(elements);

  return elements
    .filter((element) => configurationDifferences(element, cores).length > 0)
    .sort((one, other) => one.atomicNumber - other.atomicNumber);
}
