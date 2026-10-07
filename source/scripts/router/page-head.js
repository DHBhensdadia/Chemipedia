/**
 * The head of a page: the sheets it is drawn with, and the record it claims to be.
 *
 * The router replaces the body on a client-side navigation, and that is only half a page. A built
 * document also carries its own stylesheets — a page family declares exactly the ones it draws with —
 * so a swap that left the head alone left the arriving page wearing the *leaving* page's sheets: an
 * index of 118 cards with no card sheet and no index sheet is a page of unstyled links, and a reader
 * had to reload to get the page they had asked for. The metadata had the same shape of defect, a
 * canonical link quietly naming the page they came from.
 *
 * Two steps, in this order and for a reason:
 *
 *   1. **`prepareHead`** adds the arriving page's sheets that are not on the page already, so they
 *      start loading while the reader is still looking at the page they are on. Nothing is removed
 *      yet: taking a page's own sheet away before its replacement is ready is how a swap flickers.
 *   2. **`adoptHead`** then makes the head exactly the arriving document's — the same sheets in the
 *      same order, the same metadata — just before the body is replaced, so the two change together.
 *
 * The live stylesheet *elements* are carried across rather than re-created, so a sheet the two pages
 * share is never re-fetched and never re-parsed; only what differs moves.
 *
 * What is deliberately never adopted is code: a `<script>` in the arriving head is dropped, the same
 * way the router drops the ones in the arriving body. A page's behaviour is started by name, not by
 * evaluating a second copy of anything. The two exceptions are data rather than code — a
 * `application/ld+json` block, which is the record this page claims to be — and the `<title>`, which
 * is the document's own property and is set by the router.
 *
 * Pure decision-making over whatever DOM it is handed: every function here takes the live document
 * and the parsed one, so the whole of it runs under the test suite with fakes and no browser.
 */

/** How long a freshly added sheet is given to arrive before the swap goes ahead without it. */
const SHEET_GRACE_MS = 400;

/** A page's sheets, as the build writes them into the head. */
const SHEET = 'link[rel="stylesheet"]';

/** The one script kind that is data: the page's own structured-data record. */
const DATA_SCRIPT = "application/ld+json";

/** Both documents have a head, and it is an element this module can work on. */
function usable(doc, next, needs) {
  const head = doc?.head;
  const arriving = next?.head;

  if (!head || !arriving || !arriving.children) {
    return null;
  }

  return needs.every((name) => typeof head[name] === "function") ? { head, arriving } : null;
}

/** A link element is a sheet when it says so. */
function isSheet(node) {
  return node.tagName === "LINK" && (node.getAttribute("rel") ?? "").toLowerCase() === "stylesheet";
}

/** The document's own name for itself: the router sets it, so a swap does not carry it here. */
function isTitle(node) {
  return node.tagName === "TITLE";
}

/** A script that would run, as against the structured-data block, which is a record and not code. */
function isCode(node) {
  return node.tagName === "SCRIPT" && node.getAttribute("type") !== DATA_SCRIPT;
}

/** What a sheet is the same as: its address on this site. */
function addressOf(node) {
  return node.getAttribute("href") ?? "";
}

/**
 * The same element, built in the live document.
 *
 * `importNode` would be the shorter road, but a parsed document's nodes belong to that document, and
 * copying the attributes by hand keeps this working over any pair of documents — including the fakes
 * the tests hand it — and keeps the one rule that matters: nothing from the arriving document is
 * inserted into the live one unexamined.
 *
 * @param {Document} doc the live document
 * @param {Element} node an element of the arriving one
 * @returns {Element} a copy that belongs to `doc`
 */
function copyOf(doc, node) {
  const clone = doc.createElement(node.tagName.toLowerCase());

  for (const name of node.getAttributeNames()) {
    clone.setAttribute(name, node.getAttribute(name));
  }

  if (node.textContent) {
    clone.textContent = node.textContent;
  }

  return clone;
}

/**
 * Wait for a sheet to load, or for the grace to run out — whichever comes first.
 *
 * A sheet that never arrives must not hold the reader on the page they are leaving, and a sheet that
 * arrives instantly should not be waited on at all: the load event resolves this, and the timer is
 * only the floor under a broken address.
 *
 * @param {HTMLElement} link the sheet that was just added
 * @param {{ grace: number, setTimer?: Function, clearTimer?: Function }} options
 * @returns {Promise<void>} resolved when the sheet has loaded, failed or been waited for long enough
 */
function whenLoaded(link, { grace, setTimer, clearTimer }) {
  if (typeof link.addEventListener !== "function" || typeof setTimer !== "function") {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let settled = false;
    let timer = null;

    const finish = () => {
      if (settled) {
        return;
      }

      settled = true;

      if (timer !== null && typeof clearTimer === "function") {
        clearTimer(timer);
      }

      resolve();
    };

    timer = setTimer(finish, grace);

    link.addEventListener("load", finish, { once: true });
    link.addEventListener("error", finish, { once: true });
  });
}

/**
 * Get the arriving page's own sheets loading before the reader is moved onto it.
 *
 * @param {Document} doc the live document
 * @param {Document} next the parsed arriving one
 * @param {{ grace?: number, setTimer?: Function, clearTimer?: Function }} [options]
 * @returns {{ added: HTMLElement[], waited: Promise<void> }} the sheets added, and their work
 */
export function prepareHead(doc, next, { grace = SHEET_GRACE_MS, setTimer, clearTimer } = {}) {
  const found = usable(doc, next, ["append"]);

  if (!found || typeof found.head.querySelectorAll !== "function") {
    return { added: [], waited: Promise.resolve() };
  }

  const live = new Set([...found.head.querySelectorAll(SHEET)].map(addressOf));
  const added = [];

  for (const sheet of found.arriving.querySelectorAll(SHEET)) {
    if (live.has(addressOf(sheet))) {
      continue;
    }

    const link = copyOf(doc, sheet);

    found.head.append(link);
    added.push(link);
  }

  return { added, waited: Promise.all(added.map((link) => whenLoaded(link, { grace, setTimer, clearTimer }))) };
}

/**
 * Make the live head the arriving page's head.
 *
 * Run immediately before the body is replaced. Afterwards the head is what a full load of the
 * arriving URL would have left: the same sheets, in the arriving order, and the same metadata — with
 * the sheets the two pages share carried across as the elements they already are, and the document's
 * own title left to the router.
 *
 * @param {Document} doc the live document
 * @param {Document} next the parsed arriving one
 * @returns {{ added: string[], removed: string[] }} the sheet addresses that changed, for a test or a log
 */
export function adoptHead(doc, next) {
  const found = usable(doc, next, ["replaceChildren", "querySelectorAll"]);

  if (!found) {
    return { added: [], removed: [] };
  }

  const live = new Map([...found.head.querySelectorAll(SHEET)].map((link) => [addressOf(link), link]));
  const kept = [...found.head.children].filter(isCode);
  const title = [...found.head.children].find(isTitle) ?? null;
  const content = [];
  const added = [];
  const used = new Set();

  for (const node of found.arriving.children) {
    if (isCode(node)) {
      continue;
    }

    if (isTitle(node)) {
      if (title && !used.has(title)) {
        used.add(title);
        content.push(title);
      }

      continue;
    }

    if (isSheet(node)) {
      const shared = live.get(addressOf(node));

      if (shared && !used.has(shared)) {
        used.add(shared);
        content.push(shared);
        continue;
      }

      content.push(copyOf(doc, node));
      added.push(addressOf(node));
      continue;
    }

    content.push(copyOf(doc, node));
  }

  const removed = [...live]
    .filter(([, link]) => !used.has(link))
    .map(([address]) => address);

  found.head.replaceChildren(...kept, ...content);

  return { added, removed };
}
