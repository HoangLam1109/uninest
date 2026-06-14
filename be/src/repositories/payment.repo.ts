import { PaymentModel, PAYMENT_STATUS, PAYMENT_TYPE } from "../models/Payment.model.js";

export const PaymentRepository = {
  create: (data: any) => PaymentModel.create(data),

  findById: (id: string) =>
    PaymentModel.findById(id)
      .populate("bookingId")
      .populate("paperId", "fullName email phone")
      .populate("receiverId", "fullName email phone")
      .populate("invoiceId")
      .populate("walletTxId"),

  findByInvoice: (invoiceId: string) =>
    PaymentModel.find({ invoiceId })
      .populate("paperId", "fullName email phone")
      .sort({ createdAt: -1 }),

  findByBooking: (bookingId: string) =>
    PaymentModel.find({ bookingId })
      .populate("paperId", "fullName email phone")
      .populate("receiverId", "fullName email phone")
      .sort({ createdAt: -1 }),

  findByPayerId: (paperId: string, skip: number, limit: number) =>
    PaymentModel.find({ paperId })
      .populate("bookingId")
      .populate("receiverId", "fullName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByPayerId: (paperId: string) =>
    PaymentModel.countDocuments({ paperId }),

  findByReceiverId: (receiverId: string, skip: number, limit: number) =>
    PaymentModel.find({ receiverId })
      .populate("bookingId")
      .populate("paperId", "fullName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByReceiverId: (receiverId: string) =>
    PaymentModel.countDocuments({ receiverId }),

  findByTypeAndBooking: (bookingId: string, type: PAYMENT_TYPE) =>
    PaymentModel.findOne({ bookingId, type }),

  findByTransactionRef: (ref: string) =>
    PaymentModel.findOne({ transactionRef: ref }),

  findByStatus: (status: PAYMENT_STATUS, skip: number, limit: number) =>
    PaymentModel.find({ status })
      .populate("paperId", "fullName email phone")
      .populate("receiverId", "fullName email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByStatus: (status: PAYMENT_STATUS) =>
    PaymentModel.countDocuments({ status }),

  update: (id: string, data: any) =>
    PaymentModel.findByIdAndUpdate(
      id,
      { $set: data },
      { returnDocument: "after", runValidators: true }
    ),

  updateByTransactionRef: (ref: string, data: any) =>
    PaymentModel.findOneAndUpdate(
      { transactionRef: ref },
      { $set: data },
      { returnDocument: "after", runValidators: true }
    ),
};
