import mongoose, { Document } from "mongoose";

export interface IRegisterOtp extends Document {
  email: string;
  otpHash: string;
  expiresAt: Date;
  lastSentAt: Date;
}

const registerOtpSchema = new mongoose.Schema<IRegisterOtp>(
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
    collection: "register_otps",
  },
);

registerOtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RegisterOtpModel = mongoose.model<IRegisterOtp>(
  "RegisterOtp",
  registerOtpSchema,
);
