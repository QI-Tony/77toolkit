import test from "node:test";
import assert from "node:assert/strict";
import { toolCatalog } from "../apps/browser-tools/catalog.mjs";
import { guideCatalog } from "../apps/browser-tools/guides.mjs";
import { featuredWorkflows, featuredGuideSlugs, relatedToolSlugs, getRelatedTools } from "../apps/browser-tools/discovery.mjs";
import { applyPageMetadata, getToolMetadata, homeMetadata } from "../apps/browser-tools/seo.mjs";
import { validateSearchPage } from "../scripts/validate-search.mjs";

test("every tool has three distinct, valid next steps", () => {
  assert.deepEqual(new Set(Object.keys(relatedToolSlugs)), new Set(toolCatalog.map((tool) => tool.slug)));
  for (const tool of toolCatalog) assert.equal(new Set(getRelatedTools(tool.slug).map((item) => item.slug)).size, 3);
  assert.throws(() => getRelatedTools("missing"));
});
test("featured tasks and guides point to real tools and relevant articles", () => {
  assert.equal(new Set(featuredWorkflows.map((item) => item.slug)).size, featuredWorkflows.length);
  for (const item of featuredWorkflows) assert.ok(toolCatalog.some((tool) => tool.slug === item.slug && tool.category === item.category));
  for (const slug of featuredGuideSlugs) assert.ok(guideCatalog.find((guide) => guide.slug === slug)?.relatedTools.length);
});
test("metadata covers every tool and derives homepage count from the catalog", () => {
  const metadata = toolCatalog.map(getToolMetadata);
  assert.equal(new Set(metadata.map((item) => item.title)).size, toolCatalog.length);
  assert.ok(homeMetadata.description.startsWith(`${toolCatalog.length} free online tools`));
  for (const item of metadata) {
    assert.ok(item.title.length < 100);
    assert.ok(item.description.length > 60 && item.description.length < 250);
    assert.ok(item.path.startsWith("/tools/") && item.path.endsWith("/"));
  }
});
const original = '<html><head><title>Old</title><meta content="old" name="description"><meta name="google-site-verification" content="keep-me"><link href="https://old.example" rel="canonical"><meta property="og:title" content="Old"></head><body></body></html>';
const metadata = { title: 'Text & "quotes" | Toolkit', description: 'A local converter for <text> & "quotes".', path: '/tools/example/' };
const valid = () => applyPageMetadata(original, metadata);
test("metadata replacement escapes text, is idempotent, and preserves site verification", () => {
  const html = valid();
  assert.ok(html.includes('name="google-site-verification" content="keep-me"'));
  const result = validateSearchPage(html, "https://77toolkit.com/tools/example/");
  assert.ok(result.title.includes("&amp;"));
  assert.ok(result.description.includes("&lt;text&gt;"));
  assert.deepEqual(validateSearchPage(applyPageMetadata(html, metadata), "https://77toolkit.com/tools/example/"), result);
});
test("search guard rejects canonical drift and accidental noindex", () => {
  assert.throws(() => validateSearchPage(valid(), "https://77toolkit.com/wrong/"), /Canonical/);
  for (const value of ["noindex, follow", "none"]) assert.throws(() => validateSearchPage(valid().replace('</head>', `<meta name="robots" content="${value}"></head>`), "https://77toolkit.com/tools/example/"), /noindex/);
});
test("search guard rejects stale social metadata and malformed structured data", () => {
  assert.throws(() => validateSearchPage(valid().replace('property="og:title" content="', 'property="og:title" content="wrong '), "https://77toolkit.com/tools/example/"), /differs/);
  assert.throws(() => validateSearchPage(valid().replace('</head>', '<script type="application/ld+json">{bad}</script></head>'), "https://77toolkit.com/tools/example/"), SyntaxError);
});
