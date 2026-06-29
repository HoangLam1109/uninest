// Chạy: npx tsx scripts/drop-old-payment-index.ts
// Xóa các old unique indexes trên payments để tránh lỗi E11000 duplicate key
// khi tenant thanh toán nhiều hóa đơn khác tháng cho cùng 1 booking.
import mongoose from "mongoose";
import "../src/config/env.js";

async function main() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("❌ MONGO_URI / MONGODB_URI is not set");
    process.exit(1);
  }
  await mongoose.connect(mongoUri);
  const db = mongoose.connection.db!;

  const indexesToDrop = [
    "bookingId_1_payerId_1",           // old 2-field non-sparse index
    "bookingId_1_payerId_1_type_1",    // old 3-field sparse index (thiếu invoiceId)
  ];

  for (const indexName of indexesToDrop) {
    try {
      await db.collection("payments").dropIndex(indexName);
      console.log(`✅ Dropped old index: ${indexName}`);
    } catch (err: any) {
      if (err.code === 27) {
        console.log(`ℹ️ Index already dropped: ${indexName}`);
      } else {
        console.error(`❌ Failed to drop ${indexName}: ${err.message}`);
      }
    }
  }

  // Show remaining indexes
  const remaining = await db.collection("payments").indexes();
  console.log("\nRemaining indexes on payments:");
  for (const idx of remaining) {
    console.log(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
  }

  console.log("\n✅ Done. Restart backend để Mongoose tạo index mới (4-field sparse).");
  await mongoose.disconnect();
}
main();
