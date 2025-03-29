<script setup lang="ts">
import { Service } from '@/types';
import AddToCartButton from '@/components/cart/AddToCartButton.vue';
import { CheckBadgeIcon } from '@heroicons/vue/24/solid';

// Définition des props
defineProps<{
    service: Service
}>();
</script>

<template>
    <div class="card hover:shadow-lg transition-shadow space-y-4 flex flex-col justify-between">
        <div class="text-center flex items-center flex-col space-y-2">
            <h2 class="text-2xl font-bold">{{ service.name }}</h2>
            <img class="text-center w-3/5" :src="service.image" :alt="service.name">
            <p class="text-3xl font-bold text-accent">
                {{ service.basePrice }}€ HT
            </p>
        </div>
        <p class="text-primary text-xs text-center">{{ service.description }}</p>
        <div class="space-y-2">
            <h3 class="font-bold">Ce service comprend :</h3>
            <ul class="">
                <li v-for="(feature, index) in service.features" :key="index"
                    class="flex items-start hover:bg-secondary p-2 rounded-md transition-colors text-sm gap-1">
                    <div class="w-6">
                        <CheckBadgeIcon class="size-4 text-emphasis"></CheckBadgeIcon>
                    </div>
                    <span>{{ feature }}</span>
                </li>
            </ul>
        </div>
        <AddToCartButton :service="service" class="w-full text-center block" />
    </div>
</template>