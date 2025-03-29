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
    <div class="sm:hidden space-y-4">
        <div v-for="order in orders.slice(0, 3)" :key="order.id || Math.random()"
            class="bg-white p-4 rounded-lg shadow border border-gray-300">
            <div class="flex justify-between items-start mb-2">
                <span class="font-medium">{{ getOrderReference(order) }}</span>
                <span :class="getMainStatusClasses(order.statusMain)">
                    {{ getMainStatusLabel(order.statusMain) }}
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
</template>