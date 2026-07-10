import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Recipe, OrderRecord } from '@/types'

export const useRecipeStore = defineStore('recipe', () => {
  const recipes = ref<Recipe[]>([
    {
      id: 1,
      name: '红烧肉',
      ingredients: '五花肉 500g、冰糖、料酒、生抽、老抽、姜片、葱段',
      steps: '1. 五花肉切块焯水；2. 锅中炒糖色；3. 放入肉块翻炒上色；4. 加入调料和水，炖煮1小时',
      createdAt: '2024-01-01'
    },
    {
      id: 2,
      name: '番茄炒蛋',
      ingredients: '番茄 2个、鸡蛋 3个、盐、糖',
      steps: '1. 番茄切块，鸡蛋打散；2. 炒鸡蛋盛出；3. 炒番茄，加入鸡蛋翻炒；4. 调味出锅',
      createdAt: '2024-01-02'
    }
  ])

  const orderRecords = ref<OrderRecord[]>([])

  const addRecipe = (recipe: Omit<Recipe, 'id' | 'createdAt'>) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now(),
      createdAt: new Date().toISOString()
    }
    recipes.value.push(newRecipe)
    saveToLocalStorage()
  }

  const updateRecipe = (id: number, recipe: Omit<Recipe, 'id' | 'createdAt'>) => {
    const index = recipes.value.findIndex(r => r.id === id)
    if (index !== -1) {
      recipes.value[index] = { ...recipes.value[index], ...recipe }
      saveToLocalStorage()
    }
  }

  const deleteRecipe = (id: number) => {
    recipes.value = recipes.value.filter(r => r.id !== id)
    saveToLocalStorage()
  }

  const addOrderRecord = (recipeNames: string[]) => {
    const newRecord: OrderRecord = {
      id: Date.now(),
      time: new Date().toLocaleString('zh-CN'),
      recipes: recipeNames.join(', '),
      recipeNames,
      userId: 0,
      userName: '系统'
    }
    orderRecords.value.unshift(newRecord)
    saveOrdersToLocalStorage()
  }

  const saveToLocalStorage = () => {
    localStorage.setItem('recipes', JSON.stringify(recipes.value))
  }

  const saveOrdersToLocalStorage = () => {
    localStorage.setItem('orderRecords', JSON.stringify(orderRecords.value))
  }

  const loadFromLocalStorage = () => {
    const savedRecipes = localStorage.getItem('recipes')
    if (savedRecipes) {
      recipes.value = JSON.parse(savedRecipes)
    }
    const savedOrders = localStorage.getItem('orderRecords')
    if (savedOrders) {
      orderRecords.value = JSON.parse(savedOrders)
    }
  }

  return {
    recipes,
    orderRecords,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    addOrderRecord,
    loadFromLocalStorage
  }
})
