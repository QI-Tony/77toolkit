<script setup>
import { ref, computed } from 'vue'
import { resumeData } from '../data/resume.js'
const { projects } = resumeData

const showAll    = ref(false)
const expanded   = ref(null)

const featured   = computed(() => projects.filter(p => p.featured))
const others     = computed(() => projects.filter(p => !p.featured))
const displayed  = computed(() => showAll.value ? projects : featured.value)

function toggleExpand(id) {
  expanded.value = expanded.value === id ? null : id
}
</script>

<template>
  <section id="projects" class="bg-light">
    <div class="container">

      <div class="section-header">
        <p class="section-tag">04. Projects</p>
        <h2 class="section-title">Selected Projects</h2>
        <p class="section-desc">
          Showing {{ showAll ? 'all' : 'featured' }} projects ·
          <button class="toggle-link" @click="showAll = !showAll">
            {{ showAll ? 'Show featured only' : `Show all ${projects.length}` }}
          </button>
        </p>
      </div>

      <div class="projects-grid">
        <article
          v-for="project in displayed"
          :key="project.id"
          class="project-card"
          :class="{ featured: project.featured }"
        >
          <!-- Top bar -->
          <div class="project-header">
            <div class="project-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"/>
              </svg>
            </div>
            <div class="project-meta">
              <span class="project-role">{{ project.role }}</span>
              <span class="project-period">{{ project.period }}</span>
            </div>
          </div>

          <h3 class="project-name">{{ project.name }}</h3>
          <p class="project-desc">{{ project.description }}</p>

          <!-- Tags -->
          <div class="project-tags">
            <span v-for="t in project.tags" :key="t" class="tag">{{ t }}</span>
          </div>

          <!-- Expandable bullets -->
          <div v-if="expanded === project.id" class="project-bullets">
            <ul>
              <li v-for="bullet in project.bullets" :key="bullet">
                <span class="bullet-arrow">▸</span>{{ bullet }}
              </li>
            </ul>
          </div>

          <button class="expand-btn" @click="toggleExpand(project.id)">
            {{ expanded === project.id ? 'Show less ↑' : 'Details ↓' }}
          </button>
        </article>
      </div>

      <!-- Show all / show less -->
      <div v-if="!showAll && others.length" class="show-more">
        <button class="btn btn-outline" @click="showAll = true">
          Show {{ others.length }} more projects
        </button>
      </div>

    </div>
  </section>
</template>

<style scoped>
.projects-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

/* Card */
.project-card {
  background: var(--bg-white);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px 26px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--shadow);
  transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
  border-color: rgba(100, 255, 218, 0.3);
}

.project-card.featured {
  border-color: rgba(100, 255, 218, 0.15);
}

/* Header row */
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.project-icon {
  width: 36px;
  height: 36px;
  padding: 7px;
  background: var(--navy);
  border-radius: 8px;
  color: var(--teal);
  flex-shrink: 0;
}
.project-icon svg { width: 100%; height: 100%; }

.project-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.project-role {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--teal);
  font-family: var(--font-mono);
}

.project-period {
  font-size: 0.73rem;
  color: var(--text-light);
  font-family: var(--font-mono);
}

/* Name & description */
.project-name {
  font-size: 1.02rem;
  font-weight: 700;
  color: var(--text-dark);
  line-height: 1.35;
}

.project-desc {
  font-size: 0.88rem;
  color: var(--text-medium);
  line-height: 1.65;
  flex: 1;
}

/* Tags */
.project-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 4px;
}

/* Bullets */
.project-bullets {
  border-top: 1px solid var(--border);
  padding-top: 14px;
}

.project-bullets li {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 0.86rem;
  color: var(--text-medium);
  line-height: 1.6;
  margin-bottom: 8px;
}

.bullet-arrow {
  color: var(--teal);
  font-size: 0.7rem;
  flex-shrink: 0;
}

/* Expand button */
.expand-btn {
  background: none;
  border: none;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--teal);
  cursor: pointer;
  padding: 0;
  align-self: flex-start;
  margin-top: auto;
  transition: opacity var(--transition);
}
.expand-btn:hover { opacity: 0.7; }

/* Toggle link in subtitle */
.toggle-link {
  background: none;
  border: none;
  font-family: var(--font-sans);
  font-size: inherit;
  color: var(--teal);
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 3px;
}

/* Show more button */
.show-more {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

/* Responsive */
@media (max-width: 960px) {
  .projects-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .projects-grid { grid-template-columns: 1fr; }
}
</style>
