<template>
  <el-dialog
    v-model="visible"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    width="600px"
    class="welcome-dialog"
    :lock-scroll="true"
    :modal="true"
    align-center
  >
    <template #header>
      <div class="dialog-header">
        <div class="header-content">
          <el-icon class="warning-icon" :size="28"><WarningFilled /></el-icon>
          <span class="header-title">{{ t('welcome.importantNotice') }}</span>
        </div>
        <el-select
          v-model="currentLanguage"
          @change="handleLanguageChange"
          class="language-selector"
          size="default"
        >
          <el-option
            v-for="option in localeOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </div>
    </template>

    <div class="dialog-content">
      <div class="notice-list">
        <div class="notice-item" v-for="(notice, index) in notices" :key="index">
          <el-icon class="check-icon" :size="20"><Check /></el-icon>
          <span class="notice-text">{{ notice }}</span>
        </div>
      </div>

      <div class="agreement-wrapper">
        <el-checkbox v-model="userAgreed" size="large" class="agreement-checkbox">
          {{ t('welcome.iAcknowledge') }}
        </el-checkbox>
        <span v-if="!canConfirm" class="countdown-badge">{{ countdown }}s</span>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button
          type="primary"
          size="large"
          :disabled="!userAgreed || !canConfirm"
          @click="handleConfirm"
          class="confirm-button"
        >
          {{ t('welcome.confirmAndContinue') }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { WarningFilled, Check } from '@element-plus/icons-vue'
import { setLocale, getCurrentLocale } from '@/lang'
import { localeOptions } from '@/lang/types'
import type { Locale } from '@/lang/types'

const { t } = useI18n()

const visible = ref(false)
const userAgreed = ref(false)
const currentLanguage = ref<Locale>(getCurrentLocale())
const countdown = ref(5)
const canConfirm = ref(false)
let countdownTimer: number | null = null

const STORAGE_KEY = 'user_login_notice_acknowledged'

// 语言切换处理
const handleLanguageChange = (locale: Locale) => {
  setLocale(locale)
  currentLanguage.value = locale
}

// 提示内容
const notices = computed(() => [
  t('welcome.notice1'),
  t('welcome.notice2'),
  t('welcome.notice3'),
  t('welcome.notice4'),
])

// 启动倒计时
const startCountdown = () => {
  countdown.value = 5
  canConfirm.value = false
  
  countdownTimer = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      canConfirm.value = true
      if (countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    }
  }, 1000)
}

// 清理倒计时
const clearCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

// 监听弹窗显示状态
watch(visible, (newVal) => {
  if (newVal) {
    startCountdown()
  } else {
    clearCountdown()
  }
})

// 监听登录成功事件
const handleLoginSuccess = () => {
  // 检查用户是否已经确认过
  const acknowledged = localStorage.getItem(STORAGE_KEY)
  if (!acknowledged) {
    // 延迟500ms显示，让登录弹窗先关闭
    setTimeout(() => {
      visible.value = true
    }, 500)
  }
}

onMounted(() => {
  // 监听登录成功事件
  window.addEventListener('user-login-success', handleLoginSuccess)
})

onUnmounted(() => {
  clearCountdown()
  window.removeEventListener('user-login-success', handleLoginSuccess)
})

const handleConfirm = () => {
  if (!userAgreed.value || !canConfirm.value) return
  
  // 记录确认时间戳
  localStorage.setItem(STORAGE_KEY, Date.now().toString())
  
  visible.value = false
  userAgreed.value = false
}
</script>

<style lang="scss" scoped>
.welcome-dialog {
  :deep(.el-dialog) {
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 25px 70px rgba(220, 38, 38, 0.3), 0 0 0 1px rgba(220, 38, 38, 0.1);
    border: none;
    background: linear-gradient(180deg, #FFFFFF 0%, #FEF2F2 50%, #FEE2E2 100%);
  }

  :deep(.el-dialog__header) {
    padding: 0;
    margin: 0;
  }

  :deep(.el-dialog__body) {
    padding: 0 36px 32px;
    max-height: calc(80vh - 200px);
    overflow-y: auto;
    background: transparent;
    
    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 6px;
    }
    
    &::-webkit-scrollbar-track {
      background: rgba(254, 226, 226, 0.2);
      border-radius: 3px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #DC2626 0%, #B91C1C 100%);
      border-radius: 3px;
      
      &:hover {
        background: linear-gradient(180deg, #B91C1C 0%, #991B1B 100%);
      }
    }
  }

  :deep(.el-dialog__footer) {
    padding: 0 36px 36px;
    background: transparent;
  }

  // 隐藏关闭按钮
  :deep(.el-dialog__headerbtn) {
    display: none !important;
  }

  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 32px 36px 28px;
    background: transparent;
    border-bottom: none;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 36px;
      right: 36px;
      height: 1px;
      background: linear-gradient(90deg, transparent 0%, rgba(220, 38, 38, 0.15) 20%, rgba(220, 38, 38, 0.15) 80%, transparent 100%);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;

      .warning-icon {
        color: #DC2626;
        animation: pulse 2s ease-in-out infinite;
        filter: drop-shadow(0 2px 4px rgba(220, 38, 38, 0.3));
      }

      .header-title {
        font-size: 22px;
        font-weight: 700;
        background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .language-selector {
      width: 140px;
      
      :deep(.el-input__wrapper) {
        background: rgba(255, 255, 255, 0.8);
        border: 1.5px solid rgba(220, 38, 38, 0.3);
        box-shadow: 0 2px 8px rgba(220, 38, 38, 0.08);
        border-radius: 10px;
        transition: all 0.3s ease;
        
        &:hover {
          border-color: rgba(220, 38, 38, 0.5);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15);
          background: rgba(255, 255, 255, 0.95);
        }
      }

      :deep(.el-input__inner) {
        color: #991B1B;
        font-weight: 600;
      }
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.1);
      opacity: 0.85;
    }
  }

  .dialog-content {
    .notice-list {
      background: transparent;
      border-radius: 0;
      padding: 24px 0;
      margin-bottom: 24px;
      border: none;
      position: relative;

      .notice-item {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 16px;
        font-size: 16px;
        line-height: 1.7;
        color: #374151;
        padding: 12px 16px;
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.5);
        box-shadow: 0 2px 8px rgba(220, 38, 38, 0.04);
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.08);
          transform: translateX(4px);
        }

        &:last-child {
          margin-bottom: 0;
        }

        .check-icon {
          color: #DC2626;
          margin-top: 2px;
          flex-shrink: 0;
          filter: drop-shadow(0 1px 2px rgba(220, 38, 38, 0.2));
        }

        .notice-text {
          flex: 1;
          font-weight: 500;
        }
      }
    }

    .agreement-wrapper {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 20px 24px;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 16px;
      border: 2px solid rgba(220, 38, 38, 0.2);
      position: relative;
      box-shadow: 0 4px 16px rgba(220, 38, 38, 0.08);
      transition: all 0.3s ease;

      &:hover {
        border-color: rgba(220, 38, 38, 0.35);
        box-shadow: 0 6px 20px rgba(220, 38, 38, 0.12);
        background: rgba(255, 255, 255, 0.85);
      }
    }

    .agreement-checkbox {
      flex: 1;

      :deep(.el-checkbox__label) {
        font-size: 15px;
        font-weight: 700;
        background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      :deep(.el-checkbox__inner) {
        width: 22px;
        height: 22px;
        border-width: 2px;
        border-color: #DC2626;
        transition: all 0.3s ease;
      }

      :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
        background-color: #DC2626;
        border-color: #DC2626;
        box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
      }
    }

    .countdown-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 42px;
      height: 28px;
      padding: 0 12px;
      background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
      color: #FFFFFF;
      font-size: 14px;
      font-weight: 700;
      border-radius: 14px;
      box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
      animation: pulse-badge 1s ease-in-out infinite;
      flex-shrink: 0;
    }

    @keyframes pulse-badge {
      0%, 100% {
        transform: scale(1);
        box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
      }
      50% {
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.5);
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: center;

    .confirm-button {
      width: 100%;
      height: 54px;
      font-size: 17px;
      font-weight: 700;
      border-radius: 14px;
      background: linear-gradient(135deg, #DC2626 0%, #B91C1C 100%);
      border: none;
      box-shadow: 0 8px 20px rgba(220, 38, 38, 0.35);
      transition: all 0.3s ease;
      color: #FFFFFF;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
        opacity: 0;
        transition: opacity 0.3s ease;
      }

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 28px rgba(220, 38, 38, 0.45);
        background: linear-gradient(135deg, #B91C1C 0%, #991B1B 100%);

        &::before {
          opacity: 1;
        }
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        background: linear-gradient(135deg, #E5E7EB 0%, #D1D5DB 100%);
        color: #9CA3AF;
        cursor: not-allowed;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        transform: none;
        opacity: 0.6;
      }
    }
  }
}

@media (max-width: 768px) {
  .welcome-dialog {
    :deep(.el-dialog) {
      width: 100% !important;
      max-width: 100%;
      margin: 0;
      border-radius: 0;
      max-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    :deep(.el-dialog__body) {
      padding: 0 20px 20px;
      overflow-y: auto;
      flex: 1;
      max-height: calc(100vh - 200px);
      
      /* 移动端滚动条样式 */
      &::-webkit-scrollbar {
        width: 4px;
      }
    }

    :deep(.el-dialog__footer) {
      padding: 0 20px 24px;
      flex-shrink: 0;
    }

    .dialog-header {
      padding: 20px;
      flex-direction: column;
      gap: 12px;
      align-items: stretch;
      flex-shrink: 0;

      &::after {
        left: 20px;
        right: 20px;
      }

      .header-content {
        justify-content: center;

        .warning-icon {
          font-size: 24px;
        }

        .header-title {
          font-size: 18px;
        }
      }

      .language-selector {
        width: 100%;
        
        :deep(.el-input__wrapper) {
          height: 40px;
        }
      }
    }

    .dialog-content {
      .notice-list {
        padding: 18px 0;
        margin-bottom: 18px;

        .notice-item {
          font-size: 14px;
          margin-bottom: 12px;
          padding: 10px 12px;
          line-height: 1.6;
          
          .check-icon {
            font-size: 18px;
          }
        }
      }

      .agreement-wrapper {
        padding: 14px 16px;
      }

      .agreement-checkbox {
        :deep(.el-checkbox__label) {
          font-size: 13px;
          line-height: 1.5;
        }

        :deep(.el-checkbox__inner) {
          width: 18px;
          height: 18px;
        }
      }

      .countdown-badge {
        min-width: 36px;
        height: 24px;
        font-size: 12px;
        padding: 0 10px;
      }
    }

    .dialog-footer {
      .confirm-button {
        height: 48px;
        font-size: 15px;
      }
    }
  }
}

@media (max-width: 480px) {
  .welcome-dialog {
    .dialog-header {
      padding: 18px;

      &::after {
        left: 18px;
        right: 18px;
      }

      .header-content {
        .warning-icon {
          font-size: 22px;
        }

        .header-title {
          font-size: 17px;
        }
      }
    }

    :deep(.el-dialog__body) {
      padding: 0 18px 18px;
    }

    :deep(.el-dialog__footer) {
      padding: 0 18px 22px;
    }

    .dialog-content {
      .notice-list {
        padding: 16px 0;

        .notice-item {
          font-size: 13px;
          gap: 10px;
          padding: 9px 11px;
        }
      }

      .agreement-wrapper {
        padding: 13px 15px;
      }

      .agreement-checkbox {
        :deep(.el-checkbox__label) {
          font-size: 12px;
        }
      }

      .countdown-badge {
        min-width: 34px;
        height: 22px;
        font-size: 11px;
        padding: 0 8px;
      }
    }

    .dialog-footer {
      .confirm-button {
        height: 46px;
        font-size: 14px;
      }
    }
  }
}

/* 超小屏幕优化 */
@media (max-width: 360px) {
  .welcome-dialog {
    .dialog-header {
      padding: 16px;

      &::after {
        left: 16px;
        right: 16px;
      }

      .header-content {
        gap: 8px;

        .warning-icon {
          font-size: 20px;
        }

        .header-title {
          font-size: 16px;
        }
      }
    }

    :deep(.el-dialog__body) {
      padding: 0 16px 16px;
    }

    :deep(.el-dialog__footer) {
      padding: 0 16px 20px;
    }

    .dialog-content {
      .notice-list {
        padding: 14px 0;

        .notice-item {
          font-size: 12px;
          margin-bottom: 10px;
          padding: 8px 10px;
        }
      }

      .agreement-wrapper {
        padding: 12px 14px;
      }

      .agreement-checkbox {
        :deep(.el-checkbox__label) {
          font-size: 11px;
        }

        :deep(.el-checkbox__inner) {
          width: 16px;
          height: 16px;
        }
      }

      .countdown-badge {
        min-width: 32px;
        height: 20px;
        font-size: 10px;
        padding: 0 7px;
      }
    }

    .dialog-footer {
      .confirm-button {
        height: 44px;
        font-size: 13px;
      }
    }
  }
}
</style>
