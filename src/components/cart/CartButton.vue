<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ShoppingCartIcon } from '@heroicons/vue/24/solid'
import { useCartStore } from '@/stores/cart.store'
import CartDropdown from '@/components/cart/CartDropdown.vue'

defineProps({
    size: {
        type: String,
        default: 'md' // 'sm' pour mobile, 'md' pour desktop
    }
})

const isCartOpen = ref(false)
const cartStore = useCartStore()
const cartButtonRef = ref<HTMLElement | null>(null)

const toggleCart = () => {
    isCartOpen.value = !isCartOpen.value
}

const closeCart = () => {
    isCartOpen.value = false
}

const openCart = () => {
    isCartOpen.value = true
}
// Surveiller si un item vient d'être ajouté
watch(() => cartStore.itemJustAdded, (newValue) => {
    if (newValue && !isCartOpen.value) {
        openCart()
    }
})

// Gestion des clics à l'extérieur
const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    
    // Ne pas fermer si le clic est sur un bouton "Ajouter au panier"
    if (target.closest('.add-to-cart-btn')) {
        return;
    }
    
    if (isCartOpen.value && cartButtonRef.value && !cartButtonRef.value.contains(target)) {
        closeCart();
    }
}

// Ajouter/retirer les événements au montage/démontage du composant
onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('mousedown', handleClickOutside)
})

const emit = defineEmits(['close'])

defineExpose({
    closeCart
})
</script>

<template>
    <div class="relative" ref="cartButtonRef">
        <button title="Cart" @click="toggleCart" class="text-secondary hover:text-primary relative flex items-center">
            <ShoppingCartIcon class="w-6 h-6" />
            <span v-if="cartStore.itemCount > 0"
                class="absolute -top-2 -right-2 bg-emphasis text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {{ cartStore.itemCount }}
            </span>
        </button>
        <div v-if="isCartOpen" class="absolute right-0 mt-2 z-20">
            <CartDropdown @close="closeCart" />
        </div>
    </div>
</template>