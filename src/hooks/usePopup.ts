import { getCurrentInstance, type ComponentPublicInstance } from 'vue'

interface PopupControl {
  open: () => void
  close: () => void
}

type PopupName = 'loginPopup' | 'registerPopup' | 'resetPopup' | 'revisePasswordPopup' | 'rechargePopup' | 'userInfoPopup'

export function usePopup(popupName: PopupName) {
  const { proxy } = getCurrentInstance() as { 
    proxy: ComponentPublicInstance & Record<`$${PopupName}`, PopupControl> | null 
  }

  const open = () => {
    proxy?.[`$${popupName}`]?.open()
  }

  const close = () => {
    proxy?.[`$${popupName}`]?.close()
  }

  return {
    open,
    close,
  }
}

export const useLogin = () => usePopup('loginPopup')
export const useRegister = () => usePopup('registerPopup')
export const useReset = () => usePopup('resetPopup')
export const useRevisePasswordPopup = () => usePopup('revisePasswordPopup')
export const useRechargePopup = () => usePopup('rechargePopup')
export const useUserInfoPopup = () => usePopup('userInfoPopup')
