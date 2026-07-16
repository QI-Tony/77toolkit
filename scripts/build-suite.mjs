import { access, cp, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { toolCatalog } from "../apps/browser-tools/catalog.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(repositoryRoot, "dist");

const sites = [
  {
    label: "home",
    workspace: "@77toolkit/home",
    source: "apps/home/dist",
    target: "dist",
  },
  {
    label: "color spectrum",
    workspace: "@77toolkit/color-spectrum",
    source: "apps/color-spectrum/dist",
    target: "dist/tools/color-spectrum",
  },
  {
    label: "JSON fix",
    workspace: "@77toolkit/json-fix",
    source: "apps/json-fix/dist",
    target: "dist/tools/json-fix",
  },
  {
    label: "text clean",
    workspace: "@77toolkit/text-clean",
    source: "apps/text-clean/dist",
    target: "dist/tools/text-clean",
  },
];

function runWorkspaceBuild(workspace) {
  const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand, ["run", "build", `--workspace=${workspace}`], {
      cwd: repositoryRoot,
      env: process.env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Build failed for ${workspace} with exit code ${code}.`));
    });
  });
}

async function copyDirectoryContents(source, target) {
  await access(source);
  await mkdir(target, { recursive: true });

  const entries = await readdir(source, { withFileTypes: true });
  await Promise.all(
    entries.map((entry) =>
      cp(path.join(source, entry.name), path.join(target, entry.name), {
        recursive: entry.isDirectory(),
        force: true,
      }),
    ),
  );
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function createToolPage(tool) {
  const related = toolCatalog
    .filter((candidate) => candidate.category === tool.category && candidate.slug !== tool.slug)
    .slice(0, 3);
  const relatedCards = related
    .map(
      (candidate) => `
          <a class="related-card" href="/tools/${escapeHtml(candidate.slug)}/">
            <strong>${escapeHtml(candidate.name)}</strong>
            <span>${escapeHtml(candidate.description)}</span>
          </a>`,
    )
    .join("");
  const config = JSON.stringify(tool).replaceAll("<", "\\u003c");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${escapeHtml(tool.description)} Runs locally in your browser.">
    <meta name="theme-color" content="#f5f7f9">
    <title>${escapeHtml(tool.name)} — 77 Toolkit</title>
    <link rel="canonical" href="https://77toolkit.com/tools/${escapeHtml(tool.slug)}/">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3812186991635556" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="/tools/_shared/styles.css">
  </head>
  <body>
    <header class="site-header">
      <nav class="nav" aria-label="Primary navigation">
        <a class="brand" href="/" aria-label="77 Toolkit home"><span class="brand-mark">77</span><span class="brand-name">77 Toolkit</span></a>
        <div class="nav-links"><a href="/#tools">All tools</a><a href="/#developer">Developer</a><a href="/#text">Text</a><a href="/#image">Image</a></div>
      </nav>
    </header>
    <main class="page">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">77 Toolkit</a><span>/</span><a href="/#${tool.category.toLowerCase()}">${escapeHtml(tool.category)}</a><span>/</span><span>${escapeHtml(tool.name)}</span></nav>
      <section class="tool-hero" aria-labelledby="tool-title">
        <div><span class="category-label">${escapeHtml(tool.category)} tool</span><h1 id="tool-title">${escapeHtml(tool.name)}</h1><p class="tool-description">${escapeHtml(tool.description)}</p></div>
        <aside class="privacy-note"><strong>Private by default</strong>Your text, tokens, files, and images stay in this browser tab.</aside>
      </section>
      <div class="workspace" id="tool-root"><noscript><section class="tool-panel"><p>This tool requires JavaScript to run locally in your browser.</p></section></noscript></div>
      <section class="related-section" aria-labelledby="related-title"><h2 id="related-title">More ${escapeHtml(tool.category)} tools</h2><div class="related-grid">${relatedCards}</div></section>
    </main>
    <footer class="site-footer"><p>© 2026 77 Toolkit</p><p>Local-first browser utilities.</p></footer>
    <script id="tool-config" type="application/json">${config}</script>
    <script type="module" src="/tools/_shared/app.js"></script>
  </body>
</html>
`;
}

await rm(outputRoot, { recursive: true, force: true });

for (const site of sites) {
  console.log(`\nBuilding ${site.label}...`);
  await runWorkspaceBuild(site.workspace);
  await copyDirectoryContents(
    path.join(repositoryRoot, site.source),
    path.join(repositoryRoot, site.target),
  );
}

await copyDirectoryContents(
  path.join(repositoryRoot, "apps/browser-tools/shared"),
  path.join(outputRoot, "tools/_shared"),
);

for (const tool of toolCatalog.filter((candidate) => candidate.implementation === "shared")) {
  const toolDirectory = path.join(outputRoot, "tools", tool.slug);
  await mkdir(toolDirectory, { recursive: true });
  await writeFile(path.join(toolDirectory, "index.html"), createToolPage(tool));
}

await writeFile(
  path.join(outputRoot, "_redirects"),
  [...toolCatalog.map((tool) => `/tools/${tool.slug} /tools/${tool.slug}/ 301`), ""].join("\n"),
);

await writeFile(
  path.join(outputRoot, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://77toolkit.com/</loc></url>
${toolCatalog.map((tool) => `  <url><loc>https://77toolkit.com/tools/${tool.slug}/</loc></url>`).join("\n")}
</urlset>
`,
);

await writeFile(
  path.join(outputRoot, "robots.txt"),
  "User-agent: *\nAllow: /\nSitemap: https://77toolkit.com/sitemap.xml\n",
);

console.log(`\nUnified Pages output created in dist/ with ${toolCatalog.length} tools.`);
