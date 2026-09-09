<template>
  <!-- PC端：保持已验证完美的 864px 双栏弹窗（用户确认：PC端的是正确了） -->
  <div v-if="!isMobile" class="reset-dialog is-desktop">
    <el-dialog
      v-model="visible"
      class="reset-dialog-modal is-desktop"
      :show-close="true"
      :width="864"
      header-class="reset-header"
      align-center
      @close="handleClose"
    >
      <div class="reset-container is-desktop">
        <div class="reset-background" aria-hidden="true">
          <img :src="RegisterBg" alt="" class="reset-bg" />
          <div class="reset-bg-blur" />
          <div class="reset-bg-fade" />
        </div>

        <div class="reset-right">
          <div class="reset-header">
            <div class="reset-title">{{ t('reset.title') }}</div>
            <div class="reset-subtitle">{{ t('reset.subtitle') }}</div>
          </div>

          <el-form :model="resetForm" :rules="rules" ref="resetFormRef" class="reset-form is-desktop">
            <el-form-item prop="email">
              <div class="input-wrapper">
                <el-input
                  v-model="resetForm.email"
                  :placeholder="t('reset.emailPlaceholder')"
                  size="large"
                  class="custom-input"
                  autocomplete="email"
                >
                  <template #prefix>
                    <SvgIcon name="login-email" width="24" height="24" />
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <el-form-item prop="code">
              <div class="input-wrapper">
                <el-input
                  v-model="resetForm.code"
                  :placeholder="t('reset.codePlaceholder')"
                  size="large"
                  class="custom-input"
                >
                  <template #prefix>
                    <SvgIcon name="login-code" width="24" height="24" />
                  </template>
                  <template #suffix>
                    <div class="code-suffix">
                      <span class="code-divider" />
                      <span
                        class="countdown-btn tactile-btn"
                        :class="{ disabled: countdown > 0 }"
                        @click="handleSendVerificationCode"
                      >
                        {{ countdown > 0 ? `${countdown}s` : t('reset.getCode') }}
                      </span>
                    </div>
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <el-form-item prop="password">
              <div class="input-wrapper">
                <el-input
                  v-model="resetForm.password"
                  type="password"
                  :placeholder="t('reset.passwordPlaceholder')"
                  size="large"
                  class="custom-input"
                  show-password
                  autocomplete="new-password"
                >
                  <template #prefix>
                    <SvgIcon name="login-password" width="24" height="24" />
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <el-form-item prop="passwords">
              <div class="input-wrapper">
                <el-input
                  v-model="resetForm.passwords"
                  type="password"
                  :placeholder="t('reset.confirmPassword')"
                  size="large"
                  class="custom-input"
                  show-password
                  autocomplete="new-password"
                  @input="handlePasswordChange"
                >
                  <template #prefix>
                    <SvgIcon name="login-password" width="24" height="24" />
                  </template>
                </el-input>
              </div>
            </el-form-item>

            <el-form-item class="reset-submit">
              <el-button
                type="primary"
                size="large"
                class="reset-btn tactile-btn"
                @click="onReset"
                :loading="loading"
              >
                {{ t('reset.resetButton') }}
              </el-button>
            </el-form-item>

            <div class="login-link">
              <span>{{ t('register.hasAccount') }}</span>
              <el-link type="primary" @click="switchToLogin">{{ t('register.login') }}</el-link>
            </div>
          </el-form>
        </div>
      </div>
    </el-dialog>
  </div>

  <!-- 移动端：完全脱离 el-dialog 弹窗模型，100% 视口满屏原生页面（彻底解决类弹窗、外围灰底遮罩与右侧裁切溢出） -->
  <teleport to="body">
    <transition name="mobile-page-slide">
      <div v-if="isMobile && visible" class="mobile-reset-page">
        <!-- 顶部关闭按钮（适配顶部安全区） -->
        <div class="mobile-page-header">
          <button
            type="button"
            class="mobile-close-btn tactile-btn"
            aria-label="Close"
            @click="handleClose"
          >
            <el-icon :size="13"><Close /></el-icon>
          </button>
        </div>

        <div class="mobile-scroll-container">
          <!-- 顶部 3D 视觉横幅 -->
          <div class="mobile-reset-hero" aria-hidden="true">
            <img :src="RegisterBg" alt="" class="hero-img" />
            <div class="hero-fade" />
          </div>

          <!-- 表单核心区域 -->
          <div class="mobile-reset-body">
            <div class="mobile-reset-header">
              <div class="mobile-reset-title">{{ t('reset.title') }}</div>
            </div>

            <el-form
              :model="resetForm"
              :rules="rules"
              ref="resetFormRef"
              class="mobile-reset-form"
            >
              <!-- 邮箱 -->
              <el-form-item prop="email">
                <div class="mobile-input-wrapper">
                  <el-input
                    v-model="resetForm.email"
                    :placeholder="t('reset.emailPlaceholder')"
                    size="large"
                    class="mobile-custom-input"
                    autocomplete="email"
                  >
                    <template #prefix>
                      <SvgIcon name="login-email" width="22" height="22" />
                    </template>
                  </el-input>
                </div>
              </el-form-item>

              <!-- 验证码：自适应满宽左右双控件排列，绝不右溢截断 -->
              <el-form-item prop="code" class="mobile-code-item">
                <div class="mobile-code-wrapper">
                  <el-input
                    v-model="resetForm.code"
                    :placeholder="t('reset.codePlaceholder')"
                    size="large"
                    class="mobile-custom-input mobile-code-input"
                  >
                    <template #prefix>
                      <SvgIcon name="login-code" width="22" height="22" />
                    </template>
                  </el-input>
                  <el-button
                    type="primary"
                    plain
                    class="mobile-code-btn tactile-btn"
                    :disabled="countdown > 0"
                    @click="handleSendVerificationCode"
                  >
                    {{ countdown > 0 ? `${countdown}s` : t('reset.getCode') }}
                  </el-button>
                </div>
              </el-form-item>

              <!-- 新密码 -->
              <el-form-item prop="password">
                <div class="mobile-input-wrapper">
                  <el-input
                    v-model="resetForm.password"
                    type="password"
                    :placeholder="t('reset.passwordPlaceholder')"
                    size="large"
                    class="mobile-custom-input"
                    show-password
                    autocomplete="new-password"
                  >
                    <template #prefix>
                      <SvgIcon name="login-password" width="22" height="22" />
                    </template>
                  </el-input>
                </div>
              </el-form-item>

              <!-- 确认密码 -->
              <el-form-item prop="passwords">
                <div class="mobile-input-wrapper">
                  <el-input
                    v-model="resetForm.passwords"
                    type="password"
                    :placeholder="t('reset.confirmPassword')"
                    size="large"
                    class="mobile-custom-input"
                    show-password
                    autocomplete="new-password"
                    @input="handlePasswordChange"
                  >
                    <template #prefix>
                      <SvgIcon name="login-password" width="22" height="22" />
                    </template>
                  </el-input>
                </div>
              </el-form-item>

              <!-- 确认重置按钮 -->
              <el-form-item class="mobile-submit-item">
                <el-button
                  type="primary"
                  size="large"
                  class="mobile-reset-btn tactile-btn"
                  @click="onReset"
                  :loading="loading"
                >
                  {{ t('reset.resetButton') }}
                </el-button>
              </el-form-item>

              <!-- 返回登录 -->
              <div class="mobile-login-link">
                <span>{{ t('register.hasAccount') }}</span>
                <el-link type="primary" @click="switchToLogin">{{ t('register.login') }}</el-link>
              </div>
            </el-form>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { Close } from '@element-plus/icons-vue'
import { useResetForm } from '@/hooks/useResetForm'
import RegisterBg from '@/assets/images/register-bg.png'
import { getPopup } from '@/plugins/popupRegistry'
import { useCommonStore } from '@/stores/useCommonStore'
import { useTelegramHaptics } from '@/hooks/useTelegramHaptics'
import type { ResetEmits } from './types'

defineOptions({
  name: 'ResetPopup',
})

const { t } = useI18n()
const emit = defineEmits<ResetEmits>()
const { isMobile } = storeToRefs(useCommonStore())
const layoutClass = computed(() => (isMobile.value ? 'is-mobile' : 'is-desktop'))
const { tmaHapticImpact, tmaHapticSelection } = useTelegramHaptics()

const {
  visible,
  loading,
  countdown,
  resetForm,
  resetFormRef,
  rules,
  handleSendVerificationCode,
  handlePasswordChange,
  handleReset,
  open,
  close,
} = useResetForm()

watch(
  [visible, isMobile],
  ([v, m]) => {
    if (typeof document !== 'undefined') {
      if (v && m) {
        document.body.style.overflow = 'hidden'
      } else if (!v) {
        document.body.style.overflow = ''
      }
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = ''
  }
})

const handleClose = async () => {
  await close()
  emit('close')
}

const onReset = async () => {
  tmaHapticImpact('light')
  const success = await handleReset()
  if (success) {
    await handleClose()
  }
}

const switchToLogin = () => {
  tmaHapticSelection()
  getPopup('loginPopup')?.open()
  setTimeout(() => {
    handleClose()
  }, 50)
  emit('switchToLogin')
}

defineExpose({
  open,
  close,
})
</script>

<style scoped lang="scss">
@use './styles.scss';
</style>
