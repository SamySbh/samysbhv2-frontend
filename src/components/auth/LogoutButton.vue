<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { ArrowRightStartOnRectangleIcon } from '@heroicons/vue/24/outline';

const authStore = useAuthStore();
const router = useRouter();

const isAuthenticated = computed(() => authStore.isAuthenticated);

const handleLogout = async () => {
    await authStore.logout();
    router.push('/');
};
</script>

<template>
    <button v-if="isAuthenticated" @click="handleLogout" class="text-secondary hover:text-primary"
        title="Se déconnecter">
        <ArrowRightStartOnRectangleIcon class="w-6 h-6" />
    </button>
</template>