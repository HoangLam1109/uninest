import { Schema, model, Document, Types } from "mongoose";

export enum ROOM_TYPE {
  STUDIO = "STUDIO",
  SINGLE = "SINGLE",
  SHARED = "SHARED",
  APARTMENT = "APARTMENT",
}

export enum ROOM_STATUS {
  AVAILABLE = "AVAILABLE",
  RENTED = "RENTED",
  MAINTENANCE = "MAINTENANCE",
}

export interface IRoom extends Document {
  landlordId: Types.ObjectId;
  amenities: Types.ObjectId[];
  title: string;
  description?: string;
  address: string;
  city?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  pricePerMonth: number;
  depositAmount?: number;
  areaSqm?: number;
  maxOccupants: number;
  roomType?: ROOM_TYPE;
  status: ROOM_STATUS;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amenities: {
      type: [Schema.Types.ObjectId],
      ref: "Amenity",
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    city: String,
    district: String,
    latitude: Number,
    longitude: Number,
    pricePerMonth: {
      type: Number,
      required: true,
    },
    depositAmount: {
      type: Number,
    },
    areaSqm: {
      type: Number,
    },
    maxOccupants: {
      type: Number,
      default: 1,
    },
    roomType: {
      type: String,
      enum: Object.values(ROOM_TYPE),
    },
    status: {
      type: String,
      enum: Object.values(ROOM_STATUS),
      default: ROOM_STATUS.AVAILABLE,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const RoomModel = model<IRoom>("Room", RoomSchema);