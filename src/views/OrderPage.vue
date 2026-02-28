<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { orderApi } from '@/services/api/order.api';
import type { Order } from '@/types/order';
import type { RequestedService } from '@/types/projectRequest';
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

const route = useRoute();
const orderId = route.params.id as string;

const order = ref<Order | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const paymentLoading = ref(false);

// Calculs montants (sécurisés contre NaN)
const depositAmount = computed(() => {
    const val = order.value?.depositAmount;
    return val && !isNaN(val) ? val : (order.value?.totalAmount ?? 0) * 0.3;
});

const finalAmount = computed(() => {
    if (!order.value) return 0;
    return order.value.totalAmount - depositAmount.value;
});

// États de progression basés sur les statuts réels
const statusOrder = ['NEW', 'VALIDATED', 'IN_PROGRESS', 'COMPLETED'];

const currentStepIndex = computed(() => {
    if (!order.value) return 0;
    const idx = statusOrder.indexOf(order.value.statusMain);
    return idx >= 0 ? idx : 0;
});

const isDepositPaid = computed(() => {
    const sp = order.value?.statusPayment;
    return sp === 'DEPOSIT_PAID' || sp === 'PENDING_FINAL' || sp === 'FULLY_PAID';
});

const isProjectCompleted = computed(() =>
    order.value?.statusMain === 'COMPLETED'
);

const isFullyPaid = computed(() =>
    order.value?.statusPayment === 'FULLY_PAID'
);

// Peut payer l'acompte
const canPayDeposit = computed(() =>
    order.value?.statusPayment === 'PENDING_DEPOSIT'
);

// Peut payer le solde
const canPayFinal = computed(() =>
    order.value?.statusPayment === 'PENDING_FINAL'
);

// Services à afficher (orderItems en priorité, sinon requestedServices de la ProjectRequest)
const displayServices = computed(() => {
    if (!order.value) return [];

    // Priorité 1 : orderItems
    if (order.value.orderItems && order.value.orderItems.length > 0) {
        return order.value.orderItems.map(item => ({
            id: item.id,
            name: item.service?.name || 'Service',
            quantity: item.quantity,
            unitPrice: item.unitAmount,
            totalAmount: item.totalAmount,
        }));
    }

    // Priorité 2 : requestedServices de la ProjectRequest liée
    const pr = order.value.projectRequests?.[0];
    if (pr?.requestedServices) {
        const services = pr.requestedServices as RequestedService[];
        return services.map(s => ({
            id: s.serviceId,
            name: s.serviceName,
            quantity: s.quantity,
            unitPrice: s.price / s.quantity,
            totalAmount: s.price,
        }));
    }

    return [];
});

// Formatage prix
function formatPrice(price: number): string {
    if (!price || isNaN(price)) return '0,00 €';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(price);
}

// Formatage date
function formatDate(date: Date | string | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

// Charger la commande
async function loadOrder() {
    loading.value = true;
    error.value = null;

    try {
        order.value = await orderApi.getById(orderId);
    } catch (err) {
        error.value = err instanceof Error
            ? err.message
            : 'Impossible de charger la commande';
    } finally {
        loading.value = false;
    }
}

// Payer l'acompte
async function payDeposit() {
    if (!order.value?.id) return;
    paymentLoading.value = true;

    try {
        const paymentUrl = await orderApi.getPaymentLink(order.value.id, 'deposit');
        if (paymentUrl) {
            window.location.href = paymentUrl;
        } else {
            error.value = 'Impossible de générer le lien de paiement';
        }
    } catch (err) {
        error.value = err instanceof Error
            ? err.message
            : 'Erreur lors de la génération du paiement';
    } finally {
        paymentLoading.value = false;
    }
}

// Payer le solde
async function payFinal() {
    if (!order.value?.id) return;
    paymentLoading.value = true;

    try {
        const paymentUrl = await orderApi.getPaymentLink(order.value.id, 'final');
        if (paymentUrl) {
            window.location.href = paymentUrl;
        } else {
            error.value = 'Impossible de générer le lien de paiement';
        }
    } catch (err) {
        error.value = err instanceof Error
            ? err.message
            : 'Erreur lors de la génération du paiement';
    } finally {
        paymentLoading.value = false;
    }
}

onMounted(() => {
    loadOrder();
});
</script>

<template>
    <div class="container mx-auto py-8 px-4 max-w-4xl">

        <!-- Chargement -->
        <div v-if="loading" class="text-center py-16">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p class="text-primary-ghost">Chargement de votre commande...</p>
        </div>

        <!-- Erreur -->
        <div v-else-if="error" class="py-8">
            <BaseAlert variant="error" class="mb-4">
                {{ error }}
            </BaseAlert>
            <div class="text-center">
                <BaseButton variant="accent" @click="loadOrder">
                    Réessayer
                </BaseButton>
            </div>
        </div>

        <!-- Contenu de la commande -->
        <template v-else-if="order">

            <!-- En-tête -->
            <div class="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
                <div>
                    <h1 class="text-2xl font-bold text-secondary">Ma commande</h1>
                    <p class="text-secondary-ghost font-mono mt-1">
                        Réf. #{{ order.id?.slice(-8).toUpperCase() }}
                    </p>
                </div>
                <div class="flex flex-col items-start md:items-end gap-2">
                    <BaseBadge :variant="getMainStatusVariant(order.statusMain as OrderMainStatus)">
                        {{ getMainStatusLabel(order.statusMain as OrderMainStatus) }}
                    </BaseBadge>
                    <BaseBadge :variant="getPaymentStatusVariant(order.statusPayment as OrderPaymentStatus)">
                        {{ getPaymentStatusLabel(order.statusPayment as OrderPaymentStatus) }}
                    </BaseBadge>
                </div>
            </div>

            <!-- Barre de progression -->
            <section class="bg-secondary-ghost rounded-lg shadow-md p-6 mb-6">
                <h2 class="text-lg font-semibold text-primary mb-6">Avancement du projet</h2>

                <div class="progress-timeline">
                    <!-- Ligne de début -->
                    <div class="timeline-start-line" :class="{ completed: currentStepIndex >= 0 }"></div>

                    <!-- Étape 1 : Commande créée -->
                    <div class="timeline-item">
                        <div class="timeline-step" :class="{ active: currentStepIndex >= 0, completed: currentStepIndex > 0 }">
                            <svg v-if="currentStepIndex > 0" class="timeline-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            <span v-else>1</span>
                        </div>
                        <span class="timeline-label" :class="{ active: currentStepIndex >= 0 }">Commande créée</span>
                    </div>

                    <!-- Connecteur 1-2 -->
                    <div class="timeline-connector" :class="{ completed: currentStepIndex >= 1 }"></div>

                    <!-- Étape 2 : Acompte payé -->
                    <div class="timeline-item">
                        <div class="timeline-step" :class="{ active: isDepositPaid, completed: isDepositPaid && currentStepIndex > 1 }">
                            <svg v-if="isDepositPaid && currentStepIndex > 1" class="timeline-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            <span v-else>2</span>
                        </div>
                        <span class="timeline-label" :class="{ active: isDepositPaid }">Acompte payé</span>
                    </div>

                    <!-- Connecteur 2-3 -->
                    <div class="timeline-connector" :class="{ completed: currentStepIndex >= 2 }"></div>

                    <!-- Étape 3 : En cours -->
                    <div class="timeline-item">
                        <div class="timeline-step" :class="{ active: currentStepIndex >= 2, completed: isProjectCompleted }">
                            <svg v-if="isProjectCompleted" class="timeline-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            <span v-else>3</span>
                        </div>
                        <span class="timeline-label" :class="{ active: currentStepIndex >= 2 }">En cours</span>
                    </div>

                    <!-- Connecteur 3-4 -->
                    <div class="timeline-connector" :class="{ completed: isFullyPaid }"></div>

                    <!-- Étape 4 : Terminée -->
                    <div class="timeline-item">
                        <div class="timeline-step" :class="{ active: isFullyPaid, completed: isFullyPaid }">
                            <svg v-if="isFullyPaid" class="timeline-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                            </svg>
                            <span v-else>4</span>
                        </div>
                        <span class="timeline-label" :class="{ active: isFullyPaid }">Terminée</span>
                    </div>

                    <!-- Ligne de fin -->
                    <div class="timeline-end-line" :class="{ completed: isFullyPaid }"></div>
                </div>
            </section>

            <!-- Détails financiers -->
            <section class="bg-secondary-ghost rounded-lg shadow-md p-6 mb-6">
                <h2 class="text-lg font-semibold text-primary mb-4">Détails financiers</h2>

                <div class="space-y-3">
                    <div class="flex justify-between items-center py-2 border-b border-primary-ghost/20">
                        <span class="text-primary">Montant total</span>
                        <span class="font-bold text-lg text-primary">{{ formatPrice(order.totalAmount) }}</span>
                    </div>

                    <div class="flex justify-between items-center py-2 border-b border-primary-ghost/20">
                        <div class="flex items-center gap-2">
                            <span class="text-primary">Acompte (30%)</span>
                            <BaseBadge
                                :variant="order.statusPayment === 'PENDING_DEPOSIT' ? 'error' : 'success'"
                            >
                                {{ order.statusPayment === 'PENDING_DEPOSIT' ? 'En attente' : 'Payé' }}
                            </BaseBadge>
                        </div>
                        <span class="font-semibold text-primary">{{ formatPrice(depositAmount) }}</span>
                    </div>

                    <div class="flex justify-between items-center py-2">
                        <div class="flex items-center gap-2">
                            <span class="text-primary">Solde (70%)</span>
                            <BaseBadge
                                :variant="order.statusPayment === 'FULLY_PAID' ? 'success' : canPayFinal ? 'warning' : 'info'"
                            >
                                {{
                                    order.statusPayment === 'FULLY_PAID'
                                        ? 'Payé'
                                        : canPayFinal
                                            ? 'En attente'
                                            : 'Non disponible'
                                }}
                            </BaseBadge>
                        </div>
                        <span class="font-semibold text-primary">{{ formatPrice(finalAmount) }}</span>
                    </div>
                </div>
            </section>

            <!-- Prestations -->
            <section class="bg-secondary-ghost rounded-lg shadow-md p-6 mb-6">
                <h2 class="text-lg font-semibold text-primary mb-4">Prestations</h2>

                <div v-if="displayServices.length > 0" class="space-y-2">
                    <div
                        v-for="item in displayServices"
                        :key="item.id"
                        class="flex justify-between items-center py-3 border-b border-primary-ghost/20 last:border-0"
                    >
                        <div class="flex items-center gap-3">
                            <span class="bg-accent text-secondary px-2 py-1 rounded text-sm font-medium">
                                {{ item.quantity }}x
                            </span>
                            <span class="text-primary font-medium">
                                {{ item.name }}
                            </span>
                        </div>
                        <span class="font-semibold text-primary">{{ formatPrice(item.totalAmount) }}</span>
                    </div>
                </div>

                <p v-else class="text-primary-ghost text-center py-4">
                    Aucun détail de prestation disponible
                </p>

                <!-- Infos supplémentaires -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-4 border-t border-primary-ghost/20">
                    <div>
                        <span class="text-xs text-primary-ghost uppercase">Date de commande</span>
                        <p class="font-medium text-primary">{{ formatDate(order.createdAt) }}</p>
                    </div>
                    <div>
                        <span class="text-xs text-primary-ghost uppercase">Date limite</span>
                        <p class="font-medium text-primary">{{ formatDate(order.deadlineDate) }}</p>
                    </div>
                </div>
            </section>

            <!-- Actions de paiement -->
            <section
                v-if="canPayDeposit || canPayFinal"
                class="bg-secondary-ghost rounded-lg shadow-md p-6 mb-6 border-2 border-accent"
            >
                <h2 class="text-lg font-semibold text-primary mb-4">Paiement</h2>

                <!-- Payer l'acompte -->
                <div v-if="canPayDeposit" class="text-center">
                    <p class="text-primary mb-2">
                        Pour démarrer votre projet, veuillez régler l'acompte de
                        <strong class="text-accent">{{ formatPrice(depositAmount) }}</strong>
                    </p>
                    <p class="text-sm text-primary-ghost mb-4">
                        Paiement sécurisé via Stripe
                    </p>
                    <BaseButton
                        variant="accent"
                        size="lg"
                        :loading="paymentLoading"
                        @click="payDeposit"
                    >
                        <template #loading>Redirection vers le paiement...</template>
                        Payer l'acompte - {{ formatPrice(depositAmount) }}
                    </BaseButton>
                </div>

                <!-- Payer le solde -->
                <div v-if="canPayFinal" class="text-center">
                    <p class="text-primary mb-2">
                        Votre projet est terminé ! Réglez le solde de
                        <strong class="text-accent">{{ formatPrice(finalAmount) }}</strong>
                    </p>
                    <p class="text-sm text-primary-ghost mb-4">
                        Paiement sécurisé via Stripe
                    </p>
                    <BaseButton
                        variant="accent"
                        size="lg"
                        :loading="paymentLoading"
                        @click="payFinal"
                    >
                        <template #loading>Redirection vers le paiement...</template>
                        Payer le solde - {{ formatPrice(finalAmount) }}
                    </BaseButton>
                </div>
            </section>

            <!-- Message de succès si entièrement payé -->
            <BaseAlert v-if="order.statusPayment === 'FULLY_PAID'" variant="success" class="mb-6">
                Tous les paiements ont été effectués. Merci pour votre confiance !
            </BaseAlert>

            <!-- Bouton retour -->
            <div class="text-center">
                <BaseButton variant="secondary" @click="$router.push('/user')">
                    Retour au tableau de bord
                </BaseButton>
            </div>

        </template>
    </div>
</template>

<style scoped>
/* Timeline horizontale */
.progress-timeline {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    padding: 20px 0;
}

/* Lignes de début et de fin */
.timeline-start-line,
.timeline-end-line {
    flex: 0 0 30px;
    height: 4px;
    background-color: #ddd;
    transition: background-color 0.4s ease;
}

.timeline-start-line.completed {
    background-color: #3498db;
}

.timeline-end-line.completed {
    background-color: #2ecc71;
}

/* Élément de timeline (cercle + label) */
.timeline-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;
}

/* Cercle de l'étape */
.timeline-step {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
    background-color: #e0e0e0;
    color: #999;
    transition: all 0.4s ease;
    border: 3px solid transparent;
}

.timeline-step.active {
    background-color: #3498db;
    color: #fff;
    border-color: #2980b9;
    box-shadow: 0 0 0 4px rgba(52, 152, 219, 0.2);
}

.timeline-step.completed {
    background-color: #2ecc71;
    color: #fff;
    border-color: #27ae60;
    box-shadow: 0 0 0 4px rgba(46, 204, 113, 0.2);
}

.timeline-check {
    width: 28px;
    height: 28px;
}

/* Label sous le cercle */
.timeline-label {
    margin-top: 10px;
    font-size: 0.8rem;
    color: #999;
    text-align: center;
    max-width: 90px;
    font-weight: 500;
    transition: color 0.4s ease;
}

.timeline-label.active {
    color: #333;
    font-weight: 600;
}

/* Connecteurs entre les étapes */
.timeline-connector {
    flex: 1;
    height: 4px;
    background-color: #ddd;
    min-width: 40px;
    transition: background-color 0.4s ease;
}

.timeline-connector.completed {
    background-color: #2ecc71;
}

/* Responsive : vertical sur mobile */
@media (max-width: 640px) {
    .progress-timeline {
        flex-direction: column;
        align-items: flex-start;
        padding: 10px 0 10px 20px;
    }

    .timeline-start-line,
    .timeline-end-line {
        flex: 0 0 20px;
        width: 4px;
        height: 20px;
        margin-left: 28px;
    }

    .timeline-item {
        flex-direction: row;
        align-items: center;
        gap: 16px;
    }

    .timeline-step {
        width: 50px;
        height: 50px;
        font-size: 1.1rem;
        flex-shrink: 0;
    }

    .timeline-check {
        width: 24px;
        height: 24px;
    }

    .timeline-label {
        margin-top: 0;
        max-width: none;
        font-size: 0.85rem;
    }

    .timeline-connector {
        width: 4px;
        height: 30px;
        min-width: unset;
        margin-left: 28px;
        flex: 0 0 30px;
    }
}
</style>
