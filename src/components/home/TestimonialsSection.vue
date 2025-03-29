<script setup lang="ts">
import { ref } from 'vue';
import { Testimonial } from '@/types'
import SectionTitle from '..//ui/SectionTitle.vue';

const testimonials = ref<Testimonial[]>([
    {
        name: 'Diego Dubois',
        role: "Chef d'entreprise",
        content: "Samy a fourni exactement ce dont mon entreprise avait besoin. Il a parfaitement compris mes exigences et m'a livré un site vitrine professionnel qui a dépassé mes attentes. Je recommande ses services sans hésitation.",
        image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&w=256&h=256&q=80'
    },
    {
        name: 'Bertrand Beaulieu',
        role: 'Entrepreneur',
        content: "La session de coaching web avec Samy a été extrêmement productive. En une seule heure, il a identifié les problèmes de mon site et proposé des solutions concrètes.",
        image: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    },
    {
        name: 'Emma Briand',
        role: "Directrice d'agence",
        content: "Le micro SaaS développé par Samy a transformé la gestion de mes projets. Simple à utiliser et parfaitement adapté à mes besoins, il m'a fait gagner un temps précieux.",
        image: 'https://images.unsplash.com/photo-1553514029-1318c9127859?q=80&w=1964&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&w=256&h=256&q=80'
    }
])
</script>

<template>
    <!-- Testimonials Section -->
    <section class="py-16">
        <div class="container mx-auto px-2 lg:px-4">
            <SectionTitle title="Témoignages" />
            <h4 class="text-secondary text-center my-4 italic">Ce que mes clients disent de notre collaboration.</h4>
            <div class="grid lg:grid-cols-3 gap-8">
                <div v-for="testimonial in testimonials" :key="testimonial.name" class="card">
                    <div class="flex items-center mb-4">
                        <img :src="testimonial.image" :alt="testimonial.name" class="w-12 h-12 rounded-full mr-4">
                        <div>
                            <h3 class="font-semibold">{{ testimonial.name }}</h3>
                            <p class="text-emphasis text-sm">{{ testimonial.role }}</p>
                        </div>
                    </div>
                    <blockquote class="text-accent">
                        <p class="relative pl-6 text-sm">
                            <span class="absolute left-2 -top-2 text-xl text-primary">"</span>
                            {{ testimonial.content }}
                            <span class="text-primary text-xl">"</span>
                        </p>
                    </blockquote>
                </div>
            </div>
        </div>
    </section>
</template>