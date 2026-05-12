<template>
  <WelfareOrder />
  <WhyChooseUs />
  <HowItWorks />
  <FeeDescription />
  <FaqSection />
  <HelpSection />
</template>

<script setup lang="ts">
import WelfareOrder from './components/WelfareOrder.vue'
import HelpSection from './components/HelpSection.vue'
import FaqSection from './components/FaqSection.vue'
import FeeDescription from './components/FeeDescription.vue'
import HowItWorks from './components/HowItWorks.vue'
import WhyChooseUs from './components/WhyChooseUs.vue'

defineOptions({
  name: 'HomePage',
})
</script>

<style scoped></style>
