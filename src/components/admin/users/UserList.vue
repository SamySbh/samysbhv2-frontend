<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/user.store';
import { storeToRefs } from 'pinia';
import { User } from '@/types/user';
import UserCreate from './UserCreate.vue';
import UserEdit from './UserEdit.vue';
import BaseButton from '@/components/ui/BaseButton.vue';
import BaseBadge from '@/components/ui/BaseBadge.vue';

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
            <BaseButton variant="accent" @click="openCreateModal">
                Ajouter un utilisateur
            </BaseButton>
        </div>

        <!-- Loader -->
        <div v-if="loading" class="text-center py-8 text-secondary">
            Chargement des utilisateurs...
        </div>

        <!-- Tableau des utilisateurs -->
        <div v-else class="table-container">
            <table class="min-w-full">
                <thead class="table-header">
                    <tr>
                        <th class="table-header-cell">Nom</th>
                        <th class="table-header-cell">Email</th>
                        <th class="table-header-cell">Rôle</th>
                        <th class="table-header-cell">Téléphone</th>
                        <th class="table-header-cell text-right">Actions</th>
                    </tr>
                </thead>
                <tbody class="table-body">
                    <tr v-for="user in users" :key="user.id" class="table-row">
                        <td class="table-cell">
                            {{ user.firstName }} {{ user.lastName }}
                        </td>
                        <td class="table-cell">
                            {{ user.email }}
                        </td>
                        <td class="table-cell">
                            <BaseBadge :variant="user.role === 'ADMIN' ? 'emphasis' : user.role === 'USER' ? 'success' : 'error'">
                                {{ user.role }}
                            </BaseBadge>
                        </td>
                        <td class="table-cell">
                            {{ user.phone || 'Non renseigné' }}
                        </td>
                        <td class="table-cell text-right space-x-2">
                            <BaseButton variant="accent" size="sm" @click="openEditModal(user)">
                                Modifier
                            </BaseButton>
                            <BaseButton variant="danger" size="sm" @click="deleteUser(user.id as string)">
                                Supprimer
                            </BaseButton>
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