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
  margin: 14px 0 0;
  padding: 20px;
  background: var(--theme-transfer-bg-light);
  border-radius: 4px;

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
    align-items: flex-start;
    gap: 6px;
    line-height: 1.5;
  }

  .tip-text {
    font-size: 14px;
    line-height: 1.5;
    color: rgba(30, 41, 59, 0.8);
    flex: 1;
  }
}

@media (max-width: 768px) {
  .tips-section {
    margin: 12px 0 0;
    padding: 14px 12px;
    border-radius: 6px;

    .tips-title {
      font-size: 13px;
      margin-bottom: 12px;
    }

    .tips-list {
      gap: 8px;
    }

    .tip-item {
      gap: 6px;

      svg {
        margin-top: 2px;
        flex-shrink: 0;
      }
    }

    .tip-text {
      font-size: 12px;
      line-height: 1.6;
    }
  }
}
</style>
