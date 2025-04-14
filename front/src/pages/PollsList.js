import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import { FaVoteYea, FaLock } from "react-icons/fa";
import "../pages/Dashboard.css";

const PollsList = () => {
    const [polls, setPolls] = useState([]);
    const [message, setMessage] = useState("");
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [loading, setLoading] = useState(true);

    const [user, setUser] = useState(null);
    const [agaBalance, setAgaBalance] = useState(null);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const navigate = useNavigate();
    const [votes, setVotes] = useState({});


    useEffect(() => {
        const link = document.createElement("link");
        link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap";
        link.rel = "stylesheet";
        document.head.appendChild(link);
        return () => {
            document.head.removeChild(link);
        };
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` };
        axios
            .get("http://127.0.0.1:8000/user/me", { headers })
            .then((res) => {
                setUser(res.data);
                setAgaBalance(res.data.balance || null);
            })
            .catch((err) => console.error("User fetch error:", err));
    }, []);

useEffect(() => {
    async function fetchPolls() {
        try {
            const response = await axios.get("http://127.0.0.1:8000/polls/list/onchain/active");
            setPolls(response.data);
        } catch (error) {
            console.error("Polls fetch error:", error);
            setMessage("Failed to load polls.");
        } finally {
            setTimeout(() => setLoading(false), 1000);
        }
    }

    fetchPolls();
}, []);

useEffect(() => {
    async function fetchVotes() {
        try {
            const response = await axios.get("http://127.0.0.1:8000/polls/votes/all");
            setVotes(response.data); // { pollId: voteCount }
        } catch (error) {
            console.error("Votes fetch error:", error);
        }
    }

    fetchVotes();
}, []);


    const handlePollClick = (pollId) => {
        navigate(`/vote/${pollId}`);
    };

    return (
        <div className="dashboard-container" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
                <SidebarLayout
                    user={user}
                    agaBalance={agaBalance}
                    showUserInfo={showUserInfo}
                    setShowUserInfo={setShowUserInfo}
                    handleRequestTokens={() => {}}
                />
            </div>

            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="collapse-btn">
                {sidebarCollapsed ? "→" : "←"}
            </button>

            <div className="main-content" style={{ padding: "40px", width: "100%" }}>
                <div
                    style={{
                        background: "#fff",
                        padding: "40px",
                        borderRadius: "12px",
                        boxShadow: "0 0 20px rgba(0,0,0,0.05)",
                        width: "100%",
                        maxWidth: "800px",
                        margin: "0 auto",
                    }}
                >
                    <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "30px",
  }}
>
  <h1
    style={{
      fontSize: "28px",
      fontWeight: 700,
      background: "linear-gradient(90deg, #6e8efb, #a777e3)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      margin: 0,
    }}
  >
    List of Polls
  </h1>

  <span
    style={{
      fontWeight: 600,
      background: "linear-gradient(90deg, #6e8efb, #a777e3)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      fontSize: "23px",
    }}
  >
    Total number of polls: {polls.length}
  </span>
</div>


                    {loading ? (
                        <p style={{ textAlign: "center" }}>Loading polls...</p>
                    ) : polls.length === 0 ? (
                        <p style={{ textAlign: "center" }}>No polls available.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            {polls.map((poll, index) => {
                                const isHover = index === hoveredIndex;
                                const isActive = poll.active;

                                return (
                                    <div
                                        key={poll.id}
                                        onMouseEnter={() => setHoveredIndex(index)}
                                        onMouseLeave={() => setHoveredIndex(null)}
                                        className="poll-card"
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            padding: "16px 20px",
                                            borderRadius: "10px",
                                            border: "1px solid #eee",
                                            backgroundColor: isHover ? "#f9f9f9" : "#fff",
                                            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                                            cursor: isActive ? "pointer" : "default",
                                            transition: "0.2s ease",
                                        }}
                                    >
                                        <div>
    <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>
        {poll.name}
    </div>
    <div style={{ fontSize: "0.85rem", color: "#888", marginTop: "4px" }}>
        Total votes: {votes[poll.id] || 0}
    </div>
</div>



                                        {isActive ? (
    <button
        onClick={() => handlePollClick(poll.id)}
        style={{
            background: "linear-gradient(90deg, #6e8efb, #a777e3)",
            border: "none",
            borderRadius: "10px",
            color: "#fff",
            fontWeight: 600,
            padding: "10px 18px", // ⬅️ made bigger
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
        }}
    >
        <FaVoteYea size={18} />

    </button>
) : (
    <div
        style={{
            background: "linear-gradient(90deg, #bdbdbd, #999)",
            borderRadius: "10px",
            padding: "10px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "default",
        }}
    >
        <FaLock size={20} color="#fff" /> {/* ⬅️ white icon only, no text */}
    </div>
)}

                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {message && (
                        <p style={{ marginTop: "20px", textAlign: "center", color: "red" }}>{message}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PollsList;
