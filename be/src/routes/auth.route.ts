import {
  getMe,
  refreshToken,
  loginUser,
  logoutUser,
  registerUser,
  sendRegisterOtp,
} from "../controllers/auth.controller.js";
import express from "express";
import authenticateUser from "../middlewares/authenticate.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/register/send-otp", sendRegisterOtp);
router.post("/login", loginUser);
router.get("/me", authenticateUser.authenticateUser, getMe);
router.post("/logout", authenticateUser.authenticateUser, logoutUser);
router.post("/refresh-token", authenticateUser.refreshTokenValidation, refreshToken);

export default router;
