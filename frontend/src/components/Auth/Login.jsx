import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
        navigate("/feed");
      } else {
        alert(data.msg || data.error || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-900 to-black text-white">
      <form onSubmit={handleLogin} className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <input type="email" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-black/40 focus:outline-none" required />
        <input type="password" placeholder="Password" value={password} onChange={(e)=>setPassword(e.target.value)}
          className="w-full p-3 mb-4 rounded bg-black/40 focus:outline-none" required />
        <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition">Login</button>
      </form>
    </div>
  );
}
