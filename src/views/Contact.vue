<script setup lang="ts">
import SectionTitle from '@/components/ui/SectionTitle.vue'
import ContactForm from '@/components/forms/ContactForm.vue'
</script>

<template>
  <section class="flex items-center justify-center min-h-lvh bg-primary flex-col py-8 space-y-6 px-4">
    <SectionTitle title="Me contacter" astronaut-image="src@/assets/illustrations/astronaut-question.svg" />
    <p class="mt-2 text-sm text-secondary text-center">Vous hésitez ou souhaitez échanger avant de faire votre choix ?
      <br>Envoyez-moi un message juste ici !
      <br>Je répondrai par mail dès que possible.
    </p>
    <ContactForm/>
  </section>
</template>