import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { sendRequest, respondRequest, getRequests } from "../controllers/friendController.js";

const router = express.Router();

// Get all incoming requests for logged-in user
router.get("/requests", authMiddleware, getRequests);

// Send a request
router.post("/send", authMiddleware, sendRequest);

// Accept / ignore request
router.post("/:id/respond", authMiddleware, respondRequest);

export default router;
