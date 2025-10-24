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
    const isRefreshing = ref<boolean>(false)
    const refreshSubscribers: ((token: string) => void)[] = []
    
    // Obtenir les tokens du localStorage
    const getAccessToken = (): string | null => localStorage.getItem('accessToken')
    const getRefreshToken = (): string | null => localStorage.getItem('refreshToken')

    // Mettre à jour les tokens dans le localStorage
    function setTokens(accessToken: string, refreshToken?: string): void {
        localStorage.setItem('accessToken', accessToken)
        
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken)
        }
    }

    // Effacer les tokens du localStorage
    function clearTokens(): void {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
    }

    // Fonction pour rafraîchir le token d'accès
    async function refreshToken(): Promise<string> {
        if (isRefreshing.value) {
            return new Promise((resolve) => {
                refreshSubscribers.push(resolve)
            })
        }

        isRefreshing.value = true
        const storedRefreshToken = getRefreshToken()

        if (!storedRefreshToken) {
            throw new Error('Refresh token non disponible')
        }

        try {
            const response = await fetch(`${apiUrl}/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken: storedRefreshToken })
            })

            const data = await response.json() as AuthResponse

            if (!response.ok) {
                throw new Error(data.message || `Erreur HTTP: ${response.status}`)
            }

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors du rafraîchissement du token')
            }

            if (data.data && data.data.accessToken) {
                const newAccessToken = data.data.accessToken
                const newRefreshToken = data.data.refreshToken
                
                setTokens(newAccessToken, newRefreshToken)
                isAuthenticated.value = true
                
                // Notifier tous les abonnés en attente
                refreshSubscribers.forEach(callback => callback(newAccessToken))
                refreshSubscribers.length = 0
                
                return newAccessToken
            }
            
            throw new Error('Tokens non disponibles dans la réponse')
        } catch (err) {
            console.error("Erreur lors du rafraîchissement du token:", err)
            isAuthenticated.value = false
            currentUser.value = null
            clearTokens()
            throw err
        } finally {
            isRefreshing.value = false
        }
    }

    // Fonction utilitaire pour faire une requête avec gestion du refresh token
    async function fetchWithTokenRefresh(url: string, options: RequestInit): Promise<Response> {
        // Obtenir le token d'accès actuel
        const token = getAccessToken()
        const headers = {
            ...(options.headers || {}),
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }

        // Première tentative avec le token actuel
        let response = await fetch(url, {
            ...options,
            headers
        })

        // Si on reçoit une erreur 401, essayer de rafraîchir le token
        if (response.status === 401 && getRefreshToken()) {
            try {
                // Rafraîchir le token
                const newToken = await refreshToken()
                
                // Réessayer la requête avec le nouveau token
                return fetch(url, {
                    ...options,
                    headers: {
                        ...(options.headers || {}),
                        'Authorization': `Bearer ${newToken}`
                    }
                })
            } catch (refreshError) {
                // Si le rafraîchissement échoue, propager l'erreur
                console.error("Erreur lors du rafraîchissement du token:", refreshError)
                throw refreshError
            }
        }

        return response
    }

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
                // Stocker les deux tokens
                setTokens(data.data.accessToken, data.data.refreshToken)
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
        clearTokens()

        // Réinitialiser l'état
        isAuthenticated.value = false
        currentUser.value = null
    }

    async function getProfile(): Promise<User | null> {
        loading.value = true
        error.value = null

        try {
            const response = await fetchWithTokenRefresh(`${apiUrl}/auth/profile`, {
                method: 'GET'
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
        const token = getAccessToken()

        if (!token) {
            isAuthenticated.value = false
            currentUser.value = null
            return false
        }

        try {
            const response = await fetchWithTokenRefresh(`${apiUrl}/auth/profile`, {
                method: 'GET'
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
            clearTokens()
            return false
        }
    }

    async function updateProfile(profileData: ProfileUpdateData): Promise<AuthResponse> {
        loading.value = true
        error.value = null

        try {
            const response = await fetchWithTokenRefresh(`${apiUrl}/auth/profile`, {
                method: 'PUT',
                headers: {
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
        resetState,
        refreshToken // Exposer la méthode de rafraîchissement
    };
})