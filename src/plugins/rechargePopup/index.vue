<template>
  <div class="recharge-dialog">
    <el-dialog
      v-model="visible"
      :show-close="!isMobile"
      :width="864"
      :autofocus="false"
      center
      align-center
      @close="handleClose"
    >
      <template #header>
        <div class="recharge-title">
          <div class="arrow-left-icon" @click.stop="handleClose">
            <iEpArrowLeft />
          </div>
          {{ t('recharge.title') }}
        </div>
      </template>
      <div class="recharge-content">
        <div class="desc-wrap">
          <div class="desc-item" v-for="row in tableData" :key="row.value">
            <div class="desc-label">{{ row.label }}</div>
            <div class="desc-value">
              <span v-if="row.type === 'address' && isLoadingAddress" class="loading-text">
                {{ t('common.loading') }}
              </span>
              <span v-else>{{ row.value }}</span>
              <el-button
                link
                type="primary"
                @click="copyAddress"
                class="copy-btn"
                :loading="isCopying"
                :disabled="isLoadingAddress || !rechargeAddress"
                v-if="row.type === 'address'"
              >
                <SvgIcon name="transfer-copy" width="18" height="18" />
              </el-button>
            </div>
          </div>
        </div>
        <div class="qrcode-section">
          <div class="qrcode-title">{{ t('recharge.scanQrcode') }}</div>
          <div class="qrcode-container">
            <div v-if="isLoadingAddress" class="loading-container">
              <el-icon class="is-loading" :size="40">
                <Loading />
              </el-icon>
              <div class="loading-text">{{ t('common.loading') }}</div>
            </div>
            <img v-else-if="qrCode" :src="qrCode" alt="QR Code" class="qrcode-img" />
            <div v-else class="error-placeholder">
              <el-icon :size="40" color="#DC2626">
                <CircleClose />
              </el-icon>
              <div class="error-text">{{ t('common.loadFailed') }}</div>
            </div>
          </div>

          <div class="tips-container">
            <div class="tips-title">
              <SvgIcon name="trx" width="24" height="24" />
              {{ t('recharge.minTransfer') }}
            </div>
            <div class="tips-text">
              <SvgIcon name="fee-info" width="12" height="12" fill="#1E293B" />
              {{ t('recharge.checkAddress') }}
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCommonStore } from '@/stores/useCommonStore'
import { useRecharge } from '@/hooks/useRecharge'
import { useI18n } from 'vue-i18n'
import { Loading, CircleClose } from '@element-plus/icons-vue'

defineOptions({
  name: 'RechargePopup',
})

const { t } = useI18n()
const commonStore = useCommonStore()
const { isMobile } = storeToRefs(commonStore)

const {
  visible,
  isCopying,
  isLoadingAddress,
  tableData,
  qrCode,
  rechargeAddress,
  copyAddress,
  open,
  close,
} = useRecharge()

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
@use './styles.scss';
</style>
