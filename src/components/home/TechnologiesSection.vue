<script setup lang="ts">
import { ref } from 'vue';
import { Technology } from '@/types'
import SectionTitle from '@/components/ui/SectionTitle.vue';

const technologies = ref<Technology[]>([
    {
        title: 'No-Code : Bubble.io',
        description: "Création de logiciels web complexes via Bubble.io",
        icon: '..@/assests/logos/bubble-logo.webp',
        details: "Conception d'applications web complètes sans programmation, incluant bases de données, workflows et interfaces utilisateurs dynamiques."
    },
    {
        title: 'Low-Code : Wordpress',
        description: "Création de solutions web flexibles combinant les modules WordPress et du code personnalisé",
        icon: '..@/assests/logos/wordpress.webp',
        details: "Développement accéléré de sites professionnels grâce à l'écosystème WordPress, optimisé par des extensions et du code personnalisé pour des besoins spécifiques."
    },
    {
        title: 'Code : Stack MEVN',
        description: "Élaboration de solutions web sur mesure avec l'architecture MEVN (MongoDB, Express.js, Vue.js, Node.js)",
        icon: '..@/assests/logos/mevn.webp',
        details: "Architecture JavaScript full-stack permettant de créer des applications web performantes, évolutives et réactives avec une expérience utilisateur fluide."
    }
])
</script>
<template>
    <section class="py-16 bg-primary">
        <div class="container mx-auto p-4">
            <SectionTitle title="Technologies" astronaut-image="@/assests/illustrations/astronaut-key.svg" />
            <h4 class="text-secondary text-center my-4 italic">Les outils modernes au service de vos ambitions web.</h4>
            <div class="grid md:grid-cols-3 gap-8">
                <div v-for="technologie in technologies" :key="technologie.title"
                    class="card text-center group hover:shadow-lg transition-all flex flex-col justify-evenly space-y-4">
                    <div class=" mx-auto flex items-center justify-center">
                        <img class="w-1/3" :src="technologie.icon" :alt="technologie.title">
                    </div>
                    <h3 class="text-xl text-accent font-semibold mb-2">{{ technologie.title }}</h3>
                    <p class="text-primary mb-4">{{ technologie.description }}</p>
                    <p class="text-xs text-emphasis hidden group-hover:block">
                        {{ technologie.details }}
                    </p>
                </div>
            </div>
        </div>
    </section>
</template>