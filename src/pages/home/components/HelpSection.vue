<template>
  <section id="contact" class="help-section">
    <span class="help-shape help-shape-left" aria-hidden="true"></span>
    <span class="help-shape help-shape-right" aria-hidden="true"></span>

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
  padding: 56px 24px 60px;
  background:
    linear-gradient(180deg, rgba(232, 244, 255, 0.35), rgba(232, 244, 255, 0.35)),
    linear-gradient(135deg, #eef6ff 0%, #e4f1ff 48%, #dcecff 100%);
  isolation: isolate;
}

.help-shape {
  position: absolute;
  width: 220px;
  height: 168px;
  border: 1px solid rgba(71, 155, 235, 0.28);
  background: rgba(255, 255, 255, 0.28);
  pointer-events: none;
  z-index: 0;
}

.help-shape-left {
  left: -36px;
  bottom: -56px;
  clip-path: polygon(0 45%, 44% 0, 100% 18%, 74% 100%, 12% 82%);
  transform: rotate(12deg);
}

.help-shape-right {
  right: -32px;
  top: -62px;
  clip-path: polygon(15% 0, 100% 22%, 74% 100%, 20% 80%, 0 34%);
  transform: rotate(-12deg);
}

.help-container {
  position: relative;
  z-index: 1;
  max-width: 780px;
  margin: 0 auto;
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

  .help-shape {
    width: 140px;
    height: 110px;
  }
}
</style>
