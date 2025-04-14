<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useServiceStore } from '@/stores/service.store';
import { storeToRefs } from 'pinia';
import { Service } from '@/types/service';
import ServiceCreate from './ServiceCreate.vue';
import ServiceEdit from './ServiceEdit.vue';
import ServiceDetails from './ServiceDetails.vue';

// Store service
const serviceStore = useServiceStore();
const { services, loading } = storeToRefs(serviceStore);

// État local
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showDetailsModal = ref(false);
const selectedService = ref<Service | null>(null);

// Fonction pour formater correctement l'URL de l'image
const getImageUrl = (imageUrl: string | undefined) => {
    if (!imageUrl) return '';

    // Si l'URL est déjà complète (commence par http ou https)
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }

    // Si l'image a un chemin qui inclut /src/assets/uploads/, transformer en URL backend
    if (imageUrl.includes('/src/assets/uploads/')) {
        const filename = imageUrl.split('/').pop();
        return `${import.meta.env.VITE_API_URL || 'https://backend.samysbh.fr'}/uploads/${filename}`;
    }

    // Si l'image a déjà le format /uploads/
    if (imageUrl.startsWith('/uploads/')) {
        return `${import.meta.env.VITE_API_URL || 'https://backend.samysbh.fr'}${imageUrl}`;
    }

    // Fallback - retourner l'image telle quelle
    return imageUrl;
};

// Chargement des services
onMounted(async () => {
    try {
        await serviceStore.getServices();
    } catch (error) {
        console.error('Erreur lors du chargement des services:', error);
    }
});

// Ouvrir le modal de création
const openCreateModal = () => {
    showCreateModal.value = true;
};

// Ouvrir le modal d'édition
const openEditModal = (service: Service) => {
    selectedService.value = service;
    showEditModal.value = true;
};

// Ouvrir le modal de détails
const openDetailsModal = (service: Service) => {
    selectedService.value = service;
    showDetailsModal.value = true;
};

// Fermer les modals
const closeModals = () => {
    showCreateModal.value = false;
    showEditModal.value = false;
    showDetailsModal.value = false;
    selectedService.value = null;
};

// Supprimer un service
const deleteService = async (serviceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
        return;
    }

    try {
        await serviceStore.deleteService(serviceId);
    } catch (error) {
        console.error('Erreur lors de la suppression du service:', error);
    }
};

// Rafraîchir la liste
const refreshList = async () => {
    try {
        // Forcer le rafraîchissement en réinitialisant d'abord le tableau
        serviceStore.resetState();
        // Puis récupérer les données fraîches
        await serviceStore.getServices();
        closeModals();
        console.log("Services après rafraîchissement:", services.value);
    } catch (error) {
        console.error('Erreur lors du rafraîchissement de la liste:', error);
    }
};
</script>
<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-secondary">Gestion des services</h2>
            <button @click="openCreateModal"
                class="bg-accent text-secondary px-4 py-2 rounded shadow hover:bg-accent/90 transition-colors">
                Ajouter un service
            </button>
        </div>

        <!-- Loader -->
        <div v-if="loading" class="text-center py-8 text-secondary">
            Chargement des services...
        </div>

        <!-- Affichage en grille des services -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="service in services" :key="service.id"
                class="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow">
                <div class="aspect-w-16 aspect-h-9 bg-gray-100">
                    <img :src="getImageUrl(service.image)" :alt="service.name" class="object-cover w-full h-48"
                        @error="($event.target as HTMLImageElement).src = ''" />
                </div>

                <div class="p-4">
                    <div class="flex justify-between items-start">
                        <h3 class="text-lg font-semibold mb-2">{{ service.name }}</h3>
                        <span :class="[
                            'px-2 py-1 text-xs rounded-full',
                            service.isActive ? 'bg-green-500 text-secondary' : 'bg-red-500 text-secondary'
                        ]">
                            {{ service.isActive ? 'Actif' : 'Inactif' }}
                        </span>
                    </div>

                    <p class="text-gray-600 mb-2 line-clamp-2">{{ service.description }}</p>

                    <div class="flex justify-between items-center mt-4">
                        <span class="font-semibold text-secondary">{{ service.basePrice.toFixed(2) }} €</span>
                        <span class="text-xs text-emphasis">{{ service.type }}</span>
                    </div>

                    <div class="flex justify-between mt-4 pt-3 border-t border-gray-100">
                        <button @click="openDetailsModal(service)" class="text-blue-500 hover:text-blue-700">
                            Détails
                        </button>

                        <div class="space-x-2">
                            <button @click="openEditModal(service)"
                                class="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600">
                                Modifier
                            </button>
                            <button @click="deleteService(service.id as string)"
                                class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Message si aucun service -->
        <div v-if="!loading && services.length === 0" class="text-center py-8 bg-gray-50 rounded-lg">
            <p class="text-emphasis">Aucun service disponible.</p>
            <button @click="openCreateModal"
                class="mt-4 bg-accent text-secondary px-4 py-2 rounded shadow hover:bg-accent/90 transition-colors">
                Ajouter un premier service
            </button>
        </div>

        <!-- Modal de création -->
        <ServiceCreate v-if="showCreateModal" @close="closeModals" @service-created="refreshList" />

        <!-- Modal d'édition -->
        <ServiceEdit v-if="showEditModal && selectedService" :service="selectedService" @close="closeModals"
            @service-updated="refreshList" />

        <!-- Modal de détails -->
        <ServiceDetails v-if="showDetailsModal && selectedService" :service="selectedService" @close="closeModals" />
    </div>
</template>