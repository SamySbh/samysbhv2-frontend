import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import OrderList from '@/components/admin/orders/OrderList.vue';
import OrderCreate from '@/components/admin/orders/OrderCreate.vue';
import OrderEdit from '@/components/admin/orders/OrderEdit.vue';
import { useOrderStore } from '@/stores/order.store';

// Mocks simples pour les composants enfants
vi.mock('@/components/OrderCreate.vue');
vi.mock('@/components/OrderEdit.vue');
vi.mock('@/components/OrderDetails.vue');

// Mock order simplifié
const mockOrder = {
    id: '123456789abc',
    createdAt: '2024-03-25T12:00:00Z',
    user: {
        firstName: 'Jean',
        lastName: 'Dupont'
    },
    totalAmount: 150.5,
    statusMain: 'NEW',
    statusPayment: 'PENDING_DEPOSIT'
};

describe('OrderList', () => {
    it('appelle getOrders au montage du composant', () => {
        mount(OrderList, {
            global: {
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn
                    })
                ]
            }
        });

        const orderStore = useOrderStore();
        expect(orderStore.getOrders).toHaveBeenCalled();
    });

    it('affiche un message de chargement lorsque loading est true', () => {
        const wrapper = mount(OrderList, {
            global: {
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            order: { orders: [], loading: true }
                        }
                    })
                ]
            }
        });

        expect(wrapper.text()).toContain('Chargement des commandes');
    });

    it('affiche le tableau quand des commandes sont disponibles', () => {
        const wrapper = mount(OrderList, {
            global: {
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            order: { orders: [mockOrder], loading: false }
                        }
                    })
                ]
            }
        });

        expect(wrapper.find('table').exists()).toBe(true);
        expect(wrapper.find('tbody tr').exists()).toBe(true);
    });

    it('ouvre le modal de création lors du clic sur le bouton', async () => {
        const wrapper = mount(OrderList, {
            global: {
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn
                    })
                ]
            }
        });

        await wrapper.find('button').trigger('click');
        expect(wrapper.findComponent(OrderCreate).exists()).toBe(true);
    });

    it('ouvre le modal d\'édition lors du clic sur Modifier', async () => {
        const wrapper = mount(OrderList, {
            global: {
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            order: { orders: [mockOrder], loading: false }
                        }
                    })
                ]
            }
        });

        // Chercher le bouton Modifier (deuxième bouton dans les actions)
        const buttons = wrapper.findAll('tbody tr button');
        const editButton = buttons.find(button => button.text() === 'Modifier');

        // Vérifier que le bouton existe avant de continuer
        expect(editButton).toBeDefined();
        if (editButton) {
            await editButton.trigger('click');
            expect(wrapper.findComponent(OrderEdit).exists()).toBe(true);
        }
    });

    it('supprime une commande après confirmation', async () => {
        // Mock de window.confirm
        vi.spyOn(window, 'confirm').mockReturnValue(true);

        const wrapper = mount(OrderList, {
            global: {
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            order: { orders: [mockOrder], loading: false }
                        }
                    })
                ]
            }
        });

        const orderStore = useOrderStore();

        // Chercher le bouton Supprimer
        const buttons = wrapper.findAll('tbody tr button');
        const deleteButton = buttons.find(button => button.text() === 'Supprimer');

        // Vérifier que le bouton existe avant de continuer
        expect(deleteButton).toBeDefined();
        if (deleteButton) {
            await deleteButton.trigger('click');
            expect(orderStore.deleteOrder).toHaveBeenCalledWith(mockOrder.id);
        }
    });
});