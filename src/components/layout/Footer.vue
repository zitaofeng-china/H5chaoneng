<template>
  <footer class="footer">
    <div class="footer-glow" aria-hidden="true"></div>

    <div class="footer-container">
      <div class="footer-content">
        <section class="footer-section brand-section">
          <img src="@/assets/images/logo.png" alt="GAS711" class="footer-logo" />
          <p class="description">{{ $t('footer.description') }}</p>
          <div class="social-icons">
            <button
              type="button"
              class="social-icon"
              :aria-label="$t('nav.contactUs')"
              @click="handleOpenToTelegram(tgAdmin)"
            >
              <SvgIcon name="footer-telegram" width="18" height="18" />
            </button>
          </div>
        </section>

        <nav class="footer-section quick-links" :aria-label="$t('footer.quickLinks')">
          <h2 class="section-title">{{ $t('footer.quickLinks') }}</h2>
          <ul class="link-list">
            <li>
              <button type="button" class="footer-link" @click="handleToRouter('/contract')">
                {{ $t('nav.contractFlash') }}
              </button>
            </li>
            <li>
              <button type="button" class="footer-link" @click="handleToRouter('/hosting')">
                {{ $t('nav.smartHosting') }}
              </button>
            </li>
            <li>
              <button type="button" class="footer-link" @click="handleToRouter('/activation')">
                {{ $t('nav.batchActivation') }}
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
              <button type="button" class="footer-link" @click="handleToRouter('/', '#question')">
                {{ $t('nav.faq') }}
              </button>
            </li>
          </ul>
        </nav>

        <section class="footer-section contact-section">
          <h2 class="section-title">{{ $t('footer.contactUs') }}</h2>
          <button type="button" class="contact-item" @click="handleOpenToTelegram(tgAdmin)">
            <SvgIcon name="footer-telegram" width="16" height="16" />
            <span>{{ displayTgAdmin }}</span>
          </button>
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
import { useRouter } from 'vue-router'
import { handleOpenToTelegram } from '@/utils'
import { withSitePrefix } from '@/utils/site'
import { useSiteStore } from '@/stores/useSiteStore'

defineOptions({
  name: 'LayoutFooter',
})

const router = useRouter()
const siteStore = useSiteStore()
const { tgAdmin } = storeToRefs(siteStore)

const displayTgAdmin = computed(() => {
  if (!tgAdmin.value) return ''
  return tgAdmin.value.startsWith('@') ? tgAdmin.value : `@${tgAdmin.value}`
})

const currentYear = computed(() => new Date().getFullYear())

const handleToRouter = (path: string, hash?: string) => {
  router.push({ path: withSitePrefix(path), hash })
}
</script>

<style lang="scss" scoped>
.footer {
  position: relative;
  overflow: hidden;
  min-height: 248px;
  padding: 50px 0 0;
  background: linear-gradient(180deg, #061743 0%, #020f2d 62%, #061b4c 100%);
  color: #fff;
  isolation: isolate;
}

.footer::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -22px;
  height: 128px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(24, 77, 205, 0.2) 22%,
    rgba(20, 127, 255, 0.35) 53%,
    rgba(32, 208, 236, 0.24) 72%,
    transparent 100%
  );
  filter: blur(22px);
  pointer-events: none;
  z-index: -1;
}

.footer::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(119, 187, 255, 0.48), transparent);
  pointer-events: none;
}

.footer-container {
  width: min(100%, 1180px);
  margin: 0 auto;
  padding: 0 32px;
  box-sizing: border-box;
}

.footer-content {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(150px, 0.75fr) minmax(150px, 0.8fr);
  gap: 56px;
}

.footer-section {
  min-width: 0;
}

.footer-logo {
  display: block;
  width: 106px;
  height: auto;
}

.description {
  max-width: 320px;
  margin: 16px 0 17px;
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
.footer-link {
  border: 0;
  font: inherit;
  cursor: pointer;
}

.social-icon {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: #fff;
  background: rgba(255, 255, 255, 0.06);
  transition:
    background 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: rgba(31, 117, 255, 0.45);
    transform: translateY(-1px);
  }
}

.section-title {
  margin: 2px 0 16px;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
}

.link-list {
  display: grid;
  gap: 9px;
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
  gap: 9px;
  padding: 0;
  color: rgba(255, 255, 255, 0.62);
  background: transparent;
  font-size: 13px;
  line-height: 1.4;
  transition: color 0.2s ease;

  svg {
    color: #35a7ff;
  }

  &:hover {
    color: #fff;
  }
}

.footer-bottom {
  margin-top: 38px;
  padding: 16px 0 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.42);
  font-size: 12px;
  line-height: 1.4;
  text-align: center;
}

@media (max-width: 768px) {
  .footer {
    min-height: auto;
    padding-top: 34px;
  }

  .footer-container {
    padding: 0 16px;
  }

  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: 26px 28px;
  }

  .brand-section {
    grid-column: 1 / -1;
  }

  .footer-logo {
    width: 94px;
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
    margin-top: 28px;
    padding: 12px 0 16px;
    font-size: 9px;
  }
}
</style>
