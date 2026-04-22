<template>
  <div class="not-found-page">
    <div class="not-found-content">
      <div class="error-code">404</div>
      <div class="error-message">{{ $t('error.pageNotFound') }}</div>
      <div class="error-description">{{ $t('error.pageNotFoundDesc') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({
  name: 'NotFoundPage',
})
</script>

<style scoped lang="scss">
.not-found-page {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  z-index: 9999;
}

.not-found-content {
  text-align: center;
  padding: 0 20px;
}

.error-code {
  font-size: 120px;
  font-weight: 300;
  color: #333;
  line-height: 1;
  margin-bottom: 20px;
  letter-spacing: -2px;

  @media (max-width: 768px) {
    font-size: 80px;
  }
}

.error-message {
  font-size: 24px;
  font-weight: 400;
  color: #333;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 20px;
  }
}

.error-description {
  font-size: 16px;
  font-weight: 400;
  color: #666;
  line-height: 1.6;
  max-width: 500px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 14px;
  }
}
</style>
