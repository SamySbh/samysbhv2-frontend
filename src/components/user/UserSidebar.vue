<script setup lang="ts">
defineProps<{
    activeTab: 'overview' | 'orders' | 'profile' | 'payments';
    currentUser: any | null;
    isMobileMenuOpen: boolean;
}>();

const emit = defineEmits<{
    (e: 'setActiveTab', tab: 'overview' | 'orders' | 'profile' | 'payments'): void;
}>();

const setActiveTab = (tab: 'overview' | 'orders' | 'profile' | 'payments') => {
    emit('setActiveTab', tab);
};
</script>

<template>
    <aside :class="[
        'bg-primary shadow-lg',
        'md:w-64 md:block',
        isMobileMenuOpen ? 'block' : 'hidden'
    ]">
        <div class="p-4 border-b border-accent hidden md:block">
            <h2 v-if="currentUser" class="text-xl font-semibold text-secondary">Bonjour, {{ currentUser.firstName }}
            </h2>
            <p class="text-secondary text-xs font-light mt-1">Bienvenue sur votre tableau de bord</p>
        </div>
        <nav class="p-4 space-y-2">
            <button @click="setActiveTab('overview')" :class="[
                'w-full text-left px-4 py-3 rounded transition-colors',
                activeTab === 'overview'
                    ? 'bg-accent text-secondary font-medium'
                    : 'hover:bg-secondary-ghost text-white hover:text-accent'
            ]" type="button">
                Vue d'ensemble
            </button>
            <button @click="setActiveTab('orders')" :class="[
                'w-full text-left px-4 py-3 rounded transition-colors',
                activeTab === 'orders'
                    ? 'bg-accent text-secondary font-medium'
                    : 'hover:bg-secondary-ghost text-white hover:text-accent'
            ]" type="button">
                Mes commandes
            </button>
            <button @click="setActiveTab('payments')" :class="[
                'w-full text-left px-4 py-3 rounded transition-colors',
                activeTab === 'payments'
                    ? 'bg-accent text-secondary font-medium'
                    : 'hover:bg-secondary-ghost text-white hover:text-accent'
            ]" type="button">
                Mes paiements
            </button>
            <button @click="setActiveTab('profile')" :class="[
                'w-full text-left px-4 py-3 rounded transition-colors',
                activeTab === 'profile'
                    ? 'bg-accent text-secondary font-medium'
                    : 'hover:bg-secondary-ghost text-white hover:text-accent'
            ]" type="button">
                Mon profil
            </button>
        </nav>
    </aside>
</template>