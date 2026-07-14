<template>
  <div class="time-rental-page">
    <div class="rental-wrapper">
      <div class="selection-grid">
        <div class="grid-row" v-for="(row, rIdx) in rows" :key="rIdx">
          <div class="row-options">
            <button
              v-for="(opt, idx) in row.options"
              :key="idx"
              :class="['pill', !isCustom && selecteIndex[0] === rIdx && selecteIndex[1] === idx ? 'active' : '']"
              @click="onSelect(rIdx, idx)"
            >
              {{ opt }}
            </button>
            <button
              :class="['pill', isCustom ? 'active' : '']"
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
          label-width="115px"
          label-suffix=":"
          class="details-form"
          :class="{ 'derail-form-m': isMobile }"
        >
          <el-form-item :label="t('lease.totalPrice')" prop="total">
            <el-input :model-value="totalDisplay" disabled :class="{ 'm-input': isMobile }">
              <template #prefix v-if="isMobile"> {{ t('lease.totalPrice') }} </template>
              <template #suffix> {{ t('common.trx') }} </template>
            </el-input>
          </el-form-item>
          <el-form-item :label="t('lease.walletAddress')" prop="wallet">
            <el-input v-model="wallet" :placeholder="t('lease.enterAddress')" />
          </el-form-item>
          <el-form-item :label="$t('home.savedAddress')" prop="selectedAddress">
            <el-select
              v-model="selectedAddress"
              :placeholder="$t('home.selectSavedAddress')"
              style="width: 100%"
              :class="{ 'm-input': isMobile }"
            >
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
          </el-form-item>
          <div class="tip-row">
            <SvgIcon name="fee-info" width="12" height="12" />
            <span class="tip-text">
              {{ $t('home.saveTip') }}
            </span>
          </div>

          <el-form-item>
            <div class="btn-wrap">
              <el-button type="primary" class="rent-btn" @click="handleSaveAddress">
                {{ $t('home.saveAddress') }}
              </el-button>
              <el-button type="primary" class="rent-btn" @click="handleRent">
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

    <!-- USDT 付款地址弹窗 -->
    <el-dialog
      v-model="showPaymentDialog"
      :title="t('countRental.usdtPaymentTitle')"
      width="500px"
      :close-on-click-modal="false"
      :class="{ 'mobile-dialog': isMobile }"
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
import { useCountRental } from './useCountRental'

defineOptions({ name: 'CountRental' })

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
  addressOptions,
  totalDisplay,
  formRef,
  form,
  rules,
  maxCount,
  handleSaveAddress,
  handleDeleteAddress,
  onSelect,
  onCustomClick,
  handleCustomInput,
  handleRent,
  handleBuy,
} = useCountRental()
</script>

<style scoped lang="scss">
@use '@/assets/styles/detail-form.scss';
@use './CountRental.scss';
</style>
