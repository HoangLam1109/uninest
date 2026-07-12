import mongoose, { Document } from "mongoose";

export interface IResetPasswordOtp extends Document {
  email: string;
  otpHash: string;
  expiresAt: Date;
  lastSentAt: Date;
}

const resetPasswordOtpSchema = new mongoose.Schema<IResetPasswordOtp>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    otpHash: {
      type: String,
      required: true,
      trim: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastSentAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
    collection: "reset_password_otps",
  },
);

resetPasswordOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const ResetPasswordOtpModel = mongoose.model<IResetPasswordOtp>(
  "ResetPasswordOtp",
  resetPasswordOtpSchema,
);
