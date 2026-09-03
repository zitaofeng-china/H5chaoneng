<template>
  <div class="reset-dialog" :class="layoutClass">
    <el-dialog
      v-model="visible"
      :show-close="true"
      :fullscreen="isMobile"
      :width="isMobile ? '100%' : 864"
      header-class="reset-header"
      align-center
      @close="handleClose"
    >
      <div class="reset-container" :class="layoutClass">
        <div class="reset-background" aria-hidden="true">
          <img :src="RegisterBg" alt="" class="reset-bg" />
          <div class="reset-bg-blur" />
          <div class="reset-bg-fade" />
        </div>

        <div class="reset-right">
          <div class="reset-header">
            <div class="reset-title">{{ t('reset.title') }}</div>
            <div class="reset-subtitle">{{ t('reset.subtitle') }}</div>
          </div>

          <el-form :model="resetForm" :rules="rules" ref="resetFormRef" class="reset-form" :class="layoutClass">
            <el-form-item prop="email">
              <div class="input-wrapper">
                <el-input
                  v-model="resetForm.email"
                  :placeholder="t('reset.emailPlaceholder')"
                  size="large"
                  class="custom-input"
                  autocomplete="email"
                >
                  <template #prefix>
                    <SvgIcon name="login-email" width="24" height="24" />
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <el-form-item prop="code">
              <div class="input-wrapper">
                <el-input
                  v-model="resetForm.code"
                  :placeholder="t('reset.codePlaceholder')"
                  size="large"
                  class="custom-input"
                >
                  <template #prefix>
                    <SvgIcon name="login-code" width="24" height="24" />
                  </template>
                  <template #suffix>
                    <div
                      class="countdown-pill tactile-btn"
                      :class="{ disabled: countdown > 0 }"
                      @click="handleSendVerificationCode"
                    >
                      {{ countdown > 0 ? `${countdown}s` : t('reset.getCode') }}
                    </div>
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <el-form-item prop="password">
              <div class="input-wrapper">
                <el-input
                  v-model="resetForm.password"
                  type="password"
                  :placeholder="t('reset.passwordPlaceholder')"
                  size="large"
                  class="custom-input"
                  show-password
                  autocomplete="new-password"
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
                  v-model="resetForm.passwords"
                  type="password"
                  :placeholder="t('reset.confirmPassword')"
                  size="large"
                  class="custom-input"
                  show-password
                  autocomplete="new-password"
                  @input="handlePasswordChange"
                >
                  <template #prefix>
                    <SvgIcon name="login-password" width="24" height="24" />
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <el-form-item class="reset-submit">
              <el-button
                type="primary"
                size="large"
                class="reset-btn tactile-btn"
                @click="onReset"
                :loading="loading"
              >
                {{ t('reset.resetButton') }}
              </el-button>
            </el-form-item>

            <div class="login-link">
              <span>{{ t('register.hasAccount') }}</span>
              <el-link type="primary" @click="switchToLogin">{{ t('register.login') }}</el-link>
            </div>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useResetForm } from '@/hooks/useResetForm'
import RegisterBg from '@/assets/images/register-bg.png'
import { getPopup } from '@/plugins/popupRegistry'
import { useCommonStore } from '@/stores/useCommonStore'
import { useTelegramHaptics } from '@/hooks/useTelegramHaptics'
import type { ResetEmits } from './types'

defineOptions({
  name: 'ResetPopup',
})

const { t } = useI18n()
const emit = defineEmits<ResetEmits>()
const { isMobile } = storeToRefs(useCommonStore())
const layoutClass = computed(() => (isMobile.value ? 'is-mobile' : 'is-desktop'))
const { tmaHapticImpact, tmaHapticSelection } = useTelegramHaptics()

const {
  visible,
  loading,
  countdown,
  resetForm,
  resetFormRef,
  rules,
  handleSendVerificationCode,
  handlePasswordChange,
  handleReset,
  open,
  close,
} = useResetForm()

const handleClose = async () => {
  await close()
  emit('close')
}

const onReset = async () => {
  tmaHapticImpact('light')
  const success = await handleReset()
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

defineExpose({
  open,
  close,
})
</script>

<style scoped lang="scss">
@use './styles.scss';
</style>
