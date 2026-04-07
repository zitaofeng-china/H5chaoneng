<template>
  <Header />
  <router-view />
  <Footer />
</template>

<script setup lang="ts">
import Footer from './Footer.vue'
import Header from './Header.vue'

defineOptions({
  name: 'AppLayout',
})
</script>

<style scoped></style>
