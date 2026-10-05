/**
 * The legend: one chip per colour key, with the number of elements behind it.
 *
 * The count is not decoration. It is the data's own answer to "how many transition metals are
 * there?", printed beside the colour that means a transition metal, so the legend and the table
 * are two views of one fact rather than a key and a picture that could disagree.
 *
 * A chip is a button when the table owns it — pressing it isolates that key, and the button says
 * so with `aria-pressed` — and a link when the destination is a page, which is the reference's
 * arrangement and the one the group pages will want. The rendering is the same craft either way;
 * only the element differs.
 *
 * The behaviour lives beside the markup because it belongs to the chip and to nothing else. The
 * module emits what a chip means as a callback: `attachLegendChips` reports the key under the
 * pointer or the focus, the key a press pinned, and `null` when there is nothing to isolate. What
 * the table does with that — dimming, restoring, counting — is the table's business.
 */

import { attributes, classNames, escapeHtml } from "../lib/html.js";

/**
 * The legend as markup.
 *
 * @param {{
 *   items: { key: string, label: string, count: number, href?: string, pressed?: boolean }[],
 *   label?: string
 * }} options
 * @returns {string}
 */
export function legendChips({ items, label = "Colour key" }) {
  if (items.length === 0) {
    return "";
  }

  const chips = items.map((item) => {
    const classes = classNames("chip", item.pressed && "is-active");
    const content = `<span class="chip__label">${escapeHtml(item.label)}</span><span class="chip__n">${escapeHtml(item.count)}</span>`;

    if (item.href) {
      return `<li><a${attributes({
        class: classes,
        href: item.href,
        "data-key": item.key,
        "data-pt-highlight": item.key,
      })}>${content}</a></li>`;
    }

    return `<li><button${attributes({
      class: classes,
      type: "button",
      "data-key": item.key,
      "data-pt-highlight": item.key,
      "aria-pressed": item.pressed ? "true" : "false",
    })}>${content}</button></li>`;
  });

  return `<ul${attributes({
    class: "legend",
    "data-pt-legend": true,
    "aria-label": label,
  })}>
${chips.join("\n")}
</ul>`;
}

/**
 * Bind the legend's isolation behaviour.
 *
 * An isolation is shown while it is being pointed at or reached by keyboard, and stays shown when
 * a press pins it — a press on a link is navigation, so links are never pinned. A pinned key
 * survives the pointer leaving its chip, because the reader who pressed it has said that is the
 * key they mean.
 *
 * @param {ParentNode} root
 * @param {{ onHighlight?: (key: string | null) => void }} [options]
 * @returns {() => void} teardown
 */
export function attachLegendChips(root, { onHighlight = () => {} } = {}) {
  const chips = [...root.querySelectorAll("[data-pt-highlight]")];
  const removers = [];
  let pinned = null;
  let shown = null;

  /** Report a change once, so a hover that moves within one chip does not repaint the table. */
  function show(key) {
    if (key === shown) {
      return;
    }

    shown = key;
    onHighlight(key);
  }

  /** Mark the pinned chip, and only the pinned chip, as active and pressed. */
  function paint() {
    for (const chip of chips) {
      const active = chip.dataset.ptHighlight === pinned;

      chip.classList.toggle("is-active", active);

      if (chip.tagName === "BUTTON") {
        chip.setAttribute("aria-pressed", active ? "true" : "false");
      }
    }
  }

  function listen(target, type, handler) {
    target.addEventListener(type, handler);
    removers.push(() => target.removeEventListener(type, handler));
  }

  for (const chip of chips) {
    const key = chip.dataset.ptHighlight;

    listen(chip, "pointerenter", () => show(key));
    listen(chip, "pointerleave", () => show(pinned));
    listen(chip, "focus", () => show(key));
    listen(chip, "blur", () => show(pinned));
    listen(chip, "click", () => {
      if (chip.tagName !== "BUTTON") {
        return;
      }

      pinned = pinned === key ? null : key;
      paint();
      show(pinned);
    });
  }

  return () => {
    for (const remove of removers) {
      remove();
    }

    show(null);
  };
}
