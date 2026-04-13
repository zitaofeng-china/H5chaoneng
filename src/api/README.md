# API 接口文档

## 📁 目录结构

```
api/
├── modules/                    # 功能模块
│   ├── auth/                  # 认证模块
│   │   ├── index.ts          # API 接口
│   │   └── types.ts          # 类型定义
│   ├── user/                  # 用户模块
│   │   ├── index.ts
│   │   └── types.ts
│   ├── rental/                # 能量租赁模块
│   │   ├── index.ts
│   │   └── types.ts
│   ├── contract/              # 合约闪兑模块
│   │   ├── index.ts
│   │   └── types.ts
│   ├── hosting/               # 智能托管模块
│   │   ├── index.ts
│   │   └── types.ts
│   └── activation/            # 批量激活模块
│       ├── index.ts
│       └── types.ts
├── request.ts                 # HTTP 请求封装
├── types.ts                   # 通用类型定义
├── index.ts                   # 统一导出入口
└── README.md                  # 本文档
```

## 🚀 使用方法

### 1. 基础用法

```typescript
import { authApi, userApi, rentalApi } from '@/api'

// 登录
const loginRes = await authApi.login({
  username: 'user@example.com',
  password: '123456',
})

// 获取用户信息
const userInfo = await authApi.getUserInfo()

// 按时间租用能量
const rentalRes = await rentalApi.rentByTime({
  address: 'TXxx...',
  count: 10,
  unitPrice: 1.9,
  energy: 13.0,
  validity: 3,
  totalPrice: 19.0,
})
```

### 2. 类型导入

```typescript
import type { LoginParams, LoginResponse } from '@/api/modules/auth/types'
import type { TimeRentalParams, RentalResponse } from '@/api/modules/rental/types'

const loginParams: LoginParams = {
  username: 'user@example.com',
  password: '123456',
}
```

### 3. 在组件中使用

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
    if (res.code === 200) {
      console.log('租用成功', res.data)
    } else {
      console.error('租用失败', res.message)
    }
  } catch (error) {
    console.error('请求错误', error)
  } finally {
    loading.value = false
  }
}
</script>
```

## 📦 模块说明

### 1. 认证模块 (auth)

**功能**：用户登录、注册、密码管理

**主要接口**：
- `login()` - 用户登录
- `register()` - 用户注册
- `resetPassword()` - 重置密码
- `revisePassword()` - 修改密码
- `sendCode()` - 发送验证码
- `getUserInfo()` - 获取用户信息

### 2. 用户模块 (user)

**功能**：充值、余额、交易记录、提现

**主要接口**：
- `createRecharge()` - 创建充值订单
- `getBalance()` - 获取余额信息
- `getTransactions()` - 获取交易记录
- `getUserStats()` - 获取用户统计
- `createWithdraw()` - 创建提现订单

### 3. 能量租赁模块 (rental)

**功能**：按时间租用、按笔数租用、快速租用、转账租赁

**主要接口**：
- `rentByTime()` - 按时间租用
- `rentByCount()` - 按笔数租用
- `quickRent()` - 快速租用
- `getTransferInfo()` - 获取转账信息
- `saveAddress()` - 保存地址
- `getSavedAddresses()` - 获取已保存地址

### 4. 合约闪兑模块 (contract)

**功能**：USDT-TRX 即时兑换

**主要接口**：
- `createFlashOrder()` - 创建闪兑订单
- `getRate()` - 获取实时汇率
- `getFlashConfig()` - 获取闪兑配置
- `getStock()` - 获取库存信息
- `calculateEstimate()` - 计算预估结果

### 5. 智能托管模块 (hosting)

**功能**：地址托管、自动充能

**主要接口**：
- `addHosting()` - 添加托管地址
- `getHostingAddresses()` - 获取托管地址列表
- `deleteHosting()` - 删除托管地址
- `toggleHosting()` - 暂停/恢复托管
- `getHostingStats()` - 获取托管统计
- `manualCharge()` - 手动充能

### 6. 批量激活模块 (activation)

**功能**：批量激活地址

**主要接口**：
- `batchActivate()` - 批量激活地址
- `getActivationConfig()` - 获取激活配置
- `checkAddressStatus()` - 检查地址状态
- `estimateCost()` - 预估激活费用

## 🔧 请求配置

### 环境变量

在 `.env` 文件中配置 API 基础 URL：

```env
# 开发环境
VITE_API_BASE_URL=http://localhost:3000/api

# 生产环境
VITE_API_BASE_URL=https://api.example.com/api
```

### 请求拦截

在 `request.ts` 中自动处理：
- ✅ 自动添加 Authorization 头
- ✅ 自动处理请求超时
- ✅ 统一错误处理
- ✅ 统一响应格式

### 响应格式

所有接口返回统一格式：

```typescript
{
  code: number      // 状态码：200 成功，其他失败
  message: string   // 提示信息
  data: T          // 响应数据
}
```

## 📝 开发规范

### 1. 命名规范

- **接口函数**：动词开头，camelCase（如 `getUserInfo`）
- **类型定义**：名词，PascalCase（如 `UserInfo`）
- **请求参数**：以 `Params` 结尾（如 `LoginParams`）
- **响应数据**：以 `Response` 结尾（如 `LoginResponse`）

### 2. 文件组织

每个模块包含两个文件：
- `index.ts`：API 接口定义
- `types.ts`：类型定义

### 3. 类型安全

- ✅ 所有接口都有完整的类型定义
- ✅ 请求参数和响应数据都有类型约束
- ✅ 使用 TypeScript 泛型确保类型安全

### 4. 错误处理

```typescript
try {
  const res = await authApi.login(params)
  if (res.code === 200) {
    // 成功处理
  } else {
    // 业务错误处理
    console.error(res.message)
  }
} catch (error) {
  // 网络错误或其他异常
  console.error(error)
}
```

## 🔍 调试技巧

### 1. 查看请求日志

在浏览器控制台查看：
- 请求 URL
- 请求参数
- 响应数据
- 错误信息

### 2. Mock 数据

在开发环境可以使用 Mock 数据：

```typescript
// 在 request.ts 中添加
if (import.meta.env.DEV) {
  // 返回 Mock 数据
}
```

### 3. 超时设置

可以为单个请求设置超时：

```typescript
const res = await authApi.login(params, {
  timeout: 10000, // 10秒超时
})
```

## 📚 参考资料

- [Fetch API](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API)
- [TypeScript 泛型](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [RESTful API 设计](https://restfulapi.net/)
