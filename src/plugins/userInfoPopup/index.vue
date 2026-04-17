<template>
  <div class="user-info-dialog">
    <el-dialog
      v-model="visible"
      :show-close="!isMobile"
      :width="600"
      :autofocus="false"
      center
      align-center
      @close="handleClose"
    >
      <template #header>
        <div class="user-info-title">
          <div class="arrow-left-icon" @click.stop="handleClose">
            <iEpArrowLeft />
          </div>
          {{ t('nav.userInfo') }}
        </div>
      </template>
      
      <div class="user-info-content">
        <div class="desc-wrap">
          <div class="desc-item" v-for="row in userInfoData" :key="row.label">
            <div class="desc-label">{{ row.label }}</div>
            <div class="desc-value">
              <span>{{ row.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCommonStore } from '@/stores/useCommonStore'
import { useUserStore } from '@/stores/useUserStore'
import { useI18n } from 'vue-i18n'
import type { UserInfoRow } from './types'

defineOptions({
  name: 'UserInfoPopup',
})

const { t } = useI18n()
const commonStore = useCommonStore()
const userStore = useUserStore()
const { isMobile } = storeToRefs(commonStore)

const visible = defineModel<boolean>({ default: false })

/**
 * 用户信息数据
 */
const userInfoData = computed<UserInfoRow[]>(() => {
  const userInfo = userStore.userInfo
  if (!userInfo) {
    return [
      { label: t('recharge.account'), value: '-' },
      { label: t('recharge.email'), value: '-' },
      { label: t('recharge.tgOfficial'), value: '-' },
      { label: t('recharge.trxBalance'), value: '0 TRX' },
    ]
  }

  return [
    { label: t('recharge.account'), value: userInfo.username || '-' },
    { label: t('recharge.email'), value: userInfo.email || '-' },
    { label: t('recharge.tgOfficial'), value: userInfo.tg_user_name || '-' },
    { label: t('recharge.trxBalance'), value: `${userInfo.trx_balance || '0'} TRX` },
  ]
})

const open = () => {
  visible.value = true
}

const close = () => {
  visible.value = false
}

const handleClose = () => {
  close()
}

defineExpose({
  open,
  close,
  visible,
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/_mixins.scss' as *;

.user-info-dialog {
  .arrow-left-icon {
    display: none;
  }

  .user-info-title {
    margin-top: 5px;
    margin-bottom: 10px;
    font-size: 20px;
    font-weight: 600;
    color: var(--theme-text-black);
  }

  :deep(.el-dialog) {
    border-radius: 8px;
    padding: 24px;
  }

  :deep(.el-dialog__title) {
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text-black);
  }

  :deep(.el-dialog__close) {
    font-size: 18px;
    font-weight: 600;
    color: var(--theme-text-black);
  }

  :deep(.el-dialog__header.show-close) {
    padding-right: 0;
  }

  :deep(.el-dialog__headerbtn) {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    top: 24px;
    right: 24px;
    background: var(--theme-gray-bg-light);
  }
}

.user-info-content {
  padding: 20px 0;
}

.desc-wrap {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--theme-shadow-strong);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: var(--theme-text-black);

  .desc-item {
    height: 50px;
    display: flex;
    align-items: center;

    .desc-label {
      height: 50px;
      flex-basis: 180px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--theme-card-bg-light);
      border-right: 1px solid var(--theme-shadow-strong);
    }

    &:not(:last-child) {
      border-bottom: 1px solid var(--theme-shadow-strong);
    }

    .desc-value {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 16px;
      word-break: break-all;
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .user-info-dialog {
    @include dialog-style;

    :deep(.el-dialog) {
      padding: 16px;
    }

    :deep(.el-dialog--center) {
      width: 100%;
      height: 100%;
    }

    .user-info-title {
      height: 44px;
      margin: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--theme-bg-white);
      font-size: 18px;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: var(--theme-bg);
      z-index: 99;

      .arrow-left-icon {
        position: fixed;
        left: 20px;
        display: block;
        z-index: 100;
        color: var(--theme-text-white);
      }
    }
  }

  .desc-wrap .desc-item {
    .desc-label {
      flex-basis: 100px;
      font-size: 13px;
    }

    .desc-value {
      font-size: 13px;
      padding: 0 10px;
    }
  }
}
</style>
