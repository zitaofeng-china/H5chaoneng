<template>
  <div class="auth-frame" :class="[`is-${mode}`, layoutClass]">
    <div class="auth-hero" aria-hidden="true">
      <img :src="heroImage" alt="" class="auth-hero-img" />
      <div v-if="isMobile" class="auth-hero-blur" />
      <div v-if="isMobile" class="auth-hero-fade" />
    </div>

    <div class="auth-panel">
      <template v-if="isMobile">
        <div class="auth-brand">
          <div class="auth-brand-inner">
            <img :src="gasLogoMark" alt="GAS711" class="auth-brand-mark" />
            <span class="auth-brand-name">GAS711</span>
          </div>
        </div>

        <div class="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            class="auth-tab"
            :class="{ 'is-active': mode === 'register' }"
            :aria-selected="mode === 'register'"
            @click="onSwitch('register')"
          >
            {{ t('register.title') }}
          </button>
          <button
            type="button"
            role="tab"
            class="auth-tab"
            :class="{ 'is-active': mode === 'login' }"
            :aria-selected="mode === 'login'"
            @click="onSwitch('login')"
          >
            {{ t('login.title') }}
          </button>
        </div>
      </template>

      <div v-else class="auth-header">
        <div class="auth-title">{{ title }}</div>
      </div>

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useCommonStore } from '@/stores/useCommonStore'
import heroImage from '@/assets/images/register-bg.png'
import gasLogoMark from '@/assets/images/gas-logo-mark.png'

defineOptions({
  name: 'AuthDialogFrame',
})

const props = defineProps<{
  mode: 'login' | 'register'
}>()

const emit = defineEmits<{
  switch: [mode: 'login' | 'register']
}>()

const { t } = useI18n()
const { isMobile } = storeToRefs(useCommonStore())
const layoutClass = computed(() => (isMobile.value ? 'is-mobile' : 'is-desktop'))
const title = computed(() =>
  props.mode === 'login' ? t('login.title') : t('register.title'),
)

const onSwitch = (next: 'login' | 'register') => {
  if (next === props.mode) return
  emit('switch', next)
}
</script>

<style scoped lang="scss">
.auth-frame {
  position: relative;
  display: flex;
}

.auth-hero {
  overflow: hidden;
}

.auth-hero-img {
  display: block;
  width: 100%;
  object-fit: cover;
}

.auth-panel {
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.auth-frame.is-desktop {
  min-height: 485px;
  justify-content: flex-end;

  &.is-register {
    min-height: 520px;
  }

  .auth-hero {
    position: absolute;
    inset: 0;
    z-index: 0;
  }

  .auth-hero-img {
    height: 100%;
    object-position: center;
  }

  .auth-panel {
    flex: 0 0 50%;
    width: 50%;
    margin-left: auto;
    padding: 50px 24px 32px;
    background: rgba(255, 255, 255, 0.72);
  }

  .auth-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 50px;
  }

  &.is-register .auth-header {
    margin-bottom: 40px;
  }

  .auth-title {
    font-size: 34px;
    font-weight: 700;
    color: #1a1a1a;
    letter-spacing: 0.5px;
    line-height: 1.2;
  }
}

.auth-frame.is-mobile {
  min-height: auto;
  flex-direction: column;
  justify-content: flex-start;

  .auth-hero {
    position: relative;
    flex: 0 0 auto;
    width: 100%;
    height: 200px;
  }

  .auth-hero-img {
    height: 118%;
    object-position: center 28%;
  }

  .auth-hero-blur {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 40px;
    pointer-events: none;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    mask-image: linear-gradient(180deg, transparent 0%, #000 70%, #000 100%);
    -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 70%, #000 100%);
  }

  .auth-hero-fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 44px;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.34) 40%,
      rgba(255, 255, 255, 0.78) 75%,
      #fff 100%
    );
  }

  .auth-panel {
    flex: none;
    width: 100%;
    margin: 0;
    padding: 0 20px;
    background: #fff;
  }

  .auth-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 8px 0;
  }

  .auth-brand-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .auth-brand-mark {
    display: block;
    width: 22px;
    height: 22px;
    object-fit: contain;
  }

  .auth-brand-name {
    display: block;
    color: #1e3a5f;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.02em;
    line-height: 22px;
  }

  .auth-tabs {
    display: flex;
    align-items: center;
    gap: 0;
    height: 42px;
    margin-bottom: 16px;
    padding: 3px;
    border-radius: 8px;
    background: #f3f4f6;
  }

  .auth-tab {
    flex: 1;
    height: 100%;
    border: 0;
    border-radius: 6px;
    background: transparent;
    color: #6b7280;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition:
      background 0.2s ease,
      color 0.2s ease;

    &.is-active {
      background: var(--theme-bg-blue);
      color: #fff;
      font-weight: 600;
    }
  }
}
</style>
