import React, { useState, useEffect } from "react";
import SidebarLayout from "../components/SidebarLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../pages/Dashboard.css";
import { FiCopy, FiCheck } from "react-icons/fi";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import "./CreatePoll.css";



const CreatePoll = () => {
  const [pollData, setPollData] = useState({
    name: "",
    description: "",
    candidates: ["", ""],
  });
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [agaBalance, setAgaBalance] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

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
    if (!token) {
      navigate("/");
      return;
    }

    axios
      .get("http://127.0.0.1:8000/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data);
        return axios.get(`http://127.0.0.1:8000/user/balance/${res.data.wallet_address}`);
      })
      .then((balanceRes) => setAgaBalance(balanceRes.data.balance))
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/");
      });
  }, [navigate]);

  const handleChange = (e, index) => {
    const newCandidates = [...pollData.candidates];
    newCandidates[index] = e.target.value;
    setPollData({ ...pollData, candidates: newCandidates });
  };

  const addCandidate = () => {
    if (pollData.candidates.length < 8) {
      setPollData({ ...pollData, candidates: [...pollData.candidates, ""] });
    } else {
      setMessage("Maximum 8 candidates allowed.");
    }
  };

  const removeCandidate = (index) => {
    if (pollData.candidates.length > 2) {
      const updated = pollData.candidates.filter((_, i) => i !== index);
      setPollData({ ...pollData, candidates: updated });
    } else {
      setMessage("Minimum 2 candidates required.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Error: Not authorized.");
      return;
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/polls/create", pollData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage({
        text: "Poll created successfully!",
        hash: response.data.tx_hash,
      });
    } catch (error) {
      setMessage(
        "Error creating poll: " +
          (error.response?.data?.detail || "Unknown error")
      );
    }
  };

const buttonStyle = {
  padding: "14px",
  borderRadius: "8px",
  fontWeight: "bold",
  fontSize: "16px",
  background: "linear-gradient(90deg, #6e8efb, #a777e3)",
  border: "none",
  color: "#fff",
  cursor: "pointer",
  transition: "all 0.2s ease",
  width: "100%",
};



const containerStyle = {
  background: "#fff",
  padding: "40px",
  borderRadius: "12px",
  maxWidth: "700px",
  margin: "0 auto",
  boxShadow: "0 0 20px rgba(0,0,0,0.05)",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
};


const inputStyle = {
  padding: "14px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "1rem",
  width: "100%",
  boxSizing: "border-box",
};

  const headingStyle = {
    fontSize: "28px",
    fontWeight: 600,
    textAlign: "center",
    marginBottom: "15px",
    background: "linear-gradient(90deg, #6e8efb, #a777e3)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  };

  const messageStyle = {
    background: "#f1f1f1",
    padding: "10px",
    borderRadius: "6px",
    textAlign: "center",
    fontWeight: 500,
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

      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="collapse-btn"
      >
        {sidebarCollapsed ? "→" : "←"}
      </button>

      <div className="main-content">
        <div style={containerStyle}>
          <h2 style={headingStyle}>Create a Poll</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <input
              type="text"
              placeholder="Poll Title"
              value={pollData.name}
              onChange={(e) => setPollData({ ...pollData, name: e.target.value })}
              required
              style={inputStyle}
            />

            <textarea
              placeholder="Poll Description"
              value={pollData.description}
              onChange={(e) => setPollData({ ...pollData, description: e.target.value })}
              required
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
            />

            <TransitionGroup>
              {pollData.candidates.map((candidate, index) => {
                const nodeRef = React.createRef();
                return (
                  <CSSTransition
                    key={index}
                    nodeRef={nodeRef}
                    timeout={300}
                    classNames="fade"
                  >
                    <div ref={nodeRef} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                      <input
                        type="text"
                        placeholder={`Candidate ${index + 1}`}
                        value={candidate}
                        onChange={(e) => handleChange(e, index)}
                        required
                        style={inputStyle}
                      />
                      {pollData.candidates.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeCandidate(index)}
                          style={{
                            ...buttonStyle,
                            width: "40px",
                            padding: "0",
                            fontSize: "20px",
                            background: "#eee",
                            color: "#444",
                          }}
                        >
                          −
                        </button>
                      )}
                    </div>
                  </CSSTransition>
                );
              })}
            </TransitionGroup>




            {pollData.candidates.length < 8 && (
              <button type="button" onClick={addCandidate} style={buttonStyle}>
                + Add Candidate
              </button>
            )}

            <button type="submit" style={buttonStyle}>
              Create Poll
            </button>
          </form>

          {message && typeof message === "object" && (
            <div style={messageStyle}>
              <p><strong>{message.text}</strong></p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "8px", flexWrap: "wrap" }}>
                <code
                  style={{
                    background: "#eee",
                    padding: "10px 12px",
                    borderRadius: "6px",
                    fontSize: "0.95rem",
                    wordBreak: "break-all",
                  }}
                >
                  {message.hash}
                </code>


                <button
                  onClick={() => {
                    navigator.clipboard.writeText(message.hash);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000); // reset after 2s
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "10px",
                    borderRadius: "6px",
                    background: "linear-gradient(90deg, #6e8efb, #a777e3)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.3s ease",
                  }}
                  title="Copy to clipboard"
                >
                  {copied ? <FiCheck size={20} /> : <FiCopy size={20} />}
                </button>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                style={{
                  marginTop: "15px",
                  padding: "12px 20px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  borderRadius: "8px",
                  border: "none",
                  background: "linear-gradient(90deg, #6e8efb, #a777e3)",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Back to Dashboard
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default CreatePoll;
