<script setup lang="ts">
import {
    getMainStatusLabel,
    getMainStatusClasses,
    formatDate,
    getOrderReference
} from '@/utils/status.utils';

defineProps<{
    orders: any[];
}>();
</script>

<template>
    <div class="hidden sm:block overflow-x-auto rounded">
        <table class="min-w-full">
            <thead class="bg-emphasis-ghost">
                <tr>
                    <th class="py-3 px-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                        Référence</th>
                    <th class="py-3 px-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">Date
                    </th>
                    <th class="py-3 px-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">Montant
                    </th>
                    <th class="py-3 px-4 text-left text-xs font-medium text-secondary uppercase tracking-wider">Statut
                    </th>
                </tr>
            </thead>
            <tbody class="bg-secondary-ghost divide-y divide-primary">
                <tr v-for="order in orders.slice(0, 5)" :key="order.id || Math.random()"
                    class="hover:bg-secondary-ghost">
                    <td class="py-3 px-4 whitespace-nowrap">{{ getOrderReference(order) }}</td>
                    <td class="py-3 px-4 whitespace-nowrap">{{ formatDate(order.createdAt) }}</td>
                    <td class="py-3 px-4 whitespace-nowrap">{{ order.totalAmount.toFixed(2) }} €</td>
                    <td class="py-3 px-4 whitespace-nowrap">
                        <span :class="getMainStatusClasses(order.statusMain)">
                            {{ getMainStatusLabel(order.statusMain) }}
                        </span>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>