import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/common/pagination'
import { useGetLandlordBookings } from '@/features/booking/hooks/use-bookings'
import { LandlordDashboardHeader } from '@/features/landlord/components/landlord-dashboard-header'
import { InvoiceCard } from '../components/invoice-card'
import { InvoiceFormModal } from '../components/invoice-form-modal'
import {
  useCreateInvoice,
  useCreateUtilityInvoice,
  useDeleteInvoice,
  useGetLandlordInvoices,
  useMarkInvoicePaid,
  useSendInvoice,
} from '../hooks/use-invoices'
import type { Invoice } from '../types/invoice.type'
import { sumPaidAmount, sumUnpaidAmount, formatPrice } from '../lib/invoice-display'

export function LandlordInvoicesPage() {
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)

  const invoicesQuery = useGetLandlordInvoices({ page, limit: 10 })
  const createInvoice = useCreateInvoice()
  const createUtility = useCreateUtilityInvoice()
  const sendInvoice = useSendInvoice()
  const markPaid = useMarkInvoicePaid()
  const deleteInvoice = useDeleteInvoice()

  const bookingsQuery = useGetLandlordBookings(
    { page: 1, limit: 100, status: 'APPROVED' },
    modalOpen,
  )

  const invoices = invoicesQuery.data?.data ?? []
  const pagination = invoicesQuery.data?.pagination
  const bookings = bookingsQuery.data?.data ?? []

  const isPending =
    createInvoice.isPending ||
    createUtility.isPending ||
    sendInvoice.isPending ||
    markPaid.isPending ||
    deleteInvoice.isPending

  const stats = {
    total: invoices.length,
    paidAmount: sumPaidAmount(invoices),
    unpaidAmount: sumUnpaidAmount(invoices),
    draftCount: invoices.filter((i) => i.status === 'DRAFT').length,
  }

  function handleSend(invoice: Invoice) {
    if (!confirm(`Gửi hóa đơn ${invoice.billingMonth} cho người thuê?`)) return
    sendInvoice.mutate(invoice._id)
  }

  function handleMarkPaid(invoice: Invoice) {
    if (!confirm(`Xác nhận đã thu tiền hóa đơn ${invoice.billingMonth}?`)) return
    markPaid.mutate(invoice._id)
  }

  function handleDelete(invoice: Invoice) {
    if (!confirm(`Xóa hóa đơn ${invoice.billingMonth}?`)) return
    deleteInvoice.mutate(invoice._id)
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <LandlordDashboardHeader
        greeting="Hóa đơn"
        subtitle="Tạo, gửi và theo dõi thanh toán từ người thuê"
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Tổng HĐ</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{stats.total}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Đã thu</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {formatPrice(stats.paidAmount)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Chờ thu</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">
            {formatPrice(stats.unpaidAmount)}
          </p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs font-semibold uppercase text-slate-400">Nháp</p>
          <p className="mt-1 text-2xl font-bold text-primary">{stats.draftCount}</p>
        </div>
      </div>

      {/* Header + Create button */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Danh sách hóa đơn
        </h2>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="size-4" />
          Tạo hóa đơn
        </Button>
      </div>

      {/* Invoice list */}
      {invoicesQuery.isLoading ? (
        <p className="py-12 text-center text-sm text-slate-400">Đang tải...</p>
      ) : invoices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-primary/20 bg-white p-12 text-center">
          <p className="text-lg font-semibold text-slate-500">Chưa có hóa đơn</p>
          <p className="mt-1 text-sm text-slate-400">
            Tạo hóa đơn từ đơn đặt phòng đã được duyệt.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {invoices.map((inv) => (
            <InvoiceCard
              key={inv._id}
              invoice={inv}
              mode="landlord"
              isActionPending={isPending}
              onSend={handleSend}
              onMarkPaid={handleMarkPaid}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 ? (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={setPage}
        />
      ) : null}

      {/* Create Modal */}
      <InvoiceFormModal
        open={modalOpen}
        isPending={isPending}
        bookings={bookings}
        isLoadingBookings={bookingsQuery.isLoading}
        onClose={() => setModalOpen(false)}
        onSubmitManual={(payload) => {
          createInvoice.mutate(payload, { onSuccess: () => setModalOpen(false) })
        }}
        onSubmitUtility={(payload) => {
          createUtility.mutate(payload, { onSuccess: () => setModalOpen(false) })
        }}
      />
    </div>
  )
}
