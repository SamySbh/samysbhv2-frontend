<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from '@/stores/user.store';

// Store utilisateur
const userStore = useUserStore();

// Définir les émetteurs d'événements
const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'userCreated'): void;
}>();

// État local du formulaire
const formData = ref({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    phone: '',
    company: '',
    role: 'USER' as 'ADMIN' | 'USER' | 'DISABLED'
});

// État de chargement et d'erreur
const isSubmitting = ref(false);
const errorMessage = ref('');

// Soumettre le formulaire
const submitForm = async () => {
    isSubmitting.value = true;
    errorMessage.value = '';

    try {
        await userStore.createUser(formData.value);
        emit('userCreated');
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Une erreur est survenue';
    } finally {
        isSubmitting.value = false;
    }
};

// Fermer le modal
const closeModal = () => {
    emit('close');
};
</script>

<template>
    <!-- Fond semi-transparent -->
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <!-- Modal -->
        <div class="bg-white rounded-lg shadow-lg w-full max-w-md mx-4">
            <!-- En-tête du modal -->
            <div class="px-6 py-4 border-b border-gray-300">
                <h3 class="text-lg font-semibold text-secondary">Ajouter un utilisateur</h3>
            </div>

            <!-- Corps du modal -->
            <div class="px-6 py-4">
                <form @submit.prevent="submitForm">
                    <!-- Message d'erreur -->
                    <div v-if="errorMessage" class="mb-4 p-3 bg-red-500 text-secondary rounded">
                        {{ errorMessage }}
                    </div>

                    <!-- Email -->
                    <div class="mb-4">
                        <label for="email" class="block text-sm font-medium text-primary-ghost mb-1">Email</label>
                        <input id="email" v-model="formData.email" type="email" required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent" />
                    </div>

                    <!-- Prénom -->
                    <div class="mb-4">
                        <label for="firstName" class="block text-sm font-medium text-primary-ghost mb-1">Prénom</label>
                        <input id="firstName" v-model="formData.firstName" type="text" required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent" />
                    </div>

                    <!-- Nom -->
                    <div class="mb-4">
                        <label for="lastName" class="block text-sm font-medium text-primary-ghost mb-1">Nom</label>
                        <input id="lastName" v-model="formData.lastName" type="text" required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent" />
                    </div>

                    <!-- Mot de passe -->
                    <div class="mb-4">
                        <label for="password" class="block text-sm font-medium text-primary-ghost mb-1">Mot de passe</label>
                        <input id="password" v-model="formData.password" type="password" required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent" />
                    </div>

                    <!-- Téléphone -->
                    <div class="mb-4">
                        <label for="phone" class="block text-sm font-medium text-primary-ghost mb-1">Téléphone</label>
                        <input id="phone" v-model="formData.phone" type="tel"
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent" />
                    </div>

                    <!-- Entreprise -->
                    <div class="mb-4">
                        <label for="company" class="block text-sm font-medium text-primary-ghost mb-1">Entreprise</label>
                        <input id="company" v-model="formData.company" type="text"
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent" />
                    </div>

                    <!-- Rôle -->
                    <div class="mb-4">
                        <label for="role" class="block text-sm font-medium text-primary-ghost mb-1">Rôle</label>
                        <select id="role" v-model="formData.role" required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent">
                            <option value="ADMIN">Administrateur</option>
                            <option value="USER">Utilisateur</option>
                            <option value="DISABLED">Désactivé</option>
                        </select>
                    </div>
                </form>
            </div>

            <!-- Pied du modal -->
            <div class="px-6 py-4 border-t border-gray-300 flex justify-end space-x-2">
                <button @click="closeModal" class="px-4 py-2 bg-gray-100 text-primary-ghost rounded hover:bg-gray-300"
                    :disabled="isSubmitting">
                    Annuler
                </button>
                <button @click="submitForm" class="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
                    :disabled="isSubmitting">
                    {{ isSubmitting ? 'Création...' : 'Créer l\'utilisateur' }}
                </button>
            </div>
        </div>
    </div>
</template>