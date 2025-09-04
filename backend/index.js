// server.js
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.js";
import postRoutes from "./routes/posts.js";
import friendRoutes from "./routes/friends.js";

dotenv.config();
const app = express();

// Middlewares
app.use(cors({
  origin: ["https://reliable-empanada-b77023.netlify.app"], // your Netlify frontend
  credentials: true
}));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/friends", friendRoutes);

// Create HTTP server
const server = createServer(app);

// Attach Socket.IO
export const io = new Server(server, {
  cors: {
    origin: ["https://reliable-empanada-b77023.netlify.app"], // use Netlify URL here
    methods: ["GET", "POST"],
    credentials: true
  },
});

io.on("connection", (socket) => {
  console.log("🔌 New client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// Optional: Example for real-time comments
io.on("connection", (socket) => {
  socket.on("newComment", (comment) => {
    io.emit("newComment", comment); // broadcast to all clients
  });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ MongoDB connected");
    server.listen(PORT, () =>
      console.log(`✅ Server running on port ${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
