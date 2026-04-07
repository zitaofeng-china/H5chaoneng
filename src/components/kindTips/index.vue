<template>
  <div class="tips-section">
    <div class="tips-title">{{ t('kindTips.title') }}</div>
    <div class="tips-list">
      <div v-for="(tip, index) in tips" :key="index" class="tip-item">
        <SvgIcon name="transfer-right" width="12" height="12" />
        <span class="tip-text">{{ tip }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'KindTips',
})

interface Props {
  tips: string[]
}

withDefaults(defineProps<Props>(), {
  tips: () => [],
})

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.tips-section {
  margin: 14px -24px -24px;
  padding: 24px;
  background: var(--theme-transfer-bg-light);

  .tips-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--theme-text-black);
    margin-bottom: 16px;
  }

  .tips-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-size: 14px;
  }

  .tip-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .tip-text {
    font-size: 14px;
    line-height: 0;
    color: rgba(30, 41, 59, 0.8);
  }
}
</style>
