import { Schema, model, Document, Types } from "mongoose";

export enum BANK_INFO_STATUS {
  PENDING_VERIFICATION = "PENDING_VERIFICATION",
  VERIFIED = "VERIFIED",
  REJECTED = "REJECTED",
}

export const VIETNAM_BANK_BINS: Record<string, { bin: string; name: string; shortName: string }> = {
  "970436": { bin: "970436", name: "Ngân hàng TMCP Ngoại Thương Việt Nam", shortName: "Vietcombank" },
  "970418": { bin: "970418", name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam", shortName: "BIDV" },
  "970415": { bin: "970415", name: "Ngân hàng TMCP Công Thương Việt Nam", shortName: "VietinBank" },
  "970405": { bin: "970405", name: "Ngân hàng TMCP Kỹ Thương Việt Nam", shortName: "Techcombank" },
  "970407": { bin: "970407", name: "Ngân hàng TMCP Quân Đội", shortName: "MB Bank" },
  "970422": { bin: "970422", name: "Ngân hàng TMCP Á Châu", shortName: "ACB" },
  "970416": { bin: "970416", name: "Ngân hàng TMCP Sài Gòn Thương Tín", shortName: "Sacombank" },
  "970432": { bin: "970432", name: "Ngân hàng TMCP Việt Nam Thịnh Vượng", shortName: "VPBank" },
  "970437": { bin: "970437", name: "Ngân hàng TMCP Phát triển TP.HCM", shortName: "HDBank" },
  "970429": { bin: "970429", name: "Ngân hàng TMCP Sài Gòn", shortName: "SCB" },
  "970448": { bin: "970448", name: "Ngân hàng TMCP Phương Đông", shortName: "OCB" },
  "970454": { bin: "970454", name: "Ngân hàng TMCP Bưu Điện Liên Việt", shortName: "LienVietPostBank" },
  "970441": { bin: "970441", name: "Ngân hàng TMCP Hàng Hải Việt Nam", shortName: "MSB" },
  "970443": { bin: "970443", name: "Ngân hàng TMCP Đông Nam Á", shortName: "SeABank" },
  "970426": { bin: "970426", name: "Ngân hàng TMCP Tiên Phong", shortName: "TPBank" },
  "970431": { bin: "970431", name: "Ngân hàng TMCP Xuất Nhập Khẩu Việt Nam", shortName: "Eximbank" },
  "970442": { bin: "970442", name: "Ngân hàng TMCP Bắc Á", shortName: "Bac A Bank" },
  "970438": { bin: "970438", name: "Ngân hàng TMCP Quốc Tế Việt Nam", shortName: "VIB" },
  "970452": { bin: "970452", name: "Ngân hàng TMCP Kiên Long", shortName: "KienlongBank" },
  "970425": { bin: "970425", name: "Ngân hàng TMCP An Bình", shortName: "ABBank" },
  "970400": { bin: "970400", name: "Ngân hàng TMCP Sài Gòn Công Thương", shortName: "Saigonbank" },
  "970427": { bin: "970427", name: "Ngân hàng TMCP Việt Á", shortName: "VietABank" },
  "970412": { bin: "970412", name: "Ngân hàng TMCP Nam Á", shortName: "Nam A Bank" },
  "970423": { bin: "970423", name: "Ngân hàng TMCP Đại Chúng Việt Nam", shortName: "PVcomBank" },
  "970408": { bin: "970408", name: "Ngân hàng TMCP Xăng Dầu Petrolimex", shortName: "PG Bank" },
};

export function getBankByBin(bin: string) {
  return VIETNAM_BANK_BINS[bin] ?? null;
}

export function getBankDisplayName(bin: string) {
  const bank = VIETNAM_BANK_BINS[bin];
  return bank ? `${bank.shortName} (${bin})` : bin;
}

export interface ILandlordBankInfo extends Document {
  userId: Types.ObjectId;
  bankBin: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch?: string;
  status: BANK_INFO_STATUS;
  verifiedAt?: Date;
  verifiedBy?: Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LandlordBankInfoSchema = new Schema<ILandlordBankInfo>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    bankBin: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    accountNumber: { type: String, required: true, trim: true },
    accountHolder: { type: String, required: true, trim: true },
    branch: { type: String, trim: true, default: "" },
    status: { type: String, enum: Object.values(BANK_INFO_STATUS), default: BANK_INFO_STATUS.PENDING_VERIFICATION, index: true },
    verifiedAt: { type: Date },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, collection: "landlord_bank_infos" },
);

LandlordBankInfoSchema.index({ userId: 1, status: 1 });
LandlordBankInfoSchema.index({ deletedAt: 1 });

export const LandlordBankInfoModel = model<ILandlordBankInfo>("LandlordBankInfo", LandlordBankInfoSchema);
