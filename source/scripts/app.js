/**
 * The site's one behaviour module, loaded by every page.
 *
 * It does two things, in this order: it installs the router, and it starts the page it is on.
 *
 * The second half is what makes the first half work. A client-side navigation replaces the
 * document's body, and the scripts in the fetched body are deliberately never executed — a module
 * is evaluated once per URL, so re-inserting a script tag would do nothing. Instead of pretending
 * otherwise, the build writes the page's template name into its `<body>`, and this module turns
 * that name into a call: the page's own module is imported when the page is first seen, and its
 * start function is called again on every visit. One lookup, no second set of rules about which
 * URL means which page.
 *
 * A page that has no behaviour of its own — the element detail pages are all content — simply has
 * no entry here, and the router is the only script they run. That is the intended default: a page
 * earns a module, it does not get one.
 *
 * The registry is deliberately small and its entries are functions, so a page's module is fetched
 * the first time that page is seen rather than by every page.
 */

import { createRouter } from "./router/router.js";

/**
 * The pages with behaviour of their own, keyed by the template name the built body carries.
 *
 * @type {Record<string, (document: Document) => Promise<void>>}
 */
export const PAGE_BEHAVIOUR = {
  home: (doc) => import("./pages/home.js").then((module) => module.startHome(doc)),
  "elements-index": (doc) =>
    import("./pages/elements-index.js").then((module) => module.startElementsIndex(doc)),
};

/**
 * Start the behaviour of a page, if it has any.
 *
 * @param {string} name the template name from the body's `data-page`
 * @param {{ document?: Document, registry?: typeof PAGE_BEHAVIOUR }} [options]
 * @returns {Promise<boolean>} whether a behaviour was found and started
 */
export async function startPage(name, { document: doc = document, registry = PAGE_BEHAVIOUR } = {}) {
  const start = registry[name];

  if (!start) {
    return false;
  }

  await start(doc);

  return true;
}

/**
 * Install the router and start the page.
 *
 * @param {{ document?: Document, window?: Window, fetchImpl?: typeof fetch }} [options]
 * @returns {ReturnType<typeof createRouter>}
 */
export function startApp({ document: doc = document, window: win = window, fetchImpl = fetch } = {}) {
  const router = createRouter({
    document: doc,
    window: win,
    fetchImpl,
    startPage: (name) => {
      startPage(name, { document: doc }).catch((error) => {
        console.error(`The ${name} page could not start`, error);
      });
    },
  });

  router.start();

  const name = typeof doc.body?.dataset?.page === "string" ? doc.body.dataset.page : "";

  if (name !== "") {
    startPage(name, { document: doc }).catch((error) => {
      console.error(`The ${name} page could not start`, error);
    });
  }

  return router;
}

if (typeof document !== "undefined" && typeof window !== "undefined") {
  startApp();
}
