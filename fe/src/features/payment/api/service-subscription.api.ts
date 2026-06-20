import { api } from '@/lib/axios'
import type {
  ServicePackageListResponse,
} from '../types/service-package.type'

export type SubscriptionResponse = {
  success: boolean
  message: string
  data: {
    _id: string
    userId: string
    packageId: string
    paymentId: string
    startDate: string
    endDate: string
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED'
    autoRenew: boolean
    checkoutUrl?: string
    orderCode?: number
  }
}

export type ActiveSubscriptionResponse = {
  success: boolean
  data: {
    subscription: SubscriptionResponse['data'] | null
    package: ServicePackageListResponse['data'][number] | null
  }
}

export const serviceSubscriptionApi = {
  subscribe: (
    packageId: string,
    payload: { method: string; autoRenew?: boolean },
  ) =>
    api.post<SubscriptionResponse>(
      `/service-subscriptions/packages/${packageId}/subscribe`,
      payload,
    ),

  getMySubscriptions: (params?: { page?: number; limit?: number }) =>
    api.get('/service-subscriptions/my', { params }),

  getActiveSubscription: () =>
    api.get<ActiveSubscriptionResponse>('/service-subscriptions/active'),

  getById: (id: string) =>
    api.get<{ success: boolean; data: SubscriptionResponse['data'] }>(
      `/service-subscriptions/${id}`,
    ),

  cancel: (id: string) =>
    api.post<{ success: boolean; message: string }>(
      `/service-subscriptions/${id}/cancel`,
    ),
}
