<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useOrderStore } from '@/stores/order.store';
import { storeToRefs } from 'pinia';
import { Order } from '@/types/order';
import OrderCreate from './OrderCreate.vue';
import OrderEdit from './OrderEdit.vue';
import OrderDetails from './OrderDetails.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import {
    formatDate,
    getOrderReference,
    getMainStatusLabel,
    getPaymentStatusLabel,
    getMainStatusVariant,
    getPaymentStatusVariant,
} from '@/utils/status.utils';

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
            <BaseButton variant="accent" @click="openCreateModal">
                Créer une commande
            </BaseButton>
        </div>

        <!-- Loader -->
        <div v-if="loading" class="text-center py-8 text-secondary">
            Chargement des commandes...
        </div>

        <!-- Tableau des commandes -->
        <div v-else-if="orders.length > 0" class="table-container overflow-x-auto">
            <table class="min-w-full">
                <thead class="table-header">
                    <tr>
                        <th class="table-header-cell">Référence</th>
                        <th class="table-header-cell">Date</th>
                        <th class="table-header-cell">Client</th>
                        <th class="table-header-cell">Montant</th>
                        <th class="table-header-cell">Statut</th>
                        <th class="table-header-cell">Paiement</th>
                        <th class="table-header-cell text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr v-for="order in orders" :key="order.id" class="table-row">
                        <td class="table-cell font-medium">
                            {{ getOrderReference(order) }}
                        </td>
                        <td class="table-cell">
                            {{ formatDate(order.createdAt) }}
                        </td>
                        <td class="table-cell">
                            {{ order.user?.firstName }} {{ order.user?.lastName }}
                        </td>
                        <td class="table-cell">
                            {{ order.totalAmount.toFixed(2) }} €
                        </td>
                        <td class="table-cell">
                            <BaseBadge :variant="getMainStatusVariant(order.statusMain)">
                                {{ getMainStatusLabel(order.statusMain) }}
                            </BaseBadge>
                        </td>
                        <td class="table-cell">
                            <BaseBadge :variant="getPaymentStatusVariant(order.statusPayment)">
                                {{ getPaymentStatusLabel(order.statusPayment) }}
                            </BaseBadge>
                        </td>
                        <td class="table-cell text-right space-x-2">
                            <BaseButton variant="ghost" size="sm" @click="openDetailsModal(order)">
                                Détails
                            </BaseButton>
                            <BaseButton variant="accent" size="sm" @click="openEditModal(order)">
                                Modifier
                            </BaseButton>
                            <BaseButton variant="danger" size="sm" @click="deleteOrder(order.id as string)">
                                Supprimer
                            </BaseButton>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Message si aucune commande -->
        <div v-else-if="!loading" class="text-center py-8 bg-secondary-ghost rounded-lg">
            <p class="text-primary">Aucune commande disponible.</p>
            <BaseButton variant="accent" class="mt-4" @click="openCreateModal">
                Créer une première commande
            </BaseButton>
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
