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

export interface ITenantRef {
  tenantId: Types.ObjectId;
  isPrimaryTenant: boolean;
}

export interface IRoom extends Document {
  propertyId?: Types.ObjectId;
  landlordId: Types.ObjectId;
  amenityIds: Types.ObjectId[];
  title: string;
  description?: string;
  address: string;
  city?: string;
  district?: string;
  ward?: string;
  latitude?: number;
  longitude?: number;
  pricePerMonth: number;
  depositAmount?: number;
  electricityRate?: number;
  waterRate?: number;
  areaSqm?: number;
  maxOccupants: number;
  tenants: ITenantRef[];
  roomType?: ROOM_TYPE;
  status: ROOM_STATUS;
  isPublished: boolean;
  embedding?: number[];
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    propertyId: {
      type: Schema.Types.ObjectId,
      ref: "Property",
      default: null,
    },
    landlordId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amenityIds: {
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
    ward: String,
    latitude: Number,
    longitude: Number,
    pricePerMonth: {
      type: Number,
      required: true,
    },
    depositAmount: {
      type: Number,
    },
    electricityRate: {
      type: Number,
    },
    waterRate: {
      type: Number,
    },
    areaSqm: {
      type: Number,
    },
    maxOccupants: {
      type: Number,
      default: 1,
    },
    tenants: {
      type: [
        {
          tenantId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          isPrimaryTenant: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [],
      validate: {
        validator: function (this: IRoom, value: ITenantRef[]) {
          // At most one primary tenant
          const primaryCount = value.filter((t) => t.isPrimaryTenant).length;
          return primaryCount <= 1;
        },
        message: "Only one tenant can be the primary tenant",
      },
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
    embedding: {
      type: [Number],
      default: [],
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const RoomModel = model<IRoom>("Room", RoomSchema);