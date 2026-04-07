<template>
  <div class="contract-flash">
    <el-card class="rental-card">
      <el-tabs v-model="activeTab" class="rental-tabs">
        <el-tab-pane :label="t('contract.usdtToTrx')" name="USDT" />
        <el-tab-pane :label="t('contract.trxToUsdt')" name="TRX" />
        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-position="right"
          label-suffix=":"
          class="rental-form"
        >
          <div class="form-wrap">
            <el-form-item prop="unitPrice">
              <el-input
                v-model="formData.unitPrice"
                type="number"
                :placeholder="t('contract.enterAmountPlaceholder')"
              >
                <template #prefix>{{ t('contract.enterAmount') }}</template>
                <template #suffix>{{
                  activeTab === 'USDT' ? t('common.usdt') : t('common.trx')
                }}</template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-input
                v-model="formData.coinAmount"
                :placeholder="t('contract.estimatedPlaceholder')"
                disabled
              >
                <template #prefix>{{ t('contract.estimatedGet') }}</template>
                <template #suffix>{{
                  activeTab === 'USDT' ? t('common.trx') : t('common.usdt')
                }}</template>
              </el-input>
            </el-form-item>
          </div>
        </el-form>
        <RateCard :coin="activeTab" />
        <WalletQrcode :coin="activeTab" />
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { type FormInstance, type FormRules } from 'element-plus'
import WalletQrcode from './WalletQrcode.vue'
import RateCard from './RateCard.vue'

const { t } = useI18n()

const activeTab = ref('USDT')
const formRef = ref<FormInstance>()

const formData = reactive({
  unitPrice: '1.9',
  coinAmount: '',
})

const formRules = computed<FormRules>(() => ({
  unitPrice: [
    { required: true, message: t('formValidation.unitPriceRequired'), trigger: 'blur' },
    { pattern: /^\d+(\.\d+)?$/, message: t('formValidation.unitPriceInvalid'), trigger: 'blur' },
  ],
}))
</script>

<style lang="scss" scoped>
.contract-flash {
  padding: 0 0 80px;

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

  .form-wrap {
    :deep(.el-form-item) {
      margin-bottom: 18px;

      .el-form-item__content {
        justify-content: center;
      }

      .el-input {
        font-size: 14px;
        .el-input__wrapper {
          background: rgba(2, 15, 45, 0.03);
          border-radius: 4px;
          box-shadow: none;
          border: 1px solid rgba(2, 15, 45, 0.08);
          padding: 0 12px;
        }

        .el-input__inner {
          text-align: right;
          height: 44px;
          line-height: 44px;
          color: var(--theme-text-black);
        }

        .el-input__prefix,
        .el-input__suffix-inner {
          font-weight: 600;
          color: var(--theme-text-black);
        }

        .el-input__inner {
          cursor: auto;

          &::placeholder {
            color: var(--theme-text-light-gray);
            -webkit-text-fill-color: var(--theme-text-light-gray);
          }
        }

        &.is-disabled {
          .el-input__inner {
            padding-right: 15px;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  :deep(.el-input__inner) {
    padding-right: 15px;
  }
}
</style>
