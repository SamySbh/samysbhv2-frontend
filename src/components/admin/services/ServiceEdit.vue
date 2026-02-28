<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useServiceStore } from '@/stores/service.store';
import { useUploadStore } from '@/stores/upload.store';
import { Service, ServiceFormData, defaultServiceFormData, serviceTypes } from '@/types/service';
import ImageUploadButton from '@/components/shared/ImageUploadButton.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

// Props
const props = defineProps<{
    service: Service;
}>();

// Store service
const serviceStore = useServiceStore();
const uploadStore = useUploadStore();

// Définir les émetteurs d'événements
const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'serviceUpdated'): void;
}>();

// État de chargement et d'erreur
const isSubmitting = ref<boolean>(false);
const errorMessage = ref<string>('');
const newFeature = ref<string>('');
const selectedImage = ref<File | null>(null);

// Options pour le select des types
const typeOptions = serviceTypes.map(type => ({
    value: type,
    label: type
}));

const addFeature = (): void => {
    if (newFeature.value.trim()) {
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

// Gestion de la sélection d'image depuis ImageUploadButton
const handleFileSelected = (file: File | File[]): void => {
    if (!Array.isArray(file)) {
        selectedImage.value = file;
    }
};

// Soumettre le formulaire
const submitForm = async (): Promise<void> => {
    isSubmitting.value = true;
    errorMessage.value = '';

    try {
        if (!props.service.id) {
            throw new Error('ID service manquant');
        }

        let imageUrl = formData.value.image;

        if (selectedImage.value) {
            try {
                imageUrl = await uploadStore.uploadFile(selectedImage.value);
            } catch (error) {
                throw new Error(`Échec de l'upload de l'image: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
            }
        }

        const serviceData = {
            name: formData.value.name,
            type: formData.value.type,
            basePrice: formData.value.basePrice,
            description: formData.value.description,
            isActive: formData.value.isActive,
            features: formData.value.features || [],
            image: imageUrl
        };

        await serviceStore.updateService(props.service.id, serviceData);

        emit('serviceUpdated');
        emit('close');
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Une erreur est survenue';
    } finally {
        isSubmitting.value = false;
        uploadStore.resetState();
    }
};

// Fermer le modal
const closeModal = (): void => {
    uploadStore.resetState();
    emit('close');
};

// État initial du formulaire
const formData = ref<ServiceFormData>({ ...defaultServiceFormData });

// Initialiser le formulaire avec les données du service existant
onMounted(() => {
    formData.value = {
        name: props.service.name,
        type: props.service.type,
        basePrice: props.service.basePrice,
        description: props.service.description,
        image: props.service.image || '',
        isActive: props.service.isActive,
        features: props.service.features || []
    };
});
</script>

<template>
    <BaseModal title="Modifier le service" @close="closeModal">
        <form @submit.prevent="submitForm" class="space-y-4">
            <!-- Message d'erreur -->
            <BaseAlert v-if="errorMessage" variant="error" dismissible @dismiss="errorMessage = ''">
                {{ errorMessage }}
            </BaseAlert>

            <!-- Nom du service -->
            <BaseInput
                v-model="formData.name"
                label="Nom du service"
                required
                light-mode
            />

            <!-- Type de service -->
            <BaseSelect
                v-model="formData.type"
                :options="typeOptions"
                label="Type de service"
                placeholder="Sélectionner un type"
                required
                light-mode
            />

            <!-- Prix de base -->
            <BaseInput
                v-model="formData.basePrice"
                type="number"
                label="Prix de base (€)"
                :min="0"
                step="0.01"
                required
                light-mode
            />

            <!-- Description -->
            <div>
                <label class="input-label-light">Description</label>
                <textarea
                    v-model="formData.description"
                    rows="4"
                    required
                    class="input-field-light"
                ></textarea>
            </div>

            <!-- Features du service -->
            <div>
                <label class="input-label-light">Caractéristiques</label>

                <!-- Liste des features existantes -->
                <ul v-if="formData.features && formData.features.length > 0" class="mb-2 space-y-1">
                    <li v-for="(feature, index) in formData.features" :key="index"
                        class="flex items-center px-3 py-2 bg-secondary-ghost rounded">
                        <span class="flex-grow text-primary">{{ feature }}</span>
                        <button type="button" @click="removeFeature(index)"
                            class="ml-2 text-error hover:text-error/80 focus:outline-none">
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
                    <input
                        v-model="newFeature"
                        type="text"
                        placeholder="Ajouter une caractéristique"
                        class="input-field-light flex-grow"
                        @keyup.enter.prevent="addFeature"
                    />
                    <BaseButton type="button" variant="accent" @click="addFeature">
                        Ajouter
                    </BaseButton>
                </div>
            </div>

            <!-- Bouton d'upload d'une image -->
            <div>
                <label class="input-label-light">Image du service</label>
                <ImageUploadButton :initial-image="formData.image" @file-selected="handleFileSelected" />
                <p v-if="selectedImage" class="mt-2 text-sm text-success">
                    Nouvelle image sélectionnée: {{ selectedImage.name }}
                </p>
                <p v-else-if="formData.image" class="mt-2 text-sm text-info">
                    Image actuelle: {{ formData.image.split('/').pop() }}
                </p>

                <!-- Barre de progression pour l'upload -->
                <div v-if="uploadStore.uploadProgress > 0" class="mt-2">
                    <div class="relative pt-1">
                        <div class="flex mb-1 items-center justify-between">
                            <div class="text-xs font-semibold text-primary">
                                Upload: {{ uploadStore.uploadProgress }}%
                            </div>
                        </div>
                        <div class="overflow-hidden h-2 mb-1 text-xs flex rounded bg-secondary-ghost">
                            <div :style="{ width: `${uploadStore.uploadProgress}%` }"
                                class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-accent">
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Statut actif -->
            <div class="flex items-center">
                <input
                    id="isActive"
                    v-model="formData.isActive"
                    type="checkbox"
                    class="h-4 w-4 text-accent focus:ring-accent border-primary-ghost rounded"
                />
                <label for="isActive" class="ml-2 block text-sm text-primary-ghost">Service actif</label>
            </div>
        </form>

        <template #footer>
            <BaseButton
                variant="secondary"
                @click="closeModal"
                :disabled="isSubmitting || uploadStore.isUploading"
            >
                Annuler
            </BaseButton>
            <BaseButton
                variant="accent"
                @click="submitForm"
                :loading="isSubmitting || uploadStore.isUploading"
            >
                <template #loading>
                    {{ uploadStore.isUploading ? 'Upload en cours...' : 'Enregistrement...' }}
                </template>
                Enregistrer les modifications
            </BaseButton>
        </template>
    </BaseModal>
</template>
