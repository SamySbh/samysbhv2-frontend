<script setup lang="ts">
import {
    getPaymentStatusLabel,
    getPaymentStatusVariant,
    formatDate,
    getOrderReference
} from '@/utils/status.utils';
import BaseBadge from '@/components/ui/BaseBadge.vue';

defineProps<{
    orders: any[];
}>();
</script>

<template>
    <div>
        <p class="text-primary">Historique des paiements et factures.</p>

        <!-- Vue tableau pour desktop -->
        <div class="hidden sm:block table-container mt-4">
            <table class="min-w-full">
                <thead class="table-header">
                    <tr>
                        <th class="table-header-cell">Référence</th>
                        <th class="table-header-cell">Date</th>
                        <th class="table-header-cell">Montant</th>
                        <th class="table-header-cell">Statut</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr v-for="order in orders.slice(0, 5)" :key="order.id || Math.random()" class="table-row">
                        <td class="table-cell">{{ getOrderReference(order) }}</td>
                        <td class="table-cell">{{ formatDate(order.createdAt) }}</td>
                        <td class="table-cell">{{ order.totalAmount.toFixed(2) }} €</td>
                        <td class="table-cell">
                            <BaseBadge :variant="getPaymentStatusVariant(order.statusPayment)">
                                {{ getPaymentStatusLabel(order.statusPayment) }}
                            </BaseBadge>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Vue carte pour mobile -->
        <div class="sm:hidden space-y-4 mt-4">
            <div v-for="order in orders.slice(0, 3)" :key="order.id || Math.random()"
                class="bg-secondary p-4 rounded-lg shadow border border-primary-ghost/20">
                <div class="flex justify-between items-start mb-2">
                    <span class="font-medium text-primary">{{ getOrderReference(order) }}</span>
                    <BaseBadge :variant="getPaymentStatusVariant(order.statusPayment)">
                        {{ getPaymentStatusLabel(order.statusPayment) }}
                    </BaseBadge>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p class="text-primary-ghost">Date</p>
                        <p class="text-primary">{{ formatDate(order.createdAt) }}</p>
                    </div>
                    <div>
                        <p class="text-primary-ghost">Montant</p>
                        <p class="font-medium text-primary">{{ order.totalAmount.toFixed(2) }} €</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
