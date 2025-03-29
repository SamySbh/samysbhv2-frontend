<script setup lang="ts">
import HeroSection from '@/components/home/HeroSection.vue';
import ServicePreviewSection from '@/components/home/ServicePreviewSection.vue';
import PortfolioSection from '@/components/home/PortfolioSection.vue';
import AboutMeSection from '@/components/home/AboutMeSection.vue';
import ProcessusSection from '@/components/home/ProcessusSection.vue';
import TechnologiesSection from '@/components/home/TechnologiesSection.vue';
import MyPathSection from '@/components/home/MyPathSection.vue';
</script>

<template>
  <div class="min-h-screen">
    <HeroSection />
    <ServicePreviewSection/>
    <PortfolioSection/>
    <AboutMeSection/>
    <MyPathSection/>
    <TechnologiesSection/>
    <ProcessusSection/>
  </div>
</template>