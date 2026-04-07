<template>
  <div class="login-dialog">
    <el-dialog
      v-model="visible"
      :show-close="isMobile"
      :width="864"
      :height="552"
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
            <el-form-item prop="email">
              <div class="input-wrapper">
                <el-input
                  v-model="loginForm.email"
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
                @click="handleLogin"
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
import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useRegister } from '@/hooks/useRegister.ts'
import { useReset } from '@/hooks/useReset.ts'
import { useUserStore } from '@/stores/useUserStore'
import { useCreateFetch } from '@/hooks/useCreateFetch'
import LoginBackground from '@/components/logo/LoginBackground.vue'
import { useCommonStore } from '@/stores/useCommonStore'

defineOptions({
  name: 'LoginPopup',
})

interface LoginForm {
  email: string
  password: string
  remember: boolean
}

const { t } = useI18n()
const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)

const visible = ref(false)
const loading = ref(false)
const loginFormRef = ref<FormInstance>()

const loginForm = reactive<LoginForm>({
  email: '',
  password: '',
  remember: false,
})

const rules = computed<FormRules<LoginForm>>(() => ({
  email: [
    { required: true, message: t('login.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('login.emailInvalid'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('login.passwordMinLength'), trigger: 'blur' },
  ],
}))

const emit = defineEmits<{
  close: []
  switchToReset: []
  switchToRegister: []
}>()

const { open: openRegister } = useRegister()
const { open: openReset } = useReset()
const { login } = useUserStore()

const { execute } = useCreateFetch('user/login', {
  immediate: false,
})
  .post(loginForm)
  .json()

const handleClose = async () => {
  visible.value = false
  await loginFormRef.value?.resetFields()
  emit('close')
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    loading.value = true

    setTimeout(() => {
      ElMessage.success(t('login.loginSuccess'))
      visible.value = false
      login()
      emit('close')
      loading.value = false
    }, 1000)
    const { data } = await execute()
    console.log(data)
  } catch (error) {
    console.error('【ERROR INFO】:', error)
  } finally {
    loading.value = false
  }
}

const switchToReset = () => {
  handleClose()
  openReset()
  emit('switchToReset')
}

const switchToRegister = async () => {
  handleClose()
  openRegister()

  emit('switchToRegister')
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
.login-header {
  padding: 0;
}

.login-dialog {
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

.login-container {
  display: flex;
}

.login-left {
  flex: 1;
  display: flex;
  align-items: flex-start;
}

.login-right {
  flex: 1;
  padding: 50px 24px;
  display: flex;
  flex-direction: column;
}

.login-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 50px;

  .login-title {
    font-size: 34px;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: 0.5px;
  }
}

.login-form {
  display: flex;
  flex-direction: column;

  .el-form-item {
    margin-bottom: 24px;

    &:last-of-type {
      margin-bottom: 28px;
    }

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

.login-btn {
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

.register-link {
  display: flex;
  justify-content: center;

  :deep(.el-link) {
    font-size: 16px;
    font-weight: 600;
    color: var(--theme-bg-blue);

    &::after {
      display: none;
    }
  }
}

@media (max-width: 768px) {
  .login-dialog {
    @include dialog-style;
  }

  .login-container {
    min-height: auto;
    flex-direction: column;
  }

  .login-right {
    flex: 1;
    padding: 20px 24px;
  }

  .login-header {
    margin-bottom: 20px;

    .login-title {
      font-size: 20px;
    }
  }

  .login-form {
    .el-form-item {
      margin-bottom: 20px;
    }
  }

  .form-actions {
    margin-bottom: 24px;
  }

  .login-btn,
  .register-link {
    height: 44px;
    font-size: 14px;
  }
}
</style>
