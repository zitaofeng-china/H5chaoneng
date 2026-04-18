/**
 * 重置密码表单业务逻辑 Hook
 */

import { ref, reactive, computed } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { authApi } from '@/api'
import { useCountdown } from './useCountdown'
import { useFormValidation } from './useFormValidation'
import type { ResetForm } from '@/plugins/resetPopup/types'

export function useResetForm() {
  const { t } = useI18n()
  const { countdown, start: startCountdown } = useCountdown(60)
  const { emailRules, passwordRules, confirmPasswordRules } = useFormValidation()

  const visible = ref(false)
  const loading = ref(false)
  const resetFormRef = ref<FormInstance>()

  const resetForm = reactive<ResetForm>({
    email: '',
    code: '',
    password: '',
    passwords: '',
  })

  /**
   * 表单验证规则
   */
  const rules = computed<FormRules<ResetForm>>(() => ({
    email: emailRules.value,
    code: [
      { required: true, message: t('reset.codePlaceholder'), trigger: 'blur' },
      { min: 6, message: t('login.verifyCodeLength'), trigger: 'blur' },
    ],
    password: passwordRules.value,
    passwords: confirmPasswordRules(() => resetForm.password).value,
  }))

  /**
   * 发送验证码
   */
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

    try {
      // 调用发送邮箱验证码接口
      // channel 参数固定为 "change_passwd"
      const response = await authApi.sendEmailCode({
        channel: 'change_passwd', // 固定为 change_passwd
        email: resetForm.email,
      })

      if (response.code === '000000') {
        startCountdown(60)
        ElMessage.success(t('reset.codeSent'))
      } else {
        ElMessage.error(response.msg || t('login.sendCodeFailed'))
      }
    } catch (error: any) {
      console.error('发送验证码失败:', error)
      ElMessage.error(error.message || t('login.sendCodeFailed'))
    }
  }

  /**
   * 密码输入变化处理
   */
  const handlePasswordChange = () => {
    if (resetForm.passwords && resetFormRef.value) {
      resetFormRef.value.validateField('passwords')
    }
  }

  /**
   * 重置密码处理
   */
  const handleReset = async () => {
    if (!resetFormRef.value) return false

    try {
      await resetFormRef.value.validate()

      // 验证两次密码是否一致
      if (resetForm.password !== resetForm.passwords) {
        ElMessage.error(t('register.passwordMismatch'))
        return false
      }

      loading.value = true

      // 调用重置密码接口
      const response = await authApi.resetPassword({
        email: resetForm.email,
        password: resetForm.password,
        verify_code: resetForm.code,
      })

      // 重置成功
      if (response.code === '000000') {
        ElMessage.success(t('reset.resetSuccess'))
        return true
      } else {
        // 错误已在 errorHandler 中处理，直接返回
        return false
      }
    } catch (error: any) {
      console.error('重置密码失败:', error)
      // 错误已在 errorHandler 中统一处理，这里不再重复提示
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置表单
   */
  const resetFormFields = () => {
    resetFormRef.value?.resetFields()
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
    resetFormFields()
  }

  return {
    visible,
    loading,
    countdown,
    resetForm,
    resetFormRef,
    rules,
    handleSendVerificationCode,
    handlePasswordChange,
    handleReset,
    resetFormFields,
    open,
    close,
  }
}
