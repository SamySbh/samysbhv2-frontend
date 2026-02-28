<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useOrderItemStore } from '@/stores/order-items.store';
import { useOrderStore } from '@/stores/order.store';
import { useServiceStore } from '@/stores/service.store';
import { storeToRefs } from 'pinia';
import { OrderItem } from '@/types';
import BaseModal from '@/components/ui/BaseModal.vue';
import BaseSelect from '@/components/ui/BaseSelect.vue';
import BaseInput from '@/components/ui/BaseInput.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseAlert from '@/components/ui/BaseAlert.vue';

// Props
const props = defineProps<{
    orderItem: OrderItem;
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
    (e: 'itemUpdated'): void;
}>();

// État local du formulaire
const formData = ref({
    serviceId: '',
    orderId: '',
    quantity: 1,
    unitAmount: 0,
    totalAmount: 0
});

// État de chargement et d'erreur
const isSubmitting = ref(false);
const errorMessage = ref('');

// Options pour les selects
const orderOptions = computed(() =>
    orders.value.map(order => ({
        value: order.id as string,
        label: `${getOrderReference(order.id as string)} - ${order.user?.firstName} ${order.user?.lastName}`
    }))
);

const serviceOptions = computed(() =>
    services.value.map(service => ({
        value: service.id as string,
        label: `${service.name} - ${service.basePrice.toFixed(2)} €`
    }))
);

// Initialiser le formulaire avec les données de l'item
onMounted(async () => {
    try {
        if (orders.value.length === 0) {
            await orderStore.getOrders();
        }
        if (services.value.length === 0) {
            await serviceStore.getServices();
        }

        formData.value = {
            serviceId: props.orderItem.serviceId,
            orderId: props.orderItem.orderId,
            quantity: props.orderItem.quantity,
            unitAmount: props.orderItem.unitAmount,
            totalAmount: props.orderItem.totalAmount
        };
    } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
    }
});

// Mise à jour du prix unitaire lorsque le service sélectionné change
watch(() => formData.value.serviceId, (newServiceId, oldServiceId) => {
    if (newServiceId && newServiceId !== oldServiceId) {
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
        if (!props.orderItem.id) {
            throw new Error('ID item manquant');
        }

        await orderItemStore.updateOrderItem(props.orderItem.id, formData.value);
        emit('itemUpdated');
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
    <BaseModal title="Modifier l'item de commande" @close="closeModal">
        <form @submit.prevent="submitForm" class="space-y-4">
            <!-- Message d'erreur -->
            <BaseAlert v-if="errorMessage" variant="error" dismissible @dismiss="errorMessage = ''">
                {{ errorMessage }}
            </BaseAlert>

            <!-- Commande (orderId) -->
            <BaseSelect
                v-model="formData.orderId"
                :options="orderOptions"
                label="Commande"
                placeholder="Sélectionner une commande"
                required
                light-mode
            />

            <!-- Service (serviceId) -->
            <BaseSelect
                v-model="formData.serviceId"
                :options="serviceOptions"
                label="Service"
                placeholder="Sélectionner un service"
                required
                light-mode
            />

            <!-- Quantité -->
            <BaseInput
                v-model="formData.quantity"
                type="number"
                label="Quantité"
                :min="1"
                required
                light-mode
            />

            <!-- Prix unitaire -->
            <BaseInput
                v-model="formData.unitAmount"
                type="number"
                label="Prix unitaire (€)"
                :min="0"
                step="0.01"
                required
                light-mode
            />

            <!-- Montant total (calculé automatiquement) -->
            <BaseInput
                v-model="formData.totalAmount"
                type="number"
                label="Montant total (€)"
                hint="Calculé automatiquement (quantité × prix unitaire)"
                readonly
                light-mode
            />
        </form>

        <template #footer>
            <BaseButton variant="secondary" @click="closeModal" :disabled="isSubmitting">
                Annuler
            </BaseButton>
            <BaseButton variant="accent" @click="submitForm" :loading="isSubmitting">
                <template #loading>Enregistrement...</template>
                Enregistrer les modifications
            </BaseButton>
        </template>
    </BaseModal>
</template>
