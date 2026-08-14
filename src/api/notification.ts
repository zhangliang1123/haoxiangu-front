import { api } from './request'
import type { Notification } from '@/types'

export const notificationApi = {
  /** 获取当前用户的通知 */
  getNotifications(): Promise<Notification[]> {
    return api.get<Notification[]>('/notifications')
  },
  /** 标记通知为已读 */
  markAsRead(id: number): Promise<Notification> {
    return api.put<Notification>(`/notifications/${id}/read`)
  }
}
