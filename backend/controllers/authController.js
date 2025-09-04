import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Signup
export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate("friends", "username email");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      friends: user.friends,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("username email _id friends")
      .populate("friends", "username email _id");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      friends: user.friends || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
