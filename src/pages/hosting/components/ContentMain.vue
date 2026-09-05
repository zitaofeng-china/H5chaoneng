<template>
  <el-card class="content-main" shadow="never">
    <!-- 顶部全网系统微状态条 -->
    <div class="workspace-status-bar">
      <div class="status-indicator">
        <span class="pulse-dot"></span>
        <span class="status-text">全网毫秒级智能防烧监听已就绪</span>
      </div>
      <div class="status-stats">
        <span class="stat-badge">
          <SvgIcon name="choose-bolt" width="12" height="12" class="badge-bolt" />
          <span>全网能量推荐</span>
        </span>
        <span v-if="userStore.isLogin" class="balance-badge">
          可用: <strong>{{ availableBalance }} TRX</strong>
        </span>
      </div>
    </div>

    <!-- 移动端分段视图控制器 -->
    <div v-if="isMobile" class="mobile-segmented-tabs">
      <button
        type="button"
        class="segment-tab"
        :class="{ 'is-active': activeTab === 'add' }"
        @click="switchTab('add')"
      >
        <SvgIcon name="choose-bolt" width="13" height="13" />
        <span>添加托管</span>
      </button>
      <button
        type="button"
        class="segment-tab"
        :class="{ 'is-active': activeTab === 'list' }"
        @click="switchTab('list')"
      >
        <SvgIcon name="choose-shield" width="13" height="13" />
        <span>已托管列表</span>
        <span v-if="hostedCount > 0" class="tab-badge">{{ hostedCount }}</span>
      </button>
    </div>

    <!-- 双栏联动工作台网格 -->
    <div class="hosting-workspace-grid">
      <!-- 左栏：控制与计费面板 -->
      <div
        class="workspace-pane workspace-pane-left"
        v-show="!isMobile || activeTab === 'add'"
      >
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
                <div class="textarea-toolbar">
                  <button
                    type="button"
                    class="paste-btn tactile-btn"
                    @click="handlePasteClipboard"
                  >
                    <SvgIcon name="transfer-copy" width="12" height="12" />
                    <span>粘贴剪贴板</span>
                  </button>
                  <button
                    v-if="formData.address"
                    type="button"
                    class="clear-btn tactile-btn"
                    @click="formData.address = ''"
                  >
                    清空内容
                  </button>
                </div>
              </div>
            </el-form-item>
            <el-button
              type="primary"
              class="host-btn tactile-btn"
              :loading="submitting"
              @click="handleSaveAddress"
            >
              <SvgIcon name="choose-bolt" width="16" height="16" class="btn-icon" />
              <span>{{ t('hosting.hostNow') }}</span>
            </el-button>
          </el-form>
        </section>

        <!-- 温馨提示卡片 -->
        <section class="hosting-section tips-section">
          <KindTips :tips="tips" class="hosting-tips" />
        </section>
      </div>

      <!-- 右栏：监控与已托管列表面板 -->
      <div
        class="workspace-pane workspace-pane-right"
        v-show="!isMobile || activeTab === 'list'"
      >
        <section class="hosting-section list-section">
          <div class="section-header-row">
            <h2 class="section-title">
              <span>{{ t('hosting.managedAddress') }}</span>
            </h2>
            <span v-if="hostedCount > 0" class="total-badge">
              <span class="active-dot"></span>
              <span>{{ hostedCount }} 个正在守护</span>
            </span>
          </div>
          <div class="right-list-container">
            <AddressList @update:count="onUpdateCount" />
          </div>
        </section>
      </div>
    </div>
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
const { tmaHapticImpact, tmaHapticSelection } = useTelegramHaptics()

const activeTab = ref<'add' | 'list'>('add')
const hostedCount = ref(0)
const submitting = ref(false)

const onUpdateCount = (count: number) => {
  hostedCount.value = count
}

const switchTab = (tab: 'add' | 'list') => {
  activeTab.value = tab
  tmaHapticSelection()
}

const formatFeePrice = (value: string | number) =>
  formatCryptoAmount(value).replace(/\.00$/, '')

const availableBalance = computed(() => {
  return formatFeePrice(userStore.userInfo?.balance || 0)
})

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

const handlePasteClipboard = async () => {
  tmaHapticSelection()
  try {
    if (navigator?.clipboard?.readText) {
      const text = await navigator.clipboard.readText()
      if (text && text.trim()) {
        formData.address = formData.address
          ? `${formData.address.trim()}\n${text.trim()}`
          : text.trim()
        ElMessage.success('已从剪贴板粘贴')
        return
      }
    }
    ElMessage.info('未能读取剪贴板内容，请手动粘贴')
  } catch {
    ElMessage.info('请使用快捷键手动粘贴地址')
  }
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
      .split(/[,，\n\r]+/)
      .map((addr) => addr.trim())
      .filter((addr) => addr.length > 0) as string[]

    if (addressList.length === 0) {
      ElMessage.warning(t('hosting.enterValidAddress'))
      return
    }

    submitting.value = true

    // 统计结果
    let successCount = 0
    let failedCount = 0
    const failedAddresses: string[] = []

    try {
      // 循环逐个添加托管地址
      for (let i = 0; i < addressList.length; i++) {
        const address = addressList[i]
        if (!address) continue

        try {
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
              return
            }

            // 检查是否是余额不足错误
            const errorMsg = response.msg || ''
            if (
              response.code === '000009' ||
              response.code === '004002' ||
              (response.code === '000007' && errorMsg.includes('余额不足'))
            ) {
              ElMessage.error(t('hosting.insufficientBalance'))
              return
            }

            failedCount++
            failedAddresses.push(address)

            // 检查是否是未激活地址错误
            if (response.code === '004001') {
              handleUnactivatedAddresses([address])
              return
            }

            ElMessage.error(response.msg || t('hosting.addFailed'))
          }
        } catch (error: any) {
          failedCount++
          failedAddresses.push(address)
          console.error(`[添加托管地址] 地址 ${address} 失败:`, error)

          if (error.message === 'NOT_LOGGED_IN') {
            throw error
          }
        }
      }

      // 显示操作结果
      if (successCount > 0 && failedCount === 0) {
        ElMessage.success(t('hosting.addSuccess', { count: successCount }))
      } else if (successCount > 0 && failedCount > 0) {
        ElMessage.warning(
          t('hosting.addPartialSuccess', { success: successCount, fail: failedCount }),
        )
      } else if (failedCount > 0 && successCount === 0) {
        ElMessage.error(t('hosting.addFailed'))
      }

      // 如果有成功的，清空表单并刷新列表
      if (successCount > 0) {
        formData.address = ''
        window.dispatchEvent(new CustomEvent('refresh-hosting-list'))

        // 移动端自动切到已托管列表面板
        if (isMobile.value) {
          activeTab.value = 'list'
        }

        // 刷新用户信息以更新余额
        if (userStore.isLogin) {
          await userStore.fetchUserInfo()
        }
      }

      if (failedAddresses.length > 0) {
        console.log('[添加托管地址] 失败的地址:', failedAddresses)
      }
    } catch (error: any) {
      console.error('[添加托管地址] 错误:', error)

      if (error.message === 'NOT_LOGGED_IN') {
        ElMessage.warning(t('common.pleaseLogin'))
        return
      }

      ElMessage.error(error.message || t('hosting.addFailed'))
    } finally {
      submitting.value = false
    }
  } catch (error) {
    console.error('【ERROR INFO】:', error)
  }
}

/**
 * 处理未激活的地址
 */
const handleUnactivatedAddresses = (addresses: string[]) => {
  ElMessageBox.confirm(addresses.join('\n'), t('hosting.addressNotActivated'), {
    confirmButtonText: t('hosting.goToActivate'),
    cancelButtonText: t('common.cancel'),
    type: 'warning',
    distinguishCancelAndClose: true,
    customClass: 'unactivated-address-dialog',
  })
    .then(() => {
      sessionStorage.setItem('pendingActivationAddresses', addresses.join('\n'))
      router
        .push({
          path: withSitePrefix('/activation'),
        })
        .catch((err) => {
          console.error('[跳转激活] 跳转失败:', err)
        })
    })
    .catch(() => {
      console.log('[跳转激活] 用户取消跳转')
    })
}

onMounted(() => {
  priceStore.fetchPrice()
})
</script>

<style lang="scss" scoped>
.content-main {
  max-width: 1140px;
  width: 100%;
  margin: 0 auto;
  border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
  border-radius: var(--theme-radius-lg, 10px);
  background: #ffffff;
  box-shadow: 0 4px 24px rgba(15, 23, 42, 0.05), 0 1px 3px rgba(15, 23, 42, 0.03);

  :deep(.el-card__body) {
    padding: 24px 28px 28px;
  }
}

/* 顶部状态监控条 */
.workspace-status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  margin-bottom: 22px;
  background: linear-gradient(90deg, rgba(22, 93, 255, 0.04) 0%, rgba(124, 58, 237, 0.03) 100%);
  border: 1px solid rgba(22, 93, 255, 0.12);
  border-radius: var(--theme-radius-sm, 6px);

  .status-indicator {
    display: inline-flex;
    align-items: center;
    gap: 8px;

    .pulse-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.22);
      animation: pulse-glow 2s infinite ease-in-out;
    }

    .status-text {
      color: #1e293b;
      font-size: 12px;
      font-weight: 600;
    }
  }

  .status-stats {
    display: inline-flex;
    align-items: center;
    gap: 12px;

    .stat-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--theme-text-gray, #64748b);
      font-size: 11px;
      font-weight: 500;

      .badge-bolt {
        color: #f59e0b;
      }
    }

    .balance-badge {
      color: var(--theme-text-gray, #64748b);
      font-size: 11px;

      strong {
        color: var(--theme-primary-blue, #165dff);
        font-weight: 700;
      }
    }
  }
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.4);
  }
}

/* 移动端分段视图切换 */
.mobile-segmented-tabs {
  display: flex;
  align-items: center;
  padding: 4px;
  margin-bottom: 18px;
  background: #f1f5f9;
  border-radius: 8px;

  .segment-tab {
    flex: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 36px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--theme-text-gray, #64748b);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    &.is-active {
      background: #ffffff;
      color: var(--theme-primary-blue, #165dff);
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.08);
    }

    .tab-badge {
      padding: 1px 6px;
      border-radius: 10px;
      background: var(--theme-primary-blue, #165dff);
      color: #ffffff;
      font-size: 10px;
      font-weight: 700;
      line-height: 1.2;
    }
  }
}

/* 双栏工作台网格 */
.hosting-workspace-grid {
  display: grid;
  grid-template-columns: 460px 1fr;
  gap: 32px;
  align-items: start;
}

.workspace-pane {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.workspace-pane-left {
  .hosting-section + .hosting-section {
    margin-top: 22px;
  }
}

.workspace-pane-right {
  height: 100%;

  .list-section {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .right-list-container {
    background: #fafbfc;
    border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.85));
    border-radius: var(--theme-radius-sm, 8px);
    padding: 14px;
    height: 100%;
    min-height: 480px;
  }
}

.section-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  .section-title {
    margin-bottom: 0;
  }
}

.section-title {
  display: flex;
  align-items: center;
  margin: 0 0 12px;
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
}

.total-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #ecfdf5;
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #059669;
  font-size: 11px;
  font-weight: 600;

  .active-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
  }
}

/* 费用说明卡片网格 */
.fee-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.fee-item {
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 14px;
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
    margin-bottom: 6px;
  }

  .fee-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 7px;
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
    margin-bottom: 4px;

    .fee-num {
      color: var(--theme-primary-blue, #165dff);
      font-size: 20px;
      font-weight: 800;
      line-height: 1;
      letter-spacing: -0.02em;
      font-variant-numeric: tabular-nums;
    }

    .fee-unit {
      color: var(--theme-text-gray, #64748b);
      font-size: 11px;
      font-weight: 600;
      line-height: 1;
    }
  }

  .fee-desc {
    color: var(--theme-text-gray, #64748b);
    font-size: 11px;
    line-height: 1.35;
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

  .textarea-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 2px;

    .paste-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      border: none;
      background: transparent;
      color: var(--theme-primary-blue, #165dff);
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      transition: all 0.15s ease;

      &:hover {
        background: rgba(22, 93, 255, 0.08);
      }
    }

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
.tips-section {
  margin-top: 18px;
}

:deep(.hosting-tips) {
  padding: 14px 16px;
  border-radius: var(--theme-radius-sm, 6px);
  background: #f8fafc;
  border: 1px solid rgba(226, 232, 240, 0.85);

  .tips-title {
    margin-bottom: 10px;
    color: var(--theme-text-black, #182230);
    font-size: 12px;
    font-weight: 700;
  }

  .tips-list {
    gap: 6px;
  }

  .tip-text {
    color: rgba(71, 84, 103, 0.82);
    font-size: 11px;
    line-height: 1.5;
  }
}

/* 响应式适配 */
@media (max-width: 890px) {
  .content-main {
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);

    :deep(.el-card__body) {
      padding: 16px 14px 18px;
    }
  }

  .workspace-status-bar {
    padding: 8px 10px;
    margin-bottom: 14px;

    .status-stats {
      gap: 8px;
    }
  }

  .hosting-workspace-grid {
    display: block;
  }

  .workspace-pane-right {
    .right-list-container {
      padding: 10px;
      min-height: 360px;
    }
  }

  .fee-grid {
    gap: 8px;
  }

  .fee-item {
    padding: 10px 12px;

    .fee-price-row .fee-num {
      font-size: 18px;
    }
  }

  .host-btn {
    height: 44px;
    font-size: 14px;
  }
}
</style>
