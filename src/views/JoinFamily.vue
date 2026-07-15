<template>
  <div class="join-family-container">
    <el-card class="join-family-card">
      <template #header>
        <h2>加入/创建家庭</h2>
      </template>
      
      <el-tabs v-model="activeTab" class="family-tabs">
        <el-tab-pane label="创建家庭" name="create">
          <el-form :model="createForm" label-width="100px">
            <el-form-item label="家庭名称">
              <el-input v-model="createForm.familyName" placeholder="请输入家庭名称" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" style="width: 100%" @click="handleCreateFamily">创建家庭</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="加入家庭" name="join">
          <el-form :model="joinForm" label-width="100px">
            <el-form-item label="家庭ID">
              <el-input v-model="joinForm.familyId" placeholder="请输入家庭ID" />
            </el-form-item>
            <el-form-item>
              <el-button type="success" style="width: 100%" @click="handleJoinFamily">加入家庭</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFamilyStore } from '@/stores/family'
import { ElMessage } from 'element-plus'
import type { User } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const familyStore = useFamilyStore()

const activeTab = ref('create')

const createForm = ref({
  familyName: ''
})

const joinForm = ref({
  familyId: ''
})

const updateUserFamily = (familyId: string) => {
  if (!authStore.user) return
  
  // 更新当前用户
  const updatedUser = { ...authStore.user, familyId, isAdmin: activeTab.value === 'create' }
  authStore.login(updatedUser)
  
  // 更新 localStorage 中的用户
  const savedUsers = JSON.parse(localStorage.getItem('users') || '[]')
  const userIndex = savedUsers.findIndex((u: User) => u.id === authStore.user?.id)
  if (userIndex !== -1) {
    savedUsers[userIndex] = updatedUser
    localStorage.setItem('users', JSON.stringify(savedUsers))
  }
}

const handleCreateFamily = () => {
  if (!createForm.value.familyName) {
    ElMessage.warning('请输入家庭名称')
    return
  }
  
  if (!authStore.user) return
  
  const familyId = familyStore.createFamily(createForm.value.familyName, authStore.user)
  updateUserFamily(familyId)
  
  ElMessage.success(`创建成功！您的家庭ID是：${familyId}`)
  router.push('/recipes')
}

const handleJoinFamily = () => {
  if (!joinForm.value.familyId) {
    ElMessage.warning('请输入家庭ID')
    return
  }
  
  if (!authStore.user) return
  
  try {
    familyStore.joinFamily(joinForm.value.familyId, authStore.user)
    updateUserFamily(joinForm.value.familyId)
    
    ElMessage.success('加入成功！')
    router.push('/recipes')
  } catch {
    ElMessage.error('家庭ID不存在')
  }
}
</script>

<style scoped>
.join-family-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 120px);
  padding: 40px;
}

.join-family-card {
  width: 500px;
}

.join-family-card h2 {
  margin: 0;
  text-align: center;
  color: #333;
}

.family-tabs {
  margin-top: 20px;
}
</style>
