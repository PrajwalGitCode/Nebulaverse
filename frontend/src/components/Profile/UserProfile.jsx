import { useEffect, useState } from "react";
import { io } from "socket.io-client";
const socket = io("http://localhost:5000");
import { useParams, Link } from "react-router-dom";
import { FaHeart, FaRegHeart, FaRegCommentDots } from "react-icons/fa";

export default function UserProfile() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [expandedPosts, setExpandedPosts] = useState({});
    const [stats, setStats] = useState({
        totalLikes: 0,
        totalComments: 0,
        commentsMade: 0,
        friends: 0,
        postsMade: 0,
    });

    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user?._id || user?.user?._id;
    const token = user?.token || user?.user?.token;

    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const normalizeFriends = (friends) => {
        if (!friends) return [];
        return friends.map((f) => (typeof f === "object" ? f._id : f));
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Profile
                const resProfile = await fetch(`http://localhost:5000/api/auth/${id}`, { headers });
                const dataProfile = await resProfile.json();
                dataProfile.friends = normalizeFriends(dataProfile.friends);
                setProfile(dataProfile);

                // Current user
                const resMe = await fetch(`http://localhost:5000/api/auth/me`, { headers });
                const dataMe = await resMe.json();
                dataMe.friends = normalizeFriends(dataMe.friends);
                setCurrentUser(dataMe);

                // Relationship
                if (dataMe.friends.includes(id)) {
                    setStatus("friend");
                } else {
                    const reqRes = await fetch(`http://localhost:5000/api/friends/requests`, { headers });
                    const requests = await reqRes.json();
                    const sent = requests.some(
                        (r) => String(r.from?._id) === String(dataMe._id) && String(r.to?._id) === String(id)
                    );
                    setStatus(sent ? "pending" : "canRequest");
                }

                // User's posts
                const resPosts = await fetch(`http://localhost:5000/api/posts/user/${id}`, { headers });
                const dataPosts = await resPosts.json();
                setPosts(dataPosts);

                // Stats
                const totalLikes = dataPosts.reduce((sum, p) => sum + (p.likes?.length || 0), 0);
                const totalComments = dataPosts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);

                // Comments made by this user
                const resAllPosts = await fetch("http://localhost:5000/api/posts", { headers });
                const allPosts = await resAllPosts.json();
                const commentsMade = allPosts.reduce(
                    (sum, p) =>
                        sum + (p.comments?.filter((c) => String(c.user?._id) === String(id)).length || 0),
                    0
                );

                setStats({
                    totalLikes,
                    totalComments,
                    commentsMade,
                    friends: dataProfile.friends.length,
                    postsMade: dataPosts.length,
                });
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchData();

        // Socket.io listeners for real-time updates
        socket.on("postUpdated", (updatedPost) => {
            setPosts((prev) =>
                prev.map((p) => (p._id === updatedPost._id ? updatedPost : p))
            );
        });
        socket.on("newPost", (post) => {
            if (String(post.user?._id) === String(id)) {
                setPosts((prev) => [post, ...prev]);
            }
        });

        return () => {
            socket.off("postUpdated");
            socket.off("newPost");
        };
    }, [id, token]);

    const handleLike = async (postId) => {
        setPosts((prev) =>
            prev.map((p) => {
                if (p._id === postId) {
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
            await fetch(`http://localhost:5000/api/posts/${postId}/like`, {
                method: "POST",
                headers,
                body: JSON.stringify({ userId }),
            });
        } catch (err) {
            console.error("Failed to like/unlike:", err);
        }
    };

    const handleComment = async (postId, text) => {
        if (!text.trim()) return;
        try {
            await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
                method: "POST",
                headers,
                body: JSON.stringify({ userId, text }),
            });
        } catch (err) {
            console.error("Failed to comment:", err);
        }
    };

    const handleFriendRequest = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/friends/send`, {
                method: "POST",
                headers,
                body: JSON.stringify({ to: id }),
            });
            if (res.ok) {
                setStatus("pending");
            }
        } catch (err) {
            console.error("Failed to send request:", err);
        }
    };

    const toggleComments = (postId) =>
        setExpandedPosts((prev) => ({ ...prev, [postId]: !prev[postId] }));

    if (loading) return <p className="text-white text-center mt-20 ml-64">Loading...</p>;
    if (!profile) return <p className="text-red-400 text-center mt-20 ml-64">Profile not found</p>;

    return (
        <div className="min-h-screen bg-black text-white ml-64 p-6">
            {/* Profile Header */}
            <div className="flex justify-center">
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl w-full max-w-md text-center space-y-4 shadow-lg">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center text-3xl font-bold mx-auto">
                        {profile.username?.[0]?.toUpperCase() || "U"}
                    </div>
                    <h2 className="text-2xl font-bold">{profile.username}</h2>
                    <p className="text-gray-400">{profile.email}</p>

                    {/* Friend status */}
                    {status === "friend" && (
                        <div className="mt-4 px-4 py-2 rounded-lg bg-zinc-800 text-white font-semibold">
                            Friend
                        </div>
                    )}
                    {status === "pending" && (
                        <div className="mt-4 px-4 py-2 rounded-lg bg-white text-black font-semibold">
                            Request Sent
                        </div>
                    )}
                    {status === "canRequest" && (
                        <button
                            onClick={handleFriendRequest}
                            className="mt-4 bg-white hover:bg-gray-200 px-4 py-2 rounded-lg text-black font-semibold"
                        >
                            Send Friend Request
                        </button>
                    )}
                </div>
            </div>

            {/* Stats Section */}
            <div className="mt-8 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-center">
                {[
                    { label: "Friends", value: stats.friends, color: "from-yellow-400 to-orange-500" },
                    { label: "Posts Made", value: stats.postsMade, color: "from-purple-400 to-pink-500" },
                    { label: "Likes", value: stats.totalLikes, color: "from-pink-500 to-red-500" },
                    { label: "Comments Recieved", value: stats.totalComments, color: "from-blue-400 to-cyan-500" },
                    { label: "Comments Made", value: stats.commentsMade, color: "from-green-400 to-emerald-500" },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className={`bg-zinc-900 p-5 rounded-2xl shadow transform hover:scale-105 transition`}
                    >
                        <p
                            className={`text-3xl font-extrabold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}
                        >
                            {stat.value}
                        </p>
                        <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* User's Posts */}
            <div className="mt-10 max-w-2xl mx-auto space-y-6">
                <h3 className="text-xl font-bold mb-4">Posts by {profile.username}</h3>
                {posts.length === 0 ? (
                    <p className="text-gray-400 text-center">No posts yet.</p>
                ) : (
                    posts.map((post) => (
                        <div
                            key={post._id}
                            className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-md"
                        >
                            <p className="text-white text-left text-lg">{post.text}</p>
                            <p className="text-gray-500 text-sm mt-2 text-left">
                                {new Date(post.createdAt).toLocaleString()}
                            </p>

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
                                    <div key={i} className="bg-zinc-800 p-2 rounded-xl">
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
                    ))
                )}
            </div>
        </div>
    );
}
