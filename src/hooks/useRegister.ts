import { getCurrentInstance, type ComponentPublicInstance } from 'vue'

interface CustomProxy extends ComponentPublicInstance {
  $registerPopup: {
    open: () => void
    close: () => void
  }
}

export const useRegister = () => {
  const { proxy } = getCurrentInstance() as { proxy: CustomProxy | null }

  const open = () => {
    proxy?.$registerPopup?.open()
  }

  const close = () => {
    proxy?.$registerPopup?.close()
  }

  return {
    open,
    close,
  }
}
