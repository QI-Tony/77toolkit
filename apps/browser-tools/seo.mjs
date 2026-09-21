import { toolCatalog } from "./catalog.mjs";

export const siteOrigin = "https://77toolkit.com";
export const homeMetadata = {
  title: "Free Online Tools for JSON, Text & Images | 77 Toolkit",
  description: `${toolCatalog.length} free online tools to repair JSON, clean text, compress images, and convert data. Ad-free, no signup, and processed locally in your browser.`,
  path: "/",
};

const searchTitles = {
  "json-fix": "JSON Repair & Formatter — Fix Invalid JSON",
  "json-diff": "JSON Diff — Compare JSON Objects Online",
  "json-string": "JSON String Escape & Unescape Online",
  "number-base": "Number Base Converter — Binary, Decimal & Hex",
  "text-clean": "Remove AI Text & Markdown Formatting",
  "text-diff": "Text Diff — Compare Two Texts Online",
  "image-compressor": "Image Compressor — Reduce JPEG & WebP File Size",
  "image-resizer": "Image Resizer — Resize Images in Your Browser",
  "image-converter": "Image Converter — PNG, JPEG & WebP",
  "color-spectrum": "Image Color Picker & Palette Extractor",
  "metadata-remover": "Image Metadata Remover — Remove EXIF Locally",
  timestamp: "Unix Timestamp Converter — Seconds, Milliseconds & Dates",
  "csv-json-converter": "CSV to JSON & JSON to CSV Converter",
  "utm-builder": "UTM Link Builder — Create Campaign URLs",
  "contrast-checker": "Color Contrast Checker — WCAG AA & AAA",
};
const searchDescriptions = {
  "json-fix": "Repair invalid JSON, format API responses, and review the result before copying or downloading. Free, ad-free, and processed locally without uploading your data.",
  "text-clean": "Remove Markdown-style and copied AI text formatting while preserving readable paragraphs. Paste, clean, and copy plain text locally. Free and ad-free.",
  "image-compressor": "Reduce JPEG and WebP file size with adjustable quality. Compare the preview and size before downloading. Free, ad-free image compression without uploads.",
  "color-spectrum": "Extract a color palette from an image, inspect individual pixels, and export colors. Free, ad-free, and processed locally without uploading your image.",
  "metadata-remover": "Remove EXIF and other embedded image metadata by re-encoding locally. Preview the result before downloading and review the limitations. Free and ad-free.",
};

export function getToolMetadata(tool) {
  return {
    title: `${searchTitles[tool.slug] || `${tool.name} — Free Online Tool`} | 77 Toolkit`,
    description: searchDescriptions[tool.slug] || `${tool.description} Free, ad-free, and processed in your browser.`,
    path: `/tools/${tool.slug}/`,
  };
}

export function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

// Keep metadata consistent even for the independently built Vue and plain HTML apps.
// Only replace our metadata; preserve verification tags and all other head content.
export function applyPageMetadata(html, metadata) {
  const { title, description, path } = metadata;
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}">`,
    `<link rel="canonical" href="${siteOrigin}${path}">`,
    ...[["property", "og:title", title], ["property", "og:description", description], ["property", "og:url", `${siteOrigin}${path}`], ["name", "twitter:title", title], ["name", "twitter:description", description]]
      .map(([attribute, name, content]) => `<meta ${attribute}="${name}" content="${escapeHtml(content)}">`),
  ].join("\n    ");
  return html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\b[^>]*\b(?:name|property)=["'](?:description|og:title|og:description|og:url|twitter:title|twitter:description)["'][^>]*>/gi, "")
    .replace(/<link\b[^>]*\brel=["']canonical["'][^>]*>/gi, "")
    .replace("</head>", `${tags}\n  </head>`);
}
