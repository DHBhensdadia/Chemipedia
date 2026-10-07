/**
 * Enough of a document for the router's head and body to be tested in Node.
 *
 * The router is written against the DOM, and Node has none. Rather than a DOM implementation, this is
 * the smallest fake the two halves of the router actually touch — a tag, attributes, children, and
 * the load events a stylesheet fires — so a test can read a navigation step by step. It lives in one
 * file because `router.test.js` and `page-head.test.js` both need it, and two copies of a fake is two
 * answers to one question, which is the same reason the atom layer's fixtures are shared.
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
