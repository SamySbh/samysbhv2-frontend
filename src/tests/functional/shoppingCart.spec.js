import { describe, it, expect, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import ServicesView from '@/views/Services.vue'


describe('Parcours utilisateur - Ajout au panier', () => {
    let wrapper
    let router

    beforeEach(async () => {
        // Créer un router avec une histoire
        router = createRouter({
            history: createWebHistory(),
            routes: [
                { path: '/', component: ServicesView },
                { path: '/services', component: ServicesView },
                { path: '/panier', component: CartView }
            ]
        })

        // Monter l'application entière avec Pinia et Vue Router
        wrapper = mount(App, {
            global: {
                plugins: [createPinia(), router],
                stubs: {
                    // Remplacer les composants externes pour les tests
                    'font-awesome-icon': true
                }
            }
        })

        // Aller à la page des services
        await router.push('/services')
        await flushPromises()
    })

    it('Permet à un utilisateur de parcourir les services et d\'ajouter au panier', async () => {
        // Vérifier qu'on est bien sur la page des services
        expect(router.currentRoute.value.path).toBe('/services')

        // Trouver un service et vérifier qu'il est affiché
        const serviceCard = wrapper.findComponent({ name: 'ServiceCard' })
        expect(serviceCard.exists()).toBe(true)

        // Cliquer sur le bouton d'ajout au panier
        const addButton = serviceCard.find('.add-to-cart-button')
        await addButton.trigger('click')

        // Vérifier que la notification de panier mis à jour est affichée
        expect(wrapper.text()).toContain('Service ajouté au panier')

        // Aller à la page du panier
        await router.push('/panier')
        await flushPromises()

        // Vérifier que le service est bien dans le panier
        const cartItems = wrapper.findAll('.cart-item')
        expect(cartItems.length).toBeGreaterThan(0)

        // Vérifier que le total est correctement calculé
        const totalElement = wrapper.find('.cart-total')
        expect(totalElement.exists()).toBe(true)
        expect(totalElement.text()).toContain('€')
    })
})