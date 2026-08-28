<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <section class="footer-section brand-section">
          <button type="button" class="footer-brand" @click="handleToRouter('/')">
            <img :src="gasLogoMark" alt="" class="footer-logo-mark" />
            <span class="footer-wordmark">GAS711</span>
          </button>
          <p class="description">{{ $t('footer.description') }}</p>
          <div class="social-icons">
            <button
              type="button"
              class="social-icon"
              :aria-label="$t('footer.telegramContact')"
              @click="handleOpenToTelegram(telegramHandle)"
            >
              <SvgIcon name="footer-telegram" width="16" height="16" />
            </button>
            <button
              type="button"
              class="social-icon"
              :aria-label="$t('footer.twitterContact')"
              @click="handleOXAccount(twitterHandle)"
            >
              <SvgIcon name="footer-twitter" width="14" height="14" />
            </button>
          </div>
        </section>

        <nav class="footer-section quick-links" :aria-label="$t('footer.quickLinks')">
          <h2 class="section-title">{{ $t('footer.quickLinks') }}</h2>
          <ul class="link-list">
            <li>
              <button type="button" class="footer-link" @click="handleToRouter('/')">
                {{ $t('footer.quickLinks') }}
              </button>
            </li>
            <li>
              <button type="button" class="footer-link" @click="handleToRouter('/contract')">
                {{ $t('nav.contractFlash') }}
              </button>
            </li>
            <li>
              <button type="button" class="footer-link" @click="handleToRouter('/', '#feature')">
                {{ $t('nav.features') }}
              </button>
            </li>
            <li>
              <button type="button" class="footer-link" @click="handleToRouter('/', '#howItWorks')">
                {{ $t('nav.howItWorks') }}
              </button>
            </li>
            <li>
              <button type="button" class="footer-link" @click="handleToRouter('/', '#fee')">
                {{ $t('nav.fee') }}
              </button>
            </li>
            <li>
              <button type="button" class="footer-link" @click="handleToRouter('/', '#question')">
                {{ $t('nav.faq') }}
              </button>
            </li>
          </ul>
        </nav>

        <section class="footer-section contact-section">
          <h2 class="section-title">{{ $t('footer.contactUs') }}</h2>
          <div class="contact-list">
            <button type="button" class="contact-item" @click="handleOpenToTelegram(telegramHandle)">
              <SvgIcon name="footer-telegram" width="16" height="16" />
              <span>{{ displayTelegram }}</span>
            </button>
          </div>
        </section>
      </div>

      <div class="footer-bottom">
        <span>© {{ currentYear }} GAS711. {{ $t('footer.rightsReserved') }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { handleOpenToTelegram, handleOXAccount } from '@/utils'
import { withSitePrefix } from '@/utils/site'
import { useSiteStore } from '@/stores/useSiteStore'
import gasLogoMark from '@/assets/images/gas-logo-mark.png'

defineOptions({
  name: 'LayoutFooter',
})

const { t } = useI18n()
const router = useRouter()
const siteStore = useSiteStore()
const { tgAdmin } = storeToRefs(siteStore)

function withAt(value: string) {
  const raw = value.trim()
  if (!raw) return ''
  return raw.startsWith('@') ? raw : `@${raw}`
}

const telegramHandle = computed(() => {
  return String(tgAdmin.value || t('footer.telegramContact')).trim()
})

const displayTelegram = computed(() => withAt(telegramHandle.value))

const twitterHandle = computed(() => String(t('footer.twitterContact') || '').trim())

const currentYear = computed(() => new Date().getFullYear())

const handleToRouter = (path: string, hash?: string) => {
  router.push({ path: withSitePrefix(path), hash })
}
</script>

<style lang="scss" scoped>
.footer {
  position: relative;
  overflow: hidden;
  height: 372px;
  padding: 50px 0 0;
  background: #0a152c url('@/assets/images/home/lanhu/footer-bg.png') 100% no-repeat;
  background-size: 100% 100%;
  color: #fff;
  isolation: isolate;
  box-sizing: border-box;
}

.footer-container {
  position: relative;
  z-index: 1;
  width: min(100%, 1180px);
  margin: 0 auto;
  padding: 0 32px;
  box-sizing: border-box;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 48px 80px;
}

.footer-section {
  min-width: 0;
}

.brand-section {
  flex: 1 1 280px;
  max-width: 360px;
}

.quick-links,
.contact-section {
  flex: 0 0 auto;
}

.quick-links {
  min-width: 112px;
}

.contact-section {
  min-width: 196px;
}

.footer-brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  border: 0;
  color: #fff;
  background: transparent;
  cursor: pointer;
}

.footer-logo-mark {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.footer-wordmark {
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
}

.description {
  max-width: 320px;
  margin: 14px 0 16px;
  color: rgba(255, 255, 255, 0.62);
  font-size: 12px;
  line-height: 1.65;
}

.social-icons {
  display: flex;
  gap: 8px;
}

.social-icon,
.contact-item,
.footer-link,
.footer-brand {
  font: inherit;
}

.social-icon,
.contact-item,
.footer-link {
  border: 0;
  cursor: pointer;
}

.social-icon {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #fff;
  background: rgba(255, 255, 255, 0.1);
  transition:
    background 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: rgba(31, 117, 255, 0.45);
    transform: translateY(-1px);
  }
}

.section-title {
  margin: 2px 0 14px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
}

.link-list,
.contact-list {
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 0;
  list-style: none;
}

.footer-link {
  padding: 0;
  color: rgba(255, 255, 255, 0.58);
  background: transparent;
  font-size: 13px;
  line-height: 1.4;
  text-align: left;
  transition:
    color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    color: #fff;
    transform: translateX(2px);
  }
}

.contact-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0;
  color: rgba(255, 255, 255, 0.62);
  background: transparent;
  font-size: 13px;
  line-height: 1.4;
  text-align: left;
  transition: color 0.2s ease;

  svg {
    flex: 0 0 auto;
    color: rgba(255, 255, 255, 0.78);
  }

  &:hover {
    color: #fff;
  }
}

.footer-bottom {
  margin-top: 36px;
  padding: 8px 0 22px;
  color: rgba(255, 255, 255, 0.42);
  font-size: 12px;
  line-height: 1.4;
  text-align: center;
}

@media (max-width: 768px) {
  .footer {
    height: auto;
    min-height: 372px;
    padding-top: 34px;
    background-size: cover;
    background-position: center bottom;
  }

  .footer-container {
    padding: 0 16px;
  }

  .footer-content {
    flex-wrap: wrap;
    gap: 26px 28px;
  }

  .brand-section {
    flex: 1 1 100%;
    max-width: none;
  }

  .quick-links,
  .contact-section {
    flex: 1 1 calc(50% - 14px);
    min-width: 0;
  }

  .description {
    margin: 12px 0 13px;
    font-size: 10px;
  }

  .section-title {
    margin-bottom: 12px;
    font-size: 11px;
  }

  .footer-link,
  .contact-item {
    font-size: 10px;
  }

  .footer-bottom {
    margin-top: 24px;
    padding: 8px 0 16px;
    font-size: 9px;
  }
}
</style>
