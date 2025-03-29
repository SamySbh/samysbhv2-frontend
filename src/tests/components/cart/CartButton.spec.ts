import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import CartButton from '@/components/cart/CartButton.vue';
import { ShoppingCartIcon } from '@heroicons/vue/24/solid';

// Mock du store du panier
vi.mock('@/stores/cart.store', () => ({
    useCartStore: () => ({
        itemCount: 2,
        itemJustAdded: false
    })
}));

// Mock du composant CartDropdown
vi.mock('@/components/cart/CartDropdown.vue', () => ({
    default: {
        name: 'CartDropdown',
        template: '<div>Contenu du panier</div>'
    }
}));

describe('CartButton', () => {
    it('affiche l\'icône du panier et le nombre d\'articles', () => {
        const wrapper = mount(CartButton);

        // Vérifier que l'icône du panier est présente
        expect(wrapper.findComponent(ShoppingCartIcon).exists()).toBe(true);

        // Vérifier que le nombre d'articles est affiché
        const countBadge = wrapper.find('.bg-emphasis');
        expect(countBadge.exists()).toBe(true);
        expect(countBadge.text()).toBe('2');
    });

    it('ouvre et ferme le menu déroulant au clic', async () => {
        const wrapper = mount(CartButton);

        // Vérifier que le dropdown est initialement fermé
        expect(wrapper.findComponent({ name: 'CartDropdown' }).exists()).toBe(false);

        // Cliquer sur le bouton
        await wrapper.find('button').trigger('click');

        // Vérifier que le dropdown est maintenant ouvert
        expect(wrapper.findComponent({ name: 'CartDropdown' }).exists()).toBe(true);

        // Cliquer à nouveau sur le bouton
        await wrapper.find('button').trigger('click');

        // Vérifier que le dropdown est à nouveau fermé
        expect(wrapper.findComponent({ name: 'CartDropdown' }).exists()).toBe(false);
    });

    it('accepte différentes tailles via les props', () => {
        const wrapper = mount(CartButton, {
            props: {
                size: 'sm'
            }
        });

        // Vérifier que la props est correctement passée
        expect(wrapper.props('size')).toBe('sm');
    });
});