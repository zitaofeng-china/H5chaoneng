/**
 * 注册弹窗类型定义
 */

export interface RegisterForm {
  username: string
  email: string
  password: string
  passwords: string
  remember: boolean
}

export interface RegisterEmits {
  close: []
  switchToReset: []
  switchToRegister: []
  switchToLogin: []
}
