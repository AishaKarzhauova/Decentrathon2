import React, { useState, useEffect } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import { useNavigate } from "react-router-dom";
import "../pages/Dashboard.css";
import "../pages/CreatePoll.css";
import { TransitionGroup, CSSTransition } from "react-transition-group";


const ProposePoll = () => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [candidates, setCandidates] = useState(["", ""]);
    const [message, setMessage] = useState("");
    const [user, setUser] = useState(null);
    const [agaBalance, setAgaBalance] = useState(null);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/");
            return;
        }

        axios.get("http://127.0.0.1:8000/user/me", {
            headers: { Authorization: `Bearer ${token}` }
        }).then((res) => {
            setUser(res.data);
            return axios.get(`http://127.0.0.1:8000/user/balance/${res.data.wallet_address}`);
        }).then((balanceRes) => {
            setAgaBalance(balanceRes.data.balance);
        }).catch(() => {
            localStorage.removeItem("token");
            navigate("/");
        });
    }, [navigate]);

    const handleChange = (e, index) => {
        const updated = [...candidates];
        updated[index] = e.target.value;
        setCandidates(updated);
    };

    const addCandidate = () => {
        if (candidates.length < 8) {
            setCandidates([...candidates, ""]);
        } else {
            setMessage("Maximum 8 candidates allowed.");
        }
    };

    const removeCandidate = (index) => {
        if (candidates.length > 2) {
            const updated = candidates.filter((_, i) => i !== index);
            setCandidates(updated);
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
            await axios.post("http://127.0.0.1:8000/polls/propose", {
                name,
                description,
                candidates
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage("Proposal submitted successfully!");
            setName("");
            setDescription("");
            setCandidates(["", ""]);
        } catch (error) {
            setMessage("Error submitting proposal: " + (error.response?.data?.detail || "Unknown error"));
        }
    };

    // ✅ Styles copied from CreatePoll
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

    const headingStyle = {
        fontSize: "28px",
        fontWeight: 600,
        textAlign: "center",
        marginBottom: "15px",
        background: "linear-gradient(90deg, #6e8efb, #a777e3)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
    };

    const inputStyle = {
        padding: "14px",
        borderRadius: "6px",
        border: "1px solid #ccc",
        fontSize: "1rem",
        width: "100%",
        boxSizing: "border-box",
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

    const messageStyle = {
        background: "#f1f1f1",
        padding: "10px",
        borderRadius: "6px",
        textAlign: "center",
        fontWeight: 500,
    };

    return (
        <div className="dashboard-container">
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
                    <h2 style={headingStyle}>Propose a Poll</h2>
                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <input
                            type="text"
                            placeholder="Poll Title"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            style={inputStyle}
                        />

                        <textarea
                            placeholder="Poll Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                            style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
                        />

                        <TransitionGroup>
                          {candidates.map((candidate, index) => {
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
                                  {candidates.length > 2 && (
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


                        {candidates.length < 8 && (
                            <button type="button" onClick={addCandidate} style={buttonStyle}>
                                + Add Candidate
                            </button>
                        )}

                        <button type="submit" style={buttonStyle}>
                            Submit Proposal
                        </button>
                    </form>

                    {message && (
                      <div>
                        <p style={messageStyle}>{message}</p>
                        <button
                          onClick={() => navigate("/dashboard")}
                          style={{
                            marginTop: "15px",
                            padding: "14px",
                            fontSize: "16px",
                            fontWeight: "bold",
                            borderRadius: "8px",
                            border: "none",
                            background: "linear-gradient(90deg, #6e8efb, #a777e3)",
                            color: "white",
                            cursor: "pointer",
                            width: "100%",
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

export default ProposePoll;
