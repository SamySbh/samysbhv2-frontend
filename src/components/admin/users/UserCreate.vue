<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUserStore } from '@/stores/user.store';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

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

// Options pour le select de rôle
const roleOptions = computed(() => [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'USER', label: 'Utilisateur' },
    { value: 'DISABLED', label: 'Désactivé' }
]);

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
    <BaseModal title="Ajouter un utilisateur" size="md" @close="closeModal">
        <form @submit.prevent="submitForm" class="space-y-4">
            <!-- Message d'erreur -->
            <BaseAlert v-if="errorMessage" variant="error" dismissible @dismiss="errorMessage = ''">
                {{ errorMessage }}
            </BaseAlert>

            <!-- Email -->
            <BaseInput
                v-model="formData.email"
                type="email"
                label="Email"
                required
                light-mode
            />

            <!-- Prénom -->
            <BaseInput
                v-model="formData.firstName"
                type="text"
                label="Prénom"
                required
                light-mode
            />

            <!-- Nom -->
            <BaseInput
                v-model="formData.lastName"
                type="text"
                label="Nom"
                required
                light-mode
            />

            <!-- Mot de passe -->
            <BaseInput
                v-model="formData.password"
                type="password"
                label="Mot de passe"
                required
                light-mode
            />

            <!-- Téléphone -->
            <BaseInput
                v-model="formData.phone"
                type="tel"
                label="Téléphone"
                light-mode
            />

            <!-- Entreprise -->
            <BaseInput
                v-model="formData.company"
                type="text"
                label="Entreprise"
                light-mode
            />

            <!-- Rôle -->
            <BaseSelect
                v-model="formData.role"
                :options="roleOptions"
                label="Rôle"
                required
                light-mode
            />
        </form>

        <template #footer>
            <BaseButton variant="secondary" @click="closeModal" :disabled="isSubmitting">
                Annuler
            </BaseButton>
            <BaseButton variant="accent" @click="submitForm" :loading="isSubmitting">
                <template #loading>Création...</template>
                Créer l'utilisateur
            </BaseButton>
        </template>
    </BaseModal>
</template>
