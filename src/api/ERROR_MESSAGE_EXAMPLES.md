# 错误消息处理示例

## 📋 概述

本文档展示了不同场景下错误消息的处理方式，帮助理解系统如何选择和显示错误消息。

## 🎯 消息优先级

当 `USE_BACKEND_ERROR_MESSAGE = true` 时（默认配置）：

```
1. 后端返回的消息（直接显示）
   ↓
2. 翻译 key（自动翻译）
   ↓
3. 默认消息（根据错误类型和错误码）
```

## 📝 场景示例

### 场景 1: 后端返回中文消息

**后端响应**：
```json
{
  "code": 400,
  "message": "用户名或密码错误",
  "data": null
}
```

**显示结果**：
```
❌ 用户名或密码错误
```

**说明**：直接显示后端返回的中文消息。

---

### 场景 2: 后端返回英文消息

**后端响应**：
```json
{
  "code": 400,
  "message": "Invalid username or password",
  "data": null
}
```

**显示结果**：
```
❌ Invalid username or password
```

**说明**：直接显示后端返回的英文消息。

---

### 场景 3: 后端返回翻译 key

**后端响应**：
```json
{
  "code": 400,
  "message": "auth.invalidCredentials",
  "data": null
}
```

**语言文件**（zh-CN.json）：
```json
{
  "auth": {
    "invalidCredentials": "用户名或密码错误"
  }
}
```

**显示结果**（中文环境）：
```
❌ 用户名或密码错误
```

**显示结果**（英文环境）：
```
❌ Invalid username or password
```

**说明**：系统识别到消息是翻译 key（包含 `.`），自动翻译成当前语言。

---

### 场景 4: 后端返回空消息

**后端响应**：
```json
{
  "code": 400,
  "message": "",
  "data": null
}
```

**显示结果**：
```
❌ 请求参数错误
```

**说明**：后端没有返回消息，使用前端定义的默认消息。

---

### 场景 5: 后端返回 null 消息

**后端响应**：
```json
{
  "code": 500,
  "message": null,
  "data": null
}
```

**显示结果**：
```
❌ 服务器错误，请稍后重试
```

**说明**：后端返回 null，使用前端定义的默认消息。

---

### 场景 6: Token 过期

**后端响应**：
```json
{
  "code": 401,
  "message": "Token已过期",
  "data": null
}
```

**显示结果**：
```
❌ Token已过期
```

**行为**：
1. 显示错误消息
2. 清除本地 Token
3. 跳转到登录页

---

### 场景 7: 权限不足

**后端响应**：
```json
{
  "code": 403,
  "message": "您没有权限访问此资源",
  "data": null
}
```

**显示结果**：
```
❌ 您没有权限访问此资源
```

**行为**：
1. 显示错误消息
2. 跳转到 403 页面

---

### 场景 8: 网络错误

**错误类型**：网络连接失败

**显示结果**：
```
❌ 网络连接失败，请检查网络设置
```

**说明**：使用前端定义的网络错误消息。

---

### 场景 9: 请求超时

**错误类型**：请求超过 30 秒

**显示结果**：
```
❌ 请求超时，请稍后重试
```

**说明**：使用前端定义的超时错误消息。

---

### 场景 10: 后端返回 URL

**后端响应**：
```json
{
  "code": 400,
  "message": "https://example.com/error-details",
  "data": null
}
```

**显示结果**：
```
❌ https://example.com/error-details
```

**说明**：即使包含 `.`，但因为是 URL，不会被当作翻译 key，直接显示。

---

## 🔧 配置选项

### 选项 1: 优先使用后端消息（默认）

```typescript
// config.ts
export const USE_BACKEND_ERROR_MESSAGE = true
```

**效果**：
- ✅ 后端返回什么消息就显示什么
- ✅ 支持多语言（通过翻译 key）
- ✅ 灵活性高

**适用场景**：
- 后端消息已经过国际化处理
- 需要显示详细的业务错误信息
- 后端消息质量高

---

### 选项 2: 使用前端默认消息

```typescript
// config.ts
export const USE_BACKEND_ERROR_MESSAGE = false
```

**效果**：
- ✅ 统一的错误提示风格
- ✅ 前端完全控制消息内容
- ✅ 不依赖后端消息质量

**适用场景**：
- 后端消息不规范
- 需要统一的用户体验
- 前端需要完全控制提示内容

---

## 📊 消息处理流程图

```
后端返回响应
    ↓
检查 USE_BACKEND_ERROR_MESSAGE
    ↓
┌─────────────────────────────┐
│ USE_BACKEND_ERROR_MESSAGE   │
│         = true              │
└─────────────────────────────┘
    ↓
后端消息存在？
    ├─ 是 → 是翻译 key？
    │       ├─ 是 → 翻译并显示
    │       └─ 否 → 直接显示
    │
    └─ 否 → 使用默认消息
              ↓
         根据错误类型和错误码
         选择对应的默认消息
```

---

## 💡 最佳实践

### 1. 后端返回规范的消息

**推荐**：
```json
{
  "code": 400,
  "message": "用户名长度必须在 3-20 个字符之间",
  "data": null
}
```

**不推荐**：
```json
{
  "code": 400,
  "message": "error",  // 太简单
  "data": null
}
```

---

### 2. 使用翻译 key 支持多语言

**后端返回**：
```json
{
  "code": 400,
  "message": "validation.username.length",
  "data": null
}
```

**语言文件**：
```json
// zh-CN.json
{
  "validation": {
    "username": {
      "length": "用户名长度必须在 3-20 个字符之间"
    }
  }
}

// en.json
{
  "validation": {
    "username": {
      "length": "Username must be between 3 and 20 characters"
    }
  }
}
```

---

### 3. 特殊错误码的处理

```typescript
// errorHandler.ts
export function handleError(errorInfo: ErrorInfo): void {
  // 特殊错误码处理
  switch (errorInfo.code) {
    case 401: // Token 过期
      handleTokenExpired()
      return
    case 403: // 权限不足
      handlePermissionDenied()
      return
    case 999: // 自定义错误码
      customErrorHandler(errorInfo)
      return
  }

  // 默认错误处理
  // ...
}
```

---

### 4. 忽略特定接口的错误提示

```typescript
// config.ts
export const IGNORE_ERROR_URLS: (string | RegExp)[] = [
  '/auth/verify-token',  // 验证 Token 接口
  /\/check-status$/,     // 状态检查接口
]
```

---

## 🧪 测试用例

### 测试 1: 后端返回中文消息

```typescript
const response = {
  code: 400,
  message: '用户名或密码错误',
  data: null,
}

// 预期：显示 "用户名或密码错误"
```

### 测试 2: 后端返回翻译 key

```typescript
const response = {
  code: 400,
  message: 'auth.invalidCredentials',
  data: null,
}

// 预期（中文）：显示 "用户名或密码错误"
// 预期（英文）：显示 "Invalid username or password"
```

### 测试 3: 后端返回空消息

```typescript
const response = {
  code: 400,
  message: '',
  data: null,
}

// 预期：显示 "请求参数错误"（默认消息）
```

### 测试 4: 网络错误

```typescript
// 模拟网络断开
navigator.onLine = false

// 预期：显示 "网络连接失败，请检查网络设置"
```

---

## 📚 相关文档

- [配置说明文档](./CONFIGURATION.md)
- [API 使用文档](./README.md)
- [错误处理系统](../../项目分析/API统一响应和错误处理.md)
