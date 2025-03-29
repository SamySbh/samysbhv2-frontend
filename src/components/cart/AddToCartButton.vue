<script setup lang="ts">
import { ref } from 'vue';
import { useCartStore } from '../../stores/cart.store';
import type { Service } from '../../types';

const props = defineProps({
    service: {
        type: Object as () => Service,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    }
});

const emit = defineEmits(['added']);
const loading = ref(false);
const cartStore = useCartStore();

const addToCartHandler = () => {
    loading.value = true;

    try {
        cartStore.addToCart(props.service, props.quantity);
        emit('added');
    } catch (error) {
        console.error('Erreur lors de l\'ajout au panier:', error);
    } finally {
        loading.value = false;
    }
};
</script>

<template>
    <button class="btn-primary add-to-cart-btn" @click="addToCartHandler" :disabled="loading">
        {{ loading ? 'Ajout...' : 'Ajouter au panier' }}
    </button>
</template>