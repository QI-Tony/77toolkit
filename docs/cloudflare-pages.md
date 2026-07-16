# Cloudflare Pages deployment

Cloudflare Pages supports multiple Pages projects connected to the same Git
repository. Keep four distinct Pages projects so that every site retains its
own domain, deployment history, and preview URL.

Use **Build System V2 or later**. Leave the Pages root directory at the
repository root and configure each project as follows:

Set the environment variable `NODE_VERSION` to `22` for both production and
preview builds.

| Pages project | Production domain | Build command | Output directory | Build watch include paths |
| --- | --- | --- | --- | --- |
| `77toolkit-home` | `77toolkit.com` | `npm run build:home` | `apps/home/dist` | `apps/home/*, package.json, package-lock.json` |
| `77toolkit-color` | `color.77toolkit.com` | `npm run build:color` | `apps/color-spectrum/dist` | `apps/color-spectrum/*, package.json, package-lock.json` |
| `77toolkit-json` | `jsonfix.77toolkit.com` | `npm run build:json` | `apps/json-fix/dist` | `apps/json-fix/*, package.json, package-lock.json` |
| `77toolkit-text` | `textclean.77toolkit.com` | `npm run build:text` | `apps/text-clean/dist` | `apps/text-clean/*, package.json, package-lock.json` |

## Connect the repository

For each Pages project:

1. Open **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**.
2. Select the new monorepo. A single repository can be selected repeatedly.
3. Enter the build command and output directory from the table above.
4. After the first successful deployment, open **Custom domains** and attach
   the corresponding production domain.
5. Under **Settings → Build → Build watch paths**, enter the include paths from
   the table. This prevents an unrelated tool change from rebuilding every
   Pages project.

Do not move the existing production domain until the corresponding new Pages
project has a successful preview deployment. Move one domain at a time and test
it before continuing.

## Project limit and future tools

Cloudflare currently allows up to five Pages projects connected to one
repository by default. These four projects therefore leave room for one more.
For a larger catalog, choose one of these approaches:

- publish related small tools under paths in one Pages project, such as
  `77toolkit.com/tools/timestamp`;
- request a Pages project limit increase from Cloudflare; or
- deploy additional tools with Workers Static Assets.
