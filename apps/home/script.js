import { categoryOrder, toolCatalog } from "../browser-tools/catalog.mjs";

const catalog = document.querySelector("#tool-catalog");
const search = document.querySelector("#tool-search");
const filters = document.querySelector("#category-filters");
const emptyState = document.querySelector("#empty-state");
let activeCategory = "All";

function createToolCard(tool) {
  const article = document.createElement("article");
  article.className = "tool-card";
  const tags = tool.tags
    .map((tag) => `<span class="tag">${tag}</span>`)
    .join("");

  article.innerHTML = `
    <div>
      <div class="tool-top">
        <span class="tool-category">${tool.category}</span>
        <span class="tool-index">${String(toolCatalog.indexOf(tool) + 1).padStart(2, "0")}</span>
      </div>
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
      <div class="tag-list" aria-label="${tool.name} tags">
        ${tags}
      </div>
    </div>
    <a class="tool-action" href="/tools/${tool.slug}/">Open Tool <span aria-hidden="true">→</span></a>
  `;

  return article;
}

function renderFilters() {
  const categories = ["All", ...categoryOrder];
  filters.replaceChildren(...categories.map((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "filter-button";
    button.dataset.category = category;
    button.dataset.active = String(category === activeCategory);
    button.textContent = category === "All" ? `All ${toolCatalog.length}` : `${category} ${toolCatalog.filter((tool) => tool.category === category).length}`;
    return button;
  }));
}

function renderCatalog() {
  const query = search.value.trim().toLocaleLowerCase();
  const matches = toolCatalog.filter((tool) => {
    const inCategory = activeCategory === "All" || tool.category === activeCategory;
    const searchable = [tool.name, tool.category, tool.description, ...tool.tags].join(" ").toLocaleLowerCase();
    return inCategory && searchable.includes(query);
  });

  const sections = categoryOrder.map((category) => {
    const tools = matches.filter((tool) => tool.category === category);
    if (!tools.length) return null;
    const section = document.createElement("section");
    section.className = "category-section";
    section.id = category.toLocaleLowerCase();
    const heading = document.createElement("div");
    heading.className = "category-heading";
    heading.innerHTML = `<h3>${category}</h3><span>${tools.length} tool${tools.length === 1 ? "" : "s"}</span>`;
    const grid = document.createElement("div");
    grid.className = "tool-grid";
    grid.replaceChildren(...tools.map(createToolCard));
    section.append(heading, grid);
    return section;
  }).filter(Boolean);

  catalog.replaceChildren(...sections);
  emptyState.hidden = matches.length > 0;
}

filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderFilters();
  renderCatalog();
});
search.addEventListener("input", renderCatalog);

renderFilters();
renderCatalog();

if (location.hash) {
  requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView());
}
