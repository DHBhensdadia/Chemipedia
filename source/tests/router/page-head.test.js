import { test } from "node:test";
import assert from "node:assert/strict";

import { adoptHead, prepareHead } from "../../scripts/router/page-head.js";

import { childrenNamed, document, element, head, metaIn, sheet, sheetAddresses } from "./dom-fixtures.js";

/** A page: the sheets it declares, in order, and the metadata it claims. */
function page(sheets, { description = "", canonical = "", record = "" } = {}) {
  const children = [element("title", {}, description), element("meta", { name: "description", content: description })];

  if (canonical) {
    children.push(element("link", { rel: "canonical", href: canonical }));
  }

  children.push(...sheets.map(sheet));

  if (record) {
    children.push(element("script", { type: "application/ld+json" }, record));
  }

  return document(head(children));
}

test("the arriving page's own sheets are added before the swap, and the shared ones are left alone", () => {
  const live = page(["/styles/tokens.css", "/styles/pages/table-views.css"]);
  const arriving = page(["/styles/tokens.css", "/styles/pages/elements-index.css"]);
  const { added } = prepareHead(live, arriving);

  assert.deepEqual(
    added.map((link) => link.getAttribute("href")),
    ["/styles/pages/elements-index.css"],
    "the arriving page's own sheet is the one to fetch",
  );
  assert.deepEqual(
    sheetAddresses(live.head),
    ["/styles/tokens.css", "/styles/pages/table-views.css", "/styles/pages/elements-index.css"],
    "preparing the head must not take the page's own sheets away before the swap",
  );
});

test("the wait is over when the arriving sheet has loaded", async () => {
  const live = page(["/styles/tokens.css"]);
  const arriving = page(["/styles/tokens.css", "/styles/pages/elements-index.css"]);
  const timers = [];
  const { added, waited } = prepareHead(live, arriving, {
    setTimer: (callback, ms) => {
      timers.push(ms);

      return timers.length;
    },
    clearTimer: () => {},
  });

  let done = false;

  waited.then(() => {
    done = true;
  });

  await Promise.resolve();
  assert.equal(done, false, "the sheet has not loaded yet, so the swap should still be waiting");
  assert.equal(timers.length, 1, "a sheet that never loads has to be waited for only so long");

  added[0].listeners.load();
  await waited;
  assert.equal(done, true);
});

test("a sheet that fails resolves the wait rather than holding the reader", async () => {
  const live = page(["/styles/tokens.css"]);
  const arriving = page(["/styles/tokens.css", "/styles/missing.css"]);
  const { added, waited } = prepareHead(live, arriving, {
    setTimer: () => 1,
    clearTimer: () => {},
  });

  added[0].listeners.error();
  await waited;
});

test("nothing to wait for is not a wait at all", async () => {
  const live = page(["/styles/tokens.css"]);
  const arriving = page(["/styles/tokens.css"]);
  const { added, waited } = prepareHead(live, arriving, { setTimer: () => 1 });

  assert.deepEqual(added, []);
  await waited;
});

test("the head after a swap is the arriving page's head: same sheets, same order, same record", () => {
  const live = page(["/styles/tokens.css", "/styles/pages/table-views.css"], {
    description: "The table",
    canonical: "https://chempedia.test/periodic-table/",
  });
  const arriving = page(["/styles/tokens.css", "/styles/pages/elements-index.css"], {
    description: "Every element",
    canonical: "https://chempedia.test/elements/",
    record: '{"@type":"WebPage"}',
  });

  const kept = live.head.children[0];
  const shared = live.head.children.find((node) => node.getAttribute("href") === "/styles/tokens.css");
  const { added, removed } = adoptHead(live, arriving);

  assert.deepEqual(sheetAddresses(live.head), ["/styles/tokens.css", "/styles/pages/elements-index.css"]);
  assert.deepEqual(added, ["/styles/pages/elements-index.css"]);
  assert.deepEqual(removed, ["/styles/pages/table-views.css"], "the leaving page's own sheet stays behind");
  assert.equal(
    live.head.children.includes(shared),
    true,
    "a sheet both pages declare was re-created, which re-fetches and re-parses it",
  );
  assert.equal(metaIn(live.head, "description").getAttribute("content"), "Every element");
  assert.equal(metaIn(live.head, "og:title"), undefined, "a page's own metadata count changed");
  assert.equal(
    live.head.children.find((node) => node.getAttribute("rel") === "canonical").getAttribute("href"),
    "https://chempedia.test/elements/",
    "the canonical link still names the page the reader came from",
  );
  assert.equal(childrenNamed(live.head, "script")[0].textContent, '{"@type":"WebPage"}');
  assert.equal(live.head.children.includes(kept), true, "the document's own title element was dropped");
});

test("a sheet the head does not hold is built in the live document, not imported from the parsed one", () => {
  const live = page(["/styles/tokens.css"]);
  const arriving = page(["/styles/tokens.css", "/styles/pages/elements-index.css"]);
  const arrivingSheet = arriving.head.children.find(
    (node) => node.getAttribute("href") === "/styles/pages/elements-index.css",
  );

  adoptHead(live, arriving);
  const adopted = live.head.children.find(
    (node) => node.getAttribute("href") === "/styles/pages/elements-index.css",
  );

  assert.notEqual(adopted, arrivingSheet, "the parsed document's own node was adopted");
  assert.equal(adopted.getAttribute("rel"), "stylesheet");
});

test("a script in the arriving head is never adopted, whatever it would run", () => {
  const live = page(["/styles/tokens.css"]);
  const arriving = page(["/styles/tokens.css"]);

  arriving.head.children.splice(1, 0, element("script", { src: "/scripts/other.js" }), element("script", {}, "window.x = 1"));

  adoptHead(live, arriving);

  assert.deepEqual(
    childrenNamed(live.head, "script").map((node) => node.getAttribute("src")),
    [],
    "a script tag from the arriving document was adopted into the live head",
  );
});

test("a head that is not there is not a crash", async () => {
  const bare = { title: "Only a document" };
  const prepared = prepareHead(bare, bare);

  assert.deepEqual(prepared.added, []);
  await prepared.waited;
  assert.deepEqual(adoptHead(bare, bare), { added: [], removed: [] });
  assert.deepEqual(adoptHead(document(head()), null), { added: [], removed: [] });
});
