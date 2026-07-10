export interface User {
  id: number
  phone: string
  isAdmin: boolean
  familyId?: string
}

export interface Family {
  id: string
  name: string
  adminId: number
  members: User[]
  recipes: Recipe[]
  orderRecords: OrderRecord[]
  notifications: Notification[]
}

export interface Recipe {
  id: number
  name: string
  ingredients: string
  steps: string
  createdAt: string
}

export interface OrderRecord {
  id: number
  time: string
  recipes: string
  recipeNames: string[]
  userId: number
  userName: string
}

export interface Notification {
  id: number
  type: 'order'
  message: string
  time: string
  read: boolean
  orderRecord?: OrderRecord
}

export interface AuthState {
  user: User | null
  isLoggedIn: boolean
}
