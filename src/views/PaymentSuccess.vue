<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useOrderStore } from '../stores/order.store';
import type { Order } from '../types';
import { CheckCircleIcon } from '@heroicons/vue/24/solid';

// Props
const props = defineProps<{
    sessionId?: string
}>();

// Hooks
const route = useRoute();
const orderStore = useOrderStore();

// Reactive states
const orderDetails = ref<Order | null>(null);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);

// Récupère le sessionId à partir des props ou du query param
const sessionId = props.sessionId || route.query.session_id as string;

// Methods
const fetchOrderDetails = async () => {
    if (!sessionId) {
        error.value = "Impossible de récupérer les détails de la commande";
        return;
    }

    loading.value = true;
    error.value = null;

    try {
        const order = await orderStore.getOrderBySessionId(sessionId);
        orderDetails.value = order;
    } catch (err) {
        console.error('Erreur lors de la récupération de la commande:', err);
        error.value = err instanceof Error ? err.message : 'Erreur inconnue';
    } finally {
        loading.value = false;
    }
};

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
};

const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
};

// Lifecycle hooks
onMounted(() => {
    fetchOrderDetails();
});
</script>

<template>
    <div class="min-h-screen bg-primary py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md mx-auto bg-secondary-ghost rounded-xl shadow-md overflow-hidden md:max-w-2xl">
            <div class="md:flex">
                <div class="p-8 w-full">
                    <div class="flex justify-center mb-4">
                        <CheckCircleIcon class="w-14 text-green-500"/>
                    </div>

                    <div class="text-center">
                        <h1 class="text-2xl font-bold text-primary mb-2">Paiement réussi !</h1>
                        <p class="text-primary-ghost mb-4">
                            Nous avons bien reçu votre paiement. Merci pour votre commande.
                        </p>

                        <div v-if="orderDetails" class="mb-4 bg-secondary-ghost p-4 rounded-lg">
                            <h2 class="text-lg font-medium text-primary mb-2">Détails de la commande</h2>
                            <div class="text-sm text-primary-ghost space-y-1">
                                <p><span class="font-medium">Identifiant de commande :</span> #{{ orderDetails.id }}</p>
                                <p><span class="font-medium">Montant total :</span> {{
                                    formatPrice(orderDetails.totalAmount) }}</p>
                                <p v-if="orderDetails.deadlineDate"><span class="font-medium">Date d'échéance:</span> {{
                                    formatDate(orderDetails.deadlineDate) }}</p>
                            </div>
                        </div>

                        <div v-else-if="loading" class="flex justify-center mb-4">
                            Chargement...
                        </div>

                        <div v-else-if="error" class="mb-4 text-red-500">
                            {{ error }}
                        </div>

                        <div class="space-y-3">
                            <router-link to="/user"
                                class="inline-block w-full bg-accent-ghost hover:bg-accent text-secondary  py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition duration-150 ease-in-out">
                                Accéder à mon tableau de bord
                            </router-link>

                            <router-link to="/services"
                                class="inline-block w-full bg-secondary-ghost hover:bg-secondary text-primary py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emphasis transition duration-150 ease-in-out">
                                Découvrir d'autres services
                            </router-link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>