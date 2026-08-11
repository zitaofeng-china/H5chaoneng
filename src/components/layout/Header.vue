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
                  :class="{ 'is-active': isHashActive('#question') }"
                  @click.stop="handleToRouter('/', '#question')"
                >
                  {{ $t('nav.faq') }}
                </el-dropdown-item>
                <el-dropdown-item
                  :class="{ 'is-active': isHashActive('#feature') }"
                  @click.stop="handleToRouter('/', '#feature')"
                >
                  {{ $t('nav.features') }}
                </el-dropdown-item>
                <el-dropdown-item
                  :class="{ 'is-active': isHashActive('#howItWorks') }"
                  @click.stop="handleToRouter('/', '#howItWorks')"
                >
                  {{ $t('nav.howItWorks') }}
                </el-dropdown-item>
                <el-dropdown-item
                  :class="{ 'is-active': isHashActive('#fee') }"
                  @click.stop="handleToRouter('/', '#fee')"
                >
                  {{ $t('nav.fee') }}
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
          <SvgIcon name="header-tg" width="18" height="18" />
        </button>
        <div class="dropdown-popper-box lang-dropdown">
          <el-dropdown trigger="click" :teleported="true" popper-class="lang-popper" @command="handleLanguageChange">
            <div class="info-wrap">
              <SvgIcon name="header-lang" class="icon-svg" width="24" height="24" />
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
              <img :src="Avatar" alt="" class="user-avatar" />
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
        <div class="info-wrap" ref="menuBtn" v-if="isMobileView" @click="handleMenu('menu')">
          <div class="dropdown-popper-box">
            <SvgIcon name="menu" width="24" height="24" />
          </div>
        </div>
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
            :class="{ 'is-active': isHashActive('#question') }"
            @click.stop="handleToRouter('/', '#question')"
          >
            {{ $t('nav.faq') }}
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
            :class="{ 'is-active': isHashActive('#howItWorks') }"
            @click.stop="handleToRouter('/', '#howItWorks')"
          >
            {{ $t('nav.howItWorks') }}
          </div>
          <div
            class="menu-item"
            :class="{ 'is-active': isHashActive('#fee') }"
            @click.stop="handleToRouter('/', '#fee')"
          >
            {{ $t('nav.fee') }}
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
import Avatar from '@/assets/icons/header/avatar-01.svg'
import gasLogoMark from '@/assets/images/gas-logo-mark.png'
import { useHeaderNav } from './useHeaderNav'

defineOptions({
  name: 'LayoutHeader',
})

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
  background: #fff;
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
  border-bottom: 0;
  box-shadow: none;
  box-sizing: border-box;
}

.navbar-grid {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-color: #fff;
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

  .header-action {
    width: 34px;
    height: 34px;
    padding: 0;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid rgba(23, 102, 245, 0.65);
    border-radius: 8px;
    background: #fff;
    color: #1766f5;
    font: inherit;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;

    &:hover {
      background: #eef4ff;
      border-color: #1766f5;
    }

    .svg-icon {
      filter: brightness(0) saturate(100%) invert(28%) sepia(99%) saturate(3464%) hue-rotate(216deg)
        brightness(96%) contrast(104%);
    }
  }

  .info-wrap {
    min-width: 34px;
    width: 34px;
    height: 34px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    border: 1px solid rgba(23, 102, 245, 0.65);
    border-radius: 8px;
    color: #1766f5;
    font: inherit;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease;

    &:hover {
      background: #eef4ff;
      border-color: #1766f5;
    }

    .svg-icon {
      filter: brightness(0) saturate(100%) invert(28%) sepia(99%) saturate(3464%) hue-rotate(216deg)
        brightness(96%) contrast(104%);
    }
  }
}

/* 图 2：蓝底余额区 + 独立白色充值按钮 */
.balance-recharge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 28px;
  padding: 2px 4px 2px 7px;
  border: 1px solid #1766f5;
  border-radius: 4px;
  background: #1766f5;
  color: #fff;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    background: #0f5de7;
    box-shadow: 0 2px 8px rgba(23, 102, 245, 0.12);

    .recharge-text {
      background: #f5f8ff;
    }
  }

  .balance-token-icon {
    width: 14px;
    height: 14px;
    flex: 0 0 14px;
  }

  .balance-amount {
    color: #fff;
    font-variant-numeric: tabular-nums;
  }

  .recharge-text {
    min-width: 48px;
    height: 22px;
    padding: 0 8px;
    box-sizing: border-box;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 3px;
    background: #fff;
    color: #1766f5;
    font-size: 11px;
    font-weight: 600;
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
    width: 36px;
    height: 36px;
    box-sizing: border-box;
    object-fit: cover;
    border-radius: 50%;
    border: 2px solid #ff8a3d;
    box-shadow: 0 0 0 1px rgba(23, 102, 245, 0.2);
    background: #e8f1ff;
  }
}

.no-login {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #344054;

  .btn {
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    font-family: inherit;
    font-size: 12px;
    cursor: pointer;

    &:hover {
      color: #165dff;
    }
  }
}

.collapse-container {
  max-height: calc(100vh - var(--layout-header-height, 50px));
  position: fixed;
  top: var(--layout-header-height, 50px);
  left: 0;
  right: 0;
  z-index: 99;
  background: var(--theme-bg-white);
  border-radius: 0 0 12px 12px;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  overflow-y: auto;

  /* 美化滚动条 */
  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.02);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 2px;

    &:hover {
      background: rgba(0, 0, 0, 0.15);
    }
  }

  :deep(.el-collapse) {
    padding: 10px 14px 14px;
    border-radius: 0 0 12px 12px;
  }

  :deep(.el-collapse-item__arrow) {
    transform: rotateZ(90deg);
    transition: transform 0.3s ease;

    &.is-active {
      transform: rotateZ(-90deg);
    }
  }

  :deep(.el-collapse-item__header) {
    height: 44px;
    line-height: 44px;
    border-radius: 6px;
    border-bottom-color: transparent;
    background: rgba(2, 15, 45, 0.03);
    transition: all 0.3s ease;
    margin-bottom: 2px;

    &:hover {
      background: rgba(2, 15, 45, 0.05);
    }
  }

  :deep(.el-collapse-item__content) {
    padding-bottom: 6px;
    padding-top: 2px;
  }

  :deep(.el-collapse-item) {
    &:not(:last-child) {
      margin-bottom: 6px;
    }

    // Element Plus 自动添加的展开状态（不显示绿色）
    &.is-active {
      .el-collapse-item__header {
        background: rgba(2, 15, 45, 0.05);
      }
    }

    // 我们自定义的路由激活状态（显示绿色）
    &.route-active {
      .el-collapse-item__header {
        background: rgba(22, 93, 255, 0.08);
      }

      .el-collapse-item__title {
        color: #165dff;
      }
    }

    &.is-disabled {
      .el-icon {
        display: none;
      }

      .el-collapse-item__header {
        cursor: pointer;
        
        &:active {
          background: rgba(2, 15, 45, 0.08);
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
  }

  .menu-wrap {
    color: var(--theme-text-gray);
    padding: 0 6px;

    .menu-item {
      padding: 0 14px;
      height: 40px;
      display: flex;
      align-items: center;
      font-size: 13px;
      font-weight: 500;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 7px;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 3px;
        background: #165dff;
        border-radius: 50%;
        opacity: 0;
        transition: all 0.3s ease;
      }

      &:hover {
        background: rgba(2, 15, 45, 0.03);
      }

      &:active {
        background: rgba(2, 15, 45, 0.06);
      }

      &.is-active {
        color: #165dff;
        background: rgba(22, 93, 255, 0.08);
        font-weight: 600;

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

  .no-login {
    gap: 4px;
    font-size: 12px;
  }
  
  .logo-section {
    min-width: 108px;
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
    flex: 1;
    justify-content: flex-end;

    .info-wrap {
      min-width: 30px;
      width: 30px;
      height: 30px;
      box-sizing: border-box;
      
      svg {
        width: 19px;
        height: 19px;
      }
    }

    .header-action {
      width: 30px;
      height: 30px;
    }
  }

  .balance-recharge {
    height: 30px;
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
      min-width: 38px;
      height: 24px;
      padding: 0 6px;
      font-size: 10px;
    }
  }

  .user-icon {
    .user-avatar {
      width: 30px;
      height: 30px;
    }
  }

  .no-login {
    .btn {
      font-size: 12px;
      white-space: nowrap;
    }
  }
  
  .collapse-container {
    top: var(--layout-header-height, 50px);
    max-height: calc(100vh - var(--layout-header-height, 50px));
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

    .info-wrap {
      min-width: 30px;
      width: 30px;
      height: 30px;
      
      svg {
        width: 17px;
        height: 17px;
      }
    }

    .header-action {
      width: 30px;
      height: 30px;
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
      width: 28px;
      height: 28px;
    }
  }

  .no-login {
    gap: 3px;
    font-size: 11px;

    .btn {
      font-size: 11px;
    }
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
