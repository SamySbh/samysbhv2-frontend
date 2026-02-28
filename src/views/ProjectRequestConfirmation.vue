<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { projectRequestApi } from '@/services/api/projectRequest.api';
import type { ProjectRequest } from '@/types/projectRequest';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

const route = useRoute();

const request = ref<ProjectRequest | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

// Formatage du prix
function formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

// Formater la date
function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// Charger les détails de la demande
onMounted(async () => {
    const id = route.params.id as string;

    if (!id) {
        error.value = 'Aucun identifiant de demande fourni';
        loading.value = false;
        return;
    }

    try {
        request.value = await projectRequestApi.getById(id);
    } catch (err) {
        error.value = err instanceof Error
            ? err.message
            : 'Impossible de charger les détails de votre demande';
    } finally {
        loading.value = false;
    }
});
</script>

<template>
    <div class="container mx-auto py-8 px-4">
        <div class="max-w-2xl mx-auto">
            <!-- État de chargement -->
            <div v-if="loading" class="text-center py-12">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
                <p class="text-primary-ghost">Chargement...</p>
            </div>

            <!-- Erreur de chargement -->
            <div v-else-if="error" class="text-center py-12">
                <BaseAlert variant="error" class="mb-6">
                    {{ error }}
                </BaseAlert>
                <router-link to="/">
                    <BaseButton variant="accent">
                        Retour à l'accueil
                    </BaseButton>
                </router-link>
            </div>

            <!-- Confirmation de succès -->
            <div v-else-if="request" class="text-center">
                <div class="text-6xl mb-4 animate-bounce">&#x2705;</div>

                <h1 class="text-2xl font-bold text-success mb-6">Demande envoyée avec succès !</h1>

                <div class="bg-secondary-ghost rounded-lg shadow-md p-6 mb-8 text-left border-l-4 border-success">
                    <p class="mb-3 text-primary">Merci pour votre demande de devis, <strong class="text-accent">{{ request.name }}</strong>.</p>
                    <p class="mb-3 text-primary">
                        Vous allez recevoir un email de confirmation à
                        <strong class="text-accent">{{ request.email }}</strong>
                    </p>
                    <p class="text-primary">
                        Je reviendrai vers vous sous <strong>24-48h</strong> avec un devis personnalisé adapté à votre projet.
                    </p>
                </div>

                <div class="bg-secondary-ghost rounded-lg shadow-md p-6 mb-8 text-left">
                    <h2 class="text-xl font-semibold mb-4 text-center text-primary">Prochaines étapes</h2>
                    <ol class="space-y-4">
                        <li class="flex gap-4">
                            <span class="flex-shrink-0 w-8 h-8 bg-accent text-secondary rounded-full flex items-center justify-center font-bold">1</span>
                            <div>
                                <strong class="block text-primary">Réception du devis</strong>
                                <p class="text-primary-ghost">Je vous enverrai un devis détaillé par email incluant le périmètre exact, le planning et le tarif.</p>
                            </div>
                        </li>
                        <li class="flex gap-4">
                            <span class="flex-shrink-0 w-8 h-8 bg-accent text-secondary rounded-full flex items-center justify-center font-bold">2</span>
                            <div>
                                <strong class="block text-primary">Validation et acompte</strong>
                                <p class="text-primary-ghost">Après validation du devis, vous pourrez régler l'acompte de 30% pour lancer le projet.</p>
                            </div>
                        </li>
                        <li class="flex gap-4">
                            <span class="flex-shrink-0 w-8 h-8 bg-accent text-secondary rounded-full flex items-center justify-center font-bold">3</span>
                            <div>
                                <strong class="block text-primary">Démarrage du projet</strong>
                                <p class="text-primary-ghost">Je démarre le développement dès réception de l'acompte et vous tiens informé régulièrement.</p>
                            </div>
                        </li>
                        <li class="flex gap-4">
                            <span class="flex-shrink-0 w-8 h-8 bg-accent text-secondary rounded-full flex items-center justify-center font-bold">4</span>
                            <div>
                                <strong class="block text-primary">Livraison et solde</strong>
                                <p class="text-primary-ghost">Présentation finale du projet et règlement des 70% restants avant mise en ligne.</p>
                            </div>
                        </li>
                    </ol>
                </div>

                <div class="bg-warning-light rounded-lg shadow-md p-6 mb-8 text-left border border-warning">
                    <h3 class="text-lg font-semibold mb-4 text-center text-primary">Récapitulatif de votre demande</h3>
                    <div class="space-y-2 text-primary">
                        <p><strong>Numéro de demande :</strong> #{{ request.id.slice(-8).toUpperCase() }}</p>
                        <p><strong>Date :</strong> {{ formatDate(request.createdAt) }}</p>

                        <div class="mt-4">
                            <strong class="block mb-2">Services demandés :</strong>
                            <ul class="bg-secondary rounded-md p-3 space-y-2">
                                <li
                                    v-for="service in request.requestedServices"
                                    :key="service.serviceId"
                                    class="flex justify-between items-center py-1 border-b border-primary-ghost/20 last:border-0"
                                >
                                    <span>{{ service.quantity }}x {{ service.serviceName }}</span>
                                    <span class="font-medium">{{ formatPrice(service.price) }}</span>
                                </li>
                            </ul>
                        </div>

                        <p class="text-lg font-semibold mt-4 pt-3 border-t border-warning">
                            <strong>Total estimé :</strong> {{ formatPrice(request.estimatedTotal) }}
                        </p>

                        <p><strong>Délai souhaité :</strong> {{ request.desiredDeadline }}</p>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                    <router-link to="/">
                        <BaseButton variant="accent">
                            Retour à l'accueil
                        </BaseButton>
                    </router-link>
                    <router-link to="/services">
                        <BaseButton variant="secondary">
                            Découvrir nos autres services
                        </BaseButton>
                    </router-link>
                </div>

                <div class="text-center text-primary-ghost border-t border-emphasis pt-6">
                    <p>
                        <strong>Une question ?</strong>
                        N'hésitez pas à me contacter directement si besoin.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
