import { InvoiceRepository, InvoiceDetailRepository } from "../repositories/invoice.repo.js";
import { BookingRepository } from "../repositories/booking.repo.js";
import { LandlordBankInfoRepository } from "../repositories/landlord-bank-info.repo.js";
import { INVOICE_STATUS } from "../models/Invoice.model.js";
import { PayOSPayoutService } from "./payos-payout.service.js";

export const InvoiceService = {
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

    // Verify landlord has verified bank info (for auto-disburse)
    const verifiedBankInfo = await LandlordBankInfoRepository.findVerifiedByUserId(landlordId);
    if (!verifiedBankInfo) {
      throw new Error("Bạn cần thêm thông tin tài khoản ngân hàng trước khi tạo hóa đơn.");
    }

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

    // Calculate total amount
    const electricityAmount = invoiceData.electricityAmount || 0;
    const waterAmount = invoiceData.waterAmount || 0;
    const additionalFees = invoiceData.additionalFees || 0;
    const subtotal = invoiceData.rentAmount + electricityAmount + waterAmount + additionalFees;

    let payoutFee = 0;
    try { payoutFee = await PayOSPayoutService.calculatePayoutFee(subtotal, verifiedBankInfo.bankBin); } catch { payoutFee = 3300; }
    const totalAmount = subtotal + payoutFee;

    // Create invoice
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
      payoutFee,
      totalAmount,
      notes: invoiceData.notes,
      status: INVOICE_STATUS.DRAFT,
    });

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
    limit: number
  ) => {
    const [invoices, total] = await Promise.all([
      InvoiceRepository.findByLandlordId(landlordId, skip, limit),
      InvoiceRepository.countByLandlordId(landlordId),
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

    // Recalculate total if amounts changed
    let newTotal = invoice.totalAmount;
    let payoutFee = invoice.payoutFee || 0;
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
      const subtotal = rent + electricity + water + fees;
      const bankInfo = await LandlordBankInfoRepository.findVerifiedByUserId(landlordId);
      if (bankInfo) { try { payoutFee = await PayOSPayoutService.calculatePayoutFee(subtotal, bankInfo.bankBin); } catch { payoutFee = 3300; } }
      newTotal = subtotal + payoutFee;
    }

    const updatePayload = {
      ...updateData,
      payoutFee,
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

    // Only allow sending from DRAFT status
    if (invoice.status !== INVOICE_STATUS.DRAFT) {
      throw new Error(`Cannot send invoice with status: ${invoice.status}`);
    }

    const updated = await InvoiceRepository.update(invoiceId, {
      status: INVOICE_STATUS.SENT,
      sentAt: new Date(),
    });

    return updated;
  },

  markAsPaid: async (invoiceId: string, landlordId: string) => {
    const invoice = await InvoiceRepository.findById(invoiceId);
    if (!invoice) {
      throw new Error("Invoice not found");
    }

    // Verify landlord ownership
    if (invoice.landlordId._id.toString() !== landlordId) {
      throw new Error("You do not own this invoice");
    }

    // Only allow marking paid from SENT or OVERDUE status
    if (![INVOICE_STATUS.SENT, INVOICE_STATUS.OVERDUE].includes(invoice.status)) {
      throw new Error(
        `Cannot mark invoice as paid with status: ${invoice.status}`
      );
    }

    const updated = await InvoiceRepository.update(invoiceId, {
      status: INVOICE_STATUS.PAID,
      paidAt: new Date(),
    });

    return updated;
  },

  checkAndMarkOverdue: async () => {
    // Mark invoices as overdue if due date has passed
    const now = new Date();
    const result = await InvoiceRepository.findOverdueInvoices(0, 1000);

    for (const invoice of result) {
      if (invoice.status === INVOICE_STATUS.SENT && invoice.dueDate < now) {
        await InvoiceRepository.update(invoice._id.toString(), {
          status: INVOICE_STATUS.OVERDUE,
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

    // Verify landlord ownership
    if (invoice.landlordId._id.toString() !== landlordId) {
      throw new Error("You do not own this invoice");
    }

    // Only allow deletion of DRAFT invoices
    if (invoice.status !== INVOICE_STATUS.DRAFT) {
      throw new Error(
        `Cannot delete invoice with status: ${invoice.status}`
      );
    }

    // Soft delete
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
