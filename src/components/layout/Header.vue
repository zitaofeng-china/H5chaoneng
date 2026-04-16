<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="logo-section" @click.stop="handleToRouter('/')">
        <div class="logo-icon">
          <img src="@/assets/images/logo.png" alt="Logo" />
        </div>
        <div class="m-logo-icon">
          <img src="@/assets/images/m-logo.png" alt="Logo" />
        </div>
      </div>

      <div class="nav-links">
        <div class="dropdown-popper-box" :class="{ 'is-active': isActiveHome }">
          <el-dropdown :teleported="false">
            <div class="nav-link">
              <div class="nav-link-text">
                {{ $t('nav.energyRental') }}
              </div>
              <el-icon class="el-icon--right"><IEpArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  :class="{ 'is-active': isActive('/') }"
                  @click="handleToRouter('/')"
                >
                  {{ $t('nav.quickRent') }}
                </el-dropdown-item>
                <el-dropdown-item
                  :class="{ 'is-active': isActive('/lease-time') }"
                  @click="handleToRouter('/lease-time')"
                >
                  {{ $t('nav.rentByTime') }}
                </el-dropdown-item>
                <el-dropdown-item
                  :class="{ 'is-active': isActive('/lease-count') }"
                  @click="handleToRouter('/lease-count')"
                >
                  {{ $t('nav.rentByCount') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <a
          href="#"
          class="nav-link"
          :class="{ 'is-active': isActive('/contract') }"
          @click="handleToRouter('/contract')"
        >
          {{ $t('nav.contractFlash') }}
        </a>
        <a
          href="#"
          class="nav-link"
          :class="{ 'is-active': isActive('/hosting') }"
          @click="handleToRouter('/hosting')"
        >
          {{ $t('nav.smartHosting') }}
        </a>
        <a
          href="#"
          class="nav-link"
          :class="{ 'is-active': isActive('/activation') }"
          @click="handleToRouter('/activation')"
        >
          {{ $t('nav.batchActivation') }}
        </a>

        <div class="dropdown-popper-box">
          <el-dropdown :teleported="false">
            <div class="nav-link">
              <div class="nav-link-text">{{ $t('nav.faq') }}</div>
              <el-icon class="el-icon--right"><IEpArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
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
                  @click.stop="handleOpenToTelegram('GasVipBot')"
                >
                  {{ $t('nav.contactUs') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="right-section">
        <div class="info-wrap">
          <SvgIcon
            name="header-tg"
            width="24"
            height="24"
            @click="handleOpenToTelegram('GasVipBot')"
          />
        </div>
        <div class="dropdown-popper-box">
          <el-dropdown :teleported="false" @command="handleLanguageChange">
            <div class="info-wrap">
              <SvgIcon name="header-lang" class="icon-svg" width="24" height="24" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
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

        <div class="balance-display">
          <div class="balance-info">
            <SvgIcon name="header-USDT" width="24" height="24" />
            <div class="balance-amount">{{ trxBalance }}</div>
          </div>
          <div class="recharge-btn" @click="handleRechange">
            <div class="text">{{ $t('common.recharge') }}</div>
          </div>
        </div>

        <div class="dropdown-popper-box" v-if="isLogin">
          <el-dropdown :teleported="false">
            <div class="user-icon">
              <img :src="Avatar" alt="" class="user-avatar" />
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click.stop="handleModifyPassword">
                  {{ $t('revisePassword.title') }}
                </el-dropdown-item>
                <el-dropdown-item @click.stop="handleLogout">
                  {{ $t('login.logout') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
        <div class="no-login" v-else>
          <div class="login-btn btn" @click="handleLogin">
            {{ $t('login.title') }}
          </div>
          /
          <div class="register-btn btn" @click="handleRegister">
            {{ $t('register.title') }}
          </div>
        </div>
        <div class="info-wrap" ref="menuBtn" v-if="isMobile()" @click="handleMenu('menu')">
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
        :class="{ 'is-active': isActive('') }"
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
            class="menu-item"
            :class="{ 'is-active': isActive('/lease-time') }"
            @click="handleToRouter('/lease-time')"
          >
            {{ $t('nav.rentByTime') }}
          </div>
          <div
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
        :class="{ 'is-active': isActive('/contract') }"
        @click="handleToRouter('/contract')"
      >
      </el-collapse-item>
      <el-collapse-item
        :title="$t('nav.smartHosting')"
        name="3"
        disabled
        :class="{ 'is-active': isActive('/hosting') }"
        @click="handleToRouter('/hosting')"
      >
      </el-collapse-item>
      <el-collapse-item
        :title="$t('nav.batchActivation')"
        name="4"
        disabled
        :class="{ 'is-active': isActive('/activation') }"
        @click="handleToRouter('/activation')"
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
            @click.stop="handleOpenToTelegram('GasVipBot')"
          >
            {{ $t('nav.contactUs') }}
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { type CollapseModelValue, ClickOutside as vClickOutside } from 'element-plus'
import Avatar from '@/assets/icons/header/avatar.svg'
import { useUserStore } from '@/stores/useUserStore'
import { useLangStore } from '@/stores/useLangStore'
import { handleOpenToTelegram, isMobile } from '@/utils'
import { setLocale } from '@/lang'
import type { Locale } from '@/lang/types'
import { getSite } from '@/utils/site'

defineOptions({
  name: 'LayoutHeader',
})

const instance = getCurrentInstance()
const proxy = instance?.proxy as any // 使用 any 避免类型检查问题

const localLang = ref(useLangStore().currentLocale)
const activeNames = ref(['1'])
const isMenu = ref(false)
const menuBtn = ref(null)

const lang = reactive({
  en: 'English',
  'zh-CN': '中文',
  ja: '日本語',
  ko: '한국어',
  ru: 'Русский',
  ar: 'العربية',
  es: 'Español',
  tr: 'Türkçe',
  'zh-TW': '繁體中文',
})

const isActiveHome = computed(() => {
  const site = getSite()
  const homePaths = [`/${site}/`, `/${site}/lease-time`, `/${site}/lease-count`]
  return homePaths.includes(route.path as string)
})

const userStore = useUserStore()
const isLogin = computed(() => userStore.isLogin)

// 获取用户 TRX 余额
const trxBalance = computed(() => {
  if (!userStore.userInfo) return '0'
  return userStore.userInfo.trx_balance || '0'
})

const route = useRoute()
const router = useRouter()
const { logout } = userStore

const isActive = (path: string) => {
  const site = getSite()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const fullPath = `/${site}${normalizedPath}`
  return route.path === fullPath
}

const isHashActive = (hash: string) => {
  return route.hash === hash
}

const handleToRouter = (path: string, hash?: string) => {
  const site = getSite()
  
  // 构建完整路径：/:site/path
  // 确保 path 以 / 开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const fullPath = `/${site}${normalizedPath}`
  
  console.log('[Header] 跳转路由:', { site, path, normalizedPath, fullPath, hash })
  
  router.push({ path: fullPath, hash })

  if (isMobile()) {
    handleMenu('router')
  }
}

const handleLanguageChange = (local: Locale) => {
  localLang.value = local
  console.log(local)
  setLocale(local)

  // TODO 处理阿拉伯语言时，页面版式
  // if (local.startsWith('ar')) {
  //   document.documentElement.setAttribute('dir', 'rtl')
  // } else {
  //   document.documentElement.removeAttribute('dir')
  // }
}

const handleLogin = () => {
  proxy?.$loginPopup?.open()
}

const handleRegister = () => {
  proxy?.$registerPopup?.open()
}

const handleRechange = () => {
  proxy?.$rechargePopup?.open()
}

const handleModifyPassword = () => {
  proxy?.$revisePasswordPopup?.open()
}

const handleLogout = () => {
  logout()
}

const handleChange = (val: CollapseModelValue) => {
  console.log(val)
}

const handleCollapseDestroy = () => {
  isMenu.value = false
  activeNames.value = ['1']
}

const handleMenu = (type: 'menu' | 'router' = 'menu') => {
  isMenu.value = type !== 'menu' ? false : !isMenu.value
}
</script>

<style lang="scss" scoped>
.navbar {
  background: var(--theme-bg);
  padding: 0 20px;
  height: 66px;
  display: flex;
  align-items: center;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 1000;
}

.navbar-container {
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.logo-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.m-logo-icon {
  display: none;
}

.logo-text {
  color: #ffd700;
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 1px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 30px;

  .nav-link {
    color: #fff;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: color 0.3s ease;
    padding: 5px 0;

    &:active,
    &:focus {
      outline: none;
    }

    &.is-active {
      position: relative;
      color: var(--theme-text-green);

      .el-icon--right {
        color: var(--theme-text-green);
      }

      &::after {
        display: inline;
        content: '';
        position: absolute;
        bottom: -3px;
        left: 0;
        height: 2px;
        width: 100%;
        background-color: var(--theme-text-green);
        transition: width 0.3s ease;
      }
      color: var(--theme-text-green);
    }
  }

  .dropdown-popper-box {
    position: relative;

    .user-avatar {
      width: 40px;
      height: 40px;
      overflow: hidden;
      border-radius: 50%;
    }

    &:hover,
    &.is-active {
      color: var(--theme-text-green);

      .el-icon--right {
        color: var(--theme-text-green);
      }

      .nav-link-text {
        position: relative;

        &::after {
          display: inline;
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          height: 2px;
          width: 100%;
          background-color: var(--theme-text-green);
          transition: width 0.3s ease;
        }
        color: var(--theme-text-green);
      }
    }
  }
}

:deep(.el-dropdown) {
  color: inherit;

  .el-dropdown__popper {
    padding: 0 2px;
  }
}

:deep(.el-dropdown-menu) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

:deep(.el-dropdown-menu__item) {
  transition: all 0.3s ease !important;
  justify-content: center;

  &:hover,
  &.is-active {
    background: var(--theme-bg-dark) !important;
    color: var(--theme-text-gray) !important;
    border-radius: 2px;
  }
}

:deep(.el-dropdown-menu__item--divided) {
  border-top-color: #444 !important;
}

:deep(.el-popper.is-dark .el-popper__arrow::before) {
  background-color: #2a2a3e !important;
  border: 1px solid #444 !important;
}

:deep(.el-tooltip__trigger:focus),
:deep(.el-tooltip__trigger:focus-visible),
:deep(.el-dropdown-link:focus) {
  outline: none !important;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 12px;

  .info-wrap {
    min-width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--theme-bg-gray);
    border-radius: 4px;
    cursor: pointer;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 0.8;
    }
  }
}

.balance-display {
  padding: 0 5px;
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--theme-bg-gray);
  border-radius: 4px;
  color: var(--theme-text-white);
  font-size: 14px;

  .balance-info {
    padding: 0 20px 0 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}

.recharge-btn {
  padding: 0 5px;
  min-width: 70px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--theme-bg-blue);
  border-radius: 4px;
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
}

.user-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.3s ease;

  &:hover {
    opacity: 0.7;
  }

  &:active,
  &:focus {
    outline: none;
  }
}

.no-login {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--theme-text-white);

  .btn {
    cursor: pointer;

    &:hover {
      color: var(--theme-text-green);
    }
  }
}

.collapse-container {
  max-height: calc(100vh - 44px);
  position: fixed;
  top: 44px;
  left: 0;
  right: 0;
  z-index: 99;
  background: var(--theme-bg-white);
  border-radius: 0 0 15px 15px;
  box-shadow: 0px 4px 16px 0px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  overflow-y: auto;

  /* 美化滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.02);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.15);
    }
  }

  :deep(.el-collapse) {
    padding: 12px 16px 16px;
    border-radius: 0 0 15px 15px;
  }

  :deep(.el-collapse-item__arrow) {
    transform: rotateZ(90deg);
    transition: transform 0.3s ease;

    &.is-active {
      transform: rotateZ(-90deg);
    }
  }

  :deep(.el-collapse-item__header) {
    height: 48px;
    line-height: 48px;
    border-radius: 8px;
    border-bottom-color: transparent;
    background: rgba(2, 15, 45, 0.04);
    transition: all 0.3s ease;
    margin-bottom: 2px;

    &:hover {
      background: rgba(2, 15, 45, 0.06);
    }
  }

  :deep(.el-collapse-item__content) {
    padding-bottom: 8px;
    padding-top: 4px;
  }

  :deep(.el-collapse-item) {
    &:not(:last-child) {
      margin-bottom: 8px;
    }

    &.is-active {
      .el-collapse-item__header {
        background: rgba(54, 211, 153, 0.08);
      }

      .el-collapse-item__title {
        color: var(--theme-text-green);
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
    font-size: 15px;
    font-weight: 600;
    padding: 0 16px;
    color: var(--theme-text-gray);
  }

  :deep(.el-collapse-item__wrap) {
    border: none;
  }

  .menu-wrap {
    color: var(--theme-text-gray);
    padding: 0 8px;

    .menu-item {
      padding: 0 16px;
      height: 44px;
      display: flex;
      align-items: center;
      font-size: 14px;
      font-weight: 500;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 8px;
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
        background: rgba(2, 15, 45, 0.03);
      }

      &:active {
        background: rgba(2, 15, 45, 0.06);
      }

      &.is-active {
        color: var(--theme-text-green);
        background: rgba(54, 211, 153, 0.08);
        font-weight: 600;

        &::before {
          opacity: 1;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .navbar {
    height: 44px;
    padding: 0 10px;
  }

  .no-login {
    gap: 3px;
  }
  .logo-icon {
    display: none;
  }

  .m-logo-icon {
    display: flex;
  }
  .nav-links {
    display: none;
  }

  .right-section {
    gap: 4px;
  }

  .right-section {
    .info-wrap {
      min-width: 32px;
      height: 32px;
    }
  }

  .balance-display {
    min-width: 32px;
    height: 32px;

    .balance-info {
      padding-left: 0;
      padding-right: 8px;
    }
  }

  .recharge-btn {
    min-width: auto;
    .text {
      max-width: 40px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }

  .no-login {
    .btn {
      max-width: 40px;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
    }
  }
}
</style>
