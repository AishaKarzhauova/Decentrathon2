import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import "./Vote.css";

const Vote = () => {
    const [poll, setPoll] = useState(null);
    const [user, setUser] = useState(null);
    const [agaBalance, setAgaBalance] = useState(null);
    const [showUserInfo, setShowUserInfo] = useState(false);
    const [message, setMessage] = useState("");
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserAndPoll = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate("/");
                return;
            }

            try {
                const userRes = await axios.get("http://127.0.0.1:8000/user/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(userRes.data);

                const balanceRes = await axios.get(`http://127.0.0.1:8000/user/balance/${userRes.data.wallet_address}`);
                setAgaBalance(balanceRes.data.balance);

                const pollRes = await axios.get(`http://127.0.0.1:8000/polls/${id}`);
                setPoll(pollRes.data);
            } catch (err) {
                console.error("Error loading vote page:", err);
                navigate("/");
            }
        };

        fetchUserAndPoll();
    }, [id, navigate]);

    const handleVote = async (candidateIndex) => {
        try {
            const token = localStorage.getItem("token");
            await axios.post(
                `http://127.0.0.1:8000/polls/vote/${id}`,
                { candidate_index: candidateIndex },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessage("✅ Vote submitted successfully!");
        } catch (err) {
            setMessage(err.response?.data?.detail || "❌ Failed to submit vote.");
        }
    };

    const handleRequestTokens = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post("http://127.0.0.1:8000/tokens/request-tokens", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(response.data.message);
        } catch (error) {
            setMessage(error.response?.data?.detail || "Token request failed.");
        }
    };

    if (!poll) return null;

    return (
        <SidebarLayout
            user={user}
            agaBalance={agaBalance}
            showUserInfo={showUserInfo}
            setShowUserInfo={setShowUserInfo}
            handleRequestTokens={handleRequestTokens}
        >
            <div className="vote-container">
                <h2 className="vote-heading">{poll.name}</h2>
                <p className="vote-description">{poll.description}</p>

                <div className="vote-card">
                    {poll.candidates.map((candidate, index) => (
                        <button
                            key={index}
                            className="vote-candidate-btn"
                            onClick={() => handleVote(index)}
                        >
                            {candidate}
                        </button>
                    ))}
                </div>

                {message && <div className="vote-status">{message}</div>}
            </div>
        </SidebarLayout>
    );
};

export default Vote;
