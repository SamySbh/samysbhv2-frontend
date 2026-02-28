<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

const route = useRoute();
const orderId = ref<string>('');

onMounted(() => {
    orderId.value = route.params.id as string;
});
</script>

<template>
    <div class="min-h-screen bg-primary py-12 px-4">
        <div class="max-w-2xl mx-auto">
            <div class="bg-secondary-ghost rounded-lg shadow-md overflow-hidden">

                <!-- Header annulation -->
                <div class="bg-warning/10 border-b-4 border-warning p-8 text-center">
                    <div class="w-20 h-20 bg-warning rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-10 h-10 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h1 class="text-2xl font-bold text-warning mb-2">Paiement annulé</h1>
                    <p class="text-primary-ghost">
                        Vous avez annulé le processus de paiement. Aucun montant n'a été débité.
                    </p>
                </div>

                <div class="p-6 space-y-6">

                    <!-- Explication -->
                    <BaseAlert variant="warning">
                        <div>
                            <strong class="block mb-2">Que s'est-il passé ?</strong>
                            <p class="text-sm mb-2">Le paiement n'a pas été finalisé. Cela peut arriver si vous avez :</p>
                            <ul class="text-sm list-disc pl-5 space-y-1">
                                <li>Cliqué sur le bouton "Retour" de votre navigateur</li>
                                <li>Fermé la fenêtre de paiement</li>
                                <li>Annulé volontairement la transaction</li>
                            </ul>
                        </div>
                    </BaseAlert>

                    <!-- Options -->
                    <div class="space-y-4">
                        <h2 class="text-lg font-semibold text-primary text-center">Que faire maintenant ?</h2>

                        <!-- Réessayer -->
                        <div class="flex gap-4 items-start bg-secondary rounded-lg p-4 border border-primary-ghost/20">
                            <span class="flex-shrink-0 w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center text-xl">
                                <svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </span>
                            <div class="flex-1">
                                <strong class="block text-primary mb-1">Réessayer le paiement</strong>
                                <p class="text-sm text-primary-ghost mb-3">Vous pouvez retourner à votre commande et relancer le paiement.</p>
                                <router-link v-if="orderId" :to="`/commande/${orderId}`">
                                    <BaseButton variant="accent" size="sm">
                                        Retour à ma commande
                                    </BaseButton>
                                </router-link>
                            </div>
                        </div>

                        <!-- Contacter -->
                        <div class="flex gap-4 items-start bg-secondary rounded-lg p-4 border border-primary-ghost/20">
                            <span class="flex-shrink-0 w-10 h-10 bg-info/10 rounded-full flex items-center justify-center text-xl">
                                <svg class="w-5 h-5 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </span>
                            <div class="flex-1">
                                <strong class="block text-primary mb-1">Besoin d'aide ?</strong>
                                <p class="text-sm text-primary-ghost mb-3">Si vous rencontrez des difficultés, n'hésitez pas à me contacter.</p>
                                <a href="mailto:contact@samysbh.fr">
                                    <BaseButton variant="secondary" size="sm">
                                        Me contacter
                                    </BaseButton>
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Rassurance -->
                    <BaseAlert variant="success">
                        <strong>Bon à savoir :</strong> Aucun frais n'a été prélevé sur votre compte. Vous pouvez relancer le paiement à tout moment.
                    </BaseAlert>

                    <!-- Liens secondaires -->
                    <div class="flex justify-center gap-6 pt-4 border-t border-primary-ghost/20">
                        <router-link to="/" class="text-accent hover:underline text-sm">
                            Retour à l'accueil
                        </router-link>
                        <router-link to="/services" class="text-accent hover:underline text-sm">
                            Voir nos services
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
