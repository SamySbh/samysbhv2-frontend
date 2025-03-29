import { ref } from 'vue'

export default function useCookieConsent() {
    const COOKIE_CONSENT_KEY = 'cookie_consent'

    // Lire l'état du consentement depuis localStorage
    const getStoredConsent = () => {
        return localStorage.getItem(COOKIE_CONSENT_KEY)
    }

    // État actuel du consentement
    const consentValue = ref(getStoredConsent())

    // Vérifier si le consentement est nécessaire
    const needsConsent = ref(consentValue.value === null)

    // Accepter les cookies
    const acceptCookies = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
        consentValue.value = 'accepted'
        needsConsent.value = false

        // Indiquer à Google Analytics que le consentement est donné
        if (typeof window.gtag === 'function') {
            window.gtag('consent', 'update', {
                'analytics_storage': 'granted'
            })
        }

        // Déclencher l'événement de changement de consentement
        window.dispatchEvent(new CustomEvent('cookie-consent-changed', {
            detail: { accepted: true }
        }))
    }

    // Refuser les cookies
    const rejectCookies = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected')
        consentValue.value = 'rejected'
        needsConsent.value = false

        // Indiquer à Google Analytics que le consentement est refusé
        if (typeof window.gtag === 'function') {
            window.gtag('consent', 'update', {
                'analytics_storage': 'denied'
            })
        }

        // Déclencher l'événement de changement de consentement
        window.dispatchEvent(new CustomEvent('cookie-consent-changed', {
            detail: { accepted: false }
        }))
    }

    // Réinitialiser les préférences
    const resetConsent = () => {
        localStorage.removeItem(COOKIE_CONSENT_KEY)
        consentValue.value = null
        needsConsent.value = true
    }

    return {
        consentValue,
        needsConsent,
        acceptCookies,
        rejectCookies,
        resetConsent
    }
}