<template>
  <div class="recharge-dialog">
    <el-dialog
      v-model="visible"
      :show-close="!isMobile"
      :width="864"
      :autofocus="false"
      center
      align-center
      @close="handleClose"
    >
      <template #header>
        <div class="recharge-title">
          <div class="arrow-left-icon" @click.stop="handleClose">
            <iEpArrowLeft />
          </div>
          {{ t('recharge.title') }}
        </div>
      </template>
      <div class="recharge-content">
        <div class="desc-wrap">
          <div class="desc-item" v-for="row in tableData" :key="row.value">
            <div class="desc-label">{{ row.label }}</div>
            <div class="desc-value">
              {{ row.value }}
              <el-button
                link
                type="primary"
                @click="copyAddress"
                class="copy-btn"
                :loading="isCopying"
                v-if="row.type === 'address'"
              >
                <SvgIcon name="transfer-copy" width="18" height="18" />
              </el-button>
            </div>
          </div>
        </div>
        <div class="qrcode-section">
          <div class="qrcode-title">{{ t('recharge.scanQrcode') }}</div>
          <div class="qrcode-container">
            <img :src="qrCode" alt="QR Code" class="qrcode-img" />
          </div>

          <div class="tips-container">
            <div class="tips-title">
              <SvgIcon name="trx" width="24" height="24" />
              {{ t('recharge.minTransfer') }}
            </div>
            <div class="tips-text">
              <SvgIcon name="fee-info" width="12" height="12" fill="#1E293B" />
              {{ t('recharge.checkAddress') }}
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useClipboard } from '@vueuse/core'
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useCommonStore } from '@/stores/useCommonStore'

defineOptions({
  name: 'RechargePopup',
})

interface TableRow {
  label: string
  value: string
  type?: string
}

interface AccountInfo {
  accountNumber: string
  group: string
  tgOfficialNumber: string
  trxAmount: string
  rechargeAddress: string
}

const { t } = useI18n()
const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)

const visible = ref(false)
const isCopying = ref(false)

const accountInfo = reactive<AccountInfo>({
  accountNumber: 'H0007',
  group: 'H0007',
  tgOfficialNumber: 'H0007',
  trxAmount: '695505.582 TRX',
  rechargeAddress: 'TVu2qP0XXDwm2W6S5m1i8iVyv2mVAUakax',
})

const tableData = computed<TableRow[]>(() => [
  { label: t('recharge.account'), value: accountInfo.accountNumber },
  { label: t('recharge.email'), value: accountInfo.group },
  { label: t('recharge.tgOfficial'), value: accountInfo.tgOfficialNumber },
  { label: t('recharge.trxBalance'), value: accountInfo.trxAmount },
  { label: t('recharge.rechargeAddress'), value: accountInfo.rechargeAddress, type: 'address' },
])

const qrCode = useQRCode(accountInfo.rechargeAddress)
const { copy } = useClipboard()

const copyAddress = async () => {
  isCopying.value = true
  try {
    await copy(accountInfo.rechargeAddress)
    ElMessage.success(t('transferRental.copyAddress'))
  } catch {
    ElMessage.error(t('transferRental.copyFailed'))
  } finally {
    setTimeout(() => {
      isCopying.value = false
    }, 1000)
  }
}

const open = () => {
  visible.value = true
}

const close = () => {
  visible.value = false
}

const handleClose = () => {
  visible.value = false
}

defineExpose({
  open,
  close,
  visible,
})
</script>

<style lang="scss" scoped>
.recharge-dialog {
  .arrow-left-icon {
    display: none;
  }

  .recharge-title {
    margin-top: 5px;
    margin-bottom: 10px;
    font-size: 20px;
    font-weight: 600;
    color: var(--theme-text-black);
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

.desc-wrap {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--theme-shadow-strong);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--theme-text-black);

  .desc-item {
    height: 40px;
    display: flex;
    align-items: center;

    .desc-label {
      height: 40px;
      flex-basis: 260px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--theme-card-bg-light);
      border-right: 1px solid var(--theme-shadow-strong);
    }

    &:not(:last-child) {
      border-bottom: 1px solid var(--theme-shadow-strong);
    }

    .desc-value {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}
.address-row {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;

  .address-text {
    flex: 1;
    color: #1f2937;
    font-size: 12px;
    font-family: monospace;
    word-break: break-all;
  }

  .copy-btn {
    flex-shrink: 0;
    color: var(--theme-text-black);
    transition: color 0.3s ease;

    :deep(.el-icon) {
      font-size: 18px;
    }
  }
}

.qrcode-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.qrcode-title {
  margin-top: 24px;
  font-size: 18px;
  font-weight: 500;
  color: var(--theme-text-black);
}

.qrcode-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 192px;
  height: 192px;
  background: var(--theme-bg-white);

  .qrcode-img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.tips-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;

  .tips-title,
  .tips-text {
    display: flex;
    align-items: center;

    svg {
      padding-right: 3px;
    }
  }

  .tips-text {
    font-size: 12px;
    color: var(--theme-text-light-gray-muted);
    line-height: 0;
  }
}

@media (max-width: 768px) {
  .recharge-dialog {
    @include dialog-style;

    :deep(.el-dialog) {
      padding: 16px;
    }

    :deep(.el-dialog--center) {
      width: 100%;
      height: 100%;
    }

    .recharge-title {
      height: 44px;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--theme-bg-white);
      font-size: 18px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: var(--theme-bg);
      z-index: 99;

      .arrow-left-icon {
        position: fixed;
        left: 20px;
        display: block;
        z-index: 100;
        color: var(--theme-text-white);
      }
    }
  }

  .desc-wrap .desc-item {
    .desc-label {
      flex-basis: 120px;
    }

    .desc-value {
      word-break: break-all;
      padding: 0 10px;
    }
  }
}
</style>
