<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { orderAdminApi } from '@/services/api/orderAdmin.api';
import type { Order } from '@/types/order';
import {
    getMainStatusLabel,
    getPaymentStatusLabel,
    getMainStatusVariant,
    getPaymentStatusVariant,
    type OrderMainStatus,
    type OrderPaymentStatus,
} from '@/utils/status.utils';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import PaymentLinkModal from '@/components/admin/project-requests/PaymentLinkModal.vue';

const router = useRouter();

// État
const orders = ref<Order[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const filterOrderStatus = ref<string>('');
const filterPaymentStatus = ref<string>('');
const actionLoading = ref<string | null>(null);

// Modal lien de paiement
const selectedOrder = ref<Order | null>(null);
const showPaymentModal = ref(false);
const paymentUrl = ref('');

// Options de filtres
const orderStatuses = [
    { value: '', label: 'Tous' },
    { value: 'NEW', label: 'Nouvelles' },
    { value: 'VALIDATED', label: 'Validées' },
    { value: 'IN_PROGRESS', label: 'En cours' },
    { value: 'COMPLETED', label: 'Terminées' },
    { value: 'ARCHIVED', label: 'Archivées' },
];

const paymentStatuses = [
    { value: '', label: 'Tous' },
    { value: 'PENDING_DEPOSIT', label: 'Attente acompte' },
    { value: 'DEPOSIT_PAID', label: 'Acompte payé' },
    { value: 'PENDING_FINAL', label: 'Attente solde' },
    { value: 'FULLY_PAID', label: 'Payé intégralement' },
];

// Commandes filtrées
const filteredOrders = computed(() => {
    let result = orders.value;

    if (filterOrderStatus.value) {
        result = result.filter(o => o.statusMain === filterOrderStatus.value);
    }
    if (filterPaymentStatus.value) {
        result = result.filter(o => o.statusPayment === filterPaymentStatus.value);
    }

    return result;
});

// Compteurs pour les filtres
function countByOrderStatus(status: string): number {
    if (!status) return orders.value.length;
    return orders.value.filter(o => o.statusMain === status).length;
}

function countByPaymentStatus(status: string): number {
    if (!status) return orders.value.length;
    return orders.value.filter(o => o.statusPayment === status).length;
}

// Conditions d'actions
function canMarkAsCompleted(order: Order): boolean {
    return (
        order.statusMain === 'IN_PROGRESS' &&
        order.statusPayment !== 'PENDING_DEPOSIT'
    );
}

function canGenerateFinalPayment(order: Order): boolean {
    return (
        order.statusMain === 'COMPLETED' &&
        order.statusPayment !== 'FULLY_PAID'
    );
}

// Formatage
function formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(price);
}

function formatDate(dateStr: Date | string | undefined): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getClientName(order: Order): string {
    if (order.user) {
        const name = `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim();
        return name || order.user.email;
    }
    return 'Client inconnu';
}

// Chargement des commandes
async function loadOrders() {
    loading.value = true;
    error.value = null;

    try {
        orders.value = await orderAdminApi.getAll();
    } catch (err) {
        error.value = err instanceof Error
            ? err.message
            : 'Erreur lors du chargement des commandes';
    } finally {
        loading.value = false;
    }
}

// Marquer comme livré
async function markAsCompleted(orderId: string) {
    if (!confirm('Marquer ce projet comme "Livré" ?\n\nLe client pourra alors payer le solde.')) {
        return;
    }

    actionLoading.value = orderId;

    try {
        await orderAdminApi.updateStatus(orderId, 'COMPLETED');
        await loadOrders();
    } catch (err) {
        alert('Erreur lors de la mise à jour du statut');
    } finally {
        actionLoading.value = null;
    }
}

// Générer le lien de paiement pour le solde
async function generateFinalPaymentLink(order: Order) {
    if (!order.id) return;
    actionLoading.value = order.id;

    try {
        const url = await orderAdminApi.generateFinalPaymentLink(order.id);

        selectedOrder.value = order;
        paymentUrl.value = url;
        showPaymentModal.value = true;
    } catch (err) {
        alert('Erreur lors de la génération du lien de paiement');
    } finally {
        actionLoading.value = null;
    }
}

// Voir la page client de la commande
function viewClientPage(orderId: string) {
    const route = router.resolve({ name: 'order-page', params: { id: orderId } });
    window.open(route.href, '_blank', 'noopener,noreferrer');
}

// Fermer la modal de paiement et rafraîchir
function handlePaymentModalClosed() {
    showPaymentModal.value = false;
    selectedOrder.value = null;
    paymentUrl.value = '';
    loadOrders();
}

onMounted(() => {
    loadOrders();
});
</script>

<template>
    <div class="orders-admin">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-secondary">Gestion des commandes</h2>
            <BaseButton variant="accent" @click="loadOrders" :loading="loading">
                <template #loading>Chargement...</template>
                Actualiser
            </BaseButton>
        </div>

        <!-- Filtres -->
        <div class="card-admin p-4 mb-6 space-y-4">
            <!-- Filtre statut projet -->
            <div>
                <label class="block text-sm font-semibold text-primary mb-2">Statut du projet :</label>
                <div class="flex flex-wrap gap-2">
                    <button
                        v-for="status in orderStatuses"
                        :key="status.value"
                        @click="filterOrderStatus = status.value"
                        :class="[
                            'px-4 py-2 rounded-md transition-colors text-sm',
                            filterOrderStatus === status.value
                                ? 'bg-accent text-secondary'
                                : 'bg-secondary-ghost hover:bg-emphasis text-primary'
                        ]"
                    >
                        {{ status.label }} ({{ countByOrderStatus(status.value) }})
                    </button>
                </div>
            </div>

            <!-- Filtre statut paiement -->
            <div>
                <label class="block text-sm font-semibold text-primary mb-2">Statut du paiement :</label>
                <div class="flex flex-wrap gap-2">
                    <button
                        v-for="status in paymentStatuses"
                        :key="status.value"
                        @click="filterPaymentStatus = status.value"
                        :class="[
                            'px-4 py-2 rounded-md transition-colors text-sm',
                            filterPaymentStatus === status.value
                                ? 'bg-accent text-secondary'
                                : 'bg-secondary-ghost hover:bg-emphasis text-primary'
                        ]"
                    >
                        {{ status.label }} ({{ countByPaymentStatus(status.value) }})
                    </button>
                </div>
            </div>
        </div>

        <!-- Chargement -->
        <div v-if="loading" class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p class="text-primary-ghost">Chargement des commandes...</p>
        </div>

        <!-- Erreur -->
        <div v-else-if="error">
            <BaseAlert variant="error" class="mb-4">
                {{ error }}
            </BaseAlert>
            <div class="text-center">
                <BaseButton variant="secondary" size="sm" @click="loadOrders">
                    Réessayer
                </BaseButton>
            </div>
        </div>

        <!-- Liste vide -->
        <div v-else-if="filteredOrders.length === 0" class="text-center py-8 text-primary-ghost bg-secondary-ghost rounded-lg">
            Aucune commande trouvée
        </div>

        <!-- Liste des commandes -->
        <div v-else class="space-y-4">
            <div
                v-for="order in filteredOrders"
                :key="order.id"
                class="card-admin p-6"
            >
                <!-- En-tête de la commande -->
                <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4 pb-4 border-b border-primary-ghost/20">
                    <div>
                        <h3 class="text-lg font-semibold text-primary font-mono">
                            #{{ order.id?.slice(-8).toUpperCase() }}
                        </h3>
                        <p class="text-primary-ghost mt-1">
                            {{ getClientName(order) }}
                        </p>
                        <p v-if="order.user?.email" class="text-sm text-primary-ghost">
                            {{ order.user.email }}
                        </p>
                    </div>
                    <div class="flex flex-col items-start md:items-end gap-2">
                        <BaseBadge :variant="getMainStatusVariant(order.statusMain as OrderMainStatus)">
                            {{ getMainStatusLabel(order.statusMain as OrderMainStatus) }}
                        </BaseBadge>
                        <BaseBadge :variant="getPaymentStatusVariant(order.statusPayment as OrderPaymentStatus)">
                            {{ getPaymentStatusLabel(order.statusPayment as OrderPaymentStatus) }}
                        </BaseBadge>
                        <p class="text-sm text-primary-ghost mt-1">{{ formatDate(order.createdAt) }}</p>
                    </div>
                </div>

                <!-- Corps de la commande -->
                <div class="space-y-4">
                    <!-- Montants -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 bg-secondary-ghost rounded-lg p-4">
                        <div class="text-center p-3 bg-secondary rounded-lg">
                            <div class="text-xs text-primary-ghost uppercase mb-1">Montant total</div>
                            <div class="text-xl font-bold text-primary">{{ formatPrice(order.totalAmount) }}</div>
                        </div>
                        <div class="text-center p-3 bg-secondary rounded-lg border-l-4 border-info">
                            <div class="text-xs text-primary-ghost uppercase mb-1">Acompte (30%)</div>
                            <div class="text-xl font-bold" :class="order.statusPayment !== 'PENDING_DEPOSIT' ? 'text-success' : 'text-primary'">
                                {{ formatPrice(order.depositAmount) }}
                                <span v-if="order.statusPayment !== 'PENDING_DEPOSIT'" class="text-sm"> &#10003;</span>
                            </div>
                        </div>
                        <div class="text-center p-3 bg-secondary rounded-lg border-l-4 border-success">
                            <div class="text-xs text-primary-ghost uppercase mb-1">Solde (70%)</div>
                            <div class="text-xl font-bold" :class="order.statusPayment === 'FULLY_PAID' ? 'text-success' : 'text-primary'">
                                {{ formatPrice(order.totalAmount - order.depositAmount) }}
                                <span v-if="order.statusPayment === 'FULLY_PAID'" class="text-sm"> &#10003;</span>
                            </div>
                        </div>
                    </div>

                    <!-- Dates -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <span class="text-xs text-primary-ghost uppercase">Date de commande</span>
                            <p class="font-medium text-primary">{{ formatDate(order.createdAt) }}</p>
                        </div>
                        <div>
                            <span class="text-xs text-primary-ghost uppercase">Livraison prévue</span>
                            <p class="font-medium text-primary">{{ formatDate(order.deadlineDate) }}</p>
                        </div>
                    </div>

                    <!-- Services -->
                    <div v-if="order.orderItems && order.orderItems.length > 0">
                        <strong class="block mb-2 text-primary">Services :</strong>
                        <ul class="bg-secondary-ghost rounded-md p-3 space-y-1">
                            <li
                                v-for="item in order.orderItems"
                                :key="item.id"
                                class="flex justify-between items-center py-1 border-b border-primary-ghost/20 last:border-0"
                            >
                                <span class="text-primary">{{ item.quantity }}x {{ item.service?.name || 'Service' }}</span>
                                <span class="font-medium text-primary">{{ formatPrice(item.totalAmount) }}</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-wrap gap-2 mt-6 pt-4 border-t border-primary-ghost/20">
                    <!-- Marquer comme livré -->
                    <BaseButton
                        v-if="canMarkAsCompleted(order)"
                        variant="primary"
                        size="sm"
                        @click="markAsCompleted(order.id as string)"
                        :disabled="actionLoading === order.id"
                    >
                        Marquer "Livré"
                    </BaseButton>

                    <!-- Générer lien paiement solde -->
                    <BaseButton
                        v-if="canGenerateFinalPayment(order)"
                        variant="accent"
                        size="sm"
                        @click="generateFinalPaymentLink(order)"
                        :disabled="actionLoading === order.id"
                    >
                        Générer lien solde
                    </BaseButton>

                    <!-- Voir la page client -->
                    <BaseButton
                        variant="secondary"
                        size="sm"
                        @click="viewClientPage(order.id as string)"
                    >
                        Page client
                    </BaseButton>

                    <!-- Contacter le client -->
                    <a
                        v-if="order.user?.email"
                        :href="`mailto:${order.user.email}?subject=Votre commande #${order.id?.slice(-8).toUpperCase()}`"
                        class="btn-secondary btn-sm"
                    >
                        Contacter
                    </a>
                </div>
            </div>
        </div>

        <!-- Modal lien de paiement du solde -->
        <PaymentLinkModal
            v-if="selectedOrder && showPaymentModal"
            :order-id="selectedOrder.id as string"
            :payment-url="paymentUrl"
            :client-name="getClientName(selectedOrder)"
            :client-email="selectedOrder.user?.email || ''"
            :total-amount="selectedOrder.totalAmount"
            :deposit-amount="selectedOrder.totalAmount - selectedOrder.depositAmount"
            @close="handlePaymentModalClosed"
            @close-and-refresh="handlePaymentModalClosed"
        />
    </div>
</template>
