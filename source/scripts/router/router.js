/**
 * The router: the site is a set of pages, and this makes moving between them feel like one.
 *
 * Every page here is a real document at a real URL. That is not an implementation detail to be
 * traded away for smooth navigation — it is what makes a deep link work from a cold start, what a
 * crawler indexes, and what a reader sees if a script never runs. So the router is an improvement
 * laid over that, never a replacement for it: a link is an `<a href>` first, and this module only
 * takes over the click when it can serve the destination itself.
 *
 * What it does, in order:
 *
 *   1. Decides whether a click is ours. Same origin, no modifier keys, no `download`, no
 *      `target`, no `rel="external"`, not a fragment on the page we are already on, and not a file
 *      with an extension — the site publishes directory-style URLs, so an extension means an asset
 *      or a document this module has no business swapping.
 *   2. Pushes the URL and fetches the built document for it — the same file a full load would get.
 *   3. Makes the head the fetched document's head and replaces the body with its body, then re-runs
 *      the page's own behaviour by the name the body carries. Scripts are stripped from the
 *      incoming document on the way in: a module is evaluated once, and what a page needs to start
 *      is a call, not a second script tag. The head is not an afterthought — a page family declares
 *      exactly the stylesheets it draws with, so a swap that left the head alone would show the
 *      arriving page in the leaving page's sheets, which is what `page-head.js` exists to prevent —
 *      and the arriving sheets are given their moment to load before the body changes.
 *   4. Puts the reader where they expect to be: at the top for a new page, back where they were for
 *      a history move, with focus handed to the main landmark so the next Tab does not start again
 *      from the masthead.
 *
 * And a fourth case, which is the one that is easy to get wrong: a URL the site does not publish
 * answers 404 *with a document*, so the router swaps in the not-found page and leaves the address
 * as it is. Anything else — a failed request, a server error — is not something to paper over: the
 * router hands the navigation back to the browser and lets a real load happen.
 *
 * The decisions are separated from the plumbing so they can be tested in Node: `navigationFor` is
 * the whole of step 1 and returns a URL or null, with no DOM in it at all, and the head's own rules
 * live in `page-head.js` rather than in the middle of the swap.
 */

import { adoptHead, prepareHead } from "./page-head.js";

/**
 * The URL a link points at when the router should handle it, or null when it should not.
 *
 * `base` is the page's own URL; everything is resolved against it. A link opts out by carrying
 * `data-router-off`, or by being one of the things this module has no business swapping: a
 * download, a new tab, an external relationship, a fragment on this page, another origin, or a
 * file with an extension.
 */
export function navigationFor(anchor, { base }) {
  if (!anchor || typeof anchor.getAttribute !== "function") {
    return null;
  }

  if (anchor.hasAttribute("download") || anchor.hasAttribute("data-router-off")) {
    return null;
  }

  const target = anchor.getAttribute("target");

  if (target && target !== "_self") {
    return null;
  }

  const rel = (anchor.getAttribute("rel") ?? "").split(/\s+/);

  if (rel.includes("external")) {
    return null;
  }

  const href = anchor.getAttribute("href");

  if (!href || href.startsWith("#")) {
    return null;
  }

  let url;

  try {
    url = new URL(href, base);
  } catch {
    return null;
  }

  const here = new URL(base);

  if (url.origin !== here.origin || !/^https?:$/.test(url.protocol)) {
    return null;
  }

  // The page we are on: the browser's own handling (a fragment jump, a reload) is the right one.
  if (url.pathname === here.pathname && url.search === here.search) {
    return null;
  }

  // A URL with a file extension is a file, not a page. This is the same rule the build and the
  // development server use to tell a directory-style URL from a file.
  const last = url.pathname.split("/").pop() ?? "";

  if (last.includes(".")) {
    return null;
  }

  return url;
}

/**
 * The router itself.
 *
 * Every collaborator is injectable — the document, the window, `fetch`, and the HTML parser — so
 * the same code runs in a browser and under the test suite with fakes. `startPage` is the seam
 * where a page's behaviour is looked up by name: the router does not know which pages have any, it
 * only knows to ask.
 *
 * @param {{
 *   document?: Document,
 *   window?: Window,
 *   fetchImpl?: typeof fetch,
 *   parse?: (html: string) => Document,
 *   startPage?: (name: string) => void,
 *   setTimer?: (callback: () => void, ms: number) => unknown,
 *   clearTimer?: (timer: unknown) => void
 * }} [options]
 * @returns {{ start: () => void, stop: () => void, navigate: (url: string | URL) => Promise<void>, busy: () => boolean }}
 */
export function createRouter({
  document: doc = document,
  window: win = window,
  fetchImpl = fetch,
  parse = (html) => new DOMParser().parseFromString(html, "text/html"),
  startPage = () => {},
  setTimer = (callback, ms) => win.setTimeout(callback, ms),
  clearTimer = (timer) => win.clearTimeout(timer),
} = {}) {
  let busy = false;
  let frame = 0;
  let current = "";

  /**
   * The page a URL names, without its fragment.
   *
   * Two URLs with one key are the same page, and a fragment is where on that page the reader is:
   * `/glossary/` and `/glossary/#letter-P` are one document, and the second is the first with the
   * reader somewhere else in it.
   *
   * @param {string} href
   * @returns {string}
   */
  function pageKey(href) {
    try {
      const url = new URL(String(href), win.location.href);

      return `${url.pathname}${url.search}`;
    } catch {
      return String(href);
    }
  }

  /** Keep the reader's place on the entry they are on, so a history move can come back to it. */
  function savePlace() {
    const state = win.history.state;

    if (state && typeof state === "object") {
      win.history.replaceState({ ...state, scrollY: win.scrollY }, "");
    }
  }

  function onScroll() {
    if (frame) {
      return;
    }

    frame = win.requestAnimationFrame(() => {
      frame = 0;
      savePlace();
    });
  }

  /** Where the reader should be after a swap: the top of a new page, or their place again. */
  function settle(top) {
    const main = typeof doc.getElementById === "function" ? doc.getElementById("main") : null;

    if (main) {
      main.tabIndex = -1;
      main.focus({ preventScroll: true });
    }

    win.scrollTo({ top, left: 0, behavior: "instant" });
  }

  /** Replace the document's content with a freshly fetched one, keeping behaviour right. */
  function swap(next) {
    if (doc.title !== undefined) {
      doc.title = next.title;
    }

    // Scripts in the incoming body are deliberately not adopted: the module they name is already
    // loaded, and a page's behaviour is started by name instead of by executing a second copy.
    for (const script of next.body.querySelectorAll("script")) {
      script.remove();
    }

    // The live body's own scripts are carried across by hand. Replacing the children would take
    // the module that is running this router out of the document it is running in; re-appending
    // it is inert, because a script that has already run does not run again.
    const running = typeof doc.body.querySelectorAll === "function" ? [...doc.body.querySelectorAll("script")] : [];

    doc.body.replaceChildren(...next.body.childNodes, ...running);

    // The body's own `data-page` names the page's behaviour to start, and replacing the children
    // does not carry it: without this, a client-side navigation would start the page we came from
    // and the page we arrived at would never boot.
    if (doc.body.dataset) {
      doc.body.dataset.page = next.body.dataset?.page ?? "";
      startPage(doc.body.dataset.page);
    }
  }

  /**
   * Go to a URL by fetching its document, or hand the job back to the browser.
   *
   * @param {string | URL} destination
   * @param {{ history?: boolean, top?: number }} [options]
   * @returns {Promise<void>}
   */
  async function navigate(destination, { history = true, top = 0 } = {}) {
    const url = new URL(String(destination), win.location.href);

    if (busy) {
      return;
    }

    busy = true;

    if (history) {
      win.history.pushState({ router: true, scrollY: 0 }, "", url.href);
    }

    try {
      const response = await fetchImpl(url.href, {
        headers: { Accept: "text/html" },
        redirect: "follow",
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`${url.href} answered ${response.status}`);
      }

      const html = await response.text();
      const arriving = parse(html);

      // The arriving page's own sheets are put in place and given their moment first, so the body is
      // only ever shown in the sheets it was built with. The head and the body then change together,
      // in one task, and no reader ever sees one without the other.
      await prepareHead(doc, arriving, { setTimer, clearTimer }).waited;
      adoptHead(doc, arriving);

      swap(arriving);
      settle(top);
      current = pageKey(url.href);
    } catch {
      // A real navigation is the honest fallback: the browser knows how to show an error, and a
      // reader who has lost the network should not be left looking at a page that half-exists.
      win.location.assign(url.href);
    } finally {
      busy = false;
    }
  }

  function onClick(event) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }

    const anchor = event.target?.closest?.("a[href]");
    const url = navigationFor(anchor, { base: win.location.href });

    if (!url) {
      return;
    }

    event.preventDefault();
    navigate(url);
  }

  /**
   * A history move: another page, or another place in this one.
   *
   * The second case has to be told from the first, because Chrome and Safari fire `popstate` for a
   * fragment move and the new entry carries no state of ours. Left alone, this handler fetched the
   * page the reader was already on and settled them at the top of it, taking back the jump they had
   * just asked for — which is what the glossary's rail of letters did until a browser pass measured
   * it. A move to the page already on screen is the browser's own work: `/glossary/#letter-P` is
   * `/glossary/`, and the fragment says where in that document to stop.
   */
  function onPopState(event) {
    if (pageKey(win.location.href) === current) {
      return;
    }

    navigate(win.location.href, { history: false, top: event.state?.scrollY ?? 0 });
  }

  return {
    start() {
      current = pageKey(win.location.href);

      if (win.history.state === null) {
        win.history.replaceState({ router: true, scrollY: win.scrollY }, "");
      }

      doc.addEventListener("click", onClick);
      win.addEventListener("popstate", onPopState);
      win.addEventListener("scroll", onScroll, { passive: true });
    },

    stop() {
      if (frame) {
        win.cancelAnimationFrame(frame);
        frame = 0;
      }

      doc.removeEventListener("click", onClick);
      win.removeEventListener("popstate", onPopState);
      win.removeEventListener("scroll", onScroll);
    },

    navigate: (url) => navigate(url),

    busy: () => busy,
  };
}
