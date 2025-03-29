import { defineStore } from "pinia"
import { ref } from "vue"
import { User } from "../types/user"
import { getAuthHeaders } from "@/utils/http"

export const useUserStore = defineStore('user', () => {
    const users = ref<User[]>([])
    const user = ref<User | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const apiUrl = import.meta.env.VITE_API_URL

    async function getUsers() {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${apiUrl}/users`, {
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }

            const data = await response.json()

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la récupération des utilisateurs')
            }

            users.value = data.data
        } catch (err) {
            console.error("Erreur lors de la récupération des utilisateurs:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
        } finally {
            loading.value = false
        }
    }

    async function getUserById(id: string) {
        loading.value = true
        error.value = null
        user.value = null

        try {
            const response = await fetch(`${apiUrl}/users/${id}`, {
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }

            const data = await response.json()

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la récupération de l\'utilisateur')
            }

            user.value = data.data.user || data.data
        } catch (err) {
            console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
        } finally {
            loading.value = false
        }
    }

    async function createUser(newUser: User) {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${apiUrl}/users`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    email: newUser.email,
                    role: newUser.role,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                    password: newUser.password,
                    phone: newUser.phone,
                    company: newUser.company
                })
            })

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }

            const data = await response.json()

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la création de l\'utilisateur')
            }

            // Actualiser les utilisateurs après création
            await getUsers()

            return data.data
        } catch (err) {
            console.error("Erreur lors de la création de l'utilisateur:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err // Propager l'erreur pour la gérer au niveau du composant
        } finally {
            loading.value = false
        }
    }

    async function updateUser(id: string, updatedUser: Partial<User>) {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${apiUrl}/users/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updatedUser)
            })

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }

            const data = await response.json()

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la mise à jour de l\'utilisateur')
            }

            // Mettre à jour l'utilisateur dans le store si c'est celui actuellement affiché
            if (user.value && user.value.id === id) {
                user.value = data.data
            }

            // Actualiser la liste des utilisateurs
            await getUsers()

            return data.data
        } catch (err) {
            console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteUser(id: string) {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${apiUrl}/users/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }

            const data = await response.json()

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la suppression de l\'utilisateur')
            }

            // Réinitialiser l'utilisateur sélectionné s'il correspond à celui supprimé
            if (user.value && user.value.id === id) {
                user.value = null
            }

            // Actualiser la liste des utilisateurs
            await getUsers()

            return data.data
        } catch (err) {
            console.error(`Erreur lors de la suppression de l'utilisateur ${id}:`, err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    function resetState() {
        users.value = []
        user.value = null
        loading.value = false
        error.value = null
    }

    return {
        users,
        user,
        loading,
        error,
        getUsers,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
        resetState
    }
})