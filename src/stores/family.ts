import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Family, User, Notification, OrderRecord, Recipe } from '@/types'

export const useFamilyStore = defineStore('family', () => {
  const families = ref<Family[]>([])
  const currentFamily = ref<Family | null>(null)
  const personalRecipes = ref<Record<number, Recipe[]>>({})

  const generateFamilyId = () => {
    return 'FAM' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase()
  }

  const createFamily = (name: string, admin: User) => {
    const familyId = generateFamilyId()
    const newFamily: Family = {
      id: familyId,
      name,
      adminId: admin.id,
      members: [admin],
      recipes: [
        {
          id: 1,
          name: '红烧肉',
          ingredients: '五花肉 500g、冰糖、料酒、生抽、老抽、姜片、葱段',
          steps: '1. 五花肉切块焯水；2. 锅中炒糖色；3. 放入肉块翻炒上色；4. 加入调料和水，炖煮1小时',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          name: '番茄炒蛋',
          ingredients: '番茄 2个、鸡蛋 3个、盐、糖',
          steps: '1. 番茄切块，鸡蛋打散；2. 炒鸡蛋盛出；3. 炒番茄，加入鸡蛋翻炒；4. 调味出锅',
          createdAt: new Date().toISOString()
        }
      ],
      orderRecords: [],
      notifications: []
    }
    families.value.push(newFamily)
    currentFamily.value = newFamily
    saveToLocalStorage()
    return familyId
  }

  const joinFamily = (familyId: string, user: User) => {
    const family = families.value.find(f => f.id === familyId)
    if (!family) {
      throw new Error('家庭不存在')
    }
    const existingMember = family.members.find(m => m.id === user.id)
    if (!existingMember) {
      family.members.push(user)
    }
    currentFamily.value = family
    saveToLocalStorage()
    return family
  }

  const addNotification = (familyId: string, notification: Notification) => {
    const family = families.value.find(f => f.id === familyId)
    if (family) {
      family.notifications.unshift(notification)
      saveToLocalStorage()
    }
  }

  const markNotificationAsRead = (familyId: string, notificationId: number) => {
    const family = families.value.find(f => f.id === familyId)
    if (family) {
      const notification = family.notifications.find(n => n.id === notificationId)
      if (notification) {
        notification.read = true
        saveToLocalStorage()
      }
    }
  }

  const getUnreadNotifications = (familyId: string) => {
    const family = families.value.find(f => f.id === familyId)
    return family ? family.notifications.filter(n => !n.read) : []
  }

  const addOrderRecord = (familyId: string, orderRecord: OrderRecord) => {
    const family = families.value.find(f => f.id === familyId)
    if (family) {
      family.orderRecords.unshift(orderRecord)
      saveToLocalStorage()
    }
  }

  const addRecipe = (familyId: string, recipe: Recipe) => {
    const family = families.value.find(f => f.id === familyId)
    if (family) {
      family.recipes.push(recipe)
      saveToLocalStorage()
    }
  }

  const updateRecipe = (familyId: string, recipeId: number, recipe: Omit<Recipe, 'id' | 'createdAt'>) => {
    const family = families.value.find(f => f.id === familyId)
    if (family) {
      const index = family.recipes.findIndex(r => r.id === recipeId)
      if (index !== -1) {
        family.recipes[index] = { ...family.recipes[index], ...recipe }
        saveToLocalStorage()
      }
    }
  }

  const deleteRecipe = (familyId: string, recipeId: number) => {
    const family = families.value.find(f => f.id === familyId)
    if (family) {
      family.recipes = family.recipes.filter(r => r.id !== recipeId)
      saveToLocalStorage()
    }
  }

  const saveToLocalStorage = () => {
    localStorage.setItem('families', JSON.stringify(families.value))
    localStorage.setItem('personalRecipes', JSON.stringify(personalRecipes.value))
  }

  const loadFromLocalStorage = () => {
    const savedFamilies = localStorage.getItem('families')
    if (savedFamilies) {
      families.value = JSON.parse(savedFamilies)
    }

    const savedPersonalRecipes = localStorage.getItem('personalRecipes')
    if (savedPersonalRecipes) {
      personalRecipes.value = JSON.parse(savedPersonalRecipes)
    }
  }

  const setCurrentFamily = (familyId: string) => {
    currentFamily.value = families.value.find(f => f.id === familyId) || null
  }

  const getPersonalRecipes = (userId: number) => {
    return personalRecipes.value[userId] || []
  }

  const addPersonalRecipe = (userId: number, recipe: Recipe) => {
    if (!personalRecipes.value[userId]) {
      personalRecipes.value[userId] = []
    }
    personalRecipes.value[userId].push(recipe)
    saveToLocalStorage()
  }

  const updatePersonalRecipe = (userId: number, recipeId: number, recipe: Omit<Recipe, 'id' | 'createdAt'>) => {
    const recipes = personalRecipes.value[userId]
    if (!recipes) return

    const index = recipes.findIndex(item => item.id === recipeId)
    if (index !== -1) {
      recipes[index] = { ...recipes[index], ...recipe }
      saveToLocalStorage()
    }
  }

  const deletePersonalRecipe = (userId: number, recipeId: number) => {
    const recipes = personalRecipes.value[userId]
    if (!recipes) return

    personalRecipes.value[userId] = recipes.filter(recipe => recipe.id !== recipeId)
    saveToLocalStorage()
  }

  return {
    families,
    currentFamily,
    personalRecipes,
    createFamily,
    joinFamily,
    addNotification,
    markNotificationAsRead,
    getUnreadNotifications,
    addOrderRecord,
    addRecipe,
    updateRecipe,
    deleteRecipe,
    loadFromLocalStorage,
    setCurrentFamily,
    getPersonalRecipes,
    addPersonalRecipe,
    updatePersonalRecipe,
    deletePersonalRecipe
  }
})
