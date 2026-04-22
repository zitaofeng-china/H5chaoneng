import { ref, type Ref } from 'vue'
import type { FormInstance } from 'element-plus'

export function useFormDialog() {
  const visible = ref(false)
  const loading = ref(false)
  const formRef = ref<FormInstance>()

  const open = () => {
    visible.value = true
  }

  const close = () => {
    visible.value = false
    formRef.value?.resetFields()
  }

  const setLoading = (value: boolean) => {
    loading.value = value
  }

  return {
    visible,
    loading,
    formRef,
    open,
    close,
    setLoading,
  }
}
