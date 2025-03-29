<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useOrderStore } from '@/stores/order.store';
import { storeToRefs } from 'pinia';
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/solid';

// Importation des composants
import UserSidebar from '@/components/user/UserSidebar.vue';
import UserStats from '@/components/user/UserStats.vue';
import OrdersTable from '@/components/user/OrdersTable.vue';
import OrdersCardList from '@/components/user/OrdersCardList.vue';
import ProfileForm from '@/components/user/ProfileSection.vue';
import PaymentsTable from '@/components/user/PaymentsTable.vue';

// État pour le menu mobile
const isMobileMenuOpen = ref(false);

// Fonction pour basculer l'état du menu mobile
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

// Fonction pour fermer le menu mobile
const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};

// Stores
const authStore = useAuthStore();
const orderStore = useOrderStore();

// Références réactives aux stores
const { currentUser } = storeToRefs(authStore);
const { orders, loading } = storeToRefs(orderStore);

// Tab actif
const activeTab = ref<'overview' | 'orders' | 'profile' | 'payments'>('overview');

// Stats
const stats = ref({
  totalOrders: 0,
  totalAmount: 0,
  pendingOrders: 0
});

// Calculer les statistiques
const calculateStats = (): void => {
  if (!orders.value || orders.value.length === 0) return;

  stats.value.totalOrders = orders.value.length;
  stats.value.totalAmount = orders.value.reduce((sum, order) => sum + order.totalAmount, 0);
  stats.value.pendingOrders = orders.value.filter(
    (order) => order.statusMain !== 'COMPLETED' && order.statusMain !== 'ARCHIVED'
  ).length;
};

// Chargement des données
onMounted(async () => {
  try {
    if (!currentUser.value) {
      await authStore.getProfile();
    }
    await orderStore.getOrders();
    calculateStats();
  } catch (error) {
    console.error('Erreur de chargement des données:', error);
  }
});

// Changement d'onglet avec fermeture du menu mobile
const setActiveTab = (tab: typeof activeTab.value): void => {
  activeTab.value = tab;
  closeMobileMenu(); // Fermer le menu mobile après avoir changé d'onglet
};

const isUpdatingProfile = ref<boolean>(false);

// Toggle pour le mode d'édition du profil
const toggleUpdateMode = () => {
  isUpdatingProfile.value = !isUpdatingProfile.value;
};
</script>

<template>
  <div class="">
    <!-- Bouton de basculement du menu sur mobile -->
    <div class="md:hidden py-4 flex justify-between items-center bg-primary px-4">
      <h2 v-if="currentUser" class="text-xl font-semibold text-secondary">Bonjour, {{ currentUser.firstName }}</h2>
      <button @click="toggleMobileMenu" class="text-secondary p-2 rounded">
        <Bars3Icon v-if="!isMobileMenuOpen" class="w-6 h-6" />
        <XMarkIcon v-else class="w-6 h-6" />
      </button>
    </div>

    <!-- Navigation et contenu -->
    <div class="flex flex-col md:flex-row">
      <!-- Menu latéral -->
      <UserSidebar :activeTab="activeTab" :currentUser="currentUser" :isMobileMenuOpen="isMobileMenuOpen"
        @setActiveTab="setActiveTab" />

      <!-- Contenu principal -->
      <div class="flex-grow py-6 px-4">
        <!-- Loader -->
        <div v-if="loading" class="h-48 flex items-center justify-center text-secondary italic">
          Chargement en cours...
        </div>

        <!-- Vue d'ensemble -->
        <div v-else-if="activeTab === 'overview'" class="bg-secondary-ghost rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-6">Vue d'ensemble</h2>

          <!-- Statistiques -->
          <UserStats :stats="stats" />

          <!-- Tableau des commandes (desktop) -->
          <OrdersTable :orders="orders" />

          <!-- Cartes des commandes (mobile) -->
          <OrdersCardList :orders="orders" />
        </div>

        <!-- Mes commandes -->
        <div v-else-if="activeTab === 'orders'" class="bg-secondary-ghost rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-6">Mes commandes</h2>
          <p class="text-primary">Liste de toutes vos commandes.</p>

          <OrdersTable :orders="orders" />
          <OrdersCardList :orders="orders" />
        </div>

        <!-- Mon profil -->
        <div v-else-if="activeTab === 'profile'" class="card rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-6">Mon profil</h2>

          <ProfileForm :currentUser="currentUser" :isUpdatingProfile="isUpdatingProfile"
            @toggleUpdateMode="toggleUpdateMode" />
        </div>

        <!-- Paiements -->
        <div v-else-if="activeTab === 'payments'" class="bg-secondary-ghost rounded-lg shadow p-6">
          <h2 class="text-xl font-semibold mb-6">Mes paiements</h2>

          <PaymentsTable :orders="orders" />
        </div>
      </div>
    </div>
  </div>
</template>