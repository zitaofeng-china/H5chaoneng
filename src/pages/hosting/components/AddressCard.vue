<template>
  <div class="address-card">
    <div class="address-header">
      <span class="status-badge">
        <span class="status-dot"></span>
        <span>托管中</span>
      </span>
      <button
        type="button"
        class="copy-btn tactile-btn"
        :title="$t('transferRental.copyAddress') || '复制地址'"
        @click="handleCopy"
      >
        <SvgIcon name="transfer-copy" width="13" height="13" />
        <span>复制</span>
      </button>
    </div>

    <div class="address-box" :title="item.address">
      <template v-if="item.address && item.address.length >= 20">
        <span class="address-prefix">{{ item.address.slice(0, 8) }}</span>
        <span class="address-mid">{{ item.address.slice(8, -8) }}</span>
        <span class="address-suffix">{{ item.address.slice(-8) }}</span>
      </template>
      <span v-else class="address-text">{{ item.address }}</span>
    </div>

    <div class="address-footer">
      <div class="address-stats">
        <span class="stat-pill">
          <span class="stat-label">{{ $t('hosting.todayUsed') }}:</span>
          <strong class="stat-val">{{ todayUsed }} {{ $t('common.purchase') }}</strong>
        </span>
        <span class="stat-pill">
          <span class="stat-label">{{ $t('hosting.historyUsed') }}:</span>
          <strong class="stat-val">{{ historyUsed }} {{ $t('common.purchase') }}</strong>
        </span>
      </div>
      <button type="button" class="delete-btn tactile-btn" @click="handleDelete">
        {{ $t('hosting.deleteHosting') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard'
import { useTelegramHaptics } from '@/hooks/useTelegramHaptics'
import type { HostingAddressItem } from '@/api/modules/address/types'

const props = defineProps<{
  item: HostingAddressItem
  onDelete?: () => void
}>()

const { copyText } = useCopyToClipboard()
const { tmaHapticSelection, tmaHapticImpact } = useTelegramHaptics()

const historyUsed = computed(() => Number(props.item.count ?? 0))
const todayUsed = computed(() => Number(props.item.today_count ?? 0))

const handleCopy = () => {
  tmaHapticSelection()
  copyText(props.item.address)
}

const handleDelete = () => {
  tmaHapticImpact('light')
  props.onDelete?.()
}
</script>

<style scoped lang="scss">
.address-card {
  width: 100%;
  box-sizing: border-box;
  padding: 14px 16px;
  background: #ffffff;
  border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
  border-radius: var(--theme-radius-sm, 6px);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(22, 93, 255, 0.3);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
  }
}

.address-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 7px;
  border-radius: 4px;
  background: #ecfdf5;
  border: 1px solid rgba(16, 185, 129, 0.2);
  color: #059669;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.2;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #10b981;
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
  }
}

.copy-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
  background: #f8fafc;
  color: var(--theme-text-gray, #64748b);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: #ffffff;
    color: var(--theme-primary-blue, #165dff);
    border-color: rgba(22, 93, 255, 0.3);
  }

  &:active {
    transform: scale(0.96);
  }
}

.address-box {
  height: 38px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  background: #f8fafc;
  border: 1px solid rgba(226, 232, 240, 0.8);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1;
  overflow: hidden;

  .address-prefix,
  .address-suffix {
    color: var(--theme-text-black, #182230);
    font-weight: 700;
    flex-shrink: 0;
  }

  .address-mid {
    color: var(--theme-text-gray, #64748b);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 16px;
  }

  .address-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.address-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
}

.address-stats {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-width: 0;

  .stat-pill {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 4px;
    background: #f1f5f9;
    font-size: 11px;
    line-height: 1.2;

    .stat-label {
      color: var(--theme-text-gray, #64748b);
      font-weight: 500;
    }

    .stat-val {
      color: var(--theme-text-black, #182230);
      font-weight: 700;
    }
  }
}

.delete-btn {
  flex-shrink: 0;
  height: 30px;
  padding: 0 12px;
  border: 1px solid rgba(239, 68, 68, 0.28);
  border-radius: 4px;
  background: #ffffff;
  color: #ef4444;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);

  &:hover {
    background: #ef4444;
    color: #ffffff;
    border-color: #ef4444;
    box-shadow: 0 2px 6px rgba(239, 68, 68, 0.2);
  }

  &:active {
    transform: scale(0.96);
  }
}

@media (max-width: 890px) {
  .address-card {
    padding: 12px 12px;
  }

  .address-box {
    height: 34px;
    font-size: 12px;
  }

  .address-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .address-stats {
    justify-content: flex-start;
  }

  .delete-btn {
    width: 100%;
    height: 32px;
  }
}
</style>
