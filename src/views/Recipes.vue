<template>
  <div class="recipes-page">
    <div class="page-header">
      <h2>菜谱列表</h2>
      <el-button v-if="canManageCurrentTabRecipes" type="primary" @click="showAddDialog = true">
        <el-icon><Plus /></el-icon>
        添加菜谱
      </el-button>
    </div>

    <el-tabs v-model="activeTab" class="recipes-tabs">
      <el-tab-pane label="家庭菜谱" name="family">
        <template v-if="familyId">
          <el-empty v-if="familyRecipes.length === 0" description="暂无家庭菜谱">
            <el-button v-if="canManageFamilyRecipes" type="primary" @click="showAddDialog = true">
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
          <el-button type="primary" @click="showAddDialog = true">
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
        <el-button type="primary" @click="handleSaveRecipe">保存</el-button>
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
import { Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Recipe } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const familyStore = useFamilyStore()

const activeTab = ref('personal')
const showAddDialog = ref(false)
const showDetailDialog = ref(false)
const editingRecipe = ref<Recipe | null>(null)
const viewingRecipe = ref<Recipe | null>(null)
const recipeForm = ref({
  name: '',
  ingredients: '',
  steps: ''
})

const userId = computed(() => authStore.user?.id)
const familyId = computed(() => authStore.user?.familyId)
const canManageFamilyRecipes = computed(() => Boolean(authStore.user?.isAdmin))
const canManageCurrentTabRecipes = computed(() => {
  if (activeTab.value === 'family') {
    return canManageFamilyRecipes.value
  }
  return true
})

const familyRecipes = computed(() => familyStore.currentFamily?.recipes || [])
const personalRecipes = computed(() => {
  if (!userId.value) {
    return []
  }
  return familyStore.getPersonalRecipes(userId.value)
})

const goToJoinFamily = () => {
  router.push('/join-family')
}

const handleViewDetail = (recipe: Recipe) => {
  viewingRecipe.value = recipe
  showDetailDialog.value = true
}

const handleEdit = (recipe: Recipe) => {
  editingRecipe.value = recipe
  recipeForm.value = {
    name: recipe.name,
    ingredients: recipe.ingredients,
    steps: recipe.steps
  }
  showAddDialog.value = true
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这道菜吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    if (activeTab.value === 'family' && familyId.value) {
      familyStore.deleteRecipe(familyId.value, id)
    } else if (userId.value) {
      familyStore.deletePersonalRecipe(userId.value, id)
    }

    ElMessage.success('删除成功')
  } catch {
  }
}

const handleSaveRecipe = () => {
  if (!recipeForm.value.name || !recipeForm.value.ingredients || !recipeForm.value.steps) {
    ElMessage.warning('请填写完整信息')
    return
  }

  if (editingRecipe.value) {
    if (activeTab.value === 'family' && familyId.value) {
      familyStore.updateRecipe(familyId.value, editingRecipe.value.id, recipeForm.value)
    } else if (userId.value) {
      familyStore.updatePersonalRecipe(userId.value, editingRecipe.value.id, recipeForm.value)
    }

    ElMessage.success('编辑成功')
  } else {
    const newRecipe: Recipe = {
      ...recipeForm.value,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }

    if (activeTab.value === 'family' && familyId.value) {
      familyStore.addRecipe(familyId.value, newRecipe)
    } else if (userId.value) {
      familyStore.addPersonalRecipe(userId.value, newRecipe)
    }

    ElMessage.success('添加成功')
  }

  showAddDialog.value = false
  resetForm()
}

const resetForm = () => {
  recipeForm.value = {
    name: '',
    ingredients: '',
    steps: ''
  }
  editingRecipe.value = null
}

onMounted(() => {
  familyStore.loadFromLocalStorage()
})
</script>

<style scoped>
.recipe-card {
  cursor: pointer;
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
</style>

<style scoped>
.recipes-tabs {
  margin-top: 20px;
}

.no-family-placeholder {
  padding: 40px 0;
}
</style>

<style scoped>
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
