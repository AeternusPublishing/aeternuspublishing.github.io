# International website: live release, 22 September 2026

This supersedes the preparation-only deployment state in the original V1 report.

## Public website

- Canonical domain: https://aeternuspublishing.com
- Hosting: Cloudflare Pages, project `aeternus-international`, direct upload on the existing free account.
- Additional hostname: `www.aeternuspublishing.com`, same canonical URLs.
- German GitHub Pages production and historic `/en/` routes remain unchanged. Migration redirects are still disabled pending individual content and fragment equivalence checks.
- 17 English catalogue titles, including five additional Seton editions; status and retailer details use the shared legacy catalogue plus a versioned English register projection. 50 HTML pages.
- `catalog/english-register.snapshot.json` is a projection of the canonical house register, not a second editable book register. Refresh from the register; do not hand-maintain its ISBNs or publication states.
- `catalog/english-additions.json` contains existing English editorial descriptions with source references. No books or artwork were manufactured in this task.
- Four uploaded Roosevelt volumes in the canonical register are not imported: they are outside the existing English website author/edition records and have no verified live state in this release.

## Build and release

Run `npm run build:international:production`. The production output is `dist/release` and does not share the local preview server's output directory. Production emits an open robots file, a populated sitemap, canonical URLs, and no preview noindex headers. The default build/preview remains noindex.

Validate with `AETERNUS_SITE_MODE=production node scripts/check-international.cjs` (PowerShell: set `$env:AETERNUS_SITE_MODE='production'` first). The German baseline build under `work/de-after` is required by this check.

Zip the **contents** of `dist/release`, then use Cloudflare Pages → project → Create deployment → Production → upload ZIP → Save and deploy. Wait for ZIP expansion: the dashboard can briefly report the ZIP as an oversized individual file before confirming all unpacked files uploaded. No individual asset in this release exceeds 25 MB. Verify the canonical domain after deployment.

## Brand and editorial claims

Publisher-approved positioning appears in the hero, before the catalogue, in primary navigation, and on `/why-aeternus/`: handpicked literary landmarks, highest editorial/visual standards as a commitment, carefully renewed language and syntax in selected editions, preservation of meaning without censorship, restored or newly created imagery and edition-specific paratexts. German origin refers to Germany's literary tradition, not an invented long corporate history. No unsupported exclusive market claim is made. Feedback and reissue suggestions use direct email links.

## Instagram

`catalog/social.json` is the sole website profile/post map. English account: `aeternus.publishing`. Thirteen existing posts are linked to their book pages; three are featured on the homepage. Live post embeds load only after an explicit visitor click. No Meta API, automatic feed, publishing automation or paid widget is used. The publisher explicitly selected linking existing content only.

The English Instagram biography now includes `aeternuspublishing.com`. Instagram's desktop editor explicitly restricts the separate clickable Website field to its mobile app. The biography address is plain text; do not report that field as updated.

## Shopify

Store: `aeternus-central-commerce-hhg0ucrd.myshopify.com`. Fifteen products and 41 format variants were imported and observed in the admin as drafts with zero sales channels and zero tracked inventory. IDs are in `commerce/product-mappings.json`. The unpublished AETERNUS theme was updated with the live publisher URL, Why AETERNUS and language-specific Instagram links.

No selling price is configured. Import prices of 0.00 are administrative placeholders on unpublished drafts, **not free products or customer offers**. Retailer prices in the house register have mixed currencies and sometimes net values; they must not be copied into EUR checkout prices. Direct prices, fulfillment, shipping, digital delivery, policies, taxes and a specifically authorized paid plan remain prerequisites for direct selling. The website already offers the known retailer links independently of Shopify. No paid plan or extension was purchased.

## Languages

English is published. Spanish and Polish remain prepared but disabled; other BCP47-compatible languages can be added through the same configuration. There are no empty translated pages or automatic translation claims.
