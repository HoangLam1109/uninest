import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import roomRouter from "./routes/room.route.js";
import propertyRouter from "./routes/property.route.js";
import favoriteRouter from "./routes/favorite.route.js";
import bookingRouter from "./routes/booking.route.js";
import contractRouter from "./routes/contract.route.js";
import invoiceRouter from "./routes/invoice.route.js";
import reviewRouter from "./routes/review.route.js";
import connectDB from "./config/database.config.js";

dotenv.config();

const app = express();

const frontendOrigin = process.env.FRONTEND_URL ?? "http://localhost:5173";

app.use(
  cors({
    origin: frontendOrigin,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

connectDB();

app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/contracts", contractRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/reviews", reviewRouter);

app.get("/", (_req, res) => {
  res.send("JWT Authentication System is running!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
