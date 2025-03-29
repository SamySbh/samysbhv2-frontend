<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useOrderItemStore } from '@/stores/order-items.store';
import { useOrderStore } from '@/stores/order.store';
import { useServiceStore } from '@/stores/service.store';
import { storeToRefs } from 'pinia';

// Props
const props = defineProps<{
    selectedOrderId: string | null;
}>();

// Stores
const orderItemStore = useOrderItemStore();
const orderStore = useOrderStore();
const serviceStore = useServiceStore();

// Extraire les données des stores
const { orders } = storeToRefs(orderStore);
const { services } = storeToRefs(serviceStore);

// Définir les émetteurs d'événements
const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'itemCreated'): void;
}>();

// État local du formulaire
const formData = ref({
    serviceId: '',
    orderId: props.selectedOrderId || '',
    quantity: 1,
    unitAmount: 0,
    totalAmount: 0
});

// État de chargement et d'erreur
const isSubmitting = ref(false);
const errorMessage = ref('');

// Charger les commandes et services au montage
onMounted(async () => {
    try {
        if (orders.value.length === 0) {
            await orderStore.getOrders();
        }
        if (services.value.length === 0) {
            await serviceStore.getServices();
        }
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
});

// Mise à jour du prix unitaire lorsque le service sélectionné change
watch(() => formData.value.serviceId, (newServiceId) => {
    if (newServiceId) {
        const selectedService = services.value.find(service => service.id === newServiceId);
        if (selectedService) {
            formData.value.unitAmount = selectedService.basePrice;
            updateTotalAmount();
        }
    }
});

// Mise à jour du montant total lorsque la quantité ou le prix unitaire changent
watch([() => formData.value.quantity, () => formData.value.unitAmount], () => {
    updateTotalAmount();
});

// Calcul du montant total
const updateTotalAmount = () => {
    formData.value.totalAmount = formData.value.unitAmount * formData.value.quantity;
};

// Générer une référence de commande pour l'affichage
const getOrderReference = (orderId: string): string => {
    const order = orders.value.find(o => o.id === orderId);
    if (!order || !order.id) return 'Commande non trouvée';

    const shortId = order.id.substring(0, 6).toUpperCase();
    const date = order.createdAt ? new Date(order.createdAt) : new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `CMD-${year}${month}-${shortId}`;
};

// Soumettre le formulaire
const submitForm = async () => {
    isSubmitting.value = true;
    errorMessage.value = '';

    try {
        await orderItemStore.createOrderItem(formData.value);
        emit('itemCreated');
    } catch (error) {
        errorMessage.value = error instanceof Error ? error.message : 'Une erreur est survenue';
    } finally {
        isSubmitting.value = false;
    }
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
            <div class="px-6 py-4 border-b border-emphasis">
                <h3 class="text-lg font-semibold text-primary">Ajouter un item à la commande</h3>
            </div>

            <!-- Corps du modal -->
            <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
                <form @submit.prevent="submitForm">
                    <!-- Message d'erreur -->
                    <div v-if="errorMessage" class="mb-4 p-3 bg-red-500 text-secondary rounded">
                        {{ errorMessage }}
                    </div>

                    <!-- Commande (orderId) -->
                    <div class="mb-4">
                        <label for="orderId" class="block text-sm font-medium text-secondary-ghost mb-1">Commande</label>
                        <select id="orderId" v-model="formData.orderId" required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent">
                            <option value="" disabled>Sélectionner une commande</option>
                            <option v-for="order in orders" :key="order.id" :value="order.id">
                                {{ getOrderReference(order.id as string) }} - {{ order.user?.firstName }} {{
                                order.user?.lastName }}
                            </option>
                        </select>
                    </div>

                    <!-- Service (serviceId) -->
                    <div class="mb-4">
                        <label for="serviceId" class="block text-sm font-medium text-secondary-ghost mb-1">Service</label>
                        <select id="serviceId" v-model="formData.serviceId" required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent">
                            <option value="" disabled>Sélectionner un service</option>
                            <option v-for="service in services" :key="service.id" :value="service.id">
                                {{ service.name }} - {{ service.basePrice.toFixed(2) }} €
                            </option>
                        </select>
                    </div>

                    <!-- Quantité -->
                    <div class="mb-4">
                        <label for="quantity" class="block text-sm font-medium text-secondary-ghost mb-1">Quantité</label>
                        <input id="quantity" v-model.number="formData.quantity" type="number" min="1" required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent" />
                    </div>

                    <!-- Prix unitaire -->
                    <div class="mb-4">
                        <label for="unitAmount" class="block text-sm font-medium text-secondary-ghost mb-1">Prix unitaire
                            (€)</label>
                        <input id="unitAmount" v-model.number="formData.unitAmount" type="number" min="0" step="0.01"
                            required
                            class="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-accent" />
                        <p class="text-xs text-gray-500 mt-1">Ajusté automatiquement selon le service sélectionné</p>
                    </div>

                    <!-- Montant total (calculé automatiquement) -->
                    <div class="mb-4">
                        <label for="totalAmount" class="block text-sm font-medium text-secondary-ghost mb-1">Montant total
                            (€)</label>
                        <input id="totalAmount" v-model.number="formData.totalAmount" type="number" readonly
                            class="w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded" />
                        <p class="text-xs text-gray-500 mt-1">Calculé automatiquement (quantité × prix unitaire)</p>
                    </div>
                </form>
            </div>

            <!-- Pied du modal -->
            <div class="px-6 py-4 border-t border-emphasis flex justify-end space-x-2">
                <button @click="closeModal" class="px-4 py-2 bg-gray-100 text-primary rounded hover:bg-gray-300"
                    :disabled="isSubmitting">
                    Annuler
                </button>
                <button @click="submitForm" class="px-4 py-2 bg-accent text-secondary rounded hover:bg-accent/90"
                    :disabled="isSubmitting">
                    {{ isSubmitting ? 'Création...' : 'Créer l\'item' }}
                </button>
            </div>
        </div>
    </div>
</template>