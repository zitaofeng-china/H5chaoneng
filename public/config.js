/**
 * 运行时配置文件
 * 
 * 此文件会被复制到 dist/ 目录，运维可以在部署后直接修改
 * 无需重新构建前端代码
 */
window.__APP_CONFIG__ = {
  // API 基础 URL
  // 开发环境：留空使用 Vite 代理（避免 CORS 问题）
  // 生产环境：留空使用 Netlify 代理，或填写实际后端地址
  API_BASE_URL: ''  // 留空使用 Netlify 代理
}
