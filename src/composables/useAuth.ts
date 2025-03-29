import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import type { LoginCredentials, RegisterData } from '../types/auth';

export function useAuth() {
    const router = useRouter();
    const route = useRoute();
    const authStore = useAuthStore();

    // Variables pour login
    const credentials = ref<LoginCredentials>({
        email: '',
        password: ''
    });

    // Variables pour register
    const userData = ref<RegisterData>({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        phone: '',
        company: ''
    });

    const error = ref<string>('');
    const success = ref<string>('');
    const loading = ref<boolean>(false);

    // Gestion de la redirection après connexion
    const handleRedirectAfterLogin = () => {
        const redirectParam = route.query.redirect as string;

        if (redirectParam === 'checkout') {
            router.push('/checkout');
        } else if (redirectParam) {
            router.push(`/${redirectParam}`);
        } else {
            // Redirection par défaut
            router.push('/user');
        }
    };

    // Login
    const login = async (): Promise<void> => {
        error.value = '';
        loading.value = true;

        try {
            await authStore.login(credentials.value);

            // Vérifier s'il y a un paramètre de redirection
            if (route.query.redirect) {
                handleRedirectAfterLogin();
            } else {
                router.push('/user');
            }
        } catch (err: any) {
            if (err.response && err.response.data && err.response.data.message) {
                // Utiliser le message d'erreur du serveur
                error.value = err.response.data.message;
            } else {
                // Fallback au message d'erreur générique
                error.value = err.message || 'Échec de la connexion. Veuillez réessayer.';
            }
        } finally {
            loading.value = false;
        }
    };

    // Register
    const register = async (): Promise<void> => {
        error.value = '';
        success.value = '';
        loading.value = true;

        try {
            await authStore.register(userData.value);
            success.value = 'Inscription réussie! Veuillez vérifier votre email pour activer votre compte.';

            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            error.value = err.message || 'Échec de l\'inscription. Veuillez réessayer.';
        } finally {
            loading.value = false;
        }
    };

    // Vérifier si on a une redirection à faire juste après le chargement
    const checkRedirectParam = () => {
        // Si l'utilisateur est déjà connecté et qu'il y a un paramètre de redirection,rediriger immédiatement
        if (authStore.isAuthenticated && route.query.redirect) {
            handleRedirectAfterLogin();
            return true;
        }
        return false;
    };

    return {
        // Login
        credentials,
        login,

        // Register
        userData,
        register,

        // Redirection
        checkRedirectParam,
        handleRedirectAfterLogin,

        // Shared
        error,
        success,
        loading
    };
}