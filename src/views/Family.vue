<template>
  <div class="family-page">
    <h2>家庭管理</h2>

    <el-card class="info-card">
      <template #header>
        <div class="card-header">
          <span>家庭信息</span>
        </div>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="家庭ID">
          <el-tag type="primary">{{ family?.id }}</el-tag>
          <el-button
            type="primary"
            size="small"
            style="margin-left: 10px"
            @click="copyFamilyId"
          >
            复制
          </el-button>
        </el-descriptions-item>
        <el-descriptions-item label="家庭名称">{{ family?.name }}</el-descriptions-item>
        <el-descriptions-item label="成员数量">{{ members.length }}</el-descriptions-item>
        <el-descriptions-item label="菜谱数量">{{ familyStore.familyRecipes.length }}</el-descriptions-item>
      </el-descriptions>
    </el-card>

    <el-card class="members-card">
      <template #header>
        <div class="card-header">
          <span>家庭成员</span>
        </div>
      </template>
      <el-table :data="members" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="phone" label="手机号" />
        <el-table-column label="身份" width="120">
          <template #default="{ row }">
            <el-tag :type="row.isAdmin ? 'success' : 'info'">
              {{ row.isAdmin ? '管理员' : '成员' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFamilyStore } from '@/stores/family'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const familyStore = useFamilyStore()

const family = computed(() => familyStore.currentFamily)
const members = computed(() => familyStore.members)

const copyFamilyId = async () => {
  if (!family.value?.id) return

  try {
    await navigator.clipboard.writeText(family.value.id)
    ElMessage.success('家庭ID已复制到剪贴板')
  } catch {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 确保家庭数据已加载（用户刷新后直接进入该页面时）
if (authStore.familyId && !familyStore.currentFamily) {
  familyStore.loadFamily(authStore.familyId)
}
</script>

<style scoped>
.family-page h2 {
  margin-bottom: 20px;
}

.info-card {
  margin-bottom: 20px;
}

.members-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
