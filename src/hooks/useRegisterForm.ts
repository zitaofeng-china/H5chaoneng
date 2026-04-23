/**
 * 注册表单业务逻辑 Hook
 */

import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { register, getUserInfo, loginSimple } from '@/api/modules/auth'
import { useFormValidation } from './useFormValidation'
import { handleResponse } from '@/utils/response'
import { useUserStore } from '@/stores/useUserStore'
import type { RegisterForm } from '@/plugins/registerPopup/types'

export function useRegisterForm() {
  const { t } = useI18n()
  const userStore = useUserStore()
  const { usernameRules, emailRules, passwordRules, confirmPasswordRules, telegramRules } = useFormValidation()

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

  /**
   * 表单验证规则
   */
  const rules = computed<FormRules<RegisterForm>>(() => ({
    username: usernameRules.value,
    email: emailRules.value,
    password: passwordRules.value,
    passwords: confirmPasswordRules(() => registerForm.password).value,
  }))

  /**
   * 注册处理
   */
  const handleRegister = async () => {
    if (!registerFormRef.value) return false

    try {
      await registerFormRef.value.validate()
      
      if (registerForm.password !== registerForm.passwords) {
        ElMessage.error(t('register.passwordMismatch'))
        return false
      }
      
      loading.value = true

      // 1. 调用注册接口
      const response = await register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
      })

      const success = handleResponse(response, {
        context: 'register',
        showSuccess: false, // 不显示默认的成功消息，我们会在自动登录后显示
        showError: true, // 显示错误消息（会通过 errorCode.ts 和 response.ts 处理国际化）
      })
      
      if (!success) {
        return false
      }

      // 2. 注册成功后自动登录
      try {
        const loginResponse = await loginSimple({
          code_id: '',
          password: registerForm.password,
          username: registerForm.username,
          verify_code: '',
        })

        // 检查登录响应是否成功
        if (loginResponse.code !== '000000') {
          console.error('[注册后自动登录] 登录失败:', loginResponse.msg)
          ElMessage.warning(t('register.registerSuccessButLoginFailed'))
          return true // 注册成功，但登录失败
        }

        // 保存登录信息
        const token = typeof loginResponse.data === 'string' ? loginResponse.data : (loginResponse.data as any)?.token || ''
        const expiratedAt = typeof loginResponse.data === 'object' ? (loginResponse.data as any)?.expirated_at : undefined
        const expiredAt = expiratedAt ? expiratedAt * 1000 : undefined
        
        const loginData = {
          token: token,
          userInfo: undefined,
          expiredAt: expiredAt,
        }
        
        userStore.login(loginData)
        
        // 获取用户信息
        try {
          const userInfoResponse = await getUserInfo()
          if (userInfoResponse.code === '000000' && userInfoResponse.data) {
            userStore.updateUserInfo(userInfoResponse.data)
          }
        } catch (error) {
          console.error('[注册后自动登录] 获取用户信息失败:', error)
        }
        
        ElMessage.success(t('register.registerAndLoginSuccess'))
        
        // 触发登录成功事件，显示重要提示弹窗
        window.dispatchEvent(new CustomEvent('user-login-success'))
        
        return true
      } catch (loginError: any) {
        console.error('[注册后自动登录] 登录异常:', loginError)
        ElMessage.warning(t('register.registerSuccessButLoginFailed'))
        return true // 注册成功，但登录失败
      }
    } catch (error: any) {
      console.error('[注册] 异常:', error)
      ElMessage.error(error.message || '注册失败，请重试')
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置表单
   */
  const resetForm = () => {
    registerFormRef.value?.resetFields()
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
  const close = () => {
    visible.value = false
    resetForm()
  }

  return {
    visible,
    loading,
    registerForm,
    registerFormRef,
    rules,
    handleRegister,
    resetForm,
    open,
    close,
  }
}
