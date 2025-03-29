<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useOrderStore } from '@/stores/order.store';
import { Order } from '@/types/order';
import { OrderItem, User } from '@/types';

// Props
const props = defineProps<{
    order: Order;
}>();

// Store
const orderStore = useOrderStore();

// Émetteurs d'événements
const emit = defineEmits<{
    (e: 'close'): void;
}>();

const orderItems = ref<OrderItem[]>([]);
const userDetails = ref<User | null>(null); // Ajout de null au type
const isLoading = ref(false);
const fullOrder = ref<Order | null>(null); // Ajout de null au type

// Récupérer les détails complets de la commande
onMounted(async () => {
    if (props.order.id) {
        isLoading.value = true;
        try {
            await orderStore.getOrderById(props.order.id);
            
            // Accéder à la commande via le store
            if (orderStore.order) {
                fullOrder.value = orderStore.order;
                orderItems.value = orderStore.order.orderItems || [];
                userDetails.value = orderStore.order.user || null;
            }
        } catch (error) {
            console.error('Erreur lors du chargement des détails de la commande:', error);
        } finally {
            isLoading.value = false;
        }
    }
});
// Formater une date
const formatDate = (dateString?: Date | string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Générer une référence de commande
const getOrderReference = (order: Order): string => {
    if (!order.id) return 'N/A';
    const shortId = order.id.substring(0, 6).toUpperCase();
    const date = order.createdAt ? new Date(order.createdAt) : new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `CMD-${year}${month}-${shortId}`;
};

// Labels des statuts
const mainStatusLabels: Record<string, string> = {
    NEW: 'Nouveau',
    VALIDATED: 'Validé',
    IN_PROGRESS: 'En cours',
    COMPLETED: 'Terminé',
    ARCHIVED: 'Archivé'
};

const paymentStatusLabels: Record<string, string> = {
    PENDING_DEPOSIT: 'En attente d\'acompte',
    DEPOSIT_PAID: 'Acompte payé',
    PENDING_FINAL: 'En attente du solde',
    FULLY_PAID: 'Entièrement payé'
};

// Classes des statuts
const getMainStatusClasses = (status: string): string => {
    const classMap: Record<string, string> = {
        NEW: 'bg-blue-100 text-blue-800',
        VALIDATED: 'bg-purple-100 text-purple-800',
        IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
        COMPLETED: 'bg-green-100 text-green-800',
        ARCHIVED: 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 text-xs rounded-full ${classMap[status] || 'bg-gray-100 text-gray-800'}`;
};

const getPaymentStatusClasses = (status: string): string => {
    const classMap: Record<string, string> = {
        PENDING_DEPOSIT: 'bg-red-100 text-red-800',
        DEPOSIT_PAID: 'bg-yellow-100 text-yellow-800',
        PENDING_FINAL: 'bg-blue-100 text-blue-800',
        FULLY_PAID: 'bg-green-100 text-green-800'
    };
    return `px-2 py-1 text-xs rounded-full ${classMap[status] || 'bg-gray-100 text-gray-800'}`;
};

// Fermer le modal
const closeModal = () => {
    emit('close');
};
</script>

<template>
    <!-- Fond semi-transparent -->
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
        <!-- Modal -->
        <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 my-8">
            <!-- En-tête du modal -->
            <div class="px-6 py-4 border-b border-gray-300">
                <h3 class="text-lg font-semibold text-primary">Détails de la commande</h3>
            </div>

            <!-- Corps du modal -->
            <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
                <!-- Loader -->
                <div v-if="isLoading" class="py-8 text-center text-gray-500">
                    Chargement des détails...
                </div>

                <div v-else class="space-y-6">
                    <!-- En-tête de la commande -->
                    <div
                        class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <div class="font-semibold text-lg">{{ getOrderReference(order) }}</div>
                            <div class="text-sm text-gray-500">Créée le {{ formatDate(order.createdAt) }}</div>
                        </div>

                        <div class="flex gap-2">
                            <span :class="getMainStatusClasses(order.statusMain)">
                                {{ mainStatusLabels[order.statusMain] || order.statusMain }}
                            </span>
                            <span :class="getPaymentStatusClasses(order.statusPayment)">
                                {{ paymentStatusLabels[order.statusPayment] || order.statusPayment }}
                            </span>
                        </div>
                    </div>

                    <!-- Détails client -->
                    <div class="bg-white rounded-lg shadow border border-gray-300 overflow-hidden">
                        <div class="px-4 py-3 bg-gray-50 border-b border-gray-300">
                            <h3 class="font-medium">Informations client</h3>
                        </div>
                        <div class="p-4" v-if="userDetails">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 class="text-xs text-gray-500 uppercase mb-1">Nom</h4>
                                    <p>{{ userDetails.firstName }} {{ userDetails.lastName }}</p>
                                </div>
                                <div>
                                    <h4 class="text-xs text-gray-500 uppercase mb-1">Email</h4>
                                    <p>{{ userDetails.email }}</p>
                                </div>
                                <div>
                                    <h4 class="text-xs text-gray-500 uppercase mb-1">Téléphone</h4>
                                    <p>{{ userDetails.phone || 'Non renseigné' }}</p>
                                </div>
                                <div>
                                    <h4 class="text-xs text-gray-500 uppercase mb-1">Entreprise</h4>
                                    <p>{{ userDetails.company || 'Non renseignée' }}</p>
                                </div>
                            </div>
                        </div>
                        <div class="p-4" v-else>
                            <p class="text-gray-500">Informations client non disponibles</p>
                        </div>
                    </div>

                    <!-- Détails financiers -->
                    <div class="bg-white rounded-lg shadow border border-gray-300 overflow-hidden">
                        <div class="px-4 py-3 bg-gray-50 border-b border-gray-300">
                            <h3 class="font-medium">Informations financières</h3>
                        </div>
                        <div class="p-4">
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <h4 class="text-xs text-gray-500 uppercase mb-1">Montant total</h4>
                                    <p class="font-semibold">{{ order.totalAmount.toFixed(2) }} €</p>
                                </div>
                                <div>
                                    <h4 class="text-xs text-gray-500 uppercase mb-1">Acompte</h4>
                                    <p>{{ order.depositAmount.toFixed(2) }} €</p>
                                </div>
                                <div>
                                    <h4 class="text-xs text-gray-500 uppercase mb-1">Date d'échéance</h4>
                                    <p>{{ order.deadlineDate ? formatDate(order.deadlineDate) : 'Non définie' }}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Items de commande -->
                    <div class="bg-white rounded-lg shadow border border-gray-300 overflow-hidden">
                        <div class="px-4 py-3 bg-gray-50 border-b border-gray-300">
                            <h3 class="font-medium">Items de la commande</h3>
                        </div>
                        <div v-if="orderItems.length > 0" class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-300">
                                <thead class="bg-emphasis-ghost">
                                    <tr>
                                        <th class="px-4 py-3 text-left text-xs font-medium text-secondary uppercase">
                                            Service</th>
                                        <th class="px-4 py-3 text-right text-xs font-medium text-secondary uppercase">
                                            Prix unitaire</th>
                                        <th class="px-4 py-3 text-right text-xs font-medium text-secondary uppercase">
                                            Quantité</th>
                                        <th class="px-4 py-3 text-right text-xs font-medium text-secondary uppercase">
                                            Montant total</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-300">
                                    <tr v-for="item in orderItems" :key="item.id">
                                        <td class="px-4 py-2">{{ item.service?.name || 'Service non disponible' }}</td>
                                        <td class="px-4 py-2 text-right">{{ item.unitAmount.toFixed(2) }} €</td>
                                        <td class="px-4 py-2 text-right">{{ item.quantity }}</td>
                                        <td class="px-4 py-2 text-right font-medium">{{ item.totalAmount.toFixed(2) }} €
                                        </td>
                                    </tr>
                                </tbody>
                                <tfoot class="bg-gray-50">
                                    <tr>
                                        <td colspan="3" class="px-4 py-2 text-right font-medium">Total</td>
                                        <td class="px-4 py-2 text-right font-bold">{{ order.totalAmount.toFixed(2) }} €
                                        </td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                        <div class="p-4" v-else>
                            <p class="text-gray-500">Aucun item dans cette commande</p>
                        </div>
                    </div>

                    <!-- Informations Stripe si disponibles -->
                    <div v-if="order.stripeSessionId || order.stripePaymentIntentId"
                        class="bg-white rounded-lg shadow border border-gray-300 overflow-hidden">
                        <div class="px-4 py-3 bg-gray-50 border-b border-gray-300">
                            <h3 class="font-medium">Informations de paiement Stripe</h3>
                        </div>
                        <div class="p-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div v-if="order.stripeSessionId">
                                    <h4 class="text-xs text-gray-500 uppercase mb-1">Session ID</h4>
                                    <p class="text-xs font-mono break-all">{{ order.stripeSessionId }}</p>
                                </div>
                                <div v-if="order.stripePaymentIntentId">
                                    <h4 class="text-xs text-gray-500 uppercase mb-1">Payment Intent ID</h4>
                                    <p class="text-xs font-mono break-all">{{ order.stripePaymentIntentId }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pied du modal -->
            <div class="px-6 py-4 border-t border-gray-300 flex justify-end">
                <button @click="closeModal" class="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90">
                    Fermer
                </button>
            </div>
        </div>
    </div>
</template>