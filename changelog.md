# The Line — Before / After Changelog

## Architecture

| | Before | After |
|---|---|---|
| Recipe storage | 47 recipes hardcoded as two JS arrays (`seed`, `boxSeed`) inside a 5,258-line `index.html`, in two different literal styles | 47 recipes in a standalone `recipes.json`, one clean schema, diffable in git |
| Source of truth | localStorage, seeded/merged from the hardcoded arrays on every load, with no export path | `recipes.json`, fetched at load; localStorage now holds only an *unsaved-changes overlay* since the last export |
| `index.html` vs `the-line.html` | Byte-for-byte duplicates, hand-maintained in parallel | `the-line.html` is now a 1-line redirect to `index.html` — one file to maintain |
| Backup / recovery | None — a cleared cache or new device silently lost every edit and every recipe added since the last manual hand-edit of the HTML | "Unsaved changes" banner + **Export recipes.json** button; the exported file is what you commit to git, so recovery = git history |
| Offline caching (`sw.js`) | Cached the app shell only (`index.html`) | Also caches `recipes.json`; network-first for `recipes.json` (so a committed edit shows up as soon as you're online) and cache-first for the app shell (opens instantly) |

## Data fixes

- **Category taxonomy**: 16 ad-hoc category values were in use, but the Add Recipe dropdown only offered 6 (10 categories were unreachable from the UI). Normalized to 14 categories; merged the two one-recipe orphans (`Stews & Chili` → `Soups & Stews`, `Comfort Food` → `Family Favorites`). Dropdown now matches the real taxonomy exactly.
- **Every other field of every recipe is untouched** — verified by diffing the extracted data against the original arrays field-by-field; the only changes were the two category merges above.

## Bugs fixed (found during the rebuild, not previously known)

- **Ingredient parser used a bare comma as the item/gram/note delimiter**, which collided with commas that are part of the ingredient text itself (e.g. "pork ribs, **membrane removed**"). Editing and re-saving 26 of the 47 recipes through the on-page editor would have silently reshuffled that text. Fixed by switching the delimiter to `|` (e.g. `item | 27g | note`); form hints updated to match.
- **Component-name headers with parentheses or commas failed to re-parse** (e.g. "Braise Liquid (for the wrap)", "Toppings, Optional") — their items would silently fall into the wrong group on the next edit. Fixed by broadening the header-detection pattern to match up to the first colon instead of a narrow letter-only pattern.

## Content / UI changes (judgment calls)

- **Site subtitle** changed from "Gluten-free · no bell peppers" to "Grams & °F · GF by default (exceptions flagged per recipe)" — the old line was already inaccurate (3 sourdough recipes are deliberately gluten-containing family recipes) and stale (you'd told the Head Chef skill bell peppers are fine).
- **New "Contains Gluten" badge** on any recipe tagged `contains-gluten`, shown on both the card and the detail view, so it's visible before you commit to cooking it.

## Not yet fixed (flagged in the usability review, not yet acted on)
- Several buttons and all checkboxes in the Add/Edit forms are below the ~44px touch-target guideline.
- The recipe detail modal's close button scrolls out of reach on long recipes.

See `usability-results.md` for the full test run.

---

# Session 2 — Audit, style pass, versioning, 5 new recipes

## Versioning (new)

`recipes.json` is now `{ "version": "v9", "updated": "2026-07-26", "recipes": [...] }`.
The site header renders it as `52 recipes on the line · data v9 (2026-07-26)`.

**Every commit touching `recipes.json` must bump `version`, set `updated`, and bump
`CACHE_NAME` in `sw.js` to the matching number.** The Export button auto-bumps the
first two; `sw.js` is manual. See `AGENT.md`.

This exists so "the site didn't update" is a two-string comparison instead of an
investigation.

## Constraint correction

- **Bell pepper** was recorded as an allergy in four chef notes. Corrected: raw bell
  pepper is out, cooked-in is fine. Poblano swaps retained as flavor choices.
- Subtitle now reads `Grams & °F · GF by default (exceptions flagged per recipe) · No raw bell pepper`.

## Data fixes

| Fix | Scope |
|---|---|
| All quantities converted to grams | 106 entries across 38 recipes |
| "To taste" replaced with gram starting amounts | 19 recipes |
| Internal pull temps added | 12 protein recipes |
| Stray volume units removed from method text | Biryani, Saag Paneer, Carrot Cake, Halloween Cookies |
| Bake temps repeated inline at the bake step | 4 recipes |
| Vague back-references given explicit quantities | 40+ steps |
| `courses: ["sauce"]` added | Pesto, Chimichurri, Roasted Green Hot Sauce |
| `proteins: ["lamb"]` + tag | Rack of Lamb, Shepherd's Pie |

## Broken recipes repaired

- **Basic Sourdough Loaf** — no bake temp, bake time, bulk ferment, or proof time. Full build written.
- **Sourdough Pizza Crust** — same gap, same treatment.
- **Nashville Hot Chicken** — 900g chicken listed twice (Brine *and* Dredge). Deduplicated.
- **Crispy Panko Chicken** — whole breasts at 2–3 min/side to 165°F was not achievable. Pounding is now step one. Duplicate prep step removed.
- **Carnitas (Dr. P.)** — "then all the seasonings" replaced with all seven named at weight.
- **Matcha Olive Oil Cake** — 240g cream listed, never used. Now whipped and served alongside.
- **Halloween Cookies** — icing and coloring listed, never used. Decorating method added.
- **Smoked Baked Beans** — 2 jalapeños listed, never used. Now added with the poblano.
- **Carrot Cake** — frosting ingredients with no frosting method. Method added.

## Style pass (all 52)

No em dashes. Method steps carry actions only; 47 had reasoning spliced in, all moved
to `chefNote`. All 47 chef notes rewritten and deduped (avg 135 chars, was up to 947).
"GF-verified"/"GF-certified" stripped from 23 ingredient lines. Insistence language removed.

## New recipes (47 → 52)

Larb Gai; Sriracha-Lime Yogurt Crema; Harissa Yogurt Sauce; Boiled Tomatillo Salsa
(Salsa Verde Cocida); Mild Salsa Roja (Tomato-Tomatillo, Boiled).

Liquids stored in grams to match the existing records.

## Note on deployment

The live site was found running a build predating the `recipes.json` refactor: comma
ingredient delimiter, 6-category dropdown, original subtitle. `index.html` must ship
for any of this to appear.
