<script setup lang="ts">
import { useRouter } from 'vue-router';
import {
    getMainStatusLabel,
    getMainStatusVariant,
    formatDate,
    getOrderReference
} from '@/utils/status.utils';
import BaseBadge from '@/components/ui/BaseBadge.vue';

defineProps<{
    orders: any[];
}>();

const router = useRouter();

function goToOrder(orderId: string) {
    router.push({ name: 'order-page', params: { id: orderId } });
}
</script>

<template>
    <div class="hidden sm:block table-container">
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
                <tr
                    v-for="order in orders.slice(0, 5)"
                    :key="order.id || Math.random()"
                    class="table-row cursor-pointer hover:bg-emphasis/10 transition-colors"
                    @click="goToOrder(order.id)"
                >
                    <td class="table-cell text-accent underline">{{ getOrderReference(order) }}</td>
                    <td class="table-cell">{{ formatDate(order.createdAt) }}</td>
                    <td class="table-cell">{{ order.totalAmount.toFixed(2) }} €</td>
                    <td class="table-cell">
                        <BaseBadge :variant="getMainStatusVariant(order.statusMain)">
                            {{ getMainStatusLabel(order.statusMain) }}
                        </BaseBadge>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>
