# Adding more tools

Small local-first utilities should use the shared tool runtime:

1. Add the tool metadata to `apps/browser-tools/catalog.mjs`.
2. Add unique task guidance, examples, limitations, and FAQs to
   `apps/browser-tools/content.mjs`.
3. Add task-specific scenarios, review advice, alternatives, privacy notes,
   and a checklist to `apps/browser-tools/editorial.mjs`.
4. Add a renderer to `apps/browser-tools/shared/app.js`.
5. Put independently testable transformations in `apps/browser-tools/shared/utilities.mjs`
   and add boundary and invalid-input tests under `tests/`.
6. Register the renderer by slug at the bottom of that file.
7. Add three relevant next steps in `apps/browser-tools/discovery.mjs` and
   review the generated title and description in `apps/browser-tools/seo.mjs`.
8. Run `npm test` and `npm run build`; the root build creates its page, canonical URL,
   redirect, sitemap entry, homepage card, and related-tool links.

Long-form editorial articles live in `apps/browser-tools/guides.mjs`. A guide
should answer a distinct workflow question, cite primary references, link to
the relevant tools, and include its own publication and update dates.

Use a separate `apps/<tool-slug>` workspace only when a tool needs a larger
framework-specific interface. Configure its production base as
`/tools/<tool-slug>/` and add its workspace output to `scripts/build-suite.mjs`.

## Current catalog

Prioritize utilities that can run locally in the browser. They are fast,
private, inexpensive to host, and require little maintenance.

### Developer

- JSON Fix, JSON Diff, and JSON String Escaper
- Number Base Converter using exact BigInt arithmetic
- Timestamp Converter
- JWT Decoder with an explicit no-verification warning
- Base64 Encoder
- Regex Tester
- UUID Generator
- Hash Generator using the browser Web Crypto API
- XML Formatter
- Cron Expression Inspector
- Password Generator using browser cryptographic randomness
- Date Calculator with date-only and weekday arithmetic

### Text

- Text Clean and Text Diff
- Case Converter
- Line Processor for sorting, trimming, numbering, and deduplication
- Word Counter with sentence, character, frequency, and reading-time statistics
- Markdown Preview with raw HTML disabled

### Image

- Color Spectrum
- Image Compressor and Image Resizer
- PNG/JPEG/WebP conversion
- Color Contrast Checker
- Image Metadata Remover

### Web

- URL Parser, URL Encoder, and UTM Link Builder
- CSV ↔ JSON Converter
- HTML Entity Encoder
- CSS Unit Converter

Tools that need secret API keys, cross-origin fetching, accounts, shared saved
data, or long-running processing should use `workers/api` instead of calling a
third-party service directly from the browser.
