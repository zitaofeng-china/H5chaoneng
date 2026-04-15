<template>
  <div class="register-dialog">
    <el-dialog
      v-model="visible"
      :show-close="isMobile"
      :width="864"
      :height="552"
      header-class="register-header"
      align-center
      @close="handleClose"
    >
      <div class="register-container">
        <div class="register-left">
          <LoginBackground />
        </div>

        <div class="register-right">
          <div class="register-header">
            <div class="register-title">{{ $t('register.title') }}</div>
          </div>

          <el-form :model="registerForm" :rules="rules" ref="registerFormRef" class="register-form">
            <el-form-item prop="username">
              <div class="input-wrapper">
                <el-input
                  v-model="registerForm.username"
                  :placeholder="$t('register.usernamePlaceholder')"
                  size="large"
                  class="custom-input"
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
                >
                  <template #prefix>
                    <SvgIcon name="login-email" width="24" height="24" />
                  </template>
                </el-input>
              </div>
            </el-form-item>
            <el-form-item prop="telegram">
              <div class="input-wrapper">
                <el-input
                  v-model="registerForm.telegram"
                  :placeholder="$t('register.telegramPlaceholder')"
                  size="large"
                  class="custom-input"
                >
                  <template #prefix>
                    <SvgIcon name="login-telegram" width="24" height="24" />
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
                  show-password
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
                  show-password
                >
                  <template #prefix>
                    <SvgIcon name="login-password" width="24" height="24" />
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="register-btn"
                @click="onRegister"
                :loading="loading"
              >
                {{ $t('register.registerButton') }}
              </el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCommonStore } from '@/stores/useCommonStore'
import { useRegisterForm } from '@/hooks/useRegisterForm'
import LoginBackground from '@/components/logo/LoginBackground.vue'
import type { RegisterEmits } from './types'

defineOptions({
  name: 'RegisterPopup',
})

const emit = defineEmits<RegisterEmits>()
const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)

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
  const success = await handleRegister()
  if (success) {
    await handleClose()
  }
}

defineExpose({
  open,
  close,
})
</script>

<style scoped lang="scss">
@import './styles.scss';
</style>
