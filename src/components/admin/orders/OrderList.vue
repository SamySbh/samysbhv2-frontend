<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useOrderStore } from '@/stores/order.store';
import { storeToRefs } from 'pinia';
import { Order } from '@/types/order';
import OrderCreate from './OrderCreate.vue';
import OrderEdit from './OrderEdit.vue';
import OrderDetails from './OrderDetails.vue';

// Fonction utilitaire pour le formatage de la date
const formatDate = (dateString?: Date | string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// Fonction pour générer une référence de commande
const getOrderReference = (order: Order): string => {
    if (!order.id) return 'N/A';
    // Utiliser les 6 premiers caractères de l'ID
    const shortId = order.id.substring(0, 6).toUpperCase();
    const date = order.createdAt ? new Date(order.createdAt) : new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `CMD-${year}${month}-${shortId}`;
};

// Fonctions pour obtenir les labels et classes des statuts
const getMainStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
        NEW: 'Nouveau',
        VALIDATED: 'Validé',
        IN_PROGRESS: 'En cours',
        COMPLETED: 'Terminé',
        ARCHIVED: 'Archivé'
    };
    return statusMap[status] || status;
};

const getPaymentStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
        PENDING_DEPOSIT: 'En attente d\'acompte',
        DEPOSIT_PAID: 'Acompte payé',
        PENDING_FINAL: 'En attente du solde',
        FULLY_PAID: 'Entièrement payé'
    };
    return statusMap[status] || status;
};

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

// Store commande
const orderStore = useOrderStore();
const { orders, loading } = storeToRefs(orderStore);

// État local
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDetailsModal = ref(false);
const selectedOrder = ref<Order | null>(null);

// Chargement des commandes
onMounted(async () => {
    try {
        await orderStore.getOrders();
    } catch (error) {
        console.error('Erreur lors du chargement des commandes:', error);
    }
});

// Ouvrir le modal de création
const openCreateModal = () => {
    showCreateModal.value = true;
};

// Ouvrir le modal d'édition
const openEditModal = (order: Order) => {
    selectedOrder.value = order;
    showEditModal.value = true;
};

// Ouvrir le modal de détails
const openDetailsModal = (order: Order) => {
    selectedOrder.value = order;
    showDetailsModal.value = true;
};

// Fermer les modals
const closeModals = () => {
    showCreateModal.value = false;
    showEditModal.value = false;
    showDetailsModal.value = false;
    selectedOrder.value = null;
};

// Supprimer une commande
const deleteOrder = async (orderId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
        return;
    }

    try {
        await orderStore.deleteOrder(orderId);
    } catch (error) {
        console.error('Erreur lors de la suppression de la commande:', error);
    }
};

// Rafraîchir la liste
const refreshList = async () => {
    try {
        await orderStore.getOrders();
        closeModals();
    } catch (error) {
        console.error('Erreur lors du rafraîchissement de la liste:', error);
    }
};
</script>
<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-secondary">Gestion des commandes</h2>
            <button @click="openCreateModal"
                class="bg-accent text-secondary px-4 py-2 rounded shadow hover:bg-accent/90 transition-colors">
                Créer une commande
            </button>
        </div>

        <!-- Loader -->
        <div v-if="loading" class="text-center py-8 text-secondary">
            Chargement des commandes...
        </div>

        <!-- Tableau des commandes -->
        <div v-else-if="orders.length > 0" class="bg-secondary rounded-lg shadow overflow-hidden overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-emphasis-ghost">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Référence</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Date
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Client</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Montant</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Statut</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Paiement</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                            Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-secondary divide-y divide-gray-300">
                    <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap font-medium">
                            {{ getOrderReference(order) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            {{ formatDate(order.createdAt) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            {{ order.user?.firstName }} {{ order.user?.lastName }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            {{ order.totalAmount.toFixed(2) }} €
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="getMainStatusClasses(order.statusMain)">
                                {{ getMainStatusLabel(order.statusMain) }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="getPaymentStatusClasses(order.statusPayment)">
                                {{ getPaymentStatusLabel(order.statusPayment) }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                            <button @click="openDetailsModal(order)"
                                class="bg-gray-300 text-primary-ghost px-3 py-1 rounded hover:bg-gray-300">
                                Détails
                            </button>
                            <button @click="openEditModal(order)"
                                class="bg-accent text-secondary px-3 py-1 rounded hover:bg-accent">
                                Modifier
                            </button>
                            <button @click="deleteOrder(order.id as string)"
                                class="bg-red-500 text-secondary px-3 py-1 rounded hover:bg-red-600">
                                Supprimer
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Message si aucune commande -->
        <div v-else-if="!loading" class="text-center py-8 bg-gray-50 rounded-lg">
            <p class="text-primary">Aucune commande disponible.</p>
            <button @click="openCreateModal"
                class="mt-4 bg-accent text-secondary px-4 py-2 rounded shadow hover:bg-accent/90 transition-colors">
                Créer une première commande
            </button>
        </div>

        <!-- Modal de création -->
        <OrderCreate v-if="showCreateModal" @close="closeModals" @order-created="refreshList" />

        <!-- Modal d'édition -->
        <OrderEdit v-if="showEditModal && selectedOrder" :order="selectedOrder" @close="closeModals"
            @order-updated="refreshList" />

        <!-- Modal de détails -->
        <OrderDetails v-if="showDetailsModal && selectedOrder" :order="selectedOrder" @close="closeModals" />
    </div>
</template>