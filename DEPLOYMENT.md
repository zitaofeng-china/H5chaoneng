# 部署说明

## 修改后端 API 地址

部署前或部署后，可以随时修改 API 地址，无需重新构建。

### 步骤：

1. 找到 `dist/config.js` 文件
2. 修改 `API_BASE_URL` 的值：

```javascript
window.__APP_CONFIG__ = {
  API_BASE_URL: 'https://your-backend-api.com'  // 改成实际的后端地址
}
```

3. 保存文件
4. 刷新浏览器即可生效

### 示例：

**测试环境**：
```javascript
window.__APP_CONFIG__ = {
  API_BASE_URL: 'http://test-api.example.com'
}
```

**生产环境**：
```javascript
window.__APP_CONFIG__ = {
  API_BASE_URL: 'https://api.example.com'
}
```

## 部署要求

### 1. Web 服务器配置（Nginx 示例）

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/dist;
    index index.html;

    # SPA 路由配置（必须）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # config.js 不缓存（重要！）
    location = /config.js {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
```

### 2. 后端 CORS 配置

后端需要配置 CORS 允许前端域名访问：

```
Access-Control-Allow-Origin: https://your-frontend-domain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, Site
Access-Control-Allow-Credentials: true
```

### 3. HTTPS 建议

- 前端使用 HTTPS
- 后端也应使用 HTTPS
- 避免混合内容（Mixed Content）问题

## 验证部署

1. 打开浏览器开发者工具（F12）
2. 切换到 Network 面板
3. 刷新页面
4. 查看 API 请求是否发送到正确的后端地址

## 常见问题

### Q: 修改 config.js 后不生效？
A: 清除浏览器缓存或强制刷新（Ctrl+F5）

### Q: API 请求失败？
A: 检查：
1. config.js 中的 API 地址是否正确
2. 后端服务是否正常运行
3. 后端是否配置了 CORS
4. 网络是否可达

### Q: 页面刷新后 404？
A: 检查 Web 服务器是否配置了 SPA 路由（try_files）
