# Shared catalogue

Both Eleventy sites read the same versioned catalogue directory. `legacy/` contains the existing editorial records without content edits; the old `_data` modules are compatibility exports, not second copies. Existing German and English author records still contain historical overlaps. V1 does not claim bibliographic deduplication of those legacy records.

`index.cjs` exposes an English edition read model with stable IDs, explicit source provenance, seven series and optional native Shopify mappings. An English interface does not establish the language of a book: the migration manifest excludes German editions advertised on English author pages. Additional series assignments for Hall, Beard and Jefferies follow their existing author-page labels.

`books/index.json` is intentionally empty: no new book/product data was entered. `schemas/book.schema.json` defines the future canonical edition contract. Unknown values remain null, not fabricated ISBNs, prices or release dates. Existing display-price strings are retained only as source metadata; they are not imported as Shopify prices.

Before future population, normalize approved records into this schema, resolve the corresponding legacy record by stable ID, and switch both compatibility adapters together. Do not append a second copy of an edition. Product creation/import is deliberately absent from V1. `commerce/product-mappings.json` will hold mappings only after the publisher authorizes population.

## Languages

Edition language, website interface language and market are separate concepts. `international/locales.json` reserves `/es/` and `/pl/`; neither is enabled or populated. More language entries can be added without changing the edition schema. `localization.cjs` rejects unavailable locales and requires explicit page equivalence for alternate links. Translation objects require editorial approval; never silently show English content under a Spanish/Polish URL.

For a future language: supply reviewed interface strings and page content, add localized templates/data, verify Latin Extended font coverage, set content readiness and enabled state, add reciprocal alternates only for actual equivalents, and test links/sitemap. The current site is an English preview, not a completed translation system.
