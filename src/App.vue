<script setup>
import NavBar from './components/NavBar.vue'
import HeroSection from './components/HeroSection.vue'
import AboutSection from './components/AboutSection.vue'
import EducationSection from './components/EducationSection.vue'
import ExperienceSection from './components/ExperienceSection.vue'
import ProjectsSection from './components/ProjectsSection.vue'
import SkillsSection from './components/SkillsSection.vue'
import ContactSection from './components/ContactSection.vue'
import FooterSection from './components/FooterSection.vue'
</script>

<template>
  <div id="portfolio">
    <NavBar />
    <main>
      <HeroSection />
      <AboutSection />
      <EducationSection />
      <ExperienceSection />
      <ProjectsSection />
      <SkillsSection />
      <ContactSection />
    </main>
    <FooterSection />
  </div>
</template>

<style>
#portfolio {
  min-height: 100vh;
}
</style>
