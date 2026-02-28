<script setup lang="ts">
import { onMounted } from 'vue';
import { useForm, useField } from 'vee-validate';
import { toTypedSchema } from '@vee-validate/yup';
import { loginSchema } from '@/schemas';
import { useAuth } from '@/composables/useAuth';
import { LoginCredentials } from '@/types';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

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
        <BaseAlert v-if="error" variant="error">
            {{ error }}
        </BaseAlert>

        <!-- Formulaire de connexion -->
        <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Champ email -->
            <BaseInput
                v-model="email"
                type="email"
                label="Email"
                placeholder="votre@email.com"
                required
                :error="emailError"
            />

            <!-- Champ mot de passe -->
            <BaseInput
                v-model="password"
                type="password"
                label="Mot de passe"
                placeholder="Votre mot de passe"
                required
                :error="passwordError"
            />

            <!-- Bouton de connexion -->
            <div>
                <BaseButton type="submit" variant="primary" full-width :loading="loading">
                    <template #loading>Connexion en cours...</template>
                    Se connecter
                </BaseButton>
            </div>

            <!-- Lien vers la page d'inscription -->
            <div class="text-center text-sm">
                <p>
                    Pas encore de compte ?
                    <router-link to="/register" class="font-medium text-accent hover:text-emphasis transition-colors">
                        S'inscrire
                    </router-link>
                </p>
            </div>
        </form>
    </div>
</template>