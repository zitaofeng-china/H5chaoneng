/**
 * 修改密码业务逻辑 Hook
 */

import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/useUserStore'
import { authApi } from '@/api'
import type { RevisePasswordForm } from '@/plugins/revisePasswordPopup/types'

export function useRevisePassword() {
  const { t } = useI18n()
  const { proxy } = getCurrentInstance()!
  const userStore = useUserStore()

  const visible = ref(false)
  const loading = ref(false)
  const revisePasswordFormRef = ref<FormInstance>()

  const revisePasswordForm = reactive<RevisePasswordForm>({
    password: '',
    newPassword: '',
  })

  /**
   * 表单验证规则
   */
  const rules = computed<FormRules<RevisePasswordForm>>(() => ({
    password: [
      { required: true, message: t('revisePassword.oldPasswordPlaceholder'), trigger: 'blur' },
      { min: 6, message: t('login.passwordMinLength'), trigger: 'blur' },
    ],
    newPassword: [
      { required: true, message: t('revisePassword.newPasswordPlaceholder'), trigger: 'blur' },
      { min: 6, message: t('login.passwordMinLength'), trigger: 'blur' },
    ],
  }))

  /**
   * 修改密码处理
   */
  const handleChangePassword = async () => {
    if (!revisePasswordFormRef.value) return false

    try {
      await revisePasswordFormRef.value.validate()
      loading.value = true

      // 调用修改密码接口
      const response = await authApi.changePassword({
        password: revisePasswordForm.password,
        new_password: revisePasswordForm.newPassword,
      })

      // 修改成功
      if (response.code === '000000') {
        ElMessage.success(t('revisePassword.success'))
        
        // 修改密码成功后，延迟退出登录
        setTimeout(() => {
          userStore.logout()
          ElMessage.info(t('revisePassword.logoutTip'))
          // 打开登录弹窗
          setTimeout(() => {
            proxy?.$loginPopup?.open()
          }, 500)
        }, 1000)
        
        return true
      } else {
        // 错误已在 errorHandler 中处理，直接返回
        return false
      }
    } catch (error: any) {
      console.error('修改密码失败:', error)
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
    await revisePasswordFormRef.value?.resetFields()
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
    revisePasswordForm,
    revisePasswordFormRef,
    rules,
    handleChangePassword,
    resetForm,
    open,
    close,
  }
}
