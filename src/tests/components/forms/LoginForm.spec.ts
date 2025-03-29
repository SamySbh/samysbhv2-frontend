import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginForm from '@/components/forms/LoginForm.vue';
import { ref } from 'vue'; // Importons ref de Vue

// On crée un mock simple pour les composables et modules externes
// pour éviter les erreurs d'importation
vi.mock('@/composables/useAuth', () => ({
    useAuth: () => ({
        error: ref(''), // Utilisons ref() réel au lieu de { value: '' }
        loading: ref(false), // Utilisons ref() réel au lieu de { value: false }
        credentials: ref({ email: '', password: '' }), // Utilisons ref() réel
        login: vi.fn(),
        checkRedirectParam: vi.fn()
    })
}));

// Mock simple pour vee-validate
vi.mock('vee-validate', () => ({
    useField: () => ({ value: '', errorMessage: '' }),
    useForm: () => ({
        handleSubmit: (fn: Function) => fn
    })
}));

// Mock simple pour yup
vi.mock('@vee-validate/yup', () => ({
    toTypedSchema: () => ({})
}));

// Mock simple pour schemas
vi.mock('@/schemas', () => ({
    loginSchema: {}
}));

describe('LoginForm', () => {
    it('affiche le formulaire de connexion avec les champs requis', () => {
        // Monter le composant de façon basique
        const wrapper = mount(LoginForm, {
            global: {
                stubs: ['RouterLink'] // On utilise un stub basique pour RouterLink
            }
        });

        // Tests très simples pour vérifier que les éléments principaux sont présents
        expect(wrapper.find('input[type="email"]').exists()).toBe(true);
        expect(wrapper.find('input[type="password"]').exists()).toBe(true);
        expect(wrapper.find('button[type="submit"]').exists()).toBe(true);
    });

    it('affiche les labels corrects pour les champs', () => {
        const wrapper = mount(LoginForm, {
            global: {
                stubs: ['RouterLink']
            }
        });

        expect(wrapper.find('label[for="email"]').text()).toBe('Email');
        expect(wrapper.find('label[for="password"]').text()).toBe('Mot de passe');
    });

    it('affiche le bouton de connexion avec le texte correct', () => {
        const wrapper = mount(LoginForm, {
            global: {
                stubs: ['RouterLink']
            }
        });

        const button = wrapper.find('button[type="submit"]');
        expect(button.text()).toContain('Se connecter'); // Utilisons toContain au lieu de toBe
    });
});