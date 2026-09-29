<template>
  <div class="recharge-dialog">
    <el-dialog
      v-model="visible"
      :show-close="true"
      :width="isMobile ? '92%' : '480px'"
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
        <el-tabs
          v-model="selectedCoin"
          class="coin-tabs"
          @tab-change="onCoinChange"
        >
          <el-tab-pane :label="t('common.trx')" name="TRX" />
          <el-tab-pane :label="t('common.usdt')" name="USDT" />
        </el-tabs>

        <div class="amount-selection">
          <div class="preset-amounts">
            <div
              v-for="amount in presetAmounts"
              :key="amount"
              class="amount-btn tactile-btn tabular-nums"
              :class="{ active: selectedAmount === amount && !isCustomAmount }"
              @click="onSelectPresetAmount(amount)"
            >
              {{ formatCryptoAmount(amount) }} {{ selectedCoin }}
            </div>
          </div>
          
          <div class="custom-amount-section">
            <div class="custom-amount-label">
              <el-icon :size="20"><Money /></el-icon>
              {{ t('recharge.customAmount', { coin: selectedCoin }) }}
            </div>
            <el-input
              v-model="customAmountInput"
              type="text"
              :inputmode="amountInputmode"
              :pattern="amountPattern"
              :placeholder="
                t('recharge.enterCustomAmount', {
                  coin: selectedCoin,
                  min: minRechargeAmount,
                })
              "
              class="custom-amount-input"
              @focus="handleCustomAmountFocus"
              @input="handleCustomAmountInput"
            >
              <template #suffix>{{ selectedCoin }}</template>
            </el-input>
          </div>

          <div v-if="selectedCoin === 'USDT'" class="usdt-rate-panel">
            <div class="rate-row">
              <span>{{ t('recharge.exchangeRate') }}</span>
              <span v-if="isLoadingExchangeRate" class="rate-muted">
                {{ t('recharge.rateLoading') }}
              </span>
              <span v-else-if="usdtExchangeRateText" class="rate-value">
                1 USDT ≈ {{ usdtExchangeRateText }} TRX
              </span>
              <span v-else class="rate-muted">-</span>
            </div>
            <div v-if="estimatedTrxAmount" class="rate-row estimated-row">
              <span>{{ t('recharge.estimatedTrx') }}</span>
              <span class="rate-value tabular-nums">{{ estimatedTrxAmount }} TRX</span>
            </div>
          </div>

          <el-button
            type="primary"
            size="large"
            class="confirm-amount-btn tactile-btn"
            :disabled="!isAmountValid"
            @click="onConfirmAmount"
          >
            {{ t('recharge.confirmAmount') }}
          </el-button>
        </div>
      </div>

      <!-- 第二步：显示充值地址和二维码 -->
      <div v-else class="recharge-content step-two">
        <div class="selected-amount-display">
          <div class="amount-value tabular-nums">
            {{ displayActualAmount }} {{ actualCoin }}
            <el-button
              link
              type="primary"
              @click="onCopyActualAmount"
              class="copy-amount-btn tactile-btn"
              :loading="isCopying"
            >
              <SvgIcon name="transfer-copy" width="16" height="16" />
            </el-button>
          </div>
          <div class="amount-note">{{ t('recharge.finalAmountNote') }}</div>
          <div
            v-if="actualCoin === 'USDT' && estimatedTrxAmount"
            class="estimated-trx-note"
          >
            {{ t('recharge.estimatedTrx') }}: {{ estimatedTrxAmount }} TRX
          </div>
          <div v-if="deadline" class="deadline-note">
            {{ t('recharge.transferDeadline', { time: deadline }) }}
          </div>
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
import { formatCryptoAmount } from '@/utils/number'
import { tmaHapticSelection, tmaHapticImpact, tmaHapticNotification } from '@/utils/telegram'

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
  selectedCoin,
  selectedAmount,
  customAmountInput,
  isCustomAmount,
  presetAmounts,
  isAmountValid,
  minRechargeAmount,
  amountInputmode,
  amountPattern,
  rechargeAddress,
  displayActualAmount,
  actualCoin,
  deadline,
  isLoadingExchangeRate,
  usdtExchangeRateText,
  estimatedTrxAmount,
  selectPresetAmount,
  handleCoinChange,
  handleCustomAmountFocus,
  handleCustomAmountInput,
  confirmAmount,
  copyActualAmount,
  open,
  close,
} = useRecharge()

const onCoinChange = (coin: any) => {
  tmaHapticSelection()
  handleCoinChange(coin)
}

const onSelectPresetAmount = (amount: number) => {
  tmaHapticSelection()
  selectPresetAmount(amount)
}

const onConfirmAmount = () => {
  tmaHapticImpact('light')
  confirmAmount()
}

const onCopyActualAmount = () => {
  tmaHapticImpact('light')
  copyActualAmount()
  tmaHapticNotification('success')
}

const handleClose = () => {
  tmaHapticImpact('light')
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
