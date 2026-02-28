<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { orderApi } from '@/services/api/order.api';
import type { Order } from '@/types/order';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

const route = useRoute();

const loading = ref(true);
const error = ref<string | null>(null);
const order = ref<Order | null>(null);
const orderId = ref<string>('');
const paymentType = ref<'deposit' | 'final'>('deposit');

// Titre selon le type de paiement
const successTitle = computed(() => {
    return paymentType.value === 'deposit'
        ? 'Acompte payé avec succès !'
        : 'Paiement finalisé avec succès !';
});

const successMessage = computed(() => {
    return paymentType.value === 'deposit'
        ? 'Merci pour votre paiement ! Le développement de votre projet va maintenant commencer.'
        : 'Merci pour votre confiance ! Votre projet est maintenant entièrement finalisé.';
});

const nextStepsTitle = computed(() => {
    return paymentType.value === 'deposit' ? 'Prochaines étapes' : 'C\'est terminé !';
});

const amountPaid = computed(() => {
    if (!order.value) return '0,00';
    const amount = paymentType.value === 'deposit'
        ? order.value.depositAmount
        : order.value.totalAmount - order.value.depositAmount;
    return formatPrice(amount);
});

const remainingAmount = computed(() => {
    if (!order.value) return '0,00';
    return formatPrice(order.value.totalAmount - order.value.depositAmount);
});

const currentDate = computed(() => {
    return new Date().toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });
});

function formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
    }).format(price);
}

async function loadOrder() {
    orderId.value = route.params.id as string;

    // Type de paiement depuis le query param
    const typeParam = route.query.type as string;
    if (typeParam === 'deposit' || typeParam === 'final') {
        paymentType.value = typeParam;
    }

    if (!orderId.value) {
        error.value = 'Aucune commande spécifiée';
        loading.value = false;
        return;
    }

    try {
        order.value = await orderApi.getById(orderId.value);

        // Si le type n'est pas en query, le déduire du statut
        if (!typeParam && order.value) {
            if (order.value.statusPayment === 'FULLY_PAID') {
                paymentType.value = 'final';
            } else {
                paymentType.value = 'deposit';
            }
        }
    } catch (err) {
        error.value = 'Impossible de charger les détails de la commande';
    } finally {
        loading.value = false;
    }
}

onMounted(() => {
    loadOrder();
});
</script>

<template>
    <div class="min-h-screen bg-primary py-12 px-4">
        <div class="max-w-2xl mx-auto">

            <!-- Chargement -->
            <div v-if="loading" class="text-center py-16">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                <p class="text-secondary">Vérification du paiement...</p>
            </div>

            <!-- Erreur -->
            <div v-else-if="error" class="bg-secondary-ghost rounded-lg shadow-md p-8 text-center">
                <BaseAlert variant="error" class="mb-6">
                    {{ error }}
                </BaseAlert>
                <router-link v-if="orderId" :to="`/commande/${orderId}`">
                    <BaseButton variant="accent">Retour à ma commande</BaseButton>
                </router-link>
                <router-link v-else to="/">
                    <BaseButton variant="secondary">Retour à l'accueil</BaseButton>
                </router-link>
            </div>

            <!-- Succès -->
            <div v-else class="bg-secondary-ghost rounded-lg shadow-md overflow-hidden">

                <!-- Header succès -->
                <div class="bg-success/10 border-b-4 border-success p-8 text-center">
                    <div class="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg class="w-10 h-10 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 class="text-2xl font-bold text-success mb-2">{{ successTitle }}</h1>
                    <p class="text-primary-ghost">{{ successMessage }}</p>
                </div>

                <div class="p-6 space-y-6">

                    <!-- Infos paiement -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div class="bg-secondary rounded-lg p-4 text-center border border-primary-ghost/20">
                            <div class="text-xs text-primary-ghost uppercase mb-1">Paiement effectué</div>
                            <div class="text-xl font-bold text-primary">{{ amountPaid }}</div>
                        </div>
                        <div class="bg-secondary rounded-lg p-4 text-center border border-primary-ghost/20">
                            <div class="text-xs text-primary-ghost uppercase mb-1">Date</div>
                            <div class="text-xl font-bold text-primary">{{ currentDate }}</div>
                        </div>
                    </div>

                    <!-- Prochaines étapes : acompte -->
                    <div v-if="paymentType === 'deposit'" class="space-y-4">
                        <h2 class="text-lg font-semibold text-primary text-center">{{ nextStepsTitle }}</h2>

                        <div class="space-y-3">
                            <div class="flex gap-3 items-start">
                                <span class="flex-shrink-0 w-8 h-8 bg-success rounded-full flex items-center justify-center text-secondary font-bold text-sm">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                                </span>
                                <div>
                                    <strong class="block text-primary">Paiement confirmé</strong>
                                    <p class="text-sm text-primary-ghost">Votre acompte de {{ amountPaid }} a bien été reçu.</p>
                                </div>
                            </div>

                            <div class="flex gap-3 items-start">
                                <span class="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-secondary font-bold text-sm">2</span>
                                <div>
                                    <strong class="block text-primary">Démarrage du projet</strong>
                                    <p class="text-sm text-primary-ghost">Je vais maintenant commencer le développement de votre projet.</p>
                                </div>
                            </div>

                            <div class="flex gap-3 items-start">
                                <span class="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-secondary font-bold text-sm">3</span>
                                <div>
                                    <strong class="block text-primary">Suivi régulier</strong>
                                    <p class="text-sm text-primary-ghost">Vous recevrez des mises à jour régulières sur l'avancement du projet.</p>
                                </div>
                            </div>

                            <div class="flex gap-3 items-start">
                                <span class="flex-shrink-0 w-8 h-8 bg-warning rounded-full flex items-center justify-center text-secondary font-bold text-sm">4</span>
                                <div>
                                    <strong class="block text-primary">Paiement final</strong>
                                    <p class="text-sm text-primary-ghost">Le solde de {{ remainingAmount }} sera à régler à la livraison.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Prochaines étapes : solde -->
                    <div v-else-if="paymentType === 'final'" class="space-y-4">
                        <h2 class="text-lg font-semibold text-primary text-center">{{ nextStepsTitle }}</h2>

                        <div class="space-y-3">
                            <div class="flex gap-3 items-start">
                                <span class="flex-shrink-0 w-8 h-8 bg-success rounded-full flex items-center justify-center text-secondary font-bold text-sm">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                                </span>
                                <div>
                                    <strong class="block text-primary">Paiement final confirmé</strong>
                                    <p class="text-sm text-primary-ghost">Votre paiement de {{ amountPaid }} a bien été reçu.</p>
                                </div>
                            </div>

                            <div class="flex gap-3 items-start">
                                <span class="flex-shrink-0 w-8 h-8 bg-success rounded-full flex items-center justify-center text-secondary font-bold text-sm">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
                                </span>
                                <div>
                                    <strong class="block text-primary">Projet finalisé</strong>
                                    <p class="text-sm text-primary-ghost">Votre projet est maintenant entièrement payé et prêt à être livré.</p>
                                </div>
                            </div>

                            <div class="flex gap-3 items-start">
                                <span class="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-secondary font-bold text-sm">3</span>
                                <div>
                                    <strong class="block text-primary">Livraison</strong>
                                    <p class="text-sm text-primary-ghost">Vous allez recevoir tous les accès et fichiers par email sous peu.</p>
                                </div>
                            </div>

                            <div class="flex gap-3 items-start">
                                <span class="flex-shrink-0 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-secondary font-bold text-sm">4</span>
                                <div>
                                    <strong class="block text-primary">Support</strong>
                                    <p class="text-sm text-primary-ghost">Je reste disponible pour toute question ou assistance.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Notice email -->
                    <BaseAlert variant="info">
                        <strong>Email de confirmation envoyé</strong> — Un récapitulatif de votre paiement a été envoyé à votre adresse email.
                    </BaseAlert>

                    <!-- Actions -->
                    <div class="flex flex-col sm:flex-row gap-3">
                        <router-link :to="`/commande/${orderId}`" class="flex-1">
                            <BaseButton variant="accent" full-width>
                                Voir ma commande
                            </BaseButton>
                        </router-link>
                        <router-link to="/" class="flex-1">
                            <BaseButton variant="secondary" full-width>
                                Retour à l'accueil
                            </BaseButton>
                        </router-link>
                    </div>

                    <!-- Aide -->
                    <p class="text-center text-sm text-primary-ghost pt-4 border-t border-primary-ghost/20">
                        Une question ? Contactez-moi à
                        <a href="mailto:contact@samysbh.fr" class="text-accent hover:underline">contact@samysbh.fr</a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
