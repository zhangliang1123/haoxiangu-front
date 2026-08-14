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
              <el-button type="primary" style="width: 100%" :loading="submitting" @click="handleCreateFamily">
                创建家庭
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="加入家庭" name="join">
          <el-form :model="joinForm" label-width="100px">
            <el-form-item label="家庭ID">
              <el-input v-model="joinForm.familyId" placeholder="请输入家庭ID" />
            </el-form-item>
            <el-form-item>
              <el-button type="success" style="width: 100%" :loading="submitting" @click="handleJoinFamily">
                加入家庭
              </el-button>
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
import { useFamilyStore } from '@/stores/family'
import { ElMessage } from 'element-plus'

const router = useRouter()
const familyStore = useFamilyStore()

const activeTab = ref('create')
const submitting = ref(false)

const createForm = ref({
  familyName: ''
})

const joinForm = ref({
  familyId: ''
})

const handleCreateFamily = async () => {
  if (!createForm.value.familyName) {
    ElMessage.warning('请输入家庭名称')
    return
  }

  submitting.value = true
  try {
    const family = await familyStore.createFamily(createForm.value.familyName)
    ElMessage.success(`创建成功！您的家庭ID是：${family.id}`)
    router.push('/recipes')
  } catch {
    // 错误信息已由请求拦截器统一提示
  } finally {
    submitting.value = false
  }
}

const handleJoinFamily = async () => {
  if (!joinForm.value.familyId) {
    ElMessage.warning('请输入家庭ID')
    return
  }

  submitting.value = true
  try {
    await familyStore.joinFamily(joinForm.value.familyId)
    ElMessage.success('加入成功！')
    router.push('/recipes')
  } catch {
    // 错误信息已由请求拦截器统一提示
  } finally {
    submitting.value = false
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
