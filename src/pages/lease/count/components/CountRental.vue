<template>
  <div class="time-rental-page">
    <div class="rental-wrapper">
      <div class="selection-grid">
        <div class="grid-row" v-for="(row, rIdx) in rows" :key="rIdx">
          <div class="row-options">
            <button
              v-for="(opt, idx) in row.options"
              :key="idx"
              :class="['pill', selecteIndex[0] === rIdx && selecteIndex[1] === idx ? 'active' : '']"
              @click="onSelect(rIdx, idx)"
            >
              {{ opt }}
            </button>
          </div>
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

          <el-form-item>
            <div class="btn-wrap">
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
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { storeToRefs } from 'pinia'
import KindTips from '@/components/kindTips/index.vue'
import { useCommonStore } from '@/stores/useCommonStore'

defineOptions({ name: 'CountRental' })

interface RentalForm {
  unitPrice: number
  count: number
  total: number
  energy: number
  validity: number
  wallet: string
}

const { t } = useI18n()
const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)

const rows = computed(() => [
  {
    options: [
      `5${t('common.purchase')}(17.5${t('common.trx')})`,
      `10${t('common.purchase')}(17.5${t('common.trx')})`,
      `20${t('common.purchase')}(70${t('common.trx')})`,
      `50${t('common.purchase')}(175${t('common.trx')})`,
      `100${t('common.purchase')}(350${t('common.trx')})`,
      `200${t('common.purchase')}(700${t('common.trx')})`,
    ],
  },
])

const tips = computed(() => [
  t('countRental.tips1'),
  t('countRental.tips2'),
  t('countRental.tips3'),
  t('countRental.tips4'),
])

const selecteIndex = ref<[number, number]>([0, 0])

const unitPrice = ref(1.9)
const count = computed(() => {
  const first =
    rows.value[selecteIndex.value[0]]?.options[selecteIndex.value[1]] || `1${t('common.purchase')}`
  const num = parseInt(String(first).replace(/[^0-9]/g, '')) || 1
  return num
})

const energy = ref(13.0)
const validity = ref(3)
const wallet = ref('')

const total = computed(() => +(unitPrice.value * count.value).toFixed(4))
const totalDisplay = computed(() => `${total.value}`)

const formRef = ref<FormInstance>()
const form = reactive<RentalForm>({
  unitPrice: unitPrice.value,
  count: count.value,
  total: total.value,
  energy: energy.value,
  validity: validity.value,
  wallet: wallet.value,
})

const rules = computed<FormRules<RentalForm>>(() => ({
  total: [
    {
      required: true,
      validator: (_rule: unknown, value: number, callback: (error?: string | Error) => void) => {
        if (Number(value) <= 0) {
          callback(new Error(t('formValidation.totalMustBePositive')))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  wallet: [
    { required: true, message: t('formValidation.walletRequired'), trigger: 'blur' },
    { min: 5, message: t('formValidation.walletTooShort'), trigger: 'blur' },
  ],
}))

watch([total], () => {
  form.total = total.value
})

watch(wallet, (v) => (form.wallet = v))

function onSelect(rowIdx: number, idx: number) {
  selecteIndex.value = [rowIdx, idx]
}

const handleRent = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    ElMessage.success(`${t('formValidation.rentalSuccess')} ${totalDisplay.value}`)
  } catch (error) {
    console.error('【ERROR INFO】:', error)
  }
}

const handleBuy = () => {}
</script>

<style scoped lang="scss">
@use '@/assets/styles/detail-form.scss';

.time-rental-page {
  padding: 18px;
  display: flex;
  justify-content: center;
}

.rental-wrapper {
  width: 856px;
  background: var(--theme-text-white);
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 6px 24px rgba(16, 24, 40, 0.08);
}

.title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  margin: 6px 0 12px;
}

.selection-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 22px;
}

.grid-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 0;
}

.row-options {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}

.pill {
  flex: 1;
  height: 36px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  background: var(--theme-time-bg-light);
  color: var(--theme-text-light-gray);
  border: none;
  cursor: pointer;

  &.active {
    background: var(--theme-bg-blue);
    color: var(--theme-text-white);
  }
}

@media (max-width: 768px) {
  .time-rental-page {
    padding: 16px;
    display: block;
  }

  .rental-wrapper {
    width: initial;
    padding: 18px;
  }

  .row-options {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .pill {
    font-size: 12px;
  }
}
</style>
