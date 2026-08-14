import { api } from './request'
import type { AuthResponse, User } from '@/types'

export interface LoginParams {
  phone: string
  password: string
}

export interface RegisterParams {
  phone: string
  password: string
  familyAction?: 'create' | 'join'
  familyName?: string
  familyId?: string
}

export const authApi = {
  /** 登录 */
  login(data: LoginParams): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/login', data)
  },
  /** 注册（可同时创建/加入家庭） */
  register(data: RegisterParams): Promise<AuthResponse> {
    return api.post<AuthResponse>('/auth/register', data)
  },
  /** 获取当前登录用户信息 */
  getCurrentUser(): Promise<User> {
    return api.get<User>('/auth/me')
  }
}
