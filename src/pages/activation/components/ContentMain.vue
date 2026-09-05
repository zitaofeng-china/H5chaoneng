<template>
  <el-card class="content-main" shadow="never">
    <section class="activation-section">
      <h2 class="section-title">{{ t('feeCard.title') }}</h2>
      <div class="fee-item">
        <div class="fee-label">{{ t('feeCard.activationPriceLabel') }}</div>
        <div class="fee-price">{{ activationPrice }} {{ t('activation.pricePerAddress') }}</div>
      </div>
    </section>

    <section class="activation-section">
      <h2 class="section-title">{{ t('activation.inputAddress') }}</h2>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="0"
        class="details-form"
      >
        <el-form-item class="textarea-item" prop="address">
          <el-input
            type="textarea"
            :rows="isMobile ? 6 : 4"
            v-model="formData.address"
            :placeholder="t('activation.enterAddresses')"
          />
        </el-form-item>
      </el-form>
      <div class="input-summary">
        <span>
          {{ t('activation.enteredLabel') }}
          <em>{{ enteredCount }}</em>
          {{ t('activation.addressCountUnit') }}
        </span>
        <span>
          {{ t('activation.estimatedFee') }}
          <em>{{ estimatedFee }}</em>
          TRX
        </span>
      </div>
      <el-button type="primary" class="submit-btn" @click="handleSaveAddress">
        {{ t('activation.confirm') }}
      </el-button>
    </section>

    <section class="activation-section">
      <div class="notice-head">
        <h2 class="section-title">{{ t('activation.activationNotice') }}</h2>
        <span class="notice-total">{{ t('activation.noticeCount', { count: noticeList.length }) }}</span>
      </div>
      <div v-if="noticeList.length === 0" class="notice-empty">
        {{ t('common.noData') }}
      </div>
      <div v-else class="notice-list">
        <div v-for="(notice, idx) in noticeList" :key="`${notice.time}-${idx}`" class="notice-card">
          <div class="notice-icon" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 22a2.2 2.2 0 0 0 2.2-2.2h-4.4A2.2 2.2 0 0 0 12 22Zm7-6.2V11a7 7 0 0 0-5.2-6.76V3.6a1.8 1.8 0 1 0-3.6 0v.64A7 7 0 0 0 5 11v4.8L3.4 17.4a1 1 0 0 0 .7 1.7h15.8a1 1 0 0 0 .7-1.7L19 15.8Z"
                fill="#7AA7FF"
              />
            </svg>
          </div>
          <div class="notice-body">
            <div class="notice-time">{{ notice.time }}</div>
            <div class="notice-meta">
              {{ t('activation.activationTotalCount') }}：<em>{{ notice.totalCount }}</em>
              {{ t('activation.countUnit') }}，
              {{ t('activation.activationSuccessCount') }}：<em>{{ notice.skippedCount }}</em>
              {{ t('activation.countUnit') }}，
              {{ t('activation.successActivatedCount') }}：<em>{{ notice.activatedCount }}</em>
              {{ t('activation.countUnit') }}
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
import { ElMessage } from '@/utils/element'
import KindTips from '@/components/kindTips/index.vue'
import { useCommonStore } from '@/stores/useCommonStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { useUserStore } from '@/stores/useUserStore'
import { orderApi } from '@/api'
import { OrderKind } from '@/api/modules/order/types'
import { formatCryptoAmount } from '@/utils/number'
import { handleResponse } from '@/utils/response'

const { t } = useI18n()
const commonStore = useCommonStore()
const priceStore = usePriceStore()
const userStore = useUserStore()
const { isMobile } = storeToRefs(commonStore)
const { userInfo } = storeToRefs(userStore)

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

const addressList = computed(() =>
  formData.address
    .split(/[,，\n\r]+/)
    .map((addr) => addr.trim())
    .filter((addr) => addr.length > 0),
)

const enteredCount = computed(() => addressList.value.length)

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

const handleSaveAddress = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validateField('address')

    if (!formData.address) {
      ElMessage.warning(t('formValidation.enterAddressToSave'))
      return
    }

    // 解析地址列表（支持逗号或换行分隔）
    const addressList = formData.address
      .split(/[,，\n\r]+/)  // 支持中英文逗号和换行符
      .map(addr => addr.trim())  // 去除首尾空格
      .filter(addr => addr.length > 0)  // 过滤空字符串

    if (addressList.length === 0) {
      ElMessage.warning(t('formValidation.enterValidAddress'))
      return
    }

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
      // 后端返回的字段名是小写的 target_list 和 skip_list
      const targetList = data?.target_list || []
      const skipList = data?.skip_list || []
      const totalCount = addressList.length
      const activatedCount = targetList.length
      const skippedCount = skipList.length
      
      // 生成当前时间
      const now = new Date()
      const timeStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      
      // 保存激活通知数据（保存原始数据，不保存翻译后的文本）
      saveActivationNotice({
        time: timeStr,
        totalCount,
        activatedCount,
        skippedCount,
      })
      
      // 根据结果显示不同的消息
      if (activatedCount === 0 && skippedCount === 0) {
        // 如果没有target_list和skip_list数据，但code是000000，说明激活成功
        if (!data || (!data.target_list && !data.skip_list)) {
          ElMessage.success(t('activation.allSuccess', { count: totalCount }))
        } else {
          // 全部失败
          ElMessage.error(t('activation.allFailed'))
        }
      } else if (activatedCount > 0) {
        // 有激活成功的
        if (skippedCount > 0) {
          ElMessage.success(t('activation.partialSuccess', { activated: activatedCount, skipped: skippedCount }))
        } else {
          ElMessage.success(t('activation.allSuccess', { count: activatedCount }))
        }
        
        // 刷新用户信息以更新余额
        if (userStore.isLogin) {
          await userStore.fetchUserInfo()
        }
      } else if (skippedCount > 0) {
        // 全部跳过（已激活）
        ElMessage.warning(t('activation.allSkipped'))
      }
      
      // 刷新用户信息以更新余额（无论是否有TargetList，只要code是000000就刷新）
      if (userStore.isLogin) {
        await userStore.fetchUserInfo()
      }
      
      // 清空表单
      formData.address = ''
    } else {
      ElMessage.error(response.msg || t('activation.activationFailed'))
    }
  } catch (error: any) {
    console.error('【ERROR INFO】:', error)
    
    // 特殊处理未登录错误
    if (error.message === 'NOT_LOGGED_IN') {
      ElMessage.warning(t('common.pleaseLogin'))
      return
    }
    
    ElMessage.error(error.message || t('activation.activationFailed'))
  }
}

// 初始化时刷新价格（store 内已有缓存则短路）；用户信息由 App 统一拉取
onMounted(() => {
  priceStore.fetchPrice()

  // 加载激活通知
  loadActivationNotice()

  // 检查是否有待激活的地址（从托管页面跳转过来）
  const pendingAddresses = sessionStorage.getItem('pendingActivationAddresses')
  if (pendingAddresses) {
    formData.address = pendingAddresses
    // 清除 sessionStorage
    sessionStorage.removeItem('pendingActivationAddresses')
  }
})
</script>

<style lang="scss" scoped>
.content-main {
  max-width: 780px;
  width: 100%;
  margin: 0 auto;
  border: 1px solid #f0f2f5;
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(24, 34, 48, 0.08);

  :deep(.el-card__body) {
    padding: 28px 32px 24px;
  }
}

.activation-section + .activation-section {
  margin-top: 22px;
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0 0 12px;
  padding-left: 10px;
  position: relative;
  color: #1e293b;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 2px;
    height: 12px;
    background: #1766f5;
    transform: translateY(-50%);
  }
}

.fee-item {
  min-height: 72px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 16px 12px;
  border-radius: 8px;
  background: #edf4ff;
  text-align: center;
}

.fee-label {
  color: rgba(71, 84, 103, 0.72);
  font-size: 12px;
  line-height: 1.4;
}

.fee-price {
  color: #1766f5;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
}

.details-form {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  :deep(.el-textarea__inner) {
    min-height: 108px;
    padding: 12px 14px;
    border: 1px solid #e7ebf0;
    border-radius: 8px;
    box-shadow: none;
    color: #1e293b;
    font-size: 13px;
    line-height: 1.6;
    resize: vertical;

    &::placeholder {
      color: #98a2b3;
    }
  }
}

.input-summary {
  display: flex;
  align-items: center;
  gap: 24px;
  margin: 10px 0 12px;
  color: #667085;
  font-size: 12px;
  line-height: 1.4;

  em {
    margin: 0 2px;
    color: #1766f5;
    font-style: normal;
    font-weight: 700;
  }
}

.submit-btn {
  width: 100%;
  height: 44px;
  margin: 0;
  border: 0;
  border-radius: 6px;
  background: #ff6816;
  color: #fff;
  font-size: 14px;
  font-weight: 600;

  &:hover,
  &:focus {
    background: #ff7a30;
    color: #fff;
  }
}

.notice-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  .section-title {
    margin-bottom: 0;
  }
}

.notice-total {
  padding: 2px 8px;
  border-radius: 99px;
  background: #f2f4f7;
  color: #667085;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
}

.notice-empty {
  margin-top: 12px;
  padding: 20px 12px;
  color: #98a2b3;
  font-size: 13px;
  text-align: center;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
}

.notice-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 8px;
  background: #f5f7fa;
}

.notice-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e8f1ff;
}

.notice-time {
  color: #667085;
  font-size: 12px;
  line-height: 1.4;
}

.notice-meta {
  margin-top: 4px;
  color: #475467;
  font-size: 12px;
  line-height: 1.6;

  em {
    color: #1766f5;
    font-style: normal;
    font-weight: 600;
  }
}

:deep(.activation-tips.tips-section) {
  margin-top: 18px;
  padding: 16px 18px;
  border-radius: 8px;
  background: #f4f8fc;
}

.activation-tips {
  :deep(.tips-title) {
    margin-bottom: 12px;
    color: #1e293b;
    font-size: 13px;
    font-weight: 700;
  }

  :deep(.tips-list) {
    gap: 8px;
    font-size: 12px;
  }

  :deep(.tip-text) {
    color: rgba(71, 84, 103, 0.82);
    font-size: 12px;
    line-height: 1.55;
  }
}

@media (max-width: 890px) {
  .content-main {
    border-radius: 10px;
    box-shadow: 0 8px 20px rgba(24, 34, 48, 0.06);

    :deep(.el-card__body) {
      padding: 16px 12px 14px;
    }
  }

  .input-summary {
    flex-wrap: wrap;
    gap: 8px 16px;
  }

  .submit-btn {
    height: 42px;
  }

  .notice-card {
    padding: 10px 12px;
  }
}
</style>
