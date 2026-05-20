<script setup>
import { resumeData } from '../data/resume.js'
const { personal, summary, stats, honors } = resumeData
</script>

<template>
  <section id="about">
    <div class="container">

      <div class="section-header">
        <p class="section-tag">01. About</p>
        <h2 class="section-title">About Me</h2>
      </div>

      <div class="about-grid">

        <!-- Left: bio text -->
        <div class="about-text">
          <p v-for="(para, i) in summary" :key="i" class="bio-para">{{ para }}</p>

          <div class="about-links">
            <a :href="'mailto:' + personal.email" class="about-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 7 10-7"/></svg>
              {{ personal.email }}
            </a>
            <a :href="personal.linkedin" target="_blank" rel="noopener noreferrer" class="about-link">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              LinkedIn Profile
            </a>
          </div>
        </div>

        <!-- Right: stats + honors -->
        <div class="about-sidebar">

          <!-- Stats grid -->
          <div class="stats-grid">
            <div v-for="stat in stats" :key="stat.label" class="stat-card">
              <span class="stat-value">{{ stat.value }}</span>
              <span class="stat-label">{{ stat.label }}</span>
            </div>
          </div>

          <!-- Honors -->
          <div class="honors-card">
            <h3 class="honors-title">Honors & Awards</h3>
            <ul class="honors-list">
              <li v-for="honor in honors" :key="honor.title" class="honor-item">
                <span class="honor-award">{{ honor.award }} · {{ honor.year }}</span>
                <span class="honor-name">{{ honor.title }}</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* Layout */
.about-grid {
  display: grid;
  grid-template-columns: 1fr 420px;
  gap: 64px;
  align-items: start;
}

/* Bio */
.bio-para {
  font-size: 1rem;
  color: var(--text-medium);
  line-height: 1.85;
  margin-bottom: 18px;
}

.about-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 28px;
}

.about-link {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--teal);
  transition: opacity var(--transition);
}
.about-link:hover { opacity: 0.75; }
.about-link svg {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: var(--bg-light);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px 16px;
  text-align: center;
  transition: transform var(--transition), box-shadow var(--transition);
}
.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow);
}

.stat-value {
  display: block;
  font-size: 2rem;
  font-weight: 800;
  color: var(--teal);
  font-family: var(--font-mono);
  line-height: 1;
  margin-bottom: 6px;
}

.stat-label {
  font-size: 0.78rem;
  color: var(--text-light);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* Honors */
.honors-card {
  background: var(--navy);
  border-radius: var(--radius-lg);
  padding: 24px;
}

.honors-title {
  font-size: 0.82rem;
  font-family: var(--font-mono);
  color: var(--teal);
  letter-spacing: 1.5px;
  text-transform: uppercase;
  margin-bottom: 18px;
}

.honors-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.honor-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-left: 12px;
  border-left: 2px solid rgba(100, 255, 218, 0.3);
}

.honor-award {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--teal);
  letter-spacing: 0.5px;
}

.honor-name {
  font-size: 0.88rem;
  color: var(--slate-2);
  line-height: 1.4;
}

/* Responsive */
@media (max-width: 960px) {
  .about-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}
</style>
