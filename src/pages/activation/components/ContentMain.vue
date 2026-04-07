<template>
  <el-card class="content-main">
    <FeeCard :texts="feeCardTexts" />
    <div class="details-card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="115px"
        :label-position="isMobile ? 'top' : 'right'"
        label-suffix=":"
        class="details-form"
      >
        <el-form-item class="textarea-item" :label="t('activation.enterAddress')" prop="address">
          <el-input
            type="textarea"
            :rows="4"
            v-model="formData.address"
            :placeholder="t('activation.enterAddresses')"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" class="submit-btn rent-btn" @click="handleSaveAddress">
            {{ t('activation.confirm') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="notice-wrap">
      <div class="notice-item" v-for="(notice, idx) in notices" :key="idx">
        <SvgIcon name="trumpet" width="12" height="12" />
        <div class="text">
          {{ notice }}
        </div>
      </div>
    </div>
    <KindTips :tips="kindTipTexts" />
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import FeeCard from '@/components/feeCard/index.vue'
import KindTips from '@/components/kindTips/index.vue'
import { useCommonStore } from '@/stores/useCommonStore'

const { t } = useI18n()
const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)

const feeCardTexts = computed<string[]>(() => [t('feeCard.activationPrice')])

const kindTipTexts = computed<string[]>(() => [t('activation.tips1'), t('activation.tips2')])

const notices = computed<string[]>(() => [
  t('activation.activationNotice') +
    ': 2025-01-02 16:20:30 ' +
    t('activation.activationTotalCount') +
    ': 4, ' +
    t('activation.activationSuccessCount') +
    ': 2',
])

const formRef = ref<FormInstance>()
const formData = reactive({
  address: '',
})

const formRules = computed<FormRules>(() => ({
  address: [
    { required: true, message: t('formValidation.addressRequired'), trigger: 'blur' },
    { min: 10, message: t('formValidation.addressTooShort'), trigger: 'blur' },
  ],
}))

const handleSaveAddress = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validateField('address')

    if (formData.address) {
      ElMessage.success(t('formValidation.addressSaveSuccess'))
    } else {
      ElMessage.warning(t('formValidation.enterAddressToSave'))
    }
  } catch (error) {
    console.error('Form validation failed:', error)
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/detail-form.scss';

.content-main {
  max-width: 896px;
  margin: 0 auto;
  border-radius: 8px;
  border: none;
  box-shadow: 0px 14px 30px 0px rgba(0, 0, 0, 0.08);

  :deep(.el-card__body) {
    padding: 24px;
  }

  .details-form {
    margin-top: 24px;

    .submit-btn {
      margin: 10px 0;
      background: var(--theme-bg-blue);
    }
  }

  .notice-wrap {
    padding-bottom: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .notice-item {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: var(--theme-text-black);

      .text {
        padding-left: 5px;
        color: var(--theme-text-muted);
      }
    }
  }
}

@media (max-width: 768px) {
  .content-main {
    .notice-wrap {
      .notice-item {
        align-items: flex-start;
      }
    }

    :deep(.el-form-item__label) {
      display: block;
      height: initial;
    }
  }
}
</style>
