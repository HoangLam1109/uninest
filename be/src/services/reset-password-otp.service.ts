import { ResetPasswordOtpModel } from "../models/ResetPasswordOtp.model.js";
import {
  OTP_TTL_MS,
  OtpRateLimitError,
  RESEND_COOLDOWN_MS,
  createOtp,
  hashOtp,
  normalizeEmail,
  sendOtpEmail,
} from "./email-otp.service.js";

type ResetPasswordOtpRecord = {
  otpHash: string;
  expiresAt: number;
  lastSentAt: number;
};

export class ResetPasswordOtpService {
  async sendOtp(email: string): Promise<void> {
    const normalizedEmail = normalizeEmail(email);
    const existingOtp = await ResetPasswordOtpModel.findOne({ email: normalizedEmail }).lean();
    const now = Date.now();

    if (
      existingOtp &&
      now - new Date(existingOtp.lastSentAt).getTime() < RESEND_COOLDOWN_MS
    ) {
      throw new OtpRateLimitError();
    }

    const otp = createOtp();
    const record: ResetPasswordOtpRecord = {
      otpHash: hashOtp(normalizedEmail, otp),
      expiresAt: now + OTP_TTL_MS,
      lastSentAt: now,
    };

    await ResetPasswordOtpModel.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        otpHash: record.otpHash,
        expiresAt: new Date(record.expiresAt),
        lastSentAt: new Date(record.lastSentAt),
      },
      {
        upsert: true,
        returnDocument: "after",
        setDefaultsOnInsert: true,
      },
    );

    try {
      await sendOtpEmail(normalizedEmail, otp, "reset-password");
    } catch (error) {
      await ResetPasswordOtpModel.deleteOne({ email: normalizedEmail });
      throw error;
    }
  }

  async verifyOtp(email: string, otp: string): Promise<boolean> {
    const normalizedEmail = normalizeEmail(email);
    const record = await ResetPasswordOtpModel.findOne({ email: normalizedEmail }).lean();

    if (!record) return false;

    if (Date.now() > new Date(record.expiresAt).getTime()) {
      await ResetPasswordOtpModel.deleteOne({ email: normalizedEmail });
      return false;
    }

    const isValid = record.otpHash === hashOtp(normalizedEmail, otp);
    if (isValid) {
      await ResetPasswordOtpModel.deleteOne({ email: normalizedEmail });
    }

    return isValid;
  }
}
