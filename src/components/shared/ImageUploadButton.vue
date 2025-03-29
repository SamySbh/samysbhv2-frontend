<script setup lang="ts">
import { ref } from 'vue';
import FileUploader from './FileUploader.vue';
import { FileUploaderInstance } from '@/types';

// Props pour recevoir une image existante
defineProps<{
    initialImage?: string;
}>();

// Émetteurs d'événements pour remonter l'image sélectionnée au parent
const emit = defineEmits<{
    (e: 'file-selected', file: File | File[]): void;
}>();

// Utiliser le type générique avec ref
const fileUploader = ref<FileUploaderInstance | null>(null);

// Gestion des fichiers sélectionnés - MODIFIÉ pour émettre l'événement au parent
const handleFileSelected = (file: File | File[]) => {
    console.log('Fichier(s) sélectionné(s):', file);
    // Remonter l'événement au composant parent
    emit('file-selected', file);
};

// Gestion des erreurs
const handleError = (message: string) => {
    console.error('Erreur d\'upload:', message);
    // Afficher le message d'erreur à l'utilisateur
};

// Gestion du début de l'upload
const handleUploadStart = () => {
    console.log('Upload démarré');
    // Afficher un indicateur de chargement global si nécessaire
};

// Gestion de la fin de l'upload
const handleUploadEnd = () => {
    console.log('Upload terminé');
    // Masquer l'indicateur de chargement
};

// Exemple de réinitialisation du composant
const resetUploader = () => {
    if (fileUploader.value) {
        fileUploader.value.reset();
    }
};

// Exposer la méthode reset pour le parent
defineExpose({
    reset: resetUploader
});
</script>

<template>
    <div>
        <FileUploader ref="fileUploader" buttonText="Choisir une image" containerClass="max-w-lg" :multiple="false"
            :maxSizeInMB="2" :acceptedTypes="['image/jpeg', 'image/png']" @file-selected="handleFileSelected"
            @error="handleError" @upload-start="handleUploadStart" @upload-end="handleUploadEnd" />
    </div>
</template>