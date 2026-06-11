import type { Invoice, InvoiceStatus, MeterType } from '../types/invoice.type'

export function formatBillingMonth(billingMonth: string) {
  const [year, month] = billingMonth.split('-')
  if (!year || !month) return billingMonth
  return `Tháng ${Number(month)}/${year}`
}

export function formatInvoiceDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatPrice(value: number) {
  return value.toLocaleString('vi-VN') + 'đ'
}

export const invoiceStatusLabels: Record<InvoiceStatus, string> = {
  DRAFT: 'Nháp',
  SENT: 'Chờ thanh toán',
  PAID: 'Đã thanh toán',
  OVERDUE: 'Quá hạn',
}

export const invoiceStatusStyles: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-600',
  SENT: 'bg-amber-50 text-amber-700',
  PAID: 'bg-emerald-50 text-emerald-700',
  OVERDUE: 'bg-red-50 text-red-700',
}

export function isInvoiceUnpaid(status: InvoiceStatus) {
  return status === 'SENT' || status === 'OVERDUE' || status === 'DRAFT'
}

export function getLandlordName(invoice: Invoice) {
  const landlord = invoice.landlordId
  if (typeof landlord === 'object' && landlord !== null && landlord.fullName) {
    return landlord.fullName
  }
  return 'Chủ nhà'
}

export function getTenantName(invoice: Invoice) {
  const tenant = invoice.tenantId
  if (typeof tenant === 'object' && tenant !== null && tenant.fullName) {
    return tenant.fullName
  }
  return 'Người thuê'
}

export function getRoomTitleFromInvoice(invoice: Invoice) {
  const booking = invoice.bookingId
  if (typeof booking !== 'object' || booking === null) return null
  const room = booking.roomId
  if (typeof room === 'object' && room !== null && room.title) {
    return room.title
  }
  return null
}

export function getBookingRoomId(invoice: Invoice): string | null {
  const booking = invoice.bookingId
  if (typeof booking !== 'object' || booking === null) return null
  const room = booking.roomId
  if (typeof room === 'string') return room
  if (typeof room === 'object' && room !== null && '_id' in room) {
    return String(room._id)
  }
  return null
}

export function sumUnpaidAmount(invoices: Invoice[]) {
  return invoices
    .filter((inv) => isInvoiceUnpaid(inv.status))
    .reduce((sum, inv) => sum + (inv.totalAmount ?? 0), 0)
}

export function sumPaidAmount(invoices: Invoice[]) {
  return invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + (inv.totalAmount ?? 0), 0)
}

// ---- MeterReading helpers ----

export function meterTypeLabel(type: MeterType) {
  return type === 'ELECTRICITY' ? 'Điện' : 'Nước'
}

export function meterUnit(type: MeterType) {
  return type === 'ELECTRICITY' ? 'kWh' : 'm³'
}

export function meterColor(type: MeterType) {
  return type === 'ELECTRICITY' ? '#F59E0B' : '#3B82F6'
}

export function sourceLabel(source: string) {
  const map: Record<string, string> = {
    INITIAL: 'Chỉ số đầu',
    MONTHLY: 'Hàng tháng',
    TENANT_SELF: 'Tự ghi',
    PHOTO: 'Ảnh chụp',
  }
  return map[source] ?? source
}

export function formatMeterDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
