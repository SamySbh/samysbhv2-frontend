import { defineStore } from "pinia"
import { ref, computed, watch } from "vue"
import { Service } from "../types/service"
import { CartItem, CartOrderData } from "../types/cart"

export const useCartStore = defineStore('cart', () => {
    // Charger le panier depuis le localStorage au démarrage
    const loadSavedCart = (): CartItem[] => {
        const savedCart = localStorage.getItem('user_cart')
        if (savedCart) {
            try {
                return JSON.parse(savedCart)
            } catch (e) {
                console.error('Erreur lors du chargement du panier:', e)
                return []
            }
        }
        return []
    }

    const cartItems = ref<CartItem[]>(loadSavedCart())
    const itemJustAdded = ref<Boolean>(false)
    
    // Sauvegarder le panier dans localStorage à chaque changement
    watch(cartItems, (newItems) => {
        localStorage.setItem('user_cart', JSON.stringify(newItems))
    }, { deep: true })
    
    // Calculer le total du panier
    const cartTotal = computed(() => {
        return cartItems.value.reduce((total, item) => total + item.totalAmount, 0)
    })
    
    // Nombre d'articles dans le panier
    const itemCount = computed(() => {
        return cartItems.value.reduce((count, item) => count + item.quantity, 0)
    })
    
    // Ajouter un service au panier
    function addToCart(service: Service, quantity: number = 1) {
        const existingItem = cartItems.value.find(item => item.serviceId === service.id)
        
        if (existingItem) {
            // Mettre à jour la quantité et le montant total
            existingItem.quantity += quantity
            existingItem.totalAmount = existingItem.unitAmount * existingItem.quantity
        } else {
            // Ajouter un nouvel article
            cartItems.value.push({
                serviceId: service.id as string,
                service,
                quantity,
                unitAmount: service.basePrice,
                totalAmount: service.basePrice * quantity
            })
        }
                // Signaler qu'un item vient d'être ajouté
                itemJustAdded.value = true
        
                // Réinitialiser le signal après un court délai
                setTimeout(() => {
                    itemJustAdded.value = false
                }, 300)
    }
    
    // Mettre à jour la quantité d'un article
    function updateQuantity(serviceId: string, quantity: number) {
        const item = cartItems.value.find(item => item.serviceId === serviceId)
        if (item) {
            item.quantity = Math.max(1, quantity) // Minimum 1
            item.totalAmount = item.unitAmount * item.quantity
        }
    }
    
    // Supprimer un article du panier
    function removeFromCart(serviceId: string) {
        const index = cartItems.value.findIndex(item => item.serviceId === serviceId)
        if (index !== -1) {
            cartItems.value.splice(index, 1)
        }
    }
    
    // Vider le panier
    function clearCart() {
        cartItems.value = []
    }
    
    // Convertir le panier en commande
    function prepareOrderData(userId: string): CartOrderData {
        if (cartItems.value.length === 0) {
            throw new Error('Le panier est vide')
        }
        
        const totalAmount = cartTotal.value
        const depositAmount = totalAmount * 0.3 // 30% d'acompte par exemple
        
        const orderData: CartOrderData = {
            statusMain: "NEW",
            statusPayment: "PENDING_DEPOSIT",
            totalAmount,
            depositAmount,
            userId,
            orderItems: cartItems.value.map(item => ({
                serviceId: item.serviceId,
                quantity: item.quantity,
                unitAmount: item.unitAmount,
                totalAmount: item.totalAmount
            }))
        }
        
        return orderData
    }
    
    return {
        cartItems,
        cartTotal,
        itemCount,
        itemJustAdded,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        prepareOrderData
    }
})