/**
 * 登录表单业务逻辑 Hook
 */

import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/useUserStore'
import { loginSimple } from '@/api/modules/auth'
import { authApi } from '@/api'
import { useCountdown } from './useCountdown'
import { useFormValidation } from './useFormValidation'
import type { LoginForm } from '@/plugins/loginPopup/types'

export function useLoginForm() {
  const { t } = useI18n()
  const userStore = useUserStore()
  const { countdown, start: startCountdown } = useCountdown(60)
  const { usernameRules, passwordRules } = useFormValidation()

  const visible = ref(false)
  const loading = ref(false)
  const sendingCode = ref(false)
  const smsId = ref('')
  const loginFormRef = ref<FormInstance>()

  const loginForm = reactive<LoginForm>({
    username: '',
    password: '',
    verifyCode: '',
    remember: false,
  })

  /**
   * 表单验证规则
   */
  const rules = computed<FormRules<LoginForm>>(() => ({
    username: usernameRules.value,
    password: passwordRules.value,
    verifyCode: [
      { len: 6, message: t('login.verifyCodeLength'), trigger: 'blur' },
    ],
  }))

  /**
   * 发送验证码
   */
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
      startCountdown(60)
    } catch (error: any) {
      ElMessage.error(error.message || t('login.sendCodeFailed'))
    } finally {
      sendingCode.value = false
    }
  }

  /**
   * 登录处理
   */
  const handleLogin = async () => {
    if (!loginFormRef.value) return false

    try {
      await loginFormRef.value.validate()
      
      if (!smsId.value) {
        ElMessage.warning(t('login.sendCodeFirst'))
        return false
      }

      loading.value = true

      const response = await loginSimple({
        code_id: smsId.value,
        password: loginForm.password,
        username: loginForm.username,
        verify_code: loginForm.verifyCode,
      })

      // 检查响应是否成功
      if (response.code !== '000000') {
        // 错误已在 errorHandler 中处理，直接返回
        return false
      }

      // 后端返回的 data 直接就是 token 字符串
      const token = typeof response.data === 'string' ? response.data : (response.data as any)?.token || ''
      
      const loginData = {
        token: token,
        userInfo: undefined,
      }
      
      // 保存用户信息和 token
      userStore.login(loginData)
      
      // 登录成功后获取用户信息
      try {
        const userInfoResponse = await authApi.getUserInfo()
        if (userInfoResponse.code === '000000' && userInfoResponse.data) {
          userStore.updateUserInfo(userInfoResponse.data)
        }
      } catch (error) {
        console.error('获取用户信息失败:', error)
        // 获取用户信息失败不影响登录流程
      }
      
      ElMessage.success(t('login.loginSuccess'))
      return true
    } catch (error: any) {
      console.error('登录失败:', error)
      // 错误已在 errorHandler 中统一处理，这里不再重复提示
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置表单
   */
  const resetForm = async () => {
    await loginFormRef.value?.resetFields()
    smsId.value = ''
  }

  /**
   * 打开弹窗
   */
  const open = () => {
    visible.value = true
  }

  /**
   * 关闭弹窗
   */
  const close = async () => {
    visible.value = false
    await resetForm()
  }

  return {
    visible,
    loading,
    sendingCode,
    countdown,
    loginForm,
    loginFormRef,
    rules,
    handleSendCode,
    handleLogin,
    resetForm,
    open,
    close,
  }
}
