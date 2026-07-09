import { InvoiceRepository, InvoiceDetailRepository } from "../repositories/invoice.repo.js";
import { BookingRepository } from "../repositories/booking.repo.js";
import { LandlordPaymentInfoRepository } from "../repositories/landlord-payment-info.repo.js";
import { INVOICE_STATUS, INVOICE_PAYMENT_STATUS } from "../models/Invoice.model.js";
import { PAYMENT_INFO_STATUS } from "../models/LandlordPaymentInfo.model.js";

function buildPaymentNote(template: string, invoiceCode: string): string {
  return template.replace(/\{invoiceCode\}/g, invoiceCode);
}

export const InvoiceService = {
  /**
   * Validate that a landlord has APPROVED payment info.
   * Returns the payment info if valid, throws otherwise.
   */
  validateLandlordPaymentInfo: async (landlordId: string) => {
    const paymentInfo = await LandlordPaymentInfoRepository.findByUserId(landlordId);

    if (!paymentInfo) {
      throw new Error(
        "Vui lòng cập nhật thông tin thanh toán trong hồ sơ trước khi tạo hóa đơn."
      );
    }

    if (paymentInfo.status === PAYMENT_INFO_STATUS.PENDING) {
      throw new Error(
        "Thông tin thanh toán của bạn đang chờ admin duyệt. Vui lòng đợi đến khi được duyệt trước khi tạo hóa đơn."
      );
    }

    if (paymentInfo.status === PAYMENT_INFO_STATUS.REJECTED) {
      const reason = paymentInfo.rejectionReason || "không rõ lý do";
      throw new Error(
        `Thông tin thanh toán của bạn đã bị từ chối: ${reason}. Vui lòng cập nhật lại.`
      );
    }

    if (!paymentInfo.bankName || !paymentInfo.bankAccountNumber || !paymentInfo.bankAccountHolder) {
      throw new Error(
        "Vui lòng cập nhật đầy đủ thông tin thanh toán (tên ngân hàng, số tài khoản, chủ tài khoản) trong hồ sơ trước khi tạo hóa đơn."
      );
    }

    return paymentInfo;
  },

  createInvoice: async (
    bookingId: string,
    landlordId: string,
    invoiceData: {
      billingMonth: string; // YYYY-MM
      dueDate: Date;
      rentAmount: number;
      electricityAmount?: number;
      waterAmount?: number;
      additionalFees?: number;
      notes?: string;
      detailData?: any;
    }
  ) => {
    // Verify booking exists and landlord owns it
    const booking = await BookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    if ((booking.roomId as any).landlordId.toString() !== landlordId) {
      throw new Error("You do not own this booking");
    }

    // Validate landlord has payment info configured (manual bank transfer)
    const paymentInfo = await InvoiceService.validateLandlordPaymentInfo(landlordId);

    // Check if invoice already exists for this month
    const existingInvoice = await InvoiceRepository.findByBookingAndMonth(
      bookingId,
      invoiceData.billingMonth
    );
    if (existingInvoice) {
      throw new Error(
        `Invoice for ${invoiceData.billingMonth} already exists`
      );
    }

    // Calculate total amount (no payout fee in manual flow)
    const electricityAmount = invoiceData.electricityAmount || 0;
    const waterAmount = invoiceData.waterAmount || 0;
    const additionalFees = invoiceData.additionalFees || 0;
    const totalAmount = invoiceData.rentAmount + electricityAmount + waterAmount + additionalFees;

    // Build payment note from template
    const paymentNoteTemplate = paymentInfo.paymentNoteTemplate || "THANHTOAN {invoiceCode}";
    // We'll fill invoiceCode after creation, use placeholder
    const paymentNote = buildPaymentNote(paymentNoteTemplate, "{{invoiceCode}}");

    // Create invoice with payment info snapshot
    const invoice = await InvoiceRepository.create({
      bookingId,
      landlordId,
      tenantId: booking.tenantId,
      billingMonth: invoiceData.billingMonth,
      dueDate: invoiceData.dueDate,
      rentAmount: invoiceData.rentAmount,
      electricityAmount,
      waterAmount,
      additionalFees,
      payoutFee: 0, // No PayOS payout fee
      totalAmount,
      notes: invoiceData.notes,
      status: INVOICE_STATUS.DRAFT,
      // Payment info snapshot (manual bank transfer)
      paymentBankName: paymentInfo.bankName,
      paymentAccountNumber: paymentInfo.bankAccountNumber,
      paymentAccountHolder: paymentInfo.bankAccountHolder,
      paymentQrUrl: paymentInfo.paymentQrUrl || "",
      paymentNote,
      paymentMethodType: "manual_bank_transfer",
      paymentStatus: INVOICE_PAYMENT_STATUS.UNPAID,
    });

    // Update payment note with actual invoice code
    const invoiceCode = (invoice as any)._id.toString().slice(-8).toUpperCase();
    const finalPaymentNote = buildPaymentNote(paymentNoteTemplate, invoiceCode);
    if (finalPaymentNote !== paymentNote) {
      await InvoiceRepository.update(invoice._id.toString(), { paymentNote: finalPaymentNote });
      invoice.paymentNote = finalPaymentNote;
    }

    // Create invoice detail if provided
    if (invoiceData.detailData) {
      await InvoiceDetailRepository.create({
        invoiceId: invoice._id,
        ...invoiceData.detailData,
      });
    }

    return invoice;
  },

  getInvoiceById: async (id: string, userId: string) => {
    const invoice = await InvoiceRepository.findById(id);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Verify user is landlord or tenant
    const isLandlord = invoice.landlordId._id.toString() === userId;
    const isTenant = invoice.tenantId._id.toString() === userId;

    if (!isLandlord && !isTenant) {
      throw new Error("You do not have access to this invoice");
    }

    return invoice;
  },

  getInvoicesByLandlord: async (
    landlordId: string,
    skip: number,
    limit: number,
    paymentStatusFilter?: string
  ) => {
    const [invoices, total] = await Promise.all([
      InvoiceRepository.findByLandlordId(landlordId, skip, limit, paymentStatusFilter),
      InvoiceRepository.countByLandlordId(landlordId, paymentStatusFilter),
    ]);

    return { invoices, total };
  },

  getInvoicesByTenant: async (tenantId: string, skip: number, limit: number) => {
    const [invoices, total] = await Promise.all([
      InvoiceRepository.findByTenantId(tenantId, skip, limit),
      InvoiceRepository.countByTenantId(tenantId),
    ]);

    return { invoices, total };
  },

  updateInvoice: async (
    invoiceId: string,
    landlordId: string,
    updateData: {
      rentAmount?: number;
      electricityAmount?: number;
      waterAmount?: number;
      additionalFees?: number;
      notes?: string;
      dueDate?: Date;
    }
  ) => {
    const invoice = await InvoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Only allow updates on DRAFT status
    if (invoice.status !== INVOICE_STATUS.DRAFT) {
      throw new Error(`Cannot update invoice with status: ${invoice.status}`);
    }

    // Verify landlord ownership
    if (invoice.landlordId._id.toString() !== landlordId) {
      throw new Error("You do not own this invoice");
    }

    // Recalculate total if amounts changed (no payout fee)
    let newTotal = invoice.totalAmount;
    if (
      updateData.rentAmount ||
      updateData.electricityAmount !== undefined ||
      updateData.waterAmount !== undefined ||
      updateData.additionalFees !== undefined
    ) {
      const rent = updateData.rentAmount || invoice.rentAmount;
      const electricity = updateData.electricityAmount !== undefined ? updateData.electricityAmount : invoice.electricityAmount || 0;
      const water = updateData.waterAmount !== undefined ? updateData.waterAmount : invoice.waterAmount || 0;
      const fees = updateData.additionalFees !== undefined ? updateData.additionalFees : invoice.additionalFees || 0;
      newTotal = rent + electricity + water + fees;
    }

    const updatePayload = {
      ...updateData,
      payoutFee: 0,
      totalAmount: newTotal,
    };

    const updated = await InvoiceRepository.update(invoiceId, updatePayload);
    return updated;
  },

  sendInvoice: async (invoiceId: string, landlordId: string) => {
    const invoice = await InvoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Verify landlord ownership
    if (invoice.landlordId._id.toString() !== landlordId) {
      throw new Error("You do not own this invoice");
    }

    // Re-validate payment info at send time (landlord might have changed it)
    const paymentInfo = await LandlordPaymentInfoRepository.findByUserId(landlordId);
    if (!paymentInfo || paymentInfo.status !== PAYMENT_INFO_STATUS.APPROVED || !paymentInfo.bankName) {
      throw new Error(
        "Thông tin thanh toán của bạn chưa được duyệt hoặc chưa đầy đủ. Vui lòng kiểm tra lại."
      );
    }

    // Only allow sending from DRAFT status
    if (invoice.status !== INVOICE_STATUS.DRAFT) {
      throw new Error(`Cannot send invoice with status: ${invoice.status}`);
    }

    // Refresh payment info snapshot
    const paymentNoteTemplate = paymentInfo.paymentNoteTemplate || "THANHTOAN {invoiceCode}";
    const invoiceCode = invoice._id.toString().slice(-8).toUpperCase();
    const paymentNote = buildPaymentNote(paymentNoteTemplate, invoiceCode);

    const updated = await InvoiceRepository.update(invoiceId, {
      status: INVOICE_STATUS.SENT,
      sentAt: new Date(),
      paymentStatus: INVOICE_PAYMENT_STATUS.UNPAID,
      paymentBankName: paymentInfo.bankName,
      paymentAccountNumber: paymentInfo.bankAccountNumber,
      paymentAccountHolder: paymentInfo.bankAccountHolder,
      paymentQrUrl: paymentInfo.paymentQrUrl || "",
      paymentNote,
    });

    return updated;
  },

  /**
   * Landlord manually marks invoice as PAID (manual bank transfer confirmation)
   */
  markAsPaid: async (invoiceId: string, landlordId: string, landlordNote?: string) => {
    const invoice = await InvoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Verify landlord ownership
    if (invoice.landlordId._id.toString() !== landlordId) {
      throw new Error("You do not own this invoice");
    }

    // Only allow marking paid from SENT, OVERDUE, or PENDING_CONFIRMATION
    const allowedStatuses = [INVOICE_STATUS.SENT, INVOICE_STATUS.OVERDUE];
    if (!allowedStatuses.includes(invoice.status)) {
      throw new Error(
        `Cannot mark invoice as paid with status: ${invoice.status}`
      );
    }

    const now = new Date();
    const updated = await InvoiceRepository.update(invoiceId, {
      status: INVOICE_STATUS.PAID,
      paidAt: now,
      paymentStatus: INVOICE_PAYMENT_STATUS.PAID,
      markedPaidBy: landlordId,
      landlordPaymentNote: landlordNote || "",
    });

    return updated;
  },

  /**
   * Landlord reverts invoice payment status back to UNPAID
   */
  markAsUnpaid: async (invoiceId: string, landlordId: string) => {
    const invoice = await InvoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Verify landlord ownership
    if (invoice.landlordId._id.toString() !== landlordId) {
      throw new Error("You do not own this invoice");
    }

    // Only allow reverting from PAID status
    if (invoice.status !== INVOICE_STATUS.PAID) {
      throw new Error(
        `Cannot mark invoice as unpaid with status: ${invoice.status}`
      );
    }

    const updated = await InvoiceRepository.update(invoiceId, {
      status: INVOICE_STATUS.SENT, // revert to SENT
      paidAt: null,
      paymentStatus: INVOICE_PAYMENT_STATUS.UNPAID,
      markedPaidBy: null,
      landlordPaymentNote: "",
    });

    return updated;
  },

  /**
   * Tenant marks "Tôi đã chuyển khoản" → PENDING_CONFIRMATION
   */
  markPendingConfirmation: async (invoiceId: string, tenantId: string) => {
    const invoice = await InvoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Verify tenant is the one on this invoice
    if (invoice.tenantId._id.toString() !== tenantId) {
      throw new Error("You are not the tenant for this invoice");
    }

    if (![INVOICE_STATUS.SENT, INVOICE_STATUS.OVERDUE].includes(invoice.status)) {
      throw new Error(
        `Cannot confirm payment transfer with status: ${invoice.status}`
      );
    }

    const updated = await InvoiceRepository.update(invoiceId, {
      paymentStatus: INVOICE_PAYMENT_STATUS.PENDING_CONFIRMATION,
    });

    return updated;
  },

  /**
   * Cancel an invoice (landlord only)
   */
  cancelInvoice: async (invoiceId: string, landlordId: string) => {
    const invoice = await InvoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Verify landlord ownership
    if (invoice.landlordId._id.toString() !== landlordId) {
      throw new Error("You do not own this invoice");
    }

    if (invoice.status === INVOICE_STATUS.PAID) {
      throw new Error("Cannot cancel a paid invoice");
    }

    return await InvoiceRepository.update(invoiceId, {
      status: INVOICE_STATUS.CANCELLED,
      paymentStatus: INVOICE_PAYMENT_STATUS.CANCELLED,
    });
  },

  checkAndMarkOverdue: async () => {
    const now = new Date();
    const result = await InvoiceRepository.findOverdueInvoices(0, 1000);

    for (const invoice of result) {
      if (invoice.status === INVOICE_STATUS.SENT && invoice.dueDate < now) {
        await InvoiceRepository.update(invoice._id.toString(), {
          status: INVOICE_STATUS.OVERDUE,
          paymentStatus: INVOICE_PAYMENT_STATUS.OVERDUE,
        });
      }
    }

    return result.length;
  },

  deleteInvoice: async (invoiceId: string, landlordId: string) => {
    const invoice = await InvoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    if (invoice.landlordId._id.toString() !== landlordId) {
      throw new Error("You do not own this invoice");
    }

    if (invoice.status !== INVOICE_STATUS.DRAFT) {
      throw new Error(
        `Cannot delete invoice with status: ${invoice.status}`
      );
    }

    return await InvoiceRepository.softDelete(invoiceId);
  },

  getInvoiceDetail: async (invoiceId: string) => {
    return await InvoiceDetailRepository.findByInvoiceId(invoiceId);
  },

  updateInvoiceDetail: async (
    invoiceId: string,
    detailData: any
  ) => {
    return await InvoiceDetailRepository.update(invoiceId, detailData);
  },
};

