<script setup lang="ts">
import LoginForm from '@/components/forms/LoginForm.vue'
import SectionTitle from '@/components/ui/SectionTitle.vue'
import astronautLaptopLove from '@/assets/illustrations/astronaut-laptop-love.svg'
</script>

<template>
    <section class="flex items-center justify-center h-lvh bg-primary flex-col px-4">
        <SectionTitle title="Connexion" :astronaut-image="astronautLaptopLove"/>
        <LoginForm />

    </section>
</template>
