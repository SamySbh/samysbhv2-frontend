<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { orderApi } from '@/services/api/order.api';
import type { Order } from '@/types/order';
import {
    getMainStatusLabel,
    getPaymentStatusLabel,
    getMainStatusVariant,
    getPaymentStatusVariant,
    type OrderMainStatus,
    type OrderPaymentStatus,
} from '@/utils/status.utils';
import BaseBadge from '@/components/ui/BaseBadge.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

const router = useRouter();

const orders = ref<Order[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

async function loadOrders() {
    loading.value = true;
    error.value = null;

    try {
        orders.value = await orderApi.getMyOrders();
    } catch (err) {
        error.value = err instanceof Error
            ? err.message
            : 'Erreur lors du chargement de vos commandes';
    } finally {
        loading.value = false;
    }
}

function formatPrice(price: number): string {
    if (!price || isNaN(price)) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(price);
}

function formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
}

function getProgressPercent(order: Order): number {
    const statusProgress: Record<string, number> = {
        'NEW': 10,
        'VALIDATED': 30,
        'IN_PROGRESS': 60,
        'COMPLETED': 85,
        'ARCHIVED': 100,
    };
    if (order.statusPayment === 'FULLY_PAID') return 100;
    return statusProgress[order.statusMain] ?? 10;
}

function getProgressText(order: Order): string {
    if (order.statusPayment === 'FULLY_PAID') return 'Projet termine et paye';
    if (order.statusMain === 'COMPLETED') return 'Projet livre - En attente paiement final';
    if (order.statusMain === 'IN_PROGRESS') return 'Developpement en cours';
    if (order.statusPayment === 'DEPOSIT_PAID') return 'Acompte paye - Demarrage imminent';
    if (order.statusPayment === 'PENDING_DEPOSIT') return 'En attente de l\'acompte';
    return 'Demande en traitement';
}

function needsPayment(order: Order): boolean {
    return order.statusPayment === 'PENDING_DEPOSIT'
        || order.statusPayment === 'PENDING_FINAL';
}

function getPaymentLabel(order: Order): string {
    if (order.statusPayment === 'PENDING_DEPOSIT') return 'Regler l\'acompte';
    if (order.statusPayment === 'PENDING_FINAL') return 'Regler le solde';
    return 'Payer';
}

function viewOrder(orderId: string | undefined) {
    if (orderId) router.push(`/commande/${orderId}`);
}

onMounted(() => {
    loadOrders();
});
</script>

<template>
    <div class="container mx-auto py-8 px-4 max-w-5xl">

        <!-- Header -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 class="text-2xl font-bold text-secondary">Mes commandes</h1>
            <BaseButton variant="accent" @click="router.push('/demande-projet')">
                Nouvelle demande
            </BaseButton>
        </div>

        <!-- Chargement -->
        <div v-if="loading" class="text-center py-16">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p class="text-primary-ghost">Chargement de vos commandes...</p>
        </div>

        <!-- Erreur -->
        <div v-else-if="error" class="py-8">
            <BaseAlert variant="error" class="mb-4">
                {{ error }}
            </BaseAlert>
            <div class="text-center">
                <BaseButton variant="accent" @click="loadOrders">
                    Reessayer
                </BaseButton>
            </div>
        </div>

        <!-- Aucune commande -->
        <div v-else-if="orders.length === 0" class="text-center py-16 bg-secondary-ghost rounded-lg shadow-md">
            <p class="text-5xl mb-4">📭</p>
            <h2 class="text-xl font-semibold text-primary mb-2">Aucune commande pour le moment</h2>
            <p class="text-primary-ghost mb-6">Vous n'avez pas encore fait de demande de devis.</p>
            <BaseButton variant="accent" @click="router.push('/services')">
                Decouvrir nos services
            </BaseButton>
        </div>

        <!-- Liste des commandes -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div
                v-for="order in orders"
                :key="order.id"
                class="bg-secondary-ghost rounded-lg shadow-md overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                @click="viewOrder(order.id)"
            >
                <!-- Header de la carte -->
                <div class="p-4 border-b border-primary-ghost/20 flex justify-between items-center">
                    <span class="font-mono font-semibold text-primary">
                        #{{ order.id?.slice(-8).toUpperCase() }}
                    </span>
                    <BaseBadge :variant="getMainStatusVariant(order.statusMain as OrderMainStatus)">
                        {{ getMainStatusLabel(order.statusMain as OrderMainStatus) }}
                    </BaseBadge>
                </div>

                <!-- Corps -->
                <div class="p-4 space-y-3">
                    <div class="flex justify-between text-sm">
                        <span class="text-primary-ghost">Date</span>
                        <span class="text-primary font-medium">{{ formatDate(order.createdAt) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-primary-ghost">Montant</span>
                        <span class="text-primary font-bold">{{ formatPrice(order.totalAmount) }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span class="text-primary-ghost">Paiement</span>
                        <BaseBadge
                            size="sm"
                            :variant="getPaymentStatusVariant(order.statusPayment as OrderPaymentStatus)"
                        >
                            {{ getPaymentStatusLabel(order.statusPayment as OrderPaymentStatus) }}
                        </BaseBadge>
                    </div>

                    <!-- Barre de progression -->
                    <div class="pt-2">
                        <div class="w-full h-1.5 bg-primary-ghost/20 rounded-full overflow-hidden">
                            <div
                                class="h-full bg-accent rounded-full transition-all duration-500"
                                :style="{ width: getProgressPercent(order) + '%' }"
                            ></div>
                        </div>
                        <p class="text-xs text-primary-ghost mt-1.5">{{ getProgressText(order) }}</p>
                    </div>
                </div>

                <!-- Footer / Actions -->
                <div class="p-4 border-t border-primary-ghost/20">
                    <BaseButton
                        v-if="needsPayment(order)"
                        variant="accent"
                        full-width
                        size="sm"
                        @click.stop="viewOrder(order.id)"
                    >
                        {{ getPaymentLabel(order) }}
                    </BaseButton>
                    <BaseButton
                        v-else
                        variant="secondary"
                        full-width
                        size="sm"
                        @click.stop="viewOrder(order.id)"
                    >
                        Voir details
                    </BaseButton>
                </div>
            </div>
        </div>

        <!-- Retour -->
        <div class="text-center mt-8">
            <BaseButton variant="secondary" @click="router.push('/user')">
                Retour au tableau de bord
            </BaseButton>
        </div>

    </div>
</template>
