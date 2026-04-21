// Netlify Function - API 代理
const fetch = require('node-fetch')

exports.handler = async (event, context) => {
  // 允许 CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Site',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  }

  // 处理 OPTIONS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  try {
    // 提取 API 路径
    const path = event.path.replace('/.netlify/functions/api', '')
    const backendUrl = `http://47.84.135.181:8888${path}`
    
    console.log('Proxying to:', backendUrl)
    
    // 构建请求头
    const requestHeaders = {
      'Content-Type': event.headers['content-type'] || 'application/json',
    }
    
    // 添加 Site 请求头
    if (event.headers['site']) {
      requestHeaders['Site'] = event.headers['site']
    }
    
    // 添加 Authorization 请求头
    if (event.headers['authorization']) {
      requestHeaders['Authorization'] = event.headers['authorization']
    }
    
    // 发送请求到后端
    const response = await fetch(backendUrl, {
      method: event.httpMethod,
      headers: requestHeaders,
      body: event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD' ? event.body : undefined,
    })
    
    // 获取响应数据
    const data = await response.text()
    
    console.log('Backend response:', response.status, data.substring(0, 100))
    
    // 返回响应
    return {
      statusCode: response.status,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: data,
    }
  } catch (error) {
    console.error('Proxy error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: error.message,
        path: event.path,
      }),
    }
  }
}
