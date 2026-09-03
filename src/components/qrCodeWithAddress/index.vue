<template>
  <div class="qr-section">
    <div v-if="title" class="section-title">{{ title }}</div>

    <!-- 加载状态 -->
    <div v-if="loading" class="status-container loading-state">
      <div class="status-content">
        <el-icon class="is-loading status-icon" :size="40">
          <Loading />
        </el-icon>
        <div class="status-text">{{ loadingText || t('common.loading') + '...' }}</div>
        <div v-if="loadingHint" class="status-hint">{{ loadingHint }}</div>
      </div>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="status-container error-state">
      <div class="status-content">
        <el-icon class="status-icon error-icon" :size="40">
          <CircleClose />
        </el-icon>
        <div class="status-text error-text">{{ errorText || t('common.loadFailed') }}</div>
        <div v-if="errorHint" class="status-hint">{{ errorHint }}</div>
        <el-button
          v-if="showRetry"
          type="primary"
          size="small"
          class="retry-btn tactile-btn"
          @click="handleRetry"
        >
          <el-icon><RefreshRight /></el-icon>
          {{ retryText || t('common.retry') }}
        </el-button>
      </div>
    </div>

    <!-- 正常显示二维码与金融级地址卡 -->
    <div v-else class="qr-main-card">
      <!-- 瞄准角标视窗 -->
      <div class="qr-viewport">
        <div class="target-frame">
          <img :src="qrCode" alt="QR Code" class="qr-image" />
        </div>
      </div>

      <!-- 钱包地址卡片（首尾高亮 + 触感复制） -->
      <div
        class="wallet-address-card tactile-btn"
        :class="{ 'is-copied': isCopied }"
        role="button"
        tabindex="0"
        :title="t('transferRental.copyAddress')"
        @click="handleCopy"
        @keydown.enter.prevent="handleCopy"
        @keydown.space.prevent="handleCopy"
      >
        <span class="network-badge" aria-label="TRON Network">T</span>
        <div class="address-split mono-address" :title="address">
          <span class="address-chunk is-edge">{{ addressPrefix }}</span>
          <span class="address-chunk is-mid">{{ addressMiddle }}</span>
          <span class="address-chunk is-edge">{{ addressSuffix }}</span>
        </div>

        <button
          type="button"
          class="copy-pill-btn"
          :class="{ 'is-success': isCopied }"
          :disabled="isCopying"
          @click.stop="handleCopy"
        >
          <el-icon v-if="isCopied" class="copy-icon"><Check /></el-icon>
          <SvgIcon v-else name="transfer-copy" width="14" height="14" class="copy-icon" />
          <span class="copy-label">{{ isCopied ? '已复制' : '复制' }}</span>
        </button>
      </div>

      <!-- 提示信息 -->
      <div v-if="tip" class="tips-info">
        <SvgIcon name="fee-info" width="12" height="12" />
        <span>{{ tip }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { tmaHapticImpact, tmaHapticNotification } from '@/utils/telegram'
import { Loading, CircleClose, RefreshRight, Check } from '@element-plus/icons-vue'

interface Props {
  address: string
  title?: string
  tip?: string
  loading?: boolean
  error?: boolean
  loadingText?: string
  loadingHint?: string
  errorText?: string
  errorHint?: string
  showRetry?: boolean
  retryText?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: false,
  showRetry: true,
})

const emit = defineEmits<{
  retry: []
}>()

const { t } = useI18n()

// 生成二维码（紧凑留白 margin: 1，消除多余过厚白边）
const qrCode = useQRCode(computed(() => props.address), {
  errorCorrectionLevel: 'M',
  margin: 1,
})

// 复制功能与触感状态
const { isCopying, copyText } = useCopyToClipboard()
const isCopied = ref(false)
let copyTimer: number | null = null

// 地址切分（首尾高亮）
const addressPrefix = computed(() => {
  const addr = props.address || ''
  return addr.length > 12 ? addr.slice(0, 6) : addr
})

const addressMiddle = computed(() => {
  const addr = props.address || ''
  return addr.length > 12 ? addr.slice(6, -6) : ''
})

const addressSuffix = computed(() => {
  const addr = props.address || ''
  return addr.length > 12 ? addr.slice(-6) : ''
})

const handleCopy = () => {
  if (!props.address) return
  tmaHapticImpact('light')
  copyText(props.address)
  isCopied.value = true

  // Telegram Mini App 触感通知反馈
  tmaHapticNotification('success')

  if (copyTimer) clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => {
    isCopied.value = false
  }, 2000)
}

const handleRetry = () => {
  tmaHapticImpact('light')
  emit('retry')
}
</script>

<style lang="scss" scoped>
.qr-section {
  text-align: center;
  padding: 16px 0 18px;

  .section-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--theme-text-black);
    margin-bottom: 12px;
    letter-spacing: -0.01em;
  }

  // 状态容器（加载和错误）
  .status-container {
    width: 200px;
    height: 200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed rgba(22, 93, 255, 0.2);
    border-radius: var(--theme-radius-md, 6px);
    background: rgba(22, 93, 255, 0.03);

    .status-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 20px;

      .status-icon {
        flex-shrink: 0;
        color: var(--theme-primary-blue, #165dff);
      }

      .status-text {
        font-size: 14px;
        font-weight: 600;
        color: var(--theme-text-black);
      }

      .status-hint {
        font-size: 12px;
        color: var(--theme-text-light-gray-muted);
        text-align: center;
        line-height: 1.4;
      }

      .retry-btn {
        margin-top: 4px;
        display: flex;
        align-items: center;
        gap: 4px;
        border-radius: var(--theme-radius-sm, 4px);
      }
    }
  }

  .error-state {
    border-color: rgba(220, 38, 38, 0.2);
    background: rgba(220, 38, 38, 0.03);

    .error-icon,
    .error-text {
      color: #dc2626;
    }
  }

  // 二维码瞄准视窗
  .qr-viewport {
    display: flex;
    justify-content: center;
    margin: 0 auto;

    .target-frame {
      position: relative;
      display: inline-block;
      padding: 6px;
      background: #ffffff;
      border-radius: var(--theme-radius-md, 6px);
      border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
      box-shadow: var(--theme-shadow-sm, 0 1px 3px rgba(15, 23, 42, 0.05));

      &::before,
      &::after {
        content: '';
        position: absolute;
        width: 10px;
        height: 10px;
        border-color: var(--theme-primary-blue, #165dff);
        pointer-events: none;
      }

      &::before {
        top: -3px;
        left: -3px;
        border-top: 2px solid;
        border-left: 2px solid;
        border-top-left-radius: 3px;
      }

      &::after {
        bottom: -3px;
        right: -3px;
        border-bottom: 2px solid;
        border-right: 2px solid;
        border-bottom-right-radius: 3px;
      }

      .qr-image {
        display: block;
        width: 168px;
        height: 168px;
        object-fit: contain;
        border-radius: 2px;
      }
    }
  }

  // 钱包地址金融卡
  .wallet-address-card {
    margin: 14px auto 0;
    max-width: 480px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 12px;
    background: #ffffff;
    border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
    border-radius: var(--theme-radius-md, 6px);
    box-shadow: var(--theme-shadow-sm, 0 1px 3px rgba(15, 23, 42, 0.05));
    cursor: pointer;
    box-sizing: border-box;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      border-color: var(--theme-primary-blue, #165dff);
      box-shadow: var(--theme-shadow-glow-blue);
    }

    &.is-copied {
      border-color: var(--theme-primary-green, #36d399);
      box-shadow: var(--theme-shadow-glow-green);
    }

    .network-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 22px;
      height: 22px;
      flex-shrink: 0;
      border-radius: 50%;
      background: rgba(193, 53, 53, 0.1);
      color: #c13535;
      font-size: 11px;
      font-weight: 800;
    }

    .address-split {
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 0;
      font-size: 13px;
      line-height: 1.4;

      .address-chunk {
        &.is-edge {
          font-weight: 700;
          color: var(--theme-text-black);
          flex-shrink: 0;
        }

        &.is-mid {
          color: rgba(30, 41, 59, 0.45);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding: 0 1px;
        }
      }
    }

    .copy-pill-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;
      padding: 5px 12px;
      border-radius: 8px;
      border: 1px solid rgba(22, 93, 255, 0.15);
      background: rgba(22, 93, 255, 0.06);
      color: var(--theme-primary-blue, #165dff);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.18s ease;

      &:hover {
        background: var(--theme-primary-blue, #165dff);
        color: #ffffff;
      }

      &.is-success {
        background: var(--theme-primary-green, #36d399);
        border-color: var(--theme-primary-green, #36d399);
        color: #ffffff;
      }

      .copy-icon {
        font-size: 13px;
      }
    }
  }

  .tips-info {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 600;
    margin-top: 10px;
    color: #c13535;
    gap: 4px;

    svg {
      color: #c13535;
      flex-shrink: 0;
    }
  }
}

@media (max-width: 768px) {
  .qr-section {
    padding: 12px 0 14px;

    .section-title {
      font-size: 15px;
      margin-bottom: 10px;
    }

    .qr-viewport .target-frame .qr-image {
      width: 144px;
      height: 144px;
    }

    .wallet-address-card {
      padding: 8px 10px;
      gap: 6px;

      .address-split {
        font-size: 12px;
      }

      .copy-pill-btn {
        padding: 4px 8px;
        font-size: 11px;
      }
    }

    .tips-info {
      font-size: 11px;
      padding: 0 6px;
    }
  }
}
</style>
