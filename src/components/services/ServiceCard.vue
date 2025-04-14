<script setup lang="ts">
import { Service } from '@/types';
import AddToCartButton from '@/components/cart/AddToCartButton.vue';
import { CheckBadgeIcon } from '@heroicons/vue/24/solid';
import { computed } from 'vue';

// Définition des props
const props = defineProps<{
    service: Service
}>();

// Fonction pour formater correctement l'URL de l'image
const getImageUrl = computed(() => {
    if (!props.service.image) return '';
    
    // Si l'URL est déjà complète (commence par http ou https)
    if (props.service.image.startsWith('http')) {
        return props.service.image;
    }
    
    // Si l'image a un chemin qui inclut /src/assets/uploads/, transformer en URL backend
    if (props.service.image.includes('/src/assets/uploads/')) {
        const filename = props.service.image.split('/').pop();
        return `${import.meta.env.VITE_API_URL || 'https://backend.samysbh.fr'}/uploads/${filename}`;
    }
    
    // Si l'image a déjà le format /uploads/
    if (props.service.image.startsWith('/uploads/')) {
        return `${import.meta.env.VITE_API_URL || 'https://backend.samysbh.fr'}${props.service.image}`;
    }
    
    // Fallback - retourner l'image telle quelle
    return props.service.image;
});
</script>

<template>
    <div class="card hover:shadow-lg transition-shadow space-y-4 flex flex-col justify-between">
        <div class="text-center flex items-center flex-col space-y-2">
            <h2 class="text-2xl font-bold">{{ service.name }}</h2>
            <img class="text-center w-3/5" :src="getImageUrl" :alt="service.name">
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