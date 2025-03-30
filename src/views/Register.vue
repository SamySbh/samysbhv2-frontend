<script setup lang="ts">
import SectionTitle from '@/components/ui/SectionTitle.vue';
import RegisterForm from '@/components/forms/RegisterForm.vue';
import astronautFriends from '@/assets/illustrations/astronaut-friends.svg'
</script>

<template>
    <section class="flex items-center justify-center h-lvh bg-primary px-4 flex-col">
        <SectionTitle title="Inscription" :astronaut-image="astronautFriends"/>
        <RegisterForm />
    </section>
</template>