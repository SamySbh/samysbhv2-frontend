<script setup lang="ts">
import { RouterLink } from 'vue-router'

// Année courante pour le copyright
const currentYear = new Date().getFullYear()

// Liens principaux, réutilisables pour la maintenance
const mainLinks = [
    { path: '/', name: 'Accueil' },
    { path: '/services', name: 'Services' },
    { path: '/contact', name: 'Contact' },

]

// Liens légaux
const legalLinks = [
    { path: '/mentions-legales', name: 'Mentions légales' },
    { path: '/cgv', name: 'CGV' },
    { path: '/politique-confidentialite', name: 'Politique de confidentialité' }
]

// Liens sociaux (à adapter selon vos réseaux)
const socialLinks = [
    //{ url: 'https://instagram.com/', name: 'Instagram', icon: '/src/assets/logos/icons8-instagram-sticker.svg' },
    { url: 'https://github.com/SamySbh', name: 'GitHub', icon: '/src/assets/logos/icons8-github-sticker.svg' },
    { url: 'https://www.linkedin.com/in/samy-sebahi-9729a4246/', name: 'LinkedIn', icon: '/src/assets/logos/icons8-linkedin-sticker.svg' }

]
</script>

<template>
    <footer class="bg-accent text-secondary">
        <div class="container mx-auto px-4 py-8">
            <!-- Section principale du footer -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Logo et texte d'introduction -->
                <div class="flex flex-col items-center md:items-start">
                    <RouterLink to="/" class="block mb-4">
                        <img src="@/assets/logos/LogoSamySBHAvecFondGrand.webp" alt="Logo" class="h-16 w-auto">
                    </RouterLink>
                    <p class="text-sm text-center md:text-left">
                        Solutions professionnelles pour vos besoins digitaux.
                        Transformez votre présence en ligne en maîtrisant votre budget.
                    </p>
                </div>

                <!-- Liens de navigation rapide -->
                <div class="flex flex-col items-center">
                    <h3 class="font-semibold text-lg mb-4">Navigation</h3>
                    <div class="flex flex-col space-y-2">
                        <RouterLink v-for="link in mainLinks" :key="link.path" :to="link.path" class="hover:text-primary">
                            {{ link.name }}
                        </RouterLink>
                    </div>
                </div>

                <!-- Coordonnées -->
                <div class="flex flex-col items-center md:items-start">
                    <h3 class="font-semibold text-lg mb-4">Contact</h3>
                    <address class="not-italic text-sm flex flex-col space-y-2">
                        <p class="hover:text-primary">Email : <a href="mailto:samy.sebahi@yahoo.com" class="mailto">samy.sebahi@yahoo.com</a></p>
                        <p class="hover:text-primary">Téléphone : <a href="tel:+33769684368" >+33 7 69 68 43 68</a></p>
                    </address>
                    <!-- Réseaux sociaux -->
                    <div class="flex space-x-4 mt-4">
                        <a v-for="social in socialLinks" :key="social.name" :href="social.url" target="_blank"
                            rel="noopener noreferrer" class="hover:text-primary transition-colors"
                            :aria-label="social.name">
                            <img class="size-12" :src="social.icon" :alt=social.name>
                        </a>
                    </div>
                </div>
            </div>

            <!-- Barre de séparation -->
            <hr class="border-secondary/20 my-6">

            <!-- Pied de page avec copyright et liens légaux -->
            <div class="flex flex-col md:flex-row justify-between items-center">
                <p class="text-sm mb-4 md:mb-0">
                    &copy; {{ currentYear }} | Samy SEBAHI | Tous droits réservés.
                </p>
                <div class="flex flex-wrap justify-center gap-4 text-xs">
                    <RouterLink v-for="link in legalLinks" :key="link.path" :to="link.path" class="hover:text-primary">
                        {{ link.name }}
                    </RouterLink>
                </div>
            </div>
        </div>
    </footer>
</template>