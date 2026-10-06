import { test } from "node:test";
import assert from "node:assert/strict";

import { DATA_ROOT, loadJson } from "../../scripts/data/json-source.js";
import { sitePath } from "../../scripts/lib/site-path.js";

/**
 * A stand-in for the browser's fetch that answers with a body and remembers what it was asked for.
 *
 * What these tests are about is the address and not the bytes, so the fetch is the smallest one
 * that can answer: a recorded URL and one JSON response.
 *
 * @param {unknown} body
 * @returns {{ asked: string[], fetchImpl: (url: string) => Promise<Response> }}
 */
function answering(body) {
  const asked = [];

  return {
    asked,
    fetchImpl: async (url) => {
      asked.push(String(url));

      return new Response(JSON.stringify(body), { status: 200 });
    },
  };
}

test("the data folder is asked for inside the site, not from the domain it is served on", () => {
  // A bare `/data` is right at a domain root and wrong under a project page's path, where it asks
  // the domain for a folder that only exists under the site. This is the one place that decides,
  // and it decides through the module that knows where the site is served from.
  assert.equal(DATA_ROOT, sitePath("/data"));
});

test("a file is read from the base it was given, so a site under a path reads its own copy", async () => {
  const { asked, fetchImpl } = answering([{ slug: "hydrogen" }]);
  const data = await loadJson("elements.json", { fetchImpl, base: "/Chemipedia/data" });

  assert.deepEqual(asked, ["/Chemipedia/data/elements.json"]);
  assert.equal(data[0].slug, "hydrogen");
});

test("with nothing injected, the browser asks the site's own data folder", async () => {
  const { asked, fetchImpl } = answering({ fields: [] });

  await loadJson("units.json", { fetchImpl });

  assert.deepEqual(asked, [`${DATA_ROOT}/units.json`]);
  // Two separators would begin an address rather than a path, which asks for another host.
  assert.equal(asked[0].startsWith("//"), false);
});

test("a response that is not OK is refused by name, not by shape", async () => {
  const fetchImpl = async () => new Response("", { status: 404, statusText: "Not Found" });

  await assert.rejects(() => loadJson("elements.json", { fetchImpl }), /elements\.json answered 404/);
});
