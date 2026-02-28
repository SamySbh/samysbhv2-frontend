<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useAuthStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { ProfileErrors, PasswordErrors, ValidationErrorsType } from '@/types';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

const authStore = useAuthStore();
const { currentUser, loading } = storeToRefs(authStore);

// État pour le mode édition
const isEditing = ref(false);
const isDeleting = ref(false);
const showPasswordForm = ref(false);
const submitStatus = ref({ success: false, message: '' });

// Formulaire réactif pour les informations de profil
const profileForm = reactive({
    firstName: '',
    lastName: '',
    phone: '',
    company: ''
});

// Formulaire réactif pour le changement de mot de passe
const passwordForm = reactive({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
});

// Erreurs de validation
const validationErrors = reactive<ValidationErrorsType>({
    profile: {},
    password: {}
});

// Précharger le formulaire avec les données utilisateur actuelles
const initProfileForm = () => {
    if (currentUser.value) {
        profileForm.firstName = currentUser.value.firstName;
        profileForm.lastName = currentUser.value.lastName;
        profileForm.phone = currentUser.value.phone || '';
        profileForm.company = currentUser.value.company || '';
    }
};

// Activer le mode édition
const toggleEditMode = () => {
    isEditing.value = !isEditing.value;
    if (isEditing.value) {
        initProfileForm();
    }
};

// Activer la suppression
const toggleDeleteAccount = () => {
    isDeleting.value = !isDeleting.value;
};

// Réinitialiser le formulaire
const cancelEdit = () => {
    isEditing.value = false;
    showPasswordForm.value = false;
    submitStatus.value = { success: false, message: '' };
    validationErrors.profile = {};
};

// Valider le formulaire de profil
const validateProfileForm = () => {
    const errors: ProfileErrors = {};

    if (!profileForm.firstName.trim()) {
        errors.firstName = 'Le prénom est requis';
    } else if (profileForm.firstName.length < 2) {
        errors.firstName = 'Le prénom doit contenir au moins 2 caractères';
    }

    if (!profileForm.lastName.trim()) {
        errors.lastName = 'Le nom est requis';
    } else if (profileForm.lastName.length < 2) {
        errors.lastName = 'Le nom doit contenir au moins 2 caractères';
    }

    if (profileForm.phone) {
        const phoneRegex = /^\+?[0-9]{10,15}$/;
        if (!phoneRegex.test(profileForm.phone)) {
            errors.phone = 'Le format du numéro de téléphone est invalide';
        }
    }

    validationErrors.profile = errors;
    return Object.keys(errors).length === 0;
};

// Valider le formulaire de mot de passe
const validatePasswordForm = () => {
    const errors: PasswordErrors = {};

    if (!passwordForm.currentPassword) {
        errors.currentPassword = 'Le mot de passe actuel est requis';
    }

    if (!passwordForm.newPassword) {
        errors.newPassword = 'Le nouveau mot de passe est requis';
    } else if (passwordForm.newPassword.length < 8) {
        errors.newPassword = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/[A-Z]/.test(passwordForm.newPassword)) {
        errors.newPassword = 'Le mot de passe doit contenir au moins une majuscule';
    } else if (!/[0-9]/.test(passwordForm.newPassword)) {
        errors.newPassword = 'Le mot de passe doit contenir au moins un chiffre';
    } else if (!/[^A-Za-z0-9]/.test(passwordForm.newPassword)) {
        errors.newPassword = 'Le mot de passe doit contenir au moins un caractère spécial';
    }

    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
        errors.confirmNewPassword = 'Les mots de passe ne correspondent pas';
    }

    validationErrors.password = errors;
    return Object.keys(errors).length === 0;
};

// Soumettre le formulaire de profil
const submitProfileForm = async () => {
    if (!validateProfileForm()) return;

    try {
        submitStatus.value = { success: false, message: '' };

        await authStore.updateProfile({
            firstName: profileForm.firstName,
            lastName: profileForm.lastName,
            phone: profileForm.phone,
            company: profileForm.company || undefined
        });

        submitStatus.value = {
            success: true,
            message: 'Vos informations ont été mises à jour avec succès'
        };

        isEditing.value = false;
    } catch (err: any) {
        submitStatus.value = {
            success: false,
            message: `Erreur lors de la mise à jour : ${err.message}`
        };
    }
};

// Soumettre le formulaire de mot de passe
const submitPasswordForm = async () => {
    if (!validatePasswordForm()) return;

    try {
        submitStatus.value = { success: false, message: '' };

        await authStore.updateProfile({
            currentPassword: passwordForm.currentPassword,
            newPassword: passwordForm.newPassword
        });

        submitStatus.value = {
            success: true,
            message: 'Votre mot de passe a été mis à jour avec succès'
        };

    } catch (err: any) {
        submitStatus.value = {
            success: false,
            message: `Erreur lors de la mise à jour du mot de passe : ${err.message}`
        };
    } finally {
        passwordForm.currentPassword = '';
        passwordForm.newPassword = '';
        passwordForm.confirmNewPassword = '';
        showPasswordForm.value = false;
    }
};

// Formater le nom complet
const fullName = computed(() => {
    if (!currentUser.value) return '';
    return `${currentUser.value.firstName} ${currentUser.value.lastName}`;
});

// Formater le rôle
const formattedRole = computed(() => {
    if (!currentUser.value) return '';

    const roles: Record<string, string> = {
        'ADMIN': 'Administrateur',
        'USER': 'Utilisateur',
        'DISABLED': 'Compte désactivé'
    };

    return roles[currentUser.value.role] || currentUser.value.role;
});
</script>

<template>
    <!-- Zone de suppression de compte -->
    <div v-if="isDeleting" class="bg-secondary-ghost rounded-lg flex flex-col px-8 py-4">
        <div class="px-8 py-4 border border-error rounded-md space-y-2">
            <p class="text-primary">Vous êtes sur le point de supprimer définitivement votre compte. Cette action ne peut pas être annulée.</p>
            <p class="text-primary">La suppression de votre compte entraînera :</p>
            <ul class="list-disc ml-6 text-primary-ghost">
                <li>La perte de toutes vos données personnelles</li>
                <li>La résiliation immédiate de tout abonnement actif</li>
                <li>La suppression de votre historique et de vos préférences</li>
            </ul>
            <p class="text-primary">Vos factures resteront accessibles conformément à nos obligations légales.</p>
            <div class="flex gap-2 justify-end">
                <BaseButton variant="secondary" @click="toggleDeleteAccount">Annuler</BaseButton>
                <BaseButton variant="danger">Confirmer la suppression</BaseButton>
            </div>
        </div>
    </div>

    <!-- Section principale du profil -->
    <div v-if="!isDeleting" class="bg-secondary-ghost rounded-lg shadow p-6">
        <!-- Message de statut après soumission -->
        <BaseAlert
            v-if="submitStatus.message"
            :variant="submitStatus.success ? 'success' : 'error'"
            dismissible
            @dismiss="submitStatus.message = ''"
            class="mb-4"
        >
            {{ submitStatus.message }}
        </BaseAlert>

        <!-- Loader -->
        <div v-if="loading" class="flex justify-center items-center h-48">
            <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
            <p class="text-primary-ghost ml-3">Chargement du profil...</p>
        </div>

        <div v-else-if="currentUser">
            <!-- Mode affichage (non édition) -->
            <div v-if="!isEditing">
                <!-- En-tête du profil -->
                <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
                    <div class="flex items-center mb-4 md:mb-0">
                        <!-- Avatar -->
                        <div class="bg-accent text-secondary rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold">
                            {{ currentUser.firstName.charAt(0) }}{{ currentUser.lastName.charAt(0) }}
                        </div>

                        <!-- Informations de base -->
                        <div class="ml-4">
                            <h3 class="text-xl font-semibold text-primary">{{ fullName }}</h3>
                            <p class="text-accent">{{ formattedRole }}</p>
                            <p class="text-sm text-primary-ghost">{{ currentUser.email }}</p>
                        </div>
                    </div>

                    <!-- Boutons d'action -->
                    <div class="flex gap-2">
                        <BaseButton variant="accent" @click="toggleEditMode">
                            Modifier mon profil
                        </BaseButton>
                        <BaseButton variant="danger" size="sm" @click="toggleDeleteAccount">
                            Supprimer mon compte
                        </BaseButton>
                    </div>
                </div>

                <!-- Détails du profil -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <!-- Informations personnelles -->
                    <div class="p-4 rounded-lg shadow-sm border border-accent">
                        <h4 class="text-primary text-lg font-medium mb-4 pb-2 border-b border-emphasis">
                            Informations personnelles
                        </h4>

                        <div class="space-y-3">
                            <div class="grid grid-cols-2 gap-4">
                                <span class="text-xs text-primary-ghost uppercase">Prénom</span>
                                <span class="font-medium text-primary">{{ currentUser.firstName }}</span>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <span class="text-xs text-primary-ghost uppercase">Nom</span>
                                <span class="font-medium text-primary">{{ currentUser.lastName }}</span>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <span class="text-xs text-primary-ghost uppercase">Téléphone</span>
                                <span class="font-medium text-primary">{{ currentUser.phone || 'Non renseigné' }}</span>
                            </div>

                            <div class="grid grid-cols-2 gap-4">
                                <span class="text-xs text-primary-ghost uppercase">Entreprise</span>
                                <span class="font-medium text-primary">{{ currentUser.company || 'Non renseignée' }}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Sécurité -->
                    <div class="p-4 rounded-lg shadow-sm border border-accent">
                        <h4 class="text-primary text-lg font-medium mb-4 pb-2 border-b border-emphasis">Sécurité</h4>

                        <div class="flex justify-between items-center">
                            <div>
                                <span class="text-xs text-primary-ghost uppercase block">Mot de passe</span>
                                <span class="font-medium text-primary">••••••••</span>
                            </div>
                            <BaseButton variant="ghost" @click="showPasswordForm = true">
                                Modifier le mot de passe
                            </BaseButton>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Mode édition -->
            <div v-else class="p-6 rounded-lg shadow-sm">
                <h3 class="text-xl font-semibold text-primary mb-4 pb-2 border-b border-emphasis">Modifier mon profil</h3>

                <form @submit.prevent="submitProfileForm" class="mt-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <BaseInput
                            v-model="profileForm.firstName"
                            label="Prénom"
                            :error="validationErrors.profile.firstName"
                            light-mode
                        />

                        <BaseInput
                            v-model="profileForm.lastName"
                            label="Nom"
                            :error="validationErrors.profile.lastName"
                            light-mode
                        />

                        <BaseInput
                            v-model="profileForm.phone"
                            type="tel"
                            label="Téléphone"
                            :error="validationErrors.profile.phone"
                            light-mode
                        />

                        <BaseInput
                            v-model="profileForm.company"
                            label="Entreprise (facultatif)"
                            light-mode
                        />
                    </div>

                    <div class="flex justify-end space-x-4 mt-4">
                        <BaseButton variant="secondary" type="button" @click="cancelEdit">
                            Annuler
                        </BaseButton>
                        <BaseButton variant="accent" type="submit" :loading="loading">
                            <template #loading>Enregistrement...</template>
                            Enregistrer les modifications
                        </BaseButton>
                    </div>
                </form>
            </div>

            <!-- Modal pour changement de mot de passe -->
            <BaseModal v-if="showPasswordForm" title="Modifier mon mot de passe" @close="showPasswordForm = false">
                <form @submit.prevent="submitPasswordForm" class="space-y-4">
                    <BaseInput
                        v-model="passwordForm.currentPassword"
                        type="password"
                        label="Mot de passe actuel"
                        :error="validationErrors.password.currentPassword"
                        light-mode
                    />

                    <div>
                        <BaseInput
                            v-model="passwordForm.newPassword"
                            type="password"
                            label="Nouveau mot de passe"
                            :error="validationErrors.password.newPassword"
                            light-mode
                        />

                        <div class="mt-2 p-3 bg-secondary-ghost rounded-lg text-sm">
                            <p class="font-medium mb-2 text-primary">Votre mot de passe doit contenir :</p>
                            <ul class="space-y-1 text-primary-ghost">
                                <li :class="{ 'text-success': passwordForm.newPassword.length >= 8 }">
                                    Au moins 8 caractères
                                </li>
                                <li :class="{ 'text-success': /[A-Z]/.test(passwordForm.newPassword) }">
                                    Au moins une majuscule
                                </li>
                                <li :class="{ 'text-success': /[0-9]/.test(passwordForm.newPassword) }">
                                    Au moins un chiffre
                                </li>
                                <li :class="{ 'text-success': /[^A-Za-z0-9]/.test(passwordForm.newPassword) }">
                                    Au moins un caractère spécial
                                </li>
                            </ul>
                        </div>
                    </div>

                    <BaseInput
                        v-model="passwordForm.confirmNewPassword"
                        type="password"
                        label="Confirmer le nouveau mot de passe"
                        :error="validationErrors.password.confirmNewPassword"
                        light-mode
                    />
                </form>

                <template #footer>
                    <BaseButton variant="secondary" @click="showPasswordForm = false">
                        Annuler
                    </BaseButton>
                    <BaseButton variant="accent" @click="submitPasswordForm" :loading="loading">
                        <template #loading>Modification...</template>
                        Modifier le mot de passe
                    </BaseButton>
                </template>
            </BaseModal>
        </div>
    </div>
</template>
