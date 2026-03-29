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

        // Consent Mode v2
        if (typeof window.gtag === 'function') {
            if (!hasConsent) {
                window.gtag('consent', 'default', {
                    'analytics_storage': 'denied',
                    'ad_storage': 'denied'
                })
            } else {
                window.gtag('consent', 'update', {
                    'analytics_storage': 'granted',
                    'ad_storage': 'granted'
                })
            }
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

                window.location.reload()
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