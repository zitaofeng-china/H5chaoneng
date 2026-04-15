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
                @click="handleRegister"
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
import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import LoginBackground from '@/components/logo/LoginBackground.vue'
import { useCommonStore } from '@/stores/useCommonStore'
import { authApi } from '@/api'

defineOptions({
  name: 'RegisterPopup',
})

interface RegisterForm {
  username: string
  email: string
  telegram: string
  password: string
  passwords: string
  remember: boolean
}

const { t } = useI18n()
const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)

const visible = ref(false)
const loading = ref(false)
const registerFormRef = ref<FormInstance>()

const registerForm = reactive<RegisterForm>({
  username: '',
  email: '',
  telegram: '',
  password: '',
  passwords: '',
  remember: false,
})

const rules = computed<FormRules<RegisterForm>>(() => ({
  username: [{ required: true, message: t('register.usernameRequired'), trigger: 'blur' }],
  email: [
    { required: true, message: t('login.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('login.emailInvalid'), trigger: 'blur' },
  ],
  telegram: [{ required: true, message: t('register.telegramRequired'), trigger: 'blur' }],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('login.passwordMinLength'), trigger: 'blur' },
  ],
  passwords: [
    { required: true, message: t('register.confirmPassword'), trigger: 'blur' },
    { min: 6, message: t('login.passwordMinLength'), trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value && value !== registerForm.password) {
          callback(new Error(t('register.passwordMismatch')))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change'],
    },
  ],
}))

const emit = defineEmits<{
  close: []
  switchToReset: []
  switchToRegister: []
}>()

const handleClose = async () => {
  visible.value = false
  await registerFormRef.value?.resetFields()
  emit('close')
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    await registerFormRef.value.validate()
    
    // 验证两次密码是否一致
    if (registerForm.password !== registerForm.passwords) {
      ElMessage.error(t('register.passwordMismatch'))
      return
    }
    
    loading.value = true

    // 调用注册接口
    const response = await authApi.register({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
    })

    // 注册成功
    if (response.code === '000000') {
      ElMessage.success(t('register.registerSuccess'))
      visible.value = false
      emit('close')
    } else {
      ElMessage.error(response.message || t('register.registerFailed'))
    }
  } catch (error: any) {
    console.error('注册失败:', error)
    ElMessage.error(error.message || t('register.registerFailed'))
  } finally {
    loading.value = false
  }
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
.register-header {
  padding: 0;
}

.register-dialog {
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

.register-container {
  display: flex;
}

.register-left {
  flex: 1;
  display: flex;
  align-items: flex-start;
}

.register-right {
  flex: 1;
  padding: 50px 24px 0;
  display: flex;
  flex-direction: column;
}

.register-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 50px;

  .register-title {
    font-size: 34px;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: 0.5px;
  }
}

.register-form {
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

.register-btn {
  margin-top: 10px;
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
  .register-dialog {
    @include dialog-style;
  }

  .register-container {
    min-height: auto;
    flex-direction: column;
  }

  .register-right {
    flex: 1;
    padding: 20px 24px;
  }

  .register-header {
    margin-bottom: 24px;

    .register-title {
      font-size: 20px;
    }
  }

  .register-form {
    .el-form-item {
      margin-bottom: 20px;
    }
  }

  .register-btn {
    height: 44px;
    font-size: 14px;
    margin-top: 0;
  }
}
</style>
