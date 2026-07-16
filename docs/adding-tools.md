# Adding more tools

Create each new tool under `apps/<tool-slug>` with its own `package.json` and a
`build` script. Add matching `dev:<name>` and `build:<name>` scripts to the root
`package.json`, then add the production URL to `apps/home/script.js`.

## Recommended next tools

Prioritize utilities that can run locally in the browser. They are fast,
private, inexpensive to host, and require little maintenance.

### Developer

- URL encoder and decoder
- Base64 encoder and decoder
- Unix timestamp converter
- JWT inspector with an explicit no-verification warning
- Regex tester
- JSON ↔ CSV converter
- Hash generator using the browser Web Crypto API

### Text

- Word, character, sentence, and reading-time counter
- Case converter
- Text diff viewer
- Markdown preview
- Duplicate-line remover and line sorter

### Image

- Resize and crop
- Compress and compare file size
- PNG/JPEG/WebP conversion
- EXIF metadata viewer and remover

Tools that need secret API keys, cross-origin fetching, accounts, shared saved
data, or long-running processing should use `workers/api` instead of calling a
third-party service directly from the browser.

