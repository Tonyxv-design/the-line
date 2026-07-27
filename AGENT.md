# The Line — standing brief

**Read this first. It is the contract for anyone (human or model) touching this repo.**

Live site: https://tonyxv-design.github.io/the-line/

---

## 1. Check the version before doing anything

The site header shows `N recipes on the line · data vX (YYYY-MM-DD)`.

That stamp comes from the `version` field in `recipes.json`. Before diagnosing any
"it didn't update" problem:

1. Open the live site. Read the stamp.
2. Open `recipes.json` in the repo. Read its `version`.
3. **If they differ, the deploy has not landed.** Nothing else is wrong. Wait for
   GitHub Pages, or check the commit actually went to the branch Pages serves.
4. If they match and the content still looks stale, it is the localStorage overlay
   (see §4), not a deploy problem.

Do not diagnose by inspecting subtitle wording, dropdown contents, or recipe counts.
That is guesswork. The stamp is the answer.

---

## 2. Deploying: three files, root of the repo

| File | Load-bearing | Change it when |
|---|---|---|
| `recipes.json` | **yes** | any recipe added or edited |
| `index.html` | **yes** | app behavior or UI changes |
| `sw.js` | **yes** | *every* deploy — bump `CACHE_NAME` or clients keep the cached copy |
| `changelog.md` | no | documentation only |
| `the-line.html` | no | one-line redirect to `index.html`, never changes |

**Every commit that touches `recipes.json` must also:**
- bump `version` in `recipes.json` (`v9` → `v10`)
- set `updated` to today
- bump `CACHE_NAME` in `sw.js` to the matching `the-line-v10`

Keeping the two version numbers identical is deliberate. If they ever disagree,
the cache is serving something other than what the data claims to be.

The in-app **Export recipes.json** button does the first two automatically: it reads
the loaded version and writes the next one. `sw.js` is still manual.

---

## 3. `recipes.json` format

```json
{
  "version": "v9",
  "updated": "2026-07-26",
  "recipes": [ { ...recipe... } ]
}
```

The app accepts a bare array too, for backward compatibility, but then the header
reads `data unversioned` — which defeats the point. Always ship the envelope.

### Recipe record

```json
{
  "id": "kebab-case-unique",
  "source": "line" | "box",
  "title": "...",
  "category": "one of the 14 below",
  "tags": ["gluten-free", "..."],
  "proteins": ["beef"|"chicken"|"pork"|"seafood"|"lamb"],
  "courses": ["dessert"|"side"|"sauce"],
  "yield": "...",
  "timing": "35 min active / 1 hr total",
  "equipment": "...",
  "components": [{ "name": "Rub", "items": [{ "item": "...", "g": "30g", "note": "..." }] }],
  "prep": ["..."],
  "method": ["..."],
  "finalSeasoning": "...",
  "chefNote": "...",
  "servingNotes": "...",
  "storage": "..."
}
```

Every key must be present on every record, even if empty. `proteins` and `courses`
are arrays; empty array means "main, no protein tab."

**Categories (14):** Baked Goods & Desserts, Braises, Curries & Indian, Doughs,
Family Favorites, Restaurant Mains, Salads, Salsas & Sauces, Sauces & Condiments,
Sides & Rice, Smoked & Grilled, Soups & Stews, Southeast Asian, Weeknight.

**Ingredient delimiter in the on-page editor is `|`, not comma.** Ingredient names
contain their own commas ("pork ribs, membrane removed"). Using a comma silently
corrupts the record on save.

---

## 4. The localStorage overlay

`recipes.json` is the source of truth. localStorage key `the-line-pending-v1` holds
*only* edits made in the browser since the last export. Those edits win over the
committed file for the specific recipe IDs they cover.

So: a recipe can look stale on the site even when the deploy succeeded, if that
recipe has a staged local edit. The "unsaved changes" banner will be showing.
Export, commit, reload — the overlay reconciles itself and the banner clears.

---

## 5. Kitchen constraints (non-negotiable)

- **Gluten-free by default.** Genuine exceptions (the sourdough recipes) are marked
  in `chefNote` as "Non-GF exception."
- **No raw bell pepper.** Cooked into a dish is fine. This is not an allergy; it is a
  raw-texture issue. Other chiles (jalapeño, poblano, serrano, habanero, guajillo,
  ancho, pasilla) are fine raw or cooked.
- **All quantities in grams.** No cups, tablespoons, teaspoons, or bare counts.
  Countables carry the weight in `g` and the count in `note` — `"g": "0.6g",
  "note": "3 leaves"`.
- **Temperatures in Fahrenheit.** Internal pull temps on every protein.
- Cooking for two adults with intentional leftovers and freezer portions.
- Equipment: Traeger pellet grill, oven, stovetop, cast iron, stainless, Dutch oven,
  blender, immersion blender, food processor, digital scale, instant-read thermometer.

---

## 6. Writing style

- **No em dashes anywhere.** Numeric ranges read "8 to 10 minutes", not "8–10".
- **Method steps carry actions only.** No justification, no warnings, no teaching
  asides mid-step. All reasoning goes in `chefNote`, stated briefly.
- **Repeat the exact quantity inline at every step.** "Add 30g tomato paste," never
  "add the tomato paste." No looking back at the ingredient list while cooking.
- **Every cooking step gets a temperature and a time.**
- **"To taste" always carries a gram starting amount.**
- Never write "this is not optional," "don't skip this," or similar insistence.
- Don't say "GF-verified" or "GF-certified" on ingredients. Just name the ingredient.
- For substitutions, give the conversion ratio, not an explanation of the difference.
- Don't state the same note in two places.

**Mid-cook mode:** when actively cooking, give only the immediate next action, the
next temp checkpoint, and when to check back. Never reprint the full recipe.

---

## 7. Known gaps

- `Salsas & Sauces` and `Sauces & Condiments` are redundant categories. The `courses`
  tag makes all sauces reachable regardless, so nothing is hidden.
- No **lamb** tab in the protein filter row. Rack of Lamb and Shepherd's Pie are
  tagged and searchable but not filterable.
- On the horizon, offered but never written: Smoked Brisket (Traeger), Thai Green
  Curry, Stovetop Steak Method.
