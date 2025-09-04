// client/src/components/Profile/ProfilePage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaUserFriends, FaUserCircle } from "react-icons/fa";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    postsMade: 0,
    commentsReceived: 0,
    commentsMade: 0,
    totalLikes: 0,
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const token = user?.token;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, requestsRes, postsRes] = await Promise.all([
          fetch("http://localhost:5000/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/friends/requests", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:5000/api/posts", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const profileData = await profileRes.json();
        const requestsData = await requestsRes.json();
        const postsData = await postsRes.json();

        setProfile(profileData);
        setRequests(requestsData);

        // Calculate stats (use profileData.id, not _id)
        const userId = profileData.id;
        const postsMade = postsData.filter((p) => String(p.user?._id) === String(userId)).length;
        const commentsReceived = postsData
          .filter((p) => String(p.user?._id) === String(userId))
          .reduce((sum, p) => sum + (p.comments?.length || 0), 0);
        const commentsMade = postsData.reduce(
          (sum, p) =>
            sum + (p.comments?.filter((c) => String(c.user?._id) === String(userId)).length || 0),
          0
        );
        const totalLikes = postsData
          .filter((p) => String(p.user?._id) === String(userId))
          .reduce((sum, p) => sum + (p.likes?.length || 0), 0);

        setStats({ postsMade, commentsReceived, commentsMade, totalLikes });
      } catch (err) {
        console.error("❌ Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const handleRespond = async (id, action) => {
    try {
      await fetch(`http://localhost:5000/api/friends/${id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action }),
      });
      setRequests((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(`❌ Error responding to request:`, err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-gray-400 ml-64">
        <div className="animate-pulse text-lg">Loading profile...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-6 ml-64">
      {/* 👆 added ml-64 so it shifts to the right, after sidebar */}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Card */}
        <div className="bg-zinc-900 p-8 rounded-xl shadow-lg text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-gray-800 flex items-center justify-center text-5xl font-bold">
              {profile?.username?.[0]?.toUpperCase() || <FaUserCircle />}
            </div>
            <h1 className="text-3xl font-extrabold">{profile?.username}</h1>
          </div>

          {/* Stats Section */}
          <div className="flex flex-wrap justify-center gap-6 mt-6">
            <div className="flex flex-col items-center bg-gray-800 px-6 py-4 rounded-lg hover:bg-gray-700 transition">
              <span className="font-bold text-2xl">{profile?.friends?.length || 0}</span>
              <span className="text-gray-400 flex items-center gap-2">
                <FaUserFriends /> Friends
              </span>
            </div>
            <div className="flex flex-col items-center bg-gray-800 px-6 py-4 rounded-lg hover:bg-gray-700 transition">
              <span className="font-bold text-2xl">{stats.postsMade}</span>
              <span className="text-gray-400">Posts Made</span>
            </div>
            <div className="flex flex-col items-center bg-gray-800 px-6 py-4 rounded-lg hover:bg-gray-700 transition">
              <span className="font-bold text-2xl">{stats.totalLikes}</span>
              <span className="text-gray-400">Likes Received</span>
            </div>
            <div className="flex flex-col items-center bg-gray-800 px-6 py-4 rounded-lg hover:bg-gray-700 transition">
              <span className="font-bold text-2xl">{stats.commentsReceived}</span>
              <span className="text-gray-400">Comments Received</span>
            </div>
            <div className="flex flex-col items-center bg-gray-800 px-6 py-4 rounded-lg hover:bg-gray-700 transition">
              <span className="font-bold text-2xl">{stats.commentsMade}</span>
              <span className="text-gray-400">Comments Made</span>
            </div>
          </div>
        </div>

        {/* Friends List */}
        <div className="bg-zinc-900 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Friends</h2>
          {profile?.friends?.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {profile.friends.map((f) => (
                <Link
                  to={`/profile/${f._id}`}
                  key={f._id}
                  className="min-w-[120px] flex flex-col items-center bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition"
                >
                  <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center text-lg font-bold mb-2">
                    {f.username?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="text-sm">{f.username}</span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No friends yet</p>
          )}
        </div>

        {/* Friend Requests */}
        <div className="bg-zinc-900 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">Friend Requests</h2>
          {requests.length > 0 ? (
            <div className="space-y-3">
              {requests.map((r) => (
                <div
                  key={r._id}
                  className="flex justify-between items-center bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition"
                >
                  <span className="font-medium">{r.from?.username}</span>
                  <div className="space-x-2">
                    <button
                      onClick={() => handleRespond(r._id, "accept")}
                      className="bg-white text-black hover:bg-gray-200 px-3 py-1 rounded text-sm"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRespond(r._id, "ignore")}
                      className="bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No pending requests</p>
          )}
        </div>
      </div>
    </div>
  );
}
