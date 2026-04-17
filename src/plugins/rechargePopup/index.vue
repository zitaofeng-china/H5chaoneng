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
      
      <!-- 第一步：选择充值金额 -->
      <div v-if="currentStep === 1" class="recharge-content step-one">
        <div class="amount-selection">
          <div class="preset-amounts">
            <div
              v-for="amount in presetAmounts"
              :key="amount"
              class="amount-btn"
              :class="{ active: selectedAmount === amount && !isCustomAmount }"
              @click="selectPresetAmount(amount)"
            >
              {{ amount }} TRX
            </div>
          </div>
          
          <div class="custom-amount-section">
            <div class="custom-amount-label">
              <el-icon :size="20"><Money /></el-icon>
              {{ t('recharge.customAmount') }}
            </div>
            <el-input
              v-model="customAmountInput"
              type="number"
              min="1"
              step="0.01"
              :placeholder="t('recharge.enterCustomAmount')"
              class="custom-amount-input"
              @focus="handleCustomAmountFocus"
              @input="handleCustomAmountInput"
            >
              <template #suffix>TRX</template>
            </el-input>
          </div>

          <el-button
            type="primary"
            size="large"
            class="confirm-amount-btn"
            :disabled="!selectedAmount || selectedAmount < 1"
            @click="confirmAmount"
          >
            {{ t('recharge.confirmAmount') }}
          </el-button>
        </div>
      </div>

      <!-- 第二步：显示充值地址和二维码 -->
      <div v-else class="recharge-content step-two">
        <div class="selected-amount-display">
          <div class="amount-value">
            {{ finalAmount }} TRX
            <el-button
              link
              type="primary"
              @click="copyFinalAmount"
              class="copy-amount-btn"
              :loading="isCopying"
            >
              <SvgIcon name="transfer-copy" width="16" height="16" />
            </el-button>
          </div>
          <div class="amount-note">{{ t('recharge.finalAmountNote') }}</div>
          <el-button link type="primary" @click="backToStep1" class="change-amount-btn">
            {{ t('recharge.changeAmount') }}
          </el-button>
        </div>

        <div class="qrcode-section">
          <!-- 使用通用二维码组件 -->
          <QrCodeWithAddress
            :address="rechargeAddress || ''"
            :title="t('recharge.scanQrcode')"
            :tip="t('recharge.checkAddress')"
            :loading="isLoadingAddress"
            :error="!isLoadingAddress && !rechargeAddress"
            :loading-text="t('common.loading')"
            :loading-hint="t('recharge.loadingHint')"
            :error-text="t('common.loadFailed')"
            :error-hint="t('common.loadFailedHint')"
            :retry-text="t('common.retry')"
            @retry="confirmAmount"
          />
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCommonStore } from '@/stores/useCommonStore'
import { useRecharge } from '@/hooks/useRecharge'
import { useI18n } from 'vue-i18n'
import { Money } from '@element-plus/icons-vue'
import QrCodeWithAddress from '@/components/qrCodeWithAddress/index.vue'

defineOptions({
  name: 'RechargePopup',
})

const { t } = useI18n()
const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)

const {
  visible,
  isCopying,
  isLoadingAddress,
  currentStep,
  selectedAmount,
  finalAmount,
  customAmountInput,
  isCustomAmount,
  presetAmounts,
  rechargeAddress,
  selectPresetAmount,
  handleCustomAmountFocus,
  handleCustomAmountInput,
  confirmAmount,
  backToStep1,
  copyFinalAmount,
  open,
  close,
} = useRecharge()

const handleClose = () => {
  close()
}

defineExpose({
  open,
  close,
  visible,
})
</script>

<style lang="scss" scoped>
@use './styles.scss';
</style>
