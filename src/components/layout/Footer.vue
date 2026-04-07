<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section left-section">
          <div class="desc-wrap">
            <div class="logo-section">
              <img src="@/assets/images/logo.png" alt="Logo" />
            </div>
            <div class="description">{{ $t('footer.description') }}</div>
            <div class="social-icons">
              <div class="social-icon" @click="handleOpenToTelegram(telegram)">
                <SvgIcon name="footer-telegram" width="20" height="20" />
              </div>
              <div class="social-icon" @click="handleOXAccount(twitter)">
                <SvgIcon name="footer-twitter" width="20" height="20" />
              </div>
            </div>
          </div>

          <div class="copyright">{{ $t('footer.copyright') }}</div>
        </div>

        <div class="footer-section middle-section">
          <div class="section-title">{{ $t('footer.quickLinks') }}</div>
          <ul class="link-list">
            <li>
              <div href="/" class="footer-link" @click="handleToRouter('/')">
                {{ $t('footer.quickLinks') }}
              </div>
            </li>
            <li>
              <div class="footer-link" @click="handleToRouter('/contract')">
                {{ $t('nav.contractFlash') }}
              </div>
            </li>
            <li>
              <div class="footer-link" @click.stop="handleToRouter('/', '#feature')">
                {{ $t('nav.features') }}
              </div>
            </li>
            <li>
              <div class="footer-link" @click.stop="handleToRouter('/', '#howItWorks')">
                {{ $t('nav.howItWorks') }}
              </div>
            </li>
            <li>
              <div class="footer-link" @click.stop="handleToRouter('/', '#fee')">
                {{ $t('nav.fee') }}
              </div>
            </li>
            <li>
              <div class="footer-link" @click.stop="handleToRouter('/', '#question')">
                {{ $t('nav.faq') }}
              </div>
            </li>
          </ul>
        </div>

        <div class="footer-section right-section">
          <div class="section-title">{{ $t('footer.contactUs') }}</div>
          <div class="contact-info">
            <div class="contact-item" @click="handleOpenToTelegram(telegram)">
              <SvgIcon name="footer-telegram" width="18" height="18" />
              <span>{{ $t('footer.telegramContact') }}</span>
            </div>
            <div class="contact-item" @click="handleOpenEmail(email)">
              <SvgIcon name="footer-email" width="18" height="18" />
              <span>{{ $t('footer.emailContact') }}</span>
            </div>
            <div class="contact-item" @click="handleOXAccount(twitter)">
              <SvgIcon name="footer-twitter" width="18" height="18" />
              <span>{{ $t('footer.twitterContact') }}</span>
            </div>
          </div>
        </div>

        <div class="copyright footer-copyright">{{ $t('footer.copyright') }}</div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { handleOpenToTelegram, handleOXAccount, handleOpenEmail } from '@/utils'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({
  name: 'LayoutFooter',
})

const email = ref('VipTronGas@Gmail.com')
const telegram = ref('GasVipBot')
const twitter = ref('TronGasVipBot')

const router = useRouter()

const handleToRouter = (path: string, hash?: string) => {
  router.push({ path, hash })
}
</script>

<style lang="scss" scoped>
.footer {
  height: 372px;
  background: var(--theme-bg);
  padding: 60px 0 30px;
  margin-top: auto;
}

.footer-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: flex;
  gap: 120px;

  .footer-section {
    .section-title {
      color: var(--theme-text-white);
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }
  }

  .left-section {
    display: flex;
    flex-direction: column;
    gap: 180px;

    .logo-section {
      margin-bottom: 20px;
    }

    .description {
      color: var(--theme-text-white);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 24px;
      opacity: 0.6;
    }

    .social-icons {
      display: flex;
      gap: 16px;
      margin-bottom: 32px;
    }

    .social-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s ease;
      color: var(--theme-text-white);

      &:hover {
        transform: translateY(-2px);
      }
    }
  }

  .copyright {
    color: var(--theme-text-white);
    font-size: 14px;
    opacity: 0.4;

    &.footer-copyright {
      display: none;
    }
  }

  .middle-section {
    .link-list {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 12px;

        .footer-link {
          color: var(--theme-text-white);
          text-decoration: none;
          font-size: 14px;
          transition: opacity 0.3s ease;
          opacity: 0.6;
          cursor: pointer;

          &:hover {
            opacity: 1;
          }
        }
      }
    }
  }
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;

  span {
    color: var(--theme-text-white);
    font-size: 14px;
    opacity: 0.6;
  }

  svg {
    color: var(--theme-bg-blue);
  }
}

@media (max-width: 768px) {
  .footer {
    height: auto;
    padding-bottom: 0;
  }

  .footer-container {
    max-width: initial;
    padding: 0 16px;
  }

  .footer-content {
    display: initial;
    gap: initial;

    .left-section {
      gap: 0;

      .copyright {
        display: none;
      }
    }

    .right-section {
      padding-top: 25px;
    }
    .copyright {
      &.footer-copyright {
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
}
</style>
