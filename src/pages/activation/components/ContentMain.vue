<template>
  <el-card class="content-main" shadow="never">
    <!-- 资费说明微立体看板 -->
    <section class="activation-section">
      <div class="section-title-wrap">
        <h2 class="section-title">{{ t('feeCard.title') }}</h2>
      </div>
      <div class="fee-card-glass">
        <div class="fee-card-left">
          <div class="fee-token-badge">
            <svg width="22" height="22" viewBox="0 0 32 32" fill="none" class="trx-icon">
              <circle cx="16" cy="16" r="16" fill="#EF0027" />
              <path d="M7 8.5L25 6L21 24.5L16 26.5L7 8.5Z" stroke="#FFFFFF" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
              <path d="M7 8.5L17.5 14.5L25 6" stroke="#FFFFFF" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
              <path d="M17.5 14.5V26" stroke="#FFFFFF" stroke-width="1.8" fill="none" stroke-linecap="round"/>
              <path d="M17.5 14.5L21 24.5" stroke="#FFFFFF" stroke-width="1.8" fill="none" stroke-linejoin="round"/>
            </svg>
            <span class="fee-token-name">TRON</span>
          </div>
          <div class="fee-card-detail">
            <span class="fee-detail-label">{{ t('feeCard.activationPriceLabel') }}</span>
            <span class="fee-detail-value">{{ activationPrice }} <small>{{ t('activation.pricePerAddress') }}</small></span>
          </div>
        </div>
        <div class="fee-card-divider" />
        <div class="fee-card-right">
          <span class="fee-calc-label">{{ t('activation.estimatedFee') }}</span>
          <div class="fee-calc-amount">
            <span class="amount-num">{{ estimatedFee }}</span>
            <span class="amount-unit">TRX</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 地址录入与实时诊断 -->
    <section class="activation-section">
      <div class="section-title-wrap">
        <h2 class="section-title">{{ t('activation.inputAddress') }}</h2>
        <div
          v-if="enteredCount > 0"
          class="address-diagnostic-pill"
          :class="{ 'has-invalid': invalidAddressCount > 0 }"
        >
          <span class="diagnostic-dot" />
          <span v-if="invalidAddressCount === 0">
            {{ t('activation.allValidHint', { count: validAddressCount }) }}
          </span>
          <span v-else>
            {{ t('activation.mixedHint', { valid: validAddressCount, invalid: invalidAddressCount }) }}
          </span>
        </div>
      </div>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="0"
        class="details-form"
      >
        <el-form-item class="textarea-item" prop="address">
          <div class="textarea-container">
            <el-input
              type="textarea"
              :rows="isMobile ? 6 : 5"
              v-model="formData.address"
              :placeholder="t('activation.enterAddresses')"
              class="batch-address-textarea"
            />
            <div v-if="formData.address" class="textarea-actions-bar">
              <button
                type="button"
                class="action-tag-btn action-dedup tactile-btn"
                @click="handleDeduplicate"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 7V4h16v3M9 20h6M12 4v16"/>
                </svg>
                <span>{{ t('activation.deduplicate') }}</span>
              </button>
              <button
                type="button"
                class="action-tag-btn action-clear tactile-btn"
                @click="handleClearAddress"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                <span>{{ t('activation.clear') }}</span>
              </button>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <div class="input-summary-bar">
        <div class="summary-metric">
          <span class="metric-label">{{ t('activation.enteredLabel') }}</span>
          <span class="metric-val"><em>{{ enteredCount }}</em> {{ t('activation.addressCountUnit') }}</span>
        </div>
        <div class="summary-divider" />
        <div class="summary-metric">
          <span class="metric-label">{{ t('activation.estimatedFee') }}</span>
          <span class="metric-val fee-highlight"><em>{{ estimatedFee }}</em> TRX</span>
        </div>
      </div>

      <el-button
        type="primary"
        class="submit-btn tactile-btn"
        :loading="submitting"
        :disabled="submitting || enteredCount === 0"
        @click="handleSaveAddress"
      >
        <span>{{ submitting ? t('activation.activating') : t('activation.confirm') }}</span>
      </el-button>
    </section>

    <!-- 激活通知卡片列表 -->
    <section class="activation-section">
      <div class="notice-head">
        <div class="notice-title-group">
          <h2 class="section-title">{{ t('activation.activationNotice') }}</h2>
          <span class="notice-total">{{ t('activation.noticeCount', { count: noticeList.length }) }}</span>
        </div>
        <button
          v-if="noticeList.length > 0"
          type="button"
          class="notice-clear-btn tactile-btn"
          @click="handleClearNoticeList"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          <span>{{ t('activation.clearNotice') }}</span>
        </button>
      </div>

      <div v-if="noticeList.length === 0" class="notice-empty">
        <div class="empty-icon-wrap" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#98a2b3" stroke-width="1.6" stroke-linecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        </div>
        <span class="empty-text">{{ t('common.noData') }}</span>
      </div>

      <div v-else class="notice-list">
        <div
          v-for="(notice, idx) in noticeList"
          :key="`${notice.time}-${idx}`"
          class="notice-card"
        >
          <div class="notice-card-header">
            <div class="notice-time-wrap">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span class="notice-time">{{ notice.time }}</span>
            </div>
            <div class="status-badge" :class="getNoticeStatusClass(notice)">
              {{ getNoticeStatusText(notice) }}
            </div>
          </div>
          <div class="notice-stats-grid">
            <div class="stat-col">
              <span class="stat-label">{{ t('activation.activationTotalCount') }}</span>
              <span class="stat-num">{{ notice.totalCount }}</span>
            </div>
            <div class="stat-col stat-skipped">
              <span class="stat-label">{{ t('activation.activationSuccessCount') }}</span>
              <span class="stat-num">{{ notice.skippedCount }}</span>
            </div>
            <div class="stat-col stat-activated">
              <span class="stat-label">{{ t('activation.successActivatedCount') }}</span>
              <span class="stat-num">{{ notice.activatedCount }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <KindTips :tips="kindTipTexts" class="activation-tips" />
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from '@/utils/element'
import KindTips from '@/components/kindTips/index.vue'
import { useCommonStore } from '@/stores/useCommonStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { useUserStore } from '@/stores/useUserStore'
import { orderApi } from '@/api'
import { OrderKind } from '@/api/modules/order/types'
import { formatCryptoAmount } from '@/utils/number'
import { useTelegramHaptics } from '@/hooks/useTelegramHaptics'

const { t } = useI18n()
const commonStore = useCommonStore()
const priceStore = usePriceStore()
const userStore = useUserStore()
const { isMobile } = storeToRefs(commonStore)
const { userInfo } = storeToRefs(userStore)
const { tmaHapticImpact, tmaHapticNotification } = useTelegramHaptics()

interface ActivationNotice {
  time: string
  totalCount: number
  activatedCount: number
  skippedCount: number
  savedAt: number
}

const NOTICE_KEY = 'activationNoticeList'
const NOTICE_TTL = 30 * 60 * 1000
const NOTICE_LIMIT = 20

const formatFeePrice = (value: string | number) =>
  formatCryptoAmount(value).replace(/\.00$/, '')

const activationPrice = computed(() =>
  formatFeePrice(priceStore.priceData?.active || '1.2'),
)

const kindTipTexts = computed<string[]>(() => [t('activation.tips1'), t('activation.tips2')])

const noticeList = ref<ActivationNotice[]>([])
const submitting = ref(false)

const loadActivationNotice = () => {
  localStorage.removeItem('activationNotice')

  const now = Date.now()
  const savedList = localStorage.getItem(NOTICE_KEY)
  if (savedList) {
    try {
      const parsed = JSON.parse(savedList) as ActivationNotice[]
      noticeList.value = parsed.filter((item) => now - (item.savedAt || 0) < NOTICE_TTL)
      persistNoticeList()
      return
    } catch (e) {
      console.error('Failed to parse activation notice list:', e)
      localStorage.removeItem(NOTICE_KEY)
    }
  }

  const saved = localStorage.getItem('activationNoticeData')
  const savedTime = localStorage.getItem('activationNoticeTime')
  if (saved && savedTime) {
    const noticeTime = Number.parseInt(savedTime, 10)
    if (now - noticeTime < NOTICE_TTL) {
      try {
        const data = JSON.parse(saved) as Omit<ActivationNotice, 'savedAt'>
        noticeList.value = [{ ...data, savedAt: noticeTime }]
        persistNoticeList()
      } catch (e) {
        console.error('Failed to parse activation notice data:', e)
      }
    }
    localStorage.removeItem('activationNoticeData')
    localStorage.removeItem('activationNoticeTime')
  }
}

const persistNoticeList = () => {
  localStorage.setItem(NOTICE_KEY, JSON.stringify(noticeList.value))
}

const saveActivationNotice = (data: Omit<ActivationNotice, 'savedAt'>) => {
  noticeList.value = [{ ...data, savedAt: Date.now() }, ...noticeList.value].slice(0, NOTICE_LIMIT)
  persistNoticeList()
}

const formRef = ref<FormInstance>()
const formData = reactive({
  address: '',
})

/** TRON 地址 Base58Check 正则：以大写 T 开头且为 34 位 Base58 格式 */
const isValidTronAddress = (address: string): boolean => {
  return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)
}

/** 智能解析输入的地址列表（支持中英文逗号、换行符） */
const parsedAddresses = computed(() => {
  if (!formData.address) return []
  return formData.address
    .split(/[,，\n\r]+/)
    .map((addr) => addr.trim())
    .filter((addr) => addr.length > 0)
})

const enteredCount = computed(() => parsedAddresses.value.length)

const validAddressCount = computed(() => {
  return parsedAddresses.value.filter(isValidTronAddress).length
})

const invalidAddressCount = computed(() => {
  return parsedAddresses.value.length - validAddressCount.value
})

const estimatedFee = computed(() => {
  const unit = Number(priceStore.priceData?.active || '1.2')
  const amount = Number.isFinite(unit) ? unit * enteredCount.value : 0
  return formatFeePrice(amount)
})

const formRules = computed<FormRules>(() => ({
  address: [
    { required: true, message: t('formValidation.addressRequired'), trigger: 'blur' },
    { min: 10, message: t('formValidation.addressTooShort'), trigger: 'blur' },
  ],
}))

/** 一键去重 */
const handleDeduplicate = () => {
  tmaHapticImpact('light')
  const original = parsedAddresses.value
  if (original.length === 0) return
  const unique = Array.from(new Set(original))
  const removed = original.length - unique.length
  if (removed > 0) {
    formData.address = unique.join('\n')
    ElMessage.success(t('activation.deduplicateTip', { count: removed }))
  } else {
    ElMessage.info(t('activation.noDuplicates'))
  }
}

/** 一键清空 */
const handleClearAddress = () => {
  tmaHapticImpact('light')
  formData.address = ''
  ElMessage.success(t('activation.clearedSuccess'))
}

/** 清空激活历史记录 */
const handleClearNoticeList = () => {
  tmaHapticImpact('medium')
  ElMessageBox.confirm(
    t('activation.clearNoticeConfirm'),
    t('common.warning'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning',
    }
  )
    .then(() => {
      noticeList.value = []
      localStorage.removeItem(NOTICE_KEY)
      localStorage.removeItem('activationNotice')
      localStorage.removeItem('activationNoticeData')
      localStorage.removeItem('activationNoticeTime')
      tmaHapticNotification('success')
      ElMessage.success(t('activation.clearNoticeSuccess'))
    })
    .catch(() => {})
}

/** 状态样式与文案映射 */
const getNoticeStatusClass = (notice: ActivationNotice) => {
  if (notice.activatedCount > 0 && notice.skippedCount === 0) {
    return 'status-all-success'
  }
  if (notice.activatedCount > 0 && notice.skippedCount > 0) {
    return 'status-partial'
  }
  if (notice.activatedCount === 0 && notice.skippedCount > 0) {
    return 'status-all-skipped'
  }
  return 'status-failed'
}

const getNoticeStatusText = (notice: ActivationNotice) => {
  if (notice.activatedCount > 0 && notice.skippedCount === 0) {
    return t('activation.statusAllSuccess')
  }
  if (notice.activatedCount > 0 && notice.skippedCount > 0) {
    return t('activation.statusPartial')
  }
  if (notice.activatedCount === 0 && notice.skippedCount > 0) {
    return t('activation.statusAllSkipped')
  }
  return t('activation.statusFailed')
}

const handleSaveAddress = async () => {
  tmaHapticImpact('medium')
  if (!formRef.value || submitting.value) return

  try {
    await formRef.value.validateField('address')

    if (!formData.address) {
      ElMessage.warning(t('formValidation.enterAddressToSave'))
      return
    }

    const addressList = parsedAddresses.value

    if (addressList.length === 0) {
      ElMessage.warning(t('formValidation.enterValidAddress'))
      return
    }

    // 格式合法性预检拦截：若输入全部非合规地址，予以拦截保护
    const allInvalid = addressList.every((addr) => !isValidTronAddress(addr))
    if (allInvalid) {
      ElMessage.error(t('activation.invalidAddressAlert'))
      tmaHapticNotification('error')
      return
    }

    submitting.value = true

    // 构建订单参数
    const orderParams = {
      count: undefined,                  // 批量激活不需要数量
      duration: undefined,               // 批量激活不需要时长
      kind: OrderKind.KindBatchActive,   // kind = 10（批量激活）
      target: addressList,               // 地址数组
      user_id: userInfo.value?.id || 0,  // 用户ID
    }

    // 调用创建订单接口
    const response = await orderApi.createOrder(orderParams)
    
    // 检查响应
    if (response.code === '000000') {
      const data = response.data as any
      const targetList = data?.target_list || []
      const skipList = data?.skip_list || []
      const totalCount = addressList.length
      const activatedCount = targetList.length
      const skippedCount = skipList.length
      
      // 生成当前时间
      const now = new Date()
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      
      // 保存激活通知数据
      saveActivationNotice({
        time: timeStr,
        totalCount,
        activatedCount,
        skippedCount,
      })
      
      // 根据结果显示不同的消息
      if (activatedCount === 0 && skippedCount === 0) {
        if (!data || (!data.target_list && !data.skip_list)) {
          ElMessage.success(t('activation.allSuccess', { count: totalCount }))
          tmaHapticNotification('success')
        } else {
          ElMessage.error(t('activation.allFailed'))
          tmaHapticNotification('error')
        }
      } else if (activatedCount > 0) {
        if (skippedCount > 0) {
          ElMessage.success(t('activation.partialSuccess', { activated: activatedCount, skipped: skippedCount }))
        } else {
          ElMessage.success(t('activation.allSuccess', { count: activatedCount }))
        }
        tmaHapticNotification('success')
        
        if (userStore.isLogin) {
          await userStore.fetchUserInfo()
        }
      } else if (skippedCount > 0) {
        ElMessage.warning(t('activation.allSkipped'))
        tmaHapticNotification('warning')
      }
      
      if (userStore.isLogin) {
        await userStore.fetchUserInfo()
      }
      
      formData.address = ''
    } else {
      ElMessage.error(response.msg || t('activation.activationFailed'))
      tmaHapticNotification('error')
    }
  } catch (error: any) {
    console.error('【ERROR INFO】:', error)
    
    if (error.message === 'NOT_LOGGED_IN') {
      ElMessage.warning(t('common.pleaseLogin'))
      return
    }
    
    ElMessage.error(error.message || t('activation.activationFailed'))
    tmaHapticNotification('error')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  priceStore.fetchPrice()
  loadActivationNotice()

  const pendingAddresses = sessionStorage.getItem('pendingActivationAddresses')
  if (pendingAddresses) {
    formData.address = pendingAddresses
    sessionStorage.removeItem('pendingActivationAddresses')
  }
})
</script>

<style lang="scss" scoped>
.content-main {
  max-width: 780px;
  width: 100%;
  margin: 0 auto;
  border: 1px solid #edf2f7;
  border-radius: 16px;
  box-shadow: 0 16px 40px -8px rgba(24, 34, 48, 0.07);
  background: #ffffff;

  :deep(.el-card__body) {
    padding: 28px 32px 24px;
  }
}

.activation-section + .activation-section {
  margin-top: 24px;
}

.section-title-wrap {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0;
  padding-left: 10px;
  position: relative;
  color: #1e293b;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 3px;
    height: 13px;
    border-radius: 2px;
    background: #1766f5;
    transform: translateY(-50%);
  }
}

/* 资费说明微立体卡片 */
.fee-card-glass {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8faff 0%, #f0f5ff 100%);
  border: 1px solid rgba(23, 102, 245, 0.12);
  box-shadow: 0 4px 16px rgba(23, 102, 245, 0.04);
}

.fee-card-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.fee-token-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(239, 0, 39, 0.15);
  box-shadow: 0 2px 6px rgba(239, 0, 39, 0.06);

  .trx-icon {
    display: block;
    flex-shrink: 0;
  }

  .fee-token-name {
    color: #ef0027;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.5px;
  }
}

.fee-card-detail {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fee-detail-label {
  color: #64748b;
  font-size: 12px;
  line-height: 1.3;
}

.fee-detail-value {
  color: #0f172a;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.3;

  small {
    margin-left: 2px;
    color: #64748b;
    font-size: 12px;
    font-weight: 500;
  }
}

.fee-card-divider {
  width: 1px;
  height: 38px;
  background: rgba(23, 102, 245, 0.14);
}

.fee-card-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.fee-calc-label {
  color: #64748b;
  font-size: 12px;
  line-height: 1.3;
}

.fee-calc-amount {
  display: flex;
  align-items: baseline;
  gap: 4px;

  .amount-num {
    color: #1766f5;
    font-size: 20px;
    font-weight: 800;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    line-height: 1.2;
  }

  .amount-unit {
    color: #1766f5;
    font-size: 12px;
    font-weight: 700;
  }
}

/* 实时诊断胶囊徽标 */
.address-diagnostic-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
  transition: all 0.2s ease;

  .diagnostic-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #22c55e;
    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.25);
  }

  &.has-invalid {
    background: #fffbeb;
    border-color: #fde68a;
    color: #b45309;

    .diagnostic-dot {
      background: #f59e0b;
      box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.25);
    }
  }
}

/* 文本域容器与工具条 */
.textarea-container {
  position: relative;
  width: 100%;
}

.details-form {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  :deep(.batch-address-textarea .el-textarea__inner) {
    min-height: 120px;
    padding: 12px 14px 40px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    box-shadow: none;
    color: #0f172a;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    line-height: 1.6;
    resize: vertical;
    transition: all 0.2s ease;

    &:hover {
      border-color: #cbd5e1;
    }

    &:focus {
      border-color: #1766f5;
      box-shadow: 0 0 0 3px rgba(23, 102, 245, 0.12);
    }

    &::placeholder {
      color: #94a3b8;
      font-family: inherit;
    }
  }
}

.textarea-actions-bar {
  position: absolute;
  right: 8px;
  bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  z-index: 2;
}

.action-tag-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: #1766f5;
    border-color: #bfdbfe;
    background: #f8faff;
  }

  &.action-clear:hover {
    color: #ef4444;
    border-color: #fecaca;
    background: #fef2f2;
  }
}

/* 录入统计结算栏 */
.input-summary-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 12px 0 14px;
  padding: 10px 14px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #f1f5f9;
}

.summary-metric {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #64748b;
  font-size: 13px;
  line-height: 1.4;

  .metric-label {
    color: #64748b;
  }

  .metric-val {
    color: #1e293b;
    font-weight: 600;

    em {
      font-style: normal;
      color: #1766f5;
      font-weight: 700;
      margin-right: 2px;
    }
  }

  .fee-highlight {
    color: #1766f5;
  }
}

.summary-divider {
  width: 1px;
  height: 16px;
  background: #cbd5e1;
}

/* 确认提交主按钮 */
.submit-btn {
  width: 100%;
  height: 46px;
  margin: 0;
  border: 0;
  border-radius: 8px;
  background: linear-gradient(135deg, #ff7a30 0%, #ff521a 100%);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(255, 90, 26, 0.28);
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #ff8a45 0%, #ff622c 100%);
    box-shadow: 0 6px 18px rgba(255, 90, 26, 0.36);
    transform: translateY(-1px);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(255, 90, 26, 0.22);
  }

  &:disabled {
    opacity: 0.65;
    box-shadow: none;
    cursor: not-allowed;
  }
}

/* 触觉按钮辅助类 */
.tactile-btn {
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* 激活通知区域 */
.notice-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.notice-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.notice-total {
  padding: 2px 8px;
  border-radius: 99px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.notice-clear-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    color: #ef4444;
    background: #fef2f2;
    border-color: #fee2e2;
  }
}

.notice-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 28px 16px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;

  .empty-icon-wrap {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .empty-text {
    color: #94a3b8;
    font-size: 13px;
  }
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 账单卡片风格 */
.notice-card {
  padding: 14px 16px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid #edf2f7;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  transition: all 0.2s ease;

  &:hover {
    border-color: #e2e8f0;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.06);
  }
}

.notice-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.notice-time-wrap {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #64748b;
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.4;

  &.status-all-success {
    background: #f0fdf4;
    color: #16a34a;
    border: 1px solid #bbf7d0;
  }

  &.status-partial {
    background: #eff6ff;
    color: #2563eb;
    border: 1px solid #bfdbfe;
  }

  &.status-all-skipped {
    background: #fffbeb;
    color: #d97706;
    border: 1px solid #fde68a;
  }

  &.status-failed {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }
}

.notice-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #f1f5f9;
}

.stat-col {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .stat-label {
    color: #64748b;
    font-size: 11px;
    line-height: 1.3;
  }

  .stat-num {
    color: #0f172a;
    font-size: 15px;
    font-weight: 700;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    line-height: 1.2;
  }

  &.stat-skipped .stat-num {
    color: #d97706;
  }

  &.stat-activated .stat-num {
    color: #16a34a;
  }
}

/* 底部温馨提示 */
:deep(.activation-tips.tips-section) {
  margin-top: 20px;
  padding: 16px 18px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid #edf2f7;
}

.activation-tips {
  :deep(.tips-title) {
    margin-bottom: 10px;
    color: #1e293b;
    font-size: 13px;
    font-weight: 700;
  }

  :deep(.tips-list) {
    gap: 8px;
    font-size: 12px;
  }

  :deep(.tip-text) {
    color: #64748b;
    font-size: 12px;
    line-height: 1.6;
  }
}

@media (max-width: 890px) {
  .content-main {
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(24, 34, 48, 0.05);

    :deep(.el-card__body) {
      padding: 18px 14px 16px;
    }
  }

  .fee-card-glass {
    padding: 12px 14px;
  }

  .fee-card-divider {
    height: 32px;
  }

  .fee-detail-value {
    font-size: 15px;
  }

  .fee-calc-amount .amount-num {
    font-size: 17px;
  }

  .input-summary-bar {
    flex-wrap: wrap;
    gap: 8px 14px;
  }

  .submit-btn {
    height: 44px;
    font-size: 14px;
  }

  .notice-card {
    padding: 12px 12px;
  }

  .notice-stats-grid {
    gap: 6px;
  }

  .stat-col .stat-num {
    font-size: 14px;
  }
}
</style>
