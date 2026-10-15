/**
 * Enough of a document for the router's head, body and cross-fade to be tested in Node.
 *
 * The router is written against the DOM, and Node has none. Rather than a DOM implementation, this is
 * the smallest fake the router actually touches — a tag, attributes, children and the load events a
 * stylesheet fires, and, at the end, a whole page: its document, its window with a motion preference
 * and an optional view-transition API, and the fetch that answers with a built document. It lives in
 * one file because `router.test.js`, `page-head.test.js` and `crossfade.test.js` all need it, and two
 * copies of a fake is two answers to one question, which is the same reason the atom layer's fixtures
 * are shared.
 */

/**
 * An element, as far as the router reads one.
 *
 * @param {string} tagName
 * @param {Object<string, string>} [attributes]
 * @param {string} [text]
 * @returns {object} an element: `tagName`, `children`, `listeners`, `attributes` and the accessors
 */
export function element(tagName, attributes = {}, text = "") {
  const node = {
    tagName: tagName.toUpperCase(),
    textContent: text,
    children: [],
    listeners: {},
    getAttributeNames: () => Object.keys(node.attributes),
    getAttribute: (name) => (name in node.attributes ? node.attributes[name] : null),
    hasAttribute: (name) => name in node.attributes,
    setAttribute: (name, value) => {
      node.attributes[name] = String(value);
    },
    addEventListener: (type, handler) => {
      node.listeners[type] = handler;
    },
    append: (child) => {
      node.children.push(child);
    },
    remove: () => {},
  };

  node.attributes = { ...attributes };

  return node;
}

/** A stylesheet link, the one element kind the head's rules turn on. */
export function sheet(href) {
  return element("link", { rel: "stylesheet", href });
}

/**
 * A head: its children in order, the sheets among them, and the two ways a head is changed.
 *
 * @param {object[]} [children]
 * @returns {object} a head element
 */
export function head(children = []) {
  const node = {
    children: [...children],
    querySelectorAll: (selector) =>
      selector === 'link[rel="stylesheet"]'
        ? node.children.filter(
            (child) => child.tagName === "LINK" && child.getAttribute("rel") === "stylesheet",
          )
        : [],
    append: (child) => {
      node.children.push(child);
    },
    replaceChildren: (...children_) => {
      node.children = children_;
    },
  };

  return node;
}

/** A document, as far as either half of the router reads one. */
export function document(headNode, body = element("body")) {
  return {
    head: headNode,
    body,
    title: "",
    createElement: (tagName) => element(tagName),
    querySelector: () => null,
    getElementById: () => null,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
}

/** The head's sheets, by address: what a swap got right or wrong. */
export function sheetAddresses(headNode) {
  return headNode.children
    .filter((node) => node.tagName === "LINK" && node.getAttribute("rel") === "stylesheet")
    .map((node) => node.getAttribute("href"));
}

/** A head's metadata by name or property, as the live document would hold it. */
export function metaIn(headNode, name) {
  return headNode.children.find(
    (node) =>
      node.tagName === "META" &&
      (node.getAttribute("name") === name || node.getAttribute("property") === name),
  );
}

/** Every child a head holds of one tag, which is how the structured-data block is found. */
export function childrenNamed(headNode, tagName) {
  return headNode.children.filter((node) => node.tagName === tagName.toUpperCase());
}

/**
 * A whole page as the router meets one: the live document, the window, a fetch that answers with a
 * built document, and a record of everything the router did on the way. It is the fake the
 * navigation tests drive, and it also answers the two newer collaborators a cross-fade reads: the
 * reader's motion preference, through `matchMedia`, and the platform's view-transition API, absent
 * unless a test asks for it.
 *
 * @param {{
 *   page?: string,
 *   href?: string,
 *   status?: number,
 *   fail?: boolean,
 *   nextPage?: string,
 *   reduce?: boolean,
 *   viewTransitions?: boolean
 * }} [options]
 * @returns {object} the page, with the document, the window and the calls the router made
 */
export function fakePage({
  page = "element-detail",
  href = "https://chempedia.test/elements/hydrogen/",
  status = 200,
  fail = false,
  nextPage = "home",
  reduce = false,
  viewTransitions = false,
} = {}) {
  const calls = { fetched: [], pushed: [], replaced: [], assigned: [], scrolled: [], started: [], faded: [] };
  const listeners = new Map();
  const main = { tabIndex: 0, focused: false, focus: () => { main.focused = true; } };
  const meta = {
    content: "Old description",
    getAttribute: () => meta.content,
    setAttribute: (_name, value) => { meta.content = value; },
  };
  const script = { removed: false, remove: () => { script.removed = true; } };
  const nextBody = {
    dataset: { page: nextPage },
    childNodes: ["incoming node"],
    querySelectorAll: () => [script],
  };
  // The arriving page draws with the sheets every page shares plus one of its own, and claims its own
  // description; the leaving page has a sheet the arriving one does not declare at all.
  const nextHead = head([
    element("title", {}, "New title"),
    element("meta", { name: "description", content: "New description" }),
    element("link", { rel: "stylesheet", href: "/styles/tokens.css" }),
    element("link", { rel: "stylesheet", href: "/styles/pages/elements-index.css" }),
    element("script", { type: "application/ld+json" }, '{"@type":"WebPage"}'),
  ]);
  const parsed = {
    title: "New title",
    head: nextHead,
    body: nextBody,
  };
  const liveHead = head([
    element("title", {}, "Old title"),
    element("meta", { name: "description", content: "Old description" }),
    element("link", { rel: "stylesheet", href: "/styles/tokens.css" }),
    element("link", { rel: "stylesheet", href: "/styles/pages/table-views.css" }),
  ]);
  const liveScript = { src: "/scripts/app.js" };
  const body = {
    dataset: { page },
    childNodes: [liveScript],
    querySelectorAll: (selector) => (selector === "script" ? [liveScript] : []),
    replaceChildren: (...nodes) => {
      body.childNodes = nodes;
      body.dataset = nextBody.dataset;
    },
  };
  const doc = {
    title: "Old title",
    body,
    head: liveHead,
    createElement: (tagName) => element(tagName),
    getElementById: (id) => (id === "main" ? main : null),
    querySelector: (selector) => (selector === 'meta[name="description"]' ? meta : null),
    addEventListener: (type, handler) => listeners.set(type, handler),
    removeEventListener: (type) => listeners.delete(type),
  };

  if (viewTransitions) {
    // As the platform runs one: the update is a task, and the fake runs it in place so a test can
    // read the whole navigation, then keeps the update for the record.
    doc.startViewTransition = (update) => {
      calls.faded.push(update);
      update();
    };
  }

  const win = {
    // A timer that fires at once: a test does not sit through the sheet grace, and the sheet is the
    // case that matters — cached and ready before the swap.
    setTimeout: (callback) => {
      callback();

      return 1;
    },
    clearTimeout: () => {},
    location: { href, assign: (url) => calls.assigned.push(url) },
    history: {
      state: { router: true, scrollY: 0 },
      pushState: (state, _title, url) => {
        calls.pushed.push(url);
        win.history.state = state;
      },
      replaceState: (state) => {
        calls.replaced.push(state);
        win.history.state = state;
      },
    },
    scrollY: 0,
    scrollTo: (options) => calls.scrolled.push(options),
    requestAnimationFrame: (callback) => {
      callback();
      return 1;
    },
    cancelAnimationFrame: () => {},
    addEventListener: (type, handler) => listeners.set(type, handler),
    removeEventListener: (type) => listeners.delete(type),
    // The router reads the motion preference per navigation; the fake answers the one query.
    matchMedia: () => ({ matches: reduce }),
  };
  const fetchImpl = async (url) => {
    calls.fetched.push(url);

    if (fail) {
      throw new Error("the network is gone");
    }

    return { ok: status < 400, status, text: async () => "<html>the document</html>" };
  };

  const startPage = (name) => calls.started.push(name);

  return {
    doc,
    win,
    body,
    head: liveHead,
    main,
    meta,
    script,
    liveScript,
    parsed,
    calls,
    listeners,
    fetchImpl,
    startPage,
  };
}

/** A click as the router meets one, with a target that answers `closest`. */
export function clickOn(link) {
  const event = {
    defaultPrevented: false,
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    prevented: false,
    target: { closest: () => link },
    preventDefault: () => { event.prevented = true; },
  };

  return event;
}

/** Let the navigation's own awaits run. */
export const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
