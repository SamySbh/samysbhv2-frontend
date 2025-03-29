<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { UserIcon } from '@heroicons/vue/24/solid';

const authStore = useAuthStore();

// Déterminer la route cible en fonction de l'état d'authentification et du rôle
const targetRoute = computed(() => {
  if (!authStore.isAuthenticated) {
    return '/login';
  }

  // Redirection basée sur le rôle
  return '/user';
});
</script>

<template>
  <RouterLink 
    :to="targetRoute" class="text-secondary hover:text-primary"
  >
    <UserIcon class="w-6 h-6" />
  </RouterLink>
</template>

