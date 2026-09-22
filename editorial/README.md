# Historical context

`historical-themes.json` is the shared editorial source for both websites. The primary entity is a historical context, never a nationality. Green is the current navigation entry, not a filter hard-coded into the resolver. Book membership may later cross series without changing components or relocating books.

## Adding a theme

Add a unique stable `id`, independent DE/EN `locales` (slug, title, subtitle, body paragraphs, period, regions, keywords), `bookRefs` containing only existing catalogue IDs, and historical sources. Never copy cover, title, price, author or edition records here. The resolver returns the original catalogue objects and the existing book-card includes render them. Empty themes remain historical reading pages; no fictional editions or publication promises are created.

Both Eleventy builds automatically generate the directory, detail pages, counts, reverse book links and sitemap entries. DE routes follow `/reihen/gruen/historischer-hintergrund/`; international EN routes follow `/series/gruen/historical-background/`, preserving the established `gruen` series ID. Each page carries its own canonical and a reciprocal DE/EN hreflang pair. There is no parallel `/de` or `/en` architecture on the new sites.

`parentIds` permits multiple broader contexts and arbitrary depth; cycles fail the build. `relatedIds` represents editorial cross-links. These are distinct relationships. Region, actor and conflict IDs are metadata, not primary navigation categories. Numeric `period.start/end` supports future temporal filtering. Stable IDs should also be used for future geographic, route and event annotations. No topic count or national list is built into the components.

For example, American Civil War may have Western Theater and Vicksburg as child contexts; a memoir can reference several contexts. Tests exercise adding non-Empire parent/child topics without changing templates. These test fixtures are not public editorial content.

Optional `visuals` entries accept `src`, localized `alt`/`caption`, and explicit `width`/`height` for a local historical map, portrait or route plate. Images are lazy-loaded. Rich geographic coordinates or timeline events can be added to the same topic records and rendered by a future optional component. There is no mapping service, external script, paid API or new runtime dependency.

## Current editorial boundary

Six DE and six independently written EN texts, each 120–220 words. Sources appear beneath each panel's detail page. Florentia Sale's German diary is linked to Great Game and the frontier's antecedents; the frontier text explicitly distinguishes it from Tirah. Baden-Powell's Prempeh is linked to Ashanti. Abbott, Wilson, Kitchener, Markham, Rassam, Grant and other prospective editions are not invented as products. No verified English Green-Series book exists in the current international catalogue, so EN topics currently show an honest empty-edition state.

## Verification

Build both Eleventy targets. The historical QA script checks localized text length, routes, canonical/hreflang, links, original book object identity, reverse links, many-to-many mapping, future parent/child contexts and rejection of cycles or unknown book IDs. Re-run existing text, author-order and cosmos checks for the German deployment. Visual QA covers desktop and 390px mobile, navigation and keyboard access. Website publication does not authorize book publication or paid Shopify activation.
