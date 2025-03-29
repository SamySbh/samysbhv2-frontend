import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import CookieConsentBanner from '@/components/cookies/CookieBanner.vue';

// Créer des mocks pour les fonctions du composable
const mockAcceptCookies = vi.fn();
const mockRejectCookies = vi.fn();

// Mock du composable useCookieConsent
vi.mock('@/composables/useCookieConsent', () => ({
    default: () => ({
        needsConsent: true,
        acceptCookies: mockAcceptCookies,
        rejectCookies: mockRejectCookies
    })
}));

describe('CookieConsentBanner', () => {
    it('affiche la bannière quand le consentement est nécessaire', () => {
        const wrapper = mount(CookieConsentBanner);

        // Vérifier que la bannière est visible
        expect(wrapper.isVisible()).toBe(true);

        // Vérifier le titre
        expect(wrapper.find('h3').text()).toBe('Cookies & Coffeedentialité');

        // Vérifier le texte explicatif
        const explanation = wrapper.find('p');
        expect(explanation.exists()).toBe(true);
        expect(explanation.text()).toContain('Ce site utilise des cookies');
    });

    it('affiche les boutons d\'acceptation et de refus', () => {
        const wrapper = mount(CookieConsentBanner);

        // Trouver les boutons
        const buttons = wrapper.findAll('button');
        expect(buttons.length).toBe(2);

        // Vérifier le texte des boutons
        expect(buttons[0].text()).toBe('Refuser');
        expect(buttons[1].text()).toBe('Accepter');
    });

    it('appelle les fonctions appropriées lors du clic sur les boutons', async () => {
        const wrapper = mount(CookieConsentBanner);

        // Réinitialiser les mocks avant le test
        mockRejectCookies.mockReset();
        mockAcceptCookies.mockReset();

        // Trouver les boutons
        const buttons = wrapper.findAll('button');
        const rejectButton = buttons[0];
        const acceptButton = buttons[1];

        // Cliquer sur le bouton de refus
        await rejectButton.trigger('click');
        expect(mockRejectCookies).toHaveBeenCalledTimes(1);

        // Cliquer sur le bouton d'acceptation
        await acceptButton.trigger('click');
        expect(mockAcceptCookies).toHaveBeenCalledTimes(1);
    });
});