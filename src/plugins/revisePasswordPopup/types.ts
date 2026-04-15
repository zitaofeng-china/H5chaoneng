/**
 * 修改密码弹窗类型定义
 */

export interface RevisePasswordForm {
  password: string
  newPassword: string
}

export interface RevisePasswordEmits {
  close: []
}
