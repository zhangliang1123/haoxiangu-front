import { defineStore } from 'pinia'
import { ref } from 'vue'
import { recipeApi } from '@/api/recipe'
import { transferApi } from '@/api/transfer'
import { useAuthStore } from './auth'
import type { Recipe } from '@/types'

type RecipeDraft = Pick<Recipe, 'name' | 'ingredients' | 'steps'>

/**
 * 菜谱 store：
 * - 负责当前用户的「个人菜谱」（familyId 为空的菜谱）。
 * - 与家庭 store 解耦，互不依赖。
 */
export const useRecipeStore = defineStore('recipe', () => {
  const personalRecipes = ref<Recipe[]>([])
  const loading = ref(false)

  const fetchPersonalRecipes = async () => {
    loading.value = true
    try {
      personalRecipes.value = await recipeApi.getRecipes()
    } finally {
      loading.value = false
    }
  }

  const addPersonalRecipe = async (draft: RecipeDraft) => {
    const recipe = await recipeApi.createRecipe(draft)
    personalRecipes.value = [recipe, ...personalRecipes.value]
    return recipe
  }

  const updatePersonalRecipe = async (id: number, draft: RecipeDraft) => {
    const recipe = await recipeApi.updateRecipe(id, draft)
    const index = personalRecipes.value.findIndex((r) => r.id === id)
    if (index !== -1) personalRecipes.value[index] = recipe
    return recipe
  }

  const deletePersonalRecipe = async (id: number) => {
    await recipeApi.deleteRecipe(id)
    personalRecipes.value = personalRecipes.value.filter((r) => r.id !== id)
  }

  /**
   * 管理员直接将个人菜谱转入家庭：
   * 后端无「直接转入」接口，这里复用申请->审核流程，管理员身份可立即通过。
   */
  const transferToFamilyDirect = async (recipeId: number, familyId: string) => {
    const authStore = useAuthStore()
    const created = await transferApi.createTransferRequest({
      recipeId,
      familyId,
      applicantName: authStore.user?.phone
    })
    await transferApi.reviewTransferRequest(created.id, true)
    personalRecipes.value = personalRecipes.value.filter((r) => r.id !== recipeId)
  }

  return {
    personalRecipes,
    loading,
    fetchPersonalRecipes,
    addPersonalRecipe,
    updatePersonalRecipe,
    deletePersonalRecipe,
    transferToFamilyDirect
  }
})
