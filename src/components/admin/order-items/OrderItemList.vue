<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useOrderItemStore } from '@/stores/order-items.store';
import { useOrderStore } from '@/stores/order.store';
import { useServiceStore } from '@/stores/service.store';
import { storeToRefs } from 'pinia';
import { OrderItem } from '@/types';
import OrderItemCreate from './OrderItemCreate.vue';
import OrderItemEdit from './OrderItemEdit.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';

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
const selectedOrderId = ref<string>('');

// Options pour le filtre
const orderFilterOptions = computed(() => [
    { value: '', label: 'Toutes les commandes' },
    ...orders.value.map(order => ({
        value: order.id as string,
        label: `${getOrderReference(order.id as string)} - ${order.totalAmount.toFixed(2)} €`
    }))
]);

// Chargement des données
onMounted(async () => {
    try {
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
            await orderItemStore.getOrderItemsByOrderId(selectedOrderId.value);
        } else {
            await orderItemStore.getOrderItems();
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
            <BaseButton variant="accent" @click="openCreateModal">
                Ajouter un item
            </BaseButton>
        </div>

        <!-- Filtre par commande -->
        <div class="mb-6 p-4 bg-secondary-ghost rounded-lg">
            <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                <div class="flex-grow">
                    <BaseSelect
                        v-model="selectedOrderId"
                        :options="orderFilterOptions"
                        label="Filtrer par commande"
                        @change="filterByOrder"
                    />
                </div>
            </div>
        </div>

        <!-- Loader -->
        <div v-if="loading" class="text-center py-8 text-secondary">
            Chargement des items de commande...
        </div>

        <!-- Tableau des items de commande -->
        <div v-else-if="orderItems.length > 0" class="table-container overflow-x-auto">
            <table class="min-w-full">
                <thead class="table-header">
                    <tr>
                        <th class="table-header-cell">ID</th>
                        <th class="table-header-cell">Commande</th>
                        <th class="table-header-cell">Service</th>
                        <th class="table-header-cell">Quantité</th>
                        <th class="table-header-cell">Prix unitaire</th>
                        <th class="table-header-cell">Montant total</th>
                        <th class="table-header-cell text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr v-for="item in orderItems" :key="item.id" class="table-row">
                        <td class="table-cell text-sm font-mono">
                            {{ item.id ? item.id.substring(0, 8) + '...' : 'N/A' }}
                        </td>
                        <td class="table-cell">
                            {{ getOrderReference(item.orderId) }}
                        </td>
                        <td class="table-cell">
                            {{ getServiceName(item.serviceId) }}
                        </td>
                        <td class="table-cell text-center">
                            {{ item.quantity }}
                        </td>
                        <td class="table-cell">
                            {{ item.unitAmount.toFixed(2) }} €
                        </td>
                        <td class="table-cell font-medium">
                            {{ item.totalAmount.toFixed(2) }} €
                        </td>
                        <td class="table-cell text-right space-x-2">
                            <BaseButton variant="accent" size="sm" @click="openEditModal(item)">
                                Modifier
                            </BaseButton>
                            <BaseButton variant="danger" size="sm" @click="deleteOrderItem(item.id as string)">
                                Supprimer
                            </BaseButton>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Message si aucun item -->
        <div v-else-if="!loading" class="text-center py-8 bg-secondary-ghost rounded-lg">
            <p class="text-primary-ghost">
                {{ selectedOrderId ? 'Aucun item trouvé pour cette commande.' : 'Aucun item de commande disponible.' }}
            </p>
            <BaseButton variant="accent" class="mt-4" @click="openCreateModal">
                Ajouter un item
            </BaseButton>
        </div>

        <!-- Modal de création -->
        <OrderItemCreate v-if="showCreateModal" :selected-order-id="selectedOrderId || null" @close="closeModals"
            @item-created="refreshList" />

        <!-- Modal d'édition -->
        <OrderItemEdit v-if="showEditModal && selectedOrderItem" :order-item="selectedOrderItem" @close="closeModals"
            @item-updated="refreshList" />
    </div>
</template>
