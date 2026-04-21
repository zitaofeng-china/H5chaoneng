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
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import FeeCard from '@/components/feeCard/index.vue'
import KindTips from '@/components/kindTips/index.vue'
import AddressList from './AddressList.vue'
import { useCommonStore } from '@/stores/useCommonStore'
import { usePriceStore } from '@/stores/usePriceStore'
import { useUserStore } from '@/stores/useUserStore'
import { addressApi } from '@/api'
import { getSite } from '@/utils/site'

const { t } = useI18n()
const router = useRouter()
const commonStore = useCommonStore()
const priceStore = usePriceStore()
const userStore = useUserStore()
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
          const response = await addressApi.addHostingAddress({ address: [address] })
          
          if (response.code === '000000') {
            successCount++
          } else {
            // 检查是否是未登录错误
            if (response.code === '401' || response.code === '100003' || response.code === '100004') {
              ElMessage.error(t('auth.tokenExpired'))
              return // 停止继续添加
            }
            
            failedCount++
            failedAddresses.push(address)
            
            // 检查是否是地址未激活的错误
            const errorMsg = response.msg || ''
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
      const site = getSite()
      const targetPath = `/${site}/activation`
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

// 初始化时获取价格和用户信息
onMounted(() => {
  priceStore.fetchPrice()
  // 如果用户已登录，获取用户信息
  if (userStore.isLogin) {
    userStore.fetchUserInfo()
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
    border-radius: 8px;
    box-shadow: 0px 8px 20px 0px rgba(0, 0, 0, 0.06);

    :deep(.el-card__body) {
      padding: 10px;
    }

    .details-form {
      margin-top: 14px;

      :deep(.el-form-item) {
        margin-bottom: 14px;
      }

      :deep(.el-form-item__label) {
        font-size: 13px;
        line-height: 1.4;
        padding-bottom: 6px;
        font-weight: 600;
      }

      :deep(.el-textarea__inner) {
        font-size: 13px;
        line-height: 1.5;
        padding: 10px 12px;
      }

      .rent-btn {
        width: 100%;
        height: 42px;
        font-size: 14px;
        margin: 8px 0;
      }
    }
  }

  :deep(.activation-list) {
    margin-top: 14px;
  }
}

</style>
