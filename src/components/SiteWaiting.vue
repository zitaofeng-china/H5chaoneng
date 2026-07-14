<template>
  <div class="site-waiting" aria-busy="true" aria-live="polite">
    <div class="site-waiting__inner">
      <div class="site-waiting__spinner" aria-hidden="true" />
      <p class="site-waiting__title">{{ $t('error.siteVerifying') }}</p>
      <p class="site-waiting__hint">{{ $t('common.loading') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'SiteWaiting',
})
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
</style>
