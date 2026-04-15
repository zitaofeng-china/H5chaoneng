import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { LoginResponse } from '@/api/modules/auth/types'
import { getToken, setToken, removeToken, setRefreshToken, removeRefreshToken, getUserInfo, setUserInfo, removeUserInfo } from '@/utils/token'

export const useUserStore = defineStore('user', () => {
  const token = ref('')
  const userInfo = ref<LoginResponse['userInfo'] | null>(null)

  const isLogin = computed(() => !!token.value)

  // 初始化：从当前 Site 的存储中加载
  function init() {
    token.value = getToken() || ''
    userInfo.value = getUserInfo()
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

  function logout() {
    token.value = ''
    userInfo.value = null
    
    removeToken()
    removeRefreshToken()
    removeUserInfo()
  }

  // 更新用户信息（登录后获取用户信息时使用）
  function updateUserInfo(info: LoginResponse['userInfo']) {
    userInfo.value = info || null
    if (info) {
      setUserInfo(info)
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
  }
})
