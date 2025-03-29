<script setup lang="ts">
import { onMounted } from 'vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import { loginSchema } from '@/schemas';
import { useAuth } from '@/composables/useAuth';
import { LoginCredentials } from '@/types';

// Créer une seule instance du composable
const auth = useAuth();
const { error, loading, checkRedirectParam } = auth;

// Utilisation du schéma importé
const validationSchema = toTypedSchema(loginSchema);

// Initialisation du formulaire avec vee-validate
const { handleSubmit } = useForm<LoginCredentials>({
    validationSchema,
    initialValues: {
        email: '',
        password: ''
    }
});

// Création des champs avec vee-validate
const { value: email, errorMessage: emailError } = useField<string>('email');
const { value: password, errorMessage: passwordError } = useField<string>('password');

// Gérer la connexion avec validation
const handleLogin = handleSubmit(async (values) => {
    try {
        // Utiliser la même instance d'auth créée au début
        auth.credentials.value.email = values.email;
        auth.credentials.value.password = values.password;
        
        // Appelle login qui gère la redirection
        await auth.login();
    } catch (err) {
        console.error('Erreur de connexion:', err);
    }
});

// Vérifier s'il y a un paramètre de redirection au chargement
onMounted(() => {
    checkRedirectParam();
});
</script>

<template>
    <div class="container max-w-md card m-4 space-y-4">
        <!-- Message d'erreur éventuel -->
        <div v-if="error" class="p-4 text-sm text-secondary bg-red-500 rounded">
            {{ error }}
        </div>

        <!-- Formulaire de connexion -->
        <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Champ email -->
            <div>
                <label for="email" class="block text-sm font-medium text-accent">Email</label>
                <input id="email" v-model="email" type="email" required
                    class="w-full px-3 py-2 mt-1 border border-primary-ghost rounded"
                    :class="{ 'border-red-500': emailError }" placeholder="votre@email.com" />
                <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
            </div>

            <!-- Champ mot de passe -->
            <div>
                <label for="password" class="block text-sm font-medium text-accent">Mot de passe</label>
                <input id="password" v-model="password" type="password" required
                    class="w-full px-3 py-2 mt-1 border border-primary-ghost rounded"
                    :class="{ 'border-red-500': passwordError }" placeholder="Votre mot de passe" />
                <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
            </div>

            <!-- Bouton de connexion -->
            <div>
                <button type="submit" class="w-full btn-primary" :disabled="loading">
                    <span v-if="loading">Connexion en cours...</span>
                    <span v-else>Se connecter</span>
                </button>
            </div>

            <!-- Lien vers la page d'inscription -->
            <div class="text-center text-sm">
                <p>
                    Pas encore de compte ?
                    <router-link to="/register" class="font-medium text-accent hover:text-emphasis">
                        S'inscrire
                    </router-link>
                </p>
            </div>
        </form>
    </div>
</template>