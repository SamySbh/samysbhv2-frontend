<script setup lang="ts">
import SectionTitle from '@/components/ui/SectionTitle.vue';
import RegisterForm from '@/components/forms/RegisterForm.vue'
</script>

<template>
    <section class="flex items-center justify-center h-lvh bg-primary px-4 flex-col">
        <SectionTitle title="Inscription" astronaut-image="src/assets/illustrations/astronaut-friends.svg"/>
        <RegisterForm />
    </section>
</template>