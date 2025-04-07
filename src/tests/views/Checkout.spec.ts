
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import Checkout from '@/views/Checkout.vue';
import { useCartStore } from '@/stores/cart.store';
import { useOrderStore } from '@/stores/order.store';

// Mock du router
vi.mock('vue-router', () => ({
    useRouter: () => ({
        push: vi.fn()
    })
}));

// Données de test
const mockCartItems = [
    {
        serviceId: '123',
        quantity: 2,
        unitAmount: 100,
        totalAmount: 200,
        service: {
            name: 'Service Test',
            description: 'Description du service'
        }
    }
];

const mockUser = {
    id: 'user123',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    company: 'Test Company'
};

describe('Checkout', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('affiche un message quand le panier est vide', () => {
        const wrapper = mount(Checkout, {
            global: {
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            cart: { cartItems: [] },
                            auth: { currentUser: mockUser, isAuthenticated: true }
                        }
                    })
                ]
            }
        });

        expect(wrapper.text()).toContain('Votre panier est vide');
        expect(wrapper.find('button').text()).toContain('Retour aux services');
    });

    it('affiche le résumé du panier et les informations utilisateur', () => {
        const wrapper = mount(Checkout, {
            global: {
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            cart: { cartItems: mockCartItems },
                            auth: { currentUser: mockUser, isAuthenticated: true }
                        }
                    })
                ]
            }
        });

        // Vérifier le titre
        expect(wrapper.find('h1').text()).toBe('Validation de commande');

        // Vérifier le résumé du panier
        expect(wrapper.text()).toContain('Service Test');
        expect(wrapper.text()).toContain('Description du service');

        // Vérifier les informations utilisateur
        expect(wrapper.text()).toContain('John Doe');
        expect(wrapper.text()).toContain('john@example.com');
        expect(wrapper.text()).toContain('Test Company');
    });

    it('traite la commande lors du clic sur le bouton de paiement', async () => {
        const wrapper = mount(Checkout, {
            global: {
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            cart: {
                                cartItems: mockCartItems,
                                cartTotal: 200
                            },
                            auth: { currentUser: mockUser, isAuthenticated: true }
                        }
                    })
                ]
            }
        });

        const cartStore = useCartStore();
        const orderStore = useOrderStore();

        // Mock des méthodes du store
        cartStore.prepareOrderData = vi.fn().mockReturnValue({
            statusMain: 'NEW',
            statusPayment: 'PENDING_DEPOSIT',
            totalAmount: 200,
            depositAmount: 60,
            userId: 'user123',
            orderItems: []
        });

        orderStore.createOrderWithItems = vi.fn().mockResolvedValue({
            id: 'order123',
            totalAmount: 200
        });

        orderStore.createCheckoutSession = vi.fn().mockResolvedValue('https://checkout.stripe.com/session');

        // Remplacer window.location.href
        const originalHref = window.location.href;
        // Utiliser Object.defineProperty au lieu de delete
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { href: '' }
        });

        // Cliquer sur le bouton de paiement
        const payButton = wrapper.find('button[class*="bg-blue-600"]');
        expect(payButton.exists()).toBe(true);
        await payButton.trigger('click');

        // Vérifier que les méthodes du store ont été appelées
        expect(cartStore.prepareOrderData).toHaveBeenCalledWith('user123');
        expect(orderStore.createOrderWithItems).toHaveBeenCalled();
        expect(orderStore.createCheckoutSession).toHaveBeenCalledWith('order123');
        expect(cartStore.clearCart).toHaveBeenCalled();

        // Restaurer window.location
        Object.defineProperty(window, 'location', {
            writable: true,
            value: { href: originalHref }
        });
    });
});