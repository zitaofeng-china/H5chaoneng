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
import { reactive, ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import type { FormInstance, FormRules } from 'element-plus'
import FeeCard from '@/components/feeCard/index.vue'
import KindTips from '@/components/kindTips/index.vue'
import AddressList from './AddressList.vue'
import { useCommonStore } from '@/stores/useCommonStore'
import { usePriceStore } from '@/stores/usePriceStore'

const { t } = useI18n()
const commonStore = useCommonStore()
const priceStore = usePriceStore()
const { isMobile } = storeToRefs(commonStore)

const texts = computed(() => {
  const price65k = priceStore.priceData?.hosting_65k || '3'
  const price131k = priceStore.priceData?.hosting_131k || '5'
  return [
    `${t('hosting.use65000Energy')}：${price65k}TRX/${t('common.purchase')}`,
    `${t('hosting.use131000Energy')}：${price131k}TRX/${t('common.purchase')}`,
  ]
})

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

// 初始化时获取价格
onMounted(() => {
  priceStore.fetchPrice()
})
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
