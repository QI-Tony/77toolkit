<script setup>
import { ref } from 'vue'
import { resumeData } from '../data/resume.js'
const { experience, research } = resumeData

const expanded = ref(null)
function toggle(id) {
  expanded.value = expanded.value === id ? null : id
}
</script>

<template>
  <section id="experience">
    <div class="container">

      <div class="section-header">
        <p class="section-tag">03. Experience</p>
        <h2 class="section-title">Work & Research</h2>
        <p class="section-desc">Graduate & undergraduate research at the University of Arizona AI Lab</p>
      </div>

      <!-- Work timeline -->
      <div class="exp-timeline">
        <article
          v-for="job in experience"
          :key="job.id"
          class="exp-card"
        >
          <div class="exp-dot" />

          <header class="exp-header" @click="toggle(job.id)">
            <div class="exp-meta">
              <span class="exp-period">{{ job.period }}</span>
              <h3 class="exp-title">{{ job.title }}</h3>
              <p class="exp-org">{{ job.org }}</p>
              <p v-if="job.advisor" class="exp-advisor">{{ job.advisor }}</p>
            </div>
            <button class="exp-toggle" :aria-expanded="expanded === job.id" aria-label="Toggle details">
              <svg :class="['chevron', { open: expanded === job.id }]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          </header>

          <!-- Bullets (always visible on desktop, toggle on mobile) -->
          <ul class="exp-bullets" :class="{ collapsed: expanded !== job.id }">
            <li v-for="bullet in job.bullets" :key="bullet">
              <span class="bullet-arrow">▸</span>
              <span>{{ bullet }}</span>
            </li>
          </ul>
        </article>
      </div>

      <!-- Featured Research -->
      <div class="research-section">
        <h3 class="research-heading">
          <span class="research-tag">Featured Research</span>
        </h3>
        <div class="research-grid">
          <div
            v-for="paper in research"
            :key="paper.title"
            class="research-card"
          >
            <div class="research-role">{{ paper.role }} · {{ paper.period }}</div>
            <h4 class="research-title">{{ paper.title }}</h4>
            <p class="research-desc">{{ paper.description }}</p>
            <div class="research-tags">
              <span v-for="t in paper.tags" :key="t" class="tag">{{ t }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
/* Timeline */
.exp-timeline {
  position: relative;
  padding-left: 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  margin-bottom: 56px;
}

.exp-timeline::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 10px;
  bottom: 10px;
  width: 2px;
  background: linear-gradient(to bottom, var(--teal), rgba(100, 255, 218, 0.1));
  border-radius: 2px;
}

/* Card */
.exp-card {
  position: relative;
  background: var(--bg-white);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 28px 32px;
  box-shadow: var(--shadow);
  transition: box-shadow var(--transition);
}
.exp-card:hover { box-shadow: var(--shadow-hover); }

.exp-dot {
  position: absolute;
  left: -28px;
  top: 34px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--teal);
  border: 3px solid var(--bg-white);
  box-shadow: 0 0 0 2px var(--teal);
}

/* Header row */
.exp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  cursor: pointer;
  user-select: none;
}

.exp-period {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--teal);
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.exp-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 4px;
}

.exp-org {
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--text-medium);
}

.exp-advisor {
  font-size: 0.82rem;
  color: var(--text-light);
  margin-top: 4px;
  font-style: italic;
}

/* Toggle button */
.exp-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  flex-shrink: 0;
  margin-top: 2px;
}

.chevron {
  width: 20px;
  height: 20px;
  color: var(--text-light);
  transition: transform var(--transition);
}
.chevron.open { transform: rotate(180deg); color: var(--teal); }

/* Bullets */
.exp-bullets {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 20px;
  padding-top: 18px;
  border-top: 1px solid var(--border);
}

.exp-bullets li {
  display: flex;
  align-items: baseline;
  gap: 12px;
  font-size: 0.92rem;
  color: var(--text-medium);
  line-height: 1.65;
}

.bullet-arrow {
  color: var(--teal);
  font-size: 0.75rem;
  flex-shrink: 0;
}

/* On mobile, collapse by default; expanded state shows */
@media (max-width: 768px) {
  .exp-bullets.collapsed {
    display: none;
  }
}

/* On desktop always show */
@media (min-width: 769px) {
  .exp-bullets { display: flex !important; }
  .exp-toggle  { display: none; }
  .exp-header  { cursor: default; }
}

/* Research section */
.research-heading {
  margin-bottom: 28px;
}

.research-tag {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--teal);
  letter-spacing: 2px;
  text-transform: uppercase;
  padding: 4px 0;
  border-bottom: 2px solid var(--teal);
}

.research-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.research-card {
  background: var(--navy);
  border-radius: var(--radius-lg);
  padding: 28px;
  border: 1px solid rgba(100, 255, 218, 0.1);
  transition: transform var(--transition), border-color var(--transition);
}
.research-card:hover {
  transform: translateY(-3px);
  border-color: rgba(100, 255, 218, 0.3);
}

.research-role {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--teal);
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.research-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--slate-3);
  line-height: 1.4;
  margin-bottom: 12px;
}

.research-desc {
  font-size: 0.88rem;
  color: var(--slate);
  line-height: 1.7;
  margin-bottom: 18px;
}

.research-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 768px) {
  .research-grid { grid-template-columns: 1fr; }
  .exp-card { padding: 22px 18px; }
}
</style>
