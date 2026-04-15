/**
 * 充值弹窗类型定义
 */

export interface TableRow {
  label: string
  value: string
  type?: 'address' | 'text'
}

export interface UserAccountInfo {
  accountNumber: string
  email: string
  tgOfficialNumber: string
  trxAmount: string
}
