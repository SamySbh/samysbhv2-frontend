<script setup lang="ts">
defineProps<{
    stats: {
        totalOrders: number;
        totalAmount: number;
        pendingOrders: number;
    }
}>();
</script>

<template>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div class="bg-accent text-secondary p-4 rounded-lg shadow-md text-center">
            <h3 class="text-2xl font-bold mb-1">{{ stats.totalOrders }}</h3>
            <p class="text-sm opacity-80">Commandes au total</p>
        </div>
        <div class="bg-accent text-secondary p-4 rounded-lg shadow-md text-center">
            <h3 class="text-2xl font-bold mb-1">{{ stats.totalAmount.toFixed(2) }} €</h3>
            <p class="text-sm opacity-80">Montant total</p>
        </div>
        <div class="bg-accent text-secondary p-4 rounded-lg shadow-md text-center">
            <h3 class="text-2xl font-bold mb-1">{{ stats.pendingOrders }}</h3>
            <p class="text-sm opacity-80">Commandes en cours</p>
        </div>
    </div>
</template>