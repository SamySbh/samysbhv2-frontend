<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { useAuthStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { ProfileErrors, PasswordErrors, ValidationErrorsType } from '@/types';

const authStore = useAuthStore();
const { currentUser, loading } = storeToRefs(authStore);

// État pour le mode édition
const isEditing = ref(false);
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

    // Réinitialiser le formulaire
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
  <div class="bg-secondary-ghost rounded-lg shadow p-6">

    <!-- Message de statut après soumission -->
    <div v-if="submitStatus.message" :class="[
      'p-4 mb-4 rounded',
      submitStatus.success
        ? 'bg-green-100 border-l-4 border-green-500 text-green-700'
        : 'bg-red-100 border-l-4 border-red-500 text-red-700'
    ]">
      {{ submitStatus.message }}
    </div>

    <!-- Loader -->
    <div v-if="loading" class="flex justify-center items-center h-48">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
      <p class="text-secondary ml-3">Chargement du profil...</p>
    </div>

    <div v-else-if="currentUser">
      <!-- Mode affichage (non édition) -->
      <div v-if="!isEditing">
        <!-- En-tête du profil -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div class="flex items-center mb-4 md:mb-0">
            <!-- Avatar -->
            <div
              class="bg-accent text-secondary rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold">
              {{ currentUser.firstName.charAt(0) }}{{ currentUser.lastName.charAt(0) }}
            </div>

            <!-- Informations de base -->
            <div class="ml-4">
              <h3 class="text-xl font-semibold text-primary">{{ fullName }}</h3>
              <p class="text-accent">{{ formattedRole }}</p>
              <p class="text-sm text-primary-ghost">{{ currentUser.email }}</p>
            </div>
          </div>

          <!-- Bouton d'édition -->
          <button @click="toggleEditMode"
            class="bg-accent text-secondary px-4 py-2 rounded transition-colors hover:bg-accent-light">
            Modifier mon profil
          </button>
        </div>

        <!-- Détails du profil -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <!-- Informations personnelles -->
          <div class="p-4 rounded-lg shadow-sm border border-accent">
            <h4 class="text-primary text-lg font-medium mb-4 pb-2 border-b border-emphasis">Informations personnelles
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
              <button @click="showPasswordForm = true" class="text-accent hover:text-accent-light">
                Modifier le mot de passe
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mode édition -->
      <div v-else class="p-6 rounded-lg shadow-sm">
        <h3 class="text-xl font-semibold text-primary mb-4 pb-2 border-b border-emphasis">Modifier mon profil</h3>

        <form @submit.prevent="submitProfileForm" class="mt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="space-y-2">
              <label for="firstName" class="text-sm text-primary-ghost">Prénom</label>
              <input type="text" id="firstName" v-model="profileForm.firstName"
                class="w-full p-2 border rounded focus:ring-2 focus:ring-accent focus:outline-none"
                :class="{ 'border-red-500': validationErrors.profile.firstName }">
              <span v-if="validationErrors.profile.firstName" class="text-red-500 text-sm">
                {{ validationErrors.profile.firstName }}
              </span>
            </div>

            <div class="space-y-2">
              <label for="lastName" class="text-sm text-primary-ghost">Nom</label>
              <input type="text" id="lastName" v-model="profileForm.lastName"
                class="w-full p-2 border rounded focus:ring-2 focus:ring-accent focus:outline-none"
                :class="{ 'border-red-500': validationErrors.profile.lastName }">
              <span v-if="validationErrors.profile.lastName" class="text-red-500 text-sm">
                {{ validationErrors.profile.lastName }}
              </span>
            </div>

            <div class="space-y-2">
              <label for="phone" class="text-sm text-primary-ghost">Téléphone</label>
              <input type="tel" id="phone" v-model="profileForm.phone"
                class="w-full p-2 border rounded focus:ring-2 focus:ring-accent focus:outline-none"
                :class="{ 'border-red-500': validationErrors.profile.phone }">
              <span v-if="validationErrors.profile.phone" class="text-red-500 text-sm">
                {{ validationErrors.profile.phone }}
              </span>
            </div>

            <div class="space-y-2">
              <label for="company" class="text-sm text-primary-ghost">Entreprise (facultatif)</label>
              <input type="text" id="company" v-model="profileForm.company"
                class="w-full p-2 border rounded focus:ring-2 focus:ring-accent focus:outline-none">
            </div>
          </div>

          <div class="flex justify-end space-x-4 mt-4">
            <button type="button" @click="cancelEdit"
              class="px-4 py-2 text-sm border border-gray-300 rounded text-primary hover:bg-gray-50">
              Annuler
            </button>
            <button type="submit" class="px-4 py-2 text-sm bg-accent text-secondary rounded hover:bg-accent-light"
              :disabled="loading">
              <span v-if="loading">Enregistrement...</span>
              <span v-else>Enregistrer les modifications</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Modal pour changement de mot de passe -->
      <div v-if="showPasswordForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-secondary rounded-lg shadow-lg max-w-md w-full m-4">
          <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-lg font-semibold text-primary">Modifier mon mot de passe</h3>
            <button @click="showPasswordForm = false" class="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form @submit.prevent="submitPasswordForm" class="p-4">
            <div class="space-y-4">
              <div class="space-y-2">
                <label for="currentPassword" class="text-sm text-primary-ghost">Mot de passe actuel</label>
                <input type="password" id="currentPassword" v-model="passwordForm.currentPassword"
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-accent focus:outline-none"
                  :class="{ 'border-red-500': validationErrors.password.currentPassword }">
                <span v-if="validationErrors.password.currentPassword" class="text-red-500 text-sm">
                  {{ validationErrors.password.currentPassword }}
                </span>
              </div>

              <div class="space-y-2">
                <label for="newPassword" class="text-sm text-primary-ghost">Nouveau mot de passe</label>
                <input type="password" id="newPassword" v-model="passwordForm.newPassword"
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-accent focus:outline-none"
                  :class="{ 'border-red-500': validationErrors.password.newPassword }">
                <span v-if="validationErrors.password.newPassword" class="text-red-500 text-sm">
                  {{ validationErrors.password.newPassword }}
                </span>

                <div class="mt-2 p-3 bg-gray-50 rounded-lg text-sm">
                  <p class="font-medium mb-2 text-primary">Votre mot de passe doit contenir :</p>
                  <ul class="space-y-1 text-primary-ghost">
                    <li :class="{ 'text-green-600': passwordForm.newPassword.length >= 8 }">
                      Au moins 8 caractères
                    </li>
                    <li :class="{ 'text-green-600': /[A-Z]/.test(passwordForm.newPassword) }">
                      Au moins une majuscule
                    </li>
                    <li :class="{ 'text-green-600': /[0-9]/.test(passwordForm.newPassword) }">
                      Au moins un chiffre
                    </li>
                    <li :class="{ 'text-green-600': /[^A-Za-z0-9]/.test(passwordForm.newPassword) }">
                      Au moins un caractère spécial
                    </li>
                  </ul>
                </div>
              </div>

              <div class="space-y-2">
                <label for="confirmNewPassword" class="text-sm text-primary-ghost">Confirmer le nouveau mot de
                  passe</label>
                <input type="password" id="confirmNewPassword" v-model="passwordForm.confirmNewPassword"
                  class="w-full p-2 border rounded focus:ring-2 focus:ring-accent focus:outline-none"
                  :class="{ 'border-red-500': validationErrors.password.confirmNewPassword }">
                <span v-if="validationErrors.password.confirmNewPassword" class="text-red-500 text-sm">
                  {{ validationErrors.password.confirmNewPassword }}
                </span>
              </div>
            </div>

            <div class="flex justify-end space-x-4 mt-6">
              <button type="button" @click="showPasswordForm = false"
                class="px-4 py-2 border border-gray-300 rounded text-primary hover:bg-gray-50">
                Annuler
              </button>
              <button type="submit" class="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent-light"
                :disabled="loading">
                <span v-if="loading">Modification...</span>
                <span v-else>Modifier le mot de passe</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>