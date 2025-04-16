import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";

const TokenRequests = () => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [agaBalance, setAgaBalance] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://127.0.0.1:8000/tokens/token-requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(response.data);
    } catch (error) {
      setMessage("Failed to load token requests.");
    }
  };

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://127.0.0.1:8000/tokens/approve-request/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequests();
    } catch (error) {
      setMessage("Error approving request.");
    }
  };

  const handleReject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://127.0.0.1:8000/tokens/reject-request/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchRequests();
    } catch (error) {
      setMessage("Error rejecting request.");
    }
  };

  return (
    <div className="dashboard-container" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarLayout
          user={user}
          agaBalance={agaBalance}
          showUserInfo={showUserInfo}
          setShowUserInfo={setShowUserInfo}
        />
      </div>

      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="collapse-btn"
      >
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
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              fontSize: "26px",
              fontWeight: 700,
              marginBottom: "30px",
              background: "linear-gradient(90deg, #6e8efb, #a777e3)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Token Requests
          </h2>

          {requests.length === 0 ? (
            <p style={{ textAlign: "center" }}>No new requests</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
  <thead>
    <tr style={{ backgroundColor: "#f9f9f9", borderBottom: "1px solid #ddd" }}>
      <th style={{ textAlign: "left", padding: "12px", width: "33%" }}>User ID</th>
      <th style={{ textAlign: "left", padding: "12px", width: "33%" }}>Username</th>
      <th style={{ textAlign: "left", padding: "12px", width: "34%" , paddingLeft: "70px"}}>Actions</th>
    </tr>
  </thead>
  <tbody>
    {requests.map((req) => (
      <tr
        key={req.id}
        style={{
          backgroundColor: "#fff",
          borderBottom: "1px solid #eee",
          transition: "0.2s ease",
        }}
      >
        <td style={{ padding: "14px", fontWeight: 600 }}>{req.id}</td>
        <td style={{ padding: "14px" }}>{req.nickname}</td>
        <td style={{ padding: "14px" }}>
          <div style={{ display: "flex", gap: "12px" }}>
            <button
  onClick={() => handleApprove(req.id)}
  style={{
    background: "linear-gradient(90deg, #6e8efb, #a777e3)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 24px",           // width & height via padding
    height: "45px",                 // fixed height
    minWidth: "100px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "15px",
    transition: "all 0.2s ease",
  }}
  onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
  onMouseLeave={(e) => (e.target.style.opacity = "1")}
>
  Approve
</button>

<button
  onClick={() => handleReject(req.id)}
  style={{
    background: "linear-gradient(90deg, #f06292, #ef5350)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "12px 24px",           // width & height via padding
    height: "45px",                 // fixed height
    minWidth: "100px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "15px",
    transition: "all 0.2s ease",
  }}
  onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
  onMouseLeave={(e) => (e.target.style.opacity = "1")}
>
  Reject
</button>

          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table>

          )}

          {message && (
            <p style={{ color: "red", textAlign: "center", marginTop: "20px" }}>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TokenRequests;
