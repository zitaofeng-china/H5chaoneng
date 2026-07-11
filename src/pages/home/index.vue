<template>
  <EnergyRental />
  <WhyChooseUs />
  <HowItWorks />
  <FeeDescription />
  <FaqSection />
  <HelpSection />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import EnergyRental from './components/EnergyRental.vue'

// 首屏主转化区同步加载；下方营销区块异步分包
const WhyChooseUs = defineAsyncComponent(() => import('./components/WhyChooseUs.vue'))
const HowItWorks = defineAsyncComponent(() => import('./components/HowItWorks.vue'))
const FeeDescription = defineAsyncComponent(() => import('./components/FeeDescription.vue'))
const FaqSection = defineAsyncComponent(() => import('./components/FaqSection.vue'))
const HelpSection = defineAsyncComponent(() => import('./components/HelpSection.vue'))

defineOptions({
  name: 'HomePage',
})
</script>

<style scoped></style>
