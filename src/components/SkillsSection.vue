<script setup>
import { resumeData } from '../data/resume.js'
const { skills } = resumeData
</script>

<template>
  <section id="skills">
    <div class="container">

      <div class="section-header">
        <p class="section-tag">05. Skills</p>
        <h2 class="section-title">Technical Skills</h2>
        <p class="section-desc">Tools, languages, and frameworks I work with</p>
      </div>

      <div class="skills-grid">
        <div
          v-for="group in skills"
          :key="group.category"
          class="skill-group"
        >
          <div class="group-header">
            <span class="group-icon" aria-hidden="true">{{ group.icon }}</span>
            <h3 class="group-name">{{ group.category }}</h3>
          </div>
          <div class="skill-pills">
            <span
              v-for="item in group.items"
              :key="item"
              class="skill-pill"
            >{{ item }}</span>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
.skills-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* Group card */
.skill-group {
  background: var(--bg-light);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 26px 24px;
  transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
}
.skill-group:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow);
  border-color: rgba(100, 255, 218, 0.25);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
}

.group-icon {
  font-size: 1.4rem;
  line-height: 1;
}

.group-name {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-dark);
  letter-spacing: 0.3px;
  text-transform: uppercase;
  font-family: var(--font-mono);
}

/* Pills */
.skill-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-pill {
  display: inline-block;
  padding: 5px 13px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  background: var(--bg-white);
  color: var(--text-medium);
  border: 1px solid var(--border);
  transition: background var(--transition), color var(--transition), border-color var(--transition);
  white-space: nowrap;
}
.skill-pill:hover {
  background: var(--teal-dim);
  color: var(--teal);
  border-color: rgba(100, 255, 218, 0.3);
}

/* Responsive */
@media (max-width: 960px) {
  .skills-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 560px) {
  .skills-grid { grid-template-columns: 1fr; }
}
</style>
