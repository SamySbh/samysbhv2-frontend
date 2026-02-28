<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart.store';
import { useAuthStore } from '@/stores/auth.store';
import { projectRequestApi } from '@/services/api/projectRequest.api';
import type { CreateProjectRequestDto } from '@/types/projectRequest';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseButton from '@/components/ui/BaseButton.vue';

const router = useRouter();
const cartStore = useCartStore();
const authStore = useAuthStore();

const cartItems = computed(() => cartStore.cartItems);
const estimatedTotal = computed(() => cartStore.cartTotal);
const isAuthenticated = computed(() => authStore.isAuthenticated);

const form = ref({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectDescription: '',
    desiredDeadline: '1-3 mois',
    hasExistingSite: false,
    existingSiteUrl: '',
    additionalInfo: '',
});

const isSubmitting = ref(false);

onMounted(async () => {
    if (isAuthenticated.value && !authStore.currentUser) {
        try {
            await authStore.getProfile();
        } catch {
            // Continuer sans pré-remplissage si le profil échoue
        }
    }

    if (authStore.currentUser) {
        const user = authStore.currentUser;
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');

        form.value = {
            ...form.value,
            name: fullName || form.value.name,
            email: user.email || form.value.email,
            phone: user.phone || form.value.phone,
            company: user.company || form.value.company,
        };
    }
});

// Options pour le délai
const deadlineOptions = [
    { value: '< 1 mois', label: "Moins d'1 mois (urgent)" },
    { value: '1-3 mois', label: '1 à 3 mois' },
    { value: '3-6 mois', label: '3 à 6 mois' },
    { value: 'Pas de contrainte', label: 'Pas de contrainte particulière' }
];

// Formatage du prix
const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
};

async function submitRequest() {
    if (cartItems.value.length === 0) {
        alert('Votre panier est vide');
        return;
    }

    isSubmitting.value = true;

    try {
        const requestData: CreateProjectRequestDto = {
            name: form.value.name,
            email: form.value.email,
            phone: form.value.phone || undefined,
            company: form.value.company || undefined,
            projectDescription: form.value.projectDescription,
            desiredDeadline: form.value.desiredDeadline,
            hasExistingSite: form.value.hasExistingSite,
            existingSiteUrl: form.value.hasExistingSite ? form.value.existingSiteUrl : undefined,
            additionalInfo: form.value.additionalInfo || undefined,
            requestedServices: cartItems.value.map(item => ({
                serviceId: item.serviceId,
                serviceName: item.service.name,
                quantity: item.quantity,
                price: item.totalAmount,
            })),
            estimatedTotal: estimatedTotal.value,
        };

        const response = await projectRequestApi.create(requestData);

        // Vider le panier
        cartStore.clearCart();

        // Rediriger vers la page de confirmation
        router.push({
            name: 'project-request-confirmation',
            params: { id: response.id }
        });
    } catch (error) {
        console.error('Erreur soumission:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
    <div class="container mx-auto py-8 px-4">
        <h1 class="text-2xl font-bold mb-6 text-secondary">Demande de devis personnalisé</h1>

        <!-- Récap du panier -->
        <section class="bg-secondary-ghost rounded-lg shadow-md p-6 mb-6">
            <h2 class="text-xl font-semibold mb-4 text-primary">Services sélectionnés</h2>
            <div class="divide-y divide-emphasis">
                <div v-for="item in cartItems" :key="item.serviceId" class="py-3 flex justify-between items-center">
                    <div class="flex items-center gap-3">
                        <span class="bg-accent text-secondary px-2 py-1 rounded text-sm font-medium">{{ item.quantity }}x</span>
                        <span class="font-medium text-primary">{{ item.service.name }}</span>
                    </div>
                    <span class="font-semibold text-primary">{{ formatPrice(item.totalAmount) }}</span>
                </div>
            </div>
            <div class="mt-4 pt-4 border-t-2 border-emphasis">
                <div class="flex justify-between items-center">
                    <strong class="text-lg text-primary">Total estimé :</strong>
                    <strong class="text-xl text-accent">{{ formatPrice(estimatedTotal) }}</strong>
                </div>
                <p class="text-primary-ghost text-sm mt-2">Le prix final sera précisé dans le devis personnalisé</p>
            </div>
        </section>

        <!-- Formulaire -->
        <form @submit.prevent="submitRequest" class="bg-secondary-ghost rounded-lg shadow-md p-6">
            <section class="mb-8">
                <h2 class="text-xl font-semibold mb-4 text-primary">Vos coordonnées</h2>

                <div v-if="isAuthenticated && authStore.currentUser" class="p-3 bg-blue-50 border-l-4 border-blue-400 rounded text-blue-800 text-sm mb-4">
                    Vos coordonnées ont été pré-remplies depuis votre profil. Vous pouvez les modifier si nécessaire.
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BaseInput
                        v-model="form.name"
                        label="Nom complet"
                        placeholder="Jean Dupont"
                        required
                        light-mode
                    />

                    <BaseInput
                        v-model="form.email"
                        type="email"
                        label="Email"
                        placeholder="jean@exemple.fr"
                        required
                        light-mode
                    />

                    <BaseInput
                        v-model="form.phone"
                        type="tel"
                        label="Téléphone"
                        placeholder="06 12 34 56 78"
                        light-mode
                    />

                    <BaseInput
                        v-model="form.company"
                        label="Entreprise"
                        placeholder="Nom de votre entreprise"
                        light-mode
                    />
                </div>
            </section>

            <section class="mb-8">
                <h2 class="text-xl font-semibold mb-4 text-primary">Détails du projet</h2>

                <div class="space-y-4">
                    <div>
                        <label for="description" class="input-label-light">Description de votre projet
                            <span class="text-error">*</span>
                        </label>
                        <textarea
                            id="description"
                            v-model="form.projectDescription"
                            placeholder="Décrivez votre projet, vos besoins, vos attentes, votre cible..."
                            rows="5"
                            required
                            minlength="20"
                            class="input-field-light resize-y"
                        />
                        <small class="text-primary-ghost text-sm">Minimum 20 caractères</small>
                    </div>

                    <BaseSelect
                        v-model="form.desiredDeadline"
                        :options="deadlineOptions"
                        label="Délai souhaité"
                        required
                        light-mode
                    />

                    <div class="flex items-center">
                        <input
                            id="hasExistingSite"
                            type="checkbox"
                            v-model="form.hasExistingSite"
                            class="h-4 w-4 text-accent focus:ring-accent border-primary-ghost rounded"
                        />
                        <label for="hasExistingSite" class="ml-2 text-primary cursor-pointer">
                            J'ai déjà un site web
                        </label>
                    </div>

                    <BaseInput
                        v-if="form.hasExistingSite"
                        v-model="form.existingSiteUrl"
                        type="url"
                        label="URL du site existant"
                        placeholder="https://monsite.fr"
                        light-mode
                    />

                    <div>
                        <label for="additionalInfo" class="input-label-light">Informations complémentaires</label>
                        <textarea
                            id="additionalInfo"
                            v-model="form.additionalInfo"
                            placeholder="Budget approximatif, références, contraintes particulières..."
                            rows="3"
                            class="input-field-light resize-y"
                        />
                    </div>
                </div>
            </section>

            <div class="flex flex-col sm:flex-row gap-4 justify-between">
                <BaseButton
                    type="button"
                    variant="secondary"
                    @click="router.back()"
                >
                    Retour
                </BaseButton>

                <BaseButton
                    type="submit"
                    variant="accent"
                    :loading="isSubmitting"
                    :disabled="cartItems.length === 0"
                >
                    <template #loading>Envoi en cours...</template>
                    Envoyer ma demande
                </BaseButton>
            </div>
        </form>
    </div>
</template>
