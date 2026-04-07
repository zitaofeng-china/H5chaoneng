<template>
  <img :src="isMobile ? LoginBgM : LoginBg" alt="" class="login-bg" />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import LoginBg from '@/assets/images/login-bg.png'
import LoginBgM from '@/assets/images/login-bg-m.png'
import { useCommonStore } from '@/stores/useCommonStore'

defineOptions({
  name: 'LoginBackground',
})

const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)
</script>

<style scoped lang="scss">
.login-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
