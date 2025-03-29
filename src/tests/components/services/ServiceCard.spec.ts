import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ServiceCard from '@/components/services/ServiceCard.vue';
import { ServiceType } from '@/types';

// Mock simple du composant AddToCartButton
vi.mock('@/components/cart/AddToCartButton.vue', () => ({
    default: {
        name: 'AddToCartButton',
        props: ['service'],
        template: '<button>Ajouter au panier</button>'
    }
}));

describe('ServiceCard', () => {
    const mockService = {
        id: '1',
        name: 'Site Vitrine',
        basePrice: 990,
        description: 'Un site vitrine professionnel et élégant',
        image: '/images/site-vitrine.jpg',
        features: [
            'Design responsive',
            'Optimisation SEO',
            'Formulaire de contact'
        ],
        type: 'VITRINE' as ServiceType,
        isActive: true
    };

    it('affiche correctement les informations principales du service', () => {
        const wrapper = mount(ServiceCard, {
            props: {
                service: mockService
            }
        });

        // Vérifier le nom, le prix et la description
        expect(wrapper.find('h2').text()).toBe('Site Vitrine');
        expect(wrapper.find('.text-accent').text()).toContain('990€ HT');
        expect(wrapper.find('.text-primary').text()).toBe('Un site vitrine professionnel et élégant');
    });

    it('affiche la liste des fonctionnalités', () => {
        const wrapper = mount(ServiceCard, {
            props: {
                service: mockService
            }
        });

        // Vérifier que tous les éléments de fonctionnalité sont présents
        const features = wrapper.findAll('li');
        expect(features.length).toBe(3);
    });

    it('inclut un bouton d\'ajout au panier', () => {
        const wrapper = mount(ServiceCard, {
            props: {
                service: mockService
            },
            global: {
                stubs: {
                    AddToCartButton: true
                }
            }
        });

        // Vérifier que le bouton est bien présent
        expect(wrapper.findComponent({ name: 'AddToCartButton' }).exists()).toBe(true);
    });
});