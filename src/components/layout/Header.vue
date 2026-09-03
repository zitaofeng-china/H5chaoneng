<template>
  <nav class="navbar">
    <span class="navbar-grid" aria-hidden="true"></span>
    <div class="navbar-container">
      <div class="logo-section" @click.stop="handleToRouter('/')">
        <img :src="gasLogoMark" alt="GAS711" class="logo-mark" />
        <span class="logo-wordmark">GAS711</span>
      </div>

      <div class="nav-links">
        <!-- 能量租赁下拉菜单 -->
        <div class="dropdown-popper-box energy-rental-dropdown" :class="{ 'is-active': isActiveHome }">
          <el-dropdown 
            trigger="click"
            :hide-on-click="true"
            placement="bottom"
            popper-class="energy-rental-popper-unique"
          >
            <span class="nav-link">
              <span class="nav-link-text">
                {{ $t('nav.energyRental') }}
              </span>
              <el-icon class="el-icon--right"><IEpArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu class="energy-rental-menu-unique">
                <el-dropdown-item
                  :class="{ 'is-active': isActive('/') }"
                  @click="handleToRouter('/')"
                >
                  {{ $t('nav.quickRent') }}
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="!isLite"
                  :class="{ 'is-active': isActive('/lease-time') }"
                  @click="handleToRouter('/lease-time')"
                >
                  {{ $t('nav.rentByTime') }}
                </el-dropdown-item>
                <el-dropdown-item
                  v-if="!isLite"
                  :class="{ 'is-active': isActive('/lease-count') }"
                  @click="handleToRouter('/lease-count')"
                >
                  {{ $t('nav.rentByCount') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div
          class="nav-link"
          :class="{ 'is-active': isActive('/contract') }"
          @click="handleToRouter('/contract')"
        >
          {{ $t('nav.contractFlash') }}
        </div>
        <div
          v-if="!isLite"
          class="nav-link"
          :class="{ 'is-active': isActive('/hosting') }"
          @click="handleToRouter('/hosting')"
        >
          {{ $t('nav.smartHosting') }}
        </div>
        <div
          v-if="!isLite"
          class="nav-link"
          :class="{ 'is-active': isActive('/activation') }"
          @click="handleToRouter('/activation')"
        >
          {{ $t('nav.batchActivation') }}
        </div>

        <!-- 福利订单独立菜单项 -->
        <div
          v-if="showWelfare"
          class="nav-link"
          :class="{ 'is-active': isActive('/welfare') }"
          @click="handleToRouter('/welfare')"
        >
          {{ $t('nav.welfareOrder') }}
        </div>

        <!-- 常见问题下拉菜单 -->
        <div class="dropdown-popper-box faq-dropdown" :class="{ 'is-active': isActiveFaq }">
          <el-dropdown 
            trigger="click"
            :hide-on-click="true"
            placement="bottom"
            popper-class="faq-popper-unique"
          >
            <span class="nav-link">
              <span class="nav-link-text">{{ $t('nav.faq') }}</span>
              <el-icon class="el-icon--right"><IEpArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu class="faq-menu-unique">
                <el-dropdown-item
                  :class="{ 'is-active': isHashActive('#fee') }"
                  @click.stop="handleToRouter('/', '#fee')"
                >
                  {{ $t('nav.fee') }}
                </el-dropdown-item>
                <el-dropdown-item
                  :class="{ 'is-active': isHashActive('#howItWorks') }"
                  @click.stop="handleToRouter('/', '#howItWorks')"
                >
                  {{ $t('nav.howItWorks') }}
                </el-dropdown-item>
                <el-dropdown-item
                  :class="{ 'is-active': isHashActive('#feature') }"
                  @click.stop="handleToRouter('/', '#feature')"
                >
                  {{ $t('nav.features') }}
                </el-dropdown-item>
                <el-dropdown-item
                  :class="{ 'is-active': isHashActive('#question') }"
                  @click.stop="handleToRouter('/', '#question')"
                >
                  {{ $t('nav.faq') }}
                </el-dropdown-item>
                <el-dropdown-item
                  :class="{ 'is-active': isHashActive('#contact') }"
                  @click.stop="handleOpenToTelegram(tgAdmin)"
                >
                  {{ $t('nav.contactUs') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="right-section">
        <button
          v-if="tgAdmin"
          type="button"
          class="header-action"
          :aria-label="$t('nav.contactUs')"
          @click="handleOpenToTelegram(tgAdmin)"
        >
          <img :src="telegramIcon" alt="" class="action-icon" />
        </button>
        <div class="dropdown-popper-box lang-dropdown">
          <el-dropdown trigger="click" :teleported="true" popper-class="lang-popper" @command="handleLanguageChange">
            <div class="info-wrap">
              <img :src="langIcon" alt="" class="action-icon" />
            </div>
            <template #dropdown>
              <el-dropdown-menu class="lang-menu">
                <el-dropdown-item
                  :class="{ 'is-active': localLang === key }"
                  v-for="(value, key) in lang"
                  :key="key"
                  :command="key"
                >
                  {{ value }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <button
          v-if="isLogin"
          type="button"
          class="balance-recharge"
          @click="handleRechange"
        >
          <SvgIcon name="header-USDT" width="16" height="16" class="balance-token-icon" />
          <span class="balance-amount">{{ trxBalance }}</span>
          <span class="recharge-text">{{ $t('common.recharge') }}</span>
        </button>

        <div class="dropdown-popper-box user-dropdown" v-if="isLogin">
          <el-dropdown trigger="hover" :teleported="true" popper-class="user-popper">
            <div class="user-icon">
              <img :src="userAvatar" alt="" class="user-avatar" />
            </div>
            <template #dropdown>
              <el-dropdown-menu class="user-menu">
                <el-dropdown-item @click.stop="handleRechange">
                  {{ $t('common.recharge') }}
                </el-dropdown-item>
                <el-dropdown-item @click.stop="handleUserInfo">
                  {{ $t('nav.userInfo') }}
                </el-dropdown-item>
                <el-dropdown-item v-if="!isTgEnv" @click.stop="handleModifyPassword">
                  {{ $t('revisePassword.title') }}
                </el-dropdown-item>
                <el-dropdown-item @click.stop="handleLogout">
                  {{ isTgEnv ? $t('login.relogin') : $t('login.logout') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="no-login" v-else>
          <button v-if="!isLite" type="button" class="login-btn btn" @click="handleLogin">
            {{ $t('login.title') }}
          </button>
        </div>
        <button
          v-if="isMobileView"
          ref="menuBtn"
          type="button"
          class="header-action is-menu"
          aria-label="menu"
          :aria-expanded="isMenu"
          @click="handleMenu('menu')"
        >
          <span class="menu-icon" aria-hidden="true">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
    </div>
  </nav>

  <div class="collapse-container" v-if="isMenu" v-click-outside:[menuBtn]="handleCollapseDestroy">
    <el-collapse v-model="activeNames" @change="handleChange">
      <el-collapse-item
        :title="$t('nav.energyRental')"
        name="1"
        :class="{ 'route-active': isActiveHome }"
      >
        <div class="menu-wrap">
          <div
            class="menu-item"
            :class="{ 'is-active': isActive('/') }"
            @click="handleToRouter('/')"
          >
            {{ $t('nav.quickRent') }}
          </div>
          <div
            v-if="!isLite"
            class="menu-item"
            :class="{ 'is-active': isActive('/lease-time') }"
            @click="handleToRouter('/lease-time')"
          >
            {{ $t('nav.rentByTime') }}
          </div>
          <div
            v-if="!isLite"
            class="menu-item"
            :class="{ 'is-active': isActive('/lease-count') }"
            @click="handleToRouter('/lease-count')"
          >
            {{ $t('nav.rentByCount') }}
          </div>
        </div>
      </el-collapse-item>
      <el-collapse-item
        :title="$t('nav.contractFlash')"
        name="2"
        disabled
        :class="{ 'route-active': isActive('/contract') }"
        @click="handleToRouter('/contract')"
      >
      </el-collapse-item>
      <el-collapse-item
        v-if="!isLite"
        :title="$t('nav.smartHosting')"
        name="3"
        disabled
        :class="{ 'route-active': isActive('/hosting') }"
        @click="handleToRouter('/hosting')"
      >
      </el-collapse-item>
      <el-collapse-item
        v-if="!isLite"
        :title="$t('nav.batchActivation')"
        name="4"
        disabled
        :class="{ 'route-active': isActive('/activation') }"
        @click="handleToRouter('/activation')"
      >
      </el-collapse-item>
      <el-collapse-item
        v-if="showWelfare"
        :title="$t('nav.welfareOrder')"
        name="0"
        disabled
        :class="{ 'route-active': isActive('/welfare') }"
        @click="handleToRouter('/welfare')"
      >
      </el-collapse-item>
      <el-collapse-item :title="$t('nav.faq')" name="5">
        <div class="menu-wrap">
          <div
            class="menu-item"
            :class="{ 'is-active': isHashActive('#fee') }"
            @click.stop="handleToRouter('/', '#fee')"
          >
            {{ $t('nav.fee') }}
          </div>
          <div
            class="menu-item"
            :class="{ 'is-active': isHashActive('#howItWorks') }"
            @click.stop="handleToRouter('/', '#howItWorks')"
          >
            {{ $t('nav.howItWorks') }}
          </div>
          <div
            class="menu-item"
            :class="{ 'is-active': isHashActive('#feature') }"
            @click.stop="handleToRouter('/', '#feature')"
          >
            {{ $t('nav.features') }}
          </div>
          <div
            class="menu-item"
            :class="{ 'is-active': isHashActive('#question') }"
            @click.stop="handleToRouter('/', '#question')"
          >
            {{ $t('nav.faq') }}
          </div>
          <div
            class="menu-item"
            :class="{ 'is-active': isHashActive('#contact') }"
            @click.stop="handleOpenToTelegram(tgAdmin)"
          >
            {{ $t('nav.contactUs') }}
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import vClickOutside from 'element-plus/es/directives/click-outside/index.mjs'
import gasLogoMark from '@/assets/images/gas-logo-mark.png'
import telegramIcon from '@/assets/images/header/telegram.png'
import langIcon from '@/assets/images/header/lang.png'
import userAvatar from '@/assets/images/header/avatar.png'
import { useHeaderNav } from './useHeaderNav'
import { SHOW_WELFARE } from '@/constants/features'

defineOptions({
  name: 'LayoutHeader',
})

const showWelfare = SHOW_WELFARE

const {
  isMobileView,
  tgAdmin,
  localLang,
  activeNames,
  isMenu,
  menuBtn,
  isLite,
  isTgEnv,
  lang,
  isActiveHome,
  isActiveFaq,
  isLogin,
  trxBalance,
  isActive,
  isHashActive,
  handleToRouter,
  handleLanguageChange,
  handleLogin,
  handleRechange,
  handleModifyPassword,
  handleUserInfo,
  handleLogout,
  handleChange,
  handleCollapseDestroy,
  handleMenu,
  handleOpenToTelegram,
} = useHeaderNav()
</script>

<style lang="scss" scoped>
.navbar {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 0 24px;
  height: var(--layout-header-height, 50px);
  min-height: var(--layout-header-height, 50px);
  display: flex;
  align-items: center;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.7));
  box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.03);
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.navbar-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-color: rgba(255, 255, 255, 0.75);
  background-image:
    var(--theme-home-band-1-color),
    var(--theme-home-grid-vertical);
  background-size:
    100% var(--theme-home-band-height, 50px),
    auto 300px;
  background-position: 0 0, 0 0;
  background-repeat: no-repeat, repeat;
  -webkit-mask-image: var(--theme-home-grid-mask);
  mask-image: var(--theme-home-grid-mask);
  -webkit-mask-size: 100% calc(6 * var(--theme-home-band-height, 50px));
  mask-size: 100% calc(6 * var(--theme-home-band-height, 50px));
  -webkit-mask-position: 0 0;
  mask-position: 0 0;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.navbar-container {
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.logo-section {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 8px;
  min-width: 140px;
  cursor: pointer;
}

.logo-mark {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.logo-wordmark {
  color: #334155;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.02em;
  line-height: 1;
}

.nav-links {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  gap: 28px;
  height: 100%;

  .nav-link {
    color: #475467;
    text-decoration: none;
    font-size: 13px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;
    height: 100%;
    padding: 0;
    cursor: pointer;
    white-space: nowrap;
    position: relative;
    transition: color 0.2s ease;

    &::after {
      content: '';
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      height: 3px;
      border-radius: 3px 3px 0 0;
      background: #2f6df6;
      opacity: 0;
      transform: scaleX(0.35);
      transform-origin: center;
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    &:active,
    &:focus {
      outline: none;
    }

    &:hover {
      color: #1766f5;
    }

    &.is-active {
      color: #1766f5;

      &::after {
        opacity: 1;
        transform: scaleX(1);
      }

      .el-icon--right {
        color: #1766f5;
      }
    }
  }

  .dropdown-popper-box {
    position: relative;
    height: 100%;

    :deep(.el-dropdown) {
      height: 100%;
      display: flex;
      align-items: center;
    }

    &:hover,
    &.is-active {
      color: #1766f5;

      .el-icon--right {
        color: #1766f5;
      }

      .nav-link {
        color: #1766f5;

        &::after {
          opacity: 1;
          transform: scaleX(1);
        }
      }
    }
  }
}

.energy-rental-dropdown {
  .nav-link::after {
    right: auto;
    left: 50%;
    width: 56px;
    transform: translateX(-50%) scaleX(0.35);
  }

  &:hover,
  &.is-active {
    .nav-link::after {
      transform: translateX(-50%) scaleX(1) !important;
    }
  }
}

:deep(.el-dropdown) {
  color: inherit;

  .el-dropdown__popper {
    padding: 0 2px;
  }
}

:deep(.el-tooltip__trigger:focus),
:deep(.el-tooltip__trigger:focus-visible),
:deep(.el-dropdown-link:focus) {
  outline: none !important;
}

.right-section {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 10px;

  .header-action,
  .info-wrap {
    width: 34px;
    height: 34px;
    min-width: 34px;
    padding: 0;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.9));
    border-radius: var(--theme-radius-sm, 6px);
    background: rgba(255, 255, 255, 0.9);
    box-shadow: var(--theme-shadow-xs, 0 1px 2px rgba(15, 23, 42, 0.04));
    color: var(--theme-primary-blue, #165dff);
    font: inherit;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

    &:hover {
      background: #f8fafc;
      border-color: rgba(22, 93, 255, 0.4);
      transform: translateY(-1px);
    }

    &:active {
      transform: scale(0.96);
    }
  }

  .header-action.is-menu {
    border-radius: var(--theme-radius-sm, 6px);
    background: var(--theme-primary-blue, #165dff);
    border-color: var(--theme-primary-blue, #165dff);
    box-shadow: 0 2px 8px rgba(22, 93, 255, 0.25);

    &:hover {
      background: #0f5de7;
      border-color: #0f5de7;
      transform: translateY(-1px);
    }

    &:active {
      transform: scale(0.96);
    }
  }

  .action-icon {
    width: 18px;
    height: 18px;
    display: block;
    object-fit: contain;
    pointer-events: none;
  }

  .menu-icon {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 16px;
    height: 11px;

    span {
      display: block;
      height: 2px;
      border-radius: 1px;
      background: #fff;
    }
  }
}

/* 蓝底余额区 + 独立白色充值按钮（克制利落的 6px 微圆角） */
.balance-recharge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px;
  padding: 2px 4px 2px 10px;
  border: 1px solid rgba(22, 93, 255, 0.2);
  border-radius: var(--theme-radius-md, 6px);
  background: linear-gradient(135deg, #165dff 0%, #0052d9 100%);
  box-shadow: 0 2px 10px rgba(22, 93, 255, 0.25);
  color: #fff;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

  &:hover {
    box-shadow: 0 4px 14px rgba(22, 93, 255, 0.35);
    transform: translateY(-1px);

    .recharge-text {
      background: #ffffff;
      color: #0052d9;
    }
  }

  &:active {
    transform: scale(0.98);
  }

  .balance-token-icon {
    width: 15px;
    height: 15px;
    flex: 0 0 15px;
  }

  .balance-amount {
    color: #fff;
    font-variant-numeric: tabular-nums;
  }

  .recharge-text {
    min-width: 48px;
    height: 24px;
    padding: 0 10px;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--theme-radius-sm, 4px);
    background: #ffffff;
    color: #165dff;
    font-size: 11px;
    font-weight: 700;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
}

.user-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.88;
  }

  &:active,
  &:focus {
    outline: none;
  }

  .user-avatar {
    width: 32px;
    height: 32px;
    box-sizing: border-box;
    object-fit: cover;
    border-radius: 50%;
    background: #e8f1ff;
  }
}

.no-login {
  display: flex;
  align-items: center;
}

.login-btn {
  height: 32px;
  padding: 0 18px;
  border: 0;
  border-radius: 8px;
  background: #1766f5;
  color: #fff;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background: #0f5de7;
    color: #fff;
  }
}

.collapse-container {
  max-height: calc(100vh - var(--layout-header-height, 50px));
  position: fixed;
  top: var(--layout-header-height, 50px);
  left: 0;
  right: 0;
  z-index: 999;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--theme-card-border, rgba(226, 232, 240, 0.8));
  border-radius: 0 0 var(--theme-radius-lg, 8px) var(--theme-radius-lg, 8px);
  box-shadow: var(--theme-shadow-xl, 0 20px 30px -10px rgba(15, 23, 42, 0.15));
  overflow: hidden;
  overflow-y: auto;
  animation: drawer-fade-slide 0.22s cubic-bezier(0.16, 1, 0.3, 1);

  @keyframes drawer-fade-slide {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* 美化滚动条 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(15, 23, 42, 0.1);
    border-radius: 2px;

    &:hover {
      background: rgba(15, 23, 42, 0.2);
    }
  }

  :deep(.el-collapse) {
    padding: 12px 14px 18px;
    border-radius: 0 0 var(--theme-radius-lg, 8px) var(--theme-radius-lg, 8px);
    border: none;
    background: transparent;
  }

  :deep(.el-collapse-item__arrow) {
    transform: rotateZ(90deg);
    transition: transform 0.25s ease;

    &.is-active {
      transform: rotateZ(-90deg);
    }
  }

  :deep(.el-collapse-item__header) {
    height: 48px;
    line-height: 48px;
    border-radius: var(--theme-radius-md, 8px);
    border: 1px solid transparent;
    background: rgba(15, 23, 42, 0.03);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    margin-bottom: 6px;

    &:hover {
      background: #ffffff;
      border-color: rgba(226, 232, 240, 0.9);
      box-shadow: var(--theme-shadow-xs);
    }

    &:active {
      transform: scale(0.985);
    }
  }

  :deep(.el-collapse-item__content) {
    padding-bottom: 6px;
    padding-top: 2px;
  }

  :deep(.el-collapse-item) {
    border: none;
    background: transparent;

    &:not(:last-child) {
      margin-bottom: 6px;
    }

    &.is-active {
      .el-collapse-item__header {
        background: #ffffff;
        border-color: rgba(226, 232, 240, 0.9);
        box-shadow: var(--theme-shadow-xs);
      }
    }

    &.route-active {
      .el-collapse-item__header {
        background: rgba(22, 93, 255, 0.06);
        border-color: rgba(22, 93, 255, 0.25);
      }

      .el-collapse-item__title {
        color: var(--theme-primary-blue, #165dff);
        font-weight: 700;
      }
    }

    &.is-disabled {
      .el-icon {
        display: none;
      }

      .el-collapse-item__header {
        cursor: pointer;
        
        &:active {
          background: rgba(22, 93, 255, 0.06);
        }
      }
    }
  }

  :deep(.el-collapse-item__title) {
    font-size: 14px;
    font-weight: 600;
    padding: 0 14px;
    color: var(--theme-text-gray);
  }

  :deep(.el-collapse-item__wrap) {
    border: none;
    background: transparent;
  }

  .menu-wrap {
    color: var(--theme-text-gray);
    padding: 0 6px;

    .menu-item {
      padding: 0 16px;
      height: 42px;
      display: flex;
      align-items: center;
      font-size: 13px;
      font-weight: 500;
      border-radius: var(--theme-radius-sm, 6px);
      cursor: pointer;
      margin: 3px 0;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 4px;
        background: var(--theme-primary-blue, #165dff);
        border-radius: 50%;
        opacity: 0;
        transition: all 0.2s ease;
      }

      &:hover {
        background: rgba(15, 23, 42, 0.04);
        color: #0f172a;
      }

      &:active {
        transform: scale(0.985);
      }

      &.is-active {
        color: var(--theme-primary-blue, #165dff);
        background: rgba(22, 93, 255, 0.08);
        font-weight: 700;
        padding-left: 20px;

        &::before {
          opacity: 1;
        }
      }
    }
  }
}

@media (max-width: 890px) {
  .navbar {
    height: var(--layout-header-height, 50px);
    min-height: var(--layout-header-height, 50px);
    padding: 0 10px;
  }

  .navbar-container {
    gap: 6px;
  }

  .logo-section {
    min-width: 0;
    flex: 0 1 auto;
    gap: 6px;
  }

  .logo-mark {
    width: 24px;
    height: 24px;
  }

  .logo-wordmark {
    font-size: 14px;
  }
  
  .nav-links {
    display: none;
  }

  .right-section {
    gap: 5px;
    flex: 1 1 auto;
    min-width: 0;
    justify-content: flex-end;

    .header-action,
    .info-wrap {
      min-width: 32px;
      width: 32px;
      height: 32px;
      flex: 0 0 auto;
    }

    .action-icon {
      width: 18px;
      height: 18px;
    }
  }

  .balance-recharge {
    height: 32px;
    padding: 2px 4px 2px 6px;
    gap: 4px;
    font-size: 11px;

    .balance-token-icon {
      width: 14px;
      height: 14px;
      flex-basis: 14px;
    }

    .balance-amount {
      max-width: 64px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .recharge-text {
      min-width: 36px;
      height: 24px;
      padding: 0 6px;
      font-size: 10px;
    }
  }

  .user-icon {
    .user-avatar {
      width: 32px;
      height: 32px;
    }
  }

  .login-btn {
    height: 32px;
    padding: 0 16px;
    font-size: 14px;
  }
  
  .collapse-container {
    top: var(--layout-header-height, 50px);
    max-height: calc(100vh - var(--layout-header-height, 50px));
  }
}

@media (max-width: 768px) {
  .right-section {
    gap: 4px;

    .header-action,
    .info-wrap {
      min-width: 28px;
      width: 28px;
      height: 28px;
    }

    .action-icon {
      width: 16px;
      height: 16px;
    }

    .menu-icon {
      width: 14px;
      height: 10px;
    }
  }

  .login-btn {
    height: 28px;
    padding: 0 12px;
    font-size: 13px;
  }

  .balance-recharge {
    height: 28px;
    padding: 1px 3px 1px 5px;
    gap: 3px;
    min-width: 0;
    flex: 0 1 auto;

    .balance-token-icon {
      width: 12px;
      height: 12px;
      flex-basis: 12px;
    }

    .recharge-text {
      min-width: 32px;
      height: 22px;
      padding: 0 5px;
      font-size: 10px;
    }
  }

  .user-icon .user-avatar {
    width: 28px;
    height: 28px;
  }
}

/* 适配 300px 超小屏幕 */
@media (max-width: 360px) {
  .navbar {
    height: var(--layout-header-height, 50px);
    min-height: var(--layout-header-height, 50px);
    padding: 0 6px;
  }

  .navbar-container {
    gap: 4px;
  }

  .logo-section {
    min-width: 92px;
    gap: 5px;
  }

  .logo-mark {
    width: 22px;
    height: 22px;
  }

  .logo-wordmark {
    font-size: 13px;
  }

  .right-section {
    gap: 3px;

    .header-action,
    .info-wrap {
      min-width: 26px;
      width: 26px;
      height: 26px;
    }

    .action-icon {
      width: 14px;
      height: 14px;
    }
  }

  .balance-recharge {
    height: 28px;
    padding: 2px 3px 2px 5px;
    gap: 3px;
    font-size: 10px;

    .balance-token-icon {
      width: 13px;
      height: 13px;
      flex-basis: 13px;
    }

    .balance-amount {
      max-width: 48px;
    }

    .recharge-text {
      min-width: 34px;
      height: 22px;
      padding: 0 5px;
      font-size: 9px;
    }
  }

  .user-icon {
    .user-avatar {
      width: 26px;
      height: 26px;
    }
  }

  .login-btn {
    height: 26px;
    padding: 0 10px;
    font-size: 12px;
  }
  
  .collapse-container {
    top: var(--layout-header-height, 50px);
    max-height: calc(100vh - var(--layout-header-height, 50px));

    :deep(.el-collapse) {
      padding: 8px 10px 10px;
    }

    :deep(.el-collapse-item__header) {
      height: 40px;
      line-height: 40px;
      border-radius: 5px;
      margin-bottom: 2px;
    }

    :deep(.el-collapse-item__title) {
      font-size: 13px;
      padding: 0 10px;
    }

    :deep(.el-collapse-item__content) {
      padding-bottom: 4px;
      padding-top: 2px;
    }

    :deep(.el-collapse-item) {
      &:not(:last-child) {
        margin-bottom: 4px;
      }
    }

    .menu-wrap {
      padding: 0 4px;

      .menu-item {
        padding: 0 10px;
        height: 36px;
        font-size: 12px;
        border-radius: 4px;

        &::before {
          left: 5px;
          width: 2.5px;
          height: 2.5px;
        }
      }
    }
  }
}
</style>

<!-- teleported 下拉挂载到 body，需全局样式 -->
<style lang="scss">
.energy-rental-popper-unique,
.faq-popper-unique {
  z-index: 2001 !important;

  .el-dropdown-menu {
    min-width: 104px !important;
    padding: 6px !important;
    border: 1px solid #e8edf5 !important;
    border-radius: 8px !important;
    box-shadow: 0 10px 28px rgba(24, 45, 78, 0.12) !important;
  }

  .el-dropdown-menu__item {
    min-height: 32px;
    margin: 0;
    padding: 0 12px !important;
    border-radius: 6px !important;
    color: #475467 !important;
    font-size: 13px !important;
    line-height: 32px !important;
    justify-content: center;
    transition: background-color 0.15s ease, color 0.15s ease;

    &:hover {
      background: #f0f5ff !important;
      color: #1766f5 !important;
    }

    &.is-active {
      color: #fff !important;
      background: #1766f5 !important;
      font-weight: 600;
    }
  }
}

/* 能量租赁菜单的当前路由只保留文字状态，避免整项蓝底抢占导航下划线 */
.energy-rental-popper-unique .el-dropdown-menu__item.is-active {
  color: #475467 !important;
  background: transparent !important;
  font-weight: 400 !important;

  &:hover {
    color: #1766f5 !important;
    background: #f0f5ff !important;
  }
}

.lang-popper,
.user-popper {
  .el-dropdown-menu {
    border: 1px solid #e8edf5 !important;
    border-radius: 8px !important;
    box-shadow: 0 10px 28px rgba(24, 45, 78, 0.12) !important;
  }

  .el-dropdown-menu__item {
    color: #475467 !important;

    &:hover,
    &.is-active {
      background: #f0f5ff !important;
      color: #1766f5 !important;
    }
  }
}
</style>
