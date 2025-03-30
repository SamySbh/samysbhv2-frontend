<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useServiceStore } from '@/stores'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import ServiceCard from '@/components/services/ServiceCard.vue'

// Récupération du store
const serviceStore = useServiceStore()

// Computed pour ne garder que les services actifs
const activeServices = computed(() => 
  serviceStore.services.filter(service => service.isActive)
)

onMounted(() =>
  serviceStore.getServices())
</script>

<template>
  <div class="min-h-screen py-16">
    <div class="container mx-auto px-4">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <SectionTitle title="Mes Services" />
        <p class="text-xl text-secondary">
          L'ensemble de nos solutions pour transformer vos ambitions en réalités.
        </p>
      </div>
      <section class="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        <ServiceCard 
          v-for="service in activeServices" 
          :key="service.id" 
          :service="service">
        </ServiceCard>
      </section>
      <div class="grid md:grid-cols-3 gap-8">
      </div>
    </div>
  </div>
</template>