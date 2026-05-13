<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('home.welfareOrder')"
    width="90%"
    :style="{ maxWidth: '500px' }"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="welfare-dialog">
      <!-- 提示信息 -->
      <div class="tip-message">
        {{ $t('home.welfarePurchaseTip') }}
      </div>

      <!-- 地址有效期 -->
      <div class="address-validity">
        <span class="label">{{ $t('home.addressValidity') }}：</span>
        <span class="countdown">{{ formattedTime }}</span>
      </div>

      <!-- 支付地址 -->
      <div class="address-section">
        <div class="address-wrapper">
          <input 
            v-model="paymentAddress" 
            readonly 
            class="address-input"
            @click="handleCopy"
          />
          <button class="copy-button" @click="handleCopy">
            {{ $t('home.copyAddress') }}
          </button>
        </div>
        
        <!-- 说明文字 -->
        <div class="address-notice">
          {{ $t('home.welfareAddressNotice') }}
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
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
  padding: 10px 0;

  .tip-message {
    background: #e6f7ff;
    border: 1px solid #91d5ff;
    border-radius: 4px;
    padding: 16px 20px;
    color: #0050b3;
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 24px;
    text-align: center;
  }

  .address-validity {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    font-size: 16px;

    .label {
      color: var(--theme-text-black);
      font-weight: 600;
    }

    .countdown {
      color: #f5222d;
      font-weight: 700;
      font-size: 20px;
      margin-left: 8px;
    }
  }

  .address-section {
    margin-bottom: 0;

    .address-wrapper {
      display: flex;
      align-items: stretch;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      overflow: hidden;
      transition: all 0.3s;

      &:hover {
        border-color: #40a9ff;
      }

      .address-input {
        flex: 1;
        border: none;
        outline: none;
        padding: 12px 16px;
        font-family: 'Courier New', Courier, monospace;
        font-size: 15px;
        color: #1890ff;
        font-weight: 600;
        background: white;
        cursor: pointer;
        user-select: all;

        &:focus {
          background: #f0f8ff;
        }
      }

      .copy-button {
        flex-shrink: 0;
        border: none;
        outline: none;
        background: #1890ff;
        color: white;
        padding: 0 24px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
        white-space: nowrap;

        &:hover {
          background: #40a9ff;
        }

        &:active {
          background: #096dd9;
        }
      }
    }

    .address-notice {
      margin-top: 12px;
      padding: 0;
      background: transparent;
      border: none;
      color: #f5222d;
      font-size: 13px;
      line-height: 1.6;
      text-align: center;
    }
  }
}

@media (max-width: 768px) {
  .welfare-dialog {
    padding: 5px 0;

    .tip-message {
      font-size: 14px;
      padding: 14px 16px;
      margin-bottom: 20px;
      line-height: 1.5;
    }

    .address-validity {
      font-size: 15px;
      margin-bottom: 20px;

      .countdown {
        font-size: 18px;
        margin-left: 6px;
      }
    }

    .address-section {
      .address-wrapper {
        flex-direction: column;
        border-radius: 6px;

        .address-input {
          padding: 14px 12px;
          font-size: 13px;
          text-align: center;
          word-break: break-all;
          line-height: 1.4;
        }

        .copy-button {
          padding: 14px 20px;
          font-size: 15px;
          font-weight: 700;
          border-top: 1px solid rgba(255, 255, 255, 0.2);
        }
      }

      .address-notice {
        margin-top: 14px;
        font-size: 13px;
        line-height: 1.5;
      }
    }
  }
}

@media (max-width: 360px) {
  .welfare-dialog {
    .tip-message {
      font-size: 13px;
      padding: 12px 14px;
      margin-bottom: 16px;
    }

    .address-validity {
      font-size: 14px;
      margin-bottom: 16px;

      .countdown {
        font-size: 17px;
      }
    }

    .address-section {
      .address-wrapper {
        .address-input {
          padding: 12px 10px;
          font-size: 12px;
        }

        .copy-button {
          padding: 12px 16px;
          font-size: 14px;
        }
      }

      .address-notice {
        margin-top: 12px;
        font-size: 12px;
      }
    }
  }
}
</style>
