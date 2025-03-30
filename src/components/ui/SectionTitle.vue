<script setup lang="ts">
import astronautSpray from '@/assets/illustrations/astronaut-spray.svg' 
defineProps({
  title: {
    type: String,
    required: true
  },
  astronautImage: {
    type: String,
    default: astronautSpray
  }
})
</script>

<template>
  <div class="grid grid-cols-[1fr_auto_1fr] items-center justify-center gap-2 my-8 relative w-fit mx-auto">
    <div class="absolute blur-xl opacity-70 -inset-1 bg-gradient-to-r from-accent to-emphasis rounded"></div>
    <div class="text-right">
      <img class="scale-x-[-1]" :src="astronautImage" alt="Astronaute">
    </div>
    <h2 class="relative title">{{ title }}</h2>
    <div class="relative">
      <img class="w-16" :src="astronautImage" alt="Astronaute">
    </div>
  </div>
</template>