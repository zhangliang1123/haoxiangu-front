<template>
  <div class="order-page">
    <h2>点餐</h2>
    <p class="tip">请从下方菜谱中选择今天要做的菜</p>

    <el-row :gutter="20">
      <el-col :xs="24" :sm="12" :md="8" :lg="6" v-for="recipe in recipes" :key="recipe.id">
        <el-card
          class="recipe-card"
          :class="{ 'selected': selectedRecipes.includes(recipe.id) }"
          shadow="hover"
          @click="toggleSelect(recipe.id)"
        >
          <template #header>
            <div class="card-header">
              <span>{{ recipe.name }}</span>
              <el-icon v-if="selectedRecipes.includes(recipe.id)" class="check-icon"><Check /></el-icon>
            </div>
          </template>
          <div class="recipe-content">
            <h4>食材</h4>
            <p>{{ recipe.ingredients }}</p>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <div class="action-bar" v-if="selectedRecipes.length > 0">
      <div class="selected-info">
        已选择 <strong>{{ selectedRecipes.length }}</strong> 道菜：
        <span class="recipe-names">{{ getSelectedRecipeNames().join('、') }}</span>
      </div>
      <el-button type="primary" size="large" :loading="submitting" @click="handleSubmitOrder">
        确认点餐
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useFamilyStore } from '@/stores/family'
import { Check } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { Recipe } from '@/types'

const authStore = useAuthStore()
const familyStore = useFamilyStore()

const selectedRecipes = ref<number[]>([])
const submitting = ref(false)

const recipes = computed<Recipe[]>(() => familyStore.familyRecipes)

const toggleSelect = (id: number) => {
  const index = selectedRecipes.value.indexOf(id)
  if (index === -1) {
    selectedRecipes.value.push(id)
  } else {
    selectedRecipes.value.splice(index, 1)
  }
}

const getSelectedRecipeNames = () => {
  return recipes.value
    .filter((r) => selectedRecipes.value.includes(r.id))
    .map((r) => r.name)
}

const handleSubmitOrder = async () => {
  if (!authStore.familyId) return

  try {
    await ElMessageBox.confirm(
      `确定要点这些菜吗？\n${getSelectedRecipeNames().join('、')}`,
      '确认点餐',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'success'
      }
    )

    submitting.value = true
    await familyStore.createOrder({
      recipeIds: selectedRecipes.value,
      recipeNames: getSelectedRecipeNames()
    })

    ElMessage.success('点餐成功！')
    selectedRecipes.value = []
  } catch {
    // 用户取消或请求失败（失败信息已由拦截器提示）
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.order-page h2 {
  margin-bottom: 10px;
}

.tip {
  color: #666;
  margin-bottom: 20px;
}

.recipe-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.recipe-card:hover {
  transform: translateY(-5px);
}

.recipe-card.selected {
  border: 2px solid #67c23a;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.check-icon {
  color: #67c23a;
  font-size: 20px;
}

.recipe-content h4 {
  margin: 10px 0 5px 0;
  color: #409eff;
}

.recipe-content p {
  margin: 0;
  color: #666;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 200px;
  right: 0;
  background: white;
  padding: 15px 30px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-info {
  font-size: 16px;
}

.recipe-names {
  color: #409eff;
  margin-left: 10px;
}
</style>
