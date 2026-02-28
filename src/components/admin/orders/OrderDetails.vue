<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useOrderStore } from '@/stores/order.store';
import { Order } from '@/types/order';
import { OrderItem, User } from '@/types';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';

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
const userDetails = ref<User | null>(null);
const isLoading = ref(false);
const fullOrder = ref<Order | null>(null);

// Récupérer les détails complets de la commande
onMounted(async () => {
    if (props.order.id) {
        isLoading.value = true;
        try {
            await orderStore.getOrderById(props.order.id);

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

// Variantes de badge
const getMainStatusVariant = (status: string): 'info' | 'emphasis' | 'warning' | 'success' | 'error' => {
    const variantMap: Record<string, 'info' | 'emphasis' | 'warning' | 'success' | 'error'> = {
        NEW: 'info',
        VALIDATED: 'emphasis',
        IN_PROGRESS: 'warning',
        COMPLETED: 'success',
        ARCHIVED: 'info'
    };
    return variantMap[status] || 'info';
};

const getPaymentStatusVariant = (status: string): 'info' | 'emphasis' | 'warning' | 'success' | 'error' => {
    const variantMap: Record<string, 'info' | 'emphasis' | 'warning' | 'success' | 'error'> = {
        PENDING_DEPOSIT: 'error',
        DEPOSIT_PAID: 'warning',
        PENDING_FINAL: 'info',
        FULLY_PAID: 'success'
    };
    return variantMap[status] || 'info';
};

// Fermer le modal
const closeModal = () => {
    emit('close');
};
</script>

<template>
    <BaseModal title="Détails de la commande" size="lg" @close="closeModal">
        <!-- Loader -->
        <div v-if="isLoading" class="py-8 text-center text-primary-ghost">
            Chargement des détails...
        </div>

        <div v-else class="space-y-6">
            <!-- En-tête de la commande -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-secondary-ghost p-4 rounded-lg">
                <div>
                    <div class="font-semibold text-lg text-primary">{{ getOrderReference(order) }}</div>
                    <div class="text-sm text-primary-ghost">Créée le {{ formatDate(order.createdAt) }}</div>
                </div>

                <div class="flex gap-2">
                    <BaseBadge :variant="getMainStatusVariant(order.statusMain)">
                        {{ mainStatusLabels[order.statusMain] || order.statusMain }}
                    </BaseBadge>
                    <BaseBadge :variant="getPaymentStatusVariant(order.statusPayment)">
                        {{ paymentStatusLabels[order.statusPayment] || order.statusPayment }}
                    </BaseBadge>
                </div>
            </div>

            <!-- Détails client -->
            <div class="card-admin">
                <div class="px-4 py-3 bg-secondary-ghost border-b border-primary-ghost/20">
                    <h3 class="font-medium text-primary">Informations client</h3>
                </div>
                <div class="p-4" v-if="userDetails">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h4 class="text-xs text-primary-ghost uppercase mb-1">Nom</h4>
                            <p class="text-primary">{{ userDetails.firstName }} {{ userDetails.lastName }}</p>
                        </div>
                        <div>
                            <h4 class="text-xs text-primary-ghost uppercase mb-1">Email</h4>
                            <p class="text-primary">{{ userDetails.email }}</p>
                        </div>
                        <div>
                            <h4 class="text-xs text-primary-ghost uppercase mb-1">Téléphone</h4>
                            <p class="text-primary">{{ userDetails.phone || 'Non renseigné' }}</p>
                        </div>
                        <div>
                            <h4 class="text-xs text-primary-ghost uppercase mb-1">Entreprise</h4>
                            <p class="text-primary">{{ userDetails.company || 'Non renseignée' }}</p>
                        </div>
                    </div>
                </div>
                <div class="p-4" v-else>
                    <p class="text-primary-ghost">Informations client non disponibles</p>
                </div>
            </div>

            <!-- Détails financiers -->
            <div class="card-admin">
                <div class="px-4 py-3 bg-secondary-ghost border-b border-primary-ghost/20">
                    <h3 class="font-medium text-primary">Informations financières</h3>
                </div>
                <div class="p-4">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h4 class="text-xs text-primary-ghost uppercase mb-1">Montant total</h4>
                            <p class="font-semibold text-accent">{{ order.totalAmount.toFixed(2) }} €</p>
                        </div>
                        <div>
                            <h4 class="text-xs text-primary-ghost uppercase mb-1">Acompte</h4>
                            <p class="text-primary">{{ order.depositAmount.toFixed(2) }} €</p>
                        </div>
                        <div>
                            <h4 class="text-xs text-primary-ghost uppercase mb-1">Date d'échéance</h4>
                            <p class="text-primary">{{ order.deadlineDate ? formatDate(order.deadlineDate) : 'Non définie' }}</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Items de commande -->
            <div class="card-admin">
                <div class="px-4 py-3 bg-secondary-ghost border-b border-primary-ghost/20">
                    <h3 class="font-medium text-primary">Items de la commande</h3>
                </div>
                <div v-if="orderItems.length > 0" class="overflow-x-auto">
                    <table class="min-w-full">
                        <thead class="table-header">
                            <tr>
                                <th class="table-header-cell">Service</th>
                                <th class="table-header-cell text-right">Prix unitaire</th>
                                <th class="table-header-cell text-right">Quantité</th>
                                <th class="table-header-cell text-right">Montant total</th>
                            </tr>
                        </thead>
                        <tbody class="table-body">
                            <tr v-for="item in orderItems" :key="item.id" class="table-row">
                                <td class="table-cell">{{ item.service?.name || 'Service non disponible' }}</td>
                                <td class="table-cell text-right">{{ item.unitAmount.toFixed(2) }} €</td>
                                <td class="table-cell text-right">{{ item.quantity }}</td>
                                <td class="table-cell text-right font-medium">{{ item.totalAmount.toFixed(2) }} €</td>
                            </tr>
                        </tbody>
                        <tfoot class="bg-secondary-ghost">
                            <tr>
                                <td colspan="3" class="px-4 py-2 text-right font-medium text-primary">Total</td>
                                <td class="px-4 py-2 text-right font-bold text-accent">{{ order.totalAmount.toFixed(2) }} €</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <div class="p-4" v-else>
                    <p class="text-primary-ghost">Aucun item dans cette commande</p>
                </div>
            </div>

            <!-- Informations Stripe si disponibles -->
            <div v-if="order.stripeSessionId || order.stripePaymentIntentId" class="card-admin">
                <div class="px-4 py-3 bg-secondary-ghost border-b border-primary-ghost/20">
                    <h3 class="font-medium text-primary">Informations de paiement Stripe</h3>
                </div>
                <div class="p-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-if="order.stripeSessionId">
                            <h4 class="text-xs text-primary-ghost uppercase mb-1">Session ID</h4>
                            <p class="text-xs font-mono break-all text-primary">{{ order.stripeSessionId }}</p>
                        </div>
                        <div v-if="order.stripePaymentIntentId">
                            <h4 class="text-xs text-primary-ghost uppercase mb-1">Payment Intent ID</h4>
                            <p class="text-xs font-mono break-all text-primary">{{ order.stripePaymentIntentId }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <BaseButton variant="accent" @click="closeModal">
                Fermer
            </BaseButton>
        </template>
    </BaseModal>
</template>
