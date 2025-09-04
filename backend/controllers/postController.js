// Get all posts by a specific user
export const getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "username")
      .populate("comments.user", "username");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// controllers/postController.js
import Post from "../models/Post.js";
import { io } from "../index.js";

export const createPost = async (req, res) => {
  try {
    const post = await Post.create({
      user: req.userId,
      text: req.body.text,
    });

    // populate user before sending/emit
    const populatedPost = await Post.findById(post._id).populate("user", "username");

    io.emit("newPost", populatedPost);
    res.json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const idx = post.likes.indexOf(req.userId);
    if (idx === -1) {
      post.likes.push(req.userId); // like
    } else {
      post.likes.splice(idx, 1); // unlike
    }
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("user", "username")
      .populate("comments.user", "username");

    io.emit("postUpdated", populatedPost);
    res.json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username")
      .populate("comments.user", "username");

    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const commentPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    post.comments.push({ user: req.userId, text: req.body.text });
    await post.save();

    const populatedPost = await Post.findById(post._id)
      .populate("user", "username")
      .populate("comments.user", "username");

    io.emit("postUpdated", populatedPost);
    res.json(populatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

