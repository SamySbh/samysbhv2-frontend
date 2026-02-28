<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { ProjectRequest } from '@/types/projectRequest';
import { authFetch } from '@/utils/http';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

// Props
const props = defineProps<{
    request: ProjectRequest;
}>();

// Emits
const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'orderCreated', orderId: string, depositPaymentUrl: string): void;
}>();

// Formulaire
const form = ref({
    totalAmount: props.request.estimatedTotal || 0,
    dueDate: '',
    internalNotes: '',
});

const isSubmitting = ref(false);
const error = ref<string | null>(null);

// Calculs automatiques
const depositAmount = computed(() => {
    return (form.value.totalAmount * 0.3).toFixed(2);
});

const finalAmount = computed(() => {
    return (form.value.totalAmount * 0.7).toFixed(2);
});

// Date minimale (aujourd'hui)
const minDate = computed(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
});

// Validation du formulaire
const isFormValid = computed(() => {
    return (
        form.value.totalAmount > 0 &&
        form.value.dueDate !== '' &&
        new Date(form.value.dueDate) > new Date()
    );
});

// Formater le prix
function formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

// Fermer la modal
function closeModal() {
    if (isSubmitting.value) return;
    emit('close');
}

// Soumettre le formulaire
async function handleSubmit() {
    if (!isFormValid.value || isSubmitting.value) return;

    error.value = null;
    isSubmitting.value = true;

    try {
        // Préparer les données
        const orderData = {
            projectRequestId: props.request.id,
            totalAmount: form.value.totalAmount,
            depositAmount: parseFloat(depositAmount.value),
            dueDate: form.value.dueDate,
            internalNotes: form.value.internalNotes,
        };

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

        // Étape 1 : Créer la commande
        const createResponse = await authFetch(`${API_URL}/admin/orders`, {
            method: 'POST',
            body: JSON.stringify(orderData),
        });

        if (!createResponse.ok) {
            const errorData = await createResponse.json();
            throw new Error(errorData.message || 'Erreur lors de la création de la commande');
        }

        const createResult = await createResponse.json();
        const orderId = createResult.data?.id || createResult.id;

        // Étape 2 : Générer le lien de paiement pour l'acompte
        const paymentResponse = await authFetch(`${API_URL}/orders/${orderId}/payment-link`, {
            method: 'POST',
            body: JSON.stringify({ paymentType: 'deposit' }),
        });

        let paymentUrl = '';
        if (paymentResponse.ok) {
            const paymentResult = await paymentResponse.json();
            paymentUrl = paymentResult.data?.paymentUrl || paymentResult.paymentUrl || '';
        }

        // Succès : émettre l'événement avec les infos
        emit('orderCreated', orderId, paymentUrl);

        // Réinitialiser le formulaire
        resetForm();

    } catch (err) {
        console.error('Erreur création commande:', err);
        error.value = err instanceof Error ? err.message : 'Erreur inconnue';
    } finally {
        isSubmitting.value = false;
    }
}

// Réinitialiser le formulaire
function resetForm() {
    form.value = {
        totalAmount: props.request.estimatedTotal || 0,
        dueDate: '',
        internalNotes: '',
    };
    error.value = null;
}

// Réinitialiser quand la modal s'ouvre
watch(() => props.request, () => {
    resetForm();
}, { immediate: true });
</script>

<template>
    <BaseModal title="Créer une commande" size="lg" @close="closeModal">
        <!-- Informations de la demande -->
        <div class="bg-secondary-ghost rounded-lg p-4 mb-6">
            <h3 class="font-semibold text-primary mb-3 flex items-center gap-2">
                <span>📋</span> Demande de projet
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                    <span class="text-xs text-primary-ghost uppercase">Client</span>
                    <p class="font-medium text-primary">{{ request.name }}</p>
                </div>
                <div>
                    <span class="text-xs text-primary-ghost uppercase">Email</span>
                    <p class="text-primary">{{ request.email }}</p>
                </div>
                <div>
                    <span class="text-xs text-primary-ghost uppercase">Téléphone</span>
                    <p class="text-primary">{{ request.phone || 'Non renseigné' }}</p>
                </div>
                <div>
                    <span class="text-xs text-primary-ghost uppercase">Entreprise</span>
                    <p class="text-primary">{{ request.company || 'Non renseignée' }}</p>
                </div>
            </div>

            <div class="border-t border-primary-ghost/20 pt-4">
                <span class="text-xs text-primary-ghost uppercase block mb-2">Services demandés</span>
                <ul class="space-y-1 mb-3">
                    <li
                        v-for="service in request.requestedServices"
                        :key="service.serviceId"
                        class="flex justify-between text-sm text-primary"
                    >
                        <span>{{ service.quantity }}x {{ service.serviceName }}</span>
                        <span class="font-medium">{{ formatPrice(service.price) }}</span>
                    </li>
                </ul>
                <p class="text-sm text-primary-ghost border-t border-primary-ghost/20 pt-2">
                    Total estimé initial : <strong class="text-primary">{{ formatPrice(request.estimatedTotal) }}</strong>
                </p>
            </div>
        </div>

        <!-- Formulaire de création -->
        <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- Section Montant -->
            <div>
                <h3 class="font-semibold text-primary mb-3 flex items-center gap-2">
                    <span>💰</span> Montant du devis
                </h3>

                <BaseInput
                    v-model="form.totalAmount"
                    type="number"
                    label="Montant total du devis (€)"
                    :min="0"
                    step="0.01"
                    placeholder="5000.00"
                    hint="Montant final négocié avec le client"
                    required
                    light-mode
                />

                <!-- Répartition des montants -->
                <div class="flex items-center gap-4 mt-4 p-4 bg-secondary-ghost rounded-lg">
                    <div class="flex-1 text-center p-4 bg-secondary rounded-lg border-t-4 border-info shadow-sm">
                        <div class="text-xs text-primary-ghost uppercase mb-1">Acompte (30%)</div>
                        <div class="text-2xl font-bold text-primary">{{ depositAmount }} €</div>
                        <div class="text-xs text-primary-ghost mt-1">À payer pour démarrer</div>
                    </div>

                    <div class="text-2xl text-primary-ghost font-bold">+</div>

                    <div class="flex-1 text-center p-4 bg-secondary rounded-lg border-t-4 border-success shadow-sm">
                        <div class="text-xs text-primary-ghost uppercase mb-1">Solde (70%)</div>
                        <div class="text-2xl font-bold text-primary">{{ finalAmount }} €</div>
                        <div class="text-xs text-primary-ghost mt-1">À payer à la livraison</div>
                    </div>
                </div>
            </div>

            <!-- Section Planning -->
            <div>
                <h3 class="font-semibold text-primary mb-3 flex items-center gap-2">
                    <span>📅</span> Planning
                </h3>

                <BaseInput
                    v-model="form.dueDate"
                    type="date"
                    label="Date limite de livraison"
                    :min="minDate"
                    required
                    hint="Date prévue pour la livraison finale du projet"
                    light-mode
                />
            </div>

            <!-- Section Notes -->
            <div>
                <h3 class="font-semibold text-primary mb-3 flex items-center gap-2">
                    <span>📝</span> Notes internes
                </h3>

                <div>
                    <label for="internalNotes" class="input-label-light">Notes (optionnel)</label>
                    <textarea
                        id="internalNotes"
                        v-model="form.internalNotes"
                        rows="3"
                        placeholder="Notes pour usage interne uniquement (non visibles par le client)"
                        class="input-field-light resize-y"
                    />
                </div>
            </div>

            <!-- Message d'erreur -->
            <BaseAlert v-if="error" variant="error" dismissible @dismiss="error = null">
                {{ error }}
            </BaseAlert>
        </form>

        <template #footer>
            <BaseButton
                variant="secondary"
                @click="closeModal"
                :disabled="isSubmitting"
            >
                Annuler
            </BaseButton>
            <BaseButton
                variant="accent"
                @click="handleSubmit"
                :loading="isSubmitting"
                :disabled="!isFormValid"
            >
                <template #loading>Création en cours...</template>
                Créer la commande
            </BaseButton>
        </template>
    </BaseModal>
</template>
