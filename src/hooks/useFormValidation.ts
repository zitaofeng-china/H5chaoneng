/**
 * 表单验证规则 Hook
 * 提供常用的表单验证规则
 */

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { FormItemRule } from 'element-plus'

export function useFormValidation() {
  const { t } = useI18n()

  /**
   * 地址验证规则
   */
  const addressRules = computed<FormItemRule[]>(() => [
    { required: true, message: t('formValidation.addressRequired'), trigger: 'blur' },
    { min: 10, message: t('formValidation.addressTooShort'), trigger: 'blur' },
  ])

  /**
   * 邮箱验证规则
   */
  const emailRules = computed<FormItemRule[]>(() => [
    { required: true, message: t('login.emailRequired'), trigger: 'blur' },
    { type: 'email', message: t('login.emailInvalid'), trigger: 'blur' },
  ])

  /**
   * 用户名验证规则
   */
  const usernameRules = computed<FormItemRule[]>(() => [
    { required: true, message: t('login.usernameRequired'), trigger: 'blur' },
  ])

  /**
   * 密码验证规则
   */
  const passwordRules = computed<FormItemRule[]>(() => [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
    { min: 6, message: t('login.passwordMinLength'), trigger: 'blur' },
  ])

  /**
   * 确认密码验证规则（需要传入原密码的 getter）
   * @param getPassword - 获取原密码的函数
   * @returns 确认密码验证规则
   */
  const confirmPasswordRules = (getPassword: () => string) => computed<FormItemRule[]>(() => [
    { required: true, message: t('register.confirmPassword'), trigger: 'blur' },
    { min: 6, message: t('login.passwordMinLength'), trigger: 'blur' },
    {
      validator: (_rule, value, callback) => {
        if (value && value !== getPassword()) {
          callback(new Error(t('register.passwordMismatch')))
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change'],
    },
  ])

  /**
   * 验证码规则（6位）
   */
  const verifyCodeRules = computed<FormItemRule[]>(() => [
    { required: true, message: t('login.verifyCodeRequired'), trigger: 'blur' },
    { len: 6, message: t('login.verifyCodeLength'), trigger: 'blur' },
  ])

  /**
   * 单价验证规则
   */
  const unitPriceRules = computed<FormItemRule[]>(() => [
    { required: true, message: t('formValidation.unitPriceRequired'), trigger: 'blur' },
    { pattern: /^\d+(\.\d+)?$/, message: t('formValidation.unitPriceInvalid'), trigger: 'blur' },
  ])

  /**
   * Telegram 验证规则
   */
  const telegramRules = computed<FormItemRule[]>(() => [
    { required: true, message: t('register.telegramRequired'), trigger: 'blur' },
  ])

  return {
    addressRules,
    emailRules,
    usernameRules,
    passwordRules,
    confirmPasswordRules,
    verifyCodeRules,
    unitPriceRules,
    telegramRules,
  }
}
