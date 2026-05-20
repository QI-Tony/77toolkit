<script setup>
import { resumeData } from '../data/resume.js'
const { personal } = resumeData
</script>

<template>
  <section id="hero" class="hero">
    <!-- Ambient gradient layer -->
    <div class="hero-ambient" aria-hidden="true" />

    <div class="container hero-body">
      <p class="hero-greeting">Hi, my name is</p>
      <h1 class="hero-name">{{ personal.name }}</h1>
      <h2 class="hero-title">{{ personal.title }}</h2>
      <p class="hero-desc">{{ personal.tagline }}</p>

      <div class="hero-actions">
        <a href="#projects" class="btn btn-primary">View My Work</a>
        <a href="#contact"  class="btn btn-outline">Get In Touch</a>
      </div>

      <!-- Status badge -->
      <div class="hero-badge">
        <span class="badge-dot" />
        {{ personal.status }}
      </div>
    </div>

    <!-- Scroll hint -->
    <div class="scroll-hint" aria-hidden="true">
      <span class="scroll-label">scroll</span>
      <span class="scroll-line" />
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100dvh;
  background: var(--navy);
  display: flex;
  align-items: center;
  overflow: hidden;
}

/* Soft ambient blobs */
.hero-ambient {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 55% at 18% 55%, rgba(100, 255, 218, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse 50% 45% at 82% 20%, rgba(14, 165, 233, 0.06) 0%, transparent 60%);
  pointer-events: none;
}

.hero-body {
  position: relative;
  z-index: 1;
  max-width: 700px;
  padding-top: calc(var(--nav-height) + 20px);
  padding-bottom: 60px;
}

/* Greeting line */
.hero-greeting {
  font-family: var(--font-mono);
  font-size: 1rem;
  color: var(--teal);
  letter-spacing: 1px;
  margin-bottom: 14px;
}

/* Name */
.hero-name {
  font-size: clamp(2.6rem, 7vw, 5.2rem);
  font-weight: 800;
  color: var(--slate-3);
  line-height: 1.05;
  margin-bottom: 10px;
  letter-spacing: -1px;
}

/* Subtitle */
.hero-title {
  font-size: clamp(1.1rem, 2.5vw, 1.75rem);
  font-weight: 400;
  color: var(--slate);
  margin-bottom: 28px;
}

/* Description */
.hero-desc {
  font-size: 1.05rem;
  color: var(--slate);
  line-height: 1.8;
  max-width: 560px;
  margin-bottom: 44px;
}

/* CTAs */
.hero-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

/* Status badge */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--teal);
  background: var(--teal-dim);
  border: 1px solid rgba(100, 255, 218, 0.2);
  font-family: var(--font-mono);
}

.badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--teal);
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1);   }
  50%       { opacity: 0.5; transform: scale(0.85); }
}

/* Scroll hint */
.scroll-hint {
  position: absolute;
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--slate);
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 2.5px;
  text-transform: uppercase;
}

.scroll-line {
  display: block;
  width: 1px;
  height: 52px;
  background: linear-gradient(to bottom, var(--slate), transparent);
  animation: scrollAnim 1.8s ease-in-out infinite;
}

@keyframes scrollAnim {
  0%, 100% { opacity: 1; transform: scaleY(1)    translateY(0); }
  50%       { opacity: 0.3; transform: scaleY(0.7) translateY(6px); }
}

/* Mobile */
@media (max-width: 768px) {
  .hero-body {
    text-align: center;
    max-width: 100%;
  }
  .hero-actions { justify-content: center; }
  .hero-badge   { margin: 0 auto; }
  .scroll-hint  { display: none; }
}
</style>
