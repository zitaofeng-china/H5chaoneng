<template>
  <div class="login-dialog" :class="layoutClass">
    <el-dialog
      v-model="visible"
      :class="layoutClass"
      :show-close="true"
      :fullscreen="isMobile"
      :width="isMobile ? '100%' : 864"
      header-class="login-header"
      :align-center="!isMobile"
      @close="handleClose"
    >
      <AuthDialogFrame mode="login" @switch="onAuthSwitch" @close="handleClose">
          <el-form
            :model="loginForm"
            :rules="rules"
            ref="loginFormRef"
            class="login-form"
            :class="layoutClass"
            autocomplete="on"
          >
            <el-form-item prop="username">
              <div class="input-wrapper">
                <el-input
                  v-model="loginForm.username"
                  :placeholder="$t('login.placeholder')"
                  size="large"
                  class="custom-input"
                  name="username"
                  autocomplete="username"
                  autocapitalize="none"
                  spellcheck="false"
                >
                  <template #prefix>
                    <SvgIcon name="login-user" width="24" height="24" />
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <el-form-item prop="password">
              <div class="input-wrapper">
                <el-input
                  v-model="loginForm.password"
                  type="password"
                  :placeholder="$t('login.passwordPlaceholder')"
                  size="large"
                  class="custom-input"
                  name="password"
                  show-password
                  autocomplete="current-password"
                  autocapitalize="none"
                  spellcheck="false"
                >
                  <template #prefix>
                    <SvgIcon name="login-password" width="24" height="24" />
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <div class="form-actions">
              <el-checkbox v-model="loginForm.remember">
                {{ $t('login.rememberPassword') }}
              </el-checkbox>
              <el-link type="primary" @click="switchToReset">
                {{ $t('login.forgetPassword') }}
              </el-link>
            </div>

            <el-form-item class="login-submit">
              <el-button
                type="primary"
                size="large"
                class="login-btn tactile-btn"
                @click="onLogin"
                :loading="loading"
              >
                {{ $t('login.loginButton') }}
              </el-button>
            </el-form-item>

            <div class="register-link">
              <el-button
                type="primary"
                plain
                class="register-btn tactile-btn"
                @click="switchToRegister"
              >
                {{ $t('login.register') }}
              </el-button>
            </div>
          </el-form>
      </AuthDialogFrame>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance } from 'vue'
import { storeToRefs } from 'pinia'
import { useLoginForm } from '@/hooks/useLoginForm'
import AuthDialogFrame from '@/components/auth/AuthDialogFrame.vue'
import { useCommonStore } from '@/stores/useCommonStore'
import { useTelegramHaptics } from '@/hooks/useTelegramHaptics'
import type { LoginEmits } from './types'

defineOptions({
  name: 'LoginPopup',
})

const emit = defineEmits<LoginEmits>()
const { proxy } = getCurrentInstance()!
const { isMobile } = storeToRefs(useCommonStore())
const { tmaHapticImpact, tmaHapticSelection } = useTelegramHaptics()
const layoutClass = computed(() => (isMobile.value ? 'is-mobile' : 'is-desktop'))

const {
  visible,
  loading,
  loginForm,
  loginFormRef,
  rememberedPreview,
  rules,
  handleLogin,
  saveRememberedDemo,
  clearRememberedDemo,
  open,
  close,
} = useLoginForm()

const handleClose = async () => {
  await close()
  emit('close')
}

const onLogin = async () => {
  tmaHapticImpact('light')
  const success = await handleLogin()
  if (success) {
    await handleClose()
  }
}

const switchToReset = () => {
  tmaHapticSelection()
  if (proxy?.$resetPopup) {
    proxy.$resetPopup.open()
    setTimeout(() => {
      handleClose()
    }, 50)
  }
  emit('switchToReset')
}

const switchToRegister = () => {
  tmaHapticSelection()
  if (proxy?.$registerPopup) {
    proxy.$registerPopup.open()
    setTimeout(() => {
      handleClose()
    }, 50)
  }
  emit('switchToRegister')
}

const onAuthSwitch = (mode: 'login' | 'register') => {
  if (mode === 'register') {
    switchToRegister()
  }
}

defineExpose({
  open,
  close,
})
</script>

<style scoped lang="scss">
@use './styles.scss';
</style>
