/**
 * 运行时配置文件
 * 
 * 此文件会被复制到 dist/ 目录，运维可以在部署后直接修改
 * 无需重新构建前端代码
 */
window.__APP_CONFIG__ = {
  // API 基础 URL
  // 留空（推荐）：使用相对路径，配合 Nginx 代理（同源，无 CORS 问题）
  // 填写地址：直连后端（跨域，需要后端配置 CORS）
  // 
  // 示例：
  // API_BASE_URL: ''                              // 使用 Nginx 代理（推荐）
  // API_BASE_URL: ''                              // 直连后端（需要后端支持 CORS）
  API_BASE_URL: '',

  // 默认站点标识
  // 当用户访问根路径 / 或输入无效站点时，会重定向到此站点
  // 留空则使用构建时的 VITE_DEFAULT_SITE 环境变量
  DEFAULT_SITE: ''
}
