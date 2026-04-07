<template>
  <div id="energy" class="energy-rental">
    <div class="header">
      <div class="title">{{ t('home.title') }}</div>
    </div>
    <el-card class="rental-card">
      <el-tabs v-model="activeTab" class="rental-tabs">
        <el-tab-pane :label="$t('home.balancePayment')" name="balance">
          <el-form
            ref="formRef"
            :model="formData"
            :rules="formRules"
            label-width="100px"
            label-position="right"
            label-suffix=":"
            :validate-on-rule-change="false"
            class="rental-form"
            :class="{ 'derail-form-m': isMobile }"
          >
            <el-form-item label-width="0">
              <div class="energy-row">
                <el-radio-group v-model="formData.energy" class="energy-radio-group">
                  <el-radio-button
                    v-for="option in energyOptions"
                    :key="option.value"
                    :value="option.value"
                    class="energy-radio-button"
                  >
                    {{ option.label }}
                  </el-radio-button>
                </el-radio-group>
              </div>
            </el-form-item>

            <div class="form-wrap">
              <el-form-item :label="$t('home.totalPrice')" prop="unitPrice">
                <el-input
                  v-model="formData.unitPrice"
                  type="number"
                  :placeholder="$t('home.enterTotalPrice')"
                  :class="{ 'm-input': isMobile }"
                >
                  <template #prefix v-if="isMobile">{{ $t('home.totalPrice') }}</template>
                  <template #suffix>{{ $t('common.trx') }}</template>
                </el-input>
              </el-form-item>

              <el-form-item :label="$t('home.rentalAddress')" prop="address">
                <el-input
                  v-model="formData.address"
                  :placeholder="$t('home.enterAddress')"
                  class="address-input"
                />
              </el-form-item>

              <div class="info-text">
                {{ $t('home.rentNowMessage', { energy: formData.energy }) }}
              </div>

              <el-form-item :label="$t('home.savedAddress')" prop="selectedAddress">
                <el-select
                  v-model="formData.selectedAddress"
                  :placeholder="$t('home.selectSavedAddress')"
                  style="width: 100%"
                  :class="{ 'm-input': isMobile }"
                >
                  <el-option
                    v-for="addr in addressOptions"
                    :key="addr.value"
                    :label="addr.label"
                    :value="addr.value"
                  />
                </el-select>
              </el-form-item>

              <div class="tip-row">
                <SvgIcon name="fee-info" width="12" height="12" />
                <span class="tip-text">
                  {{ $t('home.saveTip') }}
                </span>
              </div>
            </div>

            <el-form-item label-width="0">
              <div class="action-buttons">
                <el-button class="btn-save" type="primary" size="large" @click="handleSaveAddress">
                  {{ $t('home.saveAddress') }}
                </el-button>
                <el-button class="btn-rent" type="warning" size="large" @click="handleRentNow">
                  {{ $t('lease.rentNowButton') }}
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane :label="$t('home.transferRental')" name="transfer">
          <TransferRental />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { type FormInstance, type FormRules } from 'element-plus'
import TransferRental from './TransferRental.vue'
import { useLangStore } from '@/stores/useLangStore'
import { useCommonStore } from '@/stores/useCommonStore'
import { storeToRefs } from 'pinia'

const { t } = useI18n()
const langStore = useLangStore()
const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)

const activeTab = ref('balance')
const formRef = ref<FormInstance>()

const energyOptions = ref([
  { label: `${t('common.65000')} ${t('lease.energy')}`, value: 65000 },
  { label: `${t('common.131000')} ${t('lease.energy')}`, value: 131000 },
])

const formData = reactive({
  energy: 65000,
  unitPrice: '1.9',
  address: '',
  selectedAddress: '',
})

watch([() => formData.energy, () => langStore.currentLocale], () => {
  energyOptions.value = [
    { label: `${t('common.65000')} ${t('lease.energy')}`, value: 65000 },
    { label: `${t('common.131000')} ${t('lease.energy')}`, value: 131000 },
  ]
})

const formRules = computed<FormRules>(() => ({
  energy: [{ required: false, message: t('formValidation.selectEnergy'), trigger: 'change' }],
  unitPrice: [
    { required: true, message: t('formValidation.unitPriceRequired'), trigger: 'blur' },
    { pattern: /^\d+(\.\d+)?$/, message: t('formValidation.unitPriceInvalid'), trigger: 'blur' },
  ],
  address: [
    { required: true, message: t('formValidation.addressRequired'), trigger: 'blur' },
    { min: 10, message: t('formValidation.addressTooShort'), trigger: 'blur' },
  ],
  selectedAddress: [
    { required: true, message: t('formValidation.selectAddress'), trigger: 'change' },
  ],
}))

const addressOptions = ref([
  { label: `${t('home.addressLabel')} 1`, value: 'address1' },
  { label: `${t('home.addressLabel')} 2`, value: 'address2' },
  { label: `${t('home.addressLabel')} 3`, value: 'address3' },
])

const handleSaveAddress = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validateField('address')

    if (formData.address) {
      const newAddress = {
        label: formData.address,
        value: formData.address,
      }
      addressOptions.value.push(newAddress)
      ElMessage.success(t('formValidation.addressSaveSuccess'))
    } else {
      ElMessage.warning(t('formValidation.enterAddressToSave'))
    }
  } catch (error) {
    console.error('【ERROR INFO】:', error)
  }
}

const handleRentNow = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()

    if (!formData.address && !formData.selectedAddress) {
      ElMessage.warning(t('formValidation.enterOrSelectAddress'))
      return
    }

    ElMessage.success(t('formValidation.renting', { energy: formData.energy }))

    setTimeout(() => {
      ElMessage.success(t('formValidation.energyAdded', { energy: formData.energy }))
    }, 2000)
  } catch (error) {
    console.error('【ERROR INFO】:', error)
  }
}

onUnmounted(() => {
  formRef.value?.resetFields()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/detail-form.scss';

.energy-rental {
  background: var(--theme-bg-light);
  padding: 40px 0 80px;

  .header {
    text-align: center;
    padding-bottom: 40px;
  }

  .title {
    font-size: 40px;
    font-weight: 700;
    color: var(--theme-text-black);
  }

  .rental-card {
    max-width: 896px;
    margin: 0 auto;
    border-radius: 8px;
    border: none;
    box-shadow: 0px 14px 30px 0px rgba(0, 0, 0, 0.08);

    :deep(.el-card__body) {
      padding: 24px;
    }
  }

  .rental-tabs {
    :deep(.el-tabs__header) {
      margin: 0 0 22px;
    }

    :deep(.el-tabs__content) {
      overflow: initial;
    }

    :deep(.el-tabs__nav-wrap::after) {
      display: none;
    }

    :deep(.el-tabs__nav-scroll) {
      overflow: visible;
    }

    :deep(.el-tabs__nav) {
      width: 100%;
      display: flex;
      background: rgba(2, 15, 45, 0.03);
      border-radius: 4px;
      padding: 3px;
      box-sizing: border-box;
    }

    :deep(.el-tabs__item) {
      flex: 1;
      height: 44px;
      line-height: 44px;
      padding: 0;
      text-align: center;
      font-weight: 700;
      font-size: 14px;
      color: rgba(30, 41, 59, 0.6);
      border-radius: 4px;
      transition:
        background-color 0.2s ease,
        color 0.2s ease;

      &.is-active {
        color: var(--theme-text-white);
        background: var(--theme-bg-blue);
        box-shadow: 0px 4px 10px 0px rgba(22, 93, 255, 0.25);
      }
    }

    :deep(.el-tabs__active-bar) {
      display: none;
    }
  }

  .rental-form {
    max-width: 720px;
    margin: 0 auto;

    .form-wrap {
      margin-left: -55px;
      padding-right: 46px;
    }

    :deep(.el-form-item) {
      margin-bottom: 18px;

      .el-form-item__content {
        justify-content: center;
      }
    }

    :deep(.el-form-item__label) {
      height: 46px;
      align-items: center;
      line-height: 100%;
      color: var(--theme-text-muted);
      font-size: 14px;
      font-weight: 700;

      &::before {
        color: #ff4d4f;
        margin-top: 4px;
      }
    }

    .energy-radio-group {
      display: flex;
      width: 630px;
      background: rgba(2, 15, 45, 0.03);
      border-radius: 4px;
      box-sizing: border-box;

      .energy-radio-button {
        flex: 1;

        :deep(.el-radio-button__inner) {
          width: 100%;
          height: 36px;
          padding: 0;
          line-height: 36px;
          border: none;
          background: transparent;
          font-weight: 700;
          font-size: 14px;
          color: rgba(30, 41, 59, 0.6);
          border-radius: 4px;
          box-shadow: none;
          outline: none;
        }

        :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
          background: var(--theme-bg-blue);
          color: var(--theme-text-white);
        }
      }
    }

    .energy-row {
      display: flex;
      justify-content: center;
      width: 100%;
      margin-bottom: 6px;
    }

    :deep(.el-input__wrapper) {
      background: rgba(2, 15, 45, 0.03);
      border-radius: 4px;
      box-shadow: none;
      border: 1px solid rgba(2, 15, 45, 0.08);
      padding: 0 12px;
      min-height: 44px;
    }

    :deep(.el-input__inner) {
      height: 44px;
      line-height: 44px;
      font-size: 14px;
      color: var(--theme-text-black);
    }

    :deep(.el-input__suffix-inner) {
      font-size: 12px;
      color: rgba(30, 41, 59, 0.5);
    }

    :deep(.address-input) {
      .el-input__wrapper {
        background: none;
      }
    }

    :deep(.el-select) {
      width: 100%;

      .el-select__wrapper {
        height: 44px;
      }

      .el-input__wrapper {
        cursor: pointer;
      }
    }

    .info-text {
      margin: -4px 0 18px 100px;
      font-size: 12px;
      color: var(--theme-text-black);
      opacity: 0.6;
    }

    .tip-row {
      margin: -4px 0 22px 100px;
      display: flex;
      align-items: center;
      color: var(--theme-text-black);
      opacity: 0.6;
      font-size: 12px;

      .tip-text {
        padding-left: 4px;
      }
    }

    .action-buttons {
      display: flex;
      gap: 2px;
      width: 630px;

      .el-button {
        flex: 1;
        height: 52px;
        border-radius: 4px;
        font-size: 16px;
        font-weight: 700;
      }
    }

    :deep(.btn-save) {
      background: var(--theme-bg-blue);
      border: none;
    }

    :deep(.btn-rent) {
      background: var(--theme-bg-orange);
      border: none;
    }
  }

  .placeholder-content {
    text-align: center;
    padding: 60px 20px;
    color: #9ca3af;
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .energy-rental {
    padding: 0 20px 40px;

    .header {
      padding-bottom: 24px;
    }

    .title {
      font-size: 24px;
    }

    .rental-form {
      :deep(.el-form-item__label) {
        display: none;
      }

      .info-text,
      .tip-row {
        margin-left: 0;
      }

      .form-wrap {
        margin: 0;
        padding: 0;
      }

      .action-buttons .el-button {
        height: 44px;
        font-size: 14px;
      }
    }

    .rental-card {
      :deep(.el-card__body) {
        padding-bottom: 30px;
        overflow: hidden;
      }
    }
  }
}
</style>
