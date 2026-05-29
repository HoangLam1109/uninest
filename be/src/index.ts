import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
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

app.get("/", (_req, res) => {
  res.send("JWT Authentication System is running!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
