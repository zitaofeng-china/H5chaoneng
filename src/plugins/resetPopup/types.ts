/**
 * 重置密码弹窗类型定义
 */

export interface ResetForm {
  email: string
  code: string
  password: string
  passwords: string
}

export interface ResetEmits {
  close: []
  switchToReset: []
  switchToRegister: []
}
