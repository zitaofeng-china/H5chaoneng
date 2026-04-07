import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const token = ref(localStorage.getItem('token') || '')

  const isLogin = computed(() => !!token.value)

  async function login() {
    token.value = 'token342342342342' // mock token
    localStorage.setItem('token', token.value)
  }

  function logout() {
    token.value = ''
    localStorage.removeItem('token')
  }

  return {
    isLogin,
    login,
    logout,
  }
})
