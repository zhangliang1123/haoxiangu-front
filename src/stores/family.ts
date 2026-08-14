import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { familyApi } from '@/api/family'
import { recipeApi, type RecipeInput } from '@/api/recipe'
import { orderApi } from '@/api/order'
import { notificationApi } from '@/api/notification'
import { transferApi } from '@/api/transfer'
import { useAuthStore } from './auth'
import type {
  Family,
  FamilyMember,
  Notification,
  OrderRecord,
  Recipe,
  TransferRequest
} from '@/types'

type RecipeDraft = Pick<Recipe, 'name' | 'ingredients' | 'steps'>

/**
 * 家庭 store：
 * - 持有当前家庭的聚合视图，并对外暴露菜谱/订单/通知/转入申请的各类操作。
 * - 所有写操作均先调用后端接口，成功后同步本地状态，保证与服务端一致。
 */
export const useFamilyStore = defineStore('family', () => {
  const currentFamily = ref<Family | null>(null)
  const familyRecipes = ref<Recipe[]>([])
  const orders = ref<OrderRecord[]>([])
  const notifications = ref<Notification[]>([])
  const pendingTransfers = ref<TransferRequest[]>([])
  const loading = ref(false)

  const familyId = computed(() => currentFamily.value?.id)
  const familyName = computed(() => currentFamily.value?.name)
  const members = computed<FamilyMember[]>(() => currentFamily.value?.members || [])
  const unreadNotifications = computed(() => notifications.value.filter((n) => !n.read))

  /** 加载家庭的全部相关数据 */
  const loadFamily = async (id: string) => {
    loading.value = true
    try {
      const [family, familyOrders, transfers] = await Promise.all([
        familyApi.getFamily(id),
        orderApi.getFamilyOrders(id),
        transferApi.getPendingRequests(id)
      ])
      currentFamily.value = family
      familyRecipes.value = family.recipes || []
      orders.value = familyOrders
      notifications.value = family.notifications || []
      pendingTransfers.value = transfers
    } finally {
      loading.value = false
    }
  }

  /** 仅刷新通知（点餐后管理员侧需要） */
  const refreshNotifications = async () => {
    if (!familyId.value) return
    const family = await familyApi.getFamily(familyId.value)
    notifications.value = family.notifications || []
  }

  /** 仅刷新家庭菜谱（菜谱转入家庭后使用） */
  const refreshFamilyRecipes = async () => {
    if (!familyId.value) return
    familyRecipes.value = await recipeApi.getFamilyRecipes(familyId.value)
  }

  const createFamily = async (name: string) => {
    const authStore = useAuthStore()
    const { family, token } = await familyApi.createFamily(name)
    await loadFamily(family.id)
    authStore.updateToken(token)
    authStore.updateUser({ familyId: family.id, isAdmin: true })
    return family
  }

  const joinFamily = async (id: string) => {
    const authStore = useAuthStore()
    const { family, token } = await familyApi.joinFamily(id)
    await loadFamily(family.id)
    authStore.updateToken(token)
    authStore.updateUser({ familyId: family.id, isAdmin: false })
    return family
  }

  const clearFamily = () => {
    currentFamily.value = null
    familyRecipes.value = []
    orders.value = []
    notifications.value = []
    pendingTransfers.value = []
  }

  // ===== 家庭菜谱 =====
  const addFamilyRecipe = async (draft: RecipeDraft) => {
    const input: RecipeInput = { ...draft, familyId: familyId.value }
    const recipe = await recipeApi.createRecipe(input)
    familyRecipes.value = [recipe, ...familyRecipes.value]
    return recipe
  }

  const updateFamilyRecipe = async (id: number, draft: RecipeDraft) => {
    const recipe = await recipeApi.updateRecipe(id, draft)
    const index = familyRecipes.value.findIndex((r) => r.id === id)
    if (index !== -1) familyRecipes.value[index] = recipe
    return recipe
  }

  const deleteFamilyRecipe = async (id: number) => {
    await recipeApi.deleteRecipe(id)
    familyRecipes.value = familyRecipes.value.filter((r) => r.id !== id)
  }

  // ===== 订单 =====
  const createOrder = async (params: { recipeIds: number[]; recipeNames: string[] }) => {
    if (!familyId.value) throw new Error('未加入家庭')
    const order = await orderApi.createOrder({
      recipes: params.recipeIds,
      recipeNames: params.recipeNames,
      familyId: familyId.value
    })
    orders.value = [order, ...orders.value]
    // 后端会创建通知，刷新通知列表
    await refreshNotifications()
    return order
  }

  // ===== 通知 =====
  const markNotificationAsRead = async (id: number) => {
    await notificationApi.markAsRead(id)
    const target = notifications.value.find((n) => n.id === id)
    if (target) target.read = true
  }

  // ===== 转入申请 =====
  const applyTransferToFamily = async (params: { recipeId: number; applicantName: string }) => {
    if (!familyId.value) throw new Error('未加入家庭')
    await transferApi.createTransferRequest({
      recipeId: params.recipeId,
      familyId: familyId.value,
      applicantName: params.applicantName
    })
    // 通知面向管理员，非管理员侧无需刷新
  }

  const reviewTransferRequest = async (id: number, approved: boolean) => {
    await transferApi.reviewTransferRequest(id, approved)
    // 审核通过会让菜谱转入家庭，整体重载以保持一致
    if (familyId.value) await loadFamily(familyId.value)
  }

  return {
    currentFamily,
    familyRecipes,
    orders,
    notifications,
    pendingTransfers,
    loading,
    familyId,
    familyName,
    members,
    unreadNotifications,
    loadFamily,
    refreshNotifications,
    refreshFamilyRecipes,
    createFamily,
    joinFamily,
    clearFamily,
    addFamilyRecipe,
    updateFamilyRecipe,
    deleteFamilyRecipe,
    createOrder,
    markNotificationAsRead,
    applyTransferToFamily,
    reviewTransferRequest
  }
})
