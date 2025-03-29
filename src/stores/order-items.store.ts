import { defineStore } from "pinia"
import { ref } from "vue"
import { OrderItem } from "../types/order-item"
import { getAuthHeaders } from "@/utils/http"

export const useOrderItemStore = defineStore('orderItem', () => {
    const orderItems = ref<OrderItem[]>([])
    const orderItem = ref<OrderItem | null>(null)
    const loading = ref<boolean>(false)
    const error = ref<string | null>(null)
    const apiUrl = import.meta.env.VITE_API_URL

    async function getOrderItems() {
        loading.value = true
        error.value = null
        
        try {
            const response = await fetch(`${apiUrl}/order-items`, {
                headers: getAuthHeaders()
            })
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la récupération des items de commande')
            }
            
            orderItems.value = data.data
        } catch (err) {
            console.error("Erreur lors de la récupération des items de commande:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
        } finally {
            loading.value = false
        }
    }

    async function getOrderItemById(id: string) {
        loading.value = true
        error.value = null
        orderItem.value = null
        
        try {
            const response = await fetch(`${apiUrl}/order-items/${id}`, {
                headers: getAuthHeaders()
            })
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la récupération de l\'item de commande')
            }
            
            orderItem.value = data.data.orderItem || data.data
        } catch (err) {
            console.error(`Erreur lors de la récupération de l'item de commande ${id}:`, err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
        } finally {
            loading.value = false
        }
    }

    async function getOrderItemsByOrderId(orderId: string) {
        loading.value = true
        error.value = null
        
        try {
            const response = await fetch(`${apiUrl}/orders/${orderId}`, {
                headers: getAuthHeaders()
            })
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la récupération des items de la commande')
            }
            
            // Si la commande a des items, on les récupère
            if (data.data.order && data.data.order.orderItems) {
                orderItems.value = data.data.order.orderItems
            } else if (data.data.orderItems) {
                orderItems.value = data.data.orderItems
            } else {
                orderItems.value = []
            }
            
            return orderItems.value
        } catch (err) {
            console.error(`Erreur lors de la récupération des items de la commande ${orderId}:`, err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            return []
        } finally {
            loading.value = false
        }
    }

    async function createOrderItem(newOrderItem: OrderItem) {
        loading.value = true
        error.value = null
        
        try {
            const response = await fetch(`${apiUrl}/order-items`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    unitAmount: newOrderItem.unitAmount,
                    totalAmount: newOrderItem.totalAmount,
                    quantity: newOrderItem.quantity,
                    orderId: newOrderItem.orderId,
                    serviceId: newOrderItem.serviceId
                })
            })
            
            if (!response.ok) {  
                throw new Error(`Erreur HTTP: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la création de l\'item de commande')
            }
            
            // Actualiser les items après création
            if (newOrderItem.orderId) {
                await getOrderItemsByOrderId(newOrderItem.orderId)
            } else {
                await getOrderItems()
            }
            
            return data.data
        } catch (err) {
            console.error("Erreur lors de la création de l'item de commande:", err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err // Propager l'erreur pour la gérer au niveau du composant
        } finally {
            loading.value = false
        }
    }

    async function updateOrderItem(id: string, updatedOrderItem: Partial<OrderItem>) {
        loading.value = true
        error.value = null
        
        try {
            const response = await fetch(`${apiUrl}/order-items/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updatedOrderItem)
            })
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la mise à jour de l\'item de commande')
            }
            
            // Mettre à jour l'item dans le store si c'est celui actuellement affiché
            if (orderItem.value && orderItem.value.id === id) {
                orderItem.value = data.data
            }
            
            // Actualiser la liste des items
            if (updatedOrderItem.orderId) {
                await getOrderItemsByOrderId(updatedOrderItem.orderId)
            } else if (orderItem.value?.orderId) {
                await getOrderItemsByOrderId(orderItem.value.orderId)
            } else {
                await getOrderItems()
            }
            
            return data.data
        } catch (err) {
            console.error(`Erreur lors de la mise à jour de l'item de commande ${id}:`, err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    async function deleteOrderItem(id: string, orderId?: string) {
        loading.value = true
        error.value = null
        
        try {
            const response = await fetch(`${apiUrl}/order-items/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`)
            }
            
            const data = await response.json()
            
            if (data.success === false) {
                throw new Error(data.message || 'Erreur lors de la suppression de l\'item de commande')
            }
            
            // Réinitialiser l'item sélectionné s'il correspond à celui supprimé
            if (orderItem.value && orderItem.value.id === id) {
                orderItem.value = null
            }
            
            // Actualiser la liste des items
            if (orderId) {
                await getOrderItemsByOrderId(orderId)
            } else if (data.data.orderId) {
                await getOrderItemsByOrderId(data.data.orderId)
            } else {
                await getOrderItems()
            }
            
            return data.data
        } catch (err) {
            console.error(`Erreur lors de la suppression de l'item de commande ${id}:`, err)
            error.value = err instanceof Error ? err.message : 'Erreur inconnue'
            throw err
        } finally {
            loading.value = false
        }
    }

    function resetState() {
        orderItems.value = []
        orderItem.value = null
        loading.value = false
        error.value = null
    }

    return { 
        orderItems, 
        orderItem, 
        loading, 
        error, 
        getOrderItems,
        getOrderItemById,
        getOrderItemsByOrderId,
        createOrderItem,
        updateOrderItem,
        deleteOrderItem,
        resetState
    }
})