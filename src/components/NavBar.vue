<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isScrolled   = ref(false)
const mobileOpen   = ref(false)

const navLinks = [
  { href: '#about',      label: 'About'      },
  { href: '#education',  label: 'Education'  },
  { href: '#experience', label: 'Experience' },
  { href: '#projects',   label: 'Projects'   },
  { href: '#skills',     label: 'Skills'     },
  { href: '#contact',    label: 'Contact'    }
]

function onScroll() {
  isScrolled.value = window.scrollY > 40
}

onMounted(()  => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

function closeMenu() { mobileOpen.value = false }
</script>

<template>
  <nav :class="['navbar', { scrolled: isScrolled }]" aria-label="Primary navigation">
    <div class="container nav-inner">

      <!-- Logo -->
      <a href="#hero" class="nav-logo" @click="closeMenu">QZ</a>

      <!-- Desktop links -->
      <ul class="nav-links" :class="{ open: mobileOpen }">
        <li v-for="link in navLinks" :key="link.href">
          <a :href="link.href" @click="closeMenu">{{ link.label }}</a>
        </li>
        <li>
          <a href="mailto:zhangqi@arizona.edu" class="nav-cta" @click="closeMenu">
            Hire Me
          </a>
        </li>
      </ul>

      <!-- Hamburger -->
      <button
        class="hamburger"
        :class="{ active: mobileOpen }"
        @click="mobileOpen = !mobileOpen"
        aria-label="Toggle menu"
      >
        <span /><span /><span />
      </button>

    </div>
  </nav>

  <!-- Overlay for mobile -->
  <div v-if="mobileOpen" class="nav-overlay" @click="closeMenu" />
</template>

<style scoped>
.navbar {
  position: fixed;
  inset-block-start: 0;
  inset-inline: 0;
  z-index: 900;
  height: var(--nav-height);
  background: transparent;
  transition: background var(--transition), box-shadow var(--transition);
}

.navbar.scrolled {
  background: rgba(10, 25, 47, 0.96);
  backdrop-filter: blur(12px);
  box-shadow: 0 2px 24px rgba(0, 0, 0, 0.35);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

/* Logo */
.nav-logo {
  font-family: var(--font-mono);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--teal);
  letter-spacing: 3px;
  transition: opacity var(--transition);
}
.nav-logo:hover { opacity: 0.8; }

/* Links list */
.nav-links {
  display: flex;
  align-items: center;
  gap: 28px;
}

.nav-links a {
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--slate-3);
  letter-spacing: 0.4px;
  transition: color var(--transition);
}
.nav-links a:hover { color: var(--teal); }

/* CTA button in nav */
.nav-cta {
  padding: 7px 18px;
  border: 1px solid var(--teal) !important;
  border-radius: 4px;
  color: var(--teal) !important;
  transition: background var(--transition) !important;
}
.nav-cta:hover { background: var(--teal-dim) !important; }

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
}
.hamburger span {
  display: block;
  width: 100%;
  height: 2px;
  background: var(--slate-3);
  border-radius: 2px;
  transition: transform var(--transition), opacity var(--transition);
  transform-origin: center;
}
.hamburger.active span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.hamburger.active span:nth-child(2) { opacity: 0; }
.hamburger.active span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* Overlay */
.nav-overlay {
  position: fixed;
  inset: 0;
  z-index: 899;
  background: rgba(0, 0, 0, 0.4);
}

/* ---- Mobile ---- */
@media (max-width: 768px) {
  .hamburger { display: flex; }

  .nav-links {
    position: fixed;
    top: var(--nav-height);
    right: -100%;
    width: 260px;
    height: calc(100dvh - var(--nav-height));
    background: var(--navy-2);
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 36px;
    z-index: 950;
    transition: right var(--transition);
    box-shadow: -6px 0 32px rgba(0, 0, 0, 0.4);
  }

  .nav-links.open { right: 0; }

  .nav-links a { font-size: 1.05rem; }
}
</style>
