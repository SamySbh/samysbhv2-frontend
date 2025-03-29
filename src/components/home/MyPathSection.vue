<script setup lang="ts">
import { ref } from 'vue';
import SectionTitle from '@/components/ui/SectionTitle.vue';
import { AcademicCapIcon, ComputerDesktopIcon, BriefcaseIcon } from '@heroicons/vue/24/solid';
import { PathStep } from '@/types';
import logoCloudCampus from '@/assets/logos/LogoBleuOmbre-edited.webp';
import logoSamy from '@/assets/logos/LogoSamySBHAvecFondGrand.webp';
import logoShifter from '@/assets/logos/ShifterLogo.svg';
import astronautFly from '@/assets/illustrations/astronaut-fly.svg';

const myPath = ref<PathStep[]>([
    {
        icon: AcademicCapIcon,
        iconBg: 'bg-blue-500',
        period: '2025 - En Cours',
        periodColor: 'text-accent',
        shadowColor: 'hover:shadow-accent',
        title: 'Formation Chef de Projet Web et Cybersécurité',
        description: 'Maîtrise des compétences en gestion de projet web et protection des systèmes d\'information chez Cloud Campus',
        logo: logoCloudCampus,
        alt: 'Logo Cloud Campus'
    },
    {
        icon: ComputerDesktopIcon,
        iconBg: 'bg-emphasis',
        period: '2024 - En Cours',
        periodColor: 'text-emphasis',
        shadowColor: 'hover:shadow-emphasis',
        title: 'Création de Sites Web en Freelance',
        description: 'Conception de solutions web sur mesure pour répondre à vos besoins numériques',
        logo: logoSamy,
        alt: 'Logo Samy'
    },
    {
        icon: BriefcaseIcon,
        iconBg: 'bg-emphasis',
        period: '2023 - En Cours',
        periodColor: 'text-emphasis',
        shadowColor: 'hover:shadow-emphasis',
        title: 'Poste de Développeur Web en Alternance',
        description: 'Développement No-Code sur la technologie Bubble.io chez Shifter - Logiciel de gestion pour boutiques et ateliers vélo',
        logo: logoShifter,
        alt: 'Logo Shifter'
    },
    {
        icon: AcademicCapIcon,
        iconBg: 'bg-accent',
        period: '2023-2025',
        periodColor: 'text-accent',
        shadowColor: 'hover:shadow-accent',
        title: 'Formation Développeur Web FullStack',
        description: 'Acquisition des compétences en développement web moderne chez Cloud Campus',
        logo: astronautFly,
        alt: 'Logo Cloud Campus'
    }
]);
</script>
<template>
    <section class="py-12 px-2 md:px-4 bg-primary">
        <div class="container mx-auto">
            <SectionTitle title="Mon Parcours" astronaut-image="@/assets/illustrations/astronaut-fly.svg" />
            <h4 class="text-secondary text-center my-4 italic">Les expériences qui ont façonné mes compétences
                actuelles.
            </h4>
            <div class="space-y-6 text-primary">
                <!-- Parcours items -->
                <div v-for="(item, index) in myPath" :key="index"
                    :class="['grid grid-cols-[auto_1fr_auto] gap-5 p-5 items-center bg-secondary-ghost rounded transition-all duration-300 hover:shadow-lg hover:-translate-y-1', item.shadowColor]">
                    <div :class="['h-12 w-12 rounded flex items-center justify-center text-secondary', item.iconBg]">
                        <component :is="item.icon" class="size-6" />
                    </div>
                    <div class="flex flex-col">
                        <p :class="['text-sm', item.periodColor]">{{ item.period }}</p>
                        <h3 class="text-lg font-medium">{{ item.title }}</h3>
                        <p class="text-xs text-primary">{{ item.description }}</p>
                    </div>
                    <div class="w-12 md:w-20 flex items-center justify-center">
                        <img :src="item.logo" :alt="item.alt" class="max-w-full">
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>