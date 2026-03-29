<script setup lang="ts">
import useCookieConsent from '@/composables/useCookieConsent'
const { needsConsent, acceptCookies, rejectCookies, consentValue } = useCookieConsent()
</script>

<template>
    <div v-if="needsConsent" class="fixed bottom-0 left-0 right-0 bg-primary shadow-lg z-50 border-t-2 border-accent">
        <div class="container mx-auto px-4 py-4 md:py-6">
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div class="flex-grow">
                    <div class="flex items-center">
                        <img class="w-20" src="@/assets/illustrations/cookies-coffee.svg" alt="Cookies">
                        <h3 class="text-lg font-semibold mb-2 text-secondary">Cookies & Coffeedentialité</h3>
                    </div>
                    <p class="text-sm text-secondary-ghost">
                        Ce site utilise des cookies pour améliorer votre expérience et analyser le trafic.
                        Vous pouvez accepter tous les cookies ou les refuser en cliquant sur les boutons ci-dessous.
                        <RouterLink to="/politique-confidentialite" class="underline hover:text-secondary">En savoir plus</RouterLink>
                    </p>
                </div>
                <div class="flex items-center gap-3 self-end md:self-center">
                    <button @click="rejectCookies"
                        class="px-4 py-2 rounded-md bg-emphasis-ghost text-secondary hover:bg-emphasis transition-colors text-sm">
                        Refuser
                    </button>
                    <button @click="acceptCookies"
                        class="px-4 py-2 rounded-md bg-accent-ghost text-secondary hover:bg-accent transition-colors text-sm">
                        Accepter
                    </button>
                </div>
            </div>
        </div>
    <div v-if="!needsConsent && consentValue === 'accepted'" class="text-center py-2">
        <button @click="rejectCookies" class="text-xs text-secondary-ghost hover:text-secondary underline">
            Révoquer mon consentement aux cookies
        </button>
    </div>
    </div>
</template>