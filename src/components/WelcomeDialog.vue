<template>
  <div
    class="welcome-dialog-wrapper"
    :class="[
      layoutClass,
      {
        'is-sheet-closing': isClosing,
        'is-sheet-dragging': isDragging,
      },
    ]"
  >
    <el-dialog
      v-model="visible"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      :show-close="false"
      :width="isMobile ? '100%' : '470px'"
      class="welcome-dialog"
      :style="dialogDynamicStyle"
      :lock-scroll="true"
      :modal="true"
      :align-center="!isMobile"
    >
      <template #header>
        <div
          class="dialog-header"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @touchcancel="onTouchEnd"
        >
          <!-- 移动端顶部下拉把手条 -->
          <div v-if="isMobile" class="sheet-pull-bar-wrap" aria-hidden="true">
            <div class="sheet-pull-bar" />
          </div>

          <!-- 头部主行：左侧盾牌与标题，右侧语言切换选择器 -->
          <div class="header-main-row">
            <div class="header-branding">
              <!-- Web3 安全护盾徽章 -->
              <div class="security-badge-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2.5L4.5 5.8V11.2C4.5 16.3 7.7 21 12 22.2C16.3 21 19.5 16.3 19.5 11.2V5.8L12 2.5Z"
                    fill="url(#welcome_shield_bg)"
                    stroke="#165DFF"
                    stroke-width="1.6"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M8.5 12L10.8 14.3L15.5 9.5"
                    stroke="#165DFF"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <defs>
                    <linearGradient id="welcome_shield_bg" x1="12" y1="2.5" x2="12" y2="22.2" gradientUnits="userSpaceOnUse">
                      <stop stop-color="#EEF2FF" />
                      <stop offset="1" stop-color="#E0E7FF" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <!-- 主标题 -->
              <h3 class="header-title">{{ t('welcome.importantNotice') }}</h3>
            </div>

            <!-- 右侧语言/文字切换选择器 -->
            <div class="header-lang-action">
              <el-select
                v-model="currentLanguage"
                @change="handleLanguageChange"
                class="header-language-select"
                size="small"
                :popper-append-to-body="true"
              >
                <template #prefix>
                  <svg class="lang-globe-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748B" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                </template>
                <el-option
                  v-for="option in localeOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </div>
          </div>

          <!-- 下方说明文字 -->
          <p class="header-desc">{{ headerDescText }}</p>
        </div>
      </template>

      <div
        class="dialog-content"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd"
      >
        <!-- 4 条安全须知：卡片流式紧凑布局 -->
        <div class="notice-card-list">
          <div
            v-for="(notice, index) in notices"
            :key="index"
            class="notice-card-item"
          >
            <div class="notice-index-badge">
              <span class="index-digit">0{{ index + 1 }}</span>
            </div>
            <div class="notice-content-area">
              <span class="notice-text-main">{{ notice }}</span>
            </div>
            <div class="notice-verified-mark" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8.5" fill="#F0FDF4" stroke="#86EFAC" stroke-width="1.2" />
                <path d="M6.5 10.2L8.8 12.5L13.8 7.5" stroke="#16A34A" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>
        </div>

        <!-- 协议勾选与阅读状态条 -->
        <div
          class="agreement-box"
          :class="{ 'is-active': userAgreed }"
          @click="toggleAgreement"
        >
          <div class="agreement-left">
            <el-checkbox
              v-model="userAgreed"
              size="default"
              class="custom-agreement-checkbox"
              @click.stop
            >
              <span class="agreement-label-text">{{ t('welcome.iAcknowledge') }}</span>
            </el-checkbox>
          </div>

          <div class="agreement-status-pill">
            <transition name="pill-fade" mode="out-in">
              <div v-if="!canConfirm" class="timer-pill" key="timer">
                <svg class="timer-clock-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span class="timer-digits">{{ countdown }}s</span>
              </div>
              <div v-else-if="!userAgreed" class="ready-hint-pill" key="hint">
                <span class="ready-text">{{ currentLanguage.startsWith('zh') ? '请勾选确认' : 'Please check' }}</span>
              </div>
            </transition>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="primary"
            size="large"
            :disabled="!userAgreed || !canConfirm"
            @click="handleConfirm"
            class="submit-confirm-btn tactile-btn"
          >
            <span>{{ t('welcome.confirmAndContinue') }}</span>
            <span v-if="!canConfirm" class="btn-countdown-suffix">({{ countdown }}s)</span>
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useCommonStore } from '@/stores/useCommonStore'
import { setLocale, getCurrentLocale } from '@/lang'
import { localeOptions } from '@/lang/types'
import type { Locale } from '@/lang/types'

const { t } = useI18n()
const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)

const visible = ref(false)
const userAgreed = ref(false)
const currentLanguage = ref<Locale>(getCurrentLocale())
const countdown = ref(5)
const canConfirm = ref(false)
const isClosing = ref(false)
const isDragging = ref(false)
const dragOffset = ref(0)
let countdownTimer: number | null = null
let touchStartY = 0

const STORAGE_KEY = 'user_login_notice_acknowledged'

const layoutClass = computed(() => (isMobile.value ? 'is-mobile' : 'is-desktop'))

const headerDescText = computed(() => {
  if (currentLanguage.value.startsWith('zh')) {
    return '为保障您的资金与交易安全，请在交易前仔细阅读以下提示'
  }
  return 'To protect your funds and transactions, please read the following safety guidelines carefully.'
})

// 语言切换处理
const handleLanguageChange = (locale: Locale) => {
  void setLocale(locale)
  currentLanguage.value = locale
}

// 提示内容
const notices = computed(() => [
  t('welcome.notice1'),
  t('welcome.notice2'),
  t('welcome.notice3'),
  t('welcome.notice4'),
])

// 勾选切换
const toggleAgreement = () => {
  userAgreed.value = !userAgreed.value
}

// 启动倒计时
const startCountdown = () => {
  countdown.value = 5
  canConfirm.value = false

  if (countdownTimer) {
    clearInterval(countdownTimer)
  }

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
    userAgreed.value = false
    startCountdown()
  } else {
    clearCountdown()
  }
})

// 移动端手势触控处理（下拉阻尼感）
const onTouchStart = (e: TouchEvent) => {
  if (!isMobile.value) return
  const touch = e.touches[0]
  if (!touch) return
  touchStartY = touch.clientY
  isDragging.value = true
  dragOffset.value = 0
}

const onTouchMove = (e: TouchEvent) => {
  if (!isMobile.value || !isDragging.value) return
  const touch = e.touches[0]
  if (!touch) return
  const currentY = touch.clientY
  const deltaY = currentY - touchStartY
  if (deltaY > 0) {
    // 阻尼下拉跟随
    dragOffset.value = Math.min(deltaY * 0.45, 90)
  } else {
    dragOffset.value = 0
  }
}

const onTouchEnd = () => {
  if (!isMobile.value) return
  isDragging.value = false
  dragOffset.value = 0
}

const dialogDynamicStyle = computed(() => {
  if (!isMobile.value) return {}
  if (dragOffset.value > 0) {
    return {
      transform: `translate3d(0, ${dragOffset.value}px, 0)`,
      transition: isDragging.value ? 'none' : 'transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1)',
    }
  }
  return {}
})

// 监听登录成功事件
const handleLoginSuccess = () => {
  const acknowledged = localStorage.getItem(STORAGE_KEY)
  if (!acknowledged) {
    setTimeout(() => {
      visible.value = true
    }, 450)
  }
}

onMounted(() => {
  window.addEventListener('user-login-success', handleLoginSuccess)
  window.addEventListener('open-welcome-dialog', () => {
    visible.value = true
  })

  // 开发环境/测试辅助挂载
  if (typeof window !== 'undefined') {
    (window as unknown as Record<string, unknown>).__showWelcomeDialog = () => {
      localStorage.removeItem(STORAGE_KEY)
      visible.value = true
    }
  }
})

onUnmounted(() => {
  clearCountdown()
  window.removeEventListener('user-login-success', handleLoginSuccess)
})

// 确认关闭逻辑（带移动端丝滑下潜消失动画）
const handleConfirm = () => {
  if (!userAgreed.value || !canConfirm.value) return

  localStorage.setItem(STORAGE_KEY, Date.now().toString())

  if (isMobile.value) {
    isClosing.value = true
    setTimeout(() => {
      visible.value = false
      isClosing.value = false
      userAgreed.value = false
    }, 240)
  } else {
    visible.value = false
    userAgreed.value = false
  }
}
</script>

<style lang="scss" scoped>
.welcome-dialog-wrapper {
  :deep(.el-overlay) {
    background: rgba(15, 23, 42, 0.55);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    transition: all 0.24s ease;
  }

  :deep(.el-dialog) {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 16px 40px -12px rgba(15, 23, 42, 0.16), 0 0 0 1px rgba(226, 232, 240, 0.85);
    border: none;
    background: radial-gradient(100% 80px at 50% 0%, rgba(22, 93, 255, 0.04) 0%, transparent 100%), #FFFFFF;
    transition: transform 0.24s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.24s ease;
  }

  :deep(.el-dialog__header) {
    padding: 0;
    margin: 0;
  }

  :deep(.el-dialog__body) {
    /* 紧凑边距：左右 18px，底部 10px */
    padding: 0 18px 10px;
    max-height: calc(85vh - 150px);
    overflow-y: auto;
    background: transparent;

    /* 优雅高质感细滚动条 */
    &::-webkit-scrollbar {
      width: 5px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #E2E8F0;
      border-radius: 4px;

      &:hover {
        background: #CBD5E1;
      }
    }
  }

  :deep(.el-dialog__footer) {
    /* 紧凑边距：左右 18px，底部 18px */
    padding: 0 18px 18px;
    background: transparent;
  }

  :deep(.el-dialog__headerbtn) {
    display: none !important;
  }

  /* 头部设计：边距更紧致 */
  .dialog-header {
    padding: 18px 18px 10px;
    position: relative;

    .header-main-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .header-branding {
      display: flex;
      align-items: center;
      gap: 10px;
      flex: 1;
      min-width: 0;

      .security-badge-icon {
        width: 36px;
        height: 36px;
        flex-shrink: 0;
        border-radius: 8px;
        background: linear-gradient(135deg, rgba(22, 93, 255, 0.08) 0%, rgba(22, 93, 255, 0.02) 100%);
        border: 1px solid rgba(22, 93, 255, 0.14);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(22, 93, 255, 0.05);
      }

      .header-title {
        margin: 0;
        font-size: 18px;
        font-weight: 700;
        color: #0F172A;
        letter-spacing: -0.01em;
        line-height: 1.3;
      }
    }

    /* 语言/文字选择器容器 */
    .header-lang-action {
      flex-shrink: 0;

      .header-language-select {
        width: 114px;

        :deep(.el-input__wrapper) {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          box-shadow: none !important;
          border-radius: 8px;
          padding: 0 8px;
          height: 32px;
          transition: all 0.2s ease;

          &:hover {
            border-color: #165DFF;
            background: #FFFFFF;
          }

          &.is-focus {
            border-color: #165DFF;
            box-shadow: 0 0 0 2px rgba(22, 93, 255, 0.1) !important;
            background: #FFFFFF;
          }
        }

        :deep(.el-input__inner) {
          color: #334155;
          font-size: 12.5px;
          font-weight: 500;
        }

        :deep(.el-select__caret) {
          color: #94A3B8;
          font-size: 12px;
        }

        .lang-globe-icon {
          color: #64748B;
          margin-right: 4px;
          flex-shrink: 0;
        }
      }
    }

    /* 说明文字紧凑上间距 */
    .header-desc {
      margin: 6px 0 0;
      font-size: 12.5px;
      color: #64748B;
      line-height: 1.5;
      white-space: normal;
      word-break: break-word;
      overflow: visible;
      text-overflow: clip;
    }
  }

  /* 内容区卡片流：边距缩紧 */
  .dialog-content {
    .notice-card-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-bottom: 10px;

      .notice-card-item {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 12px;
        background: #FFFFFF;
        border: 1px solid #EEF2F6;
        border-radius: 8px;
        box-shadow: 0 1px 3px rgba(15, 23, 42, 0.02);
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
          background: #F8FAFC;
          border-color: #CBD5E1;
          box-shadow: 0 4px 10px rgba(15, 23, 42, 0.04);
          transform: translateY(-1px);
        }

        .notice-index-badge {
          width: 24px;
          height: 24px;
          flex-shrink: 0;
          border-radius: 6px;
          background: #F1F5F9;
          display: flex;
          align-items: center;
          justify-content: center;

          .index-digit {
            font-size: 11.5px;
            font-weight: 700;
            color: #64748B;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          }
        }

        .notice-content-area {
          flex: 1;
          min-width: 0;

          .notice-text-main {
            font-size: 13.5px;
            font-weight: 500;
            line-height: 1.5;
            color: #1E293B;
            display: block;
          }
        }

        .notice-verified-mark {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      }
    }

    /* 协议勾选卡片：紧凑边距 */
    .agreement-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 12px;
      background: #F8FAFC;
      border: 1px solid #E2E8F0;
      border-radius: 8px;
      cursor: pointer;
      user-select: none;
      transition: all 0.2s ease;

      &:hover {
        background: #F1F5F9;
        border-color: #CBD5E1;
      }

      &.is-active {
        background: rgba(22, 93, 255, 0.04);
        border-color: rgba(22, 93, 255, 0.35);
      }

      .agreement-left {
        flex: 1;
        min-width: 0;
      }

      .custom-agreement-checkbox {
        width: 100%;
        display: flex;
        align-items: center;

        :deep(.el-checkbox__inner) {
          width: 18px;
          height: 18px;
          border-radius: 4px;
          border: 1.5px solid #CBD5E1;
          transition: all 0.2s ease;
        }

        :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
          background-color: #165DFF;
          border-color: #165DFF;
          box-shadow: 0 2px 6px rgba(22, 93, 255, 0.28);
        }

        :deep(.el-checkbox__label) {
          padding-left: 10px;
          white-space: normal;
        }

        .agreement-label-text {
          font-size: 13px;
          font-weight: 500;
          color: #334155;
          line-height: 1.4;
        }
      }

      .agreement-status-pill {
        flex-shrink: 0;

        .timer-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 8px;
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: 6px;
          color: #1D4ED8;
          font-size: 12px;
          font-weight: 600;
          font-variant-numeric: tabular-nums;

          .timer-clock-icon {
            animation: spin-slow 4s linear infinite;
          }
        }

        .ready-hint-pill {
          display: inline-flex;
          align-items: center;
          padding: 2px 7px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 6px;
          color: #64748B;
          font-size: 11px;
          font-weight: 500;
        }
      }
    }
  }

  /* 底部按钮：高度调整为 44px 紧凑度 */
  .dialog-footer {
    display: flex;
    justify-content: center;

    .submit-confirm-btn {
      width: 100%;
      height: 44px;
      font-size: 15px;
      font-weight: 600;
      border-radius: 8px;
      background: linear-gradient(135deg, #165DFF 0%, #0E42D2 100%);
      border: none;
      color: #FFFFFF;
      box-shadow: 0 4px 14px -2px rgba(22, 93, 255, 0.35);
      transition: all 0.24s cubic-bezier(0.4, 0, 0.2, 1);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;

      .btn-countdown-suffix {
        font-size: 13.5px;
        opacity: 0.88;
        font-variant-numeric: tabular-nums;
      }

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow: 0 6px 18px -2px rgba(22, 93, 255, 0.45);
        background: linear-gradient(135deg, #1E6BFF 0%, #1048DE 100%);
      }

      &:active:not(:disabled) {
        transform: scale(0.99);
      }

      &:disabled {
        background: #F1F5F9;
        border: 1px solid #E2E8F0;
        color: #94A3B8;
        box-shadow: none;
        cursor: not-allowed;
      }
    }
  }
}

/* 动效 */
@keyframes spin-slow {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pill-fade-enter-active,
.pill-fade-leave-active {
  transition: all 0.2s ease;
}

.pill-fade-enter-from,
.pill-fade-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

/* 移动端形态：原生级 Bottom Sheet */
@media (max-width: 768px) {
  .welcome-dialog-wrapper {
    :deep(.el-overlay-dialog) {
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
    }

    :deep(.el-dialog) {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      border-radius: 14px 14px 0 0 !important;
      border-bottom-left-radius: 0 !important;
      border-bottom-right-radius: 0 !important;
      max-height: 88vh;
      display: flex;
      flex-direction: column;
      animation: sheetSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 -10px 32px rgba(15, 23, 42, 0.16);
    }

    :deep(.el-dialog__body) {
      padding: 0 14px 10px;
      max-height: calc(88vh - 160px);
      flex: 1;
    }

    :deep(.el-dialog__footer) {
      padding: 0 14px calc(12px + env(safe-area-inset-bottom, 0px));
      flex-shrink: 0;
    }

    .dialog-header {
      padding: 8px 14px 10px;
      flex-shrink: 0;

      .sheet-pull-bar-wrap {
        display: flex;
        justify-content: center;
        align-items: center;
        padding-bottom: 6px;
        touch-action: pan-y;

        .sheet-pull-bar {
          width: 32px;
          height: 3px;
          border-radius: 2px;
          background: #CBD5E1;
        }
      }

      .header-main-row {
        gap: 8px;
      }

      .header-branding {
        gap: 8px;

        .security-badge-icon {
          width: 32px;
          height: 32px;
          border-radius: 6px;
        }

        .header-title {
          font-size: 16.5px;
        }
      }

      .header-lang-action {
        .header-language-select {
          width: 104px;

          :deep(.el-input__wrapper) {
            height: 28px;
            padding: 0 6px;
            border-radius: 6px;
          }

          :deep(.el-input__inner) {
            font-size: 11.5px;
          }
        }
      }

      .header-desc {
        font-size: 11.5px;
        margin-top: 5px;
      }
    }

    .dialog-content {
      .notice-card-list {
        gap: 5px;
        margin-bottom: 8px;

        .notice-card-item {
          padding: 8px 10px;
          gap: 8px;
          border-radius: 6px;

          .notice-index-badge {
            width: 22px;
            height: 22px;
            border-radius: 4px;

            .index-digit {
              font-size: 11px;
            }
          }

          .notice-content-area .notice-text-main {
            font-size: 12.5px;
            line-height: 1.45;
          }
        }
      }

      .agreement-box {
        padding: 8px 10px;
        border-radius: 6px;

        .custom-agreement-checkbox .agreement-label-text {
          font-size: 12px;
        }

        .agreement-status-pill {
          .timer-pill {
            font-size: 11px;
            padding: 2px 6px;
            border-radius: 4px;
          }

          .ready-hint-pill {
            font-size: 10.5px;
            padding: 1px 5px;
            border-radius: 4px;
          }
        }
      }
    }

    .dialog-footer {
      .submit-confirm-btn {
        height: 42px;
        font-size: 14px;
        border-radius: 6px;
      }
    }

    /* 退出时下潜消失动画 */
    &.is-sheet-closing {
      :deep(.el-dialog) {
        animation: sheetSlideDown 0.24s cubic-bezier(0.4, 0, 1, 1) forwards !important;
      }
    }
  }
}

@keyframes sheetSlideUp {
  0% {
    transform: translate3d(0, 100%, 0);
    opacity: 0.5;
  }
  100% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
}

@keyframes sheetSlideDown {
  0% {
    transform: translate3d(0, 0, 0);
    opacity: 1;
  }
  100% {
    transform: translate3d(0, 100%, 0);
    opacity: 0;
  }
}
</style>
