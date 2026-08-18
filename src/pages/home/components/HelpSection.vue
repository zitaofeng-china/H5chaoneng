<template>
  <section id="contact" class="help-section">
    <img
      class="help-bg"
      src="@/assets/images/home/lanhu/help-bg.png"
      alt=""
      aria-hidden="true"
    />

    <div class="help-container">
      <h2 class="help-title">{{ $t('help.title') }}</h2>
      <p class="help-subtitle">{{ $t('help.subtitle') }}</p>

      <div class="help-buttons">
        <button type="button" class="help-button primary" @click="handleContactService">
          {{ $t('help.contactService') }}
        </button>
        <button type="button" class="help-button secondary" @click="handleViewProblems">
          {{ $t('help.viewFaq') }}
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { handleOpenToTelegram } from '@/utils'
import { withSitePrefix } from '@/utils/site'
import { useSiteStore } from '@/stores/useSiteStore'

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
  router.push({ path: withSitePrefix('/'), hash: '#question' })
}
</script>

<style lang="scss" scoped>
.help-section {
  position: relative;
  overflow: hidden;
  min-height: 225px;
  background: #e8f3ff;
  isolation: isolate;
}

.help-bg {
  display: block;
  width: 100%;
  max-width: 1920px;
  min-width: 1440px;
  height: auto;
  margin: 0 auto;
  pointer-events: none;
}

.help-container {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  width: min(780px, calc(100% - 48px));
  transform: translate(-50%, -50%);
  text-align: center;
}

.help-title {
  margin: 0;
  color: #165dff;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.35;
}

.help-subtitle {
  margin: 10px auto 0;
  color: rgba(71, 84, 103, 0.72);
  font-size: 13px;
  line-height: 1.65;
}

.help-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 22px;
}

.help-button {
  min-width: 112px;
  height: 36px;
  padding: 0 18px;
  border-radius: 4px;
  font: inherit;
  font-size: 13px;
  line-height: 34px;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;

  &:hover {
    transform: translateY(-1px);
  }
}

.help-button.primary {
  border: 1px solid #fff;
  color: #165dff;
  background: #fff;
  box-shadow: 0 6px 14px rgba(34, 105, 183, 0.08);
}

.help-button.secondary {
  border: 1px solid #165dff;
  color: #fff;
  background: #165dff;
  box-shadow: 0 6px 14px rgba(22, 93, 255, 0.22);
}

@media (max-width: 768px) {
  .help-section {
    min-height: 200px;
  }

  .help-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    max-width: none;
    min-width: 0;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .help-container {
    position: relative;
    top: auto;
    left: auto;
    width: auto;
    transform: none;
    padding: 36px 16px 40px;
  }

  .help-title {
    font-size: 22px;
  }

  .help-subtitle {
    font-size: 12px;
  }

  .help-buttons {
    gap: 8px;
    margin-top: 16px;
  }

  .help-button {
    min-width: 96px;
    height: 34px;
    padding: 0 12px;
    font-size: 12px;
  }
}
</style>
