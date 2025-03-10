import React, { useEffect, useState } from "react";
import axios from "axios";

const ProposalsList = () => {
    const [proposals, setProposals] = useState([]);
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchProposals();
    }, []);

    async function fetchProposals() {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get("http://127.0.0.1:8000/polls/proposals", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProposals(response.data);
        } catch (error) {
            setMessage("Ошибка загрузки предложенных голосований.");
        }
    }

    async function approvePoll(proposalId) {
        try {
            const token = localStorage.getItem("token");
            await axios.post(`http://127.0.0.1:8000/polls/approve/${proposalId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage("Голосование одобрено!");
            fetchProposals();
        } catch (error) {
            setMessage("Ошибка одобрения голосования.");
        }
    }

    async function sendToContract(proposalId) {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`http://127.0.0.1:8000/polls/send-to-contract/${proposalId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(`Голосование отправлено в контракт! TX Hash: ${response.data.tx_hash}`);
            fetchProposals();
        } catch (error) {
            setMessage("Ошибка отправки голосования в контракт.");
        }
    }

    // 🔹 Стили
    const pageStyle = {
        minHeight: "100vh",
        margin: 0,
        padding: 0,
        background: "radial-gradient(circle at top, #222 0%, #111 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Montserrat', sans-serif",
    };

    const containerStyle = {
        width: "600px",
        padding: "30px",
        borderRadius: "8px",
        backgroundColor: "rgba(30, 30, 47, 0.9)",
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
        color: "#FFFFFF",
    };

    const headerStyle = {
        marginBottom: "20px",
        textAlign: "center",
        color: "#00FFC2",
        fontSize: "1.5rem",
        fontWeight: 600,
        textShadow: "0 0 5px rgba(0,255,194,0.4)",
    };

    const listStyle = {
        listStyleType: "none",
        padding: 0,
    };

    const listItemStyle = {
        padding: "12px",
        borderBottom: "1px solid #444",
        marginBottom: "10px",
    };

    const candidateListStyle = {
        listStyleType: "none",
        paddingLeft: "15px",
        marginBottom: "10px",
    };

    const buttonStyle = {
        padding: "8px 14px",
        borderRadius: "6px",
        border: "none",
        fontWeight: 600,
        cursor: "pointer",
        transition: "background-color 0.2s ease",
    };

    const approveButtonStyle = {
        ...buttonStyle,
        backgroundColor: "#00FFC2",
        color: "#000",
    };

    const contractButtonStyle = {
        ...buttonStyle,
        backgroundColor: "#FFA500",
        color: "#000",
    };

    const messageStyle = {
        marginTop: "15px",
        textAlign: "center",
        fontSize: "0.95rem",
        backgroundColor: "#2C2C3A",
        padding: "10px",
        borderRadius: "6px",
    };

    return (
        <div style={pageStyle}>
            <div style={containerStyle}>
                <h2 style={headerStyle}>Предложенные голосования</h2>

                {proposals.length === 0 ? (
                    <p>Нет предложенных голосований.</p>
                ) : (
                    <ul style={listStyle}>
                        {proposals.map((proposal) => (
                            <li key={proposal.id} style={listItemStyle}>
                                <strong>{proposal.name}</strong>
                                <ul style={candidateListStyle}>
                                    {proposal.candidates.map((candidate, index) => (
                                        <li key={index}>- {candidate}</li>
                                    ))}
                                </ul>
                                {!proposal.approved ? (
                                    <button 
                                        onClick={() => approvePoll(proposal.id)} 
                                        style={approveButtonStyle}
                                    >
                                        Одобрить
                                    </button>
                                ) : (
                                    <button 
                                        onClick={() => sendToContract(proposal.id)} 
                                        style={contractButtonStyle}
                                    >
                                        Отправить в контракт
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

                {message && <p style={messageStyle}>{message}</p>}
            </div>
        </div>
    );
};

export default ProposalsList;
