/**
 * 登录表单业务逻辑 Hook
 */

import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage } from '@/utils/element'
import { type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/useUserStore'
import { login } from '@/api/modules/auth'
import { authApi } from '@/api'
import { useFormValidation } from './useFormValidation'
import type { LoginForm } from '@/plugins/loginPopup/types'
import {
  clearRememberedLogin,
  getRememberedLogin,
  saveRememberedLogin,
  type RememberedLogin,
} from '@/utils/session'

export function useLoginForm() {
  const { t } = useI18n()
  const userStore = useUserStore()
  const { usernameRules, passwordRules } = useFormValidation()

  const visible = ref(false)
  const loading = ref(false)
  const loginFormRef = ref<FormInstance>()
  const rememberedPreview = ref<RememberedLogin | null>(null)

  const loginForm = reactive<LoginForm>({
    username: '',
    password: '',
    remember: false,
  })

  /**
   * 表单验证规则
   */
  const rules = computed<FormRules<LoginForm>>(() => ({
    username: usernameRules.value,
    password: passwordRules.value,
  }))

  /**
   * 登录处理
   */
  const handleLogin = async () => {
    if (!loginFormRef.value) return false

    try {
      await loginFormRef.value.validate()

      loading.value = true

      const response = await login({
        code_id: '',
        password: loginForm.password,
        username: loginForm.username,
        verify_code: '',
      })

      // 检查响应是否成功
      if (response.code !== '000000') {
        // 特殊处理：网站不存在错误
        let errorMessage = response.msg || t('login.loginFailed')
        const trimmedMsg = (response.msg || '').trim()
        if (response.code === '000007' && (trimmedMsg === '网站不存在' || trimmedMsg.includes('网站不存在'))) {
          errorMessage = t('error.siteNotExist')
        }
        
        // 显示错误信息
        ElMessage.error(errorMessage)
        return false
      }

      // 后端返回的 data 可能是 token 字符串或包含 token 和 expirated_at 的对象
      const token = typeof response.data === 'string' ? response.data : (response.data as any)?.token || ''
      // 注意：后端字段名是 expirated_at（下划线），需要转换为毫秒时间戳
      const expiratedAt = typeof response.data === 'object' ? (response.data as any)?.expirated_at : undefined
      const expiredAt = expiratedAt ? expiratedAt * 1000 : undefined // 转换为毫秒
      
      console.log('[Login] Token 过期时间:', expiredAt, new Date(expiredAt || 0).toLocaleString())
      
      const loginData = {
        token: token,
        userInfo: undefined,
        expiredAt: expiredAt,
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
      
      // 处理记住密码
      if (loginForm.remember) {
        saveRememberedLogin(loginForm.username, loginForm.password)
      } else {
        clearRememberedLogin()
      }
      refreshRememberedPreview()
      
      ElMessage.success(t('login.loginSuccess'))
      
      // 触发登录成功事件，显示重要提示弹窗
      window.dispatchEvent(new CustomEvent('user-login-success'))
      
      return true
    } catch (error: any) {
      console.error('登录失败:', error)
      // 显示错误信息
      ElMessage.error(error.message || t('login.loginFailed'))
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 重置表单
   */
  const resetForm = () => {
    loginFormRef.value?.resetFields()
  }

  /**
   * 打开弹窗
   */
  const open = () => {
    visible.value = true
    // 打开弹窗时加载记住的密码
    loadRememberPassword()
  }

  /**
   * 关闭弹窗
   */
  const close = () => {
    visible.value = false
    resetForm()
  }

  const refreshRememberedPreview = () => {
    rememberedPreview.value = getRememberedLogin()
  }

  /**
   * 加载记住的密码
   */
  const loadRememberPassword = () => {
    const saved = getRememberedLogin()
    if (saved) {
      loginForm.username = saved.username
      loginForm.password = saved.password
      loginForm.remember = saved.remember
      refreshRememberedPreview()
      return
    }

    loginForm.username = ''
    loginForm.password = ''
    loginForm.remember = false
    refreshRememberedPreview()
  }

  const saveRememberedDemo = () => {
    saveRememberedLogin(loginForm.username, loginForm.password)
    loginForm.remember = true
    refreshRememberedPreview()
    ElMessage.success('Demo：账号和密码已写入 localStorage')
  }

  const clearRememberedDemo = () => {
    clearRememberedLogin()
    loginForm.remember = false
    refreshRememberedPreview()
    ElMessage.success('Demo：本地记住密码缓存已清除')
  }

  // 组件挂载时加载记住的密码
  onMounted(() => {
    loadRememberPassword()
  })

  return {
    visible,
    loading,
    loginForm,
    loginFormRef,
    rememberedPreview,
    rules,
    handleLogin,
    resetForm,
    saveRememberedDemo,
    clearRememberedDemo,
    open,
    close,
  }
}
