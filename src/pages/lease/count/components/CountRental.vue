<template>
  <div class="time-rental-page">
    <div class="rental-wrapper">
      <div class="selection-grid">
        <div class="grid-row" v-for="(row, rIdx) in rows" :key="rIdx">
          <div class="row-label">
            <span class="label-marker" aria-hidden="true"></span>
            {{ t('countRental.selectTier') }}
          </div>
          <div class="row-options">
            <button
              v-for="option in countOptions"
              :key="`${option.rowIndex}-${option.index}`"
              type="button"
              :class="[
                'pill',
                !isCustom && selecteIndex[0] === option.rowIndex && selecteIndex[1] === option.index
                  ? 'active'
                  : '',
              ]"
              @click="onSelect(option.rowIndex, option.index)"
            >
              <span class="option-price">{{ option.price }} {{ t('common.trx') }}</span>
              <span class="option-count">{{
                isMobile
                  ? t('transferRental.buyCount', { count: option.count })
                  : `${option.count}${t('common.purchase')}`
              }}</span>
            </button>
            <button
              type="button"
              :class="['pill', 'custom-pill', isCustom ? 'active' : '']"
              @click="onCustomClick"
            >
              {{ t('lease.custom') }}
            </button>
          </div>
        </div>
        
        <!-- 自定义笔数输入框 -->
        <div v-if="isCustom" class="custom-input-wrapper">
          <el-form-item :label="t('lease.customCount')" class="custom-form-item">
            <el-input
              v-model.number="customCount"
              type="number"
              :min="1"
              :max="maxCount"
              :placeholder="t('lease.enterCustomCount')"
              @input="handleCustomInput"
            >
              <template #suffix> {{ t('common.purchase') }} </template>
            </el-input>
            <div class="max-count-hint">
              {{ t('lease.maxCountHint', { max: maxCount }) }}
            </div>
          </el-form-item>
        </div>
      </div>

      <div class="details-card">
        <div class="card-title">{{ t('lease.rentalDetails') }}</div>

        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          label-suffix=""
          hide-required-asterisk
          class="details-form"
          :class="{ 'derail-form-m': isMobile }"
        >
          <el-form-item :label="t('lease.totalPrice')" prop="total" class="total-price-item">
            <el-input :model-value="totalDisplay" disabled :class="{ 'm-input': isMobile, 'total-price-input': true }">
              <template #prefix v-if="isMobile">
                <span class="inline-label">
                  <span class="label-marker" aria-hidden="true"></span>
                  {{ t('lease.totalPrice') }}<span class="req-star">*</span>
                </span>
              </template>
              <template #suffix> {{ t('common.trx') }} </template>
            </el-input>
          </el-form-item>
          <el-form-item
            :label="t('lease.walletAddress')"
            prop="wallet"
            :show-message="false"
            class="wallet-field"
            :class="{ 'is-invalid': walletShowError }"
          >
            <el-input
              v-model="wallet"
              :placeholder="walletPlaceholder"
              :class="{ 'm-input': isMobile }"
            >
              <template #prefix v-if="isMobile">
                <span class="inline-label">
                  <span class="label-marker" aria-hidden="true"></span>
                  {{ t('lease.walletAddress') }}
                </span>
              </template>
              <template #suffix v-if="isMobile && walletShowError && !wallet">
                <span class="wallet-error-hint">{{ t('formValidation.walletRequired') }}</span>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item :label="$t('home.savedAddress')" prop="selectedAddress" :show-message="false">
            <template #label>
              <span class="saved-address-label">
                <span>{{ $t('home.savedAddress') }}</span>
                <span class="tip-row">
                  <SvgIcon name="fee-info" width="12" height="12" />
                  <span class="tip-text">{{ $t('home.saveTip') }}</span>
                </span>
              </span>
            </template>
            <div
              class="saved-select-wrap"
              :class="{ 'mobile-combo': isMobile, 'has-value': !!selectedAddress }"
            >
              <el-select
                v-model="selectedAddress"
                :placeholder="$t('home.selectSavedAddress')"
                style="width: 100%"
                :class="{ 'm-input': isMobile }"
                popper-class="count-saved-address-dropdown"
                placement="bottom-start"
                :fallback-placements="['bottom-start', 'top-start']"
                :offset="4"
                fit-input-width
                :show-arrow="false"
                :popper-options="savedDropdownPopperOptions"
              >
                <template #prefix v-if="isMobile">
                  <span class="inline-label">
                    <span class="label-marker" aria-hidden="true"></span>
                    {{ $t('home.savedAddress') }}
                  </span>
                </template>
                <template #empty>
                  <div class="custom-empty">
                    {{ $t('home.noSavedAddress') }}
                  </div>
                </template>
                <el-option
                  v-for="addr in addressOptions"
                  :key="addr.value"
                  :label="addr.label"
                  :value="addr.value"
                >
                  <div class="address-option">
                    <span class="address-text">{{ addr.label }}</span>
                    <svg
                      class="delete-icon"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      @click.stop="handleDeleteAddress(addr.value)"
                    >
                      <rect opacity="0.1" width="24" height="24" rx="4.5" fill="#020F2D"/>
                      <g opacity="0.6" clip-path="url(#count-rental-delete-icon)">
                        <path d="M12.0002 11.1161L8.46101 7.57695C8.22392 7.33985 7.82483 7.3365 7.58076 7.58057C7.33498 7.82635 7.33506 8.21876 7.57713 8.46083L11.1163 12L7.57713 15.5391C7.34003 15.7762 7.33668 16.1753 7.58076 16.4194C7.82654 16.6652 8.21894 16.6651 8.46102 16.423L12.0002 12.8839L15.5393 16.423C15.7764 16.6601 16.1755 16.6635 16.4196 16.4194C16.6654 16.1736 16.6653 15.7812 16.4232 15.5392L12.8841 12L16.4232 8.46083C16.6603 8.22373 16.6637 7.82465 16.4196 7.58057C16.1738 7.33479 15.7814 7.33487 15.5393 7.57695L12.0002 11.1161Z" fill="white"/>
                      </g>
                      <defs>
                        <clipPath id="count-rental-delete-icon">
                          <rect width="10" height="10" fill="white" transform="translate(7 7)"/>
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                </el-option>
              </el-select>
            </div>
            <p v-if="isMobile" class="mobile-save-tip">
              <SvgIcon name="fee-info" width="12" height="12" />
              <span>{{ $t('home.saveTip') }}</span>
            </p>
          </el-form-item>

          <el-form-item>
            <div class="btn-wrap">
              <el-button type="default" class="rent-btn save-btn" @click="handleSaveAddress">
                {{ $t('home.saveAddress') }}
              </el-button>
              <el-button
                type="primary"
                class="rent-btn primary-btn"
                :loading="orderLoading"
                :disabled="orderLoading"
                @click="handleRent"
              >
                {{ t('lease.rentNowButton') }}
              </el-button>
              <el-button type="primary" class="rent-btn buy-btn" @click="handleBuy">
                {{ t('lease.usdtBuy') }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
      <KindTips :tips="tips" />
    </div>

    <!-- USDT 付款地址弹窗：挂到 body，避免被页面 isolation / Telegram 浮标压住 -->
    <el-dialog
      v-model="showPaymentDialog"
      :title="t('countRental.usdtPaymentTitle')"
      :width="isMobile ? '90%' : '500px'"
      class="count-usdt-payment-dialog"
      :class="{ 'is-mobile': isMobile }"
      modal-class="count-usdt-payment-overlay"
      append-to-body
      align-center
      center
      :z-index="3000"
      :close-on-click-modal="false"
    >
      <div class="payment-dialog">
        <!-- 温馨提示移到顶部 -->
        <div class="payment-tips">
          <div class="tip-item" v-for="(tip, idx) in paymentTips" :key="idx">
            <SvgIcon name="trumpet" width="12" height="12" />
            <span>{{ tip }}</span>
          </div>
        </div>

        <QrCodeWithAddress
          v-if="paymentAddress"
          :address="paymentAddress"
          :title="t('transferRental.walletQrcode')"
          :tip="t('common.checkWalletAddress')"
        />
        <div v-else class="qr-section">
          <div class="section-title">{{ t('transferRental.walletQrcode') }}</div>
          <el-skeleton animated>
            <template #template>
              <el-skeleton-item variant="image" style="width: 192px; height: 192px; margin: 0 auto" />
            </template>
          </el-skeleton>
          <div class="wallet-address">
            <span class="address-text">{{ t('common.loading') }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import KindTips from '@/components/kindTips/index.vue'
import QrCodeWithAddress from '@/components/qrCodeWithAddress/index.vue'
import { computed, onUnmounted, watch } from 'vue'
import { useCountRental } from './useCountRental'

defineOptions({ name: 'CountRental' })

const savedDropdownPopperOptions = {
  modifiers: [
    {
      name: 'sameWidth',
      enabled: true,
      phase: 'beforeWrite' as const,
      requires: ['computeStyles'],
      fn({
        state,
      }: {
        state: {
          styles: { popper: Record<string, string> }
          rects: { reference: { width: number } }
        }
      }) {
        const width = `${Math.round(state.rects.reference.width)}px`
        state.styles.popper.width = width
        state.styles.popper.minWidth = width
        state.styles.popper.maxWidth = width
      },
    },
  ],
}

const {
  t,
  isMobile,
  showPaymentDialog,
  paymentAddress,
  rows,
  tips,
  paymentTips,
  selecteIndex,
  isCustom,
  customCount,
  selectedAddress,
  wallet,
  walletPlaceholder,
  walletShowError,
  addressOptions,
  totalDisplay,
  formRef,
  form,
  rules,
  maxCount,
  orderLoading,
  handleSaveAddress,
  handleDeleteAddress,
  onSelect,
  onCustomClick,
  handleCustomInput,
  handleRent,
  handleBuy,
} = useCountRental()

watch(
  showPaymentDialog,
  (open) => {
    document.body.classList.toggle('count-usdt-payment-open', open)
  },
  { immediate: true },
)

onUnmounted(() => {
  document.body.classList.remove('count-usdt-payment-open')
})

const countOptions = computed(() => {
  return rows.value.flatMap((row, rowIndex) =>
    row.counts.map((count, index) => ({
      rowIndex,
      index,
      count,
      price: row.prices[index],
    })),
  )
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/detail-form.scss';
@use './CountRental.scss';
</style>

<style lang="scss">
.count-saved-address-dropdown.el-popper {
  box-sizing: border-box;
  padding: 0;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);

  .el-popper__arrow {
    display: none !important;
  }

  .el-select-dropdown {
    box-sizing: border-box;
    width: 100% !important;
    min-width: 100% !important;
    max-width: 100% !important;
    padding: 0 !important;
    border: none !important;
    border-radius: 0 !important;
    background: transparent !important;
    box-shadow: none !important;
  }

  .el-select-dropdown__wrap,
  .el-scrollbar,
  .el-scrollbar__wrap {
    max-width: 100%;
  }

  .el-select-dropdown__empty {
    padding: 0 !important;
  }

  .custom-empty {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 36px;
    min-height: 36px;
    padding: 0 12px;
    color: #94a3b8;
    font-size: 13px;
    font-weight: 500;
    line-height: 20px;
    text-align: center;
  }

  .el-select-dropdown__list {
    padding: 0;
    margin: 0;
  }

  .el-select-dropdown__item {
    height: 40px !important;
    min-height: 40px !important;
    padding: 0 12px !important;
    overflow: hidden !important;
    border-radius: 0;
    color: #334155;
    font-size: 13px;
    line-height: 40px !important;
  }

  .el-select-dropdown__item.is-hovering,
  .el-select-dropdown__item:hover {
    background: #f5f7fa;
  }

  .el-select-dropdown__item.is-selected {
    color: var(--theme-bg-blue, #165dff);
    font-weight: 600;
    background: #f0f5ff;
  }

  .address-option {
    display: block !important;
    position: relative !important;
    width: 100% !important;
    min-height: 40px !important;
    overflow: hidden !important;
  }

  .address-text {
    display: block !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
    white-space: nowrap !important;
    padding-right: 28px !important;
    line-height: 40px !important;
    font-size: 13px !important;
  }

  .delete-icon {
    position: absolute !important;
    top: 50% !important;
    right: 0 !important;
    width: 20px !important;
    height: 20px !important;
    transform: translateY(-50%) !important;
  }
}

@media (min-width: 891px) {
  .count-saved-address-dropdown.el-popper {
    padding: 4px 0;
    border-radius: 3px;
    border-color: #e7ecf3;
  }

  .count-saved-address-dropdown.el-popper .custom-empty {
    height: 40px;
    min-height: 40px;
  }
}

.count-usdt-payment-overlay .el-overlay-dialog {
  display: flex !important;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 16px 0;
}

.count-usdt-payment-dialog.el-dialog {
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  border-radius: 10px;
  margin: auto !important;

  .el-dialog__header,
  .el-dialog__header.show-close {
    margin: 0;
    padding: 16px 44px 12px 20px;
    text-align: center;
  }

  .el-dialog__title {
    color: #182230;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
  }

  .el-dialog__headerbtn {
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
  }

  .el-dialog__body {
    padding: 4px 20px 20px;
  }
}

.count-usdt-payment-dialog.is-mobile.el-dialog {
  width: 90% !important;
  max-width: 400px;
  max-height: min(85vh, 720px);
  height: auto;
  border-radius: 12px;

  .el-dialog__header,
  .el-dialog__header.show-close {
    flex-shrink: 0;
    padding: 14px 40px 10px 16px;
  }

  .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
  }

  .el-dialog__headerbtn {
    top: 10px;
    right: 8px;
    width: 28px;
    height: 28px;
  }

  .el-dialog__body {
    flex: 0 1 auto;
    min-height: 0;
    padding: 0 14px 16px;
    overflow-x: hidden;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}

body.count-usdt-payment-open {
  overflow: hidden !important;
}

body.count-usdt-payment-open .app-shell {
  overflow: hidden !important;
}

body.count-usdt-payment-open .telegram-float {
  visibility: hidden !important;
  opacity: 0 !important;
  pointer-events: none !important;
}
</style>
