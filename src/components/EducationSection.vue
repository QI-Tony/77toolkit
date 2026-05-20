<script setup>
import { resumeData } from '../data/resume.js'
const { education } = resumeData
</script>

<template>
  <section id="education" class="bg-light">
    <div class="container">

      <div class="section-header">
        <p class="section-tag">02. Education</p>
        <h2 class="section-title">Academic Background</h2>
        <p class="section-desc">University of Arizona · Tucson, AZ</p>
      </div>

      <div class="edu-timeline">
        <div
          v-for="(edu, i) in education"
          :key="edu.id"
          class="edu-card"
          :class="{ 'edu-card--alt': i % 2 === 1 }"
        >
          <!-- Dot on the timeline spine -->
          <div class="timeline-dot" />

          <div class="edu-inner">
            <div class="edu-top">
              <div class="edu-left">
                <span class="edu-period">{{ edu.period }}</span>
                <h3 class="edu-degree">{{ edu.degree }}</h3>
                <p class="edu-school">{{ edu.school }}</p>
                <p class="edu-college">{{ edu.college }}</p>
              </div>
              <div class="edu-gpa">
                <span class="gpa-value">{{ edu.gpa }}</span>
                <span class="gpa-label">GPA</span>
              </div>
            </div>

            <ul v-if="edu.highlights.length" class="edu-highlights">
              <li v-for="h in edu.highlights" :key="h">
                <span class="highlight-arrow">▸</span>{{ h }}
              </li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<style scoped>
/* Timeline spine */
.edu-timeline {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding-left: 32px;
}

.edu-timeline::before {
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
.edu-card {
  position: relative;
  background: var(--bg-white);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px 36px;
  box-shadow: var(--shadow);
  transition: transform var(--transition), box-shadow var(--transition);
}
.edu-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

/* Dot */
.timeline-dot {
  position: absolute;
  left: -28px;
  top: 36px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--teal);
  border: 3px solid var(--bg-light);
  box-shadow: 0 0 0 2px var(--teal);
}

/* Header row */
.edu-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 20px;
}

.edu-period {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--teal);
  letter-spacing: 0.5px;
  display: block;
  margin-bottom: 8px;
}

.edu-degree {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-dark);
  margin-bottom: 4px;
  line-height: 1.3;
}

.edu-school {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-medium);
}

.edu-college {
  font-size: 0.88rem;
  color: var(--text-light);
  margin-top: 2px;
}

/* GPA badge */
.edu-gpa {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 80px;
  padding: 14px 18px;
  background: var(--navy);
  border-radius: var(--radius);
  flex-shrink: 0;
}

.gpa-value {
  font-family: var(--font-mono);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--teal);
  line-height: 1;
}

.gpa-label {
  font-size: 0.7rem;
  color: var(--slate);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-top: 4px;
}

/* Highlights list */
.edu-highlights {
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-top: 1px solid var(--border);
  padding-top: 18px;
}

.edu-highlights li {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 0.9rem;
  color: var(--text-medium);
  line-height: 1.5;
}

.highlight-arrow {
  color: var(--teal);
  font-size: 0.75rem;
  flex-shrink: 0;
  margin-top: 2px;
}

/* Responsive */
@media (max-width: 640px) {
  .edu-top { flex-direction: column; }
  .edu-gpa { flex-direction: row; gap: 8px; width: fit-content; padding: 8px 14px; }
  .edu-card { padding: 24px 20px; }
}
</style>
