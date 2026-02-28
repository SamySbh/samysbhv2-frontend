<script setup lang="ts">
import { ref } from 'vue';
import { Bars3Icon, XMarkIcon } from '@heroicons/vue/24/solid'; // Importez ces icônes
import AdminSidebar from '@/components/admin/AdminSidebar.vue';
import UserList from '@/components/admin/users/UserList.vue';
import OrderList from '@/components/admin/orders/OrderList.vue';
import OrderItemList from '@/components/admin/order-items/OrderItemList.vue';
import ServiceList from '@/components/admin/services/ServiceList.vue';
import ProjectRequestList from '@/components/admin/project-requests/ProjectRequestList.vue';
import OrdersAdmin from '@/components/admin/orders/OrdersAdmin.vue';

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

// La section active du dashboard
const activeSection = ref<'users' | 'orders' | 'ordersAdmin' | 'orderItems' | 'services' | 'projectRequests'>('users');

// Méthode pour changer de section
const changeSection = (section: typeof activeSection.value) => {
    activeSection.value = section;
    // La fermeture du menu est maintenant gérée dans le composant AdminSidebar
};
</script>

<template>
    <div class="flex flex-col h-screen overflow-hidden">
        <!-- Bouton de basculement du menu sur mobile -->
        <div class="md:hidden py-4 px-6 flex justify-between items-center bg-primary">
            <h1 class="text-xl font-semibold text-secondary">Administration</h1>
            <button @click="toggleMobileMenu" class="text-secondary p-2 rounded hover:bg-secondary-ghost">
                <Bars3Icon v-if="!isMobileMenuOpen" class="w-6 h-6" />
                <XMarkIcon v-else class="w-6 h-6" />
            </button>
        </div>

        <div class="flex flex-1 overflow-hidden">
            <!-- Sidebar avec visibilité contrôlée sur mobile -->
            <AdminSidebar :active-section="activeSection" @change-section="changeSection"
                :is-mobile-open="isMobileMenuOpen" @close-mobile-menu="closeMobileMenu" />

            <!-- Contenu principal -->
            <div class="flex-1 overflow-auto">
                <div class="p-6">
                    <h1 class="text-2xl font-semibold text-secondary mb-6">Gestion administrateur du site</h1>

                    <!-- Sections inchangées -->
                    <div v-if="activeSection === 'users'">
                        <UserList />
                    </div>

                    <div v-else-if="activeSection === 'orders'">
                        <OrderList />
                    </div>

                    <div v-else-if="activeSection === 'orderItems'">
                        <OrderItemList />
                    </div>

                    <div v-else-if="activeSection === 'services'">
                        <ServiceList />
                    </div>

                    <div v-else-if="activeSection === 'ordersAdmin'">
                        <OrdersAdmin />
                    </div>

                    <div v-else-if="activeSection === 'projectRequests'">
                        <ProjectRequestList />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>