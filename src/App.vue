<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Layout from '@/components/layout/index.vue'
import { useSiteVerification } from '@/hooks/useSiteVerification'
import { useUserStore } from '@/stores/useUserStore'
import { usePriceStore } from '@/stores/usePriceStore'

const route = useRoute()
const { verifySite } = useSiteVerification()
const userStore = useUserStore()
const priceStore = usePriceStore()

const is404Page = computed(() => route.name === 'NotFound')

onMounted(async () => {
  if (!is404Page.value) {
    const isValid = await verifySite()
    if (isValid) {
      userStore.init()
      await priceStore.fetchPrice()
    }
  }
})
</script>

<template>
  <div id="app" :class="{ 'is-404': is404Page }">
    <Layout v-if="!is404Page" />
    <router-view v-else />
  </div>
</template>

<style lang="scss" scoped>
#app {
  padding-top: 66px;
  overflow: hidden;
  overflow-y: auto;

  &.is-404 {
    padding-top: 0;
  }
}
</style>
