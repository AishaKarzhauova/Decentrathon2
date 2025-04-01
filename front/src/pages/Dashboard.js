import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import "./Dashboard.css";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [agaBalance, setAgaBalance] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [polls, setPolls] = useState([]);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [latestPolls, setLatestPolls] = useState([]);
  const navigate = useNavigate();

  const headingStyle = {
    fontSize: "30px",
    fontWeight: 600,
    marginBottom: "15px",
    background: "linear-gradient(90deg, #6e8efb, #a777e3)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const pollCardStyle = {
    background: "#2C2C3A",
    padding: "12px",
    borderRadius: "6px",
    marginBottom: "10px",
    border: "1px solid #444",
  };

  useEffect(() => {
    async function fetchLatestPolls() {
      try {
        const response = await axios.get("http://127.0.0.1:8000/polls/list/onchain/active");
        const latest = response.data.slice(0, 5);
        setLatestPolls(latest);
      } catch (error) {
        console.error("Error fetching latest polls:", error);
      }
    }
    fetchLatestPolls();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      try {
        const response = await axios.get("http://127.0.0.1:8000/user/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        const balanceResponse = await axios.get(
          `http://127.0.0.1:8000/user/balance/${response.data.wallet_address}`
        );
        setAgaBalance(balanceResponse.data.balance);
      } catch (error) {
        console.error("Error loading user:", error);
        localStorage.removeItem("token");
        navigate("/");
      }
    };
    fetchUserData();
  }, [navigate]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchActive(false);
      setPolls([]);
      setMessage("");
    }
  }, [searchTerm]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setMessage("Enter a voting name!");
      return;
    }
    setLoading(true);
    setSearchActive(true);
    setMessage("");
    try {
      const response = await axios.get(`http://127.0.0.1:8000/polls/search?name=${encodeURIComponent(searchTerm)}`);
      setPolls(response.data);
    } catch (error) {
      setPolls([]);
      if (error.response?.status === 404) {
        setMessage("Poll not found.");
      } else {
        setMessage("Search error.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestTokens = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("http://127.0.0.1:8000/tokens/request-tokens", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.detail || "Token request failed.");
    }
  };

  return (
    <SidebarLayout
      user={user}
      agaBalance={agaBalance}
      showUserInfo={showUserInfo}
      setShowUserInfo={setShowUserInfo}
      handleRequestTokens={handleRequestTokens}
    >
      <div className="search-container">
        <input
          type="text"
          placeholder="Enter voting name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input-field"
        />
        <button className="gradient-button" onClick={handleSearch}>Search</button>
      </div>

      {searchActive ? (
        <div style={{ marginTop: "30px", width: "100%", maxWidth: "600px" }}>
          <h3 style={headingStyle}>Search Results</h3>
          {loading ? (
            <p style={{ textAlign: "center" }}>🔍 Searching...</p>
          ) : polls.length > 0 ? (
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {polls.map((poll) => (
                <li key={poll.id} style={pollCardStyle}>
                  <p><strong>{poll.name}</strong></p>
                  <button className="gradient-button" onClick={() => navigate(`/vote/${poll.id}`)}>Go to Vote</button>
                </li>
              ))}
            </ul>
          ) : (
            message && <p style={{ textAlign: "center" }}>{message}</p>
          )}
        </div>
      ) : (
        latestPolls.length > 0 && (
          <div style={{ marginTop: "30px", width: "100%", maxWidth: "600px" }}>
            <h3 style={headingStyle}>Recent Active Polls</h3>
            <ul style={{ listStyleType: "none", padding: 0 }}>
              {latestPolls.map((poll) => (
                <li key={poll.id} style={pollCardStyle}>
                  <p><strong>{poll.name}</strong></p>
                  <button className="gradient-button" onClick={() => navigate(`/vote/${poll.id}`)}>Go to Vote</button>
                </li>
              ))}
            </ul>
          </div>
        )
      )}
    </SidebarLayout>
  );
};

export default Dashboard;