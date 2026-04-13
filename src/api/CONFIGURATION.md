# API 配置说明文档

## 📋 目录

1. [配置文件说明](#配置文件说明)
2. [统一响应结构](#统一响应结构)
3. [错误处理机制](#错误处理机制)
4. [拦截器配置](#拦截器配置)
5. [使用示例](#使用示例)
6. [自定义配置](#自定义配置)

## 配置文件说明

### config.ts - 核心配置

```typescript
// API 基础配置
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
export const REQUEST_TIMEOUT = 30000 // 请求超时时间
export const RETRY_COUNT = 3 // 重试次数
export const RETRY_DELAY = 1000 // 重试延迟

// 状态码配置
export const STATUS_CODE = {
  SUCCESS: 200,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  // ...
}

// 业务状态码配置
export const BUSINESS_CODE = {
  SUCCESS: 200,
  TOKEN_EXPIRED: 401,
  PERMISSION_DENIED: 403,
  // ...
}
```

### 环境变量配置

在 `.env` 文件中配置：

```env
# 开发环境
VITE_API_BASE_URL=http://localhost:3000/api

# 生产环境
VITE_API_BASE_URL=https://api.example.com/api
```

## 统一响应结构

### 标准响应格式

```typescript
interface ApiResponse<T = any> {
  code: number // 状态码
  message: string // 提示信息
  data: T // 响应数据
}
```

### 成功响应示例

```json
{
  "code": 200,
  "message": "操作成功",
  "data": {
    "id": "123",
    "username": "user@example.com"
  }
}
```

### 错误响应示例

```json
{
  "code": 401,
  "message": "登录已过期，请重新登录",
  "data": null
}
```

### 自定义响应格式

如果后端返回的格式不同，可以在 `config.ts` 中配置：

```typescript
export const RESPONSE_CONFIG: ResponseConfig = {
  codeField: 'status', // 状态码字段名
  messageField: 'msg', // 消息字段名
  dataField: 'result', // 数据字段名
  successCode: [200, 0], // 成功状态码（支持多个）
}
```

## 错误处理机制

### 错误类型

```typescript
enum ErrorType {
  NETWORK = 'NETWORK', // 网络错误
  TIMEOUT = 'TIMEOUT', // 超时错误
  HTTP = 'HTTP', // HTTP 错误
  BUSINESS = 'BUSINESS', // 业务错误
  UNKNOWN = 'UNKNOWN', // 未知错误
}
```

### 错误处理流程

```
请求发起
  ↓
请求拦截器（添加 Token、请求头等）
  ↓
发送请求
  ↓
响应拦截器（处理响应数据）
  ↓
错误判断
  ├─ HTTP 错误 → handleHttpError()
  ├─ 业务错误 → handleBusinessError()
  ├─ 网络错误 → handleNetworkError()
  └─ 超时错误 → handleTimeoutError()
  ↓
错误提示（ElMessage）
  ↓
特殊处理
  ├─ Token 过期 → 跳转登录页
  └─ 权限不足 → 跳转 403 页面
```

### 错误消息配置

```typescript
export const ERROR_MESSAGE = {
  NETWORK_ERROR: 'network.error', // 使用 i18n key
  TIMEOUT_ERROR: 'network.timeout',
  SERVER_ERROR: 'server.error',
  TOKEN_EXPIRED: 'auth.tokenExpired',
  // ...
}

// 是否优先使用后端返回的错误消息
export const USE_BACKEND_ERROR_MESSAGE = true
```

**消息优先级**（当 `USE_BACKEND_ERROR_MESSAGE = true` 时）：
1. **后端返回的消息**（直接显示）
2. **翻译 key**（如果消息包含 `.` 且不是 URL，则尝试翻译）
3. **默认消息**（根据错误类型和错误码）

**示例**：

```typescript
// 后端返回
{
  code: 400,
  message: "用户名或密码错误",  // 直接显示这个消息
  data: null
}

// 后端返回翻译 key
{
  code: 400,
  message: "auth.invalidCredentials",  // 会翻译成对应语言
  data: null
}

// 后端没有返回消息
{
  code: 400,
  message: "",  // 使用默认消息
  data: null
}
```

### 忽略错误提示

某些接口不需要显示错误提示：

```typescript
export const IGNORE_ERROR_URLS: (string | RegExp)[] = [
  '/auth/verify-token', // 字符串匹配
  /\/check-status$/, // 正则匹配
]
```

## 拦截器配置

### 请求拦截器

自动处理：
- ✅ 添加 Authorization 头
- ✅ 添加自定义请求头
- ✅ GET 请求添加时间戳（防缓存）
- ✅ 打印请求日志（开发环境）

```typescript
export function requestInterceptor(url: string, config: RequestInit): RequestInit {
  // 添加 Token
  if (needsToken(url)) {
    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  // ...
}
```

### 响应拦截器

自动处理：
- ✅ 提取响应数据
- ✅ 显示成功提示（可配置）
- ✅ 打印响应日志（开发环境）
- ✅ 统一响应格式

```typescript
export function responseInterceptor<T>(
  response: ApiResponse<T>,
  url: string,
  method: string
): ApiResponse<T> {
  // 显示成功提示
  if (isSuccess && SHOW_SUCCESS_MESSAGE && shouldShowSuccess(url)) {
    ElMessage.success(message)
  }
  // ...
}
```

### Token 刷新拦截器

自动刷新 Token：

```typescript
export async function tokenRefreshInterceptor(response: ApiResponse): Promise<boolean> {
  if (response.code === 401) {
    // 调用刷新 Token 接口
    const newToken = await refreshToken()
    if (newToken) {
      // 保存新 Token
      localStorage.setItem('token', newToken)
      return true // 返回 true 表示需要重新请求
    }
  }
  return false
}
```

### 重试拦截器

自动重试失败的请求：

```typescript
export function retryInterceptor(
  error: Error,
  retryCount: number,
  maxRetries: number
): boolean {
  // 只重试网络错误和超时错误
  const shouldRetry =
    error.message.includes('Failed to fetch') || error.message.includes('timeout')

  return shouldRetry && retryCount < maxRetries
}
```

## 使用示例

### 基础用法

```typescript
import { authApi } from '@/api'

// 登录
const res = await authApi.login({
  username: 'user@example.com',
  password: '123456',
})

if (res.code === 200) {
  console.log('登录成功', res.data)
} else {
  console.error('登录失败', res.message)
}
```

### 在组件中使用

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { rentalApi } from '@/api'
import type { TimeRentalParams } from '@/api/modules/rental/types'

const loading = ref(false)

async function handleRent(params: TimeRentalParams) {
  loading.value = true
  try {
    const res = await rentalApi.rentByTime(params)

    // 不需要手动判断 code，错误会自动提示
    if (res.code === 200) {
      ElMessage.success('租用成功')
      // 处理成功逻辑
    }
  } catch (error) {
    // 网络错误等异常会被捕获
    console.error(error)
  } finally {
    loading.value = false
  }
}
</script>
```

### 自定义配置

```typescript
import { post } from '@/api/request'

// 自定义超时时间
const res = await post('/api/upload', data, {
  timeout: 60000, // 60秒
})

// 禁用重试
const res = await post('/api/payment', data, {
  retry: false,
})

// 自定义重试次数
const res = await post('/api/data', data, {
  retryCount: 5,
  retryDelay: 2000,
})
```

## 自定义配置

### 1. 修改响应格式

如果后端返回格式为：

```json
{
  "status": 1,
  "msg": "success",
  "result": { ... }
}
```

修改 `config.ts`：

```typescript
export const RESPONSE_CONFIG: ResponseConfig = {
  codeField: 'status',
  messageField: 'msg',
  dataField: 'result',
  successCode: 1,
}
```

### 2. 添加自定义请求头

修改 `config.ts`：

```typescript
export const REQUEST_HEADERS = {
  'Content-Type': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
  'X-Custom-Header': 'custom-value', // 自定义请求头
} as const
```

### 3. 自定义错误处理

修改 `errorHandler.ts`：

```typescript
export function handleError(errorInfo: ErrorInfo): void {
  // 自定义错误处理逻辑
  if (errorInfo.code === 999) {
    // 特殊错误码处理
    customErrorHandler(errorInfo)
    return
  }

  // 默认错误处理
  // ...
}
```

### 4. 添加请求日志

修改 `config.ts`：

```typescript
export const ENABLE_REQUEST_LOG = true // 开启请求日志
export const ENABLE_RESPONSE_LOG = true // 开启响应日志
```

### 5. 配置成功提示

```typescript
// 全局开启成功提示
export const SHOW_SUCCESS_MESSAGE = true

// 指定接口显示成功提示
export const SHOW_SUCCESS_URLS: (string | RegExp)[] = [
  '/auth/login',
  '/auth/register',
  /\/rental\/(time|count)$/,
]
```

### 6. 配置错误消息来源

```typescript
// 是否优先使用后端返回的错误消息
export const USE_BACKEND_ERROR_MESSAGE = true

// true: 优先显示后端返回的消息
// false: 使用前端定义的默认消息
```

**消息处理逻辑**：

```typescript
// 当 USE_BACKEND_ERROR_MESSAGE = true 时
if (后端返回了消息) {
  if (消息是翻译key) {
    显示翻译后的消息
  } else {
    直接显示后端消息
  }
} else {
  显示前端默认消息
}
```

### 7. 配置 Token 白名单

不需要 Token 的接口：

```typescript
export const NO_TOKEN_URLS: (string | RegExp)[] = [
  '/auth/login',
  '/auth/register',
  '/auth/send-code',
  /\/public\//,
]
```

## 最佳实践

### 1. 错误处理

```typescript
// ✅ 推荐：让系统自动处理错误
const res = await authApi.login(params)
if (res.code === 200) {
  // 处理成功逻辑
}

// ❌ 不推荐：手动捕获所有错误
try {
  const res = await authApi.login(params)
  if (res.code === 200) {
    // ...
  } else {
    ElMessage.error(res.message) // 重复提示
  }
} catch (error) {
  ElMessage.error('请求失败') // 重复提示
}
```

### 2. Loading 状态

```typescript
// ✅ 推荐：使用 finally 确保 loading 关闭
const loading = ref(false)

async function handleSubmit() {
  loading.value = true
  try {
    const res = await api.submit(data)
    if (res.code === 200) {
      // 处理成功
    }
  } finally {
    loading.value = false
  }
}
```

### 3. 类型安全

```typescript
// ✅ 推荐：使用类型定义
import type { LoginParams, LoginResponse } from '@/api/modules/auth/types'

const params: LoginParams = {
  username: 'user@example.com',
  password: '123456',
}

const res = await authApi.login(params)
// res.data 自动推断为 LoginResponse 类型
```

### 4. 环境变量

```typescript
// ✅ 推荐：使用环境变量
const BASE_URL = import.meta.env.VITE_API_BASE_URL

// ❌ 不推荐：硬编码
const BASE_URL = 'https://api.example.com'
```

## 常见问题

### Q1: 如何禁用某个接口的错误提示？

在 `config.ts` 中添加到 `IGNORE_ERROR_URLS`：

```typescript
export const IGNORE_ERROR_URLS: (string | RegExp)[] = [
  '/your-api-path',
]
```

### Q2: 如何自定义超时时间？

```typescript
const res = await api.request('/path', {
  timeout: 60000, // 60秒
})
```

### Q3: Token 过期后如何自动刷新？

系统会自动调用 `tokenRefreshInterceptor`，刷新成功后会重新发起请求。

### Q4: 如何添加自定义请求头？

```typescript
const res = await post('/path', data, {
  headers: {
    'X-Custom-Header': 'value',
  },
})
```

### Q5: 如何处理文件上传？

```typescript
const formData = new FormData()
formData.append('file', file)

const res = await post('/upload', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
  },
  timeout: 60000,
})
```

### Q6: 如何使用后端返回的错误消息？

默认已开启，后端返回的消息会直接显示：

```typescript
// 后端返回
{
  code: 400,
  message: "用户名或密码错误",  // 会直接显示
  data: null
}
```

如果要禁用，修改配置：

```typescript
export const USE_BACKEND_ERROR_MESSAGE = false
```

### Q7: 后端返回的是翻译 key 怎么办？

系统会自动识别并翻译：

```typescript
// 后端返回
{
  code: 400,
  message: "auth.invalidCredentials",  // 自动翻译
  data: null
}
```

### Q8: 如何同时显示错误码和错误消息？

修改 `errorHandler.ts` 中的 `showErrorMessage` 函数：

```typescript
function showErrorMessage(message: string, code?: number) {
  ElMessage.error({
    message: code ? `[${code}] ${message}` : message,
    duration: 3000,
    showClose: true,
  })
}
```
