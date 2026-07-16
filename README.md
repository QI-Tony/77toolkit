# 77 Toolkit

77 Toolkit is a collection of lightweight, privacy-friendly browser tools. This
monorepo contains the public homepage, every tool, and shared Cloudflare
services.

## Projects

| Workspace | Domain | Description |
| --- | --- | --- |
| `apps/home` | `77toolkit.com` | Toolkit navigation and product homepage |
| `apps/color-spectrum` | `color.77toolkit.com` | Extract and analyze colors from images |
| `apps/json-fix` | `jsonfix.77toolkit.com` | Repair and format malformed JSON |
| `apps/text-clean` | `textclean.77toolkit.com` | Remove formatting from copied text |
| `workers/api` | `api.77toolkit.com` | Optional shared backend for future tools |

## Local development

Use Node.js 22 or newer. If you use `nvm`, run `nvm use` from the repository
root. Install all workspace dependencies once:

```bash
npm install
```

Run one site at a time:

```bash
npm run dev:home
npm run dev:color
npm run dev:json
npm run dev:text
```

Build every site and validate the Worker bundle:

```bash
npm run build
```

## Cloudflare

- [Deploy the four sites with Cloudflare Pages](docs/cloudflare-pages.md)
- [Add backend features with Cloudflare Workers](docs/cloudflare-workers.md)
- [Plan and add more tools](docs/adding-tools.md)

The four original repositories are unchanged. Their histories were imported
into the corresponding `apps/*` directories.
