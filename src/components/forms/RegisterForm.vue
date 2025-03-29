<script setup lang="ts">
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import { registerSchema } from '@/schemas'; // Vous devrez créer ce schéma
import { useAuth } from '@/composables/useAuth';
import { RegisterData } from '@/types';

const { error, success, loading } = useAuth();

// Utilisation du schéma importé
const validationSchema = toTypedSchema(registerSchema);

// Initialisation du formulaire avec vee-validate
const { handleSubmit } = useForm<RegisterData>({
    validationSchema,
    initialValues: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        password: ''
    }
});

// Création des champs avec vee-validate
const { value: firstName, errorMessage: firstNameError } = useField<string>('firstName');
const { value: lastName, errorMessage: lastNameError } = useField<string>('lastName');
const { value: email, errorMessage: emailError } = useField<string>('email');
const { value: phone, errorMessage: phoneError } = useField<string>('phone');
const { value: company } = useField<string>('company');
const { value: password, errorMessage: passwordError } = useField<string>('password');

// Gérer l'inscription avec validation
const handleRegister = handleSubmit(async (values) => {
    try {
        // Utiliser les valeurs du formulaire
        const authService = useAuth();
        // Mettre à jour les données utilisateur avec les valeurs validées
        authService.userData.value = values;
        await authService.register();
    } catch (err) {
        // Les erreurs sont déjà gérées dans le composable useAuth
    }
});
</script>

<template>
    <div class="container max-w-3xl card">
        <!-- Messages d'état -->
        <div v-if="error" class="p-3 text-sm text-secondary bg-red-500 rounded mb-4">
            {{ error }}
        </div>
        <div v-if="success" class="p-3 text-sm text-white bg-green-500 rounded mb-4">
            {{ success }}
        </div>

        <!-- Formulaire d'inscription -->
        <form @submit.prevent="handleRegister" class="space-y-4">
            <!-- Mise en page à deux colonnes -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <!-- Prénom -->
                <div>
                    <label for="firstName" class="block text-sm font-medium text-accent">Prénom</label>
                    <input id="firstName" v-model="firstName" type="text" required
                        class="w-full px-3 py-2 mt-1 border border-primary-ghost rounded"
                        :class="{ 'border-red-500': firstNameError }" placeholder="Votre prénom" />
                    <p v-if="firstNameError" class="mt-1 text-sm text-red-600">{{ firstNameError }}</p>
                </div>

                <!-- Nom -->
                <div>
                    <label for="lastName" class="block text-sm font-medium text-accent">Nom</label>
                    <input id="lastName" v-model="lastName" type="text" required
                        class="w-full px-3 py-2 mt-1 border border-primary-ghost rounded"
                        :class="{ 'border-red-500': lastNameError }" placeholder="Votre nom" />
                    <p v-if="lastNameError" class="mt-1 text-sm text-red-600">{{ lastNameError }}</p>
                </div>

                <!-- Email -->
                <div>
                    <label for="email" class="block text-sm font-medium text-accent">Email</label>
                    <input id="email" v-model="email" type="email" required
                        class="w-full px-3 py-2 mt-1 border border-primary-ghost rounded"
                        :class="{ 'border-red-500': emailError }" placeholder="votre@email.com" />
                    <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
                </div>

                <!-- Téléphone -->
                <div>
                    <label for="phone" class="block text-sm font-medium text-accent">Téléphone</label>
                    <input id="phone" v-model="phone" type="tel" required
                        class="w-full px-3 py-2 mt-1 border border-primary-ghost rounded"
                        :class="{ 'border-red-500': phoneError }" placeholder="Votre téléphone" />
                    <p v-if="phoneError" class="mt-1 text-sm text-red-600">{{ phoneError }}</p>
                </div>

                <!-- Entreprise -->
                <div>
                    <label for="company" class="block text-sm font-medium text-accent">
                        Entreprise <span class="text-primary-ghost text-xs">(optionnel)</span>
                    </label>
                    <input id="company" v-model="company" type="text"
                        class="w-full px-3 py-2 mt-1 border border-primary-ghost rounded"
                        placeholder="Nom de l'entreprise" />
                </div>

                <!-- Mot de passe -->
                <div>
                    <label for="password" class="block text-sm font-medium text-accent">Mot de passe</label>
                    <input id="password" v-model="password" type="password" required
                        class="w-full px-3 py-2 mt-1 border border-primary-ghost rounded"
                        :class="{ 'border-red-500': passwordError }" placeholder="Créez un mot de passe" />
                    <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
                </div>
            </div>

            <!-- Explication sur le mot de passe -->
            <p class="text-xs text-primary-ghost">
                Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère
                spécial.
            </p>

            <!-- Bouton d'inscription -->
            <div class="mt-6">
                <button type="submit" class="w-full btn-primary" :disabled="loading">
                    <span v-if="loading">Inscription en cours...</span>
                    <span v-else>S'inscrire</span>
                </button>
            </div>

            <!-- Lien vers la page de connexion -->
            <div class="text-center text-sm mt-4">
                <p>
                    Déjà un compte ?
                    <router-link to="/login" class="font-medium text-accent hover:text-emphasis">
                        Se connecter
                    </router-link>
                </p>
            </div>
        </form>
    </div>
</template>