<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart.store';
import { useAuthStore } from '../stores/auth.store';
import { useOrderStore } from '../stores/order.store';
import { getDefaultUser } from '../types/user';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

// Stores et router
const cartStore = useCartStore();
const authStore = useAuthStore();
const orderStore = useOrderStore();
const router = useRouter();

// Navigation vers la demande de projet
function goToProjectRequest() {
    if (cartStore.cartItems.length === 0) {
        return;
    }
    router.push('/demande-projet');
}

// États
const isSubmitting = ref(false);

// Computed
const cartItems = computed(() => cartStore.cartItems);
const cartTotal = computed(() => cartStore.cartTotal);
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
        if (!user.value.id) {
            throw new Error("Identifiant utilisateur manquant");
        }

        const orderData = cartStore.prepareOrderData(user.value.id);

        const createdOrder = await orderStore.createOrderWithItems({
            statusMain: orderData.statusMain,
            statusPayment: orderData.statusPayment,
            totalAmount: orderData.totalAmount,
            depositAmount: orderData.depositAmount,
            userId: orderData.userId,
            orderItems: orderData.orderItems
        });

        if (createdOrder && typeof createdOrder === 'object') {
            const orderId = createdOrder.id || (createdOrder.order && createdOrder.order.id);

            if (!orderId) {
                throw new Error("ID de commande manquant dans la réponse");
            }

            const sessionUrl = await orderStore.createCheckoutSession(orderId);

            cartStore.clearCart();

            window.location.href = sessionUrl;
        } else {
            throw new Error("Format de réponse invalide pour la création de commande");
        }
    } catch (error) {
        console.error('Erreur lors de la création de la commande:', error);
    } finally {
        isSubmitting.value = false;
    }
};
</script>

<template>
    <div class="container mx-auto py-8 px-4">
        <h1 class="text-2xl font-bold mb-6 text-primary">Validation de commande</h1>

        <!-- Alerte si le panier est vide -->
        <BaseAlert v-if="isCartEmpty" variant="warning" class="mb-6">
            <p>Votre panier est vide. Veuillez ajouter des services avant de procéder au paiement.</p>
            <BaseButton variant="ghost" class="mt-2" @click="router.push('/')">
                Retour aux services
            </BaseButton>
        </BaseAlert>

        <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Résumé du panier (2/3 colonnes) -->
            <div class="md:col-span-2">
                <div class="bg-secondary-ghost rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-semibold mb-4 text-primary">Résumé de votre panier</h2>

                    <div class="divide-y divide-emphasis">
                        <!-- Liste des articles -->
                        <div v-for="item in cartItems" :key="item.serviceId" class="py-4">
                            <div class="flex justify-between items-start">
                                <div>
                                    <h3 class="font-medium text-primary">{{ item.service.name }}</h3>
                                    <p class="text-sm text-primary-ghost">{{ item.service.description }}</p>
                                </div>
                                <div class="text-right">
                                    <p class="text-primary">{{ item.quantity }} × {{ formatPrice(item.unitAmount) }}</p>
                                    <p class="font-semibold text-primary">{{ formatPrice(item.totalAmount) }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Total -->
                    <div class="mt-6 pt-4 border-t border-emphasis">
                        <div class="flex justify-between items-center">
                            <span class="font-semibold text-primary">Total</span>
                            <span class="text-xl font-bold text-accent">{{ formatPrice(cartTotal) }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Informations de paiement (1/3 colonne) -->
            <div class="md:col-span-1">
                <div class="bg-secondary-ghost rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-semibold mb-4 text-primary">Procéder au paiement</h2>

                    <!-- Résumé utilisateur -->
                    <div class="mb-6 space-y-1">
                        <h3 class="font-medium mb-2 text-accent">Vos informations</h3>
                        <p class="text-primary">{{ user.firstName }} {{ user.lastName }}</p>
                        <p class="text-primary">{{ user.email }}</p>
                        <p v-if="user.company" class="text-primary">{{ user.company }}</p>
                    </div>

                    <!-- Bouton demande de devis -->
                    <BaseButton
                        variant="accent"
                        full-width
                        @click="goToProjectRequest"
                        class="mb-3"
                    >
                        Demander un devis personnalisé
                    </BaseButton>

                    <p class="text-sm text-primary-ghost text-center mb-4">
                        Recevez un devis sur-mesure sous 24-48h
                    </p>

                    <div class="border-t border-emphasis pt-4 mt-4">
                        <p class="text-sm text-primary-ghost text-center mb-3">Ou payez directement</p>

                        <!-- Bouton de paiement -->
                        <BaseButton
                            variant="primary"
                            full-width
                            :loading="isSubmitting"
                            @click="processOrder"
                        >
                            <template #loading>Traitement...</template>
                            Payer ({{ formatPrice(cartTotal) }})
                        </BaseButton>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
