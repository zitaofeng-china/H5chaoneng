# 环境配置说明

## 📋 环境文件说明

项目支持多环境配置，通过不同的 `.env` 文件来管理各环境的配置。

### 环境文件列表

```
.env                    # 默认配置（开发环境）
.env.development        # 开发环境配置
.env.test              # 测试环境配置
.env.staging           # 预发布环境配置
.env.production        # 生产环境配置
.env.local.example     # 本地配置示例
.env.local             # 本地配置（不提交到 Git）
```

### 文件优先级

```
.env.local > .env.[mode] > .env
```

例如，在测试环境下：
```
.env.local > .env.test > .env
```

## 🚀 启动命令

### 开发环境

```bash
# 启动开发服务器（默认）
pnpm dev

# 或明确指定开发环境
pnpm dev:development
```

### 测试环境

```bash
# 启动测试环境
pnpm dev:test

# 构建测试环境
pnpm build:test

# 预览测试环境构建
pnpm preview:test
```

### 预发布环境

```bash
# 启动预发布环境
pnpm dev:staging

# 构建预发布环境
pnpm build:staging

# 预览预发布环境构建
pnpm preview:staging
```

### 生产环境

```bash
# 构建生产环境
pnpm build:prod

# 预览生产环境构建
pnpm preview:prod
```

## 📝 配置项说明

### 基础配置

| 配置项 | 说明 | 示例 |
|--------|------|------|
| `NODE_ENV` | Node 环境 | `development` / `test` / `staging` / `production` |
| `VITE_APP_TITLE` | 应用标题 | `能量租赁平台` |
| `VITE_API_BASE_URL` | API 基础 URL | `http://localhost:3000/api` |
| `VITE_PORT` | 应用端口 | `8080` |
| `VITE_OPEN` | 是否自动打开浏览器 | `true` / `false` |

### 功能开关

| 配置项 | 说明 | 开发 | 测试 | 预发布 | 生产 |
|--------|------|------|------|--------|------|
| `VITE_USE_MOCK` | 是否使用 Mock 数据 | ❌ | ❌ | ❌ | ❌ |
| `VITE_ENABLE_REQUEST_LOG` | 是否开启请求日志 | ✅ | ✅ | ✅ | ❌ |
| `VITE_ENABLE_RESPONSE_LOG` | 是否开启响应日志 | ✅ | ✅ | ✅ | ❌ |
| `VITE_ENABLE_ERROR_REPORT` | 是否开启错误上报 | ❌ | ✅ | ✅ | ✅ |
| `VITE_ENABLE_PERFORMANCE` | 是否开启性能监控 | ❌ | ✅ | ✅ | ✅ |
| `VITE_SHOW_DEBUG` | 是否显示调试信息 | ✅ | ✅ | ✅ | ❌ |

### 高级配置

| 配置项 | 说明 | 示例 |
|--------|------|------|
| `VITE_ERROR_REPORT_URL` | 错误上报地址 | `https://error.example.com/report` |
| `VITE_PERFORMANCE_URL` | 性能监控地址 | `https://performance.example.com/report` |
| `VITE_HTTPS` | 是否开启 HTTPS | `true` / `false` |
| `VITE_USE_CDN` | 是否使用 CDN | `true` / `false` |
| `VITE_CDN_URL` | CDN 地址 | `https://cdn.example.com` |
| `VITE_USE_GZIP` | 是否开启 Gzip 压缩 | `true` / `false` |
| `VITE_SOURCEMAP` | 是否生成 sourcemap | `true` / `false` |

## 🔧 使用方法

### 1. 在代码中使用环境变量

```typescript
// 获取 API 基础 URL
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

// 获取应用标题
const appTitle = import.meta.env.VITE_APP_TITLE

// 判断是否为生产环境
const isProd = import.meta.env.PROD

// 判断是否为开发环境
const isDev = import.meta.env.DEV

// 获取当前模式
const mode = import.meta.env.MODE
```

### 2. 在 vite.config.ts 中使用

```typescript
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())

  return {
    server: {
      port: Number(env.VITE_PORT) || 8080,
      open: env.VITE_OPEN === 'true',
      https: env.VITE_HTTPS === 'true',
    },
    // ...
  }
})
```

### 3. 类型声明

在 `env.d.ts` 中添加类型声明：

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_PORT: string
  readonly VITE_OPEN: string
  readonly VITE_USE_MOCK: string
  readonly VITE_ENABLE_REQUEST_LOG: string
  readonly VITE_ENABLE_RESPONSE_LOG: string
  readonly VITE_ENABLE_ERROR_REPORT: string
  readonly VITE_ERROR_REPORT_URL: string
  readonly VITE_ENABLE_PERFORMANCE: string
  readonly VITE_PERFORMANCE_URL: string
  readonly VITE_HTTPS: string
  readonly VITE_USE_CDN: string
  readonly VITE_CDN_URL: string
  readonly VITE_USE_GZIP: string
  readonly VITE_SOURCEMAP: string
  readonly VITE_SHOW_DEBUG: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## 🔐 本地配置

### 创建本地配置文件

```bash
# 复制示例文件
cp .env.local.example .env.local

# 编辑本地配置
vim .env.local
```

### 本地配置示例

```env
# .env.local
VITE_API_BASE_URL=http://192.168.1.100:3000/api
VITE_PORT=8888
VITE_OPEN=true
```

**注意**：`.env.local` 文件不会被 Git 跟踪，可以包含敏感信息。

## 📊 环境对比

| 特性 | 开发环境 | 测试环境 | 预发布环境 | 生产环境 |
|------|----------|----------|------------|----------|
| API 地址 | localhost | test-api | staging-api | api |
| 请求日志 | ✅ | ✅ | ✅ | ❌ |
| 响应日志 | ✅ | ✅ | ✅ | ❌ |
| 错误上报 | ❌ | ✅ | ✅ | ✅ |
| 性能监控 | ❌ | ✅ | ✅ | ✅ |
| Sourcemap | ✅ | ✅ | ✅ | ❌ |
| CDN | ❌ | ❌ | ❌ | ✅ |
| Gzip | ❌ | ❌ | ❌ | ✅ |
| 调试信息 | ✅ | ✅ | ✅ | ❌ |

## 🚨 注意事项

### 1. 环境变量命名规范

- ✅ 必须以 `VITE_` 开头才能在客户端代码中访问
- ✅ 使用大写字母和下划线
- ❌ 不要在环境变量中存储敏感信息（如密钥、密码）

### 2. Git 提交规范

**应该提交**：
- ✅ `.env`
- ✅ `.env.development`
- ✅ `.env.test`
- ✅ `.env.staging`
- ✅ `.env.production`
- ✅ `.env.local.example`

**不应该提交**：
- ❌ `.env.local`
- ❌ `.env.*.local`

### 3. 环境切换

切换环境后需要重启开发服务器：

```bash
# 停止当前服务器（Ctrl + C）
# 启动新环境
pnpm dev:test
```

### 4. 构建产物

不同环境的构建产物会包含对应的环境变量：

```bash
# 测试环境构建
pnpm build:test
# 产物包含 .env.test 的配置

# 生产环境构建
pnpm build:prod
# 产物包含 .env.production 的配置
```

## 🔍 调试技巧

### 查看当前环境变量

```typescript
// 在浏览器控制台执行
console.log('Environment:', import.meta.env)
console.log('Mode:', import.meta.env.MODE)
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
```

### 条件编译

```typescript
if (import.meta.env.DEV) {
  console.log('开发环境')
}

if (import.meta.env.PROD) {
  console.log('生产环境')
}

if (import.meta.env.MODE === 'test') {
  console.log('测试环境')
}
```

## 📚 相关文档

- [Vite 环境变量文档](https://vitejs.dev/guide/env-and-mode.html)
- [项目配置说明](./vite.config.ts)
- [API 配置说明](./src/api/config.ts)
