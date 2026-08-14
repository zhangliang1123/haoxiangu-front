<template>
  <el-container class="main-layout">
    <el-header>
      <div class="header-content">
        <h1>好香哟 - 家庭点餐</h1>
        <div class="user-info">
          <template v-if="authStore.user">
            <span>
              欢迎，{{ authStore.user.phone }}
              <el-button v-if="authStore.user.isAdmin" type="success" size="small" style="margin-left: 10px">管理员</el-button>
              <template v-if="familyId">
                <span style="margin-left: 10px; font-size: 14px; opacity: 0.9">
                  家庭: {{ familyStore.familyName }} (ID: {{ familyId }})
                </span>
              </template>
              <template v-else>
                <el-button type="warning" size="small" @click="goToJoinFamily" style="margin-left: 10px">
                  <el-icon><Plus /></el-icon>
                  加入/创建家庭
                </el-button>
              </template>
            </span>
          </template>
          <el-badge
            v-if="authStore.user?.isAdmin && familyId"
            :value="familyStore.unreadNotifications.length"
            :hidden="familyStore.unreadNotifications.length === 0"
            class="notification-badge"
          >
            <el-button type="warning" size="small" @click="showNotifications = true">
              <el-icon><Bell /></el-icon>
              通知
            </el-button>
          </el-badge>
          <el-button type="danger" size="small" @click="handleLogout" style="margin-left: 10px">退出登录</el-button>
        </div>
      </div>
    </el-header>
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          router
          class="el-menu-vertical"
        >
          <el-menu-item index="/recipes">
            <el-icon><Document /></el-icon>
            <span>菜谱列表</span>
          </el-menu-item>
          <el-menu-item index="/order">
            <el-icon><ShoppingCart /></el-icon>
            <span>点餐</span>
          </el-menu-item>
          <el-menu-item index="/history">
            <el-icon><Timer /></el-icon>
            <span>历史记录</span>
          </el-menu-item>
          <el-menu-item v-if="authStore.user?.isAdmin && familyId" index="/family">
            <el-icon><HomeFilled /></el-icon>
            <span>家庭管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main>
        <div v-if="showNoFamilyPrompt" class="no-family-prompt">
          <el-empty description="您还没有加入任何家庭">
            <el-button type="primary" @click="goToJoinFamily">加入/创建家庭</el-button>
          </el-empty>
        </div>
        <router-view v-else />
      </el-main>
    </el-container>

    <el-dialog v-model="showNotifications" title="通知" width="500px">
      <el-empty v-if="familyStore.notifications.length === 0" description="暂无通知" />
      <div v-else class="notification-list">
        <div
          v-for="notification in familyStore.notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.read }"
          @click="markAsRead(notification.id)"
        >
          <div class="notification-message">{{ notification.message }}</div>
          <div class="notification-time">{{ formatTime(notification.createdAt) }}</div>
        </div>
      </div>
    </el-dialog>
  </el-container>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFamilyStore } from '@/stores/family'
import { Document, ShoppingCart, Timer, Bell, HomeFilled, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const familyStore = useFamilyStore()

const showNotifications = ref(false)

const activeMenu = computed(() => route.path)
const familyId = computed(() => authStore.familyId)
const isJoinFamilyPage = computed(() => route.path === '/join-family')
const isRecipesPage = computed(() => route.path === '/recipes')
const showNoFamilyPrompt = computed(
  () => !familyId.value && !isJoinFamilyPage.value && !isRecipesPage.value
)

const formatTime = (timeStr: string) => {
  const date = new Date(timeStr)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 退出登录时清空家庭缓存
const handleLogout = () => {
  authStore.logout()
  familyStore.clearFamily()
  ElMessage.success('已退出登录')
  router.push('/login')
}

const goToJoinFamily = () => {
  router.push('/join-family')
}

const markAsRead = async (id: number) => {
  try {
    await familyStore.markNotificationAsRead(id)
  } catch {
    // 错误信息已由请求拦截器统一提示
  }
}

// 用户刷新后直接进入主布局时，若家庭未加载则补加载
onMounted(() => {
  if (authStore.familyId && !familyStore.currentFamily) {
    familyStore.loadFamily(authStore.familyId)
  }
})
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

.el-header {
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
}

.header-content {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  margin: 0;
  font-size: 24px;
}

.user-info {
  display: flex;
  align-items: center;
}

.notification-badge {
  margin-right: 10px;
}

.el-aside {
  background-color: #f5f7fa;
}

.el-menu-vertical {
  border-right: none;
}

.el-main {
  background-color: #fff;
  padding: 20px;
}

.no-family-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-item.unread {
  background-color: #ecf5ff;
}

.notification-message {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
}

.notification-time {
  font-size: 12px;
  color: #999;
}
</style>
