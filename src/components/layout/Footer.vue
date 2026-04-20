<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-content">
        <div class="footer-section left-section">
          <div class="logo-section">
            <img src="@/assets/images/logo.png" alt="Logo" />
          </div>
          <div class="description">{{ $t('footer.description') }}</div>
          <div class="social-icons">
            <div class="social-icon" @click="handleOpenToTelegram(tgAdmin)">
              <SvgIcon name="footer-telegram" width="24" height="24" />
            </div>
          </div>
        </div>

        <div class="footer-section middle-section">
          <div class="section-title">{{ $t('footer.quickLinks') }}</div>
          <ul class="link-list">
            <li>
              <div class="footer-link" @click="handleToRouter('/contract')">
                {{ $t('nav.contractFlash') }}
              </div>
            </li>
            <li>
              <div class="footer-link" @click="handleToRouter('/hosting')">
                {{ $t('nav.smartHosting') }}
              </div>
            </li>
            <li>
              <div class="footer-link" @click="handleToRouter('/activation')">
                {{ $t('nav.batchActivation') }}
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
              <div class="footer-link" @click.stop="handleToRouter('/', '#question')">
                {{ $t('nav.faq') }}
              </div>
            </li>
          </ul>
        </div>

        <div class="footer-section right-section">
          <div class="section-title">{{ $t('footer.contactUs') }}</div>
          <div class="contact-info">
            <div class="contact-item" @click="handleOpenToTelegram(tgAdmin)">
              <SvgIcon name="footer-telegram" width="20" height="20" />
              <span>{{ displayTgAdmin }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 版权信息独立一行 -->
      <div class="footer-bottom">
        <div class="copyright">© {{ currentYear }} GAS711. {{ $t('footer.rightsReserved') }}</div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { handleOpenToTelegram } from '@/utils'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { getSite } from '@/utils/site'
import { useSiteStore } from '@/stores/useSiteStore'
import { storeToRefs } from 'pinia'

defineOptions({
  name: 'LayoutFooter',
})

const siteStore = useSiteStore()
const { tgAdmin } = storeToRefs(siteStore)

// 显示用的 Telegram 账号（确保有 @ 前缀）
const displayTgAdmin = computed(() => {
  if (!tgAdmin.value) return ''
  return tgAdmin.value.startsWith('@') ? tgAdmin.value : `@${tgAdmin.value}`
})

// 动态获取当前年份
const currentYear = computed(() => new Date().getFullYear())

const router = useRouter()

const handleToRouter = (path: string, hash?: string) => {
  const site = getSite()
  // 构建完整路径：/:site/path
  const fullPath = `/${site}${path}`
  router.push({ path: fullPath, hash })
}
</script>

<style lang="scss" scoped>
.footer {
  min-height: 320px;
  background: var(--theme-bg);
  padding: 60px 0 0;
  margin-top: auto;
}

.footer-container {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: flex;
  gap: 80px;
  padding-bottom: 40px;

  .footer-section {
    flex: 1;

    .section-title {
      color: var(--theme-text-white);
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 20px;
    }
  }

  .left-section {
    flex: 1.2;

    .logo-section {
      margin-bottom: 20px;

      img {
        height: 40px;
        width: auto;
      }
    }

    .description {
      color: var(--theme-text-white);
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 24px;
      opacity: 0.7;
      max-width: 300px;
    }

    .social-icons {
      display: flex;
      gap: 16px;
    }

    .social-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: var(--theme-text-white);

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        transform: translateY(-2px);
      }
    }
  }

  .middle-section {
    flex: 0.8;

    .link-list {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        margin-bottom: 14px;

        &:last-child {
          margin-bottom: 0;
        }

        .footer-link {
          color: var(--theme-text-white);
          text-decoration: none;
          font-size: 14px;
          transition: all 0.3s ease;
          opacity: 0.7;
          cursor: pointer;
          display: inline-block;
          position: relative;

          &::before {
            content: '';
            position: absolute;
            left: -12px;
            top: 50%;
            transform: translateY(-50%);
            width: 4px;
            height: 4px;
            background: var(--theme-text-green);
            border-radius: 50%;
            opacity: 0;
            transition: all 0.3s ease;
          }

          &:hover {
            opacity: 1;
            color: var(--theme-text-green);
            transform: translateX(4px);

            &::before {
              opacity: 1;
            }
          }
        }
      }
    }
  }

  .right-section {
    flex: 1;
  }
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 10px;
  margin: -10px;
  border-radius: 8px;

  &:hover {
    background: rgba(255, 255, 255, 0.05);

    span {
      opacity: 1;
      color: var(--theme-text-green);
    }

    svg {
      transform: scale(1.1);
    }
  }

  span {
    color: var(--theme-text-white);
    font-size: 14px;
    opacity: 0.7;
    transition: all 0.3s ease;
    word-break: break-all;
  }

  svg {
    color: var(--theme-bg-blue);
    flex-shrink: 0;
    transition: transform 0.3s ease;
  }
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px 0;
  text-align: center;

  .copyright {
    color: var(--theme-text-white);
    font-size: 14px;
    opacity: 0.5;
  }
}

@media (max-width: 768px) {
  .footer {
    min-height: auto;
    padding: 24px 0 0;
  }

  .footer-container {
    padding: 0 10px;
  }

  .footer-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;
    padding-bottom: 20px;

    .footer-section {
      flex: none;
    }

    // Logo 和社交图标放在一行
    .left-section {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 16px;
      align-items: start;

      .logo-section {
        margin-bottom: 0;

        img {
          height: 28px;
        }
      }

      .description {
        display: none; // 移动端隐藏描述文字
      }

      .social-icons {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
      }

      .social-icon {
        width: 34px;
        height: 34px;
        
        svg {
          width: 18px;
          height: 18px;
        }
      }
    }

    // 快速链接改为两列布局
    .middle-section {
      .section-title {
        font-size: 13px;
        margin-bottom: 10px;
        font-weight: 600;
      }

      .link-list {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px 12px;

        li {
          margin-bottom: 0;

          .footer-link {
            font-size: 12px;
            opacity: 0.8;
          }
        }
      }
    }

    // 联系方式简化
    .right-section {
      .section-title {
        font-size: 13px;
        margin-bottom: 10px;
        font-weight: 600;
      }

      .contact-item {
        padding: 6px 4px;
        margin: -6px -4px;

        svg {
          width: 16px;
          height: 16px;
        }

        span {
          font-size: 12px;
          opacity: 0.8;
        }
      }
    }
  }

  .footer-bottom {
    padding: 14px 0 18px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);

    .copyright {
      font-size: 10px;
      opacity: 0.6;
      line-height: 1.3;
    }
  }
}
</style>
