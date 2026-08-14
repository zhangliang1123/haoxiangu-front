import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFamilyStore } from '@/stores/family'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      {
        path: 'recipes',
        name: 'Recipes',
        component: () => import('@/views/Recipes.vue')
      },
      {
        path: 'order',
        name: 'Order',
        component: () => import('@/views/Order.vue')
      },
      {
        path: 'history',
        name: 'History',
        component: () => import('@/views/History.vue')
      },
      {
        path: 'family',
        name: 'Family',
        component: () => import('@/views/Family.vue')
      },
      {
        path: 'join-family',
        name: 'JoinFamily',
        component: () => import('@/views/JoinFamily.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()

  // 存在 token 但未恢复用户信息时，先尝试拉取当前用户
  if (authStore.token && !authStore.user) {
    await authStore.restoreSession()
  }

  if (to.path !== '/login' && !authStore.isLoggedIn) {
    return '/login'
  }
  if (to.path === '/login' && authStore.isLoggedIn) {
    return '/recipes'
  }

  // 已登录且已加入家庭，但家庭数据尚未加载时，预加载家庭数据
  if (authStore.isLoggedIn && authStore.familyId) {
    const familyStore = useFamilyStore()
    if (!familyStore.currentFamily) {
      await familyStore.loadFamily(authStore.familyId)
    }
  }
})

export default router
