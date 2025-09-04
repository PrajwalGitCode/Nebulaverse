import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { createPost, getPosts, likePost, commentPost, getPostsByUser } from "../controllers/postController.js";

const router = express.Router();

router.get("/", getPosts);
router.get("/user/:userId", getPostsByUser);
router.post("/", authMiddleware, createPost);
router.post("/:id/like", authMiddleware, likePost);
router.post("/:id/comment", authMiddleware, commentPost);

export default router;
