/**
 * What the shared page arrangements are drawn with.
 *
 * The routes declare their own sheets beside their templates, because a page's dependencies are part
 * of what a page is. These four are the other half of that idea: the sets two or more routes need,
 * where naming the same list twice in two routes is how the two come to differ. The four table views
 * are one arrangement; the eleven group pages and the index above them share the three component
 * sheets that make a tile draw in its category's colour; the glossary's index and its 418 term pages
 * are one file between them.
 *
 * They live here rather than in `routes.js` because the manifest crossed the project's 400-line
 * ceiling when the atoms route was added to it (384 lines to 401), and this is the part of it that is
 * not a route: it is the vocabulary of sheets the routes refer to. The law asks for a split by
 * responsibility rather than a trim, and the seam is real — a route says *which* sheets, and these
 * say *which sheets those are*.
 */

/**
 * The stylesheets every one of the four table views needs, in cascade order.
 *
 * The tile sheet draws a tile and the legend sheet draws a chip, but neither decides a colour: they
 * consume `--fill` and `--on-fill`, and the periodic table's sheet is the one map that turns an
 * element's key into that pair. A view of 118 tiles that did not declare it is a view of 118 grey
 * tiles — which is exactly what the elements index shipped before Phase 6's browser pass caught it.
 *
 * The four views are one arrangement rather than four, so the list is written once and the evolution
 * view appends the timeline's own sheet to it.
 */
export const TABLE_VIEW_STYLES = [
  "styles/components/element-tile.css",
  "styles/components/legend-chips.css",
  "styles/components/periodic-table.css",
  "styles/pages/table-views.css",
];

/**
 * The stylesheets every group page needs, in cascade order.
 *
 * The three component sheets a group page draws the table with. Its own file is not listed: a
 * family's main template is named after the family, so the build appends `styles/pages/group.css` for
 * the group pages by itself, and naming it twice links the same sheet twice.
 *
 * The index page is the exception the other way round. Its cards are a category's colour on a tile,
 * and the only sheet that knows what a category's colour is happens to be the table's, so it declares
 * these three and adds the family's own file by hand.
 */
export const GROUP_STYLES = [
  "styles/components/element-tile.css",
  "styles/components/legend-chips.css",
  "styles/components/periodic-table.css",
];

/** The group pages' own sheet, which the index page has to ask for by name. */
export const GROUP_PAGE_SHEET = "styles/pages/group.css";

/**
 * The glossary's own sheet, declared by both of its templates.
 *
 * One file for the index and the 418 term pages, for the reason `group.css` is one file for the
 * eleven group pages: they are one arrangement, and the term page is the index's article. Neither
 * template is named `glossary`, so the build appends nothing for them by itself and both routes ask
 * for the file by name.
 */
export const GLOSSARY_STYLES = ["styles/pages/glossary.css"];
