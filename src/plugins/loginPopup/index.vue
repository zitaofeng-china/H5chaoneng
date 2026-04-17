<template>
  <div class="login-dialog">
    <el-dialog
      v-model="visible"
      :show-close="isMobile"
      :width="864"
      :height="600"
      header-class="login-header"
      align-center
      @close="handleClose"
    >
      <div class="login-container">
        <div class="login-left">
          <LoginBackground />
        </div>

        <div class="login-right">
          <div class="login-header">
            <div class="login-title">{{ $t('login.title') }}</div>
          </div>

          <el-form :model="loginForm" :rules="rules" ref="loginFormRef" class="login-form">
            <el-form-item prop="username">
              <div class="input-wrapper">
                <el-input
                  v-model="loginForm.username"
                  :placeholder="$t('login.placeholder')"
                  size="large"
                  class="custom-input"
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
                  show-password
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

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="login-btn"
                @click="onLogin"
                :loading="loading"
              >
                {{ $t('login.loginButton') }}
              </el-button>
            </el-form-item>

            <div class="register-link">
              <el-link type="primary" @click="switchToRegister">{{ $t('login.register') }}</el-link>
            </div>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { getCurrentInstance } from 'vue'
import { storeToRefs } from 'pinia'
import { useCommonStore } from '@/stores/useCommonStore'
import { useLoginForm } from '@/hooks/useLoginForm'
import LoginBackground from '@/components/logo/LoginBackground.vue'
import type { LoginEmits } from './types'

defineOptions({
  name: 'LoginPopup',
})

const emit = defineEmits<LoginEmits>()
const { proxy } = getCurrentInstance()!
const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)

const {
  visible,
  loading,
  loginForm,
  loginFormRef,
  rules,
  handleLogin,
  open,
  close,
} = useLoginForm()

const handleClose = async () => {
  await close()
  emit('close')
}

const onLogin = async () => {
  const success = await handleLogin()
  if (success) {
    await handleClose()
  }
}

const switchToReset = () => {
  if (proxy?.$resetPopup) {
    proxy.$resetPopup.open()
    setTimeout(() => {
      handleClose()
    }, 50)
  }
  emit('switchToReset')
}

const switchToRegister = () => {
  if (proxy?.$registerPopup) {
    proxy.$registerPopup.open()
    setTimeout(() => {
      handleClose()
    }, 50)
  }
  emit('switchToRegister')
}

defineExpose({
  open,
  close,
})
</script>

<style scoped lang="scss">
@use './styles.scss';
</style>
