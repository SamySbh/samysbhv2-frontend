import { defineStore } from "pinia"
import { ref } from "vue"
import { User } from "@/types"
import { LoginCredentials, RegisterData, ProfileUpdateData, AuthResponse } from "@/types"
import { getAuthHeaders } from "@/utils/http"

export const useAuthStore = defineStore('auth', () => {
    const currentUser = ref<User | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const isAuthenticated = ref<boolean>(false)
    const apiUrl = import.meta.env.VITE_API_URL

    async function register(userData: RegisterData): Promise<AuthResponse> {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            })

            // Lire la réponse, qu'elle soit réussie ou non
            const data = await response.json() as AuthResponse

            if (!response.ok) {
                throw new Error(data.message || `Erreur HTTP: ${response.status}`)
            }

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de l\'inscription')
            }

            return data
        } catch (err) {
            console.error("Erreur lors de l'inscription:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function login(credentials: LoginCredentials): Promise<AuthResponse> {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials)
            })

            // Lire la réponse, qu'elle soit réussie ou non
            const data = await response.json() as AuthResponse

            if (!response.ok) {
                throw new Error(data.message || `Erreur HTTP: ${response.status}`)
            }

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la connexion')
            }

            if (data.data && data.data.accessToken) {
                localStorage.setItem('accessToken', data.data.accessToken)
                isAuthenticated.value = true
                
                if (data.data.user) {
                    currentUser.value = data.data.user
                }
            }

            return data
        } catch (err) {
            console.error("Erreur lors de la connexion:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function logout(): Promise<void> {
        // Supprimer les tokens du localStorage
        localStorage.removeItem('accessToken')

        // Réinitialiser l'état
        isAuthenticated.value = false
        currentUser.value = null
    }

    async function getProfile(): Promise<User | null> {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${apiUrl}/auth/profile`, {
                headers: getAuthHeaders()
            })

            // Lire la réponse, qu'elle soit réussie ou non
            const data = await response.json() as AuthResponse

            if (!response.ok) {
                throw new Error(data.message || `Erreur HTTP: ${response.status}`)
            }

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la récupération du profil')
            }

            if (data.data && data.data.user) {
                currentUser.value = data.data.user
                isAuthenticated.value = true
                return data.data.user
            }
            
            throw new Error('Profil utilisateur non disponible')
        } catch (err) {
            console.error("Erreur lors de la récupération du profil:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function checkAuth(): Promise<boolean> {
        const token = localStorage.getItem('accessToken')

        if (!token) {
            isAuthenticated.value = false
            currentUser.value = null
            return false
        }

        try {
            const response = await fetch(`${apiUrl}/auth/profile`, {
                headers: getAuthHeaders()
            })

            // Lire la réponse, qu'elle soit réussie ou non
            const data = await response.json() as AuthResponse

            if (!response.ok) {
                throw new Error(data.message || `Erreur HTTP: ${response.status}`)
            }

            if (data.success && data.data && data.data.user) {
                isAuthenticated.value = true
                currentUser.value = data.data.user
                return true
            } else {
                throw new Error(data.message || 'Profil utilisateur non disponible')
            }
        } catch (err) {
            console.error("Erreur lors de la vérification d'authentification:", err)
            isAuthenticated.value = false
            currentUser.value = null
            localStorage.removeItem('accessToken')
            return false
        }
    }

    async function updateProfile(profileData: ProfileUpdateData): Promise<AuthResponse> {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${apiUrl}/auth/profile`, {
                method: 'PUT',
                headers: {
                    ...getAuthHeaders(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(profileData)
            })

            // Lire la réponse, qu'elle soit réussie ou non
            const data = await response.json() as AuthResponse

            if (!response.ok) {
                throw new Error(data.message || `Erreur HTTP: ${response.status}`)
            }

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la mise à jour du profil')
            }

            if (data.data && data.data.user) {
                currentUser.value = data.data.user
            }

            return data
        } catch (err) {
            console.error("Erreur lors de la mise à jour du profil:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    function resetState(): void {
        currentUser.value = null
        isAuthenticated.value = false
        loading.value = false
        error.value = null
    }

    return {
        currentUser,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        getProfile,
        checkAuth,
        updateProfile,
        resetState
    };
})