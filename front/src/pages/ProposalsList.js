import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import "../pages/Dashboard.css";
import "../pages/CreatePoll.css";



const ProposalsList = () => {
  const [proposals, setProposals] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [agaBalance, setAgaBalance] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchUserAndProposals();
  }, []);

  async function fetchUserAndProposals() {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [userRes, proposalsRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/user/me", { headers }),
        axios.get("http://127.0.0.1:8000/polls/proposals", { headers }),
      ]);

      setUser(userRes.data);
      setAgaBalance(userRes.data.balance || null);

      const now = new Date();
      const filtered = proposalsRes.data.filter((proposal) => {
        if (proposal.approved && proposal.approved_at) {
          const approvedDate = new Date(proposal.approved_at);
          const diff = (now - approvedDate) / (1000 * 60 * 60 * 24);
          return diff <= 1;
        }
        return true;
      });

      setProposals(filtered);
    } catch (error) {
      setMessage("Failed to load proposed polls.");
    }
  }

  async function approvePoll(proposalId) {
    try {
      const token = localStorage.getItem("token");

      // Step 1: Approve in DB
      await axios.post(
        `http://127.0.0.1:8000/polls/approve/${proposalId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Step 2: Send to smart contract
      await axios.post(
        `http://127.0.0.1:8000/polls/send-to-contract/${proposalId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Step 3: Update frontend state
      setProposals((prev) =>
        prev.map((p) =>
          p.id === proposalId
            ? {
                ...p,
                approved_by_admin: true,
                approved: true,
                approved_at: new Date().toISOString(),
              }
            : p
        )
      );
    } catch (error) {
      setMessage("Failed to approve or send to contract.");
      console.error(error);
    }
  }

  async function rejectPoll(proposalId) {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/polls/reject/${proposalId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProposals((prev) => prev.filter((p) => p.id !== proposalId));
    } catch (error) {
      setMessage("Failed to reject poll.");
    }
  }

  const thTdStyle = {
    padding: "14px",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: "16px",
  };

  const buttonStyle = {
    padding: "14px 24px",
    fontSize: "15px",
    fontWeight: 600,
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    minWidth: "110px",
  };

  const approveButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(90deg, #6e8efb, #a777e3)",
    color: "white",
  };

  const rejectButtonStyle = {
    ...buttonStyle,
    background: "linear-gradient(90deg, #ff758c, #ff7eb3)",
    color: "white",
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
          <h2
            style={{
              fontSize: "28px",
              fontWeight: 600,
              textAlign: "center",
              marginBottom: "30px",
              background: "linear-gradient(90deg, #6e8efb, #a777e3)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Proposed Polls
          </h2>

          {proposals.length === 0 ? (
            <p style={{ textAlign: "center" }}>No proposals found.</p>
          ) : (
            <table
  style={{
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 16px",
    tableLayout: "fixed", // 👈 forces even spacing
  }}
>
  <thead>
    <tr style={{ background: "#f4f4f4" }}>
      <th style={{ ...thTdStyle, width: "25%" }}>Poll Name</th>
      <th style={{ ...thTdStyle, width: "30%" }}>Description</th>
      <th style={{ ...thTdStyle, width: "25%" }}>Options</th>
      <th style={{ ...thTdStyle, width: "20%", textAlign: "center" , paddingRight: "60px"}}>Actions</th> {/* 👈 RIGHT align */}
    </tr>
  </thead>
  <tbody>
    {proposals.map((proposal) => (
      <tr
        key={proposal.id}
        style={{
          background: "#fff",
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        }}
      >
        <td style={thTdStyle}>{proposal.name}</td>
        <td style={thTdStyle}>{proposal.description || "No description"}</td>
        <td style={{ ...thTdStyle, paddingRight: "10px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {proposal.candidates.map((c, i) => (
              <span key={i}>{c}</span> // 👈 no bullets
            ))}
          </div>
        </td>
        <td style={{ ...thTdStyle, textAlign: "right" }}> {/* 👈 right align buttons */}
          {!proposal.approved_by_admin ? (
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                style={approveButtonStyle}
                onMouseEnter={(e) => (e.target.style.opacity = 0.9)}
                onMouseLeave={(e) => (e.target.style.opacity = 1)}
                onClick={() => approvePoll(proposal.id)}
              >
                Approve
              </button>
              <button
                style={rejectButtonStyle}
                onMouseEnter={(e) => (e.target.style.opacity = 0.9)}
                onMouseLeave={(e) => (e.target.style.opacity = 1)}
                onClick={() => rejectPoll(proposal.id)}
              >
                Reject
              </button>
            </div>
          ) : proposal.approved ? (
            <span style={{ fontWeight: 600, color: "#4caf50" }}>In Contract ✅</span>
          ) : (
            <span style={{ fontWeight: 600, color: "#ff9800" }}>
              Pending Approval<span className="dot-animation" style={{ display: "inline-block", minWidth: "1.5em" }} />
            </span>
          )}
        </td>
      </tr>
    ))}
  </tbody>
</table>

          )}
        </div>
      </div>
    </div>
  );
};

export default ProposalsList;