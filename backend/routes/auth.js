import express from "express";
import { signup, login, getMe, getUserById } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.get("/:id", getUserById);

export default router;
