import { access, cp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { toolCatalog } from "../apps/browser-tools/catalog.mjs";
import { categoryContent, toolContent } from "../apps/browser-tools/content.mjs";
import { toolEditorial } from "../apps/browser-tools/editorial.mjs";
import { guideCatalog } from "../apps/browser-tools/guides.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(repositoryRoot, "dist");
const sharedSourceRoot = path.join(repositoryRoot, "apps/browser-tools/shared");
const siteUpdated = "2026-07-22";

const sharedAssets = {
  app: "/tools/_shared/app.js",
  content: "/tools/_shared/content.css",
  styles: "/tools/_shared/styles.css",
};

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

async function createFingerprintedSharedAssets() {
  const assetDirectory = path.join(outputRoot, "assets/shared");
  await mkdir(assetDirectory, { recursive: true });

  for (const [key, fileName] of Object.entries({
    app: "app.js",
    content: "content.css",
    styles: "styles.css",
  })) {
    const source = await readFile(path.join(sharedSourceRoot, fileName));
    const extension = path.extname(fileName);
    const baseName = path.basename(fileName, extension);
    const hash = createHash("sha256").update(source).digest("hex").slice(0, 10);
    const fingerprintedName = `${baseName}-${hash}${extension}`;
    await writeFile(path.join(assetDirectory, fingerprintedName), source);
    sharedAssets[key] = `/assets/shared/${fingerprintedName}`;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const informationLinks = [
  ["Guides", "/guides/"],
  ["About", "/about/"],
  ["Privacy", "/privacy/"],
  ["Terms", "/terms/"],
  ["Contact", "/contact/"],
];

function createPrimaryHeader() {
  return `<header class="site-header">
      <nav class="nav" aria-label="Primary navigation">
        <a class="brand" href="/" aria-label="77 Toolkit home"><span class="brand-mark">77</span><span class="brand-name">77 Toolkit</span></a>
        <div class="nav-links"><a href="/#tools">All tools</a><a href="/developer/">Developer</a><a href="/text/">Text</a><a href="/image/">Image</a><a href="/guides/">Guides</a></div>
      </nav>
    </header>`;
}

function createIconMeta() {
  return `<link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" href="/favicon-64.png" sizes="64x64">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180">`;
}

function createAdSenseLoader() {
  return `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3812186991635556" crossorigin="anonymous"></script>`;
}

function createLegalFooter() {
  const links = informationLinks.map(([label, href]) => `<a href="${href}">${label}</a>`).join("");
  return `<footer class="legal-footer">
      <div class="legal-footer__inner">
        <div><strong>77 Toolkit</strong> · Local-first browser utilities</div>
        <nav class="legal-footer__links" aria-label="Site information">${links}<a href="https://github.com/QI-Tony/77toolkit" rel="noreferrer">GitHub</a></nav>
      </div>
    </footer>`;
}

function createSocialMeta(title, description, pathName) {
  const url = `https://77toolkit.com${pathName}`;
  return `<meta property="og:type" content="website">
    <meta property="og:site_name" content="77 Toolkit">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="https://77toolkit.com/og.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="https://77toolkit.com/og.png">`;
}

function createPublisherContent(tool) {
  const content = toolContent[tool.slug];
  if (!content) throw new Error(`Missing publisher content for ${tool.slug}.`);
  const editorial = toolEditorial[tool.slug];
  if (!editorial) throw new Error(`Missing editorial content for ${tool.slug}.`);
  const steps = content.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
  const limitations = content.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const scenarios = editorial.scenarios
    .map(
      ({ title, text }) => `<article class="publisher-use-case"><h3>${escapeHtml(title)}</h3><p>${escapeHtml(text)}</p></article>`,
    )
    .join("");
  const checklist = editorial.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const faqs = content.faqs
    .map(
      ({ question, answer }) => `<details>
          <summary>${escapeHtml(question)}</summary>
          <p>${escapeHtml(answer)}</p>
        </details>`,
    )
    .join("");
  const relatedGuides = editorial.relatedGuides
    .map((slug) => {
      const guide = guideCatalog.find((candidate) => candidate.slug === slug);
      if (!guide) throw new Error(`Unknown related guide ${slug} in ${tool.slug}.`);
      return guide;
    })
    .map(
      (guide) => `<a class="publisher-guide-card" href="/guides/${escapeHtml(guide.slug)}/"><span>${escapeHtml(guide.kicker)}</span><strong>${escapeHtml(guide.title)}</strong><small>${escapeHtml(guide.readingTime)} →</small></a>`,
    )
    .join("");

  return `<article class="publisher-content" aria-labelledby="guide-${escapeHtml(tool.slug)}">
      <header class="publisher-content__intro">
        <p class="publisher-content__eyebrow">Practical guide</p>
        <h2 id="guide-${escapeHtml(tool.slug)}">How to use ${escapeHtml(tool.name)}</h2>
        <p>${escapeHtml(content.intro)}</p>
      </header>
      <div class="publisher-content__grid">
        <section class="publisher-card"><h3>Step by step</h3><ol>${steps}</ol></section>
        <section class="publisher-card"><h3>Example</h3><div class="publisher-example"><div class="publisher-example__row"><strong>Input</strong><code>${escapeHtml(content.example.input)}</code></div><div class="publisher-example__row"><strong>Result</strong><code>${escapeHtml(content.example.output)}</code></div></div></section>
        <section class="publisher-card"><h3>How it works</h3><p>${escapeHtml(content.howItWorks)}</p></section>
        <section class="publisher-card"><h3>Important limitations</h3><ul>${limitations}</ul></section>
      </div>
      <section class="publisher-section" aria-labelledby="use-cases-${escapeHtml(tool.slug)}"><div class="publisher-section__header"><p class="publisher-content__eyebrow">Real workflows</p><h2 id="use-cases-${escapeHtml(tool.slug)}">When this tool is useful</h2></div><div class="publisher-use-case-grid">${scenarios}</div></section>
      <section class="publisher-review-grid" aria-label="Result review guidance"><article class="publisher-review"><p class="publisher-content__eyebrow">Review the result</p><h2>What to check before using the output</h2><p>${escapeHtml(editorial.review)}</p><ul class="publisher-checklist">${checklist}</ul></article><article class="publisher-review publisher-review--soft"><p class="publisher-content__eyebrow">Choose the right method</p><h2>When another tool is better</h2><p>${escapeHtml(editorial.alternative)}</p><h3>Privacy and browser behavior</h3><p>${escapeHtml(editorial.privacy)}</p></article></section>
      <section class="publisher-faq" aria-labelledby="faq-${escapeHtml(tool.slug)}"><h2 id="faq-${escapeHtml(tool.slug)}">Frequently asked questions</h2>${faqs}</section>
      ${relatedGuides ? `<section class="publisher-section publisher-related-guides" aria-labelledby="related-guides-${escapeHtml(tool.slug)}"><div class="publisher-section__header"><p class="publisher-content__eyebrow">Go deeper</p><h2 id="related-guides-${escapeHtml(tool.slug)}">Related guides</h2></div><div class="publisher-guide-grid">${relatedGuides}</div></section>` : ""}
    </article>`;
}

function createToolStructuredData(tool) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: tool.name,
        url: `https://77toolkit.com/tools/${tool.slug}/`,
        description: tool.description,
        applicationCategory: `${tool.category}Application`,
        operatingSystem: "Any",
        browserRequirements: "Requires JavaScript and a modern web browser",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "77 Toolkit", item: "https://77toolkit.com/" },
          { "@type": "ListItem", position: 2, name: tool.category, item: `https://77toolkit.com/${tool.category.toLowerCase()}/` },
          { "@type": "ListItem", position: 3, name: tool.name, item: `https://77toolkit.com/tools/${tool.slug}/` },
        ],
      },
    ],
  }).replaceAll("<", "\\u003c");
}

function createHomeCatalogMarkup() {
  return Object.values(categoryContent)
    .map((category) => {
      const tools = toolCatalog.filter((tool) => tool.category === category.title.replace(" Tools", ""));
      const cards = tools
        .map((tool) => {
          const index = toolCatalog.indexOf(tool) + 1;
          return `<article class="tool-card">
            <div>
              <div class="tool-top"><span class="tool-category">${escapeHtml(tool.category)}</span><span class="tool-index">${String(index).padStart(2, "0")}</span></div>
              <h3>${escapeHtml(tool.name)}</h3>
              <p>${escapeHtml(tool.description)}</p>
              <div class="tag-list" aria-label="${escapeHtml(tool.name)} tags">${tool.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
            </div>
            <a class="tool-action" href="/tools/${escapeHtml(tool.slug)}/">Open Tool <span aria-hidden="true">→</span></a>
          </article>`;
        })
        .join("");
      return `<section class="category-section" id="${category.slug}">
          <div class="category-heading"><h3><a href="/${category.slug}/">${escapeHtml(category.title.replace(" Tools", ""))}</a></h3><span>${tools.length} tools</span></div>
          <div class="tool-grid">${cards}</div>
        </section>`;
    })
    .join("");
}

function createGuideCard(guide) {
  return `<a class="guide-card" href="/guides/${escapeHtml(guide.slug)}/"><div><span>${escapeHtml(guide.kicker)}</span><h2>${escapeHtml(guide.title)}</h2><p>${escapeHtml(guide.description)}</p></div><small>${escapeHtml(guide.readingTime)} · Read guide →</small></a>`;
}

function createHomeGuideMarkup() {
  return guideCatalog.slice(0, 3).map(createGuideCard).join("");
}

function createArticleStructuredData(guide) {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: guide.title,
        description: guide.description,
        datePublished: guide.published,
        dateModified: guide.updated,
        image: "https://77toolkit.com/og.png",
        inLanguage: "en",
        author: { "@type": "Organization", name: "77 Toolkit", url: "https://77toolkit.com/about/" },
        publisher: { "@type": "Organization", name: "77 Toolkit", url: "https://77toolkit.com/" },
        mainEntityOfPage: `https://77toolkit.com/guides/${guide.slug}/`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "77 Toolkit", item: "https://77toolkit.com/" },
          { "@type": "ListItem", position: 2, name: "Guides", item: "https://77toolkit.com/guides/" },
          { "@type": "ListItem", position: 3, name: guide.title, item: `https://77toolkit.com/guides/${guide.slug}/` },
        ],
      },
    ],
  }).replaceAll("<", "\\u003c");
}

function createGuideIndexPage() {
  return createStaticPage({
    slug: "guides",
    title: "Practical Guides",
    description: "Original guides for repairing developer data, handling tokens safely, preparing images, testing patterns, and improving accessibility.",
    body: `<header class="static-hero guide-index-hero"><p class="static-eyebrow">Editorial library</p><h1>Understand the work behind the tool</h1><p>These guides explain decisions, limitations, and review steps that a one-click result cannot settle on its own.</p></header><div class="category-copy"><p>Each article is written around a real workflow and links to the relevant local browser tools. The goal is not to add filler around a utility, but to show when an operation is appropriate, what can go wrong, and how to verify the output.</p></div><section class="guide-grid" aria-label="All practical guides">${guideCatalog.map(createGuideCard).join("")}</section>`,
  });
}

function createGuidePage(guide) {
  const sections = guide.sections
    .map(
      (section) => `<section><h2>${escapeHtml(section.heading)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}${section.bullets ? `<ul>${section.bullets.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>` : ""}</section>`,
    )
    .join("");
  const relatedTools = guide.relatedTools
    .map((slug) => {
      const tool = toolCatalog.find((candidate) => candidate.slug === slug);
      if (!tool) throw new Error(`Unknown related tool ${slug} in guide ${guide.slug}.`);
      return tool;
    })
    .map((tool) => `<a href="/tools/${escapeHtml(tool.slug)}/"><strong>${escapeHtml(tool.name)}</strong><span>${escapeHtml(tool.description)}</span></a>`)
    .join("");
  const resources = guide.resources
    .map((resource) => `<li><a href="${escapeHtml(resource.url)}" rel="noreferrer">${escapeHtml(resource.label)}</a></li>`)
    .join("");

  return createStaticPage({
    slug: guide.slug,
    title: guide.title,
    description: guide.description,
    canonicalPath: `/guides/${guide.slug}/`,
    structuredData: createArticleStructuredData(guide),
    body: `<article class="guide-article"><nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">77 Toolkit</a><span>/</span><a href="/guides/">Guides</a><span>/</span><span>${escapeHtml(guide.title)}</span></nav><header class="guide-hero"><p class="static-eyebrow">${escapeHtml(guide.kicker)}</p><h1>${escapeHtml(guide.title)}</h1><p>${escapeHtml(guide.description)}</p><div class="guide-meta"><span>${escapeHtml(guide.readingTime)}</span><span>Published ${escapeHtml(guide.published)}</span><span>Updated ${escapeHtml(guide.updated)}</span></div></header><div class="guide-layout"><div class="guide-body">${sections}<aside class="guide-takeaway"><strong>Key takeaway</strong><p>${escapeHtml(guide.takeaway)}</p></aside><section class="guide-resources"><h2>Primary references</h2><ul>${resources}</ul></section></div><aside class="guide-sidebar"><p class="publisher-content__eyebrow">Use the related tools</p><div>${relatedTools}</div><a class="guide-all-link" href="/guides/">Browse all guides →</a></aside></div></article>`,
  });
}

function createStaticPage({ slug, title, description, body, noindex = false, canonicalPath = `/${slug ? `${slug}/` : ""}`, structuredData = null }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="description" content="${escapeHtml(description)}">
    ${noindex ? '<meta name="robots" content="noindex, follow">' : ""}
    <meta name="theme-color" content="#f5f7f9">
    <title>${escapeHtml(title)} — 77 Toolkit</title>
    ${canonicalPath ? `<link rel="canonical" href="https://77toolkit.com${escapeHtml(canonicalPath)}">` : ""}
    ${noindex ? "" : createSocialMeta(`${title} — 77 Toolkit`, description, canonicalPath)}
    ${createIconMeta()}
    ${noindex ? "" : createAdSenseLoader()}
    <link rel="stylesheet" href="${sharedAssets.styles}">
    <link rel="stylesheet" href="${sharedAssets.content}">
    ${structuredData ? `<script type="application/ld+json">${structuredData}</script>` : ""}
  </head>
  <body>
    ${createPrimaryHeader()}
    <main class="static-content">${body}</main>
    ${createLegalFooter()}
  </body>
</html>
`;
}

function createCategoryPage(categoryName) {
  const category = categoryContent[categoryName];
  const tools = toolCatalog.filter((tool) => tool.category === categoryName);
  const cards = tools
    .map(
      (tool) => `<a class="category-tool-card" href="/tools/${escapeHtml(tool.slug)}/"><div><h2>${escapeHtml(tool.name)}</h2><p>${escapeHtml(tool.description)}</p></div><span>Open tool →</span></a>`,
    )
    .join("");
  const principles = category.principles.map((principle) => `<li>${escapeHtml(principle)}</li>`).join("");
  const copy = category.intro.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");

  return createStaticPage({
    slug: category.slug,
    title: category.title,
    description: category.description,
    body: `<section class="category-intro"><header class="static-hero"><p class="static-eyebrow">${tools.length} focused utilities</p><h1>${escapeHtml(category.title)}</h1><p>${escapeHtml(category.description)}</p></header><aside class="category-principles"><h2>Collection principles</h2><ul>${principles}</ul></aside></section><div class="category-copy">${copy}</div><section class="category-tool-grid" aria-label="${escapeHtml(category.title)}">${cards}</section>`,
  });
}

function createTrustPages() {
  return {
    about: createStaticPage({
      slug: "about",
      title: "About",
      description: "Learn why 77 Toolkit exists, how its local-first tools work, and how the project is maintained.",
      body: `<header class="static-hero"><p class="static-eyebrow">About the project</p><h1>Small tools, clearly explained</h1><p>77 Toolkit is an independent collection of focused browser utilities for developer data, text, and images.</p></header><div class="trust-grid"><section class="trust-card"><h2>Useful by design</h2><p>Each page handles one understandable task and explains its method, limitations, and expected result.</p></section><section class="trust-card"><h2>Local where possible</h2><p>Public tools process pasted text and selected files in the browser whenever modern Web APIs make that practical.</p></section><section class="trust-card"><h2>Open development</h2><p>The source and change history are available on GitHub so problems and improvements can be reviewed publicly.</p></section></div><div class="static-prose"><h2>Why the site exists</h2><p>Many everyday digital tasks are too small for a full application but too sensitive for an unknown upload service. 77 Toolkit keeps these tasks in simple, bookmarkable pages and describes what each operation can and cannot guarantee.</p><h2>How tools are reviewed</h2><p>New tools are tested with representative inputs, clear errors, keyboard-accessible controls, and production build checks. Documentation is updated when behavior or browser limitations change. Security-critical results, including decoded tokens and hashes, still require validation in the system where they will be used.</p><h2>Funding and independence</h2><p>The site may use Google AdSense to help cover hosting and maintenance. Advertising does not change tool output, and ads are kept separate from primary actions and download controls.</p><h2>Project owner and feedback</h2><p>77 Toolkit is maintained through the <a href="https://github.com/QI-Tony/77toolkit">QI-Tony/77toolkit GitHub repository</a>. Bug reports and feature suggestions can be submitted through its public issue tracker.</p><p class="static-meta">Last updated: July 22, 2026</p></div>`,
    }),
    privacy: createStaticPage({
      slug: "privacy",
      title: "Privacy Policy",
      description: "How 77 Toolkit processes local tool input, standard website requests, advertising data, and privacy choices.",
      body: `<header class="static-hero"><p class="static-eyebrow">Privacy policy</p><h1>Privacy, without vague promises</h1><p>This page explains what stays in your browser, what infrastructure providers can receive, and how advertising cookies may be used.</p></header><div class="static-prose"><h2>Tool inputs and files</h2><p>77 Toolkit's public text, developer, and image utilities are designed to process pasted values and selected files in the active browser tab. The site does not currently operate an account system or a public upload API for these tools, and it does not intentionally transmit tool input to a 77 Toolkit server. Closing or refreshing a page normally clears its working state.</p><h2>Website request data</h2><p>The site is delivered through Cloudflare. Like other hosting and security providers, Cloudflare may process request information such as IP address, browser and device information, requested URL, timestamps, security signals, and diagnostic logs to deliver and protect the service. See <a href="https://www.cloudflare.com/privacypolicy/">Cloudflare's Privacy Policy</a>.</p><h2>Google advertising and cookies</h2><p>Pages may include Google AdSense. Third-party vendors, including Google, use cookies or similar technologies to serve and measure ads. Google's use of advertising cookies enables Google and its partners to serve ads based on visits to this site and other sites. Users can manage personalized advertising in <a href="https://adssettings.google.com/">Google Ads Settings</a> and learn more at <a href="https://policies.google.com/technologies/ads">How Google uses information for advertising</a>.</p><p>Where consent is legally required, advertising and storage choices should be presented through a Google-certified consent management message. Availability and exact choices can depend on region and the site's current AdSense configuration.</p><h2>External links</h2><p>Links to GitHub, Google, Cloudflare, and other external sites are governed by those services' own privacy practices. 77 Toolkit does not control their content or data handling.</p><h2>Children</h2><p>77 Toolkit is a general-purpose productivity site and is not directed to children under 13. Do not submit personal or sensitive information through public GitHub issues.</p><h2>Your choices and contact</h2><p>You can block or clear cookies through browser settings, manage Google ad personalization through the link above, and avoid using a tool with sensitive material on an untrusted device. For privacy questions, use the contact options on the <a href="/contact/">Contact page</a> without including private tokens, documents, or images in a public report.</p><h2>Changes</h2><p>This policy may change when site features, providers, or legal obligations change. Material updates will be reflected by the date below.</p><p class="static-meta">Effective and last updated: July 22, 2026</p></div>`,
    }),
    terms: createStaticPage({
      slug: "terms",
      title: "Terms of Use",
      description: "Terms for using 77 Toolkit's free browser-based developer, text, and image utilities.",
      body: `<header class="static-hero"><p class="static-eyebrow">Terms of use</p><h1>Use the tools, verify the result</h1><p>77 Toolkit provides general-purpose browser utilities. By using the site, you agree to the terms below.</p></header><div class="static-prose"><h2>Permitted use</h2><p>You may use the public tools for lawful personal or commercial work. Do not use the site to violate rights, distribute harmful material, interfere with the service, bypass security controls, or create misleading or fraudulent content.</p><h2>No professional advice</h2><p>Results are informational and do not constitute legal, financial, medical, security, or other professional advice. A formatted value, decoded token, matching hash, passing contrast ratio, or cleaned image does not by itself prove that a wider system is correct, secure, compliant, or accessible.</p><h2>Your responsibility</h2><p>You are responsible for reviewing output, preserving original files, maintaining backups, and confirming that you have permission to process the material you provide. Do not rely on the site as the only copy of important data.</p><h2>Availability and warranties</h2><p>The site is provided on an “as is” and “as available” basis without guarantees of uninterrupted access, error-free output, compatibility, or fitness for a particular purpose. Browser behavior and third-party platform changes can affect results.</p><h2>Limitation of liability</h2><p>To the extent permitted by applicable law, the site operator is not liable for indirect, incidental, special, consequential, or data-loss damages arising from use of the site.</p><h2>Third-party services</h2><p>The site may link to or rely on services such as Cloudflare, GitHub, and Google AdSense. Those services operate under their own terms and policies.</p><h2>Changes and contact</h2><p>These terms may be updated as the service changes. Questions and good-faith problem reports can be submitted through the <a href="/contact/">Contact page</a>.</p><p class="static-meta">Effective and last updated: July 22, 2026</p></div>`,
    }),
    contact: createStaticPage({
      slug: "contact",
      title: "Contact",
      description: "Contact 77 Toolkit about bugs, accessibility, privacy, security, or feature suggestions.",
      body: `<header class="static-hero"><p class="static-eyebrow">Contact</p><h1>Report a problem clearly</h1><p>77 Toolkit is maintained through GitHub. Choose the route below that fits the issue and avoid sharing private material publicly.</p></header><div class="trust-grid"><section class="trust-card"><h2>Bugs and features</h2><p>Open an issue in the <a href="https://github.com/QI-Tony/77toolkit/issues">public issue tracker</a> with the tool URL, browser, expected behavior, and reproducible steps.</p></section><section class="trust-card"><h2>Accessibility</h2><p>Report keyboard, screen-reader, contrast, zoom, or motion barriers through GitHub and label the issue as an accessibility problem.</p></section><section class="trust-card"><h2>Privacy and security</h2><p>Start with the maintainer's <a href="https://github.com/QI-Tony">GitHub profile</a>. Do not publish tokens, personal documents, private images, or exploit details in a public issue.</p></section></div><div class="static-prose"><h2>What makes a useful report</h2><ul><li>The exact page address and tool name</li><li>Your browser and operating system</li><li>The steps that reproduce the issue</li><li>What you expected and what happened instead</li><li>A safe sample that contains no confidential information</li></ul><h2>Response expectations</h2><p>The project does not currently promise a service-level response time. Clear reports that can be reproduced are easier to investigate and prioritize.</p><p class="static-meta">Last updated: July 22, 2026</p></div>`,
    }),
  };
}

function extractReadableText(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:[a-z]+|#\d+);/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(html) {
  const text = extractReadableText(html);
  return text ? text.split(" ").length : 0;
}

async function collectHtmlFiles(directory) {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectHtmlFiles(entryPath)));
    else if (entry.name.endsWith(".html")) files.push(entryPath);
  }
  return files;
}

async function validateBuildOutput() {
  const htmlFiles = await collectHtmlFiles(outputRoot);
  const missingRoutes = new Set();
  const catalogSlugs = new Set(toolCatalog.map((tool) => tool.slug));
  const guideSlugs = new Set(guideCatalog.map((guide) => guide.slug));

  if (catalogSlugs.size !== toolCatalog.length) throw new Error("Duplicate tool slugs found in the catalog.");
  if (guideSlugs.size !== guideCatalog.length) throw new Error("Duplicate guide slugs found in the guide catalog.");
  if (new Set(sitemapPaths).size !== sitemapPaths.length) throw new Error("Duplicate sitemap paths found.");
  for (const slug of Object.keys(toolEditorial)) {
    if (!catalogSlugs.has(slug)) throw new Error(`Editorial content references unknown tool ${slug}.`);
  }

  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    const relativePath = path.relative(outputRoot, file);
    const isNotFoundPage = relativePath === "404.html";
    const adLoaderCount = (html.match(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/g) || []).length;
    const canonicalCount = (html.match(/rel="canonical"/g) || []).length;

    if (!html.includes('href="/favicon.ico"')) throw new Error(`Missing favicon metadata in ${relativePath}.`);
    if (isNotFoundPage && adLoaderCount !== 0) throw new Error("The 404 page must not load AdSense.");
    if (!isNotFoundPage && adLoaderCount !== 1) throw new Error(`Expected one AdSense loader in ${relativePath}, found ${adLoaderCount}.`);
    if (isNotFoundPage && canonicalCount !== 0) throw new Error("The 404 page must not have a canonical URL.");
    if (!isNotFoundPage && canonicalCount !== 1) throw new Error(`Expected one canonical URL in ${relativePath}, found ${canonicalCount}.`);
    if (/JSON Doctor|Format Remove/.test(html)) throw new Error(`Legacy product naming remains in ${relativePath}.`);

    for (const match of html.matchAll(/href="(\/[^\"]*)"/g)) {
      const route = match[1].split(/[?#]/)[0];
      if (!route || route.startsWith("//")) continue;
      const localPath = path.join(outputRoot, route.slice(1));
      const candidate = path.extname(route) ? localPath : path.join(localPath, "index.html");
      try {
        await access(candidate);
      } catch {
        missingRoutes.add(`${relativePath}: ${route}`);
      }
    }
  }

  if (missingRoutes.size) throw new Error(`Broken internal links:\n${[...missingRoutes].join("\n")}`);

  for (const tool of toolCatalog) {
    const html = await readFile(path.join(outputRoot, "tools", tool.slug, "index.html"), "utf8");
    const publisherContent = createPublisherContent(tool);
    if (!html.includes(publisherContent)) throw new Error(`Publisher content is missing or incomplete for ${tool.slug}.`);
    const words = countWords(publisherContent);
    if (words < 300) throw new Error(`${tool.slug} has only ${words} words of publisher content; expected at least 300.`);
  }

  for (const guide of guideCatalog) {
    const html = await readFile(path.join(outputRoot, "guides", guide.slug, "index.html"), "utf8");
    const words = countWords(html);
    if (words < 450) throw new Error(`${guide.slug} has only ${words} readable words; expected at least 450.`);
  }
}

function injectExistingToolContent(html, tool) {
  const headContent = `
    ${createSocialMeta(`${tool.name} — 77 Toolkit`, `${tool.description} Runs locally in your browser.`, `/tools/${tool.slug}/`)}
    ${createIconMeta()}
    ${createAdSenseLoader()}
    <link rel="stylesheet" href="${sharedAssets.content}">
    <script type="application/ld+json">${createToolStructuredData(tool)}</script>`;
  let result = html.replace("</head>", `${headContent}\n  </head>`);
  const article = `${createPublisherContent(tool)}\n`;

  if (result.includes('<div id="app"></div>')) {
    result = result.replace(
      '<div id="app"></div>',
      `<div id="app"></div>\n${article}${createLegalFooter()}`,
    );
  } else if (result.includes("</main>")) {
    result = result.replace("</main>", `</main>\n${article}`);
  } else {
    result = result.replace("</body>", `${article}${createLegalFooter()}\n</body>`);
  }

  const bodyStart = result.indexOf("<body");
  const articleStart = result.indexOf('<article class="publisher-content"');
  if (bodyStart === -1 || articleStart < bodyStart) {
    throw new Error(`Publisher content was inserted outside the body for ${tool.slug}.`);
  }

  return result;
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
    ${createSocialMeta(`${tool.name} — 77 Toolkit`, `${tool.description} Runs locally in your browser.`, `/tools/${tool.slug}/`)}
    ${createIconMeta()}
    ${createAdSenseLoader()}
    <link rel="stylesheet" href="${sharedAssets.styles}">
    <link rel="stylesheet" href="${sharedAssets.content}">
    <script type="application/ld+json">${createToolStructuredData(tool)}</script>
  </head>
  <body>
    ${createPrimaryHeader()}
    <main class="page">
      <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">77 Toolkit</a><span>/</span><a href="/${tool.category.toLowerCase()}/">${escapeHtml(tool.category)}</a><span>/</span><span>${escapeHtml(tool.name)}</span></nav>
      <section class="tool-hero" aria-labelledby="tool-title">
        <div><span class="category-label">${escapeHtml(tool.category)} tool</span><h1 id="tool-title">${escapeHtml(tool.name)}</h1><p class="tool-description">${escapeHtml(tool.description)}</p></div>
        <aside class="privacy-note"><strong>Private by default</strong>Your text, tokens, files, and images stay in this browser tab.</aside>
      </section>
      <div class="workspace" id="tool-root"><noscript><section class="tool-panel"><p>This tool requires JavaScript to run locally in your browser.</p></section></noscript></div>
      ${createPublisherContent(tool)}
      <section class="related-section" aria-labelledby="related-title"><h2 id="related-title">More ${escapeHtml(tool.category)} tools</h2><div class="related-grid">${relatedCards}</div></section>
    </main>
    ${createLegalFooter()}
    <script id="tool-config" type="application/json">${config}</script>
    <script type="module" src="${sharedAssets.app}"></script>
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
  sharedSourceRoot,
  path.join(outputRoot, "tools/_shared"),
);
await createFingerprintedSharedAssets();

for (const tool of toolCatalog.filter((candidate) => candidate.implementation === "shared")) {
  const toolDirectory = path.join(outputRoot, "tools", tool.slug);
  await mkdir(toolDirectory, { recursive: true });
  await writeFile(path.join(toolDirectory, "index.html"), createToolPage(tool));
}

for (const tool of toolCatalog.filter((candidate) => candidate.implementation === "existing")) {
  const toolIndex = path.join(outputRoot, "tools", tool.slug, "index.html");
  const html = await readFile(toolIndex, "utf8");
  await writeFile(toolIndex, injectExistingToolContent(html, tool));
}

const homeIndex = path.join(outputRoot, "index.html");
const homeHtml = await readFile(homeIndex, "utf8");
const catalogStart = "<!-- TOOL_CATALOG_START -->";
const catalogEnd = "<!-- TOOL_CATALOG_END -->";
const guideStart = "<!-- GUIDE_CATALOG_START -->";
const guideEnd = "<!-- GUIDE_CATALOG_END -->";
if (!homeHtml.includes(catalogStart) || !homeHtml.includes(catalogEnd) || !homeHtml.includes(guideStart) || !homeHtml.includes(guideEnd)) {
  throw new Error("Home catalog or guide build markers are missing.");
}
await writeFile(
  homeIndex,
  homeHtml
    .replace(new RegExp(`${catalogStart}[\\s\\S]*?${catalogEnd}`), `${catalogStart}${createHomeCatalogMarkup()}${catalogEnd}`)
    .replace(new RegExp(`${guideStart}[\\s\\S]*?${guideEnd}`), `${guideStart}${createHomeGuideMarkup()}${guideEnd}`),
);

for (const categoryName of Object.keys(categoryContent)) {
  const category = categoryContent[categoryName];
  const categoryDirectory = path.join(outputRoot, category.slug);
  await mkdir(categoryDirectory, { recursive: true });
  await writeFile(path.join(categoryDirectory, "index.html"), createCategoryPage(categoryName));
}

const trustPages = createTrustPages();
for (const [slug, html] of Object.entries(trustPages)) {
  const pageDirectory = path.join(outputRoot, slug);
  await mkdir(pageDirectory, { recursive: true });
  await writeFile(path.join(pageDirectory, "index.html"), html);
}

const guideDirectory = path.join(outputRoot, "guides");
await mkdir(guideDirectory, { recursive: true });
await writeFile(path.join(guideDirectory, "index.html"), createGuideIndexPage());
for (const guide of guideCatalog) {
  const pageDirectory = path.join(guideDirectory, guide.slug);
  await mkdir(pageDirectory, { recursive: true });
  await writeFile(path.join(pageDirectory, "index.html"), createGuidePage(guide));
}

await writeFile(
  path.join(outputRoot, "404.html"),
  createStaticPage({
    slug: "404",
    title: "Page not found",
    description: "The requested 77 Toolkit page could not be found.",
    noindex: true,
    canonicalPath: null,
    body: `<header class="static-hero"><p class="static-eyebrow">404</p><h1>That tool is not here</h1><p>The address may have changed or the page may never have existed.</p><p><a class="button button-primary" href="/">Return to all tools</a></p></header>`,
  }),
);

await writeFile(
  path.join(outputRoot, "_redirects"),
  [
    ...toolCatalog.map((tool) => `/tools/${tool.slug} /tools/${tool.slug}/ 301`),
    ...Object.values(categoryContent).map((category) => `/${category.slug} /${category.slug}/ 301`),
    ...Object.keys(trustPages).map((slug) => `/${slug} /${slug}/ 301`),
    "/guides /guides/ 301",
    ...guideCatalog.map((guide) => `/guides/${guide.slug} /guides/${guide.slug}/ 301`),
    "",
  ].join("\n"),
);

const sitemapPaths = [
  "/",
  ...Object.values(categoryContent).map((category) => `/${category.slug}/`),
  ...Object.keys(trustPages).map((slug) => `/${slug}/`),
  "/guides/",
  ...guideCatalog.map((guide) => `/guides/${guide.slug}/`),
  ...toolCatalog.map((tool) => `/tools/${tool.slug}/`),
];

await writeFile(
  path.join(outputRoot, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPaths.map((sitePath) => `  <url><loc>https://77toolkit.com${sitePath}</loc><lastmod>${siteUpdated}</lastmod></url>`).join("\n")}
</urlset>
`,
);

await writeFile(
  path.join(outputRoot, "robots.txt"),
  "User-agent: *\nAllow: /\nSitemap: https://77toolkit.com/sitemap.xml\n",
);

await validateBuildOutput();

console.log(`\nUnified Pages output created in dist/ with ${toolCatalog.length} tools, ${guideCatalog.length} guides, and ${sitemapPaths.length} indexed pages.`);
