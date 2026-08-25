<template>
  <div class="time-rental-page">
    <div class="rental-wrapper">
      <!-- 桌面端：网格布局 -->
      <div class="selection-grid" v-if="!isMobile">
        <div class="grid-row" v-for="(row, rIdx) in rows" :key="rIdx">
          <div class="row-label">
            <SvgIcon name="fee-info" width="12" height="12" fill="#1E293B" />
            {{ row.label }}
          </div>
          <div class="row-options">
            <button
              v-for="(opt, idx) in row.options"
              :key="idx"
              :class="[
                'pill',
                selecteIndex[0] === rIdx && selecteIndex[1] === idx ? 'active' : '',
                isCustomSelected(rIdx, idx) ? 'is-custom-value' : '',
              ]"
              @click="onSelect(rIdx, idx, opt)"
            >
              <template v-if="isCustomSelected(rIdx, idx)">
                <span class="pill-kicker">{{ t('lease.custom') }}</span>
                <span class="pill-value">{{ customCounts[rIdx] }}{{ t('common.purchase') }}</span>
              </template>
              <template v-else>{{ opt }}</template>
            </button>
          </div>
        </div>
      </div>

      <!-- 移动端：下拉选择时长 + 按钮选择数量 -->
      <div class="mobile-selection" v-else>
        <div class="selection-item">
          <label class="selection-label">
            <SvgIcon name="fee-info" width="12" height="12" fill="#1E293B" />
            {{ t('lease.selectDuration') }}
          </label>
          <el-select
            v-model="mobileSelectedDuration"
            :placeholder="t('lease.selectDuration')"
            @change="onMobileDurationChange"
            class="duration-select"
          >
            <el-option
              v-for="(row, idx) in rows"
              :key="idx"
              :label="row.label"
              :value="idx"
            />
          </el-select>
        </div>

        <div class="selection-item">
          <label class="selection-label">
            <SvgIcon name="fee-info" width="12" height="12" fill="#1E293B" />
            {{ t('lease.selectQuantity') }}
          </label>
          <div class="row-options">
            <button
              v-for="(opt, idx) in mobileCountOptions"
              :key="idx"
              :class="[
                'pill',
                mobileSelectedCount === idx ? 'active' : '',
                isCustomSelected(mobileSelectedDuration, idx) ? 'is-custom-value' : '',
              ]"
              @click="onMobileCountChange(idx, opt)"
            >
              <template v-if="isCustomSelected(mobileSelectedDuration, idx)">
                <span class="pill-kicker">{{ t('lease.custom') }}</span>
                <span class="pill-value">{{ customCounts[mobileSelectedDuration] }}{{ t('common.purchase') }}</span>
              </template>
              <template v-else>{{ opt }}</template>
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
          label-position="top"
          label-suffix=":"
          class="details-form"
          :class="{ 'derail-form-m': isMobile }"
        >
          <el-form-item :label="t('lease.unitPrice')" prop="unitPrice">
            <el-input :model-value="unitPriceDisplay" disabled class="m-input" v-if="isMobile">
              <template #prefix>{{ t('lease.unitPrice') }}</template>
              <template #suffix> {{ t('common.trx') }} </template>
            </el-input>
            <el-input :model-value="unitPriceDisplay" disabled v-else>
              <template #suffix>{{ t('common.trx') }}</template>
            </el-input>
          </el-form-item>

          <el-form-item :label="t('lease.count')" prop="count">
            <el-input v-model="count" disabled class="m-input" v-if="isMobile">
              <template #prefix>{{ t('lease.count') }}</template>
              <template #suffix> {{ t('common.purchase') }} </template>
            </el-input>
            <el-input :model-value="count" disabled v-else>
              <template #suffix>{{ t('common.purchase') }}</template>
            </el-input>
          </el-form-item>

          <el-form-item :label="t('lease.totalPrice')" prop="total">
            <el-input :model-value="totalDisplay" class="m-input" disabled>
              <template #prefix v-if="isMobile">{{ t('lease.totalPrice') }}</template>
              <template #suffix> {{ t('common.trx') }} </template>
            </el-input>
          </el-form-item>

          <el-form-item :label="t('lease.validity')" prop="validity">
            <el-input v-model="validity" disabled class="m-input" v-if="isMobile">
              <template #prefix>{{ t('lease.validity') }}</template>
              <template #suffix> {{ validityUnit }} </template>
            </el-input>
            <el-input :model-value="validity" disabled v-else>
              <template #suffix>{{ validityUnit }}</template>
            </el-input>
          </el-form-item>

          <el-form-item :label="t('lease.singleEnergy')" prop="energy">
            <el-input v-model="energy" disabled class="m-input" v-if="isMobile">
              <template #prefix v-if="isMobile">{{ t('lease.singleEnergy') }}</template>
              <template #suffix> {{ t('common.w') }} </template>
            </el-input>
            <el-input :model-value="energy" disabled v-else>
              <template #suffix>{{ t('common.w') }}</template>
            </el-input>
          </el-form-item>

          <el-form-item :label="t('lease.totalEnergy')" prop="totalEnergy">
            <el-input v-model="totalEnergy" disabled class="m-input" v-if="isMobile">
              <template #prefix v-if="isMobile">{{ t('lease.totalEnergy') }}</template>
              <template #suffix> {{ t('common.w') }} </template>
            </el-input>
            <el-input :model-value="totalEnergy" disabled v-else>
              <template #suffix>{{ t('common.w') }}</template>
            </el-input>
          </el-form-item>

          <el-form-item :label="t('lease.walletAddress')" prop="wallet">
            <el-input v-model="wallet" :placeholder="t('lease.enterAddress')" />
          </el-form-item>

          <el-form-item>
            <el-button type="primary" class="rent-btn" @click="rentNow">
              {{ t('lease.rentNowButton') }} ({{ totalDisplay }} {{ t('common.trx') }})
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
      class="custom-count-dialog"
    >
      <el-form :model="customForm" :rules="customRules" ref="customFormRef" label-width="36px">
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
import { ElMessage } from '@/utils/element'
import { type FormInstance, type FormRules } from 'element-plus'
import { useCommonStore } from '@/stores/useCommonStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { useUserStore } from '@/stores/useUserStore'
import { useOrderCreation } from '@/hooks/useOrderCreation'
import { OrderKind } from '@/api/modules/order/types'
import { storeToRefs } from 'pinia'
import { formatCryptoAmount } from '@/utils/number'

defineOptions({ name: 'TimeRental' })

interface RentalForm {
  unitPrice: number
  count: number
  total: number
  energy: number
  totalEnergy: number
  validity: number
  wallet: string
}

const { t } = useI18n()

const commonStore = useCommonStore()
const priceStore = usePriceStore()
const userStore = useUserStore()
const { isMobile } = storeToRefs(commonStore)
const { priceData } = storeToRefs(priceStore)
const { userInfo } = storeToRefs(userStore)
const { loading: orderLoading, createOrder } = useOrderCreation()

const CUSTOM_COL = 4

const isCustomSelected = (rowIdx: number, idx: number) =>
  idx === CUSTOM_COL && !!customCounts.value[rowIdx]

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

// 移动端选择状态
const mobileSelectedDuration = ref(0) // 选中的时长索引
const mobileSelectedCount = ref(0) // 选中的数量索引

// 移动端数量选项
const mobileCountOptions = computed(() => {
  return rows.value[mobileSelectedDuration.value]?.options || []
})

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
  
  // 根据行索引映射到对应的价格字段
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
const unitPriceDisplay = computed(() => formatCryptoAmount(unitPrice.value))
const count = computed(() => {
  const [rowIdx, colIdx] = selecteIndex.value
  if (colIdx === CUSTOM_COL) {
    return customCounts.value[rowIdx] || 1
  }
  const opt = rows.value[rowIdx]?.options[colIdx] || `1${t('common.purchase')}`
  return parseInt(String(opt).replace(/[^0-9]/g, '')) || 1
})

const energy = ref(6.5)
const totalEnergy = computed(() => {
  // 单笔能量 × 笔数，保留1位小数
  return +(energy.value * count.value).toFixed(1)
})
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
const totalDisplay = computed(() => formatCryptoAmount(total.value))

const formRef = ref<FormInstance>()
const form = reactive<RentalForm>({
  unitPrice: unitPrice.value,
  count: count.value,
  total: total.value,
  energy: energy.value,
  totalEnergy: totalEnergy.value,
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
  totalEnergy: [
    {
      required: true,
      validator: (_rule: unknown, value: number, callback: (error?: string | Error) => void) => {
        if (Number(value) <= 0) {
          callback(new Error(t('formValidation.totalEnergyMustBePositive')))
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

watch([unitPrice, count, total, energy, totalEnergy, validity], () => {
  form.unitPrice = unitPrice.value
  form.count = count.value
  form.total = total.value
  form.energy = energy.value
  form.totalEnergy = totalEnergy.value
  form.validity = validity.value
})

watch(wallet, (v) => (form.wallet = v))

function onSelect(rowIdx: number, idx: number, opt: string) {
  selecteIndex.value = [rowIdx, idx]

  // 判断是否点击了"自定义"或者是最后一个按钮（自定义按钮的位置）
  if (opt === t('lease.custom') || idx === CUSTOM_COL) {
    customRowIndex.value = rowIdx
    customForm.count = customCounts.value[rowIdx] || 1
    customDialogVisible.value = true
  }
}

// 移动端时长选择变化
const onMobileDurationChange = (durationIdx: number) => {
  mobileSelectedDuration.value = durationIdx
  mobileSelectedCount.value = 0 // 重置数量选择
  selecteIndex.value = [durationIdx, 0]
}

// 移动端数量选择变化
const onMobileCountChange = (countIdx: number, opt: string) => {
  mobileSelectedCount.value = countIdx
  selecteIndex.value = [mobileSelectedDuration.value, countIdx]
  
  // 判断是否选择了"自定义"或者是最后一个选项（自定义按钮的位置）
  if (opt === t('lease.custom') || countIdx === CUSTOM_COL) {
    customRowIndex.value = mobileSelectedDuration.value
    customForm.count = customCounts.value[mobileSelectedDuration.value] || 1
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

    const [rowIdx] = selecteIndex.value
    const validityValue = rows.value[rowIdx]?.validity || 1
    const validityUnitValue = rows.value[rowIdx]?.validityUnit || 'day'
    
    let durationInSeconds: number | string
    if (validityUnitValue === 'hour') {
      durationInSeconds = validityValue * 3600 + "s"
    } else {
      durationInSeconds = validityValue * 86400 + "s"
    }

    const success = await createOrder({
      count: count.value,
      duration: durationInSeconds,
      kind: OrderKind.KindTimeEnergy,
      target: [wallet.value],
      userId: userInfo.value?.id || 0,
      context: 'lease_time',
    })
    
    if (success) {
      wallet.value = ''
    }
  } catch (error) {
    console.error('【ERROR INFO】:', error)
  }
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/detail-form.scss';

.time-rental-page {
  display: flex;
  justify-content: center;
  padding: 2px 0 32px;
}

.rental-wrapper {
  @include rental-card;

  box-sizing: border-box;
  width: min(680px, 100%);
  max-width: 100%;
  padding: 18px;
}

.selection-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 10px;
  margin-bottom: 18px;
}

.grid-row {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 7px;
  padding: 8px;
  border: 1px solid #eef1f5;
  border-radius: 4px;
  background: #fbfcfe;
}

.row-label {
  display: flex;
  align-items: center;
  min-height: 14px;
  width: 100%;
  color: #667085;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;

  :deep(svg) {
    flex: 0 0 auto;
    margin-right: 4px;
  }
}

.row-options {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 5px;
  width: 100%;
}

.pill {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  height: 30px;
  padding: 0 3px;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  overflow: hidden;
  border: none;
  border-radius: 3px;
  background: #f0f2f4;
  color: #98a2b3;
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;

  &:hover {
    background: #e8ebef;
    color: #667085;
  }

  &.active {
    background: var(--theme-bg-blue);
    color: var(--theme-text-white);
    box-shadow: 0 2px 5px rgba(22, 93, 255, 0.12);
  }
}

.pill-kicker,
.pill-value {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pill-kicker {
  font-size: 9px;
  font-weight: 500;
  line-height: 1.1;
}

.pill-value {
  font-size: 10px;
  font-weight: 600;
  line-height: 1.1;
}

.details-card {
  margin-top: 0;

  .card-title {
    margin: 0 0 14px;
    color: var(--theme-text-dark);
    font-size: 16px;
    font-weight: 700;
    line-height: 1.2;
    text-align: center;
  }
}

.details-form {
  :deep(.el-form-item) {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 8px;
  }

  :deep(.el-form-item__label) {
    box-sizing: border-box;
    width: 100% !important;
    height: auto;
    min-height: 14px;
    padding: 0 0 4px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    color: #344054;
    font-size: 11px;
    font-weight: 600;
    line-height: 1.2;
    text-align: left;
  }

  :deep(.el-form-item__content) {
    min-height: 0;
    margin-left: 0 !important;
    line-height: 1;
    flex-direction: column;
    align-items: stretch;
  }

  :deep(.el-form-item__error) {
    position: static;
    padding-top: 4px;
    line-height: 1.3;
  }

  :deep(.el-input) {
    width: 100%;
  }

  :deep(.el-input__wrapper) {
    min-height: 34px;
    padding: 1px 10px;
    border-radius: 3px;
    background: #fff;
    box-shadow: 0 0 0 1px #e1e6ee inset;
  }

  :deep(.el-input.is-disabled .el-input__wrapper) {
    background: #f1f3f5;
    box-shadow: none;
  }

  :deep(.el-input__inner) {
    height: 32px;
    color: #344054;
    font-size: 12px;
    font-weight: 600;
    -webkit-text-fill-color: initial;
  }

  :deep(.el-input.is-disabled .el-input__inner) {
    color: #344054;
    -webkit-text-fill-color: initial;
  }

  :deep(.el-input__suffix),
  :deep(.el-input__prefix) {
    color: #667085;
    font-size: 11px;
  }

  :deep(.el-form-item.is-error .el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-color-danger) inset;
  }
}

:deep(.rent-btn) {
  width: 100%;
  height: 38px;
  margin-top: 4px;
  border: none;
  border-radius: 3px;
  background: var(--theme-bg-orange);
  color: var(--theme-text-white);
  font-size: 12px;
  font-weight: 700;
}

:deep(.custom-count-dialog) {
  align-self: center;
  height: auto !important;
  min-height: 0;
  max-height: calc(100vh - 80px);
  overflow: visible;
  width: 320px !important;
  margin: 0 auto;
  padding: 0;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 28px rgba(16, 24, 40, 0.18);

  .el-dialog__header {
    margin: 0;
    padding: 9px 12px 7px;
  }

  .el-dialog__title {
    color: #1f2937;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.2;
  }

  .el-dialog__headerbtn {
    top: 8px;
    right: 8px;
    width: 22px;
    height: 22px;
    border-radius: 4px;
    background: #eef0f3;

    .el-dialog__close {
      color: #667085;
      font-size: 13px;
    }
  }

  .el-dialog__body {
    margin: 0;
    padding: 3px 12px 8px;
  }

  .el-form-item {
    margin-bottom: 0;
  }

  .el-form-item__label {
    width: 36px !important;
    height: 28px;
    padding: 0 6px 0 0;
    overflow: visible;
    white-space: nowrap;
    color: #475467;
    font-size: 11px;
    font-weight: 500;
    line-height: 28px;
  }

  .el-form-item__content {
    min-width: 0;
    margin-left: 0 !important;
    line-height: 1;
  }

  .el-input__wrapper {
    min-height: 28px;
    padding: 0 8px;
    border-radius: 2px;
    box-shadow: 0 0 0 1px #dfe4eb inset;
  }

  .el-input__inner {
    height: 26px;
    color: #344054;
    font-size: 11px;
  }

  .el-input__suffix {
    color: #98a2b3;
    font-size: 10px;
  }

  .el-form-item.is-error .el-input__wrapper {
    box-shadow: 0 0 0 1px var(--el-color-danger) inset;
  }

  .el-dialog__footer {
    padding: 5px 12px 10px;
    display: flex;
    gap: 6px;
  }

  .el-button {
    flex: 1;
    min-width: 0;
    height: 28px;
    margin: 0 !important;
    padding: 0 8px;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 500;
  }

  .el-button--primary {
    border-color: var(--theme-bg-blue);
    background: var(--theme-bg-blue);
  }
}

@media (max-width: 768px) {
  .time-rental-page {
    padding: 2px 6px 24px;
  }

  .rental-wrapper {
    width: 100%;
    padding: 12px;
  }

  .selection-grid {
    display: none;
  }

  .mobile-selection {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 18px;

    .selection-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .selection-label {
      display: flex;
      align-items: center;
      gap: 4px;
      color: #344054;
      font-size: 12px;
      font-weight: 600;
      line-height: 1.2;
    }

    :deep(.el-select) {
      width: 100%;

      .el-input__wrapper {
        min-height: 38px;
        padding: 0 10px;
        border: 1px solid #e1e6ee;
        border-radius: 3px;
        background: #fff;
        box-shadow: none;
      }

      .el-input__inner {
        height: 38px;
        color: #344054;
        font-size: 13px;
      }
    }

    .row-options {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px;
    }

    .pill {
      height: 36px;
      padding: 0 8px;
      font-size: 12px;

      &:last-child {
        grid-column: 1 / -1;
      }
    }
  }

  .details-card {
    .card-title {
      margin-bottom: 14px;
      font-size: 15px;
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 8px;
  }

  :deep(.el-input__inner) {
    font-size: 13px;
  }

  :deep(.el-input__prefix),
  :deep(.el-input__suffix) {
    font-size: 12px;
  }

  :deep(.el-input__wrapper) {
    min-height: 36px;
  }

  :deep(.rent-btn) {
    height: 42px;
    margin-top: 6px;
    font-size: 13px;
  }

  :deep(.custom-count-dialog) {
    width: 230px !important;

    .el-dialog__header {
      padding: 10px 10px 8px;
    }

    .el-dialog__title {
      font-size: 10px;
      line-height: 12px;
    }

    .el-dialog__headerbtn {
      top: 7px;
      right: 8px;
      width: 18px;
      height: 18px;

      .el-dialog__close {
        font-size: 11px;
      }
    }

    .el-dialog__body {
      padding: 4px 9px 7px;
    }

    .el-form-item {
      height: 18px;
    }

    .el-form-item__label {
      width: 28px !important;
      height: 18px;
      padding-right: 4px;
      overflow: visible;
      white-space: nowrap;
      font-size: 9px;
      line-height: 18px;
    }

    .el-input__wrapper {
      height: 18px;
      min-height: 18px;
      padding: 0 5px;
    }

    .el-input__inner {
      height: 16px;
      font-size: 10px;
    }

    .el-input__suffix {
      font-size: 9px;
    }

    .el-dialog__footer {
      padding: 7px 9px 7px;
      gap: 5px;
    }

    .el-button {
      height: 20px;
      padding: 0 6px;
      border-radius: 2px;
      font-size: 9px;
    }
  }
}
</style>
