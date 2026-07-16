# Adding more tools

Small local-first utilities should use the shared tool runtime:

1. Add the tool metadata to `apps/browser-tools/catalog.mjs`.
2. Add unique task guidance, examples, limitations, and FAQs to
   `apps/browser-tools/content.mjs`.
3. Add a renderer to `apps/browser-tools/shared/app.js`.
4. Register the renderer by slug at the bottom of that file.
5. Run `npm run build`; the root build creates its page, canonical URL,
   redirect, sitemap entry, homepage card, and related-tool links.

Use a separate `apps/<tool-slug>` workspace only when a tool needs a larger
framework-specific interface. Configure its production base as
`/tools/<tool-slug>/` and add its workspace output to `scripts/build-suite.mjs`.

## Current catalog

Prioritize utilities that can run locally in the browser. They are fast,
private, inexpensive to host, and require little maintenance.

### Developer

- JSON Fix and JSON Diff
- Timestamp Converter
- JWT Decoder with an explicit no-verification warning
- Base64 Encoder
- Regex Tester
- UUID Generator
- Hash Generator using the browser Web Crypto API

### Text

- Text Clean and Text Diff
- Case Converter
- Line Processor for sorting, trimming, numbering, and deduplication
- Word Counter with sentence, character, frequency, and reading-time statistics

### Image

- Color Spectrum
- Image Compressor and Image Resizer
- PNG/JPEG/WebP conversion
- Color Contrast Checker
- Image Metadata Remover

Tools that need secret API keys, cross-origin fetching, accounts, shared saved
data, or long-running processing should use `workers/api` instead of calling a
third-party service directly from the browser.
