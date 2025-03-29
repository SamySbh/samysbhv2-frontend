import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Sidebar from '@/components/admin/AdminSidebar.vue';

describe('Sidebar', () => {
    it('affiche correctement le composant avec la section active', () => {
        const wrapper = mount(Sidebar, {
            props: {
                activeSection: 'users',
                isMobileOpen: true
            }
        });

        // Vérifier que le composant est visible
        expect(wrapper.isVisible()).toBe(true);

        // Vérifier le titre
        expect(wrapper.find('h2').text()).toBe('Tableau de bord');

        // Vérifier que la section active a la classe correcte
        const activeButton = wrapper.find('button.bg-accent');
        expect(activeButton.exists()).toBe(true);
        expect(activeButton.text()).toBe('Utilisateurs');
    });

    it('change la section active et émet les événements correctement', async () => {
        const wrapper = mount(Sidebar, {
            props: {
                activeSection: 'users',
                isMobileOpen: true
            }
        });

        // Trouver les boutons de navigation
        const buttons = wrapper.findAll('button');

        // Cliquer sur le bouton "Commandes"
        await buttons[1].trigger('click');

        // Vérifier que les événements ont été émis
        expect(wrapper.emitted()).toHaveProperty('changeSection');
        expect(wrapper.emitted().changeSection[0]).toEqual(['orders']);

        expect(wrapper.emitted()).toHaveProperty('closeMobileMenu');
        expect(wrapper.emitted().closeMobileMenu.length).toBe(1);
    });

    it('respecte la propriété isMobileOpen pour l\'affichage sur mobile', async () => {
        // Monter avec isMobileOpen = false
        const wrapper = mount(Sidebar, {
            props: {
                activeSection: 'users',
                isMobileOpen: false
            }
        });

        // Vérifier que la classe 'hidden' est présente
        expect(wrapper.classes()).toContain('hidden');

        // Mettre à jour la prop pour rendre visible
        await wrapper.setProps({ isMobileOpen: true });

        // Vérifier que la classe 'block' est maintenant présente
        expect(wrapper.classes()).toContain('block');
    });

    it('contient tous les liens de navigation attendus', () => {
        const wrapper = mount(Sidebar, {
            props: {
                activeSection: 'users',
                isMobileOpen: true
            }
        });

        const buttons = wrapper.findAll('nav button');

        // Vérifier le nombre de boutons
        expect(buttons.length).toBe(4);

        // Vérifier le texte de chaque bouton
        expect(buttons[0].text()).toBe('Utilisateurs');
        expect(buttons[1].text()).toBe('Commandes');
        expect(buttons[2].text()).toBe('Items de commande');
        expect(buttons[3].text()).toBe('Services');
    });
});