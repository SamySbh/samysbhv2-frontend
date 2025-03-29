<script setup lang="ts">
// Définition des props et emits
defineProps({
    activeSection: {
        type: String,
        required: true
    },
    // Nouvelle prop pour contrôler la visibilité sur mobile
    isMobileOpen: {
        type: Boolean,
        default: false
    }
});

// Événements pour changer de section et fermer le menu mobile
const emit = defineEmits([
    'changeSection',
    'closeMobileMenu' // Ajout d'un nouvel événement
]);

// Méthode pour changer de section
const setActiveSection = (section: 'users' | 'orders' | 'orderItems' | 'services') => {
    emit('changeSection', section);
    // Fermer le menu automatiquement sur mobile
    emit('closeMobileMenu');
};
</script>

<template>
    <aside :class="[
        'bg-primary text-white shadow-lg',
        'md:w-64 md:block', // Toujours visible sur desktop
        isMobileOpen ? 'block' : 'hidden' // Visibilité contrôlée sur mobile
    ]">
        <div class="p-4 border-b border-accent">
            <h2 class="text-xl font-semibold text-secondary">Tableau de bord</h2>
        </div>

        <nav class="p-4 space-y-2">
            <button @click="setActiveSection('users')" :class="[
                'w-full text-left px-4 py-3 rounded transition-colors',
                activeSection === 'users'
                    ? 'bg-accent text-secondary font-medium'
                    : 'hover:bg-secondary-ghost text-white hover:text-accent'
            ]" type="button">
                Utilisateurs
            </button>

            <button @click="setActiveSection('orders')" :class="[
                'w-full text-left px-4 py-3 rounded transition-colors',
                activeSection === 'orders'
                    ? 'bg-accent text-secondary font-medium'
                    : 'hover:bg-secondary-ghost text-white hover:text-accent'
            ]" type="button">
                Commandes
            </button>

            <button @click="setActiveSection('orderItems')" :class="[
                'w-full text-left px-4 py-3 rounded transition-colors',
                activeSection === 'orderItems'
                    ? 'bg-accent text-secondary font-medium'
                    : 'hover:bg-secondary-ghost text-white hover:text-accent'
            ]" type="button">
                Items de commande
            </button>

            <button @click="setActiveSection('services')" :class="[
                'w-full text-left px-4 py-3 rounded transition-colors',
                activeSection === 'services'
                    ? 'bg-accent text-secondary font-medium'
                    : 'hover:bg-secondary-ghost text-white hover:text-accent'
            ]" type="button">
                Services
            </button>
        </nav>
    </aside>
</template>