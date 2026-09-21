import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { siteOrigin } from "../apps/browser-tools/seo.mjs";

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/gs)].map((match) => [match[1].toLowerCase(), match[3]]));
}

export function validateSearchPage(html, canonicalUrl) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1];
  if (!head) throw new Error("Missing document head.");
  const tags = [...head.matchAll(/<meta\b[^>]*>/gi)].map(([tag]) => attributes(tag));
  const meta = (key) => {
    const found = tags.filter((tag) => tag.name === key || tag.property === key);
    if (found.length !== 1 || !found[0].content?.trim()) throw new Error(`Expected one nonempty ${key} tag.`);
    return found[0].content;
  };
  const titles = [...head.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title>/gi)];
  if (titles.length !== 1 || !titles[0][1].trim()) throw new Error("Expected one nonempty page title.");
  const title = titles[0][1];
  const description = meta("description");
  const links = [...head.matchAll(/<link\b[^>]*>/gi)].map(([tag]) => attributes(tag));
  const canonicals = links.filter((tag) => tag.rel === "canonical");
  if (canonicals.length !== 1 || canonicals[0].href !== canonicalUrl) throw new Error(`Canonical must match ${canonicalUrl}.`);
  if (tags.some((tag) => /^(robots|googlebot)$/i.test(tag.name || "") && /\b(noindex|none)\b/i.test(tag.content))) throw new Error(`Indexable page has noindex: ${canonicalUrl}`);
  for (const key of ["og:title", "twitter:title"]) if (meta(key) !== title) throw new Error(`${key} differs from the page title.`);
  for (const key of ["og:description", "twitter:description"]) if (meta(key) !== description) throw new Error(`${key} differs from the page description.`);
  if (meta("og:url") !== canonicalUrl) throw new Error("Sharing URL differs from the canonical.");
  for (const match of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) JSON.parse(match[1]);
  if (/\{\{TOOL_COUNT\}\}|Twenty-nine|Thirty-two/.test(head)) throw new Error("Unresolved or hard-coded catalog count in metadata.");
  return { title, description };
}

export async function assertSearchOutput(directory, routes) {
  const titles = new Set();
  const descriptions = new Set();
  for (const route of routes) {
    const filename = path.join(directory, route, "index.html");
    const html = await readFile(filename, "utf8");
    let result;
    try { result = validateSearchPage(html, `${siteOrigin}${route}`); }
    catch (error) { throw new Error(`${route}: ${error.message}`); }
    if (titles.has(result.title)) throw new Error(`Duplicate page title: ${route}`);
    if (descriptions.has(result.description)) throw new Error(`Duplicate page description: ${route}`);
    titles.add(result.title); descriptions.add(result.description);
    for (const [tag] of html.matchAll(/<(?:script|link|img)\b[^>]*>/gi)) {
      const attrs = attributes(tag);
      const source = attrs.src || (attrs.rel === "stylesheet" || attrs.rel === "icon" || attrs.rel === "apple-touch-icon" ? attrs.href : "");
      if (source?.startsWith("/") && !source.startsWith("//")) await access(path.join(directory, source.split(/[?#]/)[0]));
    }
  }
  const xml = await readFile(path.join(directory, "sitemap.xml"), "utf8");
  const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
  const expected = new Set(routes.map((route) => `${siteOrigin}${route}`));
  if (urls.length !== expected.size || new Set(urls).size !== expected.size || urls.some((url) => !expected.has(url))) throw new Error("Sitemap does not match the canonical page inventory.");
  const robots = await readFile(path.join(directory, "robots.txt"), "utf8");
  if (!robots.includes(`Sitemap: ${siteOrigin}/sitemap.xml`) || /^Disallow:\s*\/\s*$/m.test(robots)) throw new Error("robots.txt blocks crawling or omits the sitemap.");
  const notFound = await readFile(path.join(directory, "404.html"), "utf8");
  if (!/<meta\s+name="robots"\s+content="noindex, follow"/.test(notFound)) throw new Error("404 must remain noindex.");
  console.log(`Search checks passed: ${routes.length} unique pages, matching canonicals and social metadata, sitemap, and local assets.`);
}
