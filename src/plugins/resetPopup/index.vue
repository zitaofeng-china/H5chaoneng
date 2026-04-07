<template>
  <div class="reset-dialog">
    <el-dialog
      v-model="visible"
      :show-close="isMobile"
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
                  v-model="resetForm.password"
                  type="password"
                  :placeholder="t('reset.confirmPassword')"
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
                class="reset-btn"
                @click="handleRegister"
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
import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import LoginBackground from '@/components/logo/LoginBackground.vue'
import { useCommonStore } from '@/stores/useCommonStore'

defineOptions({
  name: 'RegisterPopup',
})

interface ResetForm {
  email: string
  code: string
  password: string
  passwords: string
}

const { t } = useI18n()
const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)

const visible = ref(false)
const loading = ref(false)
const countdown = ref(0)
const resetFormRef = ref<FormInstance>()

const resetForm = reactive<ResetForm>({
  email: '',
  code: '',
  password: '',
  passwords: '',
})

const rules = computed<FormRules<ResetForm>>(() => ({
  email: [
    { required: true, message: t('login.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('login.emailInvalid'), trigger: 'blur' },
  ],
  code: [{ required: true, message: t('reset.codePlaceholder'), trigger: 'blur' }],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('login.passwordMinLength'), trigger: 'blur' },
  ],
  passwords: [
    { required: true, message: t('reset.confirmPassword'), trigger: 'blur' },
    { min: 6, message: t('login.passwordMinLength'), trigger: 'blur' },
  ],
}))

const emit = defineEmits<{
  close: []
  switchToReset: []
  switchToRegister: []
}>()

const handleClose = async () => {
  visible.value = false
  await resetFormRef.value?.resetFields()
  emit('close')
}

const handleRegister = async () => {
  if (!resetFormRef.value) return

  try {
    await resetFormRef.value.validate()
    loading.value = true

    setTimeout(() => {
      ElMessage.success(t('login.loginSuccess'))
      visible.value = false
      emit('close')
      loading.value = false
    }, 1000)
  } catch (error) {
    console.error('【ERROR INFO】:', error)
  } finally {
    loading.value = false
  }
}

const handleSendVerificationCode = async () => {
  if (countdown.value > 0) return

  if (!resetForm.email) {
    ElMessage.warning(t('reset.enterEmailFirst'))
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetForm.email)) {
    ElMessage.warning(t('login.emailInvalid'))
    return
  }

  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)

  ElMessage.success(t('reset.codeSent'))
}

const open = () => {
  visible.value = true
}

const close = () => {
  visible.value = false
}

defineExpose({
  open,
  close,
})
</script>

<style scoped lang="scss">
.reset-header {
  padding: 0;
}

.reset-dialog {
  overflow: hidden;
  :deep(.el-dialog) {
    padding: 0px;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  }

  :deep(.el-dialog__header) {
    display: none;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.reset-container {
  display: flex;
}

.reset-left {
  flex: 1;
  display: flex;
  align-items: flex-start;
}

.reset-right {
  flex: 1;
  padding: 50px 24px 0;
  display: flex;
  flex-direction: column;
}

.reset-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 50px;

  .reset-title {
    font-size: 34px;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: 0.5px;
  }
}

.reset-form {
  display: flex;
  flex-direction: column;

  .el-form-item {
    margin-bottom: 16px;

    .input-wrapper {
      flex: 1;
      display: flex;
      align-items: center;

      .custom-input {
        height: 50px;

        :deep(.el-input__wrapper) {
          border-radius: 4px;
          padding: 14px;
          background: var(--theme-bg-white);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        :deep(.el-input__inner) {
          font-size: 14px;
          color: #333;
          font-weight: 400;

          &::placeholder {
            color: var(--theme-text-muted-gray);
            font-size: 14px;
            font-weight: 400;
          }
        }
      }

      .countdown {
        margin-left: 12px;
        font-size: 14px;
        font-weight: 600;
        color: var(--theme-bg-blue);
        cursor: pointer;
        user-select: none;

        &.disabled {
          color: var(--theme-text-muted-gray);
          cursor: not-allowed;
        }
      }
    }
  }
}

.form-actions {
  margin-bottom: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;

  :deep(.el-checkbox) {
    height: auto;

    .el-checkbox__label {
      font-size: 14px;
      color: var(--theme-text-gray);
      font-weight: 400;
      padding: 0 8px;
    }

    .el-checkbox__input.is-checked .el-checkbox__inner {
      background-color: var(--theme-bg-blue);
      border-color: var(--theme-bg-blue);
    }
  }

  :deep(.el-link) {
    font-size: 14px;
    color: var(--theme-bg-blue);
    text-decoration: none;
    font-weight: 500;

    &::after {
      display: none;
    }

    &:hover {
      color: var(--theme-bg-blue);
      text-decoration: none;
    }
  }
}

.reset-btn {
  margin-top: 30px;
  width: 100%;
  height: 50px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
  background: var(--theme-bg-blue);
  border: none;
  color: var(--theme-text-white);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(64, 158, 255, 0.35);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
  }

  &.is-loading {
    opacity: 0.8;
  }

  :deep(.el-icon) {
    margin-right: 6px;
  }
}

@media (max-width: 768px) {
  .reset-dialog {
    @include dialog-style;
  }

  .reset-container {
    min-height: auto;
    flex-direction: column;
  }

  .reset-right {
    flex: 1;
    padding: 20px 24px;
  }

  .reset-header {
    margin-bottom: 24px;

    .reset-title {
      font-size: 20px;
    }
  }

  .reset-form {
    .el-form-item {
      margin-bottom: 20px;
    }
  }

  .reset-btn {
    height: 44px;
    margin-top: 0;
    font-size: 14px;
  }
}
</style>
