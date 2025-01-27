import React, { useState } from "react";
import axios from "axios";
import "./Login.css"; // Import the CSS file

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "https://momarket-7ata.onrender.com/login",
        { email, password },
        { withCredentials: true }
      );
      localStorage.setItem("adminToken", data.token);
      window.location.href = "/admin/orders";
    } catch (err) {
      console.error("Login error:", err.response?.data || err.message); // Log backend error response
      setError(err.response?.data?.error || "An unexpected error occurred");
    }
  };

  return (
    <div className="container">
      <h2>Admin Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default Login;
