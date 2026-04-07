import { getCurrentInstance, type ComponentPublicInstance } from 'vue'

interface CustomProxy extends ComponentPublicInstance {
  $resetPopup: {
    open: () => void
    close: () => void
  }
}

export const useReset = () => {
  const { proxy } = getCurrentInstance() as { proxy: CustomProxy | null }

  const open = () => {
    proxy?.$resetPopup?.open()
  }

  const close = () => {
    proxy?.$resetPopup?.close()
  }

  return {
    open,
    close,
  }
}
