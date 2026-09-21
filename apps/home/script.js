import { categoryOrder, toolCatalog } from "../browser-tools/catalog.mjs";

const catalog = document.querySelector("#tool-catalog");
const search = document.querySelector("#tool-search");
const filters = document.querySelector("#category-filters");
const emptyState = document.querySelector("#empty-state");
const count = document.querySelector("#result-count");
const savedFilter = document.querySelector("#favorites-filter");
const storageNotice = document.querySelector("#storage-notice");
const storageKey = "77toolkit:favorites";
const validSlugs = new Set(toolCatalog.map((tool) => tool.slug));
let favorites = new Set();
let activeCategory = "All";
let savedOnly = false;
try {
  const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
  if (Array.isArray(stored)) favorites = new Set(stored.filter((slug) => validSlugs.has(slug)));
} catch { storageNotice.hidden = false; }

function readView() {
  const params = new URLSearchParams(location.search);
  search.value = params.get("q") || "";
  activeCategory = categoryOrder.includes(params.get("category")) ? params.get("category") : "All";
  savedOnly = params.get("saved") === "1";
}

function saveView() {
  const url = new URL(location.href);
  for (const [key, value] of [["q", search.value], ["category", activeCategory === "All" ? "" : activeCategory], ["saved", savedOnly ? "1" : ""]]) {
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
  }
  history.replaceState(null, "", url);
}

function updateFavoriteButton(button, tool) {
  const saved = favorites.has(tool.slug);
  button.textContent = saved ? "★ Saved" : "☆ Save";
  button.setAttribute("aria-pressed", String(saved));
  button.setAttribute("aria-label", `${saved ? "Remove" : "Save"} ${tool.name}${saved ? " from favorites" : " to favorites"}`);
}

function createToolCard(tool) {
  const article = document.createElement("article");
  article.className = "tool-card";
  article.innerHTML = `
    <div>
      <div class="tool-top">
        <span class="tool-category">${tool.category}</span>
        <button class="favorite-button" type="button" data-favorite="${tool.slug}"></button>
      </div>
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
      <div class="tag-list" aria-label="${tool.name} tags">${tool.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}</div>
    </div>
    <a class="tool-action" href="/tools/${tool.slug}/">Open Tool <span aria-hidden="true">→</span></a>`;
  updateFavoriteButton(article.querySelector("button"), tool);
  return article;
}

function updateFilters() {
  filters.querySelectorAll("button").forEach((button) => {
    const active = button.dataset.category === activeCategory;
    button.dataset.active = String(active);
    button.setAttribute("aria-pressed", String(active));
  });
  savedFilter.setAttribute("aria-pressed", String(savedOnly));
  savedFilter.dataset.active = String(savedOnly);
  savedFilter.textContent = `★ Favorites (${favorites.size})`;
}

function renderCatalog() {
  const words = search.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const matches = toolCatalog.filter((tool) => {
    const inCategory = activeCategory === "All" || tool.category === activeCategory;
    const searchable = [tool.name, tool.category, tool.description, ...tool.tags].join(" ").toLocaleLowerCase();
    return inCategory && (!savedOnly || favorites.has(tool.slug)) && words.every((word) => searchable.includes(word));
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
  count.textContent = `${matches.length} of ${toolCatalog.length} tools${savedOnly ? " · favorites only" : ""}`;
  updateFilters();
}

filters.replaceChildren(...["All", ...categoryOrder].map((category) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "filter-button";
  button.dataset.category = category;
  button.textContent = `${category} ${category === "All" ? toolCatalog.length : toolCatalog.filter((tool) => tool.category === category).length}`;
  return button;
}));
filters.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  activeCategory = button.dataset.category;
  renderCatalog(); saveView();
});
search.addEventListener("input", () => { renderCatalog(); saveView(); });
savedFilter.addEventListener("click", () => { savedOnly = !savedOnly; renderCatalog(); saveView(); });
catalog.addEventListener("click", (event) => {
  const button = event.target.closest("[data-favorite]");
  if (!button) return;
  const slug = button.dataset.favorite;
  if (favorites.has(slug)) favorites.delete(slug);
  else favorites.add(slug);
  try { localStorage.setItem(storageKey, JSON.stringify([...favorites])); }
  catch { storageNotice.hidden = false; }
  if (savedOnly) { renderCatalog(); savedFilter.focus(); }
  else { updateFavoriteButton(button, toolCatalog.find((tool) => tool.slug === slug)); updateFilters(); }
});
document.querySelector("#reset-filters").addEventListener("click", () => {
  search.value = ""; activeCategory = "All"; savedOnly = false; renderCatalog(); saveView(); search.focus();
});
document.addEventListener("keydown", (event) => {
  const editing = event.target.closest("input, textarea, select, [contenteditable]");
  if (event.key === "/" && !editing && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault(); search.focus();
  }
  if (event.key === "Escape" && event.target === search) {
    search.value = ""; renderCatalog(); saveView();
  }
});
window.addEventListener("popstate", () => { readView(); renderCatalog(); });
readView();
renderCatalog();
document.querySelector(".tool-controls").hidden = false;
document.querySelector(".catalog-summary").hidden = false;

if (location.hash) {
  // A URL fragment is an identifier, not a CSS selector; malformed fragments must not crash startup.
  try {
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    requestAnimationFrame(() => target?.scrollIntoView());
  } catch { /* Ignore malformed percent encoding. */ }
}
