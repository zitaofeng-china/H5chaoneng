<template>
  <div class="reset-dialog">
    <el-dialog
      v-model="visible"
      :show-close="true"
      :width="864"
      :height="552"
      header-class="reset-header"
      align-center
      @close="handleClose"
    >
      <div class="reset-container">
        <div class="reset-left">
          <LoginBackground />
        </div>

        <div class="reset-right">
          <div class="reset-header">
            <div class="reset-title">{{ t('reset.title') }}</div>
          </div>

          <el-form :model="resetForm" :rules="rules" ref="resetFormRef" class="reset-form">
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
                      class="countdown"
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

            <el-form-item>
              <el-button
                type="primary"
                size="large"
                class="reset-btn"
                @click="onReset"
                :loading="loading"
              >
                {{ t('reset.resetButton') }}
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
import { useI18n } from 'vue-i18n'
import { useCommonStore } from '@/stores/useCommonStore'
import { useResetForm } from '@/hooks/useResetForm'
import LoginBackground from '@/components/logo/LoginBackground.vue'
import type { ResetEmits } from './types'

defineOptions({
  name: 'ResetPopup',
})

const { t } = useI18n()
const emit = defineEmits<ResetEmits>()
const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)

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
  const success = await handleReset()
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
@use './styles.scss';
</style>
