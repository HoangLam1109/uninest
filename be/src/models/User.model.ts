import mongoose, { Document } from "mongoose";
import type { UserRole } from "../constants/role.constant.js";
import { USER_ROLES } from "../constants/role.constant.js";

export interface IUser extends Document {
  email: string;
  fullName: string;
  phone: string;
  password: string;
  avatarUrl?: string;
  isActive?: boolean;
  role?: UserRole;
  roleExpiresAt?: Date | null;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required!"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: function (value: string): boolean {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: "Invalid email format!",
      },
    },
    fullName: {
      type: String,
      required: [true, "Full name is required!"],
      trim: true,
      minlength: [3, "Full name must be at least 3 characters long!"],
      maxlength: [100, "Full name cannot exceed 100 characters!"],
    },
    phone: {
      type: String,
      required: [true, "Phone is required!"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
    },
    avatarUrl: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.GUEST,
    },
    roleExpiresAt: {
      type: Date,
      default: null,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

userSchema.index({ isActive: 1 });

const User = mongoose.model<IUser>("User", userSchema);

export default User;
