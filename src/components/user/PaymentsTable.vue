<script setup lang="ts">
import {
    getPaymentStatusLabel,
    getPaymentStatusClasses,
    formatDate,
    getOrderReference
} from '@/utils/status.utils';

defineProps<{
    orders: any[];
}>();
</script>

<template>
    <div>
        <p class="text-primary">Historique des paiements et factures.</p>

        <div class="hidden sm:block overflow-x-auto rounded mt-4">
            <table class="min-w-full">
                <thead class="bg-emphasis-ghost">
                    <tr>
                        <th class="py-3 px-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Référence</th>
                        <th class="py-3 px-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">Date
                        </th>
                        <th class="py-3 px-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Montant</th>
                        <th class="py-3 px-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Statut</th>
                    </tr>
                </thead>
                <tbody class="bg-secondary-ghost divide-y divide-primary">
                    <tr v-for="order in orders.slice(0, 5)" :key="order.id || Math.random()"
                        class="hover:bg-secondary-ghost">
                        <td class="py-3 px-4 whitespace-nowrap">{{ getOrderReference(order) }}</td>
                        <td class="py-3 px-4 whitespace-nowrap">{{ formatDate(order.createdAt) }}</td>
                        <td class="py-3 px-4 whitespace-nowrap">{{ order.totalAmount.toFixed(2) }} €</td>
                        <td class="py-3 px-4 whitespace-nowrap">
                            <span :class="getPaymentStatusClasses(order.statusPayment)">
                                {{ getPaymentStatusLabel(order.statusPayment) }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="sm:hidden space-y-4 mt-4">
            <div v-for="order in orders.slice(0, 3)" :key="order.id || Math.random()"
                class="bg-white p-4 rounded-lg shadow border border-gray-300">
                <div class="flex justify-between items-start mb-2">
                    <span class="font-medium">{{ getOrderReference(order) }}</span>
                    <span :class="getPaymentStatusClasses(order.statusPayment)">
                        {{ getPaymentStatusLabel(order.statusPayment) }}
                    </span>
                </div>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p class="text-gray-500">Date</p>
                        <p>{{ formatDate(order.createdAt) }}</p>
                    </div>
                    <div>
                        <p class="text-gray-500">Montant</p>
                        <p class="font-medium">{{ order.totalAmount.toFixed(2) }} €</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>