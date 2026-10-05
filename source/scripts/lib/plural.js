/**
 * The many of a category's own name.
 *
 * The eleven element categories are stored in the singular — "Halogen", "Noble gas" — because a
 * table tile, a legend chip and an element's own page all need the singular. The group pages need
 * the plural in three places: the heading over a group's member list, the heading over its
 * explainer, and the sentence under its table, which all say "the halogens" or "the unknowns".
 *
 * Deriving the plural rather than storing a second name beside each category is what keeps a group
 * from being called two things that disagree. The rule is the English one for a word of this kind:
 * an ending that is already sibilant takes "-es" ("gas" turns into "gases"), and anything else
 * takes "-s". Two of the eleven names end that way and both are regular, so the rule stays a rule
 * instead of growing a list of exceptions for words that do not exist here.
 *
 * @param {string} name a category's display name, in the singular
 * @returns {string} the same name in the plural, lower case, or an empty string when given nothing
 */
export function plural(name) {
  const base = String(name ?? "")
    .trim()
    .toLowerCase();

  if (base === "") {
    return "";
  }

  return base.endsWith("s") ? `${base}es` : `${base}s`;
}
