<script setup lang="ts">
import { ref } from 'vue';
import SectionTitle from '@/components/ui/SectionTitle.vue';
import { PreviewService } from '@/types'

const previewServices = ref<PreviewService[]>([
    {
        icon: '/src/assets/illustrations/laptop-vitrine.svg',
        title: 'Site Vitrine',
        description: "Donnez vie à votre présence professionnelle avec un site vitrine élégant et optimisé, conçu pour convertir vos visiteurs en clients.",
        cta: "Créer mon site"
    },
    {
        icon: '/src/assets/illustrations/laptop-ecom.svg',
        title: 'Boutique E-Commerce',
        description: "Lancez votre boutique en ligne clé en main, de la gestion des stocks aux paiements sécurisés, et commencez à vendre dès aujourd'hui.",
        cta: "Lancer ma boutique"
    },
    {
        icon: '/src/assets/illustrations/laptop-saas.svg',
        title: 'Logiciel Web',
        description: "Transformez votre idée en application web rentable avec une solution SaaS sur mesure, évolutive et adaptée aux besoins de vos utilisateurs.",
        cta: "Concrétiser mon idée"
    },
    {
        icon: '/src/assets/illustrations/laptop-coaching.svg',
        title: 'Coaching Web',
        description: "Une heure d'accompagnement personnalisé pour résoudre vos problèmes web ou optimiser votre site.",
        cta: "Réserver mon heure"
    }
])
</script>

<template>
    <section class="py-16 bg-primary">
        <div class="container mx-auto px-2 md:px-4">
            <SectionTitle title="Mes Services" />
            <h4 class="text-secondary text-center my-4 italic">Des solutions adaptées à vos besoins spécifiques.</h4>
            <div class="grid lg:grid-cols-2 xl:grid-cols-4 gap-8 mb-8">
                <div v-for="(service, index) in previewServices" :key="index"
                    class="card text-center hover:shadow-lg hover:shadow-accent transition-shadow flex flex-col h-full">
                    <div class="mb-4">
                        <img class="max-w-28 mx-auto" :src="service.icon" :alt="service.title">
                    </div>
                    <h3 class="text-xl font-semibold mb-2 text-accent">{{ service.title }}</h3>
                    <p class="text-xs xl:text-base text-primary mb-4">{{ service.description }}</p>
                    <div class="mt-auto">
                        <router-link to="/services" class="btn-primary">
                            {{ service.cta }}
                        </router-link>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>