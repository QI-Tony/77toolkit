# Search and tool discovery

## Page metadata

`apps/browser-tools/seo.mjs` owns the homepage description and tool search
metadata. The homepage count comes from `toolCatalog`, so adding a tool cannot
leave an old number in the description. Original app builds receive the same
metadata normalization as shared tools during the suite build. The home Vite
plugin also applies it during local development.

Keep titles descriptive of existing functionality. Do not claim search volume,
ranking, exact compression targets, or capabilities that have not been verified.
The normalizer updates titles, descriptions, canonicals, and social metadata
while preserving unrelated head tags such as Search Console verification.

## Navigation and next steps

`apps/browser-tools/discovery.mjs` contains six task-based homepage entries,
three selected guides, and three related tools for each utility. These links
are rendered into HTML and remain usable without JavaScript. Tool inputs are
not transferred between pages or placed in link URLs.

When adding a tool, add a `relatedToolSlugs` entry with distinct, relevant
next steps. Cross-category links are useful when they match a real workflow.
The homepage uses selected guides rather than whichever articles happen to
appear first in the catalog. Guides include a table of contents and an early
link to their first related tool, when one exists.

## Verification

Run `npm test` and `npm run build:all`. The suite build checks:

- Unique titles and descriptions across the complete public page inventory.
- One canonical per indexable page matching its production route.
- Matching Open Graph and Twitter titles, descriptions, and sharing URL.
- Parseable JSON-LD, local assets, internal links, and complete sitemap coverage.
- No accidental noindex on public pages; the 404 remains noindex.
- No known advertising integrations or publisher authorization files.

Individual guide sitemap dates use their recorded `updated` date, matching
Article structured data. Update that field when the article changes materially.
Do not reset article dates merely because the site was rebuilt.

## Once Search Console has data

Compare pages and queries over consistent date ranges. Record impressions,
clicks, CTR, and position along with the page and device. Check indexing and
URL Inspection first when a priority page has no visibility. For pages with
impressions, use the actual query intent to improve the title, introduction,
examples, or tool behavior. Avoid interpreting a day or two of sparse data as
a reliable growth trend. This update adds no tracking scripts or data collection.

References:

- [Google: title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google: sitemap best practices and lastmod](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Search Console performance report](https://support.google.com/webmasters/answer/7576553)
