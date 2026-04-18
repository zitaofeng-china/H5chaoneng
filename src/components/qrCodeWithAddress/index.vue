<template>
  <div class="qr-section">
    <div class="section-title" v-if="title">{{ title }}</div>
    
    <!-- 加载状态 -->
    <div v-if="loading" class="status-container loading-state">
      <div class="status-content">
        <el-icon class="is-loading status-icon" :size="48">
          <Loading />
        </el-icon>
        <div class="status-text">{{ loadingText || '加载中...' }}</div>
        <div class="status-hint" v-if="loadingHint">{{ loadingHint }}</div>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-else-if="error" class="status-container error-state">
      <div class="status-content">
        <el-icon class="status-icon error-icon" :size="48">
          <CircleClose />
        </el-icon>
        <div class="status-text error-text">{{ errorText || '加载失败' }}</div>
        <div class="status-hint" v-if="errorHint">{{ errorHint }}</div>
        <el-button 
          v-if="showRetry"
          type="primary" 
          size="small" 
          class="retry-btn"
          @click="handleRetry"
        >
          <el-icon><RefreshRight /></el-icon>
          {{ retryText || '重试' }}
        </el-button>
      </div>
    </div>
    
    <!-- 正常显示二维码 -->
    <template v-else>
      <div class="qr-code">
        <img :src="qrCode" alt="QR Code" class="qr-image" />
      </div>
      <div class="wallet-address">
        <span class="address-text">{{ address }}</span>
        <el-button
          link
          type="primary"
          @click="handleCopy"
          class="copy-button"
          :loading="isCopying"
        >
          <SvgIcon name="transfer-copy" width="24" height="24" />
        </el-button>
      </div>
      <div class="tips-info" v-if="tip">
        <SvgIcon name="fee-info" width="12" height="12" />
        {{ tip }}
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { Loading, CircleClose, RefreshRight } from '@element-plus/icons-vue'

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

// 生成二维码
const qrCode = useQRCode(computed(() => props.address))

// 复制功能
const { isCopying, copyText } = useCopyToClipboard()

const handleCopy = () => {
  copyText(props.address)
}

const handleRetry = () => {
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
    margin-bottom: 8px;
  }

  .qr-code {
    width: 192px;
    height: 192px;
    margin: 0 auto;

    .qr-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  // 状态容器（加载和错误）
  .status-container {
    width: 192px;
    height: 192px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    background: rgba(0, 0, 0, 0.02);

    .status-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 20px;

      .status-icon {
        flex-shrink: 0;
      }

      .status-text {
        font-size: 14px;
        font-weight: 500;
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
      }
    }
  }

  // 加载状态
  .loading-state {
    border-color: rgba(22, 93, 255, 0.2);
    background: rgba(22, 93, 255, 0.03);

    .status-icon {
      color: var(--el-color-primary);
    }
  }

  // 错误状态
  .error-state {
    border-color: rgba(220, 38, 38, 0.2);
    background: rgba(220, 38, 38, 0.03);

    .error-icon {
      color: #DC2626;
    }

    .error-text {
      color: #DC2626;
    }
  }

  .wallet-address {
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 14px;
    color: var(--theme-text-black);
  }

  .address-text {
    font-family: 'Courier New', monospace;
    word-break: break-all;
  }

  .copy-button {
    padding: 0;
    height: 18px;
    flex-shrink: 0;

    :deep(svg) {
      font-size: 14px;
    }
  }

  .tips-info {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    margin-top: 6px;
    color: #C13535;

    svg {
      color: #C13535;
      padding-right: 2px;
    }
  }
}

@media (max-width: 768px) {
  .qr-section {
    padding: 12px 0 16px;

    .section-title {
      font-size: 15px;
    }

    .wallet-address {
      flex-direction: column;
      gap: 8px;
      font-size: 12px;

      .address-text {
        text-align: center;
        font-size: 11px;
        line-height: 1.4;
      }
    }

    .tips-info {
      font-size: 11px;
      line-height: 1.4;
      padding: 0 8px;
    }

    .status-container {
      .status-content {
        padding: 16px;

        .status-hint {
          font-size: 11px;
        }
      }
    }
  }
}
</style>
