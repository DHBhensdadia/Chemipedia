# Data Sources and Schemas — ChemiPedia

Where every fact and every sentence in the site comes from, and what shape the data takes once it
is ours. Maintained by Phase 2 and audited in Phase 11.

> **Governing rule (ADR-005).** Facts are taken from openly licensed structured datasets and
> normalised by a committed build script. Prose is written by us, or adapted from an openly licensed
> source with attribution recorded here. **The reference site's data and prose are never used as a
> source** — not for fields, not for wording, not as a structural crib.

---

## 1. Two kinds of content

| Kind | Examples | Source | Attribution required |
|---|---|---|---|
| **Facts** (not copyrightable) | atomic number, atomic weight, melting point, boiling point, density, electron configuration, shells, block, period, discovery year and place, discoverer | open structured dataset, transformed | yes, courtesy — record the dataset and licence |
| **Prose** (copyrightable) | element descriptions, uses, sources, glossary definitions, all explainer copy | authored by us, or adapted from an openly licensed source | yes, per source |

A fact is written in **our own sentence**. Copying a sentence and changing three words is not
authoring — it is a licence and brand violation, and it is exactly what this rule exists to prevent.

## 2. Primary dataset — elements

**Candidate: an open periodic-table dataset in JSON.**

The required field list is long — the reference element page carries around forty values, and
`docs/research/01-reference-site-audit.md` §3.4 records them all with Hydrogen as the worked
example. No single hand-maintained file should be authored by hand; the dataset is fetched and
transformed.

**Requirements for whatever dataset is chosen:**

1. Permissively licensed (MIT, CC0, CC BY, or public domain), with the licence name recorded below.
2. Machine-readable JSON or CSV, not HTML to be scraped.
3. Covers all 118 elements including the synthetic ones (up to Oganesson, Z=118).
4. Supplies, at minimum: atomic number, symbol, name, atomic weight, category or group, period,
   block, electron configuration, shells, melting and boiling points, density, electronegativity,
   ionisation energies, heat of vaporisation and fusion, specific heat, thermal conductivity,
   atomic and covalent radii, oxidation states, crystal structure, and discovery metadata.
5. Where a value is genuinely unknown for an element, the dataset says so explicitly. The reference
   uses the sentinel string `Not measured`, and our formatter must treat "unknown" as a first-class
   case rather than rendering an empty cell.

**Fields the dataset will not supply, and which we author:** the descriptive paragraph, the Uses
paragraph, the Sources paragraph, the pronunciation, and the name origin. These are per-element
writing work — 118 short entries — and they are the phase's real cost rather than its mechanical
part. There were four prose fields in the first draft of this schema; `description` was dropped
because on the page it and `summary` are the same paragraph twice, and a schema that asks for two
names for one thing is a schema that will drift.

**Where the authored text lives.** Fetched facts and written prose are kept apart, in
`source/data/element-notes.json` and the generated `source/data/elements.json` respectively. A
build script that writes a file the author also edits by hand destroys the author's work the
second time it runs, and merging two files is a smaller complication than that. `build-data.js`
will refuse to write an element whose notes are missing, so the merge cannot fail quietly.

**Chosen dataset, licence, retrieval date, and commit hash of the generated output:**

| Field | Value |
|---|---|
| Dataset name | PubChem Periodic Table (PUG REST) |
| Publisher | U.S. National Library of Medicine, National Center for Biotechnology Information |
| URL | `https://pubchem.ncbi.nlm.nih.gov/rest/pug/periodictable/JSON` |
| Licence | Public domain (work of the U.S. government). NCBI places no restriction on the use or distribution of the data it publishes and asks for acknowledgment; the agency also notes that PubChem aggregates some material contributed under other terms, so attribution is recorded whatever the case. The facts themselves — a melting point, an electron configuration — are not copyrightable subject matter in any jurisdiction. |
| Retrieved | 2026-10-01 |
| Coverage | 118 rows, atomic number 1 to 118, one row per element |
| Transform script | `source/tools/build-data.js` |
| Output | `source/data/elements.json` |
| Output commit | _(recorded with the data commit)_ |

PubChem is chosen over the community JSON files that dominate a search for this data because those
are almost all CC BY-SA, and ShareAlike would attach to our generated file and to everything built
from it — a licence obligation the project does not want and ADR-005 does not permit. The one
other permissively licensed candidate found, `komed3/periodic-table` (MIT), carries the same field
set as PubChem and no more, so there is nothing to gain by taking on a second community source.

### 2.1 Supplementary dataset — the second tier of physical properties

PubChem's periodic table exposes seventeen columns. The element page needs roughly forty values,
and the difference is mostly the thermal and atomic-scale properties — heat of fusion, specific
heat, thermal conductivity, ionic radius, crystal system — which PubChem's periodic-table endpoint
does not carry.

| Field | Value |
|---|---|
| Dataset name | Wikidata |
| Publisher | Wikimedia Foundation |
| URL | `https://query.wikidata.org/sparql` (the query is built in `source/tools/data-sources/wikidata.js`) |
| Licence | CC0 1.0 Universal — a public-domain dedication, no conditions |
| Retrieved | 2026-10-01 |
| Coverage | Partial by nature. Where an element has no value in Wikidata the field stays `null`. |

Two sources rather than one is a real cost, and it is the honest one: no single openly licensed
dataset found supplies the whole schema under a licence this project may accept. Every field
records which source produced it, so a reader can tell at a glance.

**Units.** Wikidata stores a value with a unit, and the units are not always the ones we want. The
adapter converts against a small explicit table and **sets the field to `null` rather than guessing
when it meets a unit it does not recognise**. A silent unit error would put a wrong number on the
page with no way to notice it; a null is visible.

**Known gaps.** `covalentRadius` and `latticeParameters` are supplied by neither source and are
`null` for every element. They are kept in the schema so the shape does not change when a source
is found, and the UI renders them the way it renders any other unknown. Filling them is a
data-layer task with no page work attached, which is why it is safe to leave open.

## 3. Glossary

418 terms with an A–Z index and a three-tier difficulty badge (`Beginner`, `Novice`, `Expert`).

**Definitions are authored by us.** Chemical definitions are short and largely uncopyrightable in
substance, but the standard phrasing of any particular glossary is not. Write the definition from
understanding, in our voice, at a length of one to three sentences. Where a definition needs an
authoritative phrasing, adapt from an openly licensed source and record it here.

At 418 entries this is the single largest authoring task in the project. Phase 9 is scoped around
that fact: the page machinery is small, the content is not.

| Field | Value |
|---|---|
| Count required | 418 |
| Definitions | authored by us |
| Level assignment | ours, by difficulty of the concept |
| Output | `source/data/glossary.json` |
| Output commit | _(Phase 9)_ |

**Record schema — `source/data/glossary.json`**

```jsonc
{
  "term": "Kinetics",
  "slug": "kinetics",
  "level": "Expert",        // Beginner | Novice | Expert, and nothing else
  "definition": "One to three sentences, written for this project."
}
```

A definition is searched as well as a term, because a reader who wants a word often knows the
idea and not the name: searching *the study of reaction rates* should reach **kinetics**.
`level` is a closed set rather than free text, because the badge on the page is one of three and a
fourth value would render as nothing at all.

**Which phase owns this — the contradiction, and its resolution.** The implementation plan lists
`glossary.json` under Phase 2, and this table says Phase 9. Both cannot be right, and an unnoticed
contradiction between two documents is itself a defect. Resolved in Phase 2 as follows: **Phase 2
delivers the glossary's contract — the record schema, the repository that reads it, and the tests
that hold it to 418 unique terms — and Phase 9 writes the definitions.** The reason is that the
definitions are writing, and writing 418 of them in the leftovers of a phase that already authors
118 element entries is how a phase ships bad chemistry. The repository is written now anyway
because the elements repository and the glossary repository share one shape, and building them
side by side is cheaper than building the second one four phases later against a stale memory of
the first.

## 4. Element group taxonomy

Eleven categories, with the exact member counts observed on the reference. These counts are a test
assertion, not an observation we may drift from:

| Slug | Display name | Count | Token |
|---|---|---|---|
| `transition-metals` | Transition metal | 35 | `--g-transition-metals` |
| `actinides` | Actinide | 15 | `--g-actinides` |
| `lanthanides` | Lanthanide | 15 | `--g-lanthanides` |
| `post-transition-metals` | Post-transition metal | 8 | `--g-post-transition-metals` |
| `unknown` | Unknown | 8 | `--g-unknown` |
| `noble-gases` | Noble gas | 7 | `--g-noble-gases` |
| `non-metals` | Non-metal | 7 | `--g-non-metals` |
| `alkali-metals` | Alkali metal | 6 | `--g-alkali-metals` |
| `alkaline-earth-metals` | Alkaline earth metal | 6 | `--g-alkaline-earth-metals` |
| `metalloids` | Metalloid | 6 | `--g-metalloids` |
| `halogens` | Halogen | 5 | `--g-halogens` |
| | **Total** | **118** | |

Category assignment starts from the dataset's own classification and is then corrected to these
counts. PubChem's taxonomy differs from ours in five places, and each correction is recorded in
`source/data/overrides.json` with the reason it is right on the chemistry rather than merely
convenient:

| Change | Elements | Reason recorded |
|---|---|---|
| `transition-metals` → `unknown` | Mt (109), Ds (110), Rg (111) | A handful of atoms of each has ever existed. No chemical property of any of them has been measured, so calling them transition metals asserts more than is known. |
| `post-transition-metals` → `unknown` | Nh (113), Fl (114), Mc (115), Lv (116) | Same: the placement is a prediction from periodic trends, not an observation. |
| `halogens` → `unknown` | Ts (117) | Same, and the prediction is itself contested; tennessine may not behave as a halogen at all. |
| `metalloids` → `post-transition-metals` | Po (84) | Polonium is a metal by every measured property. Its classification as a metalloid is a convention inherited from older tables, not a measurement. |

Everything else follows the dataset. `overrides.json` is the complete record, one entry per
corrected element, and a test asserts that applying it produces exactly the counts in §4 — so a
dataset that changes its mind cannot quietly change ours.

## 5. Target schema — `source/data/elements.json`

One array of 118 records. Field names are ours; they are chosen to read well and to match the
labels the UI renders.

```jsonc
{
  "atomicNumber": 1,
  "symbol": "H",
  "name": "Hydrogen",
  "slug": "hydrogen",
  "pronunciation": "HY-dreh-jen",
  "category": "non-metals",        // slug into categories.json
  "group": 1,                       // null for lanthanides/actinides
  "period": 1,
  "block": "s",
  "atomicWeight": 1.008,

  "state": "gas",                   // at 293 K
  "meltingPoint": -259.2,           // °C, null when unknown
  "boilingPoint": -252.77,
  "density": null,
  "crystalStructure": "hexagonal",

  "shells": [1],
  "electronConfiguration": "1s1",
  "electronegativity": 2.2,
  "valence": 1,
  "oxidationStates": [-1, 1],

  "heatOfVaporization": 0.44936,    // kJ/mol
  "heatOfFusion": 0.05868,
  "specificHeat": 14.304,           // J/gK
  "thermalConductivity": 0.001815,  // W/cmK
  "thermalExpansion": null,
  "electricalConductivity": null,

  "atomicRadius": 0.79,             // Å
  "covalentRadius": 0.32,
  "ionicRadius": "1.54 (+1)",
  "atomicVolume": 14.4,             // cm³/mol
  "ionizationEnergies": [13.5984],  // V
  "latticeParameters": [10.478, 3.584],

  "discovery": {
    "discoveredBy": "Henry Cavendish",
    "year": 1766,
    "place": "England",
    "nameOrigin": "Greek: hydro (water) and genes (generate)"
  },

  // Authored prose — ours, never the reference's
  "summary": "…",
  "uses": "…",
  "sources": "…",

  "position": { "row": 1, "column": 1 },   // derived, precomputed for the grid
  "dataSource": "…"                        // attribution key into this document
}
```

**Conventions**

- `null` means *unknown*, and the UI renders a neutral placeholder. Never `""`, never `0`, never
  the reference's own sentinel string — the sentinel is a presentation concern, not a data
  concern, and it belongs to whoever writes the sentence around it.
- Units are recorded in `source/data/units.json`, not embedded in field names.
- Slugs follow a fixed convention so external links stay predictable: lowercase, British spellings
  (`aluminium`, `caesium`, `sulphur`). The rule lives in `source/scripts/lib/slug.js`, which is
  pure and tested.
- Measured values are converted into the schema's unit **at transform time**, never at render
  time. PubChem reports temperatures in kelvin and radii in picometres; both are converted once,
  in `build-data.js`, so nothing downstream has to remember which source a number came from.

**Derived fields.** Five values are computed rather than fetched, by
`source/tools/data-sources/layout.js`, because they are properties of the periodic table's shape
and not of any one dataset:

| Field | Rule |
|---|---|
| `period`, `group` | From the standard layout. `group` is `null` for the lanthanides and actinides, which have no group in this table. |
| `block` | `s`, `p`, `d` or `f` from the group and the element's row. Helium is `s`, not `p`. |
| `shells` | Electrons per principal shell, from the Madelung filling order. Shell populations are not affected by the d- and f-block anomalies, so the derivation is exact rather than approximate. |
| `valence` | Electrons in the outermost occupied shell. Stated outright because "valence" means different things to different tables, and a document that does not define it is a document that cannot be checked. |
| `position` | The grid cell, `{ row, column }`, on an 18-column grid: periods 1 to 7 in rows 1 to 7, lanthanides in row 9 and actinides in row 10, both starting at column 3. Derived once so the grid maths has one source of truth and can be tested against a fixture. |

## 6. Attribution practice

- A `/about` page section titled **Data sources** lists every dataset and licence used.
- `source/data/elements.json` records a `dataSource` key per record.
- This document is the canonical record. If a source is added, it is added here in the same commit
  as the data that uses it.

## 7. Tests that guard this document

| Assertion | Where |
|---|---|
| Exactly 118 elements; exactly 418 glossary terms | `source/tests/data/*` |
| Every slug unique and URL-safe | `source/tests/data/*` |
| Every `category` resolves to a slug in `categories.json`; counts match §4 | `source/tests/data/*` |
| Every property value is a number, a string, `null`, or an array of those — never `undefined` | `source/tests/data/*` |
| No field anywhere in the data carries the sentinel string | `source/tests/data/*` |
| The derived layout matches the table's shape: no two elements share a cell, every group is 1–18 | `source/tests/data/*` |
| No record or prose field contains a prohibited brand string | `source/tests/brand/*` |
| Every element has non-empty `summary`, `uses` and `sources` | `source/tests/data/*` — added by the commit that authors them |
