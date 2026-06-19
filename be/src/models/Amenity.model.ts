import { Schema, model, Document } from "mongoose";

export interface IAmenity extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const AmenitySchema = new Schema<IAmenity>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true, // tránh trùng WiFi, Air Conditioner...
    },
  },
  {
    timestamps: true, // tự có createdAt + updatedAt
  }
);

export const AmenityModel = model<IAmenity>("Amenity", AmenitySchema);