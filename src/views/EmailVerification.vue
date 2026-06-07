<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';

const route = useRoute();
const authStore = useAuthStore();

const apiUrl = import.meta.env.VITE_API_URL;
const resendLoading = ref(false);
const resendDone = ref(false);

const state = computed(() => {
  if (route.query.token) return 'success';
  if (route.query.error === 'expired') return 'expired';
  return 'failed';
});

// Si le backend renvoie un token après vérification, on connecte l'utilisateur
if (route.query.token) {
  const token = route.query.token as string;
  localStorage.setItem('accessToken', token);
  authStore.checkAuth().catch(() => {});
}

const resendVerification = async () => {
  const email = authStore.currentUser?.email;
  if (!email) return;
  resendLoading.value = true;
  try {
    await fetch(`${apiUrl}/auth/send-verification-mail`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    resendDone.value = true;
  } catch {
    // silencieux
  } finally {
    resendLoading.value = false;
  }
};
</script>

<template>
  <div class="container max-w-md card m-4 space-y-4 text-center">

    <div v-if="state === 'success'" class="space-y-4">
      <div class="text-4xl">✓</div>
      <h1 class="text-xl font-semibold">Email vérifié !</h1>
      <p class="text-sm">Votre email a bien été vérifié. Vous pouvez maintenant accéder à votre compte.</p>
      <router-link to="/login" class="inline-block font-medium text-accent hover:text-emphasis transition-colors">
        Se connecter
      </router-link>
    </div>

    <div v-else-if="state === 'expired'" class="space-y-4">
      <h1 class="text-xl font-semibold">Lien expiré</h1>
      <p class="text-sm">
        Le lien de vérification a expiré. Cliquez ci-dessous pour recevoir un nouveau lien.
      </p>
      <div v-if="resendDone" class="text-sm">
        Un nouveau lien vous a été envoyé.
      </div>
      <button
        v-else
        class="font-medium text-accent hover:text-emphasis transition-colors text-sm"
        :disabled="resendLoading"
        @click="resendVerification"
      >
        {{ resendLoading ? 'Envoi en cours...' : 'Renvoyer un email de vérification' }}
      </button>
    </div>

    <div v-else class="space-y-4">
      <h1 class="text-xl font-semibold">Erreur de vérification</h1>
      <p class="text-sm">
        Une erreur est survenue lors de la vérification de votre email. Le lien est peut-être invalide.
      </p>
      <router-link to="/login" class="inline-block font-medium text-accent hover:text-emphasis transition-colors">
        Retour à la connexion
      </router-link>
    </div>

  </div>
</template>
