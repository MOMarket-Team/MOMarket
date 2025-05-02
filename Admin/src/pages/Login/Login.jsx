import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

const Login = ({ setAdminName }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { data } = await axios.post(
                "https://momarket-7ata.onrender.com/loginA",
                { email, password },
                { withCredentials: true }
            );

            // Store the token and admin name in sessionStorage
            sessionStorage.setItem("adminToken", data.token);
            sessionStorage.setItem("adminName", data.name || "Admin");
            setAdminName(data.name || "Admin"); // Update parent component state

            // Redirect to admin dashboard
            navigate("/admin/orders");
        } catch (err) {
            console.error("Login error:", err.response?.data || err.message);
            setError(err.response?.data?.error || "Invalid credentials. Please try again.");
        } finally {
            setLoading(false);
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
                    autoComplete="username"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
};

export default Login;