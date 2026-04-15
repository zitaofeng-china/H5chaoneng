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

            <el-form-item prop="verifyCode">
              <div class="input-wrapper code-wrapper">
                <el-input
                  v-model="loginForm.verifyCode"
                  :placeholder="$t('login.verifyCodePlaceholder')"
                  size="large"
                  class="custom-input"
                  maxlength="6"
                >
                  <template #prefix>
                    <SvgIcon name="login-code" width="24" height="24" />
                  </template>
                </el-input>
                <el-button
                  class="send-code-btn"
                  :disabled="countdown > 0 || sendingCode"
                  :loading="sendingCode"
                  @click="handleSendCode"
                >
                  {{ countdown > 0 ? `${countdown}s` : $t('login.sendCode') }}
                </el-button>
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
import { ref, reactive, computed, inject, getCurrentInstance } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/useUserStore'
import { loginSimple, sendCode } from '@/api/modules/auth'
import { authApi } from '@/api'
import LoginBackground from '@/components/logo/LoginBackground.vue'
import { useCommonStore } from '@/stores/useCommonStore'
import { getToken } from '@/utils/token'

defineOptions({
  name: 'LoginPopup',
})

interface LoginForm {
  username: string
  password: string
  verifyCode: string
  remember: boolean
}

const { t } = useI18n()
const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)
const { proxy } = getCurrentInstance()!
const userStore = useUserStore()

const visible = ref(false)
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)
const smsId = ref('')
const loginFormRef = ref<FormInstance>()

const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
  verifyCode: '',
  remember: false,
})

const rules = computed<FormRules<LoginForm>>(() => ({
  username: [
    { required: true, message: t('login.usernameRequired'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('login.passwordMinLength'), trigger: 'blur' },
  ],
  verifyCode: [
    // 验证码不是必填的
    { len: 6, message: t('login.verifyCodeLength'), trigger: 'blur' },
  ],
}))

const emit = defineEmits<{
  close: []
  switchToReset: []
  switchToRegister: []
}>()

const { login: userLogin } = useUserStore()

// 发送验证码
const handleSendCode = async () => {
  if (!loginForm.username) {
    ElMessage.warning(t('login.usernameRequired'))
    return
  }

  try {
    sendingCode.value = true
    // TODO: 调用真实的发送验证码接口
    // const response = await sendCode({ username: loginForm.username })
    // smsId.value = response.sms_id
    
    // 模拟发送成功
    smsId.value = 'mock_sms_id_' + Date.now()
    ElMessage.success(t('login.sendCodeSuccess'))
    
    // 开始倒计时
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) {
        clearInterval(timer)
      }
    }, 1000)
  } catch (error: any) {
    ElMessage.error(error.message || t('login.sendCodeFailed'))
  } finally {
    sendingCode.value = false
  }
}

const handleClose = async () => {
  visible.value = false
  await loginFormRef.value?.resetFields()
  countdown.value = 0
  smsId.value = ''
  emit('close')
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    await loginFormRef.value.validate()
    
    if (!smsId.value) {
      ElMessage.warning(t('login.sendCodeFirst'))
      return
    }

    loading.value = true

    const response = await loginSimple({
      code_id: smsId.value,
      password: loginForm.password,
      username: loginForm.username,
      verify_code: loginForm.verifyCode,
    })

    console.log('=== 登录调试信息 ===')
    console.log('1. 完整响应:', response)
    console.log('2. response.data:', response.data)
    console.log('3. response.data 类型:', typeof response.data)

    // 后端返回的 data 直接就是 token 字符串
    const token = typeof response.data === 'string' ? response.data : (response.data as any)?.token || ''
    
    console.log('4. 提取的 token:', token)
    console.log('5. token 长度:', token.length)
    
    const loginData = {
      token: token,
      userInfo: undefined,
    }
    
    console.log('6. 准备保存的 loginData:', loginData)
    
    // 保存用户信息和 token
    userLogin(loginData)
    
    console.log('7. userLogin 调用完成')
    console.log('8. getToken():', getToken())
    
    // 登录成功后获取用户信息
    try {
      console.log('9. 开始获取用户信息...')
      const userInfoResponse = await authApi.getUserInfo()
      console.log('10. 用户信息响应:', userInfoResponse)
      
      if (userInfoResponse.code === '000000' && userInfoResponse.data) {
        // 使用 userStore 的方法更新用户信息（会自动按 Site 隔离存储）
        userStore.updateUserInfo(userInfoResponse.data)
        console.log('11. 用户信息已保存')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 获取用户信息失败不影响登录流程
    }
    
    console.log('===================')
    
    ElMessage.success(t('login.loginSuccess'))
    visible.value = false
    emit('close')
  } catch (error: any) {
    console.error('登录失败:', error)
    ElMessage.error(error.message || t('login.loginFailed'))
  } finally {
    loading.value = false
  }
}

const switchToReset = () => {
  // 先打开重置密码弹窗，再关闭登录弹窗
  if (proxy?.$resetPopup) {
    proxy.$resetPopup.open()
    setTimeout(() => {
      handleClose()
    }, 50)
  }
  emit('switchToReset')
}

const switchToRegister = async () => {
  // 先打开注册弹窗，再关闭登录弹窗
  if (proxy?.$registerPopup) {
    proxy.$registerPopup.open()
    setTimeout(() => {
      handleClose()
    }, 50)
  }
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

      &.code-wrapper {
        gap: 12px;
      }

      .custom-input {
        height: 50px;
        flex: 1;

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

      .send-code-btn {
        height: 50px;
        padding: 0 20px;
        font-size: 14px;
        font-weight: 500;
        border-radius: 4px;
        background: var(--theme-bg-blue);
        border: none;
        color: var(--theme-text-white);
        white-space: nowrap;
        min-width: 100px;

        &:hover:not(:disabled) {
          background: var(--theme-bg-blue);
          opacity: 0.9;
        }

        &:disabled {
          background: #e0e0e0;
          color: #999;
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
