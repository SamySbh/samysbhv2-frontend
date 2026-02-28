<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores';
import BaseButton from '@/components/ui/BaseButton.vue';

// Props
defineProps({
    buttonText: {
        type: String,
        default: 'Demander un devis'
    }
});

// Store et router
const cartStore = useCartStore();
const router = useRouter();

const emit = defineEmits(['close']);

// Computed
const isCartEmpty = computed(() => cartStore.itemCount === 0);

// Méthodes
function goToProjectRequest() {
    if (isCartEmpty.value) {
        return;
    }
    emit('close');
    router.push('/demande-projet');
}
</script>

<template>
    <BaseButton
        variant="primary"
        :disabled="isCartEmpty"
        @click="goToProjectRequest"
    >
        {{ buttonText }}
    </BaseButton>
</template>
