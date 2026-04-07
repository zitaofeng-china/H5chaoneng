import { useCommonStore } from '@/stores/useCommonStore'

/**
 * 打开Telegram链接
 * @param username - Telegram用户名
 */
export const handleOpenToTelegram = (username: string) => {
  window.open(`https://t.me/${username}`, '_blank')
}

/**
 * 打开X账号链接
 * @param username - X账号用户名
 */
export const handleOXAccount = (username: string) => {
  const url = `https://x.com/${username}`
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
