<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/stores/user.store';
import { User } from '@/types/user';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

// Props
const props = defineProps<{
    user: User;
}>();

// Store utilisateur
const userStore = useUserStore();

// Définir les émetteurs d'événements
const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'userUpdated'): void;
}>();

// État local du formulaire
const formData = ref({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    company: '',
    role: '' as 'ADMIN' | 'USER' | 'DISABLED'
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

// Initialiser le formulaire avec les données de l'utilisateur
onMounted(() => {
    formData.value = {
        email: props.user.email,
        firstName: props.user.firstName,
        lastName: props.user.lastName,
        phone: props.user.phone,
        company: props.user.company || '',
        role: props.user.role
    };
});

// Soumettre le formulaire
const submitForm = async () => {
    isSubmitting.value = true;
    errorMessage.value = '';

    try {
        // S'assurer que l'ID existe
        if (!props.user.id) {
            throw new Error('ID utilisateur manquant');
        }

        await userStore.updateUser(props.user.id, formData.value);
        emit('userUpdated');
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
    <BaseModal title="Modifier l'utilisateur" size="md" @close="closeModal">
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
                <template #loading>Enregistrement...</template>
                Enregistrer les modifications
            </BaseButton>
        </template>
    </BaseModal>
</template>
