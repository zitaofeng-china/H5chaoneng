/**
 * 注册表单业务逻辑 Hook
 */

import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { authApi } from '@/api'
import { useFormValidation } from './useFormValidation'
import { handleResponse } from '@/utils/response'
import type { RegisterForm } from '@/plugins/registerPopup/types'

export function useRegisterForm() {
  const { t } = useI18n()
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

      const response = await authApi.register({
        username: registerForm.username,
        email: registerForm.email,
        password: registerForm.password,
      })

      const success = handleResponse(response, {
        context: 'register',
      })
      
      return success
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
