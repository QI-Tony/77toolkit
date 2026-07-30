# Cloudflare Pages deployment

Deploy the complete toolkit as one Cloudflare Pages project. The root build
combines the homepage and all tools into one `dist` directory:

```text
dist/
├── index.html
├── 404.html
├── about/index.html
├── privacy/index.html
├── developer/index.html
├── text/index.html
├── image/index.html
├── web/index.html
├── editorial-policy/index.html
├── accessibility/index.html
├── site-map/index.html
└── tools/
    ├── _shared/
    ├── color-spectrum/index.html
    ├── image-compressor/index.html
    ├── json-fix/index.html
    ├── text-clean/index.html
    └── ... 25 more tool routes
```

Use these Pages settings:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Framework preset | `None` |
| Root directory | leave blank |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variable | `NODE_VERSION=22` |

## Connect the repository

Create or update the production Pages project:

1. Open **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
2. Select the `QI-Tony/77toolkit` repository.
3. Enter the build settings from the table above.
4. Select **Save and Deploy**.
5. Verify the generated `*.pages.dev` URL before moving the production domain.
6. Open **Custom domains** and attach `77toolkit.com`.

Every push to `main` now rebuilds the single Pages project. Preview branches
also receive all tool routes under their generated `*.pages.dev` URL.

## Retire the old subdomains

Keep the existing tool Pages projects online until the unified deployment is
verified. Then remove the custom-domain bindings and DNS records for
`color.77toolkit.com`, `jsonfix.77toolkit.com`, and
`textclean.77toolkit.com` in Cloudflare. Confirm that none of those hostnames
continues to serve an old `200` page. Keep `api.77toolkit.com` separate for the
shared Worker.
