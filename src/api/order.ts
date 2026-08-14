import { api } from './request'
import type { OrderRecord } from '@/types'

export interface CreateOrderInput {
  /** 选中的菜谱 ID 列表 */
  recipes: number[]
  /** 选中的菜谱名称列表（用于历史展示） */
  recipeNames: string[]
  familyId: string
}

export const orderApi = {
  /** 创建点餐订单（后端会同时生成一条通知） */
  createOrder(data: CreateOrderInput): Promise<OrderRecord> {
    return api.post<OrderRecord>('/orders', data)
  },
  /** 获取家庭的点餐历史（含下单人信息） */
  getFamilyOrders(familyId: string): Promise<OrderRecord[]> {
    return api.get<OrderRecord[]>(`/orders/family/${familyId}`)
  }
}
