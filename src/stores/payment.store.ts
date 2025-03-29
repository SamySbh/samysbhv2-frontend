import { defineStore } from "pinia"
import { ref } from "vue"
import { CheckoutSessionResponse } from "@/types"
import { getAuthHeaders } from "@/utils/http"

export const usePaymentStore = defineStore('payment', () => {
    const sessionUrl = ref<string | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const paymentStatus = ref<string | null>(null)
    const apiUrl = import.meta.env.VITE_API_URL

    async function createCheckoutSession(orderId: string): Promise<CheckoutSessionResponse> {
        loading.value = true
        error.value = null
        sessionUrl.value = null
        
        try {
            const response = await fetch(`${apiUrl}/payments/create-checkout-session`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ orderId })
            })
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la création de la session de paiement')
            }
            
            sessionUrl.value = data.data.sessionUrl
            return data.data.sessionUrl
        } catch (err) {
            console.error("Erreur lors de la création de la session de paiement:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function checkPaymentStatus(sessionId: string) {
        loading.value = true
        error.value = null
        
        try {
            const response = await fetch(`${apiUrl}/payments/status/${sessionId}`, {
                headers: getAuthHeaders()
            })
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la vérification du statut du paiement')
            }
            
            paymentStatus.value = data.data.status
            return data.data
        } catch (err) {
            console.error("Erreur lors de la vérification du statut du paiement:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function handlePaymentSuccess(sessionId: string) {
        // Cette fonction est appelée lorsque le paiement est réussi
        // et que l'utilisateur est redirigé vers la page de succès
        
        loading.value = true
        error.value = null
        
        try {
            // Mettre à jour le statut local
            paymentStatus.value = 'success'
            
            return { success: true, sessionId }
        } catch (err) {
            console.error("Erreur lors du traitement du succès du paiement:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function handlePaymentCancel() {
        // Cette fonction est appelée lorsque le paiement est annulé
        // et que l'utilisateur est redirigé vers la page d'annulation
        
        loading.value = true
        error.value = null
        
        try {
            // Mettre à jour le statut local
            paymentStatus.value = 'canceled'
            
            return { success: true, status: 'canceled' }
        } catch (err) {
            console.error("Erreur lors du traitement de l'annulation du paiement:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    function resetState() {
        sessionUrl.value = null
        paymentStatus.value = null
        loading.value = false
        error.value = null
    }

    return {
        sessionUrl,
        paymentStatus,
        loading,
        error,
        createCheckoutSession,
        checkPaymentStatus,
        handlePaymentSuccess,
        handlePaymentCancel,
        resetState
    }
})
