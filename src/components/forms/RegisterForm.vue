<script setup lang="ts">
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import { registerSchema } from '@/schemas';
import { useAuth } from '@/composables/useAuth';
import { RegisterData } from '@/types';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

const { error, success, loading, userData, register } = useAuth();

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
        userData.value = values;
        await register();
    } catch (err) {
        // Les erreurs sont déjà gérées dans le composable useAuth
    }
});
</script>

<template>
    <div class="container max-w-3xl card">
        <!-- Messages d'état -->
        <BaseAlert v-if="error" variant="error" class="mb-4">
            {{ error }}
        </BaseAlert>
        <BaseAlert v-if="success" variant="success" class="mb-4">
            {{ success }}
        </BaseAlert>

        <!-- Formulaire d'inscription -->
        <form @submit.prevent="handleRegister" class="space-y-4">
            <!-- Mise en page à deux colonnes -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <!-- Prénom -->
                <BaseInput
                    v-model="firstName"
                    label="Prénom"
                    placeholder="Votre prénom"
                    required
                    :error="firstNameError"
                />

                <!-- Nom -->
                <BaseInput
                    v-model="lastName"
                    label="Nom"
                    placeholder="Votre nom"
                    required
                    :error="lastNameError"
                />

                <!-- Email -->
                <BaseInput
                    v-model="email"
                    type="email"
                    label="Email"
                    placeholder="votre@email.com"
                    required
                    :error="emailError"
                />

                <!-- Téléphone -->
                <BaseInput
                    v-model="phone"
                    type="tel"
                    label="Téléphone"
                    placeholder="Votre téléphone"
                    required
                    :error="phoneError"
                />

                <!-- Entreprise -->
                <BaseInput
                    v-model="company"
                    label="Entreprise"
                    placeholder="Nom de l'entreprise"
                    hint="Optionnel"
                />

                <!-- Mot de passe -->
                <BaseInput
                    v-model="password"
                    type="password"
                    label="Mot de passe"
                    placeholder="Créez un mot de passe"
                    required
                    :error="passwordError"
                    hint="Min. 8 caractères, une majuscule, un chiffre et un caractère spécial."
                />
            </div>

            <!-- Bouton d'inscription -->
            <div class="mt-6">
                <BaseButton type="submit" variant="primary" full-width :loading="loading">
                    <template #loading>Inscription en cours...</template>
                    S'inscrire
                </BaseButton>
            </div>

            <!-- Lien vers la page de connexion -->
            <div class="text-center text-sm mt-4">
                <p>
                    Déjà un compte ?
                    <router-link to="/login" class="font-medium text-accent hover:text-emphasis transition-colors">
                        Se connecter
                    </router-link>
                </p>
            </div>
        </form>
    </div>
</template>