// api/proxy.js
// 该服务为 vercel serve跨域处理
import { createProxyMiddleware } from 'http-proxy-middleware'
import translateApis  from '../src/utils/translate-keys.json'

module.exports = (req, res) => {
    let target = ''
    // 代理目标地址
    // 这里使用 backend 主要用于区分 vercel serverless 的 api 路径
    // target 替换为你跨域请求的服务器 如： http://baidu.com
    Object.entries(translateApis).forEach(([k, v]) => {
        if (req.url.startsWith('/backend'+v.url)) {
            target = v.host
        }
      });
    // 创建代理对象并转发请求
    createProxyMiddleware({
        target,
        changeOrigin: true,
        pathRewrite: {
            // 通过路径重写，去除请求路径中的 `/backend`
            // 例如 /backend/user/login 将被转发到 https://fanyi-api.baidu.com/user/login
            '^/backend/': '/',
        },
    })(req, res)

    
}