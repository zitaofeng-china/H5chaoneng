<template>
  <div
    class="user-info-dialog"
    :class="{
      'is-sheet-closing': isClosing,
      'is-sheet-dragging': isDragging,
    }"
  >
    <el-dialog
      v-model="visible"
      :show-close="true"
      :width="isMobile ? '100%' : '480px'"
      :autofocus="false"
      center
      :align-center="!isMobile"
      class="user-info-el-dialog"
      :style="dialogDynamicStyle"
      :before-close="handleBeforeClose"
    >
      <template #header>
        <div
          class="user-info-header"
          @touchstart="onTouchStart"
          @touchmove="onTouchMove"
          @touchend="onTouchEnd"
          @touchcancel="onTouchEnd"
        >
          <div v-if="isMobile" class="sheet-pull-bar-wrap" aria-hidden="true">
            <div class="sheet-pull-bar" />
          </div>
          <div class="header-main-row">
            <span class="user-info-title-text">{{ t('nav.userInfo') }}</span>
          </div>
        </div>
      </template>

      <div
        class="user-info-content"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @touchcancel="onTouchEnd"
      >
          <!-- 顶部 Profile 身份卡片 (纯粹紧凑名片) -->
          <div class="profile-hero-card">
            <div class="avatar-wrap">
              <div class="avatar-inner">
                <span v-if="avatarInitial" class="avatar-letter">{{ avatarInitial }}</span>
                <SvgIcon v-else name="login-user" width="24" height="24" />
              </div>
            </div>

            <div class="profile-meta">
              <div class="profile-name-row">
                <span class="profile-username">{{ usernameDisplay }}</span>
                <button
                  v-if="userStore.userInfo?.username"
                  type="button"
                  class="inline-copy-btn tactile-btn"
                  title="复制账号"
                  @click.stop="handleCopy(userStore.userInfo?.username)"
                >
                  <SvgIcon name="transfer-copy" width="13" height="13" />
                </button>
              </div>
            </div>
          </div>

          <!-- 独立 TRX 资产卡片 (大字号高对比度、左右主次分明、一键充值) -->
          <div class="asset-balance-card">
            <div class="asset-card-glow" aria-hidden="true" />

            <div class="asset-top-row">
              <div class="asset-title-group">
                <div class="trx-circle-badge">
                  <SvgIcon name="trx" width="18" height="18" />
                </div>
                <span class="asset-label-text">{{ t('recharge.trxBalance') }}</span>
              </div>

              <button
                type="button"
                class="recharge-cta-btn tactile-btn"
                @click="handleGoRecharge"
              >
                <el-icon class="cta-icon"><Plus /></el-icon>
                <span>{{ t('common.recharge') }}</span>
              </button>
            </div>

            <div class="asset-main-amount">
              <span class="amount-digits tabular-nums">{{ balanceDisplay }}</span>
              <span class="amount-unit">TRX</span>
            </div>
          </div>

          <!-- 详细信息条目流 (高对比度文字与清晰层级) -->
          <div class="info-list-group">
            <!-- 邮箱 (Email) -->
            <div class="info-row-item">
              <div class="item-primary-row">
                <div class="item-left">
                  <div class="item-icon-box">
                    <SvgIcon name="login-email" width="16" height="16" />
                  </div>
                  <span class="item-label">{{ t('recharge.email') }}</span>
                </div>
                <div class="item-right">
                  <span class="item-value selectable">{{ userStore.userInfo?.email || '-' }}</span>
                  <button
                    v-if="userStore.userInfo?.email"
                    type="button"
                    class="row-copy-btn tactile-btn"
                    title="复制"
                    @click="handleCopy(userStore.userInfo?.email)"
                  >
                    <SvgIcon name="transfer-copy" width="14" height="14" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Telegram 用户名 -->
            <div class="info-row-item">
              <div class="item-primary-row">
                <div class="item-left">
                  <div class="item-icon-box">
                    <SvgIcon name="login-telegram" width="16" height="16" />
                  </div>
                  <span class="item-label">{{ t('recharge.tgUsername') }}</span>
                </div>
                <div class="item-right">
                  <span class="item-value selectable">{{ formatTgUsername(userStore.userInfo?.tg_user_name) }}</span>
                  <button
                    v-if="userStore.userInfo?.tg_user_name"
                    type="button"
                    class="row-copy-btn tactile-btn"
                    title="复制"
                    @click="handleCopy(formatTgUsername(userStore.userInfo?.tg_user_name))"
                  >
                    <SvgIcon name="transfer-copy" width="14" height="14" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Key 密钥 (两行展开排版，文字清晰高对比) -->
            <div class="info-row-item is-key-row" :class="{ 'has-key': Boolean(secretKey) }">
              <div class="item-primary-row">
                <div class="item-left">
                  <div class="item-icon-box">
                    <SvgIcon name="login-password" width="16" height="16" />
                  </div>
                  <span class="item-label">Key</span>
                </div>
                <div class="item-right">
                  <template v-if="!secretKey">
                    <button
                      type="button"
                      class="key-fetch-btn tactile-btn"
                      :disabled="secretKeyLoading"
                      @click="fetchSecretKey"
                    >
                      <el-icon v-if="secretKeyLoading" class="is-loading"><Loading /></el-icon>
                      <span>{{ secretKeyDisplay }}</span>
                    </button>
                  </template>
                  <template v-else>
                    <div class="key-actions-compact">
                      <span class="key-countdown-badge tabular-nums">{{ secretKeyCountdown }}s</span>
                      <button
                        type="button"
                        class="key-refresh-btn-mini tactile-btn"
                        :disabled="secretKeyLoading"
                        title="刷新 Key"
                        @click.stop="refreshSecretKey"
                      >
                        <el-icon :class="{ 'is-loading': secretKeyLoading }">
                          <RefreshRight />
                        </el-icon>
                      </button>
                    </div>
                  </template>
                </div>
              </div>

              <!-- 获取到 Key 后的整行展开展示区 -->
              <div
                v-if="secretKey"
                class="key-expanded-box"
                @click="handleCopy(secretKey, 'Key 已复制')"
              >
                <span class="key-code-text mono">{{ secretKey }}</span>
                <button
                  type="button"
                  class="key-box-copy-btn tactile-btn"
                  title="复制 Key"
                  @click.stop="handleCopy(secretKey, 'Key 已复制')"
                >
                  <SvgIcon name="transfer-copy" width="13" height="13" />
                </button>
              </div>
            </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useCommonStore } from '@/stores/useCommonStore'
import { useUserStore } from '@/stores/useUserStore'
import { useSiteStore } from '@/stores/useSiteStore'
import { formatBalance } from '@/utils/number'
import { authApi } from '@/api'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { useI18n } from 'vue-i18n'
import { ElMessage } from '@/utils/element'
import { Loading, RefreshRight, Plus } from '@element-plus/icons-vue'
import { tmaHapticImpact, tmaHapticNotification } from '@/utils/telegram'
import { getPopup } from '@/plugins/popupRegistry'

defineOptions({
  name: 'UserInfoPopup',
})

const { t } = useI18n()
const commonStore = useCommonStore()
const userStore = useUserStore()
const siteStore = useSiteStore()
const { isMobile } = storeToRefs(commonStore)
const { copyText } = useCopyToClipboard()

const visible = defineModel<boolean>({ default: false })
const secretKey = ref('')
const secretKeyLoading = ref(false)
const secretKeyCountdown = ref(60)
let secretKeyTimer: ReturnType<typeof window.setInterval> | null = null

// 下滑手势与下潜关闭动画控制状态
const sheetTranslateY = ref(0)
const isDragging = ref(false)
const isClosing = ref(false)

let touchStartY = 0
let touchStartX = 0
let touchStartTime = 0
let isHeaderTouch = false
let isTracking = false

const secretKeyDisplay = computed(() => secretKey.value || t('recharge.clickToGet'))

const usernameDisplay = computed(() => userStore.userInfo?.username || '-')

const avatarInitial = computed(() => {
  const name = userStore.userInfo?.username
  if (!name) return ''
  return name.trim().charAt(0).toUpperCase()
})

const balanceDisplay = computed(() => {
  if (!userStore.userInfo) return '0.00'
  return formatBalance(userStore.userInfo.trx_balance)
})

const formatTgUsername = (name?: string) => {
  if (!name) return '-'
  return name.startsWith('@') ? name : `@${name}`
}

/**
 * 移动端抽屉动态变换样式（支持手势实时跟手与下潜关闭过渡）
 */
const dialogDynamicStyle = computed(() => {
  if (!isMobile.value) return {}

  if (isClosing.value) {
    return {
      transform: 'translateY(100%) !important',
      transition: 'transform 0.24s cubic-bezier(0.32, 0.72, 0, 1) !important',
    }
  }

  if (isDragging.value) {
    return {
      transform: `translateY(${sheetTranslateY.value}px) !important`,
      transition: 'none !important',
    }
  }

  if (sheetTranslateY.value > 0) {
    return {
      transform: 'translateY(0) !important',
      transition: 'transform 0.24s cubic-bezier(0.25, 1, 0.5, 1) !important',
    }
  }

  return {}
})

// 下滑手势事件绑定
const onTouchStart = (e: TouchEvent) => {
  if (!isMobile.value || isClosing.value) return
  const touch = e.touches[0]
  if (!touch) return
  touchStartY = touch.clientY
  touchStartX = touch.clientX
  touchStartTime = Date.now()
  isTracking = true

  const target = e.target as HTMLElement | null
  isHeaderTouch = Boolean(target?.closest('.user-info-header') || target?.closest('.sheet-pull-bar-wrap'))
}

const onTouchMove = (e: TouchEvent) => {
  if (!isTracking || !isMobile.value || isClosing.value) return
  const touch = e.touches[0]
  if (!touch) return
  const diffY = touch.clientY - touchStartY
  const diffX = Math.abs(touch.clientX - touchStartX)

  // 判定为垂直向下拖拽
  if (diffY > 0 && diffY > diffX) {
    // 若不是直接触摸拖拽把手，则检查内容区是否已滚动到顶部
    if (!isHeaderTouch) {
      const scrollContainer = document.querySelector('.user-info-el-dialog .el-dialog__body') as HTMLElement | null
      if (scrollContainer && scrollContainer.scrollTop > 0) {
        return
      }
    }

    isDragging.value = true
    if (e.cancelable) {
      e.preventDefault()
    }
    // 添加手势跟手阻尼
    sheetTranslateY.value = Math.round(diffY * 0.92)
  } else if (diffY < 0 && isDragging.value) {
    sheetTranslateY.value = 0
    isDragging.value = false
  }
}

const onTouchEnd = (e: TouchEvent) => {
  if (!isTracking || !isMobile.value || isClosing.value) return
  isTracking = false

  if (isDragging.value) {
    isDragging.value = false
    const touch = e.changedTouches[0]
    const diffY = touch ? touch.clientY - touchStartY : sheetTranslateY.value
    const duration = Date.now() - touchStartTime
    const velocity = diffY / (duration || 1)

    // 下滑超过 70px 或快速向下滑脱，触发下潜关闭
    if (diffY > 70 || (velocity > 0.45 && diffY > 30)) {
      close()
    } else {
      // 弹性复位
      sheetTranslateY.value = 0
    }
  }
}

const clearSecretKeyTimer = () => {
  if (secretKeyTimer) {
    window.clearInterval(secretKeyTimer)
    secretKeyTimer = null
  }
}

const resetSecretKey = () => {
  secretKey.value = ''
  secretKeyCountdown.value = 60
  clearSecretKeyTimer()
}

const startSecretKeyTimer = () => {
  clearSecretKeyTimer()
  secretKeyCountdown.value = 60
  secretKeyTimer = window.setInterval(() => {
    secretKeyCountdown.value -= 1

    if (secretKeyCountdown.value <= 0) {
      resetSecretKey()
    }
  }, 1000)
}

const applySecretKey = (key: string) => {
  secretKey.value = key
  startSecretKeyTimer()
}

const handleCopy = async (text?: string, msg?: string) => {
  if (!text || text === '-') return
  tmaHapticImpact('light')
  const ok = await copyText(text, msg)
  if (ok) {
    tmaHapticNotification('success')
  }
}

const handleGoRecharge = () => {
  tmaHapticImpact('medium')
  close()
  getPopup('rechargePopup')?.open()
}

const refreshSecretKey = async () => {
  if (secretKeyLoading.value) return

  tmaHapticImpact('light')
  secretKeyLoading.value = true
  try {
    const response = await authApi.refreshSecretKey()
    if (response.code === '000000' && response.data) {
      applySecretKey(response.data)
      tmaHapticNotification('success')
      return
    }

    resetSecretKey()
    ElMessage.error(response.msg || '刷新 Key 失败')
  } catch (error) {
    resetSecretKey()
    ElMessage.error(error instanceof Error ? error.message : '刷新 Key 失败')
  } finally {
    secretKeyLoading.value = false
  }
}

const fetchSecretKey = async () => {
  if (secretKeyLoading.value) return

  tmaHapticImpact('light')
  secretKeyLoading.value = true
  try {
    const getResponse = await authApi.getSecretKey()
    const response = getResponse.code === '000000' && !getResponse.data
      ? await authApi.refreshSecretKey()
      : getResponse

    if (response.code === '000000' && response.data) {
      applySecretKey(response.data)
      tmaHapticNotification('success')
      return
    }

    resetSecretKey()
    ElMessage.error(response.msg || '获取 Key 失败')
  } catch (error) {
    resetSecretKey()
    ElMessage.error(error instanceof Error ? error.message : '获取 Key 失败')
  } finally {
    secretKeyLoading.value = false
  }
}

const open = async () => {
  isClosing.value = false
  isDragging.value = false
  sheetTranslateY.value = 0
  visible.value = true
  // 打开弹窗时刷新用户信息和站点信息
  await Promise.all([
    userStore.fetchUserInfo(),
    siteStore.fetchSiteInfo()
  ])
}

/**
 * 统一关闭逻辑：支持下潜退出动画
 */
const handleBeforeClose = (done: () => void) => {
  if (isMobile.value) {
    if (isClosing.value) return
    isClosing.value = true
    tmaHapticImpact('light')
    setTimeout(() => {
      done()
      isClosing.value = false
      sheetTranslateY.value = 0
      resetSecretKey()
    }, 240)
  } else {
    done()
    resetSecretKey()
  }
}

const close = () => {
  if (isMobile.value) {
    if (isClosing.value) return
    handleBeforeClose(() => {
      visible.value = false
    })
  } else {
    visible.value = false
    resetSecretKey()
  }
}

defineExpose({
  open,
  close,
  visible,
})

onBeforeUnmount(() => {
  clearSecretKeyTimer()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_mixins.scss' as *;

.user-info-dialog {
  :deep(.el-overlay) {
    background: rgba(15, 23, 42, 0.45);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    transition: opacity 0.24s ease;
  }

  &.is-sheet-closing {
    :deep(.el-overlay) {
      opacity: 0 !important;
    }
  }

  :deep(.el-dialog) {
    border-radius: var(--theme-radius-lg, 16px) !important;
    border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
    box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.15), 0 0 1px 1px rgba(15, 23, 42, 0.05);
    padding: 18px 22px 22px;
    background: #ffffff;
    overflow: hidden;
    max-width: 460px;
    width: 92% !important;
    margin: auto !important;
  }

  :deep(.el-dialog__header) {
    position: relative;
    padding: 0;
    margin: 0 0 10px 0;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 32px;
  }

  .user-info-header {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    user-select: none;
  }

  .sheet-pull-bar-wrap {
    display: none;
  }

  .header-main-row {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
  }

  .user-info-title-text {
    font-size: 18px;
    font-weight: 700;
    color: var(--theme-text-black, #0f172a);
    letter-spacing: -0.2px;
  }

  :deep(.el-dialog__headerbtn) {
    position: absolute;
    top: 50%;
    right: 0;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: rgba(15, 23, 42, 0.04);
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);

    &:hover {
      background: rgba(15, 23, 42, 0.08);
    }

    &:active {
      transform: translateY(-50%) scale(0.92);
    }

    .el-dialog__close {
      font-size: 13px;
      color: var(--theme-text-gray, #64748b);
      font-weight: 700;
    }
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.user-info-touch-container {
  width: 100%;
}

.user-info-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* 顶部 Profile 身份卡片 (移除 UID 后紧凑对齐) */
.profile-hero-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.95) 0%, rgba(241, 245, 249, 0.7) 100%);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 12px;
}

.avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.avatar-inner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #165dff 0%, #388bfd 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(22, 93, 255, 0.22);
  border: 2px solid #ffffff;

  .avatar-letter {
    font-size: 18px;
    font-weight: 700;
    line-height: 1;
  }
}

.profile-meta {
  flex: 1;
  min-width: 0;
}

.profile-name-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.profile-username {
  font-size: 16px;
  font-weight: 700;
  color: var(--theme-text-black, #0f172a);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.inline-copy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 4px;
  background: transparent;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    color: #165dff;
    background: rgba(22, 93, 255, 0.08);
  }
}

/* 独立 TRX 资产卡片 (视觉层级优化：大字号清晰金额、主次分明、一键充值) */
.asset-balance-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e6f0fd 100%);
  border: 1px solid #bfdbfe;
  border-radius: 12px;
  box-shadow: 0 4px 14px rgba(22, 93, 255, 0.06);

  .asset-card-glow {
    position: absolute;
    top: -20px;
    right: -20px;
    width: 110px;
    height: 110px;
    background: radial-gradient(circle, rgba(22, 93, 255, 0.14) 0%, rgba(22, 93, 255, 0) 70%);
    pointer-events: none;
  }
}

.asset-top-row {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.asset-title-group {
  display: flex;
  align-items: center;
  gap: 8px;

  .trx-circle-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #ffffff;
    box-shadow: 0 2px 6px rgba(255, 6, 10, 0.15);
  }

  .asset-label-text {
    font-size: 13px;
    font-weight: 600;
    color: #334155;
    letter-spacing: -0.1px;
  }
}

.recharge-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 20px;
  background: linear-gradient(135deg, #165dff 0%, #0e42d2 100%);
  color: #ffffff;
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(22, 93, 255, 0.25);
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);

  .cta-icon {
    font-size: 13px;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 5px 14px rgba(22, 93, 255, 0.35);
  }

  &:active {
    transform: scale(0.96);
  }
}

.asset-main-amount {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 1px;

  .amount-digits {
    font-size: 26px;
    font-weight: 800;
    color: #0f172a;
    line-height: 1.1;
    letter-spacing: -0.5px;
  }

  .amount-unit {
    font-size: 14px;
    font-weight: 700;
    color: #475569;
  }
}

/* 详细信息条目流 (文字清晰度与对比度优化) */
.info-list-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row-item {
  display: flex;
  flex-direction: column;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 10px;
  transition: background 0.2s ease, border-color 0.2s ease;

  @media (hover: hover) {
    &:hover {
      background: #f1f5f9;
      border-color: rgba(22, 93, 255, 0.25);
    }
  }

  .item-primary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
  }

  .item-left {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  .item-icon-box {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    color: #475569;
  }

  .item-label {
    font-size: 13px;
    font-weight: 500;
    color: #64748b;
  }

  .item-right {
    display: flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
    justify-content: flex-end;
  }

  .item-value {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 220px;

    &.selectable {
      user-select: text;
    }
  }

  .row-copy-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 5px;
    background: rgba(15, 23, 42, 0.04);
    border: none;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
      color: #165dff;
      background: rgba(22, 93, 255, 0.1);
    }

    &:active {
      transform: scale(0.92);
    }
  }
}

/* Key 项专属排版 */
.key-fetch-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(22, 93, 255, 0.08);
  color: #165dff;
  border: 1px solid rgba(22, 93, 255, 0.2);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background: rgba(22, 93, 255, 0.15);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.key-actions-compact {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.key-countdown-badge {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
  background: #e2e8f0;
  padding: 2px 7px;
  border-radius: 10px;
}

.key-refresh-btn-mini {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  color: #334155;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    color: #165dff;
    border-color: rgba(22, 93, 255, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.key-expanded-box {
  margin-top: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(22, 93, 255, 0.4);
    background: #fafcff;
  }

  &:active {
    background: #f0f6ff;
  }

  .key-code-text {
    font-size: 13px;
    font-weight: 600;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    color: #0f172a;
    letter-spacing: -0.2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;
    min-width: 0;
  }

  .key-box-copy-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 5px;
    background: #165dff;
    color: #ffffff;
    border: none;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.2s ease;

    &:hover {
      background: #0e42d2;
    }
  }
}

/* 移动端 Bottom Sheet 适配 */
@media (max-width: 768px) {
  .user-info-dialog {
    :deep(.el-overlay-dialog) {
      display: flex !important;
      flex-direction: column !important;
      justify-content: flex-end !important;
      overflow: hidden !important;
      padding: 0 !important;
    }

    :deep(.el-dialog) {
      width: 100% !important;
      max-width: 100% !important;
      margin: 0 !important;
      border-radius: 20px 20px 0 0 !important;
      padding: 10px 16px max(24px, env(safe-area-inset-bottom)) !important;
      max-height: 85vh !important;
      display: flex;
      flex-direction: column;
      animation: slideUpSheet 0.28s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 -8px 30px rgba(15, 23, 42, 0.16);
      border-bottom: none;
      touch-action: pan-y;
    }

    :deep(.el-dialog__header) {
      margin-bottom: 6px;
    }

    .sheet-pull-bar-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 18px;
      margin-bottom: 4px;
      cursor: grab;

      .sheet-pull-bar {
        display: block;
        width: 38px;
        height: 4px;
        border-radius: 2px;
        background: rgba(148, 163, 184, 0.45);
        transition: width 0.2s ease, background-color 0.2s ease;
      }

      &:active .sheet-pull-bar {
        width: 46px;
        background: rgba(22, 93, 255, 0.5);
      }
    }

    :deep(.el-dialog__headerbtn) {
      top: 14px;
      right: 14px;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(15, 23, 42, 0.04);
      border: none;
      transform: none;
    }

    :deep(.el-dialog__body) {
      overflow-y: auto;
      max-height: calc(85vh - 56px);
      padding-bottom: 6px;
      -webkit-overflow-scrolling: touch;
    }
  }

  .item-value {
    max-width: 180px !important;
  }
}

@keyframes slideUpSheet {
  from {
    transform: translateY(100%);
    opacity: 0.8;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
