import { defineStore } from "pinia";
import { ref } from "vue";

export const useUploadStore = defineStore('upload', () => {
    const isUploading = ref<boolean>(false);
    const error = ref<string | null>(null);
    const uploadProgress = ref<number>(0);
    const apiUrl = import.meta.env.VITE_API_URL;

    /**
     * Upload un fichier vers le serveur
     * @param file Le fichier à uploader
     * @param endpoint L'endpoint d'API (par défaut '/upload/image')
     * @returns Promise avec l'URL du fichier uploadé
     */
    async function uploadFile(file: File, endpoint: string = '/upload/image'): Promise<string> {
        isUploading.value = true;
        error.value = null;
        uploadProgress.value = 0;

        try {
            // Obtenir le token d'authentification
            const token = localStorage.getItem('accessToken');

            const formData = new FormData();
            formData.append('image', file);

            // Utiliser XMLHttpRequest pour suivre la progression
            return new Promise<string>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        uploadProgress.value = Math.round((event.loaded / event.total) * 100);
                    }
                });

                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            if (response.success && response.data && response.data.imageUrl) {
                                uploadProgress.value = 100;
                                resolve(response.data.imageUrl);
                            } else {
                                reject(new Error(response.message || 'Échec de l\'upload'));
                            }
                        } catch (e) {
                            reject(new Error('Erreur lors du traitement de la réponse'));
                        }
                    } else {
                        reject(new Error(`Erreur HTTP: ${xhr.status}`));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Erreur réseau lors de l\'upload'));
                });

                xhr.addEventListener('abort', () => {
                    reject(new Error('Upload annulé'));
                });

                xhr.open('POST', `${apiUrl}${endpoint}`);

                // Ajouter les en-têtes d'authentification
                if (token) {
                    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                }

                xhr.send(formData);
            });

        } catch (err) {
            error.value = err instanceof Error ? err.message : 'Erreur inconnue';
            throw err;
        } finally {
            isUploading.value = false;
        }
    }

    /**
     * Réinitialise l'état du store
     */
    function resetState() {
        isUploading.value = false;
        error.value = null;
        uploadProgress.value = 0;
    }

    return {
        isUploading,
        error,
        uploadProgress,
        uploadFile,
        resetState
    };
});