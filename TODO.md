# TODO

## 站点 1ih5zt8q 定制化 - 已完成（需求2到需求6是全部页面的）

- [x] 隐藏：按时间租用、按笔数租用、智能托管、批量激活、登录
- [x] 未登录不显示余额，登录后显示
- [x] 去掉注册按钮
- [x] 福利订单下方增加"请移步正常能量"跳转
- [x] 闪租能量转账租赁下方增加"请移步福利订单"跳转
- [x] TG 按钮改为可拖拽浮窗，删除 Header 中 TG 按钮

## Telegram Mini App 登录

### 前端已完成

- [x] 引入 Telegram Web App SDK
- [x] 创建 `src/utils/telegram.ts` 工具函数
- [x] 创建 `src/hooks/useTelegramLogin.ts` 自动登录 Hook
- [x] App.vue 集成：检测环境 → 自动登录
- [x] Telegram 环境中隐藏 TG 浮窗

### 实际对接方式（以代码为准）

当前实现：**`POST /v3/login`**，在请求头携带：

- `Site`: 站点码
- `InitData`: Telegram `initData` 字符串
- Body: `{}`

实现文件：`src/hooks/useTelegramLogin.ts`

```
POST /v3/login
Headers: Site, InitData
Body: {}

响应：{
  "code": "000000",
  "data": {
    "token": "xxx",
    "user_info": { "id", "username", "tg_user_name", "trx_balance", ... }
  }
}

后端逻辑（约定）：
1. 用 bot_token 验证 InitData 签名
2. 提取 tg_user_id 匹配已有用户
3. 返回 token（和机器人端同一账号）
```

说明：白名单中仍保留 `/v3/tg_login` 作兼容预留，前端主路径已统一为 `/v3/login` + `InitData`。
