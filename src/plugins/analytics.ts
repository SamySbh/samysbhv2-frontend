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
        const GA_ID = options.id || import.meta.env.VITE_GA_ID || '';

        // Vérifier le consentement
        const hasConsent = localStorage.getItem('cookie_consent') === 'accepted'

        // Configuration
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

                // Si le consentement était refusé, recharger la page
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