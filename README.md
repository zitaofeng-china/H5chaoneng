# energy-h5

波场（TRON）**能量租赁平台 H5 端**。多站点代理分发，支持 Web 与 Telegram Mini App。

| 项 | 值 |
|----|-----|
| 技术栈 | Vue 3 + TypeScript + Vite + Element Plus + Pinia + vue-i18n |
| 包管理 | pnpm |
| Node | `^20.19.0` 或 `>=22.12.0` |
| 开发端口 | `8080` |

---

## 快速开始

```bash
pnpm install
pnpm dev
```

访问时必须带**站点码**（代理标识）：

```text
http://localhost:8080/1ExAgznu
```

站点校验只有两种结果：**存在** → 展示业务页；**不存在**（含无站点码、接口失败）→ `/404`。  
**校验在 `app.mount` 之前完成**；完成前仅显示等待页（`index.html` 静态 + `SiteWaiting`），通过后才挂载业务页。失败时直接渲染 404 组件，不用 `router-view` 匹配业务路由，避免闪屏。

### 常用命令

```bash
pnpm dev          # 开发
pnpm build        # 类型检查 + 生产构建 → dist/
pnpm build-only   # 仅构建（跳过类型检查）
pnpm preview      # 预览构建结果
pnpm type-check   # 类型检查
pnpm lint         # ESLint + oxlint
pnpm format       # 格式化 src/
pnpm test:unit    # 单元测试
```

---

## 路由与功能

| 路由 | 说明 |
|------|------|
| `/:site/` | 首页闪租（快速租能量） |
| `/:site/welfare` | 福利订单 |
| `/:site/lease-time` | 按时间租用 |
| `/:site/lease-count` | 按笔数租用 |
| `/:site/contract` | 合约闪兑（USDT ⇄ TRX） |
| `/:site/hosting` | 智能托管 |
| `/:site/activation` | 批量激活 |
| `/` | 占位；校验后无站点码则进 `/404` |
| `/404` | 站点不存在或未知路径 |

`:site` 为站点/代理标识。校验：存在 → 展示页面；不存在 → 404。校验未完成前整站空白门禁。

### 精简模式（Lite）

当配置了 `DEFAULT_SITE` 且 URL 中的 `site` 与之相等时进入精简模式（见 `src/utils/site.ts`）。未配置则不启用 Lite。

Lite 下隐藏：按时间/按笔数租用、智能托管、批量激活、登录入口等（Header 中 `isLite`）。

---

## 环境与运行时配置

| 文件 | 用途 |
|------|------|
| `.env.development` | 开发：端口、默认站点、日志开关；API 走 Vite 代理 |
| `.env.production` | 生产构建变量 |
| `public/config.js` | 部署后可改 `API_BASE_URL`、`DEFAULT_SITE`，无需重编 |

开发代理（`vite.config.ts`）将 `/v1` `/v2` `/v3` 转到后端。生产可用 Nginx 反代或 Netlify Functions（见 `netlify.toml`）。

部署细节：[DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 目录结构

```text
src/
├── api/                 # fetch 封装 + modules（auth/site/price/address/order/…）
├── assets/              # 图标、图片、全局样式
├── components/
│   ├── business/        # 跨页业务组件（如 WelfareOrder）
│   ├── layout/          # 头尾布局
│   └── …                # 通用 UI
├── constants/
├── hooks/               # 登录、下单、支付地址、TG 登录等
├── lang/                # 9 语种
├── pages/               # 路由页面
├── plugins/             # 全局弹窗（登录/注册/充值/用户信息…）
├── router/
├── stores/              # user / price / site / lang / common
├── utils/               # site、token、telegram、session…
├── App.vue
└── main.ts
```

---

## 核心 API（C 端）

业务成功码：`code === "000000"`。请求需带 Header `Site`；登录后带 Token。

| 模块 | 接口 |
|------|------|
| 认证 | `POST /v3/login`、`/register`、`/logout`、`/reset_password`、`/change_password` |
| 用户 | `GET/PUT /v3/user`、`GET/PUT /v3/key` |
| 站点 | `GET /v3/site` |
| 价格 | `GET /v3/price` |
| 地址 | `GET /v3/address?kind=`（2 充值 / 3 闪兑 / 4 闪租 / 5 按笔 / 6 福利 / 7 余额） |
| 托管 | `GET/POST/DELETE /v3/hosting` |
| 订单 | `POST /v3/order`、`POST /v3/deposit` |
| 汇率 | `/v3/exchange/rate`、`/v1/ticker/price` |

### Telegram 登录

前端：`POST /v3/login`，Header 增加 `InitData`（见 `src/hooks/useTelegramLogin.ts`）。

待办与历史约定说明：[TODO.md](./TODO.md)

---

## 状态与国际化

- **Stores：** `useUserStore`、`usePriceStore`、`useSiteStore`、`useLangStore`、`useCommonStore`
- **语言：** `src/lang/` — zh-CN、zh-TW、en、ja、ko、ru、ar、es、tr
- **使用：** `$t('key')` / `t('key')`

---

## 开发提示

1. 新增页面：`src/pages/` → `router/index.ts` → `components/layout/Header.vue` 导航（注意 Lite 显隐）。
2. 调用 API：`import { addressApi } from '@/api'`。
3. 地址接口返回可能是字符串或对象，需兼容：`typeof data === 'string' ? data : data.address`。
4. Code Inspector：Alt+Shift+Click（Windows）点页面跳源码。
5. 移动端菜单用 `route-active` 表示路由激活，避免与 Element Plus `is-active` 混淆。

---

## 相关文档

- [DEPLOYMENT.md](./DEPLOYMENT.md) — 部署与 `config.js`
- [TODO.md](./TODO.md) — 定制化完成项与 TG 登录说明
- 工作区说明见上级 [README.md](../README.md)；历史材料见 [../archive/](../archive/)
