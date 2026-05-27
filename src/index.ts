import dotenv from "dotenv";

import express from "express";

import authRouter from "./routes/auth.route.js";

import connectDB from "./config/database.config.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import authenticateUser from "./middlewares/authenticate.middleware.js";

dotenv.config();

const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

connectDB();

app.use(express.json());
app.use(cookieParser());
app.use("/api", authRouter);

app.get("/", (req, res) => {
  res.send("JWT Authentication System is running!");
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
