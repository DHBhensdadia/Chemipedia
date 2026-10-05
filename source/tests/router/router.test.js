import { test } from "node:test";
import assert from "node:assert/strict";

import { createRouter, navigationFor } from "../../scripts/router/router.js";

const BASE = "https://chempedia.test/elements/hydrogen/";

/** An anchor as `navigationFor` reads one: only attributes, nothing else. */
function anchor(attributes = {}) {
  return {
    getAttribute: (name) => (name in attributes ? attributes[name] : null),
    hasAttribute: (name) => name in attributes && attributes[name] !== null,
  };
}

/** A stand-in for everything the router touches, so a navigation can be read step by step. */
function fakePage({
  page = "element-detail",
  href = BASE,
  status = 200,
  fail = false,
  nextPage = "home",
} = {}) {
  const calls = { fetched: [], pushed: [], replaced: [], assigned: [], scrolled: [], started: [] };
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
  const parsed = {
    title: "New title",
    querySelector: (selector) =>
      selector === 'meta[name="description"]' ? { getAttribute: () => "New description" } : null,
    body: nextBody,
  };
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
    getElementById: (id) => (id === "main" ? main : null),
    querySelector: (selector) => (selector === 'meta[name="description"]' ? meta : null),
    addEventListener: (type, handler) => listeners.set(type, handler),
    removeEventListener: (type) => listeners.delete(type),
  };
  const win = {
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
  };
  const fetchImpl = async (url) => {
    calls.fetched.push(url);

    if (fail) {
      throw new Error("the network is gone");
    }

    return { ok: status < 400, status, text: async () => "<html>the document</html>" };
  };

  const startPage = (name) => calls.started.push(name);

  return { doc, win, body, main, meta, script, liveScript, parsed, calls, listeners, fetchImpl, startPage };
}

/** A click as the router meets one, with a target that answers `closest`. */
function clickOn(link) {
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
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

test("a link to another page of this site is ours", () => {
  assert.equal(navigationFor(anchor({ href: "/elements/iron/" }), { base: BASE }).href, "https://chempedia.test/elements/iron/");
  assert.equal(navigationFor(anchor({ href: "../carbon/" }), { base: BASE }).href, "https://chempedia.test/elements/carbon/");
});

test("a link that is not a page of this site is left to the browser", () => {
  const cases = {
    "no anchor": null,
    "not an element": { href: "/elements/iron/" },
    "no href": anchor({}),
    "a fragment on this page": anchor({ href: "#properties" }),
    "another origin": anchor({ href: "https://example.com/elements/iron/" }),
    "a mail link": anchor({ href: "mailto:hi@chempedia.test" }),
    "a download": anchor({ href: "/elements/iron/", download: "" }),
    "a new tab": anchor({ href: "/elements/iron/", target: "_blank" }),
    "an external relationship": anchor({ href: "/elements/iron/", rel: "external nofollow" }),
    "the router turned off by the page": anchor({ href: "/elements/iron/", "data-router-off": "" }),
    "a file rather than a page": anchor({ href: "/assets/brand/favicon.svg" }),
    "the page we are on": anchor({ href: BASE }),
  };

  for (const [what, link] of Object.entries(cases)) {
    assert.equal(navigationFor(link, { base: BASE }), null, `${what} should not be a router navigation`);
  }
});

test("`target=_self` is the same tab, so the link is still ours", () => {
  assert.ok(navigationFor(anchor({ href: "/elements/iron/", target: "_self" }), { base: BASE }));
});

test("a click on one of our links fetches the page and swaps the body, title and description", async () => {
  const env = fakePage();
  const router = createRouter({
    document: env.doc,
    window: env.win,
    fetchImpl: env.fetchImpl,
    parse: () => env.parsed,
    startPage: env.startPage,
  });

  router.start();

  const event = clickOn(anchor({ href: "/elements/iron/" }));

  env.listeners.get("click")(event);
  await settle();

  assert.equal(event.prevented, true, "the browser's own navigation was not cancelled");
  assert.deepEqual(env.calls.fetched, ["https://chempedia.test/elements/iron/"]);
  assert.deepEqual(env.calls.pushed, ["https://chempedia.test/elements/iron/"]);
  assert.equal(env.doc.title, "New title");
  assert.equal(env.meta.content, "New description");
  assert.deepEqual(env.body.childNodes, ["incoming node", env.liveScript]);
  assert.equal(env.script.removed, true, "the fetched document's script was adopted");
  assert.equal(
    env.body.childNodes.includes(env.liveScript),
    true,
    "the module running the router was taken out of the document",
  );
  assert.equal(env.main.focused, true, "focus was not handed to the main landmark");
  assert.equal(env.main.tabIndex, -1);
  assert.deepEqual(env.calls.scrolled, [{ top: 0, left: 0, behavior: "instant" }]);
  assert.equal(router.busy(), false);
});

test("the page's own name travels with the swap, so the arriving page boots", async () => {
  const env = fakePage({ page: "element-detail", nextPage: "home" });
  const router = createRouter({
    document: env.doc,
    window: env.win,
    fetchImpl: env.fetchImpl,
    parse: () => env.parsed,
    startPage: env.startPage,
  });

  router.start();
  env.listeners.get("click")(clickOn(anchor({ href: "/" })));
  await settle();

  assert.equal(env.body.dataset.page, "home");
  assert.deepEqual(env.calls.started, ["home"], "the arriving page's behaviour was not started");
});

test("a URL the site does not publish still swaps in the not-found document", async () => {
  const env = fakePage({ status: 404 });
  const router = createRouter({
    document: env.doc,
    window: env.win,
    fetchImpl: env.fetchImpl,
    parse: () => env.parsed,
    startPage: env.startPage,
  });

  router.start();
  env.listeners.get("click")(clickOn(anchor({ href: "/elements/unobtainium/" })));
  await settle();

  assert.equal(env.doc.title, "New title", "the not-found page is a document and should be shown");
  assert.deepEqual(env.calls.assigned, [], "a 404 is not a reason to hand the navigation back");
});

test("a request that fails hands the navigation back to the browser", async () => {
  const env = fakePage({ fail: true });
  const router = createRouter({
    document: env.doc,
    window: env.win,
    fetchImpl: env.fetchImpl,
    parse: () => env.parsed,
    startPage: env.startPage,
  });

  router.start();
  env.listeners.get("click")(clickOn(anchor({ href: "/elements/iron/" })));
  await settle();

  assert.deepEqual(env.calls.assigned, ["https://chempedia.test/elements/iron/"]);
  assert.equal(env.doc.title, "Old title", "a failed fetch should not half-swap the document");
  assert.deepEqual(env.calls.scrolled, []);
});

test("a server error is not papered over either", async () => {
  const env = fakePage({ status: 500 });
  const router = createRouter({
    document: env.doc,
    window: env.win,
    fetchImpl: env.fetchImpl,
    parse: () => env.parsed,
    startPage: env.startPage,
  });

  router.start();
  env.listeners.get("click")(clickOn(anchor({ href: "/elements/iron/" })));
  await settle();

  assert.deepEqual(env.calls.assigned, ["https://chempedia.test/elements/iron/"]);
});

test("a second navigation while the first is in flight is ignored", async () => {
  const env = fakePage();
  let release;
  const pending = new Promise((resolve) => { release = resolve; });
  const fetchImpl = (url) => {
    env.calls.fetched.push(url);
    return pending.then(() => ({ ok: true, status: 200, text: async () => "<html></html>" }));
  };
  const router = createRouter({
    document: env.doc,
    window: env.win,
    fetchImpl,
    parse: () => env.parsed,
    startPage: env.startPage,
  });

  router.start();

  const first = router.navigate("https://chempedia.test/elements/iron/");
  const second = router.navigate("https://chempedia.test/elements/carbon/");

  assert.equal(router.busy(), true);
  assert.equal(env.calls.fetched.length, 1, "the in-flight navigation was overtaken");

  release();
  await Promise.all([first, second]);

  assert.equal(env.calls.pushed.length, 1);
  assert.equal(router.busy(), false);
});

test("a history move fetches the document again without pushing an entry, and restores the place", async () => {
  const env = fakePage();
  const router = createRouter({
    document: env.doc,
    window: env.win,
    fetchImpl: env.fetchImpl,
    parse: () => env.parsed,
    startPage: env.startPage,
  });

  router.start();
  env.listeners.get("popstate")({ state: { router: true, scrollY: 420 } });
  await settle();

  assert.deepEqual(env.calls.pushed, [], "a history move must not push another entry");
  assert.deepEqual(env.calls.scrolled, [{ top: 420, left: 0, behavior: "instant" }]);
});

test("the entry the reader arrived on gets a state for the scroll position to live in", () => {
  const env = fakePage();

  env.win.history.state = null;
  env.win.scrollY = 12;

  createRouter({
    document: env.doc,
    window: env.win,
    fetchImpl: env.fetchImpl,
    parse: () => env.parsed,
    startPage: env.startPage,
  }).start();

  assert.deepEqual(env.win.history.state, { router: true, scrollY: 12 });
});

test("scrolling keeps the reader's place on the entry they are on", () => {
  const env = fakePage();
  const router = createRouter({
    document: env.doc,
    window: env.win,
    fetchImpl: env.fetchImpl,
    parse: () => env.parsed,
    startPage: env.startPage,
  });

  router.start();
  env.win.scrollY = 300;
  env.listeners.get("scroll")();

  assert.equal(env.win.history.state.scrollY, 300);
});

test("a click the router should not take is left alone", () => {
  const env = fakePage();
  const router = createRouter({
    document: env.doc,
    window: env.win,
    fetchImpl: env.fetchImpl,
    parse: () => env.parsed,
    startPage: env.startPage,
  });

  router.start();

  const modified = clickOn(anchor({ href: "/elements/iron/" }));
  modified.metaKey = true;

  const middle = clickOn(anchor({ href: "/elements/iron/" }));
  middle.button = 1;

  const handled = clickOn(anchor({ href: "/elements/iron/" }));
  handled.defaultPrevented = true;

  const external = clickOn(anchor({ href: "https://example.com/" }));

  for (const event of [modified, middle, handled, external]) {
    env.listeners.get("click")(event);
    assert.equal(event.prevented, false);
  }

  assert.deepEqual(env.calls.fetched, []);
});

test("stopping the router removes what starting it installed", () => {
  const env = fakePage();
  const router = createRouter({
    document: env.doc,
    window: env.win,
    fetchImpl: env.fetchImpl,
    parse: () => env.parsed,
    startPage: env.startPage,
  });

  router.start();

  assert.ok(env.listeners.has("click"));
  assert.ok(env.listeners.has("popstate"));
  assert.ok(env.listeners.has("scroll"));

  router.stop();

  assert.equal(env.listeners.has("click"), false);
  assert.equal(env.listeners.has("popstate"), false);
  assert.equal(env.listeners.has("scroll"), false);
});
