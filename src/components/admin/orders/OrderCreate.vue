<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useOrderStore } from '@/stores/order.store';
import { useUserStore } from '@/stores/user.store';
import { storeToRefs } from 'pinia';

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

// Statuts possibles
const mainStatuses = ['NEW', 'VALIDATED', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED'];
const paymentStatuses = ['PENDING_DEPOSIT', 'DEPOSIT_PAID', 'PENDING_FINAL', 'FULLY_PAID'];

// État local du formulaire
const formData = ref({
    statusMain: 'NEW' as 'NEW' | 'VALIDATED' | 'IN_PROGRESS' | 'COMPLETED' | 'ARCHIVED',
    statusPayment: 'PENDING_DEPOSIT' as 'PENDING_DEPOSIT' | 'DEPOSIT_PAID' | 'PENDING_FINAL' | 'FULLY_PAID',
    totalAmount: 0,
    depositAmount: 0,
    deadlineDate: '', // Initialisez comme une chaîne vide
    userId: ''
});

// État de chargement et d'erreur
const isSubmitting = ref(false);
const errorMessage = ref('');

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
        // Créer un nouvel objet avec la date formatée correctement
        const orderData = {
            ...formData.value,
            deadlineDate: formData.value.deadlineDate 
                ? new Date(formData.value.deadlineDate) // Convertir en objet Date, pas en chaîne ISO
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
    <!-- Fond semi-transparent -->
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto">
        <!-- Modal -->
        <div class="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 my-8">
            <!-- En-tête du modal -->
            <div class="px-6 py-4 border-b border-gray-300">
                <h3 class="text-lg font-semibold text-primary">Créer une commande</h3>
            </div>

            <!-- Corps du modal -->
            <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
                <form @submit.prevent="submitForm">
                    <!-- Message d'erreur -->
                    <div v-if="errorMessage" class="mb-4 p-3 bg-red-500 text-secondary rounded">
                        {{ errorMessage }}
                    </div>

                    <!-- Client (userId) -->
                    <div class="mb-4">
                        <label for="userId" class="block text-sm font-medium text-primary-ghost mb-1">Client</label>
                        <select id="userId" v-model="formData.userId" required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent">
                            <option value="" disabled>Sélectionner un client</option>
                            <option v-for="user in users" :key="user.id" :value="user.id">
                                {{ user.firstName }} {{ user.lastName }} ({{ user.email }})
                            </option>
                        </select>
                    </div>

                    <!-- Montant total -->
                    <div class="mb-4">
                        <label for="totalAmount" class="block text-sm font-medium text-primary-ghost mb-1">Montant total
                            (€)</label>
                        <input id="totalAmount" v-model.number="formData.totalAmount" type="number" min="0" step="0.01"
                            required @input="calculateDeposit"
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent" />
                    </div>

                    <!-- Montant de l'acompte -->
                    <div class="mb-4">
                        <label for="depositAmount" class="block text-sm font-medium text-primary-ghost mb-1">Montant de
                            l'acompte (€)</label>
                        <input id="depositAmount" v-model.number="formData.depositAmount" type="number" min="0"
                            step="0.01" required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent" />
                        <p class="text-xs text-gray-500 mt-1">Par défaut 30% du montant total</p>
                    </div>

                    <!-- Date d'échéance -->
                    <div class="mb-4">
                        <label for="deadlineDate" class="block text-sm font-medium text-primary-ghost mb-1">Date
                            d'échéance</label>
                        <input id="deadlineDate" v-model="formData.deadlineDate" type="date"
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent" />
                    </div>

                    <!-- Statut principal -->
                    <div class="mb-4">
                        <label for="statusMain" class="block text-sm font-medium text-primary-ghost mb-1">Statut
                            principal</label>
                        <select id="statusMain" v-model="formData.statusMain" required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent">
                            <option v-for="status in mainStatuses" :key="status" :value="status">{{ status }}</option>
                        </select>
                    </div>

                    <!-- Statut de paiement -->
                    <div class="mb-4">
                        <label for="statusPayment" class="block text-sm font-medium text-primary-ghost mb-1">Statut de
                            paiement</label>
                        <select id="statusPayment" v-model="formData.statusPayment" required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent">
                            <option v-for="status in paymentStatuses" :key="status" :value="status">{{ status }}
                            </option>
                        </select>
                    </div>
                </form>
            </div>

            <!-- Pied du modal -->
            <div class="px-6 py-4 border-t border-gray-300 flex justify-end space-x-2">
                <button @click="closeModal" class="px-4 py-2 bg-gray-100 text-primary-ghost rounded hover:bg-gray-300"
                    :disabled="isSubmitting">
                    Annuler
                </button>
                <button @click="submitForm" class="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
                    :disabled="isSubmitting">
                    {{ isSubmitting ? 'Création...' : 'Créer la commande' }}
                </button>
            </div>
        </div>
    </div>
</template>