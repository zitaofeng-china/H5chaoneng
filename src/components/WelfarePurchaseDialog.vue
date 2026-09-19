<template>
  <el-dialog
    v-model="dialogVisible"
    class="welfare-purchase-dialog"
    :title="$t('home.welfareOrder')"
    width="90%"
    :style="{ maxWidth: '500px' }"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="welfare-dialog">
      <div class="tip-message">
        {{ $t('home.welfarePurchaseTip') }}
      </div>

      <div class="address-validity">
        <span class="label">{{ $t('home.addressValidity') }}：</span>
        <span class="countdown">{{ formattedTime }}</span>
      </div>

      <div class="address-section">
        <div class="address-wrapper">
          <div class="address-value" @click="handleCopy">{{ paymentAddress }}</div>
          <button type="button" class="copy-button" @click="handleCopy">
            {{ $t('home.copyAddress') }}
          </button>
        </div>

        <div class="address-notice">
          {{ $t('home.welfareAddressNotice') }}
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { ElMessage } from '@/utils/element'
import { useI18n } from 'vue-i18n'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'

const { t } = useI18n()
const { copyText } = useCopyToClipboard()

const dialogVisible = ref(false)
const paymentAddress = ref('')
const remainingSeconds = ref(600) // 10分钟 = 600秒
let countdownTimer: number | null = null

// 格式化倒计时时间
const formattedTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

// 开始倒计时
const startCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  
  countdownTimer = window.setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--
    } else {
      stopCountdown()
      ElMessage.warning(t('home.addressExpired'))
      dialogVisible.value = false
    }
  }, 1000)
}

// 停止倒计时
const stopCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

// 复制地址
const handleCopy = async () => {
  await copyText(paymentAddress.value)
}

// 关闭弹窗
const handleClose = () => {
  stopCountdown()
  remainingSeconds.value = 600
}

// 打开弹窗
const open = (address: string) => {
  paymentAddress.value = address
  remainingSeconds.value = 600
  dialogVisible.value = true
  startCountdown()
}

// 监听弹窗关闭
watch(dialogVisible, (newVal) => {
  if (!newVal) {
    stopCountdown()
  }
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopCountdown()
})

defineExpose({
  open,
})
</script>

<style lang="scss" scoped>
.welfare-dialog {
  padding: 0;

  .tip-message {
    margin-bottom: 20px;
    padding: 16px 20px;
    border: 1px solid #91d5ff;
    border-radius: 8px;
    background: #e6f7ff;
    color: #1677ff;
    font-size: 15px;
    line-height: 1.6;
    text-align: center;
  }

  .address-validity {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
    font-size: 15px;

    .label {
      color: var(--theme-text-black);
      font-weight: 600;
    }

    .countdown {
      margin-left: 6px;
      color: #f5222d;
      font-size: 18px;
      font-weight: 700;
    }
  }

  .address-section {
    .address-wrapper {
      display: flex;
      align-items: stretch;
      overflow: hidden;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      background: #fff;
    }

    .address-value {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      padding: 10px 12px;
      color: #1f2937;
      font-size: 14px;
      font-weight: 500;
      line-height: 1.45;
      word-break: break-all;
      cursor: pointer;
      user-select: all;
    }

    .copy-button {
      flex: 0 0 auto;
      min-width: 0;
      padding: 0 14px;
      border: none;
      outline: none;
      background: #1677ff;
      color: #fff;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.2;
      white-space: nowrap;
      cursor: pointer;

      &:hover,
      &:focus,
      &:focus-visible {
        background: #4096ff;
      }

      &:active {
        background: #0958d9;
      }
    }

    .address-notice {
      margin-top: 12px;
      color: #f5222d;
      font-size: 13px;
      line-height: 1.6;
      text-align: center;
    }
  }
}

@media (max-width: 890px) {
  .welfare-dialog {
    .tip-message {
      margin-bottom: 16px;
      padding: 14px 16px;
      font-size: 14px;
    }

    .address-validity {
      margin-bottom: 14px;
      font-size: 14px;

      .countdown {
        font-size: 16px;
      }
    }

    .address-section {
      .address-value {
        padding: 8px 10px;
        font-size: 13px;
      }

      .copy-button {
        padding: 0 10px;
        font-size: 13px;
      }

      .address-notice {
        margin-top: 10px;
        font-size: 12px;
      }
    }
  }
}
</style>

<style lang="scss">
.welfare-purchase-dialog.el-dialog {
  border-radius: 8px;
  overflow: hidden;

  .el-dialog__header {
    padding: 16px 20px 8px;
    margin-right: 0;
  }

  .el-dialog__title {
    color: #1f2937;
    font-size: 16px;
    font-weight: 600;
  }

  .el-dialog__headerbtn {
    top: 14px;
    right: 14px;
    width: 28px;
    height: 28px;
  }

  .el-dialog__body {
    padding: 8px 20px 20px;
  }
}

@media (max-width: 890px) {
  .welfare-purchase-dialog.el-dialog {
    .el-dialog__header {
      padding: 14px 16px 6px;
    }

    .el-dialog__headerbtn {
      top: 12px;
      right: 12px;
    }

    .el-dialog__body {
      padding: 6px 14px 16px;
    }
  }
}
</style>
