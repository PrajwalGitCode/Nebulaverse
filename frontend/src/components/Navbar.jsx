import { Link, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaUser,
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaGalacticRepublic,
  FaUserFriends,
} from "react-icons/fa";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("https://nebulaverse.onrender.com/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error(err);
    }

    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  };

  return (
    <aside className="fixed top-0 left-0 h-full w-64 bg-black text-white shadow-2xl flex flex-col p-6">
      {/* Logo */}
      <div className="mb-12 flex items-center gap-3">
        <Link to="/" className="flex items-center gap-3">
          <FaGalacticRepublic className="text-4xl text-white" />
          <span className="text-2xl font-extrabold tracking-wide text-white">
            NebulaVerse
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-6 text-lg font-medium">
        <Link
          to="/feed"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition"
        >
          <FaHome /> Feed
        </Link>
        <Link
          to="/profile"
          className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition"
        >
          <FaUser /> Profile
        </Link>
        {user && (
          <Link
            to="/friends"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition"
          >
            <FaUserFriends /> Friends
          </Link>
        )}

        {!user && (
          <Link
            to="/login"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition"
          >
            <FaSignInAlt /> Login
          </Link>
        )}
        {!user && (
          <Link
            to="/signup"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition"
          >
            <FaUserPlus /> Signup
          </Link>
        )}

        {user && (
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition text-left"
          >
            <FaSignOutAlt /> Logout
          </button>
        )}
      </nav>

      {/* Footer user info */}
      {user && (
        <div className="mt-auto bg-white/5 p-3 rounded-xl text-sm">
          <p className="font-semibold">{user.user?.username}</p>
          <p className="text-gray-400">@{user.user?._id?.slice(0, 6)}</p>
        </div>
      )}
    </aside>
  );
}
