# 77 Toolkit：跨机器 AI 项目交接

> 整理日期：2026-11-11（Asia/Shanghai）。本文件根据本地源码、仓库文档与此前开发记录整理。
> 核对的功能代码基线：`8f78e1a40e6f47d8b918255a7eb131cd29272b87`，分支 `main`。
> 本次没有读取 Search Console、查询 Cloudflare 控制台或重新验证生产站点。请勿把历史测试、部署观察当成当前线上状态。

## 1. 给接手 AI 的快速摘要

这是 **77 Toolkit**，一个免费、无广告、无需注册、优先在浏览器本地处理数据的在线工具集合。

- GitHub：<https://github.com/QI-Tony/77toolkit>
- 主站：<https://77toolkit.com/>
- 技术架构：npm workspaces + Vite；三个独立工具应用 + 共享原生 JavaScript 工具运行时；Node 脚本统一生成静态站点。
- 当前内容：32 个工具（29 个共享工具 + 3 个独立应用）、12 篇指南、57 个可索引页面；另有不索引的 404 页面。
- 部署设计：根目录 `dist/` 发布至 Cloudflare Pages；独立 API Worker 预留给未来服务端功能。
- 用户明确要求：取消广告联盟，改善网站体验、增加实用工具，并提高访问量。此前功能改动已提交并推送 GitHub。
- 最近完成：去广告、三个新工具、首页收藏与搜索、任务入口、相关工具推荐、指南导航、统一搜索元数据及构建校验。
- 当前主要待办：核实最新部署和 Search Console 数据，根据真实查询词与页面表现决定下一轮优化。

接手时先确认仓库根目录、Git 状态和远端差异，再读本文件与实际源码。代码可能在文档整理之后继续变化。

## 2. 找对仓库，不要误改旧项目

原机器的工作区父目录是 `/Users/qizhang/Work/77toolkit`，实际 Git 仓库在其下的 `77toolkit-monorepo/`。
父目录同时保留了 `77-json-fix/`、`77toolkit-home/`、`format-remove/`、`startup_example/` 等早期项目副本。
当前统一站点应修改 **monorepo 的 `apps/*`**，不是那些旁边的旧副本，也不是构建产物。

另一台机器直接克隆 GitHub 仓库后，克隆目录本身就是仓库根目录，不必再寻找名为 `77toolkit-monorepo` 的子目录。

```bash
git clone https://github.com/QI-Tony/77toolkit.git
cd 77toolkit
git rev-parse --show-toplevel
git remote -v
git status --short
git log -5 --oneline
```

已有工作副本时先检查未提交修改，再根据任务同步远端；不要覆盖其他人的改动。本次核对时工作区在编写此文档前是干净的，未发现适用的 `AGENTS.md`；接手时仍应重新查找。

## 3. 产品方向与用户偏好

1. **保持无广告。** 用户明确表示弹窗和广告联盟令人厌烦。不要恢复旧广告代码、`ads.txt` 或为了增加访问量重新接入广告。
2. **本地处理与隐私是卖点。** 不要上传用户粘贴的文本、JWT、图片、文件；不要把工具输入写入 URL 或统计事件。确实需要服务端的新功能，应明确其数据处理方式。
3. **实用性优先。** 增加能完成真实任务的工具，保留明确的错误提示、限制、示例和复制/下载能力。
4. **对用户用中文交流；站点目前主要为英文。** 少数原有界面有中文切换，但尚未建设完整中文站点。不要擅自把整站内容换成中文。
5. **增长目标尚未量化。** 没有已确认的日访问量、关键词搜索量、转化率或增长结果，不应编造。
6. 历史开发请求包含提交并推送 GitHub。继续工作时结合当前任务范围与授权处理提交；GitHub 推送成功不等于 Cloudflare 已部署成功。

## 4. 结构与技术栈

| 路径 | 职责 / 技术 |
| --- | --- |
| `apps/home/` | 首页；HTML、CSS、原生 JS、Vite；搜索、筛选、收藏、任务入口 |
| `apps/json-fix/` | JSON 修复；Vue 3、TypeScript、Tailwind CSS、`jsonrepair`；构建先运行 `vue-tsc` |
| `apps/color-spectrum/` | 图片取色、调色板提取与导出；Vue 3、Vite |
| `apps/text-clean/` | 清理复制文本、Markdown 风格格式；HTML、CSS、原生 JS、Vite |
| `apps/browser-tools/` | 29 个小工具共用的数据、说明、SEO 配置及运行时；没有独立 `package.json` |
| `scripts/build-suite.mjs` | 全站构建入口；组合独立应用并生成工具页、指南、分类、信息页、sitemap 等 |
| `scripts/validate-ad-free.mjs` | 拒绝已知广告标记及 `ads.txt` |
| `scripts/validate-search.mjs` | 校验 canonical、元数据、JSON-LD、sitemap 和资源路径 |
| `tests/` | Node 内置测试运行器的 `.test.mjs` 测试 |
| `workers/api/` | Cloudflare Worker 骨架；当前只有 `GET /api/health` 和 OPTIONS/CORS 处理 |
| `.github/workflows/verify.yml` | main 推送与 PR 的安装、测试、完整构建检查 |
| `docs/` | 新增工具、无广告约定、搜索优化、Pages / Workers 部署说明 |

全站不是一个统一的 Vue SPA，也没有统一路由器。路由主要由静态目录及构建脚本产生。
原有三个应用保留各自代码和样式；共享工具集中在一个按 slug 分发的原生 JS 运行时。

### 最重要的共享文件

| 文件 | 修改时的作用 |
| --- | --- |
| `apps/browser-tools/catalog.mjs` | 工具清单：slug、名称、分类、标签、描述、`existing/shared` 实现类型 |
| `apps/browser-tools/content.mjs` | 分类文案；每个工具的介绍、步骤、示例、原理、限制、FAQ |
| `apps/browser-tools/editorial.mjs` | 场景、结果复核建议、替代方案、隐私说明、检查清单、关联指南 |
| `apps/browser-tools/guides.mjs` | 12 篇指南的内容、参考资料、关联工具、发布日期和更新日期 |
| `apps/browser-tools/seo.mjs` | 首页及工具页搜索元数据；`applyPageMetadata` 统一 title、描述、canonical 和分享标签 |
| `apps/browser-tools/discovery.mjs` | 6 个首页任务入口、3 篇精选指南、每个工具的 3 个相关工具 |
| `apps/browser-tools/shared/app.js` | 工具 UI 和多数处理逻辑；末尾 `renderers` 通过 slug 选择渲染函数 |
| `apps/browser-tools/shared/utilities.mjs` | 新增三个工具的可独立测试逻辑：进制转换、JSON 字符串处理、UTM URL |
| `apps/browser-tools/shared/styles.css` | 共享工具界面样式 |
| `apps/browser-tools/shared/content.css` | 说明、指南、信息页及相关工具区域样式，也会注入独立应用 |
| `apps/home/vite.config.js` | 首页 HTML 转换；注入任务入口、动态工具数量和元数据 |
| `apps/home/script.js` | 搜索、分类、收藏和快捷键；收藏仅保存工具 slug |

## 5. 当前工具清单

工具地址统一为 `/tools/<slug>/`。以 `catalog.mjs` 为最终依据。

| 分类 | 数量 | slug |
| --- | ---: | --- |
| Developer | 14 | `json-fix`, `json-diff`, `json-string`, `number-base`, `timestamp`, `jwt-decoder`, `base64`, `regex-tester`, `uuid-generator`, `hash-generator`, `xml-formatter`, `cron-inspector`, `password-generator`, `date-calculator` |
| Text | 6 | `text-clean`, `text-diff`, `case-converter`, `line-processor`, `word-counter`, `markdown-preview` |
| Image | 6 | `color-spectrum`, `image-compressor`, `image-resizer`, `image-converter`, `contrast-checker`, `metadata-remover` |
| Web | 6 | `url-parser`, `url-encoder`, `csv-json-converter`, `html-entities`, `css-unit-converter`, `utm-builder` |

其中 `json-fix`、`color-spectrum`、`text-clean` 是独立应用，其他走共享运行时。
图片压缩、缩放、转换、去元数据复用 `renderImageTransform(mode)`。

新工具的关键边界：

- `number-base`：BigInt 精确整数转换，支持 2–36 进制，输入最多 4,096 个数字；不支持小数、科学计数法和固定宽度补码。
- `json-string`：对单个字符串进行 JSON 转义/还原；还原时拒绝对象、数组、数值等非字符串 JSON；最多 1,000,000 个 UTF-16 代码单元。
- `utm-builder`：只接受 HTTP(S) 地址，拒绝 URL 中的用户名/密码；source、medium、campaign 必填；保留其他查询参数和 fragment，移除留空的 term/content；不访问目标网址。
- JWT 解码不验证签名；Base64 不是加密；Markdown 预览不执行粘贴的原始 HTML。界面与说明不应夸大这些工具的能力。

## 6. 构建与运行

项目要求 Node.js **22 或更新版本**；`.nvmrc`、`.node-version`、CI 与 Pages 文档选择 Node 22。
使用 npm 与仓库现有的 `package-lock.json`。

```bash
# 在仓库根目录；已安装 nvm 时可用 nvm use
node --version
npm ci
npm test
npm run build:all
npm run preview -- --host 127.0.0.1
```

`npm run preview` 预览根目录完整构建，通常使用 Vite 的 4173 端口，以终端实际输出为准。
验证整个网站时使用完整构建预览；仅运行 `dev:home` 无法提供全部生成的工具页和指南路由。

| 命令 | 用途 |
| --- | --- |
| `npm run dev:home` | 首页开发 |
| `npm run dev:json` / `dev:color` / `dev:text` | 三个独立应用开发 |
| `npm run dev:api` | Wrangler 本地 Worker |
| `npm test` | Node 单元与回归测试 |
| `npm run build` / `build:suite` | 生成完整 Pages 静态站点 |
| `npm run build:all` | 完整站点 + Worker dry-run 构建；不发布 Worker |
| `npm run build:api` | Worker dry-run 构建 |
| `npm run deploy:api` | 实际部署 Worker；不是前端发布命令 |

### 全站构建过程

1. 清理根目录 `dist/`，依次构建首页、Color Spectrum、JSON Fix、Text Clean。
2. 把独立应用输出复制到统一站点对应目录。
3. 复制共享运行时，生成带内容哈希的共享 JS/CSS/模块文件；重写 app 对 utilities 的 import。
4. 生成共享工具页面，并给独立应用注入说明、相关工具、元数据和必要的页脚。
5. 向首页注入静态工具目录与精选指南，生成分类页、指南页及信息页。
6. 生成 `404.html`、`_redirects`、`sitemap.xml`、`robots.txt`。
7. 运行内容完整性、内部链接、无广告与搜索配置检查。

不要直接修改 `dist/` 或 `apps/*/dist/`，下次构建会覆盖。新增共享模块时注意哈希资源及模块引用路径，避免只在源目录可用、部署后 404。

## 7. 已完成的工作和历史验证

### `c2a6784`：去广告与工具扩展

- 移除全站弹窗 / 悬浮广告脚本和两个旧 `ads.txt`；更新相关站点声明。
- 新增进制转换、JSON 字符串转义/还原、UTM 链接生成，工具从 29 个增加到 32 个。
- 首页增加多关键词搜索、可保留在 URL 中的分类/搜索状态、收藏，以及 `/` 搜索和 Esc 清空快捷键。
- 增加广告回归检查与 GitHub Actions。

### `8f78e1a`：搜索与导航优化

- 统一工具页标题、描述、canonical、Open Graph / Twitter 元数据；保留无关 head 标签，例如 Search Console 验证标签。
- 首页工具数量动态生成，修复旧“29 个工具”描述；增加 6 个按任务描述的入口。
- 首页精选指南改为 JSON 修复、图片格式压缩、URL 编码三个主题。
- 每个工具配置 3 个相关工具；指南增加目录及工具直达链接。
- 增加 57 个页面的搜索配置检查；指南 sitemap 日期使用对应文章的 `updated`。

上述两次提交在此前会话中已成功推送 `main`。本次本地功能代码仍为 `8f78e1a`，没有据此推断远端或生产环境完全相同。

**2026-09-21 的历史验证结果：** 21 项 Node 测试通过，完整站点和 Worker dry-run 构建通过，57 个页面的构建校验通过；Chrome 验证了桌面/390px 手机布局、任务入口、指南目录、相关工具、搜索收藏、部分转换及无 JS 导航，没有观察到页面异常或外部请求。

这些浏览器检查使用过本机临时脚本，并非仓库内已有的完整 Playwright CI 套件。另一台机器需要自行安装或使用可用的浏览器测试环境。本次文档交接没有重跑上述功能测试。

## 8. 添加或修改功能的操作地图

新增共享工具时，应同步完成：

1. 在 `catalog.mjs` 添加唯一 slug、分类和描述。
2. 在 `content.mjs`、`editorial.mjs` 添加完整、针对该工具的说明。
3. 在 `shared/app.js` 添加界面并注册到末尾 `renderers`；可独立测试的转换逻辑放入适当模块。
4. 在 `discovery.mjs` 配置 3 个不同且有效的相关工具；复核 `seo.mjs` 的标题与描述。
5. 根据行为添加有意义的边界、错误输入和回归测试，验证复制/下载、清空、错误后结果状态与手机布局。
6. 运行 `npm test`、`npm run build:all`，在完整站点预览中验证。

新增独立框架应用还需配置 `/tools/<slug>/` 的构建 base，并加入 `build-suite.mjs` 的工作区输出合并列表。

目前构建器会检查工具说明至少 300 词、指南可读内容至少 450 词。这是**现有实现中的项目校验**，不是 Google 排名要求；不要为了通过检查填充无用文字。如需调整该规则，应作为明确的维护改动处理。

首页分享链接中的 `q`、`category`、`saved` 是筛选状态；canonical 始终指向首页。收藏存储键为 `77toolkit:favorites`，仅保存工具 slug；存储被禁用时界面有降级提示。

## 9. 测试与自动检查的位置

| 文件 | 覆盖内容 |
| --- | --- |
| `tests/utilities.test.mjs` | 大整数精度、进制边界、Unicode/转义、非法 JSON 字符串、UTM 参数与不安全地址 |
| `tests/ad-free.test.mjs` | 广告脚本、打包 JS 广告标记、`ads.txt` 的拒绝行为 |
| `tests/discovery.test.mjs` | 工具关系、精选入口、元数据覆盖、验证标签保留、canonical/noindex/分享标签/JSON-LD 检查 |
| `scripts/build-suite.mjs` | slug 与渲染器、说明覆盖、路由、元数据数量、内容长度等 |
| `scripts/validate-search.mjs` | 页面标题/描述唯一性、canonical、分享标签一致性、资源、sitemap、robots、404 noindex |

CI 在 main 推送和 PR 上使用 Node 22，执行 `npm ci`、`npm test`、`npm run build:all`。
不要把“代码中配置了 CI”写成“最新远端 CI 已通过”；需查看对应提交的运行结果。

## 10. 部署与外部服务：设计和已确认状态要分开

Pages 文档中的目标设置：生产分支 `main`，仓库根目录留空，构建命令 `npm run build`，输出目录 `dist`，`NODE_VERSION=22`。
在 Git 集成配置正确时，推送 main 应触发部署；是否触发、构建是否成功、域名实际指向哪个项目，需要检查 Cloudflare。

2026-09-21 最后一次发布后观察：生产首页 HTTP 200，未发现已知广告标记，但仍是旧标题，尚未出现最新任务入口。**这是历史观察，不是 2026-11-11 的现状结论。**

`workers/api` 当前只有健康检查骨架，没有用户账号、上传服务或生产数据存储。`api.77toolkit.com` 的实际绑定、Worker 是否部署、旧子域名是否退役，本次均未核实。前端工具不依赖该 Worker 完成本地转换。

用户曾告知已配置 Google Search Console，最初预计需要一两天看到统计。现在不要继续假设统计为空；下一轮应获取当前可用数据。仓库和本文件不包含 Search Console 数据、Cloudflare 凭据或 GitHub 密钥，也不能从本机曾经登录推断另一台机器已获授权。

## 11. 后续方向（建议，尚未完成）

| 优先级 | 工作 | 前提 / 验收方向 |
| --- | --- | --- |
| 高 | 核对生产版本与部署 | 比对 main 提交、Cloudflare 构建与线上任务入口/元数据；检查广告请求是否仍为零 |
| 高 | 分析 Search Console | 获取查询词、页面、展示、点击、CTR、排名、国家/设备和收录情况；优先找有展示低点击的页面 |
| 中 | 强化图片压缩 | 曾讨论按目标体积（如 200KB）、批量处理、打包下载；当前不能宣称这些功能已经实现 |
| 中 | 深化重点工具 | 围绕 JSON 修复、文本清理完善真实案例、修复差异或场景预设；先查现有实现再决定补什么 |
| 中 | 案例内容与推广 | 曾建议开发者社区实操演示与 UTM 区分渠道；尚未在本会话中对外发布推广内容 |
| 待数据支持 | 中文版本 | 可从少量重点工具开始完整本地化、独立 URL 与语言标注；目前没有完整中文站点 |

没有已实现的工具操作统计系统；没有经过验证的流量增长结果。新增统计或外部服务前，需要明确采集范围，保持与本地处理承诺一致。

## 12. 推荐阅读顺序和接手提示词

先读本文件，再读 [README](README.md)、[新增工具流程](docs/adding-tools.md)、[搜索与导航规则](docs/search-and-discovery.md)、[无广告约定](docs/ad-free.md)。
涉及发布时再读 [Cloudflare Pages](docs/cloudflare-pages.md) 与 [Cloudflare Workers](docs/cloudflare-workers.md)。

可把下面这段话和本文件一起交给另一台机器上的 AI：

```text
请先阅读仓库根目录的 PROJECT_HANDOFF.md，并核对当前源码、AGENTS.md、
Git 分支、远端和工作区改动。这个项目是 QI-Tony/77toolkit，目标是维护
免费、无广告、优先本地处理的在线工具站，并根据真实数据提高访问量。
实际代码在当前 Git 仓库的 apps、scripts、workers 中，不要修改旁边旧项目
或直接编辑 dist。区分历史验证和当前线上状态，不要恢复广告或臆造统计。
理解后，请针对我接下来给出的任务执行，并报告改动、验证及部署状态。
```
