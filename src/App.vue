<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Layout from '@/components/layout/index.vue'

const route = useRoute()

// 判断是否是404页面
const is404Page = computed(() => route.name === 'NotFound')
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
