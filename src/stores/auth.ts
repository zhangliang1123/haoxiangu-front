import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type LoginParams, type RegisterParams } from '@/api/auth'
import { TOKEN_KEY } from '@/api/request'
import type { User } from '@/types'

/**
 * 认证 store：
 * - 仅负责 token 与当前用户状态，不耦合任何业务实体。
 * - 业务数据由 family / recipe store 自行拉取。
 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const loading = ref(false)

  const isLoggedIn = computed(() => Boolean(token.value && user.value))
  const familyId = computed(() => user.value?.familyId)
  const isAdmin = computed(() => Boolean(user.value?.isAdmin))

  const setSession = (newToken: string, newUser: User) => {
    token.value = newToken
    user.value = newUser
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  const login = async (params: LoginParams) => {
    loading.value = true
    try {
      const res = await authApi.login(params)
      setSession(res.token, res.user)
      return res
    } finally {
      loading.value = false
    }
  }

  const register = async (params: RegisterParams) => {
    loading.value = true
    try {
      const res = await authApi.register(params)
      setSession(res.token, res.user)
      return res
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  /** 基于 token 恢复会话（应用刷新后调用） */
  const restoreSession = async () => {
    if (!token.value) return false
    try {
      user.value = await authApi.getCurrentUser()
      return true
    } catch {
      logout()
      return false
    }
  }

  /** 家庭操作后同步更新本地用户与 token */
  const updateUser = (patch: Partial<User>) => {
    if (user.value) user.value = { ...user.value, ...patch }
  }

  const updateToken = (newToken: string) => {
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  return {
    user,
    token,
    loading,
    isLoggedIn,
    familyId,
    isAdmin,
    login,
    register,
    logout,
    restoreSession,
    updateUser,
    updateToken
  }
})
