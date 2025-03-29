<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { RouterLink } from 'vue-router'
import CartButton from '@/components/cart/CartButton.vue'
import LogoutButton from '@/components/auth/LogoutButton.vue'
import AuthLink from '@/components/auth/AuthButton.vue'
import { useAuthStore } from '@/stores/auth.store'

import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/solid'

const isMobileMenuOpen = ref(false)
const isCartOpen = ref(false)
const isNavbarVisible = ref(true)
const lastScrollPosition = ref(0)
const cartButtonRef = ref<InstanceType<typeof CartButton> | null>(null)
const authStore = useAuthStore()
const links = [
  { path: '/', name: 'Accueil' },
  { path: '/services', name: 'Mes Services' },
  { path: '/contact', name: 'Contact' }
]

// Référence pour accéder aux méthodes du composant CartButton
// Gestion du scroll pour masquer/afficher la navbar
const handleScroll = () => {
  const currentScrollPosition = window.scrollY
  const wasVisible = isNavbarVisible.value

  // Vérifier si le scroll est vers le bas (valeur positive) ou vers le haut (valeur négative)
  if (currentScrollPosition < 50) {
    // Toujours visible en haut de page
    isNavbarVisible.value = true
  } else if (currentScrollPosition > lastScrollPosition.value + 5) {
    // Scroll vers le bas (masquer la navbar)
    isNavbarVisible.value = false
  } else if (currentScrollPosition < lastScrollPosition.value - 5) {
    // Scroll vers le haut (afficher la navbar)
    isNavbarVisible.value = true
  }

  // Si la navbar devient invisible, fermer le panier
  if (wasVisible && !isNavbarVisible.value) {
    closeMobileMenu()
    closeCart()
  }

  // Mettre à jour la dernière position de scroll
  lastScrollPosition.value = currentScrollPosition
}

// Fonction pour fermer le menu mobile
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false
}

// Fonction pour fermer le panier
const closeCart = () => {
  isCartOpen.value = false

  // Essayer d'appeler la méthode closeCart du composant CartButton si elle existe
  // Cette partie dépend de l'implémentation exacte de votre CartButton
  if (cartButtonRef.value && typeof cartButtonRef.value.closeCart === 'function') {
    cartButtonRef.value.closeCart()
  }
}

// Enregistrer l'écouteur d'événement au montage du composant
onMounted(() => {
  window.addEventListener('scroll', handleScroll)

  // Vérifier l'état d'authentification au chargement
  if (localStorage.getItem('accessToken') && !authStore.currentUser) {
    authStore.checkAuth().catch(error => {
      console.error('Erreur lors de la vérification de l\'authentification:', error)
    })
  }
})

// Supprimer l'écouteur d'événement avant le démontage du composant
onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <nav class="bg-accent z-10 fixed top-0 w-full transition-transform duration-300"
    :class="{ '-translate-y-full': !isNavbarVisible }">
    <div class="container mx-auto px-2 md:px-4 relative">
      <!-- Desktop Navigation -->
      <div class="hidden md:flex items-center justify-between h-16">
        <div class="flex gap-6">
          <RouterLink to="/" class="text-secondary hover:text-primary">Accueil</RouterLink>
          <RouterLink to="/services" class="text-secondary hover:text-primary">Services</RouterLink>
          <RouterLink to="/contact" class="text-secondary hover:text-primary">Contact</RouterLink>
          <RouterLink v-if="authStore.currentUser?.role === 'ADMIN'" to="/admin"
            class="text-secondary hover:text-primary">Admin</RouterLink>
        </div>

        <div class="absolute left-1/2 transform -translate-x-1/2 h-full flex items-center">
          <RouterLink to="/" class="block">
            <img src="/assets/logos/LogoSamySBHAvecFondGrand.webp" alt="Logo" class="h-12 w-auto">
          </RouterLink>
        </div>

        <div class="flex items-center gap-4">
          <AuthLink />
          <CartButton ref="cartButtonRef" @close="closeCart" />
          <LogoutButton class="mr-1" />
        </div>
      </div>

      <!-- Mobile Navigation -->
      <div class="md:hidden flex items-center justify-between h-16">
        <button title="Menu" @click="isMobileMenuOpen = !isMobileMenuOpen" class="text-secondary">
          <Bars3Icon v-if="!isMobileMenuOpen" class="w-6" />
          <XMarkIcon v-else class="w-6" />
        </button>

        <div class="absolute left-1/2 top-8 -translate-x-1/2 -translate-y-1/2">
          <RouterLink to="/" class="size-8 block">
            <img src="/assets/logos/LogoSamySBHAvecFondGrand.webp" alt="Logo" class="w-full h-auto">
          </RouterLink>
        </div>

        <div class="flex items-center gap-2">
          <AuthLink />
          <CartButton title="Cart" ref="cartButtonRef" size="sm" @close="closeCart" />
          <LogoutButton />
        </div>
      </div>

      <!-- Mobile Menu Dropdown -->
      <div v-show="isMobileMenuOpen" class="md:hidden space-y-1 py-2 absolute w-full left-0 bg-accent z-10 rounded-b"
        style="top: 100%;">
        <RouterLink v-for="link in links" :key="link.path" :to="link.path"
          class="block px-3 py-2 text-secondary hover:text-primary" @click="isMobileMenuOpen = false">
          {{ link.name }}
        </RouterLink>
        <RouterLink v-if="authStore.currentUser?.role === 'ADMIN'" to="/admin"
          class="block px-3 py-2 text-secondary hover:text-primary" @click="isMobileMenuOpen = false">
          Administration
        </RouterLink>
        <RouterLink v-if="authStore.isAuthenticated && authStore.currentUser?.role !== 'ADMIN'" to="/user"
          class="block px-3 py-2 text-secondary hover:text-primary" @click="isMobileMenuOpen = false">
          Mon compte
        </RouterLink>
      </div>
    </div>
  </nav>
  <!-- Ajout d'un espace pour compenser la navbar fixe -->
  <div class="h-16"></div>
</template>