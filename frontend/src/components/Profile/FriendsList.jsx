// client/src/components/Profile/FriendsList.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function FriendsList() {
    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token || user?.user?.token;

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const res = await fetch("https://nebulaverse.onrender.com/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();

                const normalized = (data.friends || []).map((f) =>
                    typeof f === "object" ? f : { _id: f, username: "Unknown" }
                );

                setFriends(normalized);
            } catch (err) {
                console.error("❌ Failed to fetch friends:", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchFriends();
    }, [token]);

    if (loading) {
        return (
            <div className="ml-64 min-h-screen bg-black text-white flex items-center justify-center">
                <p className="text-lg animate-pulse">Loading friends...</p>
            </div>
        );
    }

    return (
        <div className="ml-64 min-h-screen bg-black text-white p-6">
            <h2 className="text-3xl font-bold mb-6">Friends</h2>

            {friends.length > 0 ? (
                <div className="flex flex-col gap-4">
                    {friends.map((f) => (
                        <Link
                            to={`/profile/${f._id}`}
                            key={f._id}
                            className="flex items-center justify-between border-b border-white/20 pb-3 hover:bg-white/5 transition rounded-lg px-2"
                        >
                            {/* Avatar */}
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center text-lg font-bold">
                                    {f.username?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-lg">{f.username}</span>
                                    <span className="text-xs text-white/50">Friend</span>
                                </div>
                            </div>

                            {/* TikTok style follow button */}
                            <button className="px-4 py-1 border border-white rounded-full text-sm font-medium hover:bg-white hover:text-black transition">
                                View
                            </button>
                        </Link>
                    ))}
                </div>
            ) : (
                <p className="text-center text-white/60 mt-20 text-lg">
                    You don’t have any friends yet 😢
                </p>
            )}
        </div>
    );
}
