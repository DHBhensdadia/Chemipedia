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
writing work — 118 short entries. Budget for it in Phase 2 and treat it as the phase's real cost.

**Chosen dataset, licence, retrieval date, and commit hash of the generated output:**
_To be recorded here in Phase 2, before the data commit. Do not generate data without filling in
this section first._

| Field | Value |
|---|---|
| Dataset name | _(Phase 2)_ |
| URL | _(Phase 2)_ |
| Licence | _(Phase 2)_ |
| Retrieved | _(Phase 2)_ |
| Transform script | `source/tools/build-data.js` |
| Output | `source/data/elements.json` |
| Output commit | _(Phase 2)_ |

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

Category assignment follows standard practice and the reference's counts. Where an element is
genuinely disputed (the classic cases are the group-3 identity and whether hydrogen belongs in
group 1), record our decision in `source/data/overrides.json` with a one-line reason, so the choice
is defensible rather than accidental.

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
  "description": "…",
  "uses": "…",
  "sources": "…",

  "position": { "row": 1, "column": 1 },   // derived, precomputed for the grid
  "dataSource": "…"                        // attribution key into this document
}
```

**Conventions**

- `null` means *unknown*, and the UI renders a neutral placeholder. Never `""`, never `0`, never
  `"Not measured"` — the sentinel is a presentation concern, not a data concern.
- Units are recorded in `source/data/units.json`, not embedded in field names.
- Slugs follow the reference's convention so external links stay predictable: lowercase, British
  spellings (`aluminium`, `caesium`, `sulphur`).
- `position` is derived by `build-data.js` so the grid maths has one source of truth and can be
  tested against a fixture.

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
| Every element has non-empty `summary`, `description`, `uses`, `sources` | `source/tests/data/*` |
| No field contains the sentinel string `Not measured` | `source/tests/data/*` |
| No record or prose field contains a prohibited brand string | `source/tests/brand/*` |
