// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Feed from "./components/Feed/Feed";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import ProfilePage from "./components/Profile/ProfilePage";
import UserProfile from "./components/Profile/UserProfile";
import FriendsList from "./components/Profile/FriendsList";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <span className="text-xl">Loading...</span>
      </div>
    );
  }

  return (
    <Router>
      <div className="bg-gradient-to-br from-gray-900 to-black min-h-screen text-white">
        <Navbar user={user} setUser={setUser} />
        <Routes>
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<Signup setUser={setUser} />} />

          <Route
            path="/feed"
            element={user ? <Feed user={user} /> : <Navigate to="/login" />}
          />

          {/* My profile */}
          <Route
            path="/profile"
            element={user ? <ProfilePage user={user} /> : <Navigate to="/login" />}
          />

          {/* Friends list page */}
          <Route
            path="/friends"
            element={user ? <FriendsList /> : <Navigate to="/login" />}
          />

          {/* Other users' profiles */}
          <Route
            path="/profile/:id"
            element={user ? <UserProfile /> : <Navigate to="/login" />}
          />

          <Route
            path="/"
            element={<Navigate to={user ? "/feed" : "/login"} />}
          />
        </Routes>
      </div>
    </Router>
  );
}
