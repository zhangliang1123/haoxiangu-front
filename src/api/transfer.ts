import { api } from './request'
import type { MessageResponse, TransferRequest } from '@/types'

export interface CreateTransferInput {
  recipeId: number
  familyId: string
  applicantName?: string
}

export const transferApi = {
  /** 提交菜谱转入家庭申请（后端会同时生成一条通知） */
  createTransferRequest(data: CreateTransferInput): Promise<TransferRequest> {
    return api.post<TransferRequest>('/transfer-requests', data)
  },
  /** 获取家庭的待审核转入申请（含菜谱与申请人信息） */
  getPendingRequests(familyId: string): Promise<TransferRequest[]> {
    return api.get<TransferRequest[]>(`/transfer-requests/family/${familyId}`)
  },
  /** 审核转入申请（仅管理员） */
  reviewTransferRequest(id: number, approved: boolean): Promise<MessageResponse> {
    return api.put<MessageResponse>(`/transfer-requests/${id}/review`, { approved })
  }
}
