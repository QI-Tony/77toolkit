import { toolCatalog } from "./catalog.mjs";

export const featuredWorkflows = [
  { slug: "json-fix", label: "Fix broken JSON", detail: "Repair copied API data, format it, and review the result.", category: "Developer" },
  { slug: "image-compressor", label: "Make an image smaller", detail: "Adjust JPEG or WebP quality and compare the file size locally.", category: "Image" },
  { slug: "text-clean", label: "Clean copied AI text", detail: "Remove Markdown-style formatting and keep readable paragraphs.", category: "Text" },
  { slug: "metadata-remover", label: "Remove image metadata", detail: "Re-encode an image before sharing it. Review the privacy limitations.", category: "Image" },
  { slug: "csv-json-converter", label: "Convert CSV to JSON", detail: "Move quoted tabular data between CSV and JSON object arrays.", category: "Web" },
  { slug: "timestamp", label: "Read a Unix timestamp", detail: "Translate seconds or milliseconds into UTC and local time.", category: "Developer" },
];

export const featuredGuideSlugs = ["repair-invalid-json", "image-formats-and-compression", "url-encoding-and-query-parameters"];

// Choose the next task deliberately, including useful links across categories.
export const relatedToolSlugs = {
  "json-fix": ["json-diff", "json-string", "csv-json-converter"],
  "json-diff": ["json-fix", "text-diff", "json-string"],
  "json-string": ["json-fix", "html-entities", "base64"],
  "number-base": ["base64", "hash-generator", "uuid-generator"],
  timestamp: ["date-calculator", "cron-inspector", "jwt-decoder"],
  "jwt-decoder": ["timestamp", "base64", "json-fix"],
  base64: ["url-encoder", "json-string", "hash-generator"],
  "regex-tester": ["text-diff", "line-processor", "text-clean"],
  "uuid-generator": ["hash-generator", "password-generator", "json-fix"],
  "hash-generator": ["base64", "uuid-generator", "text-diff"],
  "xml-formatter": ["html-entities", "text-diff", "json-fix"],
  "cron-inspector": ["timestamp", "date-calculator", "text-diff"],
  "password-generator": ["uuid-generator", "hash-generator", "base64"],
  "date-calculator": ["timestamp", "cron-inspector", "number-base"],
  "text-clean": ["case-converter", "word-counter", "text-diff"],
  "text-diff": ["json-diff", "text-clean", "line-processor"],
  "case-converter": ["text-clean", "line-processor", "word-counter"],
  "line-processor": ["text-diff", "case-converter", "csv-json-converter"],
  "word-counter": ["text-clean", "case-converter", "markdown-preview"],
  "markdown-preview": ["text-clean", "html-entities", "word-counter"],
  "color-spectrum": ["contrast-checker", "image-compressor", "image-converter"],
  "image-compressor": ["image-resizer", "image-converter", "metadata-remover"],
  "image-resizer": ["image-compressor", "image-converter", "color-spectrum"],
  "image-converter": ["image-compressor", "image-resizer", "metadata-remover"],
  "contrast-checker": ["color-spectrum", "css-unit-converter", "image-converter"],
  "metadata-remover": ["image-compressor", "image-resizer", "image-converter"],
  "url-parser": ["url-encoder", "utm-builder", "base64"],
  "url-encoder": ["url-parser", "utm-builder", "html-entities"],
  "utm-builder": ["url-parser", "url-encoder", "csv-json-converter"],
  "csv-json-converter": ["json-fix", "json-diff", "line-processor"],
  "html-entities": ["json-string", "url-encoder", "markdown-preview"],
  "css-unit-converter": ["contrast-checker", "image-resizer", "color-spectrum"],
};

export function getRelatedTools(slug) {
  if (!relatedToolSlugs[slug]) throw new Error(`Missing related tools for ${slug}.`);
  return relatedToolSlugs[slug].map((relatedSlug) => {
    const tool = toolCatalog.find((candidate) => candidate.slug === relatedSlug);
    if (!tool || slug === relatedSlug) throw new Error(`Invalid related tool ${relatedSlug} for ${slug}.`);
    return tool;
  });
}
