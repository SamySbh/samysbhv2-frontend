<script setup lang="ts">
import { ref } from 'vue';
import vueFilePond from 'vue-filepond';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import FilePondPluginFileValidateSize from 'filepond-plugin-file-validate-size';

// Importation des styles CSS
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';

// Création du composant FilePond avec les plugins
const FilePond = vueFilePond(
    FilePondPluginImagePreview,
    FilePondPluginFileValidateType,
    FilePondPluginFileValidateSize
);

// Props du composant
const props = defineProps({
    // Apparence
    buttonText: {
        type: String,
        default: 'Télécharger une image'
    },

    // Comportement
    multiple: {
        type: Boolean,
        default: false
    },

    // Validation
    maxSizeInMB: {
        type: Number,
        default: 5 // 5MB par défaut
    },
    acceptedTypes: {
        type: Array as () => string[],
        default: () => ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    }
});

// Émission d'événements
const emit = defineEmits<{
    (e: 'file-selected', file: File | File[]): void;
    (e: 'error', message: string): void;
    (e: 'upload-start'): void;
    (e: 'upload-end'): void;
}>();

// État pour stocker les fichiers sélectionnés
const files = ref<any[]>([]);

// Gestion de mise à jour des fichiers
const handleUpdateFiles = (fileItems: any[]) => {
    if (fileItems.length > 0) {
        // Extraction des objets File depuis les FilePondItems
        const actualFiles = fileItems.map(fileItem => fileItem.file);
        // Émission de l'événement avec le(s) fichier(s)
        emit('file-selected', props.multiple ? actualFiles : actualFiles[0]);
    }
};

// Gestion du début du traitement
const handleProcessStart = () => {
    emit('upload-start');
};

// Gestion de la fin du traitement
const handleProcessEnd = () => {
    emit('upload-end');
};

// Gestion des erreurs
const handleError = (error: any) => {
    emit('error', error.body);
};

// Méthodes exposées pour un usage externe
defineExpose({
    // Réinitialiser le composant
    reset: () => {
        files.value = [];
    },

    // Définir l'état de chargement
    setLoading: (isLoading: boolean): void => {
        // FilePond gère l'état de chargement automatiquement,
        // mais on peut émettre les événements pour la compatibilité
        if (isLoading) {
            emit('upload-start');
        } else {
            emit('upload-end');
        }
    }
});
</script>

<template>
    <div>
        <FilePond v-model="files" :allow-multiple="multiple" :accepted-file-types="acceptedTypes"
            :max-file-size="`${maxSizeInMB}MB`" :label-idle="`${buttonText} ou glissez et déposez`"
            :style-panel-layout="multiple ? 'grid' : 'compact'" name="files" @processstart="handleProcessStart"
            @processend="handleProcessEnd" @error="handleError" @updatefiles="handleUpdateFiles" />
    </div>
</template>