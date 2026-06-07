<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const apiUrl = import.meta.env.VITE_API_URL;
const route = useRoute();
const router = useRouter();

const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');
const tokenExpired = ref(false);

const handleSubmit = async () => {
  error.value = '';

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Les mots de passe ne correspondent pas.';
    return;
  }

  const token = route.query.token as string;
  if (!token) {
    error.value = 'Token manquant. Veuillez utiliser le lien reçu par email.';
    return;
  }

  loading.value = true;
  try {
    const response = await fetch(`${apiUrl}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: newPassword.value })
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 400 && data.message?.includes('expiré')) {
        tokenExpired.value = true;
      } else {
        error.value = data.message || 'Une erreur est survenue.';
      }
      return;
    }

    router.push({ path: '/login', query: { message: 'Mot de passe modifié avec succès' } });
  } catch {
    error.value = 'Impossible de contacter le serveur. Réessayez plus tard.';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container max-w-md card m-4 space-y-4">
    <h1 class="text-xl font-semibold">Réinitialisation du mot de passe</h1>

    <div v-if="tokenExpired" class="space-y-4">
      <p class="text-sm text-error">
        Le lien de réinitialisation a expiré. Veuillez en demander un nouveau.
      </p>
      <router-link to="/forgot-password" class="text-sm font-medium text-accent hover:text-emphasis transition-colors">
        Demander un nouveau lien
      </router-link>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <p v-if="error" class="text-sm text-error">{{ error }}</p>

      <BaseInput
        v-model="newPassword"
        type="password"
        label="Nouveau mot de passe"
        placeholder="Votre nouveau mot de passe"
        required
      />

      <BaseInput
        v-model="confirmPassword"
        type="password"
        label="Confirmer le mot de passe"
        placeholder="Confirmez votre mot de passe"
        required
      />

      <BaseButton type="submit" variant="primary" full-width :loading="loading">
        <template #loading>Modification en cours...</template>
        Modifier le mot de passe
      </BaseButton>
    </form>
  </div>
</template>
