import { defineStore } from "pinia"
import { ref } from "vue"
import { Order } from "../types"
import { OrderItemInput } from "../types/order-item"
import { getAuthHeaders } from "@/utils/http"
import paymentApi from "@/api/payment.api"

export const useOrderStore = defineStore('order', () => {
    const orders = ref<Order[]>([])
    const order = ref<Order | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const apiUrl = import.meta.env.VITE_API_URL

    async function getOrders() {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${apiUrl}/orders/my-orders`, {
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }

            const data = await response.json()

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la récupération des commandes')
            }

            orders.value = data.data
        } catch (err) {
            console.error("Erreur lors de la récupération des commandes:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
        } finally {
            loading.value = false
        }
    }

    async function getOrderById(id: string) {
        loading.value = true
        error.value = null
        order.value = null

        try {
            const response = await fetch(`${apiUrl}/orders/${id}`, {
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }

            const data = await response.json()

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la récupération de la commande')
            }

            order.value = data.data.order || data.data
        } catch (err) {
            console.error(`Erreur lors de la récupération de la commande ${id}:`, err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
        } finally {
            loading.value = false
        }
    }

    async function getOrderBySessionId(sessionId: string) {
        loading.value = true
        error.value = null
        order.value = null

        try {
            const response = await fetch(`${apiUrl}/orders/by-session/${sessionId}`, {
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }

            const data = await response.json()

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la récupération de la commande')
            }

            order.value = data.data.order || data.data
            return order.value
        } catch (err) {
            console.error(`Erreur lors de la récupération de la commande avec sessionId ${sessionId}:`, err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function createOrder(newOrder: Order) {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${apiUrl}/orders`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    statusMain: newOrder.statusMain,
                    statusPayment: newOrder.statusPayment,
                    totalAmount: newOrder.totalAmount,
                    depositAmount: newOrder.depositAmount,
                    deadlineDate: newOrder.deadlineDate,
                    userId: newOrder.userId
                })
            })

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }

            const data = await response.json()

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la création de la commande')
            }

            // Actualiser les commandes après création
            await getOrders()

            return data.data
        } catch (err) {
            console.error("Erreur lors de la création de la commande:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err // Propager l'erreur pour la gérer au niveau du composant
        } finally {
            loading.value = false
        }
    }

    async function createOrderWithItems(newOrderWithItems: Omit<Order, 'orderItems'> & { orderItems: OrderItemInput[] }) {
        loading.value = true;
        error.value = null;

        try {
            const response = await fetch(`${apiUrl}/orders/with-items`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(newOrderWithItems)
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la création de la commande');
            }

            return data.data;
        } catch (err) {
            console.error("Erreur lors de la création de la commande:", err);
            error.value = err instanceof Error ? err.message : 'Erreur inconnue';
            throw err;
        } finally {
            loading.value = false;
        }
    }

    async function updateOrder(id: string, updatedOrder: Partial<Order>) {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${apiUrl}/orders/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updatedOrder)
            })

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }

            const data = await response.json()

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la mise à jour de la commande')
            }

            // Mettre à jour la commande dans le store si c'est celle actuellement affichée
            if (order.value && order.value.id === id) {
                order.value = data.data
            }

            // Actualiser la liste des commandes
            await getOrders()

            return data.data
        } catch (err) {
            console.error(`Erreur lors de la mise à jour de la commande ${id}:`, err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteOrder(id: string) {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${apiUrl}/orders/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }

            const data = await response.json()

            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la suppression de la commande')
            }

            // Réinitialiser la commande sélectionnée si elle correspond à celle supprimée
            if (order.value && order.value.id === id) {
                order.value = null
            }

            // Actualiser la liste des commandes
            await getOrders()

            return data.data
        } catch (err) {
            console.error(`Erreur lors de la suppression de la commande ${id}:`, err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function createCheckoutSession(orderId: string) {
        loading.value = true
        error.value = null

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

            return data.data.sessionUrl
        } catch (err) {
            console.error("Erreur lors de la création de la session de paiement:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function generateDepositPaymentLink(orderId: string) {
        loading.value = true
        error.value = null

        try {
            const sessionData = await paymentApi.createDepositSession(orderId)

            return {
                url: sessionData.url,
                sessionId: sessionData.sessionId
            }
        } catch (err) {
            console.error('Erreur génération lien acompte:', err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function generateFinalPaymentLink(orderId: string) {
        loading.value = true
        error.value = null

        try {
            const sessionData = await paymentApi.createFinalSession(orderId)

            return {
                url: sessionData.url,
                sessionId: sessionData.sessionId
            }
        } catch (err) {
            console.error('Erreur génération lien solde:', err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    function resetState() {
        orders.value = []
        order.value = null
        loading.value = false
        error.value = null
    }

    return {
        orders,
        order,
        loading,
        error,
        getOrders,
        getOrderById,
        getOrderBySessionId,
        createOrder,
        createOrderWithItems,
        updateOrder,
        deleteOrder,
        createCheckoutSession,
        generateDepositPaymentLink,
        generateFinalPaymentLink,
        resetState
    }
})