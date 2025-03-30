<script setup lang="ts">
import SectionTitle from '@/components/ui/SectionTitle.vue'
import { ref } from 'vue';
import { ProcessStep } from '@/types'
import astronautWorkingLaptop from '@/assets/illustrations/astronaut-working-laptop.svg'

const processSteps = ref<ProcessStep[]>([
    {
        title: "Analyse et Planification",
        progress: 25,
        description: "Je commence par comprendre en profondeur vos besoins et objectifs pour établir un plan d'action précis."
    },
    {
        title: "Design et Prototype",
        progress: 50,
        description: "Nous travaillons ensemble sur le design et les prototypes pour visualiser concrètement le résultat final."
    },
    {
        title: "Développement",
        progress: 75,
        description: "Je transforme les designs en code fonctionnel, en gardant un contact régulier pour vous montrer l'avancement."
    },
    {
        title: "Livraison et Support",
        progress: 100,
        description: "Après la mise en ligne, je reste disponible pour toute optimisation et support nécessaire."
    }
])
</script>

<template>
    <section class="py-16">
        <div class="container mx-auto px-2 md:px-4">
            <SectionTitle title="Mon Processus" :astronaut-image="astronautWorkingLaptop"/>
            <h4 class="text-secondary text-center my-4 italic">Une méthode éprouvée pour concrétiser votre vision
                numérique.
            </h4>
            <div class="mx-auto space-y-8">
                <div v-for="(step, index) in processSteps" :key="index" class="card p-6">
                    <h3 class="text-xl font-semibold mb-4">{{ index + 1 }}. {{ step.title }}</h3>
                    <div class="text-emphasis mb-2 flex justify-between">
                        <p class="text-primary">{{ step.description }}</p>
                        <span>{{ step.progress }}%</span>
                    </div>
                    <div class="h-2 rounded-full bg-base-300 w-full mb-4">
                        <div class="h-full bg-accent rounded-full" :style="`width: ${step.progress}%`"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>