<template>
  <div class="fee-card">
    <div class="fee-head">
      <SvgIcon name="fee-info" width="12" height="12" />
      {{ t('feeCard.title') }}
    </div>
    <div class="fee-body">
      <div class="fee-item" v-for="(item, idx) in texts" :key="idx">
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'FeeCord',
})

interface Props {
  texts: Array<string>
}

withDefaults(defineProps<Props>(), {
  texts: () => [],
})

const { t } = useI18n()
</script>

<style lang="scss" scoped>
.fee-card {
  padding: 12px;
  background: var(--theme-card-bg-light);
  border-radius: 4px;
  font-size: 14px;

  .fee-head {
    display: flex;
    align-items: center;
    font-weight: 600;
    margin-bottom: 10px;

    svg {
      color: var(--theme-bg-gray-light);
      padding-right: 5px;
    }
  }

  .fee-body {
    display: flex;
    flex-direction: column;
    gap: 12px;
    color: var(--theme-text-mute);
  }
}
</style>
