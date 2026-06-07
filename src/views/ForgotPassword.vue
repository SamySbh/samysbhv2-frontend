<script setup lang="ts">
import { ref } from 'vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const apiUrl = import.meta.env.VITE_API_URL;

const email = ref('');
const loading = ref(false);
const submitted = ref(false);

const handleSubmit = async () => {
  if (!email.value) return;
  loading.value = true;
  try {
    await fetch(`${apiUrl}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    });
  } catch {
    // réponse silencieuse pour ne pas révéler si l'email existe
  } finally {
    loading.value = false;
    submitted.value = true;
  }
};
</script>

<template>
  <div class="container max-w-md card m-4 space-y-4">
    <h1 class="text-xl font-semibold">Mot de passe oublié</h1>

    <div v-if="submitted" class="text-center space-y-4">
      <p class="text-sm">
        Si cet email est associé à un compte, vous recevrez un lien de réinitialisation sous peu.
      </p>
      <router-link to="/login" class="text-sm font-medium text-accent hover:text-emphasis transition-colors">
        Retour à la connexion
      </router-link>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="space-y-4">
      <p class="text-sm">
        Saisissez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
      </p>

      <BaseInput
        v-model="email"
        type="email"
        label="Email"
        placeholder="votre@email.com"
        required
      />

      <BaseButton type="submit" variant="primary" full-width :loading="loading">
        <template #loading>Envoi en cours...</template>
        Envoyer le lien
      </BaseButton>

      <div class="text-center text-sm">
        <router-link to="/login" class="font-medium text-accent hover:text-emphasis transition-colors">
          Retour à la connexion
        </router-link>
      </div>
    </form>
  </div>
</template>
