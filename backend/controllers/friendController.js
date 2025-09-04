import FriendRequest from "../models/FriendRequest.js";
import User from "../models/User.js";

// Get pending requests for logged-in user
export const getRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({ to: req.userId, status: "pending" })
      .populate("from", "username email")
      .populate("to", "username email");

    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Send a new friend request
export const sendRequest = async (req, res) => {
  try {
    const { to } = req.body;

    if (to === req.userId) {
      return res.status(400).json({ msg: "You cannot send a request to yourself" });
    }

    const sender = await User.findById(req.userId);
    const receiver = await User.findById(to);

    if (!receiver) return res.status(404).json({ msg: "User not found" });

    // Already friends?
    if (sender.friends.includes(to)) {
      return res.status(400).json({ msg: "You are already friends" });
    }

    // Existing request check
    const existing = await FriendRequest.findOne({
      $or: [
        { from: req.userId, to, status: "pending" },
        { from: to, to: req.userId, status: "pending" },
      ],
    });
    if (existing) {
      return res.status(400).json({ msg: "Friend request already exists" });
    }

    const request = await FriendRequest.create({ from: req.userId, to });
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Accept or ignore a request
export const respondRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "accept" or "ignore"

    const request = await FriendRequest.findById(id);
    if (!request) return res.status(404).json({ msg: "Request not found" });

    if (request.to.toString() !== req.userId) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ msg: "Request already handled" });
    }

    if (action === "accept") {
      request.status = "accepted";

      await User.findByIdAndUpdate(request.from, { $addToSet: { friends: request.to } });
      await User.findByIdAndUpdate(request.to, { $addToSet: { friends: request.from } });
    } else {
      request.status = "ignored";
    }

    await request.save();
    res.json(request);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
