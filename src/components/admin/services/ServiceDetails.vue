<script setup lang="ts">
import { Service } from '@/types/service';
import { CheckBadgeIcon } from '@heroicons/vue/24/solid';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';

// Props
defineProps<{
    service: Service;
}>();

// Définir les émetteurs d'événements
const emit = defineEmits<{
    (e: 'close'): void;
}>();

// Fonction pour formater correctement l'URL de l'image
const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return '';

    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }

    if (imageUrl.includes('/src/assets/uploads/')) {
        const filename = imageUrl.split('/').pop();
        return `${import.meta.env.VITE_API_URL || 'https://backend.samysbh.fr'}/uploads/${filename}`;
    }

    if (imageUrl.startsWith('/uploads/')) {
        return `${import.meta.env.VITE_API_URL || 'https://backend.samysbh.fr'}${imageUrl}`;
    }

    return imageUrl;
};

// Fermer le modal
const closeModal = () => {
    emit('close');
};
</script>

<template>
    <BaseModal title="Détails du service" @close="closeModal">
        <!-- Image -->
        <div class="mb-6">
            <img :src="getImageUrl(service.image)" :alt="service.name"
                class="w-full h-48 object-cover rounded shadow-sm"
                @error="($event.target as HTMLImageElement).src = ''" />
        </div>

        <div class="space-y-4">
            <!-- Nom et statut -->
            <div class="flex justify-between items-start">
                <h2 class="text-xl font-semibold text-primary">{{ service.name }}</h2>
                <BaseBadge :variant="service.isActive ? 'success' : 'error'">
                    {{ service.isActive ? 'Actif' : 'Inactif' }}
                </BaseBadge>
            </div>

            <!-- Type et ID -->
            <div class="flex justify-between text-sm">
                <div>
                    <span class="text-accent">Type:</span>
                    <span class="ml-2 font-medium text-primary">{{ service.type }}</span>
                </div>
                <div>
                    <span class="text-accent">ID:</span>
                    <span class="ml-2 font-mono text-xs text-primary">{{ service.id }}</span>
                </div>
            </div>

            <!-- Prix -->
            <div>
                <span class="text-accent">Prix de base:</span>
                <span class="ml-2 font-semibold text-primary">{{ service.basePrice.toFixed(2) }} €</span>
            </div>

            <!-- Description -->
            <div>
                <h3 class="text-sm font-medium text-accent mb-2">Description</h3>
                <p class="text-primary whitespace-pre-line">{{ service.description }}</p>
            </div>

            <!-- Caractéristiques -->
            <div v-if="service.features && service.features.length > 0">
                <h3 class="text-sm font-medium text-accent mb-2">Caractéristiques</h3>
                <ul class="space-y-1 pl-2">
                    <li v-for="(feature, index) in service.features" :key="index"
                        class="flex items-center gap-1">
                        <CheckBadgeIcon class="w-4 text-emphasis" />
                        <span class="text-primary">{{ feature }}</span>
                    </li>
                </ul>
            </div>

            <!-- Informations Stripe -->
            <div v-if="service.stripeProductId" class="border-t border-primary-ghost/20 pt-4 mt-4">
                <h3 class="text-sm font-medium text-accent mb-2">Informations Stripe</h3>
                <div class="flex items-start">
                    <span class="text-xs text-accent">Product ID:</span>
                    <span class="ml-2 text-xs font-mono break-all text-primary">{{ service.stripeProductId }}</span>
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
