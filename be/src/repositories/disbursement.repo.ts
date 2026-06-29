import { DisbursementModel } from "../models/Disbursement.model.js";

export const DisbursementRepository = {
  create: (data: any) => DisbursementModel.create(data),
  findById: (id: string) => DisbursementModel.findById(id),
  findByPaymentId: (paymentId: string) => DisbursementModel.findOne({ paymentId }),
  findByReferenceId: (referenceId: string) => DisbursementModel.findOne({ referenceId }),
  findByPayoutId: (payoutId: string) => DisbursementModel.findOne({ payoutId }),
  findByLandlord: (landlordId: string, limit = 20, offset = 0) => DisbursementModel.find({ landlordId }).populate("paymentId", "amount type status createdAt").sort({ createdAt: -1 }).skip(offset).limit(limit),
  findPending: (limit = 50) => DisbursementModel.find({ state: { $in: ["PENDING" as any, "PROCESSING" as any] } } as any).populate("paymentId", "amount type status createdAt").populate("landlordId", "fullName email phone").sort({ createdAt: -1 }).limit(limit),
  findAll: (filter: any = {}, limit = 50, offset = 0) => DisbursementModel.find(filter).populate("paymentId", "amount type status createdAt").populate("landlordId", "fullName email phone").sort({ createdAt: -1 }).skip(offset).limit(limit),
  update: (id: string, data: any) => DisbursementModel.findByIdAndUpdate(id, { $set: data }, { returnDocument: "after", runValidators: true }),
  getStats: async () => {
    const filter = (s: string) => ({ state: s } as any);
    const [total, succeeded, failed, processing] = await Promise.all([
      DisbursementModel.countDocuments(),
      DisbursementModel.countDocuments(filter("SUCCEEDED")),
      DisbursementModel.countDocuments(filter("FAILED")),
      DisbursementModel.countDocuments({ state: { $in: ["PENDING" as any, "PROCESSING" as any] } } as any),
    ]);
    const totalAmount = await DisbursementModel.aggregate([{ $match: { state: "SUCCEEDED" } as any }, { $group: { _id: null, total: { $sum: "$amount" } } }]);
    return { total, succeeded, failed, processing, totalDisbursedAmount: totalAmount[0]?.total ?? 0 };
  },
};
