import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import agaLogo from "../assets/agapinklogo.png"; // Pink logo

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [agaBalance, setAgaBalance] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showUserInfo, setShowUserInfo] = useState(false); // Toggle state
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            try {
                const response = await axios.get("http://127.0.0.1:8000/user/me", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(response.data);

                const balanceResponse = await axios.get(`http://127.0.0.1:8000/user/balance/${response.data.wallet_address}`);
                setAgaBalance(balanceResponse.data.balance);
            } catch (error) {
                console.error("Error loading user:", error);
                localStorage.removeItem("token");
                navigate("/");
            }
        };

        fetchUserData();
    }, [navigate]);

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <div className="sidebar">
                <img src={agaLogo} alt="Logo" className="logo" />

                {/* User Icon - Always Visible */}
                <div className="user-icon">👤</div>

                {/* User Info Button */}
                <button className="user-info-button" onClick={() => setShowUserInfo(!showUserInfo)}>
                    {showUserInfo ? "Hide Info" : "Show Info"}
                </button>

                {/* User Info - Expands and pushes content down */}
                <div className={`user-info-container ${showUserInfo ? "show" : ""}`}>
                    {user && (
                        <div className="user-info">
                            <p><strong>Name:</strong> {user.first_name} {user.last_name}</p>
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Wallet Address:</strong> {user.wallet_address}</p>
                            <p><strong>AGA Balance:</strong> {agaBalance !== null ? `${agaBalance} AGA` : "Loading..."}</p>
                            <p><strong>Role:</strong> {user.role === "admin" ? "Administrator" : "User"}</p>
                        </div>
                    )}
                </div>

                {/* Sidebar Buttons */}
                <button className="sidebar-button" onClick={() => navigate("/polls")}>All Votings</button>
                <button className="sidebar-button" onClick={() => navigate("/create-poll")}>Create a Vote</button>
                <button className="sidebar-button">Learn More</button>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Search Bar */}
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Enter voting name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field"
                    />
                    <button className="gradient-button">Search</button>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
