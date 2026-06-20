import mongoose from "mongoose";
import "./env.js";
import { PaymentModel } from "../models/Payment.model.js";

async function ensurePaymentIndexes() {
  const indexes = await PaymentModel.collection.indexes();
  const legacyBookingPayerIndex = indexes.find((index) => {
    return (
      index.unique === true &&
      index.key?.bookingId === 1 &&
      index.key?.payerId === 1 &&
      !index.partialFilterExpression
    );
  });

  if (legacyBookingPayerIndex?.name) {
    await PaymentModel.collection.dropIndex(legacyBookingPayerIndex.name);
  }

  await PaymentModel.collection.createIndex(
    { bookingId: 1, payerId: 1 },
    {
      name: "bookingId_1_payerId_1",
      unique: true,
      partialFilterExpression: {
        bookingId: { $type: "objectId" },
      },
    },
  );
}

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    await ensurePaymentIndexes();
    console.log("MongoDB is Connected!");
  } catch (error) {
    console.log("MongoDB Connection Error: ", error);
    process.exit(1);
  }
};

export default connectDB;
