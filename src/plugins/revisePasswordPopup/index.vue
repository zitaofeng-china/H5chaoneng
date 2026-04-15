<template>
  <div class="revise-dialog">
    <el-dialog
      v-model="visible"
      :show-close="true"
      :width="416"
      center
      align-center
      :autofocus="false"
      @close="handleClose"
    >
      <template #header>
        <div class="revise-title">{{ t('revisePassword.title') }}</div>
      </template>
      <el-form
        :model="revisePasswordForm"
        :rules="rules"
        :label-width="70"
        ref="revisePasswordFormRef"
        class="login-form"
      >
        <el-form-item :label="t('revisePassword.oldPassword')" prop="password">
          <div class="input-wrapper">
            <el-input
              v-model="revisePasswordForm.password"
              type="password"
              :placeholder="t('revisePassword.oldPasswordPlaceholder')"
              size="large"
              class="custom-input"
              show-password
            >
            </el-input>
          </div>
        </el-form-item>

        <el-form-item :label="t('revisePassword.newPassword')" prop="newPassword">
          <div class="input-wrapper">
            <el-input
              v-model="revisePasswordForm.newPassword"
              type="password"
              :placeholder="t('revisePassword.newPasswordPlaceholder')"
              size="large"
              class="custom-input"
              show-password
            >
            </el-input>
          </div>
        </el-form-item>
        <el-button
          type="primary"
          size="large"
          class="login-btn"
          @click="handleLogin"
          :loading="loading"
        >
          {{ t('revisePassword.button') }}
        </el-button>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, getCurrentInstance } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { authApi } from '@/api'
import { useUserStore } from '@/stores/useUserStore'

defineOptions({
  name: 'RevisePasswordPopup',
})
interface RevisePasswordForm {
  password: string
  newPassword: string
}

const { t } = useI18n()
const { proxy } = getCurrentInstance()!
const userStore = useUserStore()

const visible = ref(false)
const loading = ref(false)
const revisePasswordFormRef = ref<FormInstance>()

const revisePasswordForm = reactive<RevisePasswordForm>({
  password: '',
  newPassword: '',
})

const rules = computed<FormRules<RevisePasswordForm>>(() => ({
  password: [
    { required: true, message: t('revisePassword.oldPasswordPlaceholder'), trigger: 'blur' },
    { min: 6, message: t('login.passwordMinLength'), trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: t('revisePassword.newPasswordPlaceholder'), trigger: 'blur' },
    { min: 6, message: t('login.passwordMinLength'), trigger: 'blur' },
  ],
}))

const emit = defineEmits<{
  close: []
}>()

const handleClose = async () => {
  visible.value = false
  await revisePasswordFormRef.value?.resetFields()
  emit('close')
}

const handleLogin = async () => {
  if (!revisePasswordFormRef.value) return

  try {
    await revisePasswordFormRef.value.validate()
    loading.value = true

    // 调用修改密码接口
    const response = await authApi.changePassword({
      password: revisePasswordForm.password,
      new_password: revisePasswordForm.newPassword,
    })

    // 修改成功
    if (response.code === '000000') {
      ElMessage.success(t('revisePassword.success'))
      visible.value = false
      emit('close')
      
      // 修改密码成功后，延迟退出登录
      setTimeout(() => {
        userStore.logout()
        ElMessage.info(t('revisePassword.logoutTip'))
        // 打开登录弹窗
        setTimeout(() => {
          proxy?.$loginPopup?.open()
        }, 500)
      }, 1000)
    } else {
      ElMessage.error(response.message || t('revisePassword.failed'))
    }
  } catch (error: any) {
    console.error('修改密码失败:', error)
    ElMessage.error(error.message || t('revisePassword.failed'))
  } finally {
    loading.value = false
  }
}

const open = () => {
  visible.value = true
}

const close = () => {
  visible.value = false
}
defineExpose({
  open,
  close,
  visible,
})
</script>

<style lang="scss" scoped>
.revise-dialog {
  .revise-title {
    margin-top: 5px;
    margin-bottom: 10px;
    font-size: 20px;
    font-weight: 600;
    color: var(--theme-text-black);
  }

  .input-wrapper {
    width: 100%;
  }

  .login-btn {
    margin-top: 10px;
    width: 100%;
    height: 50px;
    font-size: 18px;
    font-weight: 600;
    border-radius: 8px;
    background: var(--theme-bg-blue);
    border: none;
    color: var(--theme-text-white);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(64, 158, 255, 0.35);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
    }

    &.is-loading {
      opacity: 0.8;
    }

    :deep(.el-icon) {
      margin-right: 6px;
    }
  }

  :deep(.el-form-item) {
    &:first-child {
      .el-input__inner {
        font-weight: 600;
      }
    }
  }

  :deep(.el-form-item__label) {
    color: var(--theme-text-muted);
    font-weight: 600;

    &::before {
      display: none;
    }
  }

  :deep(.el-dialog) {
    border-radius: 8px;
    padding: 24px;
  }

  :deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text-black);
  }

  :deep(.el-dialog__close) {
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text-black);
  }

  :deep(.el-dialog__header.show-close) {
    padding-right: 0;
  }

  :deep(.el-dialog__headerbtn) {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    top: 24px;
    right: 24px;
    background: var(--theme-gray-bg-light);
  }
}

@media (max-width: 768px) {
  :deep(.el-dialog) {
    --el-dialog-width: 90% !important;
  }
}
</style>
