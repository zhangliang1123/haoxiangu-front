<template>
  <div class="recipes-page">
    <div class="page-header">
      <h2>菜谱列表</h2>
      <el-button v-if="canManageCurrentTabRecipes" type="primary" @click="openAddDialog">
        <el-icon><Plus /></el-icon>
        添加菜谱
      </el-button>
    </div>

    <el-tabs v-model="activeTab" class="recipes-tabs">
      <el-tab-pane label="家庭菜谱" name="family">
        <template v-if="familyId">
          <el-empty v-if="familyRecipes.length === 0" description="暂无家庭菜谱">
            <el-button v-if="canManageFamilyRecipes" type="primary" @click="openAddDialog">
              添加菜谱
            </el-button>
          </el-empty>

          <el-row v-else :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="recipe in familyRecipes" :key="recipe.id">
              <el-card class="recipe-card" shadow="hover" @click="handleViewDetail(recipe)">
                <template #header>
                  <div class="card-header">
                    <span>{{ recipe.name }}</span>
                    <div v-if="canManageFamilyRecipes" @click.stop>
                      <el-button link type="primary" @click="handleEdit(recipe)">编辑</el-button>
                      <el-button link type="danger" @click="handleDelete(recipe.id)">删除</el-button>
                    </div>
                  </div>
                </template>
                <div class="recipe-content">
                  <h4>食材</h4>
                  <p>{{ recipe.ingredients }}</p>
                  <h4>制作步骤</h4>
                  <p>{{ recipe.steps }}</p>
                </div>
              </el-card>
            </el-col>
          </el-row>
        </template>

        <template v-else>
          <div class="no-family-placeholder">
            <el-empty description="加入或创建家庭后即可使用家庭菜谱">
              <el-button type="primary" @click="goToJoinFamily">加入/创建家庭</el-button>
            </el-empty>
          </div>
        </template>
      </el-tab-pane>

      <el-tab-pane label="个人菜谱" name="personal">
        <el-alert
          title="个人菜谱仅您自己可见，加入家庭后仍可查看和编辑。"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        />
        <el-empty v-if="personalRecipes.length === 0" description="暂无个人菜谱">
          <el-button type="primary" @click="openAddDialog">
            添加菜谱
          </el-button>
        </el-empty>

        <el-row v-else :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="recipe in personalRecipes" :key="recipe.id">
            <el-card class="recipe-card" shadow="hover" @click="handleViewDetail(recipe)">
              <template #header>
                <div class="card-header">
                  <span>{{ recipe.name }}</span>
                  <div @click.stop>
                    <el-button link type="primary" @click="handleEdit(recipe)">编辑</el-button>
                    <el-button link type="danger" @click="handleDelete(recipe.id)">删除</el-button>
                    <el-button
                      v-if="familyId"
                      link
                      type="success"
                      @click="handleTransferToFamily(recipe)"
                    >
                      转入家庭菜谱
                    </el-button>
                  </div>
                </div>
              </template>
              <div class="recipe-content">
                <h4>食材</h4>
                <p>{{ recipe.ingredients }}</p>
                <h4>制作步骤</h4>
                <p>{{ recipe.steps }}</p>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>

      <el-tab-pane
        v-if="canManageFamilyRecipes && familyId"
        label="待转入菜谱"
        name="pending"
      >
        <el-alert
          title="待审核的菜谱转入申请，审核通过后将自动转入家庭菜谱。"
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 20px"
        />
        <el-empty v-if="pendingRequests.length === 0" description="暂无待审核的转入申请" />

        <el-row v-else :gutter="20">
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="request in pendingRequests" :key="request.id">
            <el-card class="recipe-card pending-card" shadow="hover" @click="handleViewDetail(request.recipe)">
              <template #header>
                <div class="card-header">
                  <span>{{ request.recipe?.name }}</span>
                  <el-tag type="warning">待审核</el-tag>
                </div>
              </template>
              <div class="pending-info">
                <p><span class="label">申请人：</span>{{ request.applicantName }}</p>
                <p><span class="label">申请时间：</span>{{ formatTime(request.createdAt) }}</p>
              </div>
              <div class="recipe-content">
                <h4>食材</h4>
                <p>{{ request.recipe?.ingredients }}</p>
                <h4>制作步骤</h4>
                <p>{{ request.recipe?.steps }}</p>
              </div>
              <div class="card-actions">
                <el-button
                  size="small"
                  type="success"
                  @click.stop="handleApprove(request)"
                >
                  通过
                </el-button>
                <el-button
                  size="small"
                  type="danger"
                  @click.stop="handleReject(request)"
                >
                  拒绝
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="showAddDialog"
      :title="editingRecipe ? '编辑菜谱' : '添加菜谱'"
      width="500px"
    >
      <el-form :model="recipeForm" label-width="80px">
        <el-form-item label="菜名">
          <el-input v-model="recipeForm.name" placeholder="请输入菜名" />
        </el-form-item>
        <el-form-item label="食材">
          <el-input v-model="recipeForm.ingredients" type="textarea" :rows="3" placeholder="请输入食材" />
        </el-form-item>
        <el-form-item label="制作步骤">
          <el-input v-model="recipeForm.steps" type="textarea" :rows="5" placeholder="请输入制作步骤" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSaveRecipe">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="showDetailDialog"
      :title="viewingRecipe?.name"
      width="500px"
    >
      <div class="recipe-detail">
        <div class="detail-section">
          <h4>食材</h4>
          <p>{{ viewingRecipe?.ingredients }}</p>
        </div>
        <div class="detail-section">
          <h4>制作步骤</h4>
          <p>{{ viewingRecipe?.steps }}</p>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" @click="showDetailDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFamilyStore } from '@/stores/family'
import { useRecipeStore } from '@/stores/recipe'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Recipe, TransferRequest } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const familyStore = useFamilyStore()
const recipeStore = useRecipeStore()

const activeTab = ref<'family' | 'personal' | 'pending'>('personal')
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const editingRecipe = ref<Recipe | null>(null)
const viewingRecipe = ref<Recipe | null>(null)
const saving = ref(false)
const recipeForm = ref({
  name: '',
  ingredients: '',
  steps: ''
})

const userId = computed(() => authStore.user?.id)
const familyId = computed(() => authStore.familyId)
const canManageFamilyRecipes = computed(() => authStore.isAdmin)
const userName = computed(() => authStore.user?.phone || '用户')
const canManageCurrentTabRecipes = computed(() => {
  if (activeTab.value === 'family') return canManageFamilyRecipes.value
  return true
})

const familyRecipes = computed<Recipe[]>(() => familyStore.familyRecipes)
const personalRecipes = computed<Recipe[]>(() => recipeStore.personalRecipes)
const pendingRequests = computed<TransferRequest[]>(() => familyStore.pendingTransfers)

const goToJoinFamily = () => {
  router.push('/join-family')
}

const openAddDialog = () => {
  resetForm()
  showAddDialog.value = true
}

const handleViewDetail = (recipe?: Recipe) => {
  if (!recipe) return
  viewingRecipe.value = recipe
  showDetailDialog.value = true
}

const handleEdit = (recipe: Recipe) => {
  editingRecipe.value = recipe
  recipeForm.value = {
    name: recipe.name,
    ingredients: recipe.ingredients || '',
    steps: recipe.steps || ''
  }
  showAddDialog.value = true
}

const resetForm = () => {
  recipeForm.value = { name: '', ingredients: '', steps: '' }
  editingRecipe.value = null
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这道菜吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if (activeTab.value === 'family' && familyId.value) {
      await familyStore.deleteFamilyRecipe(id)
    } else if (userId.value) {
      await recipeStore.deletePersonalRecipe(id)
    }
    ElMessage.success('删除成功')
  } catch {
    // 用户取消或请求失败（失败信息已由拦截器提示）
  }
}

const handleSaveRecipe = async () => {
  if (!recipeForm.value.name || !recipeForm.value.ingredients || !recipeForm.value.steps) {
    ElMessage.warning('请填写完整信息')
    return
  }

  const draft = { ...recipeForm.value }
  saving.value = true
  try {
    if (editingRecipe.value) {
      if (activeTab.value === 'family' && familyId.value) {
        await familyStore.updateFamilyRecipe(editingRecipe.value.id, draft)
      } else if (userId.value) {
        await recipeStore.updatePersonalRecipe(editingRecipe.value.id, draft)
      }
      ElMessage.success('编辑成功')
    } else {
      if (activeTab.value === 'family' && familyId.value) {
        await familyStore.addFamilyRecipe(draft)
      } else if (userId.value) {
        await recipeStore.addPersonalRecipe(draft)
      }
      ElMessage.success('添加成功')
    }
    showAddDialog.value = false
    resetForm()
  } catch {
    // 错误信息已由请求拦截器统一提示
  } finally {
    saving.value = false
  }
}

const handleTransferToFamily = async (recipe: Recipe) => {
  if (!userId.value || !familyId.value) {
    ElMessage.warning('请先登录或加入家庭')
    return
  }

  if (canManageFamilyRecipes.value) {
    try {
      await ElMessageBox.confirm(`确定要将菜谱「${recipe.name}」转入家庭菜谱吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      })
      await recipeStore.transferToFamilyDirect(recipe.id, familyId.value)
      await familyStore.refreshFamilyRecipes()
      ElMessage.success('转入成功')
    } catch {
      // 用户取消或请求失败
    }
  } else {
    try {
      await ElMessageBox.confirm(`确定要申请将菜谱「${recipe.name}」转入家庭菜谱吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      })
      await familyStore.applyTransferToFamily({
        recipeId: recipe.id,
        applicantName: userName.value
      })
      ElMessage.success('申请已提交，等待管理员审核')
    } catch {
      // 用户取消或请求失败
    }
  }
}

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

const handleApprove = async (request: TransferRequest) => {
  try {
    await ElMessageBox.confirm(`确定要通过「${request.recipe?.name}」的转入申请吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'success'
    })
    await familyStore.reviewTransferRequest(request.id, true)
    ElMessage.success('已通过申请')
  } catch {
    // 用户取消或请求失败
  }
}

const handleReject = async (request: TransferRequest) => {
  try {
    await ElMessageBox.confirm(`确定要拒绝「${request.recipe?.name}」的转入申请吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await familyStore.reviewTransferRequest(request.id, false)
    ElMessage.success('已拒绝申请')
  } catch {
    // 用户取消或请求失败
  }
}

onMounted(() => {
  // 加载个人菜谱；若已加入家庭但家庭数据缺失，则补加载
  recipeStore.fetchPersonalRecipes()
  if (authStore.familyId && !familyStore.currentFamily) {
    familyStore.loadFamily(authStore.familyId)
  }
})
</script>

<style scoped>
.recipe-card {
  cursor: pointer;
}

.pending-card {
  border-left: 4px solid #e6a23c;
}

.pending-info {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #ebeef5;
}

.pending-info .label {
  color: #909399;
}

.pending-info p {
  margin: 5px 0;
  color: #666;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px dashed #ebeef5;
}

.recipe-detail .detail-section {
  margin-bottom: 20px;
}

.recipe-detail .detail-section h4 {
  color: #409eff;
  margin-bottom: 8px;
}

.recipe-detail .detail-section p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.recipes-tabs {
  margin-top: 20px;
}

.no-family-placeholder {
  padding: 40px 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.recipe-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.recipe-content h4 {
  margin: 10px 0 5px 0;
  color: #409eff;
}

.recipe-content p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}
</style>
