<template>
    <button @click="validateCart" :disabled="isCartEmpty || isLoading"
        class="px-6 py-2 rounded-md text-white font-medium transition-colors btn-primary"
        :class="[isCartEmpty ? 'opacity-50 cursor-not-allowed' : '']">
        <span v-if="isLoading">Chargement...</span>
        <span v-else>{{ buttonText }}</span>
    </button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores';
import { useAuthStore } from '@/stores';

// Props
defineProps({
    buttonText: {
        type: String,
        default: 'Valider mon panier'
    }
});

// Store et router
const cartStore = useCartStore();
const authStore = useAuthStore();
const router = useRouter();

// État local
const isLoading = ref(false);

// Computed
const isCartEmpty = computed(() => cartStore.itemCount === 0);

// Méthodes
const validateCart = async () => {
    if (isCartEmpty.value) {
        return;
    }

    isLoading.value = true;

    try {
        // Vérifier si l'utilisateur est connecté
        if (!authStore.isAuthenticated) {
            // Rediriger vers la page de connexion
            router.push({
                path: '/login',
                query: { redirect: 'checkout' } // Pour rediriger après connexion
            });
            return;
        }

        // Si l'utilisateur est connecté, rediriger vers la page de paiement
        router.push('/checkout');
    } catch (error) {
        console.error('Erreur lors de la validation du panier:', error);
    } finally {
        isLoading.value = false;
    }
};
</script>