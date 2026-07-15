<template>
  <div class="site-waiting" aria-busy="true" aria-live="polite">
    <div class="site-waiting__inner">
      <div class="site-waiting__spinner" aria-hidden="true" />
      <p class="site-waiting__title">
        <span>{{ titleText }}</span>
        <span class="site-waiting__dots" aria-hidden="true">
          <span class="site-waiting__dot">.</span>
          <span class="site-waiting__dot">.</span>
          <span class="site-waiting__dot">.</span>
        </span>
      </p>
      <p v-if="!isMiniApp" class="site-waiting__hint">{{ $t('common.loading') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { isTelegramMiniApp } from '@/utils/telegram'

defineOptions({
  name: 'SiteWaiting',
})

const { t } = useI18n()
/** setup 时 Telegram 可能尚未注入，用 computed 便于后续重绘 */
const isMiniApp = computed(() => isTelegramMiniApp())

/** Mini App：展示登录中；普通 H5：展示站点校验 */
const titleText = computed(() =>
  isMiniApp.value ? t('error.loggingIn') : t('error.siteVerifying'),
)
</script>

<style scoped lang="scss">
.site-waiting {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 24px;
  background: var(--theme-bg, #293445);
  box-sizing: border-box;
}

.site-waiting__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 320px;
}

.site-waiting__spinner {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: var(--theme-primary-blue, #165dff);
  animation: site-waiting-spin 0.8s linear infinite;
  margin-bottom: 20px;
}

.site-waiting__title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-text-white, #fff);
  display: inline-flex;
  align-items: baseline;
}

.site-waiting__dots {
  display: inline-flex;
  align-items: baseline;
  margin-left: 1px;
  min-width: 1.2em;
}

.site-waiting__dot {
  display: inline-block;
  animation: site-waiting-dot-bounce 1.2s ease-in-out infinite;
  will-change: transform, opacity;

  &:nth-child(1) {
    animation-delay: 0s;
  }

  &:nth-child(2) {
    animation-delay: 0.15s;
  }

  &:nth-child(3) {
    animation-delay: 0.3s;
  }
}

.site-waiting__hint {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.55);
}

@keyframes site-waiting-spin {
  to {
    transform: rotate(360deg);
  }
}

/* 三点依次上跳 */
@keyframes site-waiting-dot-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.45;
  }

  30% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .site-waiting__spinner {
    width: 40px;
    height: 40px;
  }

  .site-waiting__title {
    font-size: 15px;
  }

  .site-waiting__hint {
    font-size: 12px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-waiting__dot {
    animation: none;
    opacity: 1;
  }
}
</style>
