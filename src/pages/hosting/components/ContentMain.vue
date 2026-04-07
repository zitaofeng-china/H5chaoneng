<template>
  <el-card class="content-main">
    <FeeCard :texts="texts" />
    <div class="details-card">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="130px"
        :label-position="isMobile ? 'top' : 'right'"
        label-suffix=":"
        class="details-form"
      >
        <el-form-item class="textarea-item" :label="t('hosting.address')" prop="address">
          <el-input
            type="textarea"
            :rows="isMobile ? 6 : 4"
            v-model="formData.address"
            :placeholder="t('hosting.enterAddresses')"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="rent-btn" @click="handleSaveAddress">
            {{ t('common.confirm') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <AddressList />
    <KindTips :tips="tips" />
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import type { FormInstance, FormRules } from 'element-plus'
import FeeCard from '@/components/feeCard/index.vue'
import KindTips from '@/components/kindTips/index.vue'
import AddressList from './AddressList.vue'
import { useCommonStore } from '@/stores/useCommonStore'

const { t } = useI18n()
const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)

const texts = computed(() => [t('hosting.65000EnergyFee'), t('hosting.131000EnergyFee')])

const tips = computed(() => [
  t('hosting.tips1'),
  t('hosting.tips2'),
  t('hosting.tips3'),
  t('hosting.tips4'),
  t('hosting.tips5'),
  t('hosting.tips6'),
  t('hosting.tips7'),
])

const formRef = ref<FormInstance>()
const formData = reactive({
  address: '',
})

const formRules: FormRules = {
  address: [
    { required: true, message: t('formValidation.addressRequired'), trigger: 'blur' },
    { min: 10, message: t('formValidation.addressTooShort'), trigger: 'blur' },
  ],
}

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
    console.error('【ERROR INFO】:', error)
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

  .details-form {
    margin-top: 24px;

    .rent-btn {
      margin: 10px 0;
    }
  }

  :deep(.el-card__body) {
    padding: 24px;
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
