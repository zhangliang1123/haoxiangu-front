import { api } from './request'
import type { Family, FamilyActionResponse, FamilyMember } from '@/types'

export const familyApi = {
  /** 创建家庭（当前用户成为管理员） */
  createFamily(name: string): Promise<FamilyActionResponse> {
    return api.post<FamilyActionResponse>('/families', { name })
  },
  /** 获取家庭聚合信息（含成员、菜谱、订单、通知、转入申请） */
  getFamily(id: string): Promise<Family> {
    return api.get<Family>(`/families/${id}`)
  },
  /** 加入家庭 */
  joinFamily(id: string): Promise<FamilyActionResponse> {
    return api.post<FamilyActionResponse>(`/families/${id}/join`)
  },
  /** 获取家庭成员列表 */
  getFamilyMembers(id: string): Promise<FamilyMember[]> {
    return api.get<FamilyMember[]>(`/families/${id}/members`)
  }
}
