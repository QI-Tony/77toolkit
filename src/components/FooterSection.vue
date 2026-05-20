<script setup>
import { resumeData } from '../data/resume.js'
const { personal } = resumeData

const year = new Date().getFullYear()

const links = [
  { href: '#about',      label: 'About'      },
  { href: '#education',  label: 'Education'  },
  { href: '#experience', label: 'Experience' },
  { href: '#projects',   label: 'Projects'   },
  { href: '#skills',     label: 'Skills'     },
  { href: '#contact',    label: 'Contact'    }
]
</script>

<template>
  <footer class="footer">
    <div class="container footer-inner">

      <div class="footer-top">
        <a href="#hero" class="footer-logo">QZ</a>
        <nav class="footer-nav" aria-label="Footer navigation">
          <a v-for="link in links" :key="link.href" :href="link.href">{{ link.label }}</a>
        </nav>
        <a
          :href="personal.linkedin"
          target="_blank"
          rel="noopener noreferrer"
          class="footer-linkedin"
          aria-label="LinkedIn"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/>
            <rect x="2" y="9" width="4" height="12"/>
            <circle cx="4" cy="4" r="2"/>
          </svg>
        </a>
      </div>

      <div class="footer-bottom">
        <p class="footer-copy">
          &copy; {{ year }} {{ personal.name }} · Built with Vue 3 &amp; Vite
        </p>
        <p class="footer-sub">
          Designed &amp; developed by Qi Zhang
        </p>
      </div>

    </div>
  </footer>
</template>

<style scoped>
.footer {
  background: var(--navy);
  border-top: 1px solid rgba(100, 255, 218, 0.08);
  padding: 40px 0 28px;
}

.footer-inner {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Top row */
.footer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}

.footer-logo {
  font-family: var(--font-mono);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--teal);
  letter-spacing: 3px;
  transition: opacity var(--transition);
}
.footer-logo:hover { opacity: 0.7; }

.footer-nav {
  display: flex;
  gap: 28px;
  flex-wrap: wrap;
}

.footer-nav a {
  font-size: 0.85rem;
  color: var(--slate);
  transition: color var(--transition);
}
.footer-nav a:hover { color: var(--teal); }

.footer-linkedin {
  color: var(--slate);
  transition: color var(--transition), transform var(--transition);
  display: flex;
  align-items: center;
}
.footer-linkedin:hover {
  color: var(--teal);
  transform: translateY(-2px);
}

/* Bottom row */
.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 20px;
}

.footer-copy,
.footer-sub {
  font-size: 0.8rem;
  color: var(--slate);
  font-family: var(--font-mono);
}

/* Responsive */
@media (max-width: 640px) {
  .footer-top {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  .footer-nav { justify-content: center; }
  .footer-bottom { justify-content: center; text-align: center; }
}
</style>
