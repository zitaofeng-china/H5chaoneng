/**
 * 登录表单业务逻辑 Hook
 */

import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/stores/useUserStore'
import { loginSimple } from '@/api/modules/auth'
import { authApi } from '@/api'
import { useFormValidation } from './useFormValidation'
import type { LoginForm } from '@/plugins/loginPopup/types'

// 记住密码的存储 key
const REMEMBER_PASSWORD_KEY = 'remember_password'
const SAVED_USERNAME_KEY = 'saved_username'
const SAVED_PASSWORD_KEY = 'saved_password'

interface RememberPasswordData {
  username: string
  password: string
}

/**
 * 保存记住的密码
 */
function saveRememberPassword(username: string, password: string) {
  localStorage.setItem(REMEMBER_PASSWORD_KEY, 'true')
  localStorage.setItem(SAVED_USERNAME_KEY, username)
  localStorage.setItem(SAVED_PASSWORD_KEY, password)
}

/**
 * 获取记住的密码
 */
function getRememberPassword(): RememberPasswordData | null {
  const remember = localStorage.getItem(REMEMBER_PASSWORD_KEY)
  if (remember === 'true') {
    const username = localStorage.getItem(SAVED_USERNAME_KEY) || ''
    const password = localStorage.getItem(SAVED_PASSWORD_KEY) || ''
    return { username, password }
  }
  return null
}

/**
 * 清除记住的密码
 */
function clearRememberPassword() {
  localStorage.removeItem(REMEMBER_PASSWORD_KEY)
  localStorage.removeItem(SAVED_USERNAME_KEY)
  localStorage.removeItem(SAVED_PASSWORD_KEY)
}

export function useLoginForm() {
  const { t } = useI18n()
  const userStore = useUserStore()
  const { usernameRules, passwordRules } = useFormValidation()

  const visible = ref(false)
  const loading = ref(false)
  const loginFormRef = ref<FormInstance>()

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

      const response = await loginSimple({
        code_id: '',
        password: loginForm.password,
        username: loginForm.username,
        verify_code: '',
      })

      // 检查响应是否成功
      if (response.code !== '000000') {
        // 显示后端返回的错误信息
        ElMessage.error(response.msg || t('login.loginFailed'))
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
      
      // 处理记住密码
      if (loginForm.remember) {
        saveRememberPassword(loginForm.username, loginForm.password)
      } else {
        clearRememberPassword()
      }
      
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
  const resetForm = async () => {
    await loginFormRef.value?.resetFields()
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
  const close = async () => {
    visible.value = false
    await resetForm()
  }

  /**
   * 加载记住的密码
   */
  const loadRememberPassword = () => {
    const saved = getRememberPassword()
    if (saved) {
      loginForm.username = saved.username
      loginForm.password = saved.password
      loginForm.remember = true
    }
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
    rules,
    handleLogin,
    resetForm,
    open,
    close,
  }
}
