<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useOrderItemStore } from '@/stores/order-items.store';
import { useOrderStore } from '@/stores/order.store';
import { useServiceStore } from '@/stores/service.store';
import { storeToRefs } from 'pinia';
import { OrderItem } from '@/types';
import OrderItemCreate from './OrderItemCreate.vue';
import OrderItemEdit from './OrderItemEdit.vue';

// Stores
const orderItemStore = useOrderItemStore();
const orderStore = useOrderStore();
const serviceStore = useServiceStore();

// Extraire les données des stores
const { orderItems, loading } = storeToRefs(orderItemStore);
const { orders } = storeToRefs(orderStore);
const { services } = storeToRefs(serviceStore);

// État local
const showCreateModal = ref(false);
const showEditModal = ref(false);
const selectedOrderItem = ref<OrderItem | null>(null);

// Filtres
const selectedOrderId = ref<string | null>(null);

// Chargement des données
onMounted(async () => {
    try {
        // Charger les items de commande, les commandes et les services
        await Promise.all([
            orderItemStore.getOrderItems(),
            orderStore.getOrders(),
            serviceStore.getServices()
        ]);
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
});

// Ouvrir le modal de création
const openCreateModal = () => {
    showCreateModal.value = true;
};

// Ouvrir le modal d'édition
const openEditModal = (orderItem: OrderItem) => {
    selectedOrderItem.value = orderItem;
    showEditModal.value = true;
};

// Fermer les modals
const closeModals = () => {
    showCreateModal.value = false;
    showEditModal.value = false;
    selectedOrderItem.value = null;
};

// Supprimer un item de commande
const deleteOrderItem = async (orderItemId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet item de commande ?')) {
        return;
    }

    try {
        await orderItemStore.deleteOrderItem(orderItemId);
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'item de commande:', error);
    }
};

// Rafraîchir la liste
const refreshList = async () => {
    try {
        if (selectedOrderId.value) {
            await orderItemStore.getOrderItemsByOrderId(selectedOrderId.value);
        } else {
            await orderItemStore.getOrderItems();
        }
        closeModals();
    } catch (error) {
        console.error('Erreur lors du rafraîchissement de la liste:', error);
    }
};

// Filtrer les items par commande
const filterByOrder = async () => {
    try {
        if (selectedOrderId.value) {
            console.log(`Filtrage pour la commande: ${selectedOrderId.value}`);
            await orderItemStore.getOrderItemsByOrderId(selectedOrderId.value);
            console.log(`Résultats obtenus: ${orderItems.value.length} items`);
        } else {
            console.log('Chargement de tous les items');
            await orderItemStore.getOrderItems();
            console.log(`Résultats obtenus: ${orderItems.value.length} items`);
        }
    } catch (error) {
        console.error('Erreur lors du filtrage des items:', error);
    }
}

// Génère une référence de commande
const getOrderReference = (orderId: string): string => {
    const order = orders.value.find(o => o.id === orderId);
    if (!order || !order.id) return 'Commande non trouvée';

    const shortId = order.id.substring(0, 6).toUpperCase();
    const date = order.createdAt ? new Date(order.createdAt) : new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `CMD-${year}${month}-${shortId}`;
};

// Récupère le nom du service
const getServiceName = (serviceId: string): string => {
    const service = services.value.find(s => s.id === serviceId);
    return service ? service.name : 'Service non trouvé';
};
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-secondary">Gestion des items de commande</h2>
            <button @click="openCreateModal"
                class="bg-accent text-secondary px-4 py-2 rounded shadow hover:bg-accent/90 transition-colors">
                Ajouter un item
            </button>
        </div>

        <!-- Filtre par commande -->
        <div class="mb-6 p-4 bg-gray-50 rounded-lg">
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                <div class="flex-grow">
                    <label for="orderFilter" class="block text-sm font-medium text-primary-ghost mb-1">Filtrer par
                        commande</label>
                    <select id="orderFilter" v-model="selectedOrderId" @change="filterByOrder"
                        class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent">
                        <!-- options -->
                        <option :value="null">Toutes les commandes</option>
                        <option v-for="order in orders" :key="order.id" :value="order.id">
                            {{ getOrderReference(order.id as string) }} - {{ order.totalAmount.toFixed(2) }} €
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Loader -->
        <div v-if="loading" class="text-center py-8 text-secondary">
            Chargement des items de commande...
        </div>

        <!-- Tableau des items de commande -->
        <div v-else-if="orderItems.length > 0" class="bg-secondary rounded-lg shadow overflow-hidden overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-emphasis-ghost">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">ID
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Commande</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Service</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Quantité</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Prix
                            unitaire</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Montant total</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                            Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-secondary divide-y divide-gray-300">
                    <tr v-for="item in orderItems" :key="item.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-mono">
                            {{ item.id ? item.id.substring(0, 8) + '...' : 'N/A' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            {{ getOrderReference(item.orderId) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            {{ getServiceName(item.serviceId) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-center">
                            {{ item.quantity }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            {{ item.unitAmount.toFixed(2) }} €
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap font-medium">
                            {{ item.totalAmount.toFixed(2) }} €
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                            <button @click="openEditModal(item)"
                                class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                                Modifier
                            </button>
                            <button @click="deleteOrderItem(item.id as string)"
                                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                Supprimer
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Message si aucun item -->
        <div v-else-if="!loading" class="text-center py-8 bg-gray-50 rounded-lg">
            <p class="text-gray-500">
                {{ selectedOrderId ? 'Aucun item trouvé pour cette commande.' : 'Aucun item de commande disponible.' }}
            </p>
            <button @click="openCreateModal"
                class="mt-4 bg-accent text-secondary px-4 py-2 rounded shadow hover:bg-accent/90 transition-colors">
                Ajouter un item
            </button>
        </div>

        <!-- Modal de création -->
        <OrderItemCreate v-if="showCreateModal" :selected-order-id="selectedOrderId" @close="closeModals"
            @item-created="refreshList" />

        <!-- Modal d'édition -->
        <OrderItemEdit v-if="showEditModal && selectedOrderItem" :order-item="selectedOrderItem" @close="closeModals"
            @item-updated="refreshList" />
    </div>
</template>