<template>
  <div class="register-dialog" :class="layoutClass">
    <el-dialog
      v-model="visible"
      :class="layoutClass"
      :show-close="true"
      :fullscreen="isMobile"
      :width="isMobile ? '100%' : 864"
      header-class="register-header"
      :align-center="!isMobile"
      @close="handleClose"
    >
      <AuthDialogFrame mode="register" @switch="onAuthSwitch" @close="handleClose">
          <el-form
            :model="registerForm"
            :rules="rules"
            ref="registerFormRef"
            class="register-form"
            :class="layoutClass"
            autocomplete="on"
          >
            <el-form-item prop="username">
              <div class="input-wrapper">
                <el-input
                  v-model="registerForm.username"
                  :placeholder="$t('register.usernamePlaceholder')"
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
            <el-form-item prop="email">
              <div class="input-wrapper">
                <el-input
                  v-model="registerForm.email"
                  :placeholder="$t('register.emailPlaceholder')"
                  size="large"
                  class="custom-input"
                  name="email"
                  autocomplete="email"
                  autocapitalize="none"
                  spellcheck="false"
                >
                  <template #prefix>
                    <SvgIcon name="login-email" width="24" height="24" />
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <el-form-item prop="password">
              <div class="input-wrapper">
                <el-input
                  v-model="registerForm.password"
                  type="password"
                  :placeholder="$t('register.passwordPlaceholder')"
                  size="large"
                  class="custom-input"
                  name="new-password"
                  show-password
                  autocomplete="new-password"
                  autocapitalize="none"
                  spellcheck="false"
                >
                  <template #prefix>
                    <SvgIcon name="login-password" width="24" height="24" />
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <el-form-item prop="passwords">
              <div class="input-wrapper">
                <el-input
                  v-model="registerForm.passwords"
                  type="password"
                  :placeholder="$t('register.confirmPassword')"
                  size="large"
                  class="custom-input"
                  name="confirm-password"
                  show-password
                  autocomplete="new-password"
                  autocapitalize="none"
                  spellcheck="false"
                >
                  <template #prefix>
                    <SvgIcon name="login-password" width="24" height="24" />
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <el-form-item class="register-submit">
              <el-button
                type="primary"
                size="large"
                class="register-btn tactile-btn"
                @click="onRegister"
                :loading="loading"
              >
                {{ $t('register.registerButton') }}
              </el-button>
            </el-form-item>

            <div class="login-link">
              <el-button
                type="primary"
                plain
                class="login-btn tactile-btn"
                @click="switchToLogin"
              >
                {{ $t('login.loginButton') }}
              </el-button>
            </div>
          </el-form>
      </AuthDialogFrame>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRegisterForm } from '@/hooks/useRegisterForm'
import AuthDialogFrame from '@/components/auth/AuthDialogFrame.vue'
import { getPopup } from '@/plugins/popupRegistry'
import { useCommonStore } from '@/stores/useCommonStore'
import { useTelegramHaptics } from '@/hooks/useTelegramHaptics'
import type { RegisterEmits } from './types'

defineOptions({
  name: 'RegisterPopup',
})

const emit = defineEmits<RegisterEmits>()
const { isMobile } = storeToRefs(useCommonStore())
const { tmaHapticImpact, tmaHapticSelection } = useTelegramHaptics()
const layoutClass = computed(() => (isMobile.value ? 'is-mobile' : 'is-desktop'))

const {
  visible,
  loading,
  registerForm,
  registerFormRef,
  rules,
  handleRegister,
  open,
  close,
} = useRegisterForm()

const handleClose = async () => {
  await close()
  emit('close')
}

const onRegister = async () => {
  tmaHapticImpact('light')
  const success = await handleRegister()
  if (success) {
    await handleClose()
  }
}

const switchToLogin = () => {
  tmaHapticSelection()
  getPopup('loginPopup')?.open()
  setTimeout(() => {
    handleClose()
  }, 50)
  emit('switchToLogin')
}

const onAuthSwitch = (mode: 'login' | 'register') => {
  if (mode === 'login') {
    switchToLogin()
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
