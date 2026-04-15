/**
 * 登录弹窗类型定义
 */

export interface LoginForm {
  username: string
  password: string
  verifyCode: string
  remember: boolean
}

export interface LoginEmits {
  close: []
  switchToReset: []
  switchToRegister: []
}
