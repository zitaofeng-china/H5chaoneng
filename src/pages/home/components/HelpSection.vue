<template>
  <div class="help-section">
    <div class="help-container">
      <div class="help-content">
        <div class="help-info">
          <div class="help-title">{{ $t('help.title') }}</div>
          <div class="help-subtitle">{{ $t('help.subtitle') }}</div>
        </div>

        <div class="help-info">
          <div class="help-buttons">
            <div class="help-button primary" @click="handleContactService">
              <span>{{ $t('help.contactService') }}</span>
            </div>
            <div class="help-button secondary" @click="handleViewProblems">
              <span>{{ $t('help.viewFaq') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { handleOpenToTelegram } from '@/utils'
import { getSite } from '@/utils/site'
import { useSiteStore } from '@/stores/useSiteStore'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'HelpSection',
})

const router = useRouter()
const siteStore = useSiteStore()
const { tgAdmin } = storeToRefs(siteStore)

const handleContactService = () => {
  handleOpenToTelegram(tgAdmin.value)
}

const handleViewProblems = () => {
  const site = getSite()
  router.push({ path: `/${site}/`, hash: '#question' })
}
</script>

<style lang="scss" scoped>
.help-section {
  background: var(--theme-bg-blue);
  padding: 100px 0;
}

.help-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 40px;
  color: var(--theme-text-white);
}

.help-content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  .help-info {
    &:not(:last-child) {
      margin-bottom: 80px;
    }
  }
}

.help-title {
  font-size: 40px;
  font-weight: 700;
  margin-bottom: 20px;
  text-align: center;
}

.help-subtitle {
  font-size: 18px;
}

.help-buttons {
  display: flex;
  gap: 32px;
}

.help-button {
  width: 150px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 8px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  box-sizing: border-box;

  &.primary {
    background: var(--theme-text-white);
    color: var(--theme-bg-blue);

    &:hover {
      transform: translateY(-2px);

      .button-icon {
        background: rgba(255, 255, 255, 0.25);
      }
    }
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.05);
    color: var(--theme-text-white);
    border: 2px solid rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px);

      .button-icon {
        background: rgba(255, 255, 255, 0.2);
      }
    }
  }
}

@media (max-width: 768px) {
  .help-container {
    max-width: initial;
    padding: 0 6px;
  }

  .help-content {
    .help-info {
      &:not(:last-child) {
        margin-bottom: 20px;
      }
    }
  }

  .help-section {
    padding: 32px 0;
  }

  .help-title {
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .help-subtitle {
    font-size: 13px;
    line-height: 1.5;
    opacity: 0.9;
  }

  .help-buttons {
    gap: 12px;
    width: 100%;
    justify-content: center;
  }

  .help-button {
    flex: 1;
    max-width: 160px;
    min-width: 140px;
    height: 44px;
    font-size: 14px;
    border-radius: 6px;
  }
}

/* 适配 300px 超小屏幕 */
@media (max-width: 360px) {
  .help-container {
    padding: 0 8px;
  }

  .help-section {
    padding: 20px 0;
  }

  .help-content {
    .help-info {
      &:not(:last-child) {
        margin-bottom: 14px;
      }
    }
  }

  .help-title {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 6px;
  }

  .help-subtitle {
    font-size: 11px;
    line-height: 1.4;
    padding: 0 2px;
  }

  .help-buttons {
    gap: 6px;
    width: 100%;
    padding: 0 10px;
    justify-content: center;
  }

  .help-button {
    flex: 0 1 auto;
    max-width: 130px;
    min-width: 110px;
    height: 36px;
    font-size: 11px;
    border-radius: 4px;
    padding: 0 8px;

    span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    &.secondary {
      border-width: 1.5px;
    }
  }
}
</style>
