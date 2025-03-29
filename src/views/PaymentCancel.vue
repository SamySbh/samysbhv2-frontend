<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useOrderStore } from '../stores/order.store';
import { usePaymentStore } from '../stores/payment.store';
import type { Order } from '../types';
import { CheckBadgeIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/solid';

// Props
const props = defineProps<{
    sessionId?: string
}>();

// Hooks
const route = useRoute();
const router = useRouter();
const orderStore = useOrderStore();
const paymentStore = usePaymentStore();

// Reactive state
const orderDetails = ref<Order | null>(null);
const loading = ref<boolean>(false);
const error = ref<string | null>(null);
const isRetrying = ref<boolean>(false);

// Récupérer le sessionId à partir des props ou du query param
const sessionId = props.sessionId || route.query.session_id as string;

const recommendations: string[] = [
    "Vérifiez les informations de votre carte bancaire",
    "Assurez-vous que votre carte est autorisée pour les paiements en ligne",
    "Contactez votre banque si le problème persiste"
]

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

const retryPayment = async () => {
    if (!orderDetails.value || !orderDetails.value.id) return;

    isRetrying.value = true;

    try {
        const sessionUrl = await paymentStore.createCheckoutSession(orderDetails.value.id);
        if (sessionUrl) {
            window.location.href = sessionUrl;
        } else {
            throw new Error("Impossible de créer une session de paiement");
        }
    } catch (err) {
        console.error('Erreur lors de la création d\'une nouvelle session de paiement:', err);
        error.value = err instanceof Error ? err.message : 'Erreur inconnue';
    } finally {
        isRetrying.value = false;
    }
};

const contactSupport = () => {
    // Rediriger vers la page de contact ou ouvrir un modal
    router.push('/contact');
};

const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
};

const translateError = (errorMessage: string): string => {
    // Traduire les messages d'erreur de Stripe en français
    if (errorMessage.includes('card_declined')) {
        return "Votre carte a été refusée par la banque";
    } else if (errorMessage.includes('insufficient_funds')) {
        return "Fonds insuffisants sur votre carte";
    } else if (errorMessage.includes('expired_card')) {
        return "Votre carte est expirée";
    } else if (errorMessage.includes('incorrect_cvc')) {
        return "Le code de sécurité (CVC) est incorrect";
    }

    return "Une erreur est survenue lors du traitement du paiement";
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
                    <div class="flex justify-center mb-6">
                        <ExclamationTriangleIcon class="w-12 text-red-500" />
                    </div>

                    <div class="text-center">
                        <h1 class="text-2xl font-bold text-primary mb-2">Paiement non finalisé</h1>
                        <p class="text-primary-ghost mb-6">
                            Nous n'avons pas pu traiter votre paiement. Votre commande est en attente.
                        </p>

                        <div v-if="orderDetails" class="mb-6 bg-gray-50 p-4 rounded-lg">
                            <h2 class="text-lg font-medium text-primary mb-2">Détails de la commande</h2>
                            <div class="text-sm text-primary-ghost space-y-1">
                                <p><span class="font-medium">Numéro de commande:</span> #{{ orderDetails.id }}</p>
                                <p><span class="font-medium">Montant total:</span> {{
                                    formatPrice(orderDetails.totalAmount) }}</p>
                                <div v-if="orderDetails.paymentError" class="mt-3 text-red-600">
                                    <p class="font-medium">Motif:</p>
                                    <p>{{ translateError(orderDetails.paymentError) }}</p>
                                </div>
                            </div>
                        </div>

                        <div v-else-if="loading" class="flex justify-center mb-6">
                            Chargement...
                        </div>

                        <div v-else-if="error" class="mb-6 text-red-500">
                            {{ error }}
                        </div>

                        <div class="mb-6">
                            <h2 class="text-lg font-medium text-primary mb-2">Que faire maintenant ?</h2>
                            <ul class="text-sm text-primary-ghost text-left space-y-2">
                                <li v-for="recommendation in recommendations" class="flex items-center gap-2">
                                    <CheckBadgeIcon class="w-6 text-emphasis" />
                                    <span>{{ recommendation }}</span>
                                </li>
                            </ul>
                        </div>

                        <div class="space-y-3">
                            <button v-if="orderDetails" @click="retryPayment"
                                class="inline-block w-full bg-accent-ghost hover:bg-accent text-secondary font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition duration-150 ease-in-out"
                                :disabled="isRetrying">
                                <span v-if="isRetrying">
                                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-secondary inline-block"
                                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                            stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                        </path>
                                    </svg>
                                    Traitement en cours...
                                </span>
                                <span v-else>Réessayer le paiement</span>
                            </button>

                            <router-link to="/user"
                                class="inline-block w-full bg-secondary-ghost hover:bg-secondary text-primary font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emphasis transition duration-150 ease-in-out">
                                Retour au tableau de bord
                            </router-link>

                            <button @click="contactSupport"
                                class="inline-block w-full text-accent-ghost hover:text-accent text-sm font-medium">
                                Besoin d'aide ? Contactez-nous
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>