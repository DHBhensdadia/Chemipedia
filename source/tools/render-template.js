/**
 * Filling a family's template.
 *
 * An authored template — `pages/home.html` — is the whole body, and the build wraps it. A family's
 * template is a skeleton: the sections in the order they belong, and a `{{name}}` in each place a
 * block goes. Something has to substitute those, and this is that something.
 *
 * It is deliberately tiny and deliberately strict. There is no template language here: one pattern,
 * one map, and a refusal to render anything that does not add up. An unknown placeholder is an
 * error rather than an empty string, because a section silently rendering as nothing is the kind of
 * bug that reaches production and is found by a reader. A placeholder that survives the fill — one
 * inside a value, say — is an error for the same reason.
 *
 * What is *not* checked here is whether the page module computed a block no placeholder asks for.
 * That is a fact about the two files, so `tests/tools/render-template.test.js` compares the
 * template's keys with the module's, which catches it once per run rather than once per page.
 */

/** A placeholder: `{{` and `}}` around a name, which is a lowercase word. */
const PLACEHOLDER = /\{\{\s*([^{}]*?)\s*\}\}/g;

/**
 * The names a template asks for, in the order they appear, without duplicates.
 *
 * @param {string} markup
 * @returns {string[]}
 */
export function placeholderKeys(markup) {
  return [...new Set([...markup.matchAll(PLACEHOLDER)].map((match) => match[1]))];
}

/**
 * A template with every placeholder replaced by its block.
 *
 * @param {string} markup the authored template
 * @param {Record<string, string>} values one string per placeholder name
 * @param {{ name?: string }} [options] what to call the template in an error message
 * @returns {string}
 * @throws {Error} when a placeholder has no value, or when one survives the fill
 */
export function fillTemplate(markup, values, { name = "the template" } = {}) {
  const filled = markup.replace(PLACEHOLDER, (match, key) => {
    if (!Object.hasOwn(values, key)) {
      throw new Error(`${name} asks for {{${key}}}, which the page module does not provide`);
    }

    return values[key];
  });

  const leftover = placeholderKeys(filled);

  if (leftover.length > 0) {
    throw new Error(
      `${name} still holds ${leftover.join(", ")} after filling: a value contains a placeholder of its own`,
    );
  }

  return filled;
}
