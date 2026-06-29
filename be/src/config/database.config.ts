import mongoose from "mongoose";
import "./env.js";

async function ensurePaymentIndexes() {
  const collection = mongoose.connection.db?.collection("payments");
  if (!collection) return;

  const indexes = await collection.indexes();

  // Drop legacy 2-field unique index (bookingId, payerId) — đã được thay bằng
  // 4-field sparse index {bookingId, payerId, type, invoiceId} trong Payment.model.ts
  const legacyIndex = indexes.find((idx) => {
    return (
      idx.unique === true &&
      idx.key?.bookingId === 1 &&
      idx.key?.payerId === 1 &&
      Object.keys(idx.key).length === 2
    );
  });

  if (legacyIndex?.name) {
    try {
      await collection.dropIndex(legacyIndex.name);
      console.log(`Dropped legacy index: ${legacyIndex.name}`);
    } catch (err: any) {
      if (err.code !== 27) {
        console.warn(`Failed to drop legacy index ${legacyIndex.name}: ${err.message}`);
      }
    }
  }

  // Let Mongoose create the schema-level indexes (4-field sparse).
  // PaymentModel ensures uniqueness per (bookingId, payerId, type, invoiceId),
  // allowing multiple rent payments for the same booking across different invoices.
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
