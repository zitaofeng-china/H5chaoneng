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
import { reactive, ref, computed, onMounted } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { ElMessage } from 'element-plus'
import FeeCard from '@/components/feeCard/index.vue'
import KindTips from '@/components/kindTips/index.vue'
import { useCommonStore } from '@/stores/useCommonStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { useUserStore } from '@/stores/useUserStore'
import { orderApi } from '@/api'
import { OrderKind } from '@/api/modules/order/types'
import { handleResponse } from '@/utils/response'

const { t } = useI18n()
const commonStore = useCommonStore()
const priceStore = usePriceStore()
const userStore = useUserStore()
const { isMobile } = storeToRefs(commonStore)
const { userInfo } = storeToRefs(userStore)

const feeCardTexts = computed<string[]>(() => {
  const activationPrice = priceStore.priceData?.active || '1.2'
  return [`${t('feeCard.activationPriceLabel')}：${activationPrice} TRX`]
})

const kindTipTexts = computed<string[]>(() => [t('activation.tips1'), t('activation.tips2')])

// 激活通知状态（使用 ref 使其响应式）
const activationNotice = ref<string>('')

// 从 localStorage 加载激活通知（检查是否超过30分钟）
const loadActivationNotice = () => {
  const saved = localStorage.getItem('activationNotice')
  const savedTime = localStorage.getItem('activationNoticeTime')
  
  if (saved && savedTime) {
    const noticeTime = Number.parseInt(savedTime, 10)
    const now = Date.now()
    const thirtyMinutes = 30 * 60 * 1000 // 30分钟的毫秒数
    
    // 如果通知时间在30分钟内，显示通知
    if (now - noticeTime < thirtyMinutes) {
      activationNotice.value = saved
    } else {
      // 超过30分钟，清除通知
      localStorage.removeItem('activationNotice')
      localStorage.removeItem('activationNoticeTime')
    }
  }
}

// 保存激活通知到 localStorage（同时保存时间戳）
const saveActivationNotice = (notice: string) => {
  activationNotice.value = notice
  localStorage.setItem('activationNotice', notice)
  localStorage.setItem('activationNoticeTime', Date.now().toString())
}

const notices = computed<string[]>(() => {
  if (activationNotice.value) {
    return [activationNotice.value]
  }
  return []
})

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
      
      // 生成激活通知
      const notice = `${t('activation.activationNotice')}: ${timeStr} ${t('activation.activationTotalCount')}: ${totalCount}, ${t('activation.activationSuccessCount')}: ${activatedCount}, ${t('activation.skippedCount')}: ${skippedCount}`
      saveActivationNotice(notice)
      
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
    ElMessage.error(error.message || t('activation.activationFailed'))
  }
}

// 初始化时获取价格和用户信息
onMounted(() => {
  priceStore.fetchPrice()
  // 如果用户已登录，获取用户信息
  if (userStore.isLogin) {
    userStore.fetchUserInfo()
  }
  
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
    border-radius: 8px;
    box-shadow: 0px 8px 20px 0px rgba(0, 0, 0, 0.06);

    :deep(.el-card__body) {
      padding: 10px;
    }

    .details-form {
      margin-top: 16px;

      :deep(.el-form-item__label) {
        display: block;
        height: initial;
        font-size: 13px;
        line-height: 1.4;
        padding-bottom: 8px;
      }

      :deep(.el-textarea__inner) {
        font-size: 14px;
        line-height: 1.5;
      }

      .rent-btn {
        width: 100%;
        height: 44px;
        font-size: 15px;
        margin: 16px 0 8px;
      }
    }

    .notice-wrap {
      .notice-item {
        align-items: flex-start;
        font-size: 12px;
        padding: 8px 0;

        svg {
          margin-top: 2px;
        }
      }
    }
  }
}

</style>
