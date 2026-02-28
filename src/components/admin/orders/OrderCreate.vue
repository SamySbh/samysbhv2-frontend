<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useOrderStore } from '@/stores/order.store';
import { useUserStore } from '@/stores/user.store';
import { storeToRefs } from 'pinia';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

// Stores
const orderStore = useOrderStore();
const userStore = useUserStore();

// Extraire les données des stores
const { users } = storeToRefs(userStore);

// Définir les émetteurs d'événements
const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'orderCreated'): void;
}>();

// État local du formulaire
const formData = ref({
    statusMain: 'NEW' as 'NEW' | 'VALIDATED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED',
    statusPayment: 'PENDING_DEPOSIT' as 'PENDING_DEPOSIT' | 'DEPOSIT_PAID' | 'PENDING_FINAL' | 'FULLY_PAID',
    totalAmount: 0,
    depositAmount: 0,
    deadlineDate: '',
    userId: ''
});

// État de chargement et d'erreur
const isSubmitting = ref(false);
const errorMessage = ref('');

// Options pour les selects
const userOptions = computed(() =>
    users.value.map(user => ({
        value: user.id as string,
        label: `${user.firstName} ${user.lastName} (${user.email})`
    }))
);

const mainStatusOptions = [
    { value: 'NEW', label: 'Nouveau' },
    { value: 'VALIDATED', label: 'Validé' },
    { value: 'IN_PROGRESS', label: 'En cours' },
    { value: 'COMPLETED', label: 'Terminé' },
    { value: 'ARCHIVED', label: 'Archivé' }
];

const paymentStatusOptions = [
    { value: 'PENDING_DEPOSIT', label: 'En attente d\'acompte' },
    { value: 'DEPOSIT_PAID', label: 'Acompte payé' },
    { value: 'PENDING_FINAL', label: 'En attente du solde' },
    { value: 'FULLY_PAID', label: 'Entièrement payé' }
];

// Charger les utilisateurs au montage
onMounted(async () => {
    try {
        await userStore.getUsers();
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
    }
});

// Soumettre le formulaire
const submitForm = async () => {
    isSubmitting.value = true;
    errorMessage.value = '';

    try {
        const orderData = {
            ...formData.value,
            deadlineDate: formData.value.deadlineDate
                ? new Date(formData.value.deadlineDate)
                : undefined
        };

        await orderStore.createOrder(orderData);
        emit('orderCreated');
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Une erreur est survenue';
    } finally {
        isSubmitting.value = false;
    }
};

// Calculer l'acompte automatiquement (30% du montant total)
const calculateDeposit = () => {
    formData.value.depositAmount = formData.value.totalAmount * 0.3;
};

// Fermer le modal
const closeModal = () => {
    emit('close');
};
</script>

<template>
    <BaseModal title="Créer une commande" size="lg" @close="closeModal">
        <form @submit.prevent="submitForm" class="space-y-4">
            <!-- Message d'erreur -->
            <BaseAlert v-if="errorMessage" variant="error" dismissible @dismiss="errorMessage = ''">
                {{ errorMessage }}
            </BaseAlert>

            <!-- Client (userId) -->
            <BaseSelect
                v-model="formData.userId"
                :options="userOptions"
                label="Client"
                placeholder="Sélectionner un client"
                required
                light-mode
            />

            <!-- Montant total -->
            <BaseInput
                v-model="formData.totalAmount"
                type="number"
                label="Montant total (€)"
                :min="0"
                step="0.01"
                required
                light-mode
                @input="calculateDeposit"
            />

            <!-- Montant de l'acompte -->
            <BaseInput
                v-model="formData.depositAmount"
                type="number"
                label="Montant de l'acompte (€)"
                :min="0"
                step="0.01"
                hint="Par défaut 30% du montant total"
                required
                light-mode
            />

            <!-- Date d'échéance -->
            <BaseInput
                v-model="formData.deadlineDate"
                type="date"
                label="Date d'échéance"
                light-mode
            />

            <!-- Statut principal -->
            <BaseSelect
                v-model="formData.statusMain"
                :options="mainStatusOptions"
                label="Statut principal"
                required
                light-mode
            />

            <!-- Statut de paiement -->
            <BaseSelect
                v-model="formData.statusPayment"
                :options="paymentStatusOptions"
                label="Statut de paiement"
                required
                light-mode
            />
        </form>

        <template #footer>
            <BaseButton variant="secondary" @click="closeModal" :disabled="isSubmitting">
                Annuler
            </BaseButton>
            <BaseButton variant="accent" @click="submitForm" :loading="isSubmitting">
                <template #loading>Création...</template>
                Créer la commande
            </BaseButton>
        </template>
    </BaseModal>
</template>
