import { api } from './request'
import type { Recipe } from '@/types'

export interface RecipeInput {
  name: string
  ingredients?: string
  steps?: string
  familyId?: string
}

export const recipeApi = {
  /** 获取菜谱：传 familyId 返回家庭菜谱，否则返回当前用户的个人菜谱 */
  getRecipes(familyId?: string): Promise<Recipe[]> {
    return api.get<Recipe[]>('/recipes', { params: { familyId } })
  },
  /** 获取单条菜谱 */
  getRecipe(id: number): Promise<Recipe> {
    return api.get<Recipe>(`/recipes/${id}`)
  },
  /** 创建菜谱（带 familyId 为家庭菜谱，否则为个人菜谱） */
  createRecipe(data: RecipeInput): Promise<Recipe> {
    return api.post<Recipe>('/recipes', data)
  },
  /** 更新菜谱 */
  updateRecipe(id: number, data: Partial<RecipeInput>): Promise<Recipe> {
    return api.put<Recipe>(`/recipes/${id}`, data)
  },
  /** 删除菜谱 */
  deleteRecipe(id: number): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/recipes/${id}`)
  },
  /** 获取家庭菜谱 */
  getFamilyRecipes(familyId: string): Promise<Recipe[]> {
    return api.get<Recipe[]>(`/recipes/family/${familyId}`)
  }
}
