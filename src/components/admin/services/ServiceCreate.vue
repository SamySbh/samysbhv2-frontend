<script setup lang="ts">
import { ref } from 'vue';
import { useServiceStore } from '@/stores/service.store';
import { useUploadStore } from '@/stores/upload.store'; // Ajout du store d'upload
import ImageUploadButton from '@/components/shared/ImageUploadButton.vue';
import { ServiceFormData, serviceTypes, defaultServiceFormData } from '@/types';

// Store service et upload
const serviceStore = useServiceStore();
const uploadStore = useUploadStore(); // Utilisation du store d'upload

// Définir les émetteurs d'événements
const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'serviceCreated'): void;
}>();

// État de chargement et d'erreur
const isSubmitting = ref<boolean>(false);
const errorMessage = ref<string>('');
const selectedImage = ref<File | null>(null);

// État initial du formulaire
const formData = ref<ServiceFormData>({...defaultServiceFormData});

// Gestion des features
const newFeature = ref<string>('');

const addFeature = (): void => {
    if (newFeature.value.trim()) {
        // Assurez-vous que formData.value.features existe
        if (!formData.value.features) {
            formData.value.features = [];
        }
        formData.value.features.push(newFeature.value.trim());
        newFeature.value = '';
    }
};

const removeFeature = (index: number): void => {
    formData.value.features.splice(index, 1);
};

// Gestion de la sélection d'image
const handleFileSelected = (file: File | File[]): void => {
    // Si c'est un seul fichier (non multiple)
    if (!Array.isArray(file)) {
        selectedImage.value = file;
        console.log('Image sélectionnée dans ServiceCreate:', file.name);
    }
};

// Soumettre le formulaire
const submitForm = async (): Promise<void> => {
    isSubmitting.value = true;
    errorMessage.value = '';

    try {
        // Étape 1: Upload de l'image si une est sélectionnée
        let imageUrl = '';
        
        if (selectedImage.value) {
            try {
                // Utiliser le store d'upload
                imageUrl = await uploadStore.uploadFile(selectedImage.value);
            } catch (error) {
                throw new Error(`Échec de l'upload de l'image: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
            }
        }

        // Étape 2: Création du service avec les données JSON standard
        const serviceData = {
            name: formData.value.name,
            type: formData.value.type,
            basePrice: formData.value.basePrice,
            description: formData.value.description,
            isActive: formData.value.isActive,
            features: formData.value.features || [],
            image: imageUrl // Utiliser l'URL de l'image uploadée
        };
        
        // Appel à l'API pour créer le service avec des données JSON
        await serviceStore.createService(serviceData);
        
        emit('serviceCreated');
        emit('close');
    } catch (error) {
        console.error("Erreur détaillée:", error);
        errorMessage.value = error instanceof Error ? error.message : 'Une erreur est survenue';
    } finally {
        isSubmitting.value = false;
        uploadStore.resetState(); // Réinitialiser l'état du store d'upload
    }
};

// Fermer le modal
const closeModal = (): void => {
    uploadStore.resetState(); // Réinitialiser l'état du store d'upload pour nettoyer
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
                <h3 class="text-lg font-semibold text-primary">Ajouter un service</h3>
            </div>

            <!-- Corps du modal -->
            <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
                <form @submit.prevent="submitForm">
                    <!-- Message d'erreur -->
                    <div v-if="errorMessage" class="mb-4 p-3 bg-red-500 text-secondary rounded">
                        {{ errorMessage }}
                    </div>

                    <!-- Nom du service -->
                    <div class="mb-4">
                        <label for="name" class="block text-sm font-medium text-primary-ghost mb-1">Nom du service</label>
                        <input id="name" v-model="formData.name" type="text" required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent" />
                    </div>

                    <!-- Type de service -->
                    <div class="mb-4">
                        <label for="type" class="block text-sm font-medium text-primary-ghost mb-1">Type de service</label>
                        <select id="type" v-model="formData.type" required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent">
                            <option v-for="type in serviceTypes" :key="type" :value="type">{{ type }}</option>
                        </select>
                    </div>

                    <!-- Prix de base -->
                    <div class="mb-4">
                        <label for="basePrice" class="block text-sm font-medium text-primary-ghost mb-1">Prix de base
                            (€)</label>
                        <input id="basePrice" v-model.number="formData.basePrice" type="number" min="0" step="0.01"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent" />
                    </div>

                    <!-- Description -->
                    <div class="mb-4">
                        <label for="description"
                            class="block text-sm font-medium text-primary-ghost mb-1">Description</label>
                        <textarea id="description" v-model="formData.description" rows="4" required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent"></textarea>
                    </div>

                    <!-- Features du service -->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-primary-ghost mb-1">Caractéristiques</label>

                        <!-- Liste des features existantes -->
                        <ul v-if="formData.features && formData.features.length > 0" class="mb-2 space-y-1">
                            <li v-for="(feature, index) in formData.features" :key="index"
                                class="flex items-center px-3 py-2 bg-gray-50 rounded">
                                <span class="flex-grow">{{ feature }}</span>
                                <button type="button" @click="removeFeature(index)"
                                    class="ml-2 text-red-500 hover:text-red-700 focus:outline-none">
                                    <span class="sr-only">Supprimer</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20"
                                        fill="currentColor">
                                        <path fill-rule="evenodd"
                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                            clip-rule="evenodd" />
                                    </svg>
                                </button>
                            </li>
                        </ul>

                        <!-- Ajouter une nouvelle feature -->
                        <div class="flex space-x-2">
                            <input v-model="newFeature" type="text" placeholder="Ajouter une caractéristique"
                                class="flex-grow px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent"
                                @keyup.enter.prevent="addFeature" />
                            <button type="button" @click="addFeature"
                                class="px-3 py-2 bg-accent text-secondary rounded hover:bg-accent/90 focus:outline-none focus:ring-1 focus:ring-accent">
                                Ajouter
                            </button>
                        </div>
                    </div>

                    <!--Bouton d'upload d'une image-->
                    <div class="mb-4">
                        <label class="block text-sm font-medium text-primary-ghost mb-1">Image du service</label>
                        <ImageUploadButton @file-selected="handleFileSelected" />
                        <p v-if="selectedImage" class="mt-2 text-sm text-green-600">Image sélectionnée: {{ selectedImage.name }}</p>
                        
                        <!-- Barre de progression pour l'upload (ajoutée) -->
                        <div v-if="uploadStore.uploadProgress > 0" class="mt-2">
                            <div class="relative pt-1">
                                <div class="flex mb-1 items-center justify-between">
                                    <div class="text-xs font-semibold text-primary">
                                        Upload: {{ uploadStore.uploadProgress }}%
                                    </div>
                                </div>
                                <div class="overflow-hidden h-2 mb-1 text-xs flex rounded bg-gray-200">
                                    <div :style="{ width: `${uploadStore.uploadProgress}%` }"
                                        class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Statut actif -->
                    <div class="mb-4 flex items-center">
                        <input id="isActive" v-model="formData.isActive" type="checkbox"
                            class="h-4 w-4 text-accent focus:ring-accent border-gray-300 rounded" />
                        <label for="isActive" class="ml-2 block text-sm text-primary-ghost">Service actif</label>
                    </div>
                </form>
            </div>

            <!-- Pied du modal -->
            <div class="px-6 py-4 border-t border-emphasis flex justify-end space-x-2">
                <button @click="closeModal" class="px-4 py-2 bg-gray-100 text-primary-ghost rounded hover:bg-gray-300"
                    :disabled="isSubmitting || uploadStore.isUploading">
                    Annuler
                </button>
                <button @click="submitForm" class="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
                    :disabled="isSubmitting || uploadStore.isUploading">
                    <span v-if="isSubmitting || uploadStore.isUploading">
                        <svg v-if="uploadStore.uploadProgress > 0 && uploadStore.uploadProgress < 100" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {{ uploadStore.isUploading ? 'Upload en cours...' : 'Création...' }}
                    </span>
                    <span v-else>Créer le service</span>
                </button>
            </div>
        </div>
    </div>
</template>