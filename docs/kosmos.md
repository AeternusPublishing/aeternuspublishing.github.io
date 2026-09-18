# Bücherkosmos

`/kosmos/` is the full-screen literary atlas, linked from the homepage and both shared navigation layouts. The homepage uses a lightweight static illustration; D3 and the map only load on the atlas route.

`src/_data/kosmos.js` resolves titles, summaries, covers, availability and landing pages from the existing author and catalogue records at build time. Translations share one work node; separately published volumes have separate nodes. Grimm Band I comes from the existing fairy-tale landing page.

`kosmosSelection.json` supplies stable IDs, geographical points of reference and curated book-to-book connections. Coordinates describe a principal setting or cultural reference. Connections are thematic comparisons unless their reason explicitly names an influence or continuation. New author-page titles require geographical placement. Missing selections, covers, duplicate IDs or invalid connection endpoints fail the build. Books without a curated relation remain accessible without invented edges.

D3 7.9.0 (ISC), TopoJSON client 3.1.0 (ISC) and Natural Earth land from world-atlas 2.0.2 (public domain) are served locally. Attribution and licenses are in `src/assets/vendor/` and `src/assets/data/`. Exploring the atlas requires no third-party requests.

Run `npm run build`, `npm run check:kosmos`, and the existing text, author-order, editorial, page, hreflang and QR checks. Verify desktop and mobile navigation, focus, direct-neighbor connections, book details, Escape and reduced-motion behavior in the browser. Visitors without JavaScript can follow the catalogue link.
