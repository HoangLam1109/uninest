import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { createServer } from "http";
import authRouter from "./routes/auth.route.js";
import roomRouter from "./routes/room.route.js";
import userRouter from "./routes/user.route.js";
import propertyRouter from "./routes/property.route.js";
import favoriteRouter from "./routes/favorite.route.js";
import bookingRouter from "./routes/booking.route.js";
import contractRouter from "./routes/contract.route.js";
import identityRouter from "./routes/identity.route.js";
import invoiceRouter from "./routes/invoice.route.js";
import meterReadingRouter from "./routes/meter-reading.route.js";
import reviewRouter from "./routes/review.route.js";
import chatRouter from "./routes/chat.route.js";
import aiRouter from "./routes/ai.route.js";
import amenityRouter from "./routes/amenity.route.js";
import connectDB from "./config/database.config.js";
import { setupSwagger } from "./swagger.js";
import { initializeChatSocket } from "./socket.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);

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
app.use("/api/users", userRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/rooms", roomRouter);
app.use("/api/favorites", favoriteRouter);
app.use("/api/bookings", bookingRouter);
app.use("/api/contracts", contractRouter);
app.use("/api/identities", identityRouter);
app.use("/api/invoices", invoiceRouter);
app.use("/api/meter-readings", meterReadingRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/chats", chatRouter);
app.use("/api/ai", aiRouter);
app.use("/api/amenities", amenityRouter);

setupSwagger(app);

app.get("/", (_req, res) => {
  res.send("JWT Authentication System is running!");
});

initializeChatSocket(httpServer, frontendOrigin);

httpServer.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
