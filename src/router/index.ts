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
  const familyStore = useFamilyStore()
  
  authStore.checkAuth()
  familyStore.loadFromLocalStorage()
  
  if (to.path !== '/login' && !authStore.isLoggedIn) {
    return '/login'
  } else if (to.path === '/login' && authStore.isLoggedIn) {
    return '/recipes'
  } else if (authStore.user?.familyId) {
    familyStore.setCurrentFamily(authStore.user.familyId)
  }
})

export default router
