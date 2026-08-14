<template>
  <div class="auth-frame" :class="`is-${mode}`">
    <div class="auth-hero" aria-hidden="true">
      <img :src="heroImage" alt="" class="auth-hero-img" />
      <div class="auth-hero-blur" />
      <div class="auth-hero-fade" />
    </div>

    <div class="auth-panel">
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

      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
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

const onSwitch = (next: 'login' | 'register') => {
  if (next === props.mode) return
  emit('switch', next)
}
</script>

<style scoped lang="scss">
.auth-frame {
  position: relative;
  min-height: 520px;
  display: flex;
  justify-content: flex-end;
}

.auth-hero {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
}

.auth-hero-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.auth-hero-blur,
.auth-hero-fade {
  display: none;
}

.auth-panel {
  position: relative;
  z-index: 1;
  flex: 0 0 50%;
  width: 50%;
  box-sizing: border-box;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
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
  height: 44px;
  margin-bottom: 20px;
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
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &.is-active {
    background: var(--theme-bg-blue);
    color: #fff;
    font-weight: 600;
  }
}

@media (max-width: 768px) {
  .auth-frame {
    min-height: auto;
    flex-direction: column;
    justify-content: flex-start;
  }

  .auth-hero {
    position: relative;
    inset: auto;
    flex: 0 0 auto;
    width: 100%;
    height: 200px;
  }

  .auth-hero-img {
    height: 118%;
    object-position: center 28%;
  }

  .auth-hero-blur {
    display: block;
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
    display: block;
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
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .auth-brand {
    margin: 8px 0;
  }

  .auth-tabs {
    height: 42px;
    margin-bottom: 16px;
  }

  .auth-tab {
    font-size: 14px;
  }
}
</style>
