# Books and historical themes

The full-page atlas and the network are now two views of one explorer at
`/kosmos/netzwerk/` (DE) and `/book-universe/` (EN). The old DE `/kosmos/`
entry also opens the unified explorer. All original atlas coordinates and
curated relationships are preserved. See `docs/kosmos.md` for recovery evidence.
`library-graph.json` is a generated, portable read projection, not a second
editorial catalogue. Regenerate it in the international source branch with
`node scripts/build-library-graph.cjs` after catalogue or historical-theme changes.
It reads the existing DE catalogue, EN catalogue, atlas selection and theme
registry. Copy the generated JSON and shared renderer/assets to the DE branch.
Never edit book titles or associations in the projection. Run
`node scripts/check-library-graph.cjs` on both branches; it rejects missing
current catalogue entries, missing theme memberships and lost curated edges.

Edge types distinguish authorship, publishing-series membership, historical
context, curated book relationships, related themes and parent themes. No
editorial relationship is inferred from shared geography or nationality.
Historical themes without published editions are retained. Missing covers
use the book node symbol; no synthetic product or availability claim is made.

The graph uses the already bundled D3, loaded only on the network page.
The static directory is usable without JavaScript. Search, edition-language
filter, zoom buttons, keyboard activation and Escape/reset supplement the SVG.
Original German editorial relation notes are marked as German in the EN view.
