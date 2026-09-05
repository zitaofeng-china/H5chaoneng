<template>
  <el-card class="content-main" shadow="never">
    <!-- 费用说明卡片 -->
    <section class="hosting-section">
      <h2 class="section-title">
        <span>{{ t('feeCard.title') }}</span>
      </h2>
      <div class="fee-grid">
        <div
          v-for="(item, idx) in feeItems"
          :key="item.desc"
          class="fee-item"
          :class="{ 'is-premium': idx === 1 }"
        >
          <div class="fee-header">
            <span class="fee-badge">
              <SvgIcon name="choose-bolt" width="12" height="12" class="badge-icon" />
              <span>{{ item.energy }} 能量</span>
            </span>
          </div>
          <div class="fee-price-row">
            <span class="fee-num">{{ item.price }}</span>
            <span class="fee-unit">TRX / {{ t('common.purchase') }}</span>
          </div>
          <div class="fee-desc">
            <span>{{ item.desc }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 需要托管的地址 -->
    <section class="hosting-section">
      <div class="section-header-row">
        <h2 class="section-title">
          <span>{{ t('hosting.address') }}</span>
          <span class="required-star" aria-hidden="true">*</span>
        </h2>
        <span v-if="parsedAddressCount > 0" class="address-count-badge">
          已识别 {{ parsedAddressCount }} 个地址
        </span>
      </div>
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="0"
        class="details-form"
      >
        <el-form-item class="textarea-item" prop="address">
          <div class="textarea-wrapper">
            <el-input
              type="textarea"
              :rows="isMobile ? 5 : 4"
              v-model="formData.address"
              :placeholder="t('hosting.enterAddresses')"
              class="custom-textarea"
            />
            <div v-if="formData.address" class="textarea-helper-bar">
              <button
                type="button"
                class="clear-btn tactile-btn"
                @click="formData.address = ''"
              >
                清空内容
              </button>
            </div>
          </div>
        </el-form-item>
        <el-button type="primary" class="host-btn tactile-btn" @click="handleSaveAddress">
          <SvgIcon name="choose-bolt" width="16" height="16" class="btn-icon" />
          <span>{{ t('hosting.hostNow') }}</span>
        </el-button>
      </el-form>
    </section>

    <!-- 已托管地址 -->
    <section class="hosting-section">
      <h2 class="section-title">
        <span>{{ t('hosting.managedAddress') }}</span>
      </h2>
      <AddressList />
    </section>

    <!-- 温馨提示 -->
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
import { useTelegramHaptics } from '@/hooks/useTelegramHaptics'

const { t } = useI18n()
const router = useRouter()
const commonStore = useCommonStore()
const priceStore = usePriceStore()
const userStore = useUserStore()
const { isMobile } = storeToRefs(commonStore)
const { tmaHapticImpact } = useTelegramHaptics()

const formatFeePrice = (value: string | number) =>
  formatCryptoAmount(value).replace(/\.00$/, '')

const feeItems = computed(() => {
  const price65k = priceStore.priceData?.hosting_65k || '3'
  const price131k = priceStore.priceData?.hosting_131k || '5'
  return [
    {
      price: formatFeePrice(price65k),
      desc: t('hosting.use65000Energy'),
      energy: '65,000',
    },
    {
      price: formatFeePrice(price131k),
      desc: t('hosting.use131000Energy'),
      energy: '131,000',
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

const parsedAddressCount = computed(() => {
  if (!formData.address) return 0
  return formData.address
    .split(/[,，\n\r]+/)
    .map((addr) => addr.trim())
    .filter((addr) => addr.length > 0).length
})

const formRules: FormRules = {
  address: [
    { required: true, message: t('formValidation.addressRequired'), trigger: 'blur' },
    { min: 10, message: t('formValidation.addressTooShort'), trigger: 'blur' },
  ],
}

const handleSaveAddress = async () => {
  tmaHapticImpact('medium')
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
      .split(/[,，\n\r]+/) // 支持中英文逗号和换行符
      .map((addr) => addr.trim()) // 去除首尾空格
      .filter((addr) => addr.length > 0) as string[] // 过滤空字符串

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
            if (
              response.code === '401' ||
              response.code === '100003' ||
              response.code === '100004'
            ) {
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
          await new Promise((resolve) => setTimeout(resolve, 200))
        }
      }

      // 显示结果
      if (successCount === addressList.length) {
        ElMessage.success(t('hosting.addSuccess', { count: successCount }))
      } else if (successCount > 0) {
        ElMessage.warning(
          t('hosting.addPartialSuccess', { success: successCount, fail: failedCount }),
        )
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
  ElMessageBox.confirm(addresses.join('\n'), t('hosting.addressNotActivated'), {
    confirmButtonText: t('hosting.goToActivate'),
    cancelButtonText: t('common.cancel'),
    type: 'warning',
    distinguishCancelAndClose: true,
    customClass: 'unactivated-address-dialog',
  })
    .then(() => {
      // 用户选择前往激活
      console.log('[跳转激活] 保存地址到 sessionStorage:', addresses)

      // 将地址存储到 sessionStorage，以便激活页面读取
      sessionStorage.setItem('pendingActivationAddresses', addresses.join('\n'))

      // 跳转到激活页面
      const targetPath = withSitePrefix('/activation')
      console.log('[跳转激活] 目标路径:', targetPath)

      router
        .push(targetPath)
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
  border: 1.5px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
  border-radius: var(--theme-radius-lg, 8px);
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03);

  :deep(.el-card__body) {
    padding: 28px 32px 24px;
  }
}

.hosting-section + .hosting-section {
  margin-top: 24px;
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  .section-title {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0 0 10px;
  padding-left: 10px;
  position: relative;
  color: var(--theme-text-black, #182230);
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    width: 3px;
    height: 14px;
    border-radius: 1.5px;
    background: linear-gradient(180deg, #165dff 0%, #0040e5 100%);
    transform: translateY(-50%);
  }

  .required-star {
    margin-left: 4px;
    color: #ef4444;
    font-size: 14px;
    font-weight: 700;
    line-height: 1;
  }
}

.address-count-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--theme-radius-sm, 4px);
  background: rgba(22, 93, 255, 0.08);
  border: 1px solid rgba(22, 93, 255, 0.18);
  color: var(--theme-primary-blue, #165dff);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.01em;
}

/* 费用说明卡片网格 */
.fee-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.fee-item {
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 14px 16px;
  border: 1.5px solid rgba(22, 93, 255, 0.12);
  border-radius: var(--theme-radius-sm, 6px);
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  cursor: default;

  &:hover {
    transform: translateY(-2px);
    border-color: rgba(22, 93, 255, 0.35);
    box-shadow: 0 6px 18px rgba(22, 93, 255, 0.09);
    background: #ffffff;
  }

  &.is-premium {
    border-color: rgba(124, 58, 237, 0.14);

    &:hover {
      border-color: rgba(124, 58, 237, 0.38);
      box-shadow: 0 6px 18px rgba(124, 58, 237, 0.09);
    }

    .fee-badge {
      background: rgba(124, 58, 237, 0.08);
      color: #7c3aed;
    }

    .fee-num {
      color: #7c3aed;
    }
  }

  .fee-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
  }

  .fee-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 4px;
    background: rgba(22, 93, 255, 0.08);
    color: var(--theme-primary-blue, #165dff);
    font-size: 11px;
    font-weight: 700;
    line-height: 1.3;

    .badge-icon {
      color: currentColor;
    }
  }

  .fee-price-row {
    display: flex;
    align-items: baseline;
    gap: 4px;
    margin-bottom: 6px;

    .fee-num {
      color: var(--theme-primary-blue, #165dff);
      font-size: 22px;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }

    .fee-unit {
      color: var(--theme-text-gray, #64748b);
      font-size: 12px;
      font-weight: 600;
      line-height: 1;
    }
  }

  .fee-desc {
    color: var(--theme-text-gray, #64748b);
    font-size: 12px;
    line-height: 1.3;
    font-weight: 500;
  }
}

/* 文本域输入框 */
.details-form {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  :deep(.el-form-item__content) {
    min-width: 0;
    line-height: normal;
  }

  .textarea-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  :deep(.el-textarea__inner) {
    min-height: 108px;
    padding: 12px 14px;
    border: 1.5px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
    border-radius: var(--theme-radius-sm, 6px);
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    background: #f8fafc;
    color: var(--theme-text-black, #182230);
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 13px;
    line-height: 1.6;
    resize: none;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    &::placeholder {
      color: var(--theme-text-muted-gray, #94a3b8);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    }

    &:hover {
      background: #ffffff;
      border-color: rgba(22, 93, 255, 0.35);
    }

    &:focus {
      background: #ffffff;
      border-color: var(--theme-primary-blue, #165dff) !important;
      box-shadow: 0 0 0 3px rgba(22, 93, 255, 0.12) !important;
    }
  }

  .textarea-helper-bar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0 2px;
    font-size: 12px;
    color: var(--theme-text-muted-gray, #94a3b8);

    .clear-btn {
      border: none;
      background: transparent;
      color: var(--theme-text-gray, #64748b);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      transition: all 0.15s ease;

      &:hover {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.08);
      }
    }
  }
}

/* 立即托管高质感按钮 */
.host-btn {
  width: 100%;
  height: 46px;
  margin: 14px 0 0;
  border: 0;
  border-radius: var(--theme-radius-sm, 6px);
  background: linear-gradient(135deg, #ff7d26 0%, #f9570c 100%);
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 14px rgba(249, 87, 12, 0.28), 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);

  .btn-icon {
    color: #ffffff;
  }

  &:hover,
  &:focus {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(249, 87, 12, 0.38);
    filter: brightness(1.04);
    background: linear-gradient(135deg, #ff8533 0%, #fa5f19 100%);
    color: #ffffff;
  }

  &:active {
    transform: translateY(0) scale(0.99);
    box-shadow: 0 2px 8px rgba(249, 87, 12, 0.22);
  }
}

/* 温馨提示卡片 */
:deep(.hosting-tips.tips-section) {
  margin-top: 24px;
  padding: 16px 18px;
  border-radius: var(--theme-radius-sm, 6px);
  background: #f8fafc;
  border: 1px solid rgba(226, 232, 240, 0.85);
}

.hosting-tips {
  :deep(.tips-title) {
    margin-bottom: 12px;
    color: var(--theme-text-black, #182230);
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
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);

    :deep(.el-card__body) {
      padding: 18px 14px 16px;
    }
  }

  .hosting-section + .hosting-section {
    margin-top: 18px;
  }

  .fee-grid {
    gap: 10px;
  }

  .fee-item {
    padding: 10px 12px;

    .fee-price-row .fee-num {
      font-size: 18px;
    }

    .fee-desc {
      font-size: 11px;
    }
  }

  .host-btn {
    height: 44px;
    font-size: 14px;
  }
}
</style>
