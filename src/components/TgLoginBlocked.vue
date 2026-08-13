<template>
  <div
    class="tg-login-blocked"
    role="alertdialog"
    aria-modal="true"
    aria-live="assertive"
    @click="closeNow"
  >
    <div class="tg-login-blocked__card">
      <div class="tg-login-blocked__icon" aria-hidden="true">!</div>
      <p class="tg-login-blocked__message">{{ displayMessage }}</p>
      <p class="tg-login-blocked__countdown">
        {{ $t('error.miniAppClosingIn', { seconds: remain }) }}
      </p>
      <button type="button" class="tg-login-blocked__btn" @click="closeNow">
        {{ $t('error.miniAppCloseNow') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { telegramClose } from '@/utils/telegram'

defineOptions({
  name: 'TgLoginBlocked',
})

const props = withDefaults(
  defineProps<{
    /** 主文案（建议由父组件传入 i18n 文案） */
    message?: string
    /** 倒计时秒数 */
    seconds?: number
  }>(),
  {
    message: '',
    seconds: 2,
  },
)

const { t } = useI18n()
const displayMessage = computed(() => props.message || t('error.miniAppNotOpen'))

const remain = ref(props.seconds)
let timer: ReturnType<typeof setInterval> | null = null

function clearTimer() {
  if (timer != null) {
    clearInterval(timer)
    timer = null
  }
}

function closeNow() {
  clearTimer()
  remain.value = 0
  telegramClose()
}

onMounted(() => {
  remain.value = props.seconds
  timer = setInterval(() => {
    if (remain.value <= 1) {
      closeNow()
      return
    }
    remain.value -= 1
  }, 1000)
})

onUnmounted(() => {
  clearTimer()
})
</script>

<style scoped lang="scss">
.tg-login-blocked {
  position: fixed;
  inset: 0;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 24px;
  background: var(--theme-bg, #293445);
  box-sizing: border-box;
  cursor: pointer;
}

.tg-login-blocked__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 340px;
  width: 100%;
  padding: 28px 22px 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.28);
}

.tg-login-blocked__icon {
  width: 48px;
  height: 48px;
  margin-bottom: 18px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  background: linear-gradient(145deg, #f59e0b, #ef4444);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.35);
}

.tg-login-blocked__message {
  margin: 0 0 16px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.6;
  color: var(--theme-text-white, #fff);
  word-break: break-word;
}

.tg-login-blocked__countdown {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.65);
  font-variant-numeric: tabular-nums;
}

.tg-login-blocked__btn {
  min-width: 140px;
  height: 40px;
  padding: 0 18px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: var(--theme-primary-blue, #165dff);
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.15s ease;

  &:active {
    transform: scale(0.98);
    opacity: 0.9;
  }
}

@media (max-width: 768px) {
  .tg-login-blocked__message {
    font-size: 15px;
  }

  .tg-login-blocked__countdown {
    font-size: 13px;
  }
}
</style>
