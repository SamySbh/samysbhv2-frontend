<script setup lang="ts">
import { ref } from 'vue';
import { Project } from '@/types'
import SectionTitle from '@/components/ui/SectionTitle.vue';

const portfolio = ref<Project[]>([
    {
        title: 'Umaï',
        description: "La vitrine numérique d'un restaurant franco-asiatique",
        image: '@/assets/illustrations/slide2-umai.webp',
        tags: [
            {
                title: "Code",
                color: "bg-purple-500"
            },
            {
                title: "Vitrine",
                color: "bg-green-500"
            },
            {
                title: "Restaurant",
                color: "bg-yellow-500"
            }
        ]
    },
    {
        title: 'Cleanovia',
        description: "La carte de visite en ligne d'une entreprise de services personnalisés",
        image: '@/assets/illustrations/slide-cleanovia.webp',
        tags: [
            {
                title: "Low-Code",
                color: "bg-blue-500"
            },
            {
                title: "Vitrine",
                color: "bg-green-500"
            },
            {
                title: "Conciergerie",
                color: "bg-indigo-500"
            }
        ]
    },
    {
        title: 'Lister',
        description: "Une plateforme web d'organisation de tâches et des projets",
        image: '@/assets/illustrations/myapptodo.webp',
        tags: [
            {
                title: "No-Code",
                color: "bg-pink-500"
            },
            {
                title: "SaaS",
                color: "bg-teal-500"
            },
            {
                title: "To-do List",
                color: "bg-red-500"
            }
        ]
    }
]);</script>
<template>
    <section class="py-16 bg-primary">
        <div class="container mx-auto px-2 lg:px-4">
            <SectionTitle title="Mes Réalisations" astronautImage="@/assets/illustrations/astronaut-paint.svg" />
            <h4 class="text-secondary text-center my-4 italic">Des réalisations concrètes qui parlent mieux que des
                mots.
            </h4>
            <div class="grid lg:grid-cols-3 gap-8">
                <div v-for="project in portfolio" :key="project.title"
                    class="group  relative overflow-hidden rounded">
                    <img :src="project.image" :alt="project.title" class="w-full h-64 object-cover">
                    <div
                        class="absolute inset-0 bg-gradient-to-t from-secondary via-secondary-ghost to-transparent p-6 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform">
                        <h3 class="text-xl font-bold text-primary mb-2">{{ project.title }}</h3>
                        <p class="text-primary mb-4">{{ project.description }}</p>
                        <div class="flex flex-wrap gap-2">
                            <span v-for="tag in project.tags" :key="tag.title"
                                :class="['px-3 py-1 text-secondary text-xs rounded-full', tag.color]">
                                {{ tag.title }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>