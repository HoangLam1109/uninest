import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getApiErrorMessage } from '@/lib/api-error'
import { paymentApi } from '../api/payment.api'
import type { RoleUpgradePayload } from '../types/payment.type'

export function useRoleUpgradePayment() {
  return useMutation({
    mutationFn: async (payload: RoleUpgradePayload) => {
      const { data } = await paymentApi.createRoleUpgradePayment(payload)
      return data.data
    },
    onSuccess: (payment) => {
      toast.success('Đã tạo thanh toán nâng cấp', {
        description: 'Bạn sẽ được chuyển sang PayOS để hoàn tất giao dịch.',
      })
      window.location.assign(payment.checkoutUrl)
    },
    onError: (error) => {
      toast.error('Không thể tạo thanh toán', {
        description: getApiErrorMessage(
          error,
          'Vui lòng kiểm tra tài khoản và thử lại.',
        ),
      })
    },
  })
}

export function usePayInvoice() {
  return useMutation({
    mutationFn: async (invoiceId: string) => {
      const { data } = await paymentApi.payInvoice(invoiceId)
      return data.data
    },
    onSuccess: (payment) => {
      toast.success('Đã tạo thanh toán', {
        description: 'Bạn sẽ được chuyển sang cổng thanh toán PayOS.',
      })
      window.location.assign(payment.checkoutUrl)
    },
    onError: (error) => {
      toast.error('Không thể tạo thanh toán', {
        description: getApiErrorMessage(error, 'Vui lòng thử lại sau.'),
      })
    },
  })
}
