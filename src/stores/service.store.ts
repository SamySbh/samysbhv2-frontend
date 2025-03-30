import { defineStore } from "pinia"
import { ref } from "vue"
import { Service } from "@/types"
import { getAuthHeaders } from "@/utils/http"

export const useServiceStore = defineStore('service', () => {
    const services = ref<Service[]>([])
    const service = ref<Service | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const apiUrl = import.meta.env.VITE_API_URL

    async function getServices() {
        loading.value = true
        error.value = null
        
        try {
            const response = await fetch(`${apiUrl}/services`, {
                headers: getAuthHeaders()
            })
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la récupération des services')
            }
            
            services.value = data.data
        } catch (err) {
            console.error("Erreur lors de la récupération des services:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
        } finally {
            loading.value = false
        }
    }

    async function getServiceById(id: string) {
        loading.value = true
        error.value = null
        service.value = null
        
        try {
            const response = await fetch(`${apiUrl}/services/${id}`, {
                headers: getAuthHeaders()
            })
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la récupération du service')
            }
            
            service.value = data.data.service || data.data
        } catch (err) {
            console.error(`Erreur lors de la récupération du service ${id}:`, err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
        } finally {
            loading.value = false
        }
    }

    async function createService(newService: Service) {
        loading.value = true
        error.value = null
        
        try {
            const options: RequestInit = {
                method: 'POST',
                body: JSON.stringify(newService),
                headers: getAuthHeaders()
            };
            
            const response = await fetch(`${apiUrl}/services`, options)
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la création du service')
            }
            
            // Actualiser la liste des services
            await getServices()
            
            return data.data
        } catch (err) {
            console.error("Erreur lors de la création du service:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err // Propager l'erreur pour la gérer au niveau du composant
        } finally {
            loading.value = false
        }
    }

    async function updateService(id: string, updatedService: Partial<Service>) {
        loading.value = true
        error.value = null
        
        try {
            const options: RequestInit = {
                method: 'PUT',
                body: JSON.stringify(updatedService),
                headers: getAuthHeaders()
            };
            
            const response = await fetch(`${apiUrl}/services/${id}`, options)
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la mise à jour du service')
            }
            
            // Mettre à jour le service dans le store
            if (service.value && service.value.id === id) {
                service.value = data.data
            }
            
            // Actualiser la liste des services
            await getServices()
            
            return data.data
        } catch (err) {
            console.error(`Erreur lors de la mise à jour du service ${id}:`, err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteService(id: string) {
        loading.value = true
        error.value = null
        
        try {
            const options: RequestInit = {
                method: 'DELETE',
                headers: getAuthHeaders()
            };
            
            const response = await fetch(`${apiUrl}/services/${id}`, options)
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la suppression du service')
            }
            
            // Réinitialiser le service sélectionné s'il correspond à celui supprimé
            if (service.value && service.value.id === id) {
                service.value = null
            }
            
            // Actualiser la liste des services
            await getServices()
            
            return data.data
        } catch (err) {
            console.error(`Erreur lors de la suppression du service ${id}:`, err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    function resetState() {
        services.value = []
        service.value = null
        loading.value = false
        error.value = null
    }

    return { 
        services, 
        service, 
        loading, 
        error, 
        getServices, 
        getServiceById, 
        createService,
        updateService,
        deleteService,
        resetState
    }
})