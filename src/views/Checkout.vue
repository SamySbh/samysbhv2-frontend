<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart.store';
import { useAuthStore } from '../stores/auth.store';
import { useOrderStore } from '../stores/order.store';
import { getDefaultUser } from '../types/user';

// Stores et router
const cartStore = useCartStore();
const authStore = useAuthStore();
const orderStore = useOrderStore();
const router = useRouter();

// États
const isSubmitting = ref(false);

// Computed
const cartItems = computed(() => cartStore.cartItems);
const cartTotal = computed(() => cartStore.cartTotal);
const depositAmount = computed(() => cartTotal.value * 0.3); // 30% d'acompte
const isCartEmpty = computed(() => cartItems.value.length === 0);

const user = computed(() => authStore.currentUser || getDefaultUser());

// Formatage du prix
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
};

// Vérification de l'authentification
onMounted(async () => {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    if (!authStore.isAuthenticated) {
        router.push({
            name: 'Login',
            query: { redirect: 'checkout' }
        });
    }
});

// Méthodes
const processOrder = async () => {
    if (isCartEmpty.value || !authStore.isAuthenticated) {
        return;
    }

    isSubmitting.value = true;

    try {
        // Vérifier si l'utilisateur a un ID
        if (!user.value.id) {
            throw new Error("Identifiant utilisateur manquant");
        }

        // Préparation des données de commande
        const orderData = cartStore.prepareOrderData(user.value.id);

        console.log("Données de commande préparées:", orderData); // Ajout d'un log pour debug

        // Créer la commande avec ses articles
        const createdOrder = await orderStore.createOrderWithItems({
            statusMain: orderData.statusMain,
            statusPayment: orderData.statusPayment,
            totalAmount: orderData.totalAmount,
            depositAmount: orderData.depositAmount,
            userId: orderData.userId,
            orderItems: orderData.orderItems // Inclure les articles de commande
        });

        console.log("Commande créée:", createdOrder); // Ajout d'un log pour debug

        // Rediriger vers la page de paiement Stripe
        if (createdOrder && typeof createdOrder === 'object') {
            // Récupérer l'ID de la commande, qui pourrait être dans createdOrder.order.id
            const orderId = createdOrder.id || (createdOrder.order && createdOrder.order.id);

            if (!orderId) {
                throw new Error("ID de commande manquant dans la réponse");
            }

            const sessionUrl = await orderStore.createCheckoutSession(orderId);

            // Vider le panier après création de la commande
            cartStore.clearCart();

            // Redirection vers la page de paiement Stripe
            window.location.href = sessionUrl;
        } else {
            throw new Error("Format de réponse invalide pour la création de commande");
        }
    } catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
        // Vous pourriez ajouter un message d'erreur visible pour l'utilisateur ici
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div class="container mx-auto py-8 px-4">
        <h1 class="text-2xl font-bold mb-6">Validation de commande</h1>

        <!-- Alerte si le panier est vide -->
        <div v-if="isCartEmpty" class="bg-secondary-ghost border-x-4 border-emphasis text-primary p-4 mb-6">
            <p>Votre panier est vide. Veuillez ajouter des services avant de procéder au paiement.</p>
            <button @click="router.push('/')" class="mt-2 text-accent hover:underline">
                Retour aux services
            </button>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Résumé du panier (2/3 colonnes) -->
            <div class="md:col-span-2">
                <div class="bg-secondary-ghost rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-semibold mb-4">Résumé de votre panier</h2>

                    <div class="divide-y divide-emphasis">
                        <!-- Liste des articles -->
                        <div v-for="item in cartItems" :key="item.serviceId" class="py-4">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="font-medium">{{ item.service.name }}</h3>
                                    <p class="text-sm text-primary-ghost">{{ item.service.description }}</p>
                                </div>
                                <div class="text-right">
                                    <p>{{ item.quantity }} × {{ formatPrice(item.unitAmount) }}</p>
                                    <p class="font-semibold">{{ formatPrice(item.totalAmount) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Total -->
                    <div class="mt-6 pt-4 border-t border-emphasis">
                        <div class="flex justify-between items-center">
                            <span class="font-semibold">Total</span>
                            <span class="text-xl font-bold">{{ formatPrice(cartTotal) }}</span>
                        </div>
                        <!--<div class="flex justify-between items-center text-sm text-primary-ghost mt-2">
                            <span>Acompte (30%)</span>
                            <span>{{ formatPrice(depositAmount) }}</span>
                        </div>-->
                    </div>
                </div>
            </div>

            <!-- Informations de paiement (1/3 colonne) -->
            <div class="md:col-span-1">
                <div class="bg-secondary-ghost rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-semibold mb-4">Procéder au paiement</h2>

                    <!-- Résumé utilisateur -->
                    <div class="mb-6 space-y-1">
                        <h3 class="font-medium mb-2 text-accent">Vos informations</h3>
                        <p>{{ user.firstName }} {{ user.lastName }}</p>
                        <p>{{ user.email }}</p>
                        <p v-if="user.company">{{ user.company }}</p>
                    </div>

                    <!-- Bouton de paiement -->
                    <button @click="processOrder" :disabled="isSubmitting"
                        class="w-full px-4 py-3 bg-accent-ghost text-secondary font-medium rounded-md hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed">
                        <div v-if="isSubmitting" class="flex items-center justify-center">
                            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-secondary" xmlns="http://www.w3.org/2000/svg"
                                fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                </path>
                            </svg>
                            Traitement...
                        </div>
                        <span v-else>Payer ({{ formatPrice(cartTotal) }})</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
