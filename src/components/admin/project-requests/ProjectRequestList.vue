<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { projectRequestApi } from '@/services/api/projectRequest.api';
import type { ProjectRequest } from '@/types/projectRequest';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';
import CreateOrderModal from './CreateOrderModal.vue';
import PaymentLinkModal from './PaymentLinkModal.vue';

const requests = ref<ProjectRequest[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const filterStatus = ref<string>('');
const actionLoading = ref<string | null>(null);
const selectedRequest = ref<ProjectRequest | null>(null);
const showOrderModal = ref(false);
const showPaymentLinkModal = ref(false);
const paymentLinkData = ref<{
    orderId: string;
    paymentUrl: string;
    clientName: string;
    clientEmail: string;
    totalAmount: number;
    depositAmount: number;
} | null>(null);

const statuses = [
    { value: '', label: 'Toutes' },
    { value: 'PENDING', label: 'En attente' },
    { value: 'QUOTED', label: 'Devis envoyé' },
    { value: 'ACCEPTED', label: 'Acceptées' },
    { value: 'REJECTED', label: 'Refusées' },
    { value: 'ARCHIVED', label: 'Archivées' },
];

const filteredRequests = computed(() => {
    if (!filterStatus.value) return requests.value;
    return requests.value.filter(r => r.status === filterStatus.value);
});

function countByStatus(status: string): number {
    if (!status) return requests.value.length;
    return requests.value.filter(r => r.status === status).length;
}

function getStatusLabel(status: string): string {
    const found = statuses.find(s => s.value === status);
    return found ? found.label : status;
}

function getStatusVariant(status: string): 'info' | 'emphasis' | 'warning' | 'success' | 'error' {
    const variants: Record<string, 'info' | 'emphasis' | 'warning' | 'success' | 'error'> = {
        PENDING: 'warning',
        QUOTED: 'info',
        ACCEPTED: 'success',
        REJECTED: 'error',
        ARCHIVED: 'emphasis',
    };
    return variants[status] || 'info';
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

async function loadRequests() {
    loading.value = true;
    error.value = null;

    try {
        requests.value = await projectRequestApi.getAll();
    } catch (err) {
        error.value = err instanceof Error
            ? err.message
            : 'Erreur lors du chargement des demandes';
    } finally {
        loading.value = false;
    }
}

async function markAsQuoted(id: string) {
    if (!confirm('Marquer cette demande comme "Devis envoyé" ?')) {
        return;
    }

    actionLoading.value = id;

    try {
        await projectRequestApi.updateStatus(id, 'QUOTED');
        await loadRequests();
    } catch (err) {
        alert('Erreur lors de la mise à jour du statut');
    } finally {
        actionLoading.value = null;
    }
}

async function markAsAccepted(id: string) {
    if (!confirm('Marquer cette demande comme "Acceptée" ?')) {
        return;
    }

    actionLoading.value = id;

    try {
        await projectRequestApi.updateStatus(id, 'ACCEPTED');
        await loadRequests();
    } catch (err) {
        alert('Erreur lors de la mise à jour du statut');
    } finally {
        actionLoading.value = null;
    }
}

async function markAsRejected(id: string) {
    if (!confirm('Marquer cette demande comme "Refusée" ?')) {
        return;
    }

    actionLoading.value = id;

    try {
        await projectRequestApi.updateStatus(id, 'REJECTED');
        await loadRequests();
    } catch (err) {
        alert('Erreur lors de la mise à jour du statut');
    } finally {
        actionLoading.value = null;
    }
}

function openCreateOrderModal(request: ProjectRequest) {
    selectedRequest.value = request;
    showOrderModal.value = true;
}

function closeOrderModal() {
    showOrderModal.value = false;
    selectedRequest.value = null;
}

function handleOrderCreated(orderId: string, depositPaymentUrl: string) {
    // Fermer la modal de création
    showOrderModal.value = false;

    // Afficher la modal de lien de paiement (garde selectedRequest pour les infos client)
    if (selectedRequest.value) {
        const totalAmount = selectedRequest.value.estimatedTotal;
        const depositAmount = totalAmount * 0.3;

        paymentLinkData.value = {
            orderId,
            paymentUrl: depositPaymentUrl,
            clientName: selectedRequest.value.name,
            clientEmail: selectedRequest.value.email,
            totalAmount,
            depositAmount,
        };

        showPaymentLinkModal.value = true;
    }
}

function handlePaymentLinkClosed() {
    showPaymentLinkModal.value = false;
    paymentLinkData.value = null;
    selectedRequest.value = null;

    // Recharger les demandes
    loadRequests();
}

const router = useRouter();

function viewOrder(orderId: string) {
    router.push({ name: 'order-page', params: { id: orderId } });
}

onMounted(() => {
    loadRequests();
});
</script>

<template>
    <div class="project-requests-admin">
        <!-- Header avec titre et bouton actualiser -->
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-secondary">Demandes de projet</h2>
            <BaseButton variant="accent" @click="loadRequests" :loading="loading">
                <template #loading>Chargement...</template>
                Actualiser
            </BaseButton>
        </div>

        <!-- Filtres par statut -->
        <div class="flex flex-wrap gap-2 mb-6">
            <button
                v-for="status in statuses"
                :key="status.value"
                @click="filterStatus = status.value"
                :class="[
                    'px-4 py-2 rounded-md transition-colors text-sm',
                    filterStatus === status.value
                        ? 'bg-accent text-secondary'
                        : 'bg-secondary-ghost hover:bg-emphasis text-primary'
                ]"
            >
                {{ status.label }} ({{ countByStatus(status.value) }})
            </button>
        </div>

        <!-- État de chargement -->
        <div v-if="loading" class="text-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p class="text-primary-ghost">Chargement des demandes...</p>
        </div>

        <!-- État d'erreur -->
        <div v-else-if="error">
            <BaseAlert variant="error" class="mb-4">
                {{ error }}
            </BaseAlert>
            <div class="text-center">
                <BaseButton variant="secondary" size="sm" @click="loadRequests">
                    Réessayer
                </BaseButton>
            </div>
        </div>

        <!-- Liste vide -->
        <div v-else-if="filteredRequests.length === 0" class="text-center py-8 text-primary-ghost bg-secondary-ghost rounded-lg">
            Aucune demande {{ filterStatus ? `avec le statut "${getStatusLabel(filterStatus)}"` : '' }}
        </div>

        <!-- Liste des demandes -->
        <div v-else class="space-y-4">
            <div
                v-for="request in filteredRequests"
                :key="request.id"
                class="card-admin p-6"
            >
                <!-- En-tête de la demande -->
                <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4 pb-4 border-b border-primary-ghost/20">
                    <div>
                        <h3 class="text-lg font-semibold text-primary">{{ request.name }}</h3>
                        <p class="text-primary-ghost flex items-center gap-1">
                            {{ request.email }}
                        </p>
                        <p v-if="request.phone" class="text-sm text-primary-ghost">
                            {{ request.phone }}
                        </p>
                        <p v-if="request.company" class="text-sm text-primary-ghost">
                            {{ request.company }}
                        </p>
                    </div>
                    <div class="text-right md:text-right">
                        <BaseBadge :variant="getStatusVariant(request.status)">
                            {{ getStatusLabel(request.status) }}
                        </BaseBadge>
                        <p class="text-sm text-primary-ghost mt-2">{{ formatDate(request.createdAt) }}</p>
                        <p class="text-xs text-primary-ghost font-mono mt-1">#{{ request.id.slice(-8).toUpperCase() }}</p>
                    </div>
                </div>

                <!-- Corps de la demande -->
                <div class="space-y-4">
                    <!-- Services demandés -->
                    <div>
                        <strong class="block mb-2 text-primary">Services demandés :</strong>
                        <ul class="bg-secondary-ghost rounded-md p-3 space-y-1">
                            <li
                                v-for="service in request.requestedServices"
                                :key="service.serviceId"
                                class="flex justify-between items-center py-1 border-b border-primary-ghost/20 last:border-0"
                            >
                                <span class="text-primary">{{ service.quantity }}x {{ service.serviceName }}</span>
                                <span class="font-medium text-primary">{{ formatPrice(service.price) }}</span>
                            </li>
                        </ul>
                        <p class="mt-2 font-semibold text-lg text-accent">
                            Total estimé : {{ formatPrice(request.estimatedTotal) }}
                        </p>
                    </div>

                    <!-- Infos projet -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <strong class="text-primary">Délai souhaité :</strong>
                            <span class="ml-2 text-primary-ghost">{{ request.desiredDeadline }}</span>
                        </div>
                        <div>
                            <strong class="text-primary">Site existant :</strong>
                            <span class="ml-2 text-primary-ghost">
                                {{ request.hasExistingSite ? 'Oui' : 'Non' }}
                            </span>
                        </div>
                    </div>

                    <div v-if="request.existingSiteUrl">
                        <strong class="text-primary">URL du site :</strong>
                        <a
                            :href="request.existingSiteUrl"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="ml-2 text-accent hover:underline"
                        >
                            {{ request.existingSiteUrl }}
                        </a>
                    </div>

                    <!-- Description -->
                    <div>
                        <strong class="block mb-1 text-primary">Description du projet :</strong>
                        <p class="text-primary-ghost whitespace-pre-wrap bg-secondary-ghost p-3 rounded-md border-l-4 border-accent">
                            {{ request.projectDescription }}
                        </p>
                    </div>

                    <!-- Infos complémentaires -->
                    <div v-if="request.additionalInfo">
                        <strong class="block mb-1 text-primary">Informations complémentaires :</strong>
                        <p class="text-primary-ghost whitespace-pre-wrap bg-secondary-ghost p-3 rounded-md">
                            {{ request.additionalInfo }}
                        </p>
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex flex-wrap gap-2 mt-6 pt-4 border-t border-primary-ghost/20">
                    <BaseButton
                        v-if="request.status === 'PENDING'"
                        variant="primary"
                        size="sm"
                        @click="markAsQuoted(request.id)"
                        :disabled="actionLoading === request.id"
                    >
                        Marquer "Devis envoyé"
                    </BaseButton>

                    <BaseButton
                        v-if="request.status === 'QUOTED'"
                        variant="accent"
                        size="sm"
                        @click="markAsAccepted(request.id)"
                        :disabled="actionLoading === request.id"
                    >
                        Marquer "Acceptée"
                    </BaseButton>

                    <BaseButton
                        v-if="request.status === 'QUOTED'"
                        variant="danger"
                        size="sm"
                        @click="markAsRejected(request.id)"
                        :disabled="actionLoading === request.id"
                    >
                        Marquer "Refusée"
                    </BaseButton>

                    <BaseButton
                        v-if="request.status === 'ACCEPTED' && !request.orderId"
                        variant="accent"
                        size="sm"
                        @click="openCreateOrderModal(request)"
                    >
                        Créer la commande
                    </BaseButton>

                    <BaseButton
                        v-if="request.orderId"
                        variant="secondary"
                        size="sm"
                        @click="viewOrder(request.orderId)"
                    >
                        Voir la commande
                    </BaseButton>

                    <a
                        :href="`mailto:${request.email}?subject=Votre demande de devis - ${request.name}`"
                        class="btn-secondary btn-sm"
                    >
                        Contacter
                    </a>
                </div>
            </div>
        </div>

        <!-- Modal création de commande -->
        <CreateOrderModal
            v-if="selectedRequest && showOrderModal"
            :request="selectedRequest"
            @close="closeOrderModal"
            @order-created="handleOrderCreated"
        />

        <!-- Modal affichage lien de paiement -->
        <PaymentLinkModal
            v-if="paymentLinkData && showPaymentLinkModal"
            :order-id="paymentLinkData.orderId"
            :payment-url="paymentLinkData.paymentUrl"
            :client-name="paymentLinkData.clientName"
            :client-email="paymentLinkData.clientEmail"
            :total-amount="paymentLinkData.totalAmount"
            :deposit-amount="paymentLinkData.depositAmount"
            @close="handlePaymentLinkClosed"
            @close-and-refresh="handlePaymentLinkClosed"
        />
    </div>
</template>
