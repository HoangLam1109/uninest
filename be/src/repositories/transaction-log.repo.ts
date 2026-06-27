import { TransactionLogModel, type ITransactionLog } from "../models/TransactionLog.model.js";

export const TransactionLogRepository = {
  create: (data: Partial<ITransactionLog>) => TransactionLogModel.create(data),

  findById: (id: string) => TransactionLogModel.findById(id),

  findByPaymentId: (paymentId: string) =>
    TransactionLogModel.find({ paymentId }).sort({ createdAt: -1 }),

  findByDisbursementId: (disbursementId: string) =>
    TransactionLogModel.find({ disbursementId }).sort({ createdAt: -1 }),

  findAll: (params: {
    direction?: string;
    category?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
    skip: number;
    limit: number;
  }) => {
    const filter: any = {};

    if (params.direction) {
      filter.direction = params.direction;
    }
    if (params.category) {
      filter.category = params.category;
    }
    if (params.status) {
      filter.status = params.status;
    }
    if (params.fromDate || params.toDate) {
      filter.createdAt = {};
      if (params.fromDate) filter.createdAt.$gte = new Date(params.fromDate);
      if (params.toDate) filter.createdAt.$lte = new Date(params.toDate);
    }
    if (params.search) {
      const regex = new RegExp(params.search, "i");
      filter.$or = [
        { referenceId: regex },
        { fromName: regex },
        { toName: regex },
        { note: regex },
      ];
    }

    return TransactionLogModel.find(filter)
      .populate("paymentId", "amount type method status transactionRef")
      .populate("disbursementId", "amount netAmount payoutFee state referenceId")
      .populate("fromUserId", "fullName email phone")
      .populate("toUserId", "fullName email phone")
      .populate("resolvedBy", "fullName email")
      .sort({ createdAt: -1 })
      .skip(params.skip)
      .limit(params.limit);
  },

  countAll: (params: {
    direction?: string;
    category?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
  }) => {
    const filter: any = {};

    if (params.direction) filter.direction = params.direction;
    if (params.category) filter.category = params.category;
    if (params.status) filter.status = params.status;
    if (params.fromDate || params.toDate) {
      filter.createdAt = {};
      if (params.fromDate) filter.createdAt.$gte = new Date(params.fromDate);
      if (params.toDate) filter.createdAt.$lte = new Date(params.toDate);
    }
    if (params.search) {
      const regex = new RegExp(params.search, "i");
      filter.$or = [
        { referenceId: regex },
        { fromName: regex },
        { toName: regex },
        { note: regex },
      ];
    }

    return TransactionLogModel.countDocuments(filter);
  },

  getStats: async () => {
    const [directionalStats, statusStats, totalAmounts] = await Promise.all([
      // Tổng quan theo direction
      TransactionLogModel.aggregate([
        {
          $group: {
            _id: "$direction",
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
            totalNetAmount: { $sum: "$netAmount" },
            totalFee: { $sum: "$fee" },
          },
        },
      ]),
      // Theo status
      TransactionLogModel.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      // Tổng số failed cần xử lý
      TransactionLogModel.aggregate([
        { $match: { status: "FAILED" } },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    return {
      byDirection: directionalStats,
      byStatus: statusStats,
      failedSummary: totalAmounts[0] || { count: 0, totalAmount: 0 },
    };
  },

  findByReferenceId: (referenceId: string) =>
    TransactionLogModel.findOne({ referenceId }),
};
