<template>
  <div class="time-rental-page">
    <div class="rental-wrapper">
      <div class="selection-grid">
        <div class="grid-row" v-for="(row, rIdx) in rows" :key="rIdx">
          <div class="row-label">
            <SvgIcon name="fee-info" width="12" height="12" fill="#1E293B" />
            {{ row.label }}
          </div>
          <div class="row-options">
            <button
              v-for="(opt, idx) in row.options"
              :key="idx"
              :class="['pill', selecteIndex[0] === rIdx && selecteIndex[1] === idx ? 'active' : '']"
              @click="onSelect(rIdx, idx, opt)"
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
          <el-form-item :label="t('lease.unitPrice')" prop="unitPrice">
            <el-input v-model="unitPrice" disabled class="m-input" v-if="isMobile">
              <template #prefix>{{ t('lease.unitPrice') }}</template>
              <template #suffix> {{ t('common.trx') }} </template>
            </el-input>
            <el-input :model-value="unitPrice + ' ' + t('common.trx')" disabled v-else />
          </el-form-item>

          <el-form-item :label="t('lease.count')" prop="count">
            <el-input v-model="count" disabled class="m-input" v-if="isMobile">
              <template #prefix>{{ t('lease.count') }}</template>
              <template #suffix> {{ t('common.purchase') }} </template>
            </el-input>
            <el-input :model-value="count + ' ' + t('common.purchase')" disabled v-else />
          </el-form-item>

          <el-form-item :label="t('lease.totalPrice')" prop="total">
            <el-input :model-value="totalDisplay" class="m-input" disabled>
              <template #prefix v-if="isMobile">{{ t('lease.totalPrice') }}</template>
              <template #suffix> {{ t('common.trx') }} </template>
            </el-input>
          </el-form-item>

          <el-form-item :label="t('lease.energy')" prop="energy">
            <el-input v-model="energy" disabled class="m-input" v-if="isMobile">
              <template #prefix v-if="isMobile">{{ t('lease.energy') }}</template>
              <template #suffix> {{ t('common.w') }} </template>
            </el-input>
            <el-input :model-value="energy + ' ' + t('common.w')" disabled v-else />
          </el-form-item>

          <el-form-item :label="t('lease.validity')" prop="validity">
            <el-input v-model="validity" disabled class="m-input" v-if="isMobile">
              <template #prefix>{{ t('lease.validity') }}</template>
              <template #suffix> {{ validityUnit }} </template>
            </el-input>
            <el-input :model-value="validity + ' ' + validityUnit" disabled v-else />
          </el-form-item>

          <el-form-item :label="t('lease.walletAddress')" prop="wallet">
            <el-input v-model="wallet" :placeholder="t('lease.enterAddress')" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" class="rent-btn" @click="rentNow">
              {{ t('lease.rentNowButton') }}({{ totalDisplay }}TRX)
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- 自定义数量对话框 -->
    <el-dialog
      v-model="customDialogVisible"
      :title="t('lease.customCount')"
      width="400px"
      :close-on-click-modal="false"
      align-center
    >
      <el-form :model="customForm" :rules="customRules" ref="customFormRef" label-width="80px">
        <el-form-item :label="t('lease.count')" prop="count">
          <el-input
            v-model.number="customForm.count"
            type="number"
            :placeholder="t('lease.enterCustomCount')"
            min="1"
            clearable
            @keyup.enter="confirmCustomCount"
          >
            <template #suffix>{{ t('common.purchase') }}</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="customDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="confirmCustomCount">{{ t('common.confirm') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { useCommonStore } from '@/stores/useCommonStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { storeToRefs } from 'pinia'

defineOptions({ name: 'TimeRental' })

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
const priceStore = usePriceStore()
const { isMobile } = storeToRefs(commonStore)
const { priceData } = storeToRefs(priceStore)

const rows = computed(() => [
  {
    label: t('lease.selectCount1Hour'),
    validity: 1,
    validityUnit: 'hour',
    options: [
      `1${t('common.purchase')}`,
      `2${t('common.purchase')}`,
      `5${t('common.purchase')}`,
      `10${t('common.purchase')}`,
      t('lease.custom'),
    ],
  },
  {
    label: t('lease.selectCount1Day'),
    validity: 1,
    validityUnit: 'day',
    options: [
      `1${t('common.purchase')}`,
      `2${t('common.purchase')}`,
      `5${t('common.purchase')}`,
      `10${t('common.purchase')}`,
      t('lease.custom'),
    ],
  },
  {
    label: t('lease.selectCount3Days'),
    validity: 3,
    validityUnit: 'day',
    options: [
      `1${t('common.purchase')}`,
      `2${t('common.purchase')}`,
      `5${t('common.purchase')}`,
      `10${t('common.purchase')}`,
      t('lease.custom'),
    ],
  },
  {
    label: t('lease.selectCount7Days'),
    validity: 7,
    validityUnit: 'day',
    options: [
      `1${t('common.purchase')}`,
      `2${t('common.purchase')}`,
      `5${t('common.purchase')}`,
      `10${t('common.purchase')}`,
      t('lease.custom'),
    ],
  },
  {
    label: t('lease.selectCount15Days'),
    validity: 15,
    validityUnit: 'day',
    options: [
      `1${t('common.purchase')}`,
      `2${t('common.purchase')}`,
      `5${t('common.purchase')}`,
      `10${t('common.purchase')}`,
      t('lease.custom'),
    ],
  },
  {
    label: t('lease.selectCount30Days'),
    validity: 30,
    validityUnit: 'day',
    options: [
      `1${t('common.purchase')}`,
      `2${t('common.purchase')}`,
      `5${t('common.purchase')}`,
      `10${t('common.purchase')}`,
      t('lease.custom'),
    ],
  },
])

const selecteIndex = ref<[number, number]>([0, 0])

// 自定义对话框状态
const customDialogVisible = ref(false)
const customFormRef = ref<FormInstance>()
const customForm = reactive({
  count: 1,
})
const customRowIndex = ref<number>(0)

// 存储自定义数量
const customCounts = ref<Record<number, number>>({})

// 根据选中的行（时长）动态获取单价
const unitPrice = computed(() => {
  const [rowIdx] = selecteIndex.value
  if (!priceData.value) return 1.9
  
  // 根据行索引映射到对应的价格字段（已删除3小时）
  const priceMap = [
    priceData.value.time_1h,  // 1小时
    priceData.value.time_1d,  // 1天
    priceData.value.time_3d,  // 3天
    priceData.value.time_7d,  // 7天
    priceData.value.time_15d, // 15天
    priceData.value.time_30d, // 30天
  ]
  
  return parseFloat(priceMap[rowIdx] || priceData.value.time_1h)
})
const count = computed(() => {
  const [rowIdx, colIdx] = selecteIndex.value
  const opt = rows.value[rowIdx]?.options[colIdx] || `1${t('common.purchase')}`

  // 如果是自定义，使用保存的自定义数量
  if (opt === t('lease.custom')) {
    return customCounts.value[rowIdx] || 1
  }

  // 否则从选项文本中提取数字
  const num = parseInt(String(opt).replace(/[^0-9]/g, '')) || 1
  return num
})

const energy = ref(13.0)
const validity = computed(() => {
  const [rowIdx] = selecteIndex.value
  return rows.value[rowIdx]?.validity || 1
})
const validityUnit = computed(() => {
  const [rowIdx] = selecteIndex.value
  const unit = rows.value[rowIdx]?.validityUnit || 'day'
  return unit === 'hour' ? t('common.hour') : t('common.day')
})
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
  unitPrice: [
    {
      required: true,
      validator: (_rule: unknown, value: number, callback: (error?: string | Error) => void) => {
        if (Number(value) <= 0) {
          callback(new Error(t('formValidation.unitMustBePositive')))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  count: [
    {
      required: true,
      validator: (_rule: unknown, value: number, callback: (error?: string | Error) => void) => {
        if (Number(value) <= 0) {
          callback(new Error(t('formValidation.countMustBePositive')))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
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
  energy: [
    {
      required: true,
      validator: (_rule: unknown, value: number, callback: (error?: string | Error) => void) => {
        if (Number(value) <= 0) {
          callback(new Error(t('formValidation.energyMustBePositive')))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
  validity: [
    {
      required: true,
      validator: (_rule: unknown, value: number, callback: (error?: string | Error) => void) => {
        if (Number(value) <= 0) {
          callback(new Error(t('formValidation.validityMustBePositive')))
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

// 自定义表单验证规则
const customRules = computed<FormRules>(() => ({
  count: [
    { required: true, message: t('formValidation.countRequired'), trigger: 'blur' },
    { type: 'number', message: t('formValidation.countMustBeNumber'), trigger: 'blur' },
    {
      validator: (_rule: unknown, value: number, callback: (error?: string | Error) => void) => {
        if (value < 1) {
          callback(new Error(t('formValidation.countMustBePositive')))
        } else if (value > 1000) {
          callback(new Error(t('formValidation.countTooLarge')))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
}))

watch([unitPrice, count, total, energy, validity], () => {
  form.unitPrice = unitPrice.value
  form.count = count.value
  form.total = total.value
  form.energy = energy.value
  form.validity = validity.value
})

watch(wallet, (v) => (form.wallet = v))

function onSelect(rowIdx: number, idx: number, opt: string) {
  selecteIndex.value = [rowIdx, idx]

  // 判断是否点击了"自定义"
  if (opt === t('lease.custom')) {
    customRowIndex.value = rowIdx
    customForm.count = customCounts.value[rowIdx] || 1
    customDialogVisible.value = true
  }
}

// 确认自定义数量
const confirmCustomCount = async () => {
  if (!customFormRef.value) return

  try {
    await customFormRef.value.validate()
    // 保存自定义数量
    customCounts.value[customRowIndex.value] = customForm.count
    customDialogVisible.value = false
    ElMessage.success(t('formValidation.customCountSet'))
  } catch (error) {
    console.error('Validation failed:', error)
  }
}

const rentNow = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    ElMessage.success(`${t('formValidation.rentalSuccess')} ${totalDisplay.value}`)
  } catch (error) {
    console.error('【ERROR INFO】:', error)
  }
}
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

.row-label {
  width: 100%;
  color: #6b7280;
  font-size: 13px;
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
    padding: 18px 16px 16px;
  }

  .row-options {
    gap: 8px;
  }
}
</style>
