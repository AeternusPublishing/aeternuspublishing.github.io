# Preview and later migration

V1 is a local English preview. No production domain, redirect, canonical on the German site or existing `/en/` page has been changed. GitHub Pages currently serves the German domain; the separately connected Netlify project's builds are stopped and its credits are exhausted. Do not resume that project to preview this branch.

## Language routes

- English: `/` on `aeternuspublishing.com`.
- Spanish: reserved `/es/`, disabled, no pages or translations.
- Polish: reserved `/pl/`, disabled, no pages or translations.
- Additional locales: add a BCP47 language entry, content and reviewed interface strings; see `catalog/README.md`.
- German: existing `aeternus-verlag.de`, a separate build using the shared catalogue modules.

Book edition language is independent of website language. German and English editions may have different ISBNs and are not automatically hreflang equivalents. The explicit alternative-route helper excludes unready languages. There are no fabricated ES/PL hreflang links or entries in the preview sitemap.

## Launch gates (not executed)

1. Approve international content and final legal/privacy notices for the selected hosting and shop services. Legal/privacy pages are clearly preview notices, not final legal documents.
2. Select a separate international hosting project and preview it. Do not change the German project's publish directory or production build.
3. Configure the new main domain and verify HTTPS, routes, assets, accessibility and responsive views.
4. In a reviewed launch change, switch `site.preview`, robots meta, `_headers`, `robots.txt` and sitemap together. Current preview remains noindex/nofollow with an empty sitemap. The robots file disallows crawling; this is not access control. Use host authentication for a private external preview.
5. Add reciprocal hreflang only between reviewed equivalent pages; no automatic old `/en/` counterparts. Self-canonicals on the new site already use the intended domain.
6. After the new site is accepted, activate the reviewed 301 map from old English `.de` paths to the corresponding international page. Preserve incoming QR/book links and fragment targets. Keep unmapped pages live until an equivalent exists. Do not redirect all old URLs to the homepage.
7. Verify with HTTP status and final destination checks on the actual host. GitHub Pages does not offer native arbitrary HTTP 301 rules; the migration requires a suitable edge/hosting redirect layer. The planned JSON is not an executable Pages redirect configuration.

## One native Shopify store

Store: `aeternus-central-commerce-hhg0ucrd.myshopify.com`, display name AETERNUS CENTRAL COMMERCE. Created as a free **client transfer** store, suitable for building a store that can later be transferred/activated; no paid plan selected. Shopify's current standalone dev stores are for testing and are not the transferable-store type. See [client transfer stores](https://shopify.dev/docs/apps/build/stores/client-transfer-stores) and [dev stores](https://shopify.dev/docs/apps/build/stores/development-stores).

Target domains: `shop.aeternus-verlag.de` and `shop.aeternuspublishing.com`; not connected yet. The domain/language/market mapping depends on the eventual plan, payments and market setup. Do not promise separate canonical market hosts before validating Shopify's domain behavior. See [international domains](https://help.shopify.com/en/manual/international/managing-international-domains).

`commerce/markets.json` is the desired plan, not a dump of the admin state. `commerce/store-status.json` records what was actually observed. All international market drafts currently inherit EUR; USD/GBP/CAD/AUD are future target currencies, not activated payment configurations. Rest of World awaits a shipping-country decision and remains configuration-only.

Theme uses native Liquid product, localization, password and cart forms. No Storefront API keys, private app, headless checkout or paid extensions. The theme's commerce switch defaults off; this is a preparation aid, not a substitute for Shopify's password protection or access controls. The shop has no products, so checkout/variant behavior cannot yet be tested end to end. Product population and the real-title transaction test were explicitly excluded by the publisher.

`commerce/metafields.json` specifies future links from shop products back to author/series/edition/sample pages. It is not applied to the store. `commerce/product-mappings.json` is empty. No imports or distribution integration run in V1.

Theme validation: [Shopify Theme Check](https://shopify.dev/docs/api/shopify-cli/theme/theme-check), CLI 4.8.0, read-only check, no findings.
