<script setup lang="ts">
import { Service } from '@/types/service';
import { CheckBadgeIcon } from '@heroicons/vue/24/solid';

// Props
defineProps<{
    service: Service;
}>();

// Définir les émetteurs d'événements
const emit = defineEmits<{
    (e: 'close'): void;
}>();

// Fermer le modal
const closeModal = () => {
    emit('close');
};
</script>

<template>
    <!-- Fond semi-transparent -->
    <div class="fixed inset-0 bg-primary bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
        <!-- Modal -->
        <div class="bg-secondary rounded-lg shadow-lg w-full max-w-lg mx-4 my-8">
            <!-- En-tête du modal -->
            <div class="px-6 py-4 border-b border-emphasis">
                <h3 class="text-lg font-semibold text-primary">Détails du service</h3>
            </div>

            <!-- Corps du modal -->
            <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
                <!-- Image -->
                <div class="mb-6">
                    <img :src="service.image" :alt="service.name" class="w-full h-48 object-cover rounded shadow-sm"
                        @error="($event.target as HTMLImageElement).src = ''" />
                </div>

                <div class="space-y-4">
                    <!-- Nom et statut -->
                    <div class="flex justify-between items-start">
                        <h2 class="text-xl font-semibold text-secondary">{{ service.name }}</h2>
                        <span :class="[
                            'px-2 py-1 text-xs rounded-full',
                            service.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        ]">
                            {{ service.isActive ? 'Actif' : 'Inactif' }}
                        </span>
                    </div>

                    <!-- Type et ID -->
                    <div class="flex justify-between text-sm">
                        <div>
                            <span class="text-accent">Type:</span>
                            <span class="ml-2 font-medium">{{ service.type }}</span>
                        </div>
                        <div>
                            <span class="text-accent">ID:</span>
                            <span class="ml-2 font-mono text-xs">{{ service.id }}</span>
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
                            <li v-for="(feature, index) in service.features" :key="index" class="flex items-center gap-1">
                                <CheckBadgeIcon class="w-4 text-emphasis"/>
                                <span class="text-primary">{{ feature }}</span>
                            </li>
                        </ul>
                    </div>

                    <!-- Informations Stripe -->
                    <div v-if="service.stripeProductId" class="border-t pt-4 mt-4">
                        <h3 class="text-sm font-medium text-accent mb-2">Informations Stripe</h3>
                        <div class="flex items-start">
                            <span class="text-xs text-accent">Product ID:</span>
                            <span class="ml-2 text-xs font-mono break-all">{{ service.stripeProductId }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pied du modal -->
            <div class="px-6 py-4 border-t border-emphasis flex justify-end">
                <button @click="closeModal" class="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90">
                    Fermer
                </button>
            </div>
        </div>
    </div>
</template>