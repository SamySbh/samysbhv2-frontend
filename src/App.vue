<script setup lang="ts">
import Header from './components/shared/Header.vue'
import Footer from './components/shared/Footer.vue'
import { CookieBanner } from '@/components/cookies'

</script>

<template>
  <div>
    <Header></Header>
    <main>
      <CookieBanner />
      <router-view></router-view>
    </main>
    <Footer></Footer>
  </div>
</template>