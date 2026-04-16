import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { LoginResponse } from '@/api/modules/auth/types'
import { getToken, setToken, removeToken, setRefreshToken, removeRefreshToken, getUserInfo as getStoredUserInfo, setUserInfo, removeUserInfo } from '@/utils/token'
import { logout as logoutApi, getUserInfo as getUserInfoApi } from '@/api/modules/auth'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<LoginResponse['userInfo'] | null>(null)

  const isLogin = computed(() => !!token.value)

  // 初始化：从当前 Site 的存储中加载
  function init() {
    token.value = getToken() || ''
    userInfo.value = getStoredUserInfo()
  }

  function login(response: LoginResponse) {
    token.value = response.token
    userInfo.value = response.userInfo || null
    
    setToken(response.token)
    
    if (response.userInfo) {
      setUserInfo(response.userInfo)
    }
    
    if (response.refreshToken) {
      setRefreshToken(response.refreshToken)
    }
  }

  async function logout() {
    try {
      // 调用后端登出接口
      await logoutApi()
    } catch (error) {
      console.error('登出接口调用失败:', error)
      // 即使接口失败，也要清除本地数据
    } finally {
      // 清除本地存储
      token.value = ''
      userInfo.value = null
      
      removeToken()
      removeRefreshToken()
      removeUserInfo()
    }
  }

  // 更新用户信息（登录后获取用户信息时使用）
  function updateUserInfo(info: LoginResponse['userInfo']) {
    userInfo.value = info || null
    if (info) {
      setUserInfo(info)
    }
  }

  // 从服务器获取用户信息
  async function fetchUserInfo() {
    try {
      const response = await getUserInfoApi()
      if (response.code === 0 && response.data) {
        updateUserInfo(response.data)
        return response.data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return null
    }
  }

  return {
    token,
    userInfo,
    isLogin,
    init,
    login,
    logout,
    updateUserInfo,
    fetchUserInfo,
  }
})
