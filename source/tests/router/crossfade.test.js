import { test } from "node:test";
import assert from "node:assert/strict";

import { createRouter } from "../../scripts/router/router.js";

import { fakePage, settle, sheetAddresses } from "./dom-fixtures.js";

/**
 * The router over a fake page, with the cross-fade's two collaborators spelled out: the reader's
 * motion preference, and the platform's view-transition API.
 */
function open({ reduce = false, viewTransitions = false } = {}) {
  const env = fakePage({ reduce, viewTransitions });
  const router = createRouter({
    document: env.doc,
    window: env.win,
    fetchImpl: env.fetchImpl,
    parse: () => env.parsed,
    startPage: env.startPage,
  });

  router.start();

  return { env, router };
}

test("a move forward cross-fades the swap where the platform can", async () => {
  const { env, router } = open({ viewTransitions: true });

  await router.navigate("https://chempedia.test/elements/iron/");

  assert.equal(env.calls.faded.length, 1, "the navigation was not wrapped in a transition");
  assert.equal(env.body.dataset.page, "home", "the body was not replaced inside the transition");
  assert.equal(env.calls.started.at(-1), "home", "the arriving page did not start");
  assert.ok(env.main.focused, "focus was not handed to the main landmark");
  assert.equal(env.calls.scrolled.at(-1).top, 0);
  assert.equal(router.busy(), false, "the router held the reader for the fade");
});

test("the cross-fade wraps the swap after the head, so the arriving page fades in in its own sheets", async () => {
  const { env, router } = open({ viewTransitions: true });
  const sheetsAtFade = [];

  env.doc.startViewTransition = (update) => {
    sheetsAtFade.push(sheetAddresses(env.head).join(" "));
    update();
  };

  await router.navigate("https://chempedia.test/elements/iron/");

  assert.equal(sheetsAtFade.length, 1);
  assert.ok(
    sheetsAtFade[0].includes("/styles/pages/elements-index.css"),
    "the arriving sheet was not in place before the fade began",
  );
  assert.ok(
    !sheetsAtFade[0].includes("/styles/pages/table-views.css"),
    "the leaving sheet was still in place when the fade began",
  );
});

test("a reduced-motion reader gets the swap itself, with no cross-fade", async () => {
  const { env, router } = open({ viewTransitions: true, reduce: true });

  await router.navigate("https://chempedia.test/elements/iron/");

  assert.equal(env.calls.faded.length, 0, "a transition ran under a stillness preference");
  assert.equal(env.body.dataset.page, "home", "the navigation still lands");
  assert.equal(env.calls.scrolled.at(-1).top, 0);
});

test("a browser without view transitions navigates exactly as before", async () => {
  const { env, router } = open({ viewTransitions: false });

  await router.navigate("https://chempedia.test/elements/iron/");

  assert.equal(env.calls.faded.length, 0);
  assert.equal(env.body.dataset.page, "home");
  assert.equal(env.calls.scrolled.at(-1).top, 0);
});

test("a history move is left instant even where the platform can cross-fade", async () => {
  const { env, router } = open({ viewTransitions: true });

  env.win.location.href = "https://chempedia.test/glossary/";
  env.listeners.get("popstate")({ state: { router: true, scrollY: 420 } });
  await settle();

  assert.equal(env.calls.faded.length, 0, "a transition ran on a history move");
  assert.equal(env.calls.scrolled.at(-1).top, 420, "the reader's place was not restored");
});
