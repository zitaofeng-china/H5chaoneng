<template>
  <div class="qr-section">
    <div class="section-title" v-if="title">{{ title }}</div>
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

interface Props {
  address: string
  title?: string
  tip?: string
}

const props = defineProps<Props>()

// 生成二维码
const qrCode = useQRCode(computed(() => props.address))

// 复制功能
const { isCopying, copyText } = useCopyToClipboard()

const handleCopy = () => {
  copyText(props.address)
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
    margin-top: 6px;
    color: var(--theme-text-light-gray-muted);

    svg {
      color: var(--theme-text-black);
      padding-right: 2px;
    }
  }
}

@media (max-width: 768px) {
  .qr-section {
    padding: 12px 0 16px;

    .wallet-address {
      flex-direction: column;
      gap: 8px;

      .address-text {
        text-align: center;
      }
    }
  }
}
</style>
