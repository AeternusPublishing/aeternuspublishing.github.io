# AETERNUS International + Central Shop V1

Preparation branch only. No products, paid plans, public launch, DNS changes or redirects.

## Local preview

```powershell
npm ci
npm run build:international
npm run check:international
npm run preview:international
```

Open http://localhost:8092/. The two builds have separate inputs and outputs: existing `src/` → `public/`; international `international/` → `dist/international/`. The German production build command and GitHub Pages workflow are unchanged.

`check:international` builds the German site to `work/de-after/`, verifies all 119 HTML outputs against the pre-change SHA256 baseline at commit `6e6ac8d`, then validates the international build and closed commerce/language state. Rebaseline only after an intentional, reviewed German-site change; do not weaken the baseline to hide regressions. Build international first on a fresh checkout.

## Components

- `catalog/legacy/`: relocated, unchanged existing editorial source records, used by the German compatibility exports and international adapter.
- `catalog/index.cjs`: 12 existing English editions, source provenance, seven series, native Shopify URL gate.
- `catalog/schemas/book.schema.json`: future canonical edition contract; no new populated records.
- `international/`: layouts, catalogue/author/series templates, information pages, responsive CSS, local fonts/images and locale registry.
- `commerce/shopify-theme/`: original native Liquid theme; English/German interface strings; products and cart prepared; commerce off.
- `commerce/markets.json`: planned country/currency/domain map; `store-status.json`: separately recorded actual state.
- `commerce/metafields.json` and `product-mappings.json`: unused integration contracts for later authorized population.
- `docs/international/redirects.planned.json`: disabled migration map, real source/target routes checked.
- `deploy/netlify.international.toml`: optional separate-project configuration, not active in the German project.

## Verification and limits

44 generated HTML pages; local links/assets and unique canonicals checked, JSON-LD parsed, no ES/PL output, no direct-buy buttons, empty preview sitemap. Desktop home/detail and mobile home/menu/catalogue inspected in the browser. Shopify Theme Check 4.8.0 returned no findings. Empty shop home, collection and cart verified in the password-protected unpublished theme.

All 12 imported edition projections validated against the Draft 2020-12 schema with AJV CLI 5.0.0. AJV CLI did not validate the optional date format; the local test independently checks any non-null publication date. The installed `check-jsonschema.exe` was blocked by Windows application control; it was not altered. Temporary npm tools were fetched from the official npm registry, without changing repository dependencies. No paid provider calls or subscription changes.

The approved AETERNUS master wordmark is copied unmodified. SHA256: `f01eaa1bc4c3d59f9dd1df272cbf64507ff59b6d3169244be38e4070286a70da`.

Open launch work and multilingual expansion are described in [MIGRATION.md](MIGRATION.md). The shop's international publisher link points to the functioning old `/en/` site until launch. German shop language strings are ready in the theme; additional published store languages and market domains have not been configured.
