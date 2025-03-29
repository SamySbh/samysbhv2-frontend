<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user.store';
import { storeToRefs } from 'pinia';
import { User } from '@/types/user';
import UserCreate from './UserCreate.vue';
import UserEdit from './UserEdit.vue';

// Store utilisateur
const userStore = useUserStore();
const { users, loading } = storeToRefs(userStore);

// État local
const showCreateModal = ref(false);
const showEditModal = ref(false);
const selectedUser = ref<User | null>(null);

// Chargement des utilisateurs
onMounted(async () => {
    try {
        await userStore.getUsers();
    } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
    }
});

// Ouvrir le modal de création
const openCreateModal = () => {
    showCreateModal.value = true;
};

// Ouvrir le modal d'édition
const openEditModal = (user: User) => {
    selectedUser.value = user;
    showEditModal.value = true;
};

// Fermer les modals
const closeModals = () => {
    showCreateModal.value = false;
    showEditModal.value = false;
    selectedUser.value = null;
};

// Supprimer un utilisateur
const deleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
        return;
    }

    try {
        await userStore.deleteUser(userId);
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'utilisateur:', error);
    }
};

// Rafraîchir la liste
const refreshList = async () => {
    try {
        await userStore.getUsers();
        closeModals();
    } catch (error) {
        console.error('Erreur lors du rafraîchissement de la liste:', error);
    }
};
</script>

<template>
    <div>
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-secondary">Gestion des utilisateurs</h2>
            <button @click="openCreateModal"
                class="bg-accent text-secondary px-4 py-2 rounded shadow hover:bg-accent/90 transition-colors">
                Ajouter un utilisateur
            </button>
        </div>

        <!-- Loader -->
        <div v-if="loading" class="text-center py-8 text-secondary">
            Chargement des utilisateurs...
        </div>

        <!-- Tableau des utilisateurs -->
        <div v-else class="bg-white rounded-lg shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-300">
                <thead class="bg-emphasis-ghost">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Nom
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Email
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Rôle
                        </th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                            Téléphone</th>
                        <th class="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">
                            Actions</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-300">
                    <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap">
                            {{ user.firstName }} {{ user.lastName }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            {{ user.email }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <span :class="[
                                'px-2 py-1 text-xs rounded-full',
                                user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                    user.role === 'USER' ? 'bg-green-100 text-green-800' :
                                        'bg-red-100 text-red-800'
                            ]">
                                {{ user.role }}
                            </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            {{ user.phone || 'Non renseigné' }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                            <button @click="openEditModal(user)"
                                class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600">
                                Modifier
                            </button>
                            <button @click="deleteUser(user.id as string)"
                                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
                                Supprimer
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal de création -->
        <UserCreate v-if="showCreateModal" @close="closeModals" @user-created="refreshList" />

        <!-- Modal d'édition -->
        <UserEdit v-if="showEditModal && selectedUser" :user="selectedUser" @close="closeModals"
            @user-updated="refreshList" />
    </div>
</template>