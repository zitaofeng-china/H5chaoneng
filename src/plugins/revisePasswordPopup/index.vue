<template>
  <div class="revise-dialog">
    <el-dialog
      v-model="visible"
      :show-close="true"
      :width="416"
      center
      align-center
      :autofocus="false"
      @close="handleClose"
    >
      <template #header>
        <div class="revise-title">{{ t('revisePassword.title') }}</div>
      </template>
      <el-form
        :model="revisePasswordForm"
        :rules="rules"
        :label-width="70"
        ref="revisePasswordFormRef"
        class="login-form"
      >
        <el-form-item :label="t('revisePassword.oldPassword')" prop="password">
          <div class="input-wrapper">
            <el-input
              v-model="revisePasswordForm.password"
              type="password"
              :placeholder="t('revisePassword.oldPasswordPlaceholder')"
              size="large"
              class="custom-input"
              show-password
            >
            </el-input>
          </div>
        </el-form-item>

        <el-form-item :label="t('revisePassword.newPassword')" prop="newPassword">
          <div class="input-wrapper">
            <el-input
              v-model="revisePasswordForm.newPassword"
              type="password"
              :placeholder="t('revisePassword.newPasswordPlaceholder')"
              size="large"
              class="custom-input"
              show-password
            >
            </el-input>
          </div>
        </el-form-item>
        <el-button
          type="primary"
          size="large"
          class="login-btn"
          @click="onChangePassword"
          :loading="loading"
        >
          {{ t('revisePassword.button') }}
        </el-button>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRevisePassword } from '@/hooks/useRevisePassword'
import type { RevisePasswordEmits } from './types'

defineOptions({
  name: 'RevisePasswordPopup',
})

const { t } = useI18n()
const emit = defineEmits<RevisePasswordEmits>()

const {
  visible,
  loading,
  revisePasswordForm,
  revisePasswordFormRef,
  rules,
  handleChangePassword,
  open,
  close,
} = useRevisePassword()

const handleClose = async () => {
  await close()
  emit('close')
}

const onChangePassword = async () => {
  const success = await handleChangePassword()
  if (success) {
    await handleClose()
  }
}

defineExpose({
  open,
  close,
  visible,
})
</script>

<style lang="scss" scoped>
@import './styles.scss';
</style>
