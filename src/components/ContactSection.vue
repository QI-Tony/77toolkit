<script setup>
import { resumeData } from '../data/resume.js'
const { personal } = resumeData

const contacts = [
  {
    label: 'Email',
    value: personal.email,
    href: `mailto:${personal.email}`,
    icon: 'email'
  },
  {
    label: 'LinkedIn',
    value: 'qi-zhang-a71b371b5',
    href: personal.linkedin,
    icon: 'linkedin',
    external: true
  },
  {
    label: 'Location',
    value: personal.location,
    href: null,
    icon: 'location'
  }
]
</script>

<template>
  <section id="contact" class="bg-dark">
    <div class="container">

      <div class="section-header">
        <p class="section-tag section-tag--dark">06. Contact</p>
        <h2 class="section-title section-title--dark">Get In Touch</h2>
        <p class="section-desc section-desc--dark">
          I'm actively looking for full-time opportunities starting May 2025.<br />
          Whether you have a question, a project idea, or just want to say hi — my inbox is open.
        </p>
      </div>

      <div class="contact-layout">

        <!-- Contact cards -->
        <div class="contact-cards">
          <a
            v-for="c in contacts"
            :key="c.label"
            :href="c.href || undefined"
            :target="c.external ? '_blank' : undefined"
            :rel="c.external ? 'noopener noreferrer' : undefined"
            class="contact-card"
            :class="{ 'contact-card--static': !c.href }"
          >
            <!-- Icon -->
            <div class="contact-icon-wrap">
              <!-- Email -->
              <svg v-if="c.icon === 'email'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m2 7 10 7 10-7"/>
              </svg>
              <!-- LinkedIn -->
              <svg v-else-if="c.icon === 'linkedin'" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
              <!-- Location -->
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 1 1 16 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>

            <div class="contact-info">
              <span class="contact-label">{{ c.label }}</span>
              <span class="contact-value">{{ c.value }}</span>
            </div>
          </a>
        </div>

        <!-- CTA block -->
        <div class="contact-cta">
          <p class="cta-blurb">
            Open to roles in <strong>Data Engineering</strong>, <strong>AI/ML Engineering</strong>,
            <strong>MIS / Business Analytics</strong>, and <strong>Full-Stack Development</strong>.
          </p>
          <a :href="`mailto:${personal.email}`" class="btn btn-primary cta-btn">
            Send Me an Email
          </a>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
/* Layout */
.contact-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 56px;
  align-items: center;
}

/* Cards */
.contact-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-card {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px 24px;
  background: var(--navy-2);
  border: 1px solid rgba(100, 255, 218, 0.1);
  border-radius: var(--radius-lg);
  transition: transform var(--transition), border-color var(--transition);
}
.contact-card:not(.contact-card--static):hover {
  transform: translateX(6px);
  border-color: rgba(100, 255, 218, 0.35);
}
.contact-card--static { cursor: default; }

.contact-icon-wrap {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--teal-dim);
  border-radius: 10px;
  flex-shrink: 0;
  color: var(--teal);
}
.contact-icon-wrap svg { width: 22px; height: 22px; }

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.contact-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--teal);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.contact-value {
  font-size: 0.95rem;
  font-weight: 500;
  color: var(--slate-3);
}

/* CTA */
.contact-cta {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding: 36px;
  background: var(--navy-2);
  border: 1px solid rgba(100, 255, 218, 0.12);
  border-radius: var(--radius-lg);
}

.cta-blurb {
  font-size: 0.95rem;
  color: var(--slate-2);
  line-height: 1.8;
}
.cta-blurb strong {
  color: var(--slate-3);
  font-weight: 600;
}

.cta-btn {
  align-self: flex-start;
}

/* Responsive */
@media (max-width: 900px) {
  .contact-layout {
    grid-template-columns: 1fr;
    gap: 36px;
  }
}
</style>
