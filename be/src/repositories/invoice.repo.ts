import { InvoiceModel, INVOICE_STATUS } from "../models/Invoice.model.js";
import { InvoiceDetailModel } from "../models/InvoiceDetail.model.js";
import mongoose from "mongoose";

export const InvoiceRepository = {
  create: (data: any) => InvoiceModel.create(data),

  findById: (id: string) =>
    InvoiceModel.findOne({ _id: id, deletedAt: null })
      .populate("bookingId")
      .populate("landlordId", "fullName email phone")
      .populate("tenantId", "fullName email phone"),

  findByLandlordId: (landlordId: string, skip: number, limit: number) =>
    InvoiceModel.find({ landlordId, deletedAt: null })
      .populate("tenantId", "fullName email phone")
      .populate("bookingId", "roomId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByLandlordId: (landlordId: string) =>
    InvoiceModel.countDocuments({ landlordId, deletedAt: null }),

  findByTenantId: (tenantId: string, skip: number, limit: number) =>
    InvoiceModel.find({ tenantId, deletedAt: null })
      .populate("landlordId", "fullName email phone")
      .populate("bookingId", "roomId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByTenantId: (tenantId: string) =>
    InvoiceModel.countDocuments({ tenantId, deletedAt: null }),

  findByBookingAndMonth: (bookingId: string, billingMonth: string) =>
    InvoiceModel.findOne({ bookingId, billingMonth, deletedAt: null }),

  update: (id: string, data: any) =>
    InvoiceModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { $set: data },
      { returnDocument: "after", runValidators: true }
    ),

  softDelete: (id: string) =>
    InvoiceModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      { deletedAt: new Date() },
      { returnDocument: "after" }
    ),

  deleteByBookingId: (bookingId: string) =>
    InvoiceModel.updateMany(
      { bookingId, deletedAt: null },
      { deletedAt: new Date() }
    ),

  findByStatus: (status: string, skip: number, limit: number) =>
    InvoiceModel.find({ status, deletedAt: null })
      .populate("tenantId", "fullName email phone")
      .populate("landlordId", "fullName email phone")
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit),

  countByStatus: (status: string) =>
    InvoiceModel.countDocuments({ status, deletedAt: null }),

  findOverdueInvoices: (skip: number, limit: number) =>
    InvoiceModel.find({
      status: { $in: ["SENT", "DRAFT"] },
      dueDate: { $lt: new Date() },
      deletedAt: null,
    })
      .populate("tenantId", "fullName email phone")
      .populate("landlordId", "fullName email phone")
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limit),

  countOverdueInvoices: () =>
    InvoiceModel.countDocuments({
      status: { $in: ["SENT", "DRAFT"] },
      dueDate: { $lt: new Date() },
      deletedAt: null,
    }),

  /**
   * Tìm hóa đơn gần nhất TRƯỚC billingMonth của cùng hợp đồng (theo contractId).
   * Không lấy hóa đơn đã hủy (CANCELLED) hoặc đã xóa mềm.
   * Trả về hóa đơn đã populate InvoiceDetail.
   */
  findPreviousInvoiceByContractId: async (
    contractId: string,
    billingMonth: string
  ) => {
    const invoices = await InvoiceModel.find({
      contractId,
      billingMonth: { $lt: billingMonth },
      status: { $ne: "CANCELLED" },
      deletedAt: null,
    })
      .sort({ billingMonth: -1 })
      .limit(1)
      .lean();

    if (!invoices.length) return null;

    const invoice = invoices[0];
    const detail = await InvoiceDetailModel.findOne({
      invoiceId: invoice._id,
    }).lean();

    return { invoice, detail };
  },

  /**
   * Tìm hóa đơn gần nhất TRƯỚC billingMonth theo bookingId
   * (fallback khi chưa có contractId).
   */
  findPreviousInvoiceByBookingId: async (
    bookingId: string,
    billingMonth: string
  ) => {
    const invoices = await InvoiceModel.find({
      bookingId,
      billingMonth: { $lt: billingMonth },
      status: { $ne: "CANCELLED" },
      deletedAt: null,
    })
      .sort({ billingMonth: -1 })
      .limit(1)
      .lean();

    if (!invoices.length) return null;

    const invoice = invoices[0];
    const detail = await InvoiceDetailModel.findOne({
      invoiceId: invoice._id,
    }).lean();

    return { invoice, detail };
  },
};

export const InvoiceDetailRepository = {
  create: (data: any) => InvoiceDetailModel.create(data),

  findByInvoiceId: (invoiceId: string) =>
    InvoiceDetailModel.findOne({ invoiceId }),

  update: (invoiceId: string, data: any) =>
    InvoiceDetailModel.findOneAndUpdate(
      { invoiceId },
      { $set: data },
      { returnDocument: "after", upsert: true }
    ),

  deleteByInvoiceId: (invoiceId: string) =>
    InvoiceDetailModel.deleteOne({ invoiceId }),
};
