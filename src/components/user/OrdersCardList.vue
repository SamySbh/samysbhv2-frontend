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
    <div class="sm:hidden space-y-4">
        <div v-for="order in orders.slice(0, 3)" :key="order.id || Math.random()"
            class="bg-secondary p-4 rounded-lg shadow border border-primary-ghost/20 cursor-pointer hover:border-accent transition-colors"
            @click="goToOrder(order.id)">
            <div class="flex justify-between items-start mb-2">
                <span class="font-medium text-primary">{{ getOrderReference(order) }}</span>
                <BaseBadge :variant="getMainStatusVariant(order.statusMain)">
                    {{ getMainStatusLabel(order.statusMain) }}
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
</template>
