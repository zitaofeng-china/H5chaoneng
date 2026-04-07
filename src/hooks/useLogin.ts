import { getCurrentInstance, type ComponentPublicInstance } from 'vue'

interface CustomProxy extends ComponentPublicInstance {
  $loginPopup: {
    open: () => void
    close: () => void
  }
}

export const useLogin = () => {
  const { proxy } = getCurrentInstance() as { proxy: CustomProxy | null }

  const open = () => {
    proxy?.$loginPopup?.open()
  }

  const close = () => {
    proxy?.$loginPopup?.close()
  }

  return {
    open,
    close,
  }
}
