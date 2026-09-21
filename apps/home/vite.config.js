import { defineConfig } from "vite";
import { toolCatalog } from "../browser-tools/catalog.mjs";
import { featuredWorkflows } from "../browser-tools/discovery.mjs";
import { applyPageMetadata, escapeHtml, homeMetadata } from "../browser-tools/seo.mjs";

export default defineConfig({
  plugins: [{
    name: "toolkit-home-content",
    transformIndexHtml(html) {
      const workflows = featuredWorkflows.map(({ slug, label, detail, category }) => `
        <a class="workflow-card" href="/tools/${escapeHtml(slug)}/">
          <span class="workflow-category">${escapeHtml(category)}</span>
          <h3>${escapeHtml(label)}</h3><p>${escapeHtml(detail)}</p>
          <span class="workflow-action">Open tool <span aria-hidden="true">→</span></span>
        </a>`).join("");
      return applyPageMetadata(html, homeMetadata)
        .replaceAll("{{TOOL_COUNT}}", String(toolCatalog.length))
        .replace("<!-- FEATURED_WORKFLOWS -->", workflows);
    },
  }],
});
