const tools = [
  {
    name: "Color Spectrum Analyzer",
    url: "https://color.77toolkit.com",
    category: "Image",
    tags: ["Color", "Palette", "Local"],
    description:
      "Extract dominant colors from images, inspect pixels, analyze color families, and export palettes.",
    status: "live",
  },
  {
    name: "Image Tools",
    url: "",
    category: "Image",
    tags: ["Resize", "Convert", "Optimize"],
    description:
      "Fast browser utilities for preparing and adjusting image files.",
    status: "coming-soon",
  },
  {
    name: "Text Tools",
    url: "",
    category: "Text",
    tags: ["Format", "Clean", "Count"],
    description:
      "Small helpers for editing, cleaning, comparing, and shaping text.",
    status: "coming-soon",
  },
  {
    name: "Developer Tools",
    url: "",
    category: "Developer",
    tags: ["JSON", "Encoding", "Inspect"],
    description:
      "Practical utilities for everyday development and debugging tasks.",
    status: "coming-soon",
  },
];

const toolGrid = document.querySelector("#tool-grid");

function formatStatus(status) {
  return status === "live" ? "Live" : "Coming Soon";
}

function createToolCard(tool) {
  const article = document.createElement("article");
  article.className = `tool-card ${tool.status === "live" ? "" : "is-coming-soon"}`;

  const isLive = tool.status === "live";
  const tags = tool.tags
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join("");

  article.innerHTML = `
    <div>
      <div class="tool-top">
        <span class="tool-category">${tool.category}</span>
        <span class="status status-${tool.status}">${formatStatus(tool.status)}</span>
      </div>
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
      <div class="tag-list" aria-label="${tool.name} tags">
        ${tags}
      </div>
    </div>
    ${
      isLive
        ? `<a class="tool-action" href="${tool.url}">Open Tool</a>`
        : `<span class="tool-action" aria-disabled="true">Coming Soon</span>`
    }
  `;

  return article;
}

toolGrid.replaceChildren(...tools.map(createToolCard));
