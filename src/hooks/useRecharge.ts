import { getCurrentInstance, type ComponentPublicInstance } from 'vue'

interface CustomProxy extends ComponentPublicInstance {
  $rechargePopup: {
    open: () => void
    close: () => void
  }
}

export const useRecharge = () => {
  const { proxy } = getCurrentInstance() as { proxy: CustomProxy | null }

  const open = () => {
    proxy?.$rechargePopup?.open()
  }

  const close = () => {
    proxy?.$rechargePopup?.close()
  }

  return {
    open,
    close,
  }
}
