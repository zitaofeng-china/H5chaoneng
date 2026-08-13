<template>
  <el-card class="content-main" shadow="never">
    <section class="hosting-section">
      <h2 class="section-title">{{ t('feeCard.title') }}</h2>
      <div class="fee-grid">
        <div v-for="item in feeItems" :key="item.desc" class="fee-item">
          <div class="fee-price">{{ item.price }} TRX/{{ t('common.purchase') }}</div>
          <div class="fee-desc">{{ item.desc }}</div>
        </div>
      </div>
    </section>

    <section class="hosting-section">
      <h2 class="section-title">{{ t('hosting.address') }}</h2>
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
            :placeholder="t('hosting.enterAddresses')"
          />
        </el-form-item>
        <el-button type="primary" class="host-btn" @click="handleSaveAddress">
          {{ t('hosting.hostNow') }}
        </el-button>
      </el-form>
    </section>

    <section class="hosting-section">
      <h2 class="section-title">{{ t('hosting.managedAddress') }}</h2>
      <AddressList />
    </section>

    <KindTips :tips="tips" class="hosting-tips" />
  </el-card>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from '@/utils/element'
import { type FormInstance, type FormRules } from 'element-plus'
import KindTips from '@/components/kindTips/index.vue'
import AddressList from './AddressList.vue'
import { useCommonStore } from '@/stores/useCommonStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { useUserStore } from '@/stores/useUserStore'
import { addressApi } from '@/api'
import { HostingKind } from '@/api/modules/address/types'
import { formatCryptoAmount } from '@/utils/number'
import { withSitePrefix } from '@/utils/site'

const { t } = useI18n()
const router = useRouter()
const commonStore = useCommonStore()
const priceStore = usePriceStore()
const userStore = useUserStore()
const { isMobile } = storeToRefs(commonStore)

const formatFeePrice = (value: string | number) =>
  formatCryptoAmount(value).replace(/\.00$/, '')

const feeItems = computed(() => {
  const price65k = priceStore.priceData?.hosting_65k || '3'
  const price131k = priceStore.priceData?.hosting_131k || '5'
  return [
    {
      price: formatFeePrice(price65k),
      desc: t('hosting.use65000Energy'),
    },
    {
      price: formatFeePrice(price131k),
      desc: t('hosting.use131000Energy'),
    },
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

  // 检查是否登录
  if (!userStore.isLogin) {
    ElMessage.warning(t('common.pleaseLogin'))
    return
  }

  try {
    await formRef.value.validateField('address')

    if (!formData.address) {
      ElMessage.warning(t('formValidation.enterAddressToSave'))
      return
    }

    // 解析地址列表（支持逗号或换行分隔）
    const addressList: string[] = formData.address
      .split(/[,，\n\r]+/)  // 支持中英文逗号和换行符
      .map(addr => addr.trim())  // 去除首尾空格
      .filter(addr => addr.length > 0) as string[]  // 过滤空字符串

    if (addressList.length === 0) {
      ElMessage.warning(t('hosting.enterValidAddress'))
      return
    }

    // 统计结果
    let successCount = 0
    let failedCount = 0
    const failedAddresses: string[] = []

    try {
      // 循环逐个添加托管地址
      for (let i = 0; i < addressList.length; i++) {
        const address = addressList[i]
        
        // 跳过空地址
        if (!address) continue
        
        try {
          // 调用接口添加单个地址
          const response = await addressApi.addHostingAddress({
            address,
            kind: HostingKind.DEFAULT,
          })
          
          if (response.code === '000000') {
            successCount++
          } else {
            // 检查是否是未登录错误
            if (response.code === '401' || response.code === '100003' || response.code === '100004') {
              ElMessage.error(t('auth.tokenExpired'))
              return // 停止继续添加
            }
            
            // 检查是否是余额不足错误（通过 code 或 msg 判断）
            const errorMsg = response.msg || ''
            if (
              response.code === '000009' || 
              response.code === '004002' || 
              (response.code === '000007' && errorMsg.includes('余额不足'))
            ) {
              ElMessage.error(t('hosting.insufficientBalance'))
              return // 停止继续添加
            }
            
            failedCount++
            failedAddresses.push(address)
            
            // 检查是否是地址未激活的错误
            if (errorMsg.includes('未激活') || errorMsg.includes('not activated')) {
              // 弹窗询问是否跳转到激活页面
              handleUnactivatedAddresses([address])
              return // 停止继续添加
            }
          }
        } catch (error: any) {
          console.error(`[添加托管地址] 地址 ${address} 添加失败:`, error)
          failedCount++
          failedAddresses.push(address)
        }
        
        // 添加短暂延迟，避免请求过快
        if (i < addressList.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }
      
      // 显示结果
      if (successCount === addressList.length) {
        ElMessage.success(t('hosting.addSuccess', { count: successCount }))
      } else if (successCount > 0) {
        ElMessage.warning(t('hosting.addPartialSuccess', { success: successCount, fail: failedCount }))
      } else {
        ElMessage.error(t('hosting.addFailed'))
      }
      
      // 如果有成功的，清空表单并刷新列表
      if (successCount > 0) {
        formData.address = ''
        window.dispatchEvent(new CustomEvent('refresh-hosting-list'))
        
        // 刷新用户信息以更新余额
        if (userStore.isLogin) {
          await userStore.fetchUserInfo()
        }
      }
      
      // 如果有失败的，显示失败的地址
      if (failedAddresses.length > 0) {
        console.log('[添加托管地址] 失败的地址:', failedAddresses)
      }
    } catch (error: any) {
      console.error('[添加托管地址] 错误:', error)
      
      // 特殊处理未登录错误
      if (error.message === 'NOT_LOGGED_IN') {
        ElMessage.warning(t('common.pleaseLogin'))
        return
      }
      
      ElMessage.error(error.message || t('hosting.addFailed'))
    }
  } catch (error) {
    console.error('【ERROR INFO】:', error)
  }
}

/**
 * 处理未激活的地址
 */
const handleUnactivatedAddresses = (addresses: string[]) => {
  // 使用 ElMessageBox 确认对话框
  ElMessageBox.confirm(
    addresses.join('\n'),
    t('hosting.addressNotActivated'),
    {
      confirmButtonText: t('hosting.goToActivate'),
      cancelButtonText: t('common.cancel'),
      type: 'warning',
      distinguishCancelAndClose: true,
      customClass: 'unactivated-address-dialog',
    }
  )
    .then(() => {
      // 用户选择前往激活
      console.log('[跳转激活] 保存地址到 sessionStorage:', addresses)
      
      // 将地址存储到 sessionStorage，以便激活页面读取
      sessionStorage.setItem('pendingActivationAddresses', addresses.join('\n'))
      
      // 跳转到激活页面
      const targetPath = withSitePrefix('/activation')
      console.log('[跳转激活] 目标路径:', targetPath)
      
      router.push(targetPath)
        .then(() => {
          console.log('[跳转激活] 跳转成功')
        })
        .catch((err) => {
          console.error('[跳转激活] 跳转失败:', err)
        })
    })
    .catch(() => {
      // 用户选择取消或关闭对话框，不做任何操作
      console.log('[跳转激活] 用户取消跳转')
    })
}

// 初始化时刷新价格（store 内已有缓存则短路）；用户信息由 App 统一拉取
onMounted(() => {
  priceStore.fetchPrice()
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

.hosting-section + .hosting-section {
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

.fee-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.fee-item {
  min-height: 78px;
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

.fee-price {
  color: #1766f5;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}

.fee-desc {
  color: rgba(71, 84, 103, 0.72);
  font-size: 12px;
  line-height: 1.4;
}

.details-form {
  :deep(.el-form-item) {
    margin-bottom: 14px;
  }

  :deep(.el-form-item__content) {
    min-width: 0;
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

.host-btn {
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

:deep(.hosting-tips.tips-section) {
  margin-top: 18px;
  padding: 16px 18px;
  border-radius: 8px;
  background: #f4f8fc;
}

.hosting-tips {

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

  .fee-grid {
    gap: 8px;
  }

  .fee-item {
    min-height: 68px;
    padding: 12px 8px;
  }

  .fee-price {
    font-size: 14px;
  }

  .host-btn {
    height: 42px;
    font-size: 14px;
  }

  .details-form :deep(.el-textarea__inner) {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .fee-grid {
    grid-template-columns: 1fr;
  }
}
</style>
