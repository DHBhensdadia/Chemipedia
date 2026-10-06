/**
 * Structured data, written at build time.
 *
 * Every page is a `WebPage` belonging to one `WebSite`, which is the honest minimum: it is what the
 * page actually is, and it says the same thing the head already says in `<title>` and the meta
 * description. An element page adds the thing the page is *about* — a `Thing` named after the
 * element, with the symbol as an alternate name and the record's own atomic number and weight as
 * `PropertyValue`s. Those two are printed because a record holds them for all 118 elements; a field
 * a record may lack is simply not claimed.
 *
 * It is JSON in a `<script type="application/ld+json">`, which is the one script tag this site
 * ships that is not the app: it does not run, and `app.js` refuses incoming scripts on a swap, so
 * it never executes twice either.
 */

import { absoluteUrl, siteOrigin } from "./site-origin.js";

/** The site itself, named once so every page's `isPartOf` is the same object. */
const WEBSITE = {
  "@type": "WebSite",
  name: "ChemiPedia",
  url: siteOrigin,
};

/**
 * The page as schema.org sees it.
 *
 * @param {{ path: string, title: string, description: string, element?: object }} route
 * @returns {object}
 */
export function structuredDataFor(route) {
  const page = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: route.title,
    description: route.description,
    url: absoluteUrl(route.path),
    isPartOf: WEBSITE,
  };

  if (route.element) {
    const { element } = route;

    page.about = {
      "@type": "Thing",
      name: element.name,
      alternateName: element.symbol,
      url: absoluteUrl(route.path),
      additionalProperty: [
        { "@type": "PropertyValue", name: "Atomic number", value: element.atomicNumber },
        { "@type": "PropertyValue", name: "Atomic weight", value: element.atomicWeight },
      ],
    };
  }

  return page;
}

/**
 * The same object as the script tag the head carries.
 *
 * `<` is escaped so the JSON cannot end the script element early — the one way a value in this data
 * could break the document it is written into.
 *
 * @param {object} route
 * @returns {string}
 */
export function structuredDataScript(route) {
  const json = JSON.stringify(structuredDataFor(route)).replace(/</g, "\\u003c");

  return `<script type="application/ld+json">${json}</script>`;
}
