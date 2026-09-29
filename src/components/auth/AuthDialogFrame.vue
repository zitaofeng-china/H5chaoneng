<template>
  <div class="auth-frame" :class="[`is-${mode}`, layoutClass]">
    <!-- 移动端顶部关闭小控件（小方块样式，与 PC 端保持一致） -->
    <button
      v-if="isMobile"
      type="button"
      class="mobile-close-btn tactile-btn"
      aria-label="Close"
      @click="emit('close')"
    >
      <el-icon :size="13"><Close /></el-icon>
    </button>

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
import { Close } from '@element-plus/icons-vue'
import { useCommonStore } from '@/stores/useCommonStore'
import { useTelegramHaptics } from '@/hooks/useTelegramHaptics'
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
  close: []
}>()

const { t } = useI18n()
const { isMobile } = storeToRefs(useCommonStore())
const { tmaHapticSelection } = useTelegramHaptics()
const layoutClass = computed(() => (isMobile.value ? 'is-mobile' : 'is-desktop'))
const title = computed(() =>
  props.mode === 'login' ? t('login.title') : t('register.title'),
)

const onSwitch = (next: 'login' | 'register') => {
  if (next === props.mode) return
  tmaHapticSelection()
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
    background: rgba(255, 255, 255, 0.92);
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
  min-height: 100vh;
  height: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: #ffffff;

  .auth-hero {
    position: relative;
    flex: 0 0 auto;
    width: 100%;
    height: 136px;
    overflow: hidden;
  }

  .auth-hero-img {
    height: 115%;
    object-position: center 22%;
  }

  .auth-hero-blur {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 32px;
    pointer-events: none;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    mask-image: linear-gradient(180deg, transparent 0%, #000 70%, #000 100%);
    -webkit-mask-image: linear-gradient(180deg, transparent 0%, #000 70%, #000 100%);
  }

  .auth-hero-fade {
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 36px;
    pointer-events: none;
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.45) 40%,
      rgba(255, 255, 255, 0.85) 75%,
      #ffffff 100%
    );
  }

  .auth-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: 0;
    padding: 0 20px 24px;
    background: #ffffff;
  }

  .auth-brand {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 4px 0 8px;
  }

  .auth-brand-inner {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .auth-brand-mark {
    display: block;
    width: 20px;
    height: 20px;
    object-fit: contain;
  }

  .auth-brand-name {
    display: block;
    color: var(--theme-text-black, #182230);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.02em;
    line-height: 20px;
  }

  .auth-tabs {
    display: flex;
    align-items: center;
    gap: 0;
    height: 36px;
    margin-bottom: 12px;
    padding: 3px;
    border-radius: var(--theme-radius-sm, 4px);
    background: #f1f5f9;
    box-sizing: border-box;
  }

  .auth-tab {
    flex: 1;
    height: 100%;
    border: 0;
    border-radius: var(--theme-radius-sm, 4px);
    background: transparent;
    color: var(--theme-text-gray, #64748b);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &.is-active {
      background: #ffffff;
      color: var(--theme-primary-blue, #165dff);
      box-shadow: var(--theme-shadow-sm, 0 1px 3px rgba(15, 23, 42, 0.08));
      font-weight: 700;
    }
  }

  .mobile-close-btn {
    position: absolute;
    top: max(12px, env(safe-area-inset-top));
    right: 14px;
    z-index: 30;
    width: 28px;
    height: 28px;
    border-radius: var(--theme-radius-sm, 4px);
    border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.8));
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(8px);
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--theme-text-gray, #64748b);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.22, 1, 0.36, 1);

    &:hover {
      background: rgba(255, 255, 255, 0.98);
      border-color: rgba(22, 93, 255, 0.25);
      color: var(--theme-text-black, #0f172a);
    }

    &:active {
      transform: scale(0.94);
      background: rgba(241, 245, 249, 0.95);
    }
  }
}
</style>
