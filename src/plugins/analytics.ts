import VueGtag from 'vue-gtag'
import { App } from 'vue'
import { Router } from 'vue-router'

interface AnalyticsOptions {
    id?: string;
    router?: Router;
    appName?: string;
}


export default {
    install(app: App, options: AnalyticsOptions = {}) {
        const GA_ID = options.id || import.meta.env.VITE_GA_ID || ''; // Remplacez par votre ID Google Analytics

        // Vérifier le consentement existant
        const hasConsent = localStorage.getItem('cookie_consent') === 'accepted'

        // Configuration de base
        const config = {
            config: {
                id: GA_ID,
                params: {
                    anonymize_ip: true
                }
            },
            appName: options.appName || 'Mon Site',
            enabled: hasConsent,
            bootstrap: hasConsent
        }

        // Installer Vue-gtag avec le routeur si fourni
        app.use(VueGtag, config, options.router)

        // Écouter les changements de consentement
        window.addEventListener('cookie-consent-changed', (event) => {
            const detail = (event as CustomEvent).detail

            if (detail?.accepted) {
                // Activer Analytics
                if (typeof window.gtag === 'function') {
                    window.gtag('consent', 'update', {
                        'analytics_storage': 'granted'
                    })
                }

                // Si le consentement était précédemment refusé, recharger la page
                // pour initialiser correctement Google Analytics
                if (localStorage.getItem('cookie_consent') !== 'accepted') {
                    window.location.reload()
                }
            } else {
                // Désactiver Analytics
                if (typeof window.gtag === 'function') {
                    window.gtag('consent', 'update', {
                        'analytics_storage': 'denied'
                    })
                }
            }
        })
    }
}