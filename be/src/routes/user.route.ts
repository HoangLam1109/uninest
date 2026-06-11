import express from "express";


import {
  deleteUser,
  getUserByEmail,
  getUserByFullName,
  getUserByPhone,
  getAllUsers,
  createUser,
  updateUser,
  getUserById,
  searchUsers,
} from "../controllers/user.controller.js";

const router = express.Router();
import authenticateUser from "../middlewares/authenticate.middleware.js";

router.get("/getByEmail/:email", authenticateUser.authenticateUser, getUserByEmail);
router.get("/getByFullName/:fullName", authenticateUser.authenticateUser, getUserByFullName);
router.get("/getByPhone/:phone", authenticateUser.authenticateUser, getUserByPhone);
router.get("/search", authenticateUser.authenticateUser, searchUsers);
router.get("/getAll", authenticateUser.authenticateUser, getAllUsers);
router.post("/create", authenticateUser.authenticateUser, createUser);
router.put("/update/:id", authenticateUser.authenticateUser, updateUser);
router.delete("/delete/:id", authenticateUser.authenticateUser, deleteUser);
router.get("/getById/:id", authenticateUser.authenticateUser, getUserById);

export default router;