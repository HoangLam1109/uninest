import type { Invoice, InvoicePaymentStatus, InvoiceStatus } from "@/types/invoice";

export function formatBillingMonth(billingMonth?: string) {
  if (!billingMonth) return "—";
  const [year, month] = billingMonth.split("-");
  if (!year || !month) return billingMonth;
  return `Tháng ${Number(month)}/${year}`;
}

export function formatInvoiceDate(iso?: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function invoiceStatusLabel(status: InvoiceStatus) {
  const map: Record<InvoiceStatus, string> = {
    DRAFT: "NHÁP",
    SENT: "CHỜ THANH TOÁN",
    PAID: "ĐÃ THANH TOÁN",
    OVERDUE: "QUÁ HẠN",
    CANCELLED: "ĐÃ HỦY",
  };
  return map[status] ?? status;
}

export function invoicePaymentStatusLabel(status?: InvoicePaymentStatus) {
  if (!status) return "—";
  const map: Record<InvoicePaymentStatus, string> = {
    unpaid: "Chưa thanh toán",
    pending_confirmation: "Chờ xác nhận",
    paid: "Đã thanh toán",
    overdue: "Quá hạn",
    cancelled: "Đã hủy",
  };
  return map[status] ?? status;
}

export function invoiceStatusStyle(status: InvoiceStatus) {
  switch (status) {
    case "PAID":
      return {
        pill: { backgroundColor: "#E2F5E8" },
        text: { color: "#2E8B57" },
      };
    case "OVERDUE":
      return {
        pill: { backgroundColor: "#FDECEC" },
        text: { color: "#D14343" },
      };
    case "SENT":
      return {
        pill: { backgroundColor: "#FFF4D6" },
        text: { color: "#C47A10" },
      };
    case "CANCELLED":
      return {
        pill: { backgroundColor: "#EEF1F5" },
        text: { color: "#6B7280" },
      };
    default:
      return {
        pill: { backgroundColor: "#F0EBE4" },
        text: { color: "#7A6B58" },
      };
  }
}

export function invoicePaymentStatusStyle(status?: InvoicePaymentStatus) {
  switch (status) {
    case "paid":
      return {
        pill: { backgroundColor: "#E2F5E8" },
        text: { color: "#2E8B57" },
      };
    case "pending_confirmation":
      return {
        pill: { backgroundColor: "#E8F0FF" },
        text: { color: "#4B6CB7" },
      };
    case "overdue":
      return {
        pill: { backgroundColor: "#FDECEC" },
        text: { color: "#D14343" },
      };
    case "cancelled":
      return {
        pill: { backgroundColor: "#EEF1F5" },
        text: { color: "#6B7280" },
      };
    default:
      return {
        pill: { backgroundColor: "#FFF4D6" },
        text: { color: "#C47A10" },
      };
  }
}

export function isInvoiceUnpaid(status: InvoiceStatus) {
  return status === "SENT" || status === "OVERDUE";
}

export function canTenantConfirmTransfer(invoice: Invoice) {
  return (
    isInvoiceUnpaid(invoice.status) &&
    invoice.paymentStatus !== "pending_confirmation"
  );
}

export function getLandlordName(invoice: Invoice) {
  const landlord = invoice.landlordId;
  if (typeof landlord === "object" && landlord !== null && landlord.fullName) {
    return landlord.fullName;
  }
  return "Chủ nhà";
}

export function getBookingRoomId(invoice: Invoice): string | null {
  const booking = invoice.bookingId;
  if (typeof booking !== "object" || booking === null) return null;
  const room = booking.roomId;
  if (typeof room === "string") return room;
  if (typeof room === "object" && room !== null && "_id" in room) {
    return String(room._id);
  }
  return null;
}

export function getRoomTitleFromInvoice(invoice: Invoice) {
  const booking = invoice.bookingId;
  if (typeof booking !== "object" || booking === null) return null;
  const room = booking.roomId;
  if (typeof room === "object" && room !== null && room.title) {
    return room.title;
  }
  return null;
}

export function sumUnpaidAmount(invoices: Invoice[]) {
  return invoices
    .filter((inv) => isInvoiceUnpaid(inv.status))
    .reduce((sum, inv) => sum + (inv.totalAmount ?? 0), 0);
}

export function sumPaidAmount(invoices: Invoice[]) {
  return invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + (inv.totalAmount ?? 0), 0);
}

export function getTenantName(invoice: Invoice) {
  const tenant = invoice.tenantId;
  if (typeof tenant === "object" && tenant !== null && tenant.fullName) {
    return tenant.fullName;
  }
  return "Người thuê";
}

export function hasApprovedPaymentInfo(
  paymentInfo?: {
    status?: string;
    bankName?: string;
    bankAccountNumber?: string;
    bankAccountHolder?: string;
  } | null,
) {
  return Boolean(
    paymentInfo?.status === "APPROVED" &&
      paymentInfo.bankName &&
      paymentInfo.bankAccountNumber &&
      paymentInfo.bankAccountHolder,
  );
}
