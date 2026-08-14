// ===== 基础领域类型（与后端 Prisma 模型对齐）=====

/** 用户 */
export interface User {
  id: number
  phone: string
  isAdmin: boolean
  familyId?: string
  createdAt?: string
}

/** 家庭成员（精简视图） */
export interface FamilyMember {
  id: number
  phone: string
  isAdmin: boolean
}

/** 菜谱（个人菜谱 familyId 为空，家庭菜谱 familyId 有值） */
export interface Recipe {
  id: number
  name: string
  ingredients?: string
  steps?: string
  userId?: number
  familyId?: string
  createdAt: string
}

/** 订单记录 */
export interface OrderRecord {
  id: number
  recipes: number[]
  recipeNames: string[]
  userId: number
  familyId: string
  createdAt: string
  user?: { id: number; phone: string }
}

/** 通知 */
export interface Notification {
  id: number
  type: 'order' | 'recipe_transfer' | string
  message: string
  userId: number
  familyId: string
  orderRecordId?: number | null
  transferRequestId?: number | null
  read: boolean
  createdAt: string
}

/** 菜谱转入家庭申请 */
export interface TransferRequest {
  id: number
  recipeId: number
  applicantId: number
  applicantName: string
  familyId: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
  recipe?: Recipe
  applicant?: { id: number; phone: string }
}

/** 家庭（聚合根） */
export interface Family {
  id: string
  name: string
  adminId: number
  createdAt?: string
  members?: FamilyMember[]
  recipes?: Recipe[]
  orderRecords?: OrderRecord[]
  notifications?: Notification[]
  transferRequests?: TransferRequest[]
}

// ===== API 响应类型 =====

export interface AuthResponse {
  token: string
  user: User
  familyId?: string
}

export interface FamilyActionResponse {
  family: Family
  token: string
}

export interface MessageResponse {
  message: string
}
