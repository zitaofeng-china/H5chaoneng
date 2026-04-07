import { getCurrentInstance, type ComponentPublicInstance } from 'vue'

interface CustomProxy extends ComponentPublicInstance {
  $revisePasswordPopup: {
    open: () => void
    close: () => void
  }
}

export const useRevisePassword = () => {
  const { proxy } = getCurrentInstance() as { proxy: CustomProxy | null }

  const open = () => {
    proxy?.$revisePasswordPopup?.open()
  }

  const close = () => {
    proxy?.$revisePasswordPopup?.close()
  }

  return {
    open,
    close,
  }
}
