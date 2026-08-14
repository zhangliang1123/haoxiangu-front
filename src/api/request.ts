import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import { ElMessage } from 'element-plus'

/** 本地存储中保存 token 的 key */
export const TOKEN_KEY = 'token'

/**
 * 接口基础地址：
 * - 开发环境通过 vite 代理（vite.config.ts 中将 /api 转发到后端服务）。
 * - 生产环境需由部署侧的反向代理（如 nginx）将 /api 指向后端服务。
 */
const BASE_URL = '/api'

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

// 请求拦截器：自动附带 JWT
instance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：解包 data + 统一错误提示
instance.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error: AxiosError<{ error?: string }>) => {
    const status = error.response?.status
    const message = error.response?.data?.error || error.message || '请求失败，请稍后重试'
    const url = error.config?.url || ''
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register')
    const hadToken = Boolean(error.config?.headers?.Authorization)

    // 会话过期（仅对受保护接口跳转，避免影响登录态校验请求）
    if (status === 401 && hadToken && !isAuthEndpoint) {
      localStorage.removeItem(TOKEN_KEY)
      ElMessage.error('登录已过期，请重新登录')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else {
      ElMessage.error(message)
    }
    return Promise.reject(error)
  }
)

/** 统一对外暴露的请求方法，返回值已解包为业务数据 */
export const api = {
  get: <T>(url: string, config?: AxiosRequestConfig) => instance.get<T, T>(url, config),
  post: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    instance.post<T, T>(url, data, config),
  put: <T>(url: string, data?: unknown, config?: AxiosRequestConfig) =>
    instance.put<T, T>(url, data, config),
  delete: <T>(url: string, config?: AxiosRequestConfig) => instance.delete<T, T>(url, config)
}

export default instance
