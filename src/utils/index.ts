import { useCommonStore } from '@/stores/useCommonStore'

/**
 * 打开Telegram链接
 * @param username - Telegram用户名（可以带或不带 @ 符号）
 */
export const handleOpenToTelegram = (username: string) => {
  if (!username) return
  
  // 移除开头的 @ 符号（如果有）
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username
  
  window.open(`https://t.me/${cleanUsername}`, '_blank')
}

/**
 * 打开Telegram机器人链接
 * @param botId - Telegram机器人ID（数字）或用户名（字符串）
 * 
 * 注意：如果传入的是数字ID，由于Telegram Web不支持纯数字ID跳转，
 * 建议后端提供机器人用户名（bot_username）以获得更好的用户体验
 */
export const handleOpenToTelegramBot = (botId: string | number) => {
  if (!botId) return
  
  // 如果是数字ID
  if (typeof botId === 'number' || /^\d+$/.test(botId.toString())) {
    // 尝试使用 Telegram Web 的 start 参数格式
    // 这会尝试打开 Telegram 应用，如果没有安装则打开 Telegram Web
    const telegramUrl = `https://t.me/bot?start=${botId}`
    window.open(telegramUrl, '_blank')
  } else {
    // 如果是用户名，移除 @ 符号
    const cleanUsername = botId.toString().startsWith('@') 
      ? botId.toString().slice(1) 
      : botId.toString()
    window.open(`https://t.me/${cleanUsername}`, '_blank')
  }
}

/**
 * 打开X账号链接
 * @param username - X账号用户名（可以带或不带 @ 符号）
 */
export const handleOXAccount = (username: string) => {
  if (!username) return
  
  // 移除开头的 @ 符号（如果有）
  const cleanUsername = username.startsWith('@') ? username.slice(1) : username
  
  const url = `https://x.com/${cleanUsername}`
  window.open(url, '_blank')
}

export const handleOpenEmail = (mailto: string) => {
  window.open(`mailto:${mailto}`, '_blank')
}

/**
 * 判断是否为移动端
 * @returns boolean
 */
export const isMobile = () => {
  const commonStore = useCommonStore()

  return (
    commonStore.isMobile ||
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  )
}
