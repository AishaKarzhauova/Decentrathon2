import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import "../pages/Dashboard.css";

const VoteHistory = () => {
  const [history, setHistory] = useState([]);
  const [polls, setPolls] = useState([]);
  const [user, setUser] = useState(null);
  const [agaBalance, setAgaBalance] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [onchainPolls, setOnchainPolls] = useState([]);
  const [onchainLoading, setOnchainLoading] = useState(true); // 🆕
  const [loadingDots, setLoadingDots] = useState(".");

  useEffect(() => {
    if (!onchainLoading) return;

    const interval = setInterval(() => {
      setLoadingDots((prev) => (prev.length >= 3 ? "." : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [onchainLoading]);


  useEffect(() => {
    const fetchAll = async () => {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      try {
        const [userRes, historyRes, pollsRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/user/me", { headers }),
          axios.get("http://127.0.0.1:8000/votes/vote-history", { headers }),
          axios.get("http://127.0.0.1:8000/polls/list/", { headers }),
        ]);

        setUser(userRes.data);
        setAgaBalance(userRes.data.balance || null);
        setHistory(historyRes.data);
        setPolls(pollsRes.data);
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    fetchAll();
  }, []);

    useEffect(() => {
      const fetchOnchainPolls = async () => {
        try {
          const response = await axios.get("http://127.0.0.1:8000/polls/list/onchain/");
          setOnchainPolls(response.data);
        } catch (err) {
          console.error("Failed to fetch on-chain polls:", err);
        } finally {
          setOnchainLoading(false); // ✅ mark done
        }
      };

      fetchOnchainPolls();
    }, []);



  const headingStyle = {
    fontSize: "28px",
    fontWeight: 600,
    textAlign: "center",
    marginBottom: "20px",
    background: "linear-gradient(90deg, #6e8efb, #a777e3)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "16px",
  };

  const thTdStyle = {
    padding: "12px",
    borderBottom: "1px solid #eee",
    textAlign: "left",
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
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <h2 style={headingStyle}>Your Voting History</h2>

          {history.length === 0 ? (
            <p style={{ textAlign: "center" }}>You haven’t participated in any polls yet.</p>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr style={{ background: "#f4f4f4" }}>
                  <th style={thTdStyle}>Poll ID</th>
                  <th style={thTdStyle}>Poll Name</th>
                  <th style={thTdStyle}>Date</th>
                  <th style={thTdStyle}>Time</th>
                  <th style={thTdStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry) => {
                  const poll = polls.find((p) => p.id === entry.poll_id);
                  const name = poll?.name || "Untitled";
                  const date = new Date(entry.timestamp);
                  const matchingPoll = onchainPolls.find((p) => p.id === entry.poll_id);
                    const status = matchingPoll?.active === true
                      ? "Active"
                      : matchingPoll?.active === false
                      ? "Inactive"
                      : "Unknown";

                  return (
                    <tr key={entry.poll_id}>
                      <td style={thTdStyle}>#{entry.poll_id}</td>
                      <td style={thTdStyle}>{name}</td>
                      <td style={thTdStyle}>{date.toLocaleDateString()}</td>
                      <td style={thTdStyle}>{date.toLocaleTimeString()}</td>
                      <td style={thTdStyle}>
                        {onchainLoading ? (
                          <span
                            style={{
                              fontWeight: 600,
                              fontStyle: "italic",
                              background: "linear-gradient(90deg, #6e8efb, #a777e3)",
                              WebkitBackgroundClip: "text",
                              WebkitTextFillColor: "transparent",
                              display: "inline-block",
                              minWidth: "100px",
                            }}
                          >
                            Loading{loadingDots}
                          </span>
                        ) : status === "Active" ? (
                          <span style={{ color: "green", fontWeight: 600 }}>Active</span>
                        ) : status === "Inactive" ? (
                          <span style={{ color: "gray", fontWeight: 600 }}>Inactive</span>
                        ) : (
                          <span style={{ color: "darkred", fontWeight: 600 }}>Unknown</span>
                        )}
                      </td>



                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoteHistory;
