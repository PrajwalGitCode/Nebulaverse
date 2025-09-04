import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaRegCommentDots } from "react-icons/fa";

const socket = io("https://nebulaverse.onrender.com");

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [expandedPosts, setExpandedPosts] = useState({});
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id || user?.user?._id;
  const token = user?.token || user?.user?.token;

  // Fetch all posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("https://nebulaverse.onrender.com/api/posts", {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        });
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error("Failed to fetch posts:", err);
      }
    };
    if (token) fetchPosts();
  }, [token]);

  // Socket events for real-time updates
  useEffect(() => {
    socket.on("newPost", (post) => setPosts((prev) => [post, ...prev]));
    socket.on("postUpdated", (updatedPost) =>
      setPosts((prev) =>
        prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
      )
    );

    return () => {
      socket.off("newPost");
      socket.off("postUpdated");
    };
  }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    try {
      const res = await fetch("https://nebulaverse.onrender.com/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({ text: newPost, userId: user._id }),
      });
      if (res.ok) setNewPost("");
    } catch (err) {
      console.error("Failed to create post:", err);
    }
  };

  const handleLike = async (id) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === id) {
          const alreadyLiked = p.likes.some((likeId) => String(likeId) === userId);
          return {
            ...p,
            likes: alreadyLiked
              ? p.likes.filter((uid) => String(uid) !== userId)
              : [...p.likes, userId],
          };
        }
        return p;
      })
    );

    try {
      await fetch(`https://nebulaverse.onrender.com/api/posts/${id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
    } catch (err) {
      console.error("Failed to like/unlike post:", err);
    }
  };

  const handleComment = async (id, text) => {
    if (!text.trim()) return;
    try {
      await fetch(`https://nebulaverse.onrender.com/api/posts/${id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user._id, text }),
      });
    } catch (err) {
      console.error("Failed to comment:", err);
    }
  };

  const toggleComments = (id) =>
    setExpandedPosts((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="min-h-screen bg-black text-white ml-64">
      {/* 👆 added ml-64 to push content after sidebar */}
      <div className="max-w-2xl mx-auto pt-6 px-4 space-y-6">
        {/* Create Post */}
        <form
          onSubmit={handlePost}
          className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 shadow-md"
        >
          <textarea
            placeholder="What's happening?"
            className="w-full p-3 text-lg rounded-xl bg-zinc-900 text-white resize-none focus:ring-2 focus:ring-white focus:outline-none"
            rows={3}
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
          />
          <div className="flex justify-between items-center mt-3">
            <span className="text-sm text-gray-400">
              {280 - newPost.length} characters left
            </span>
            <button className="bg-white text-black hover:bg-gray-200 transition px-5 py-2 rounded-full font-semibold">
              Post
            </button>
          </div>
        </form>

        {/* Posts */}
        {posts.map((post) => (
          <div
            key={post._id}
            className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-md hover:bg-zinc-800/70 transition"
          >
            {/* Username */}
            <div className="flex items-center gap-2">
              <Link
                to={`/profile/${post.user?._id}`}
                className="font-semibold hover:underline"
              >
                {post.user?.username || "Anonymous"}
              </Link>
              <span className="text-sm text-gray-400">
                @{post.user?._id.slice(0, 6)}
              </span>
            </div>

            {/* Post content */}
            <p className="mt-3 text-gray-100 text-lg">{post.text}</p>

            {/* Actions */}
            <div className="flex items-center gap-6 mt-4 text-gray-400">
              <button
                onClick={() => handleLike(post._id)}
                className={`flex items-center gap-2 transition ${post.likes?.some((likeId) => String(likeId) === userId)
                  ? "text-pink-500"
                  : "text-white hover:text-gray-400"
                  }`}
              >
                {post.likes?.some((likeId) => String(likeId) === userId) ? (
                  <FaHeart />
                ) : (
                  <FaRegHeart />
                )}
                <span>{post.likes?.length || 0}</span>
              </button>

              <span className="flex items-center gap-2">
                <FaRegCommentDots />
                {post.comments?.length || 0}
              </span>
            </div>

            {/* Comments */}
            <div className="mt-4 border-t border-zinc-800 pt-3 space-y-3">
              {(expandedPosts[post._id]
                ? post.comments
                : post.comments?.slice(0, 2)
              )?.map((c, i) => (
                <div key={i} className="bg-zinc-900 p-2 rounded-xl">
                  <Link
                    to={`/profile/${c.user?._id}`}
                    className="font-semibold text-white text-sm hover:underline"
                  >
                    {c.user?.username || "User"}
                  </Link>
                  <p className="text-gray-300 text-sm mt-0.5">{c.text}</p>
                </div>
              ))}

              {post.comments?.length > 2 && (
                <button
                  onClick={() => toggleComments(post._id)}
                  className="text-sm text-white hover:underline mt-2"
                >
                  {expandedPosts[post._id]
                    ? "Show less"
                    : `Show more (${post.comments.length - 2})`}
                </button>
              )}

              {/* Reply input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleComment(post._id, e.target.comment.value);
                  e.target.reset();
                }}
                className="flex items-center gap-2 mt-3"
              >
                <input
                  name="comment"
                  placeholder="Write a reply..."
                  className="flex-1 px-4 py-2 rounded-full bg-zinc-900 text-white focus:ring-2 focus:ring-white focus:outline-none text-sm"
                />
                <button className="bg-white text-black hover:bg-gray-200 px-4 py-1.5 rounded-full text-sm font-semibold">
                  Reply
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
