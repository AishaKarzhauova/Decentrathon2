import React, { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useParams } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import { FiCopy, FiCheck } from "react-icons/fi";
import "./CreatePoll.css";

const PollDetail = () => {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);
  const [agaBalance, setAgaBalance] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [copied, setCopied] = useState(false);

  const TOKEN_ADDRESS = "0x024b770fd5E43258363651B5545efbf080d0775F";
  const VOTING_CONTRACT_ADDRESS = "0x0946E6cBd737764BdbEC76430d030d30c653A7f9";

  const TOKEN_ABI = [
    {
      inputs: [
        { internalType: "address", name: "spender", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
      ],
      name: "approve",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "owner", type: "address" },
        { internalType: "address", name: "spender", type: "address" },
      ],
      name: "allowance",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ];

  useEffect(() => {
    fetchPoll();
    fetchUserData();
  }, []);

  const fetchPoll = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/polls/list/");
      const found = res.data.find((p) => p.id == pollId);
      if (!found) return setMessage("Poll not found.");
      setPoll(found);
    } catch (err) {
      setMessage("Error loading poll.");
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      const bal = await axios.get(`http://127.0.0.1:8000/user/balance/${res.data.wallet_address}`);
      setAgaBalance(bal.data.balance);
    } catch (err) {
      console.error(err);
    }
  };

const navButtonStyle = {
  padding: "12px 20px",
  fontSize: "16px",
  fontWeight: "bold",
  borderRadius: "8px",
  border: "none",
  background: "linear-gradient(90deg, #6e8efb, #a777e3)",
  color: "white",
  cursor: "pointer",
  transition: "opacity 0.3s ease",
};

  const vote = async (candidate) => {
    if (!window.ethereum) return alert("Please install MetaMask.");

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    try {
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);
      const allowance = await tokenContract.allowance(userAddress, VOTING_CONTRACT_ADDRESS);

      if (allowance < ethers.parseUnits("10", 18)) {
        setMessage("Approving 10 AGA...");
        const approveTx = await tokenContract.approve(VOTING_CONTRACT_ADDRESS, ethers.parseUnits("10", 18));
        await approveTx.wait();
        setMessage("Approved. Sending vote...");
      }

      const res = await axios.post(
        `http://127.0.0.1:8000/votes/${pollId}/${candidate}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );

      const txData = res.data.transaction;
      const tx = await signer.sendTransaction({
        to: txData.to,
        value: txData.value ? ethers.toBigInt(txData.value) : 0n,
        gasLimit: txData.gas,
        gasPrice: txData.gasPrice,
        nonce: txData.nonce,
        data: txData.data,
      });

      setMessage(`Vote submitted successfully! Hash: ${tx.hash}`);
    } catch (err) {
      setMessage(`❌ ${err.response?.data?.detail || "Voting failed."}`);
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
          handleRequestTokens={() => {}}
        />
      </div>

      <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="collapse-btn">
        {sidebarCollapsed ? "→" : "←"}
      </button>

      <div className="main-content page-centered">
        <div className="card">
          <h2 className="header">Poll</h2>
          {poll ? (
            <>
              <h3 style={{ textAlign: "center", fontWeight: 600, fontSize: "20px", marginBottom: "10px" }}>
                {poll.name}
              </h3>
              <p style={{ textAlign: "center", fontStyle: "italic", marginBottom: "20px" }}>
                {poll.description}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {poll.candidates.map((candidate, index) => (
                  <button
                    key={index}
                    className="gradient-button"
                    style={{ fontSize: "16px", padding: "14px" }}
                    onClick={() => vote(candidate)}
                  >
                    {candidate}
                  </button>
                ))}
              </div>

{message && (
  <div
    style={{
      marginTop: "20px",
      background: "#f1f1f1",
      padding: "20px",
      borderRadius: "12px",
      textAlign: "center",
      fontWeight: 500,
      maxWidth: "700px",
      marginInline: "auto",
    }}
  >
    {message.includes("Hash:") ? (
      <>
        <p style={{ fontSize: "18px", fontWeight: 600 }}>
          🎉 Vote submitted successfully!
        </p>

        <div
          style={{
            marginTop: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            flexWrap: "nowrap",
            overflowX: "auto",
          }}
        >
          <code
            style={{
              background: "#eee",
              padding: "10px 12px",
              borderRadius: "6px",
              fontSize: "0.95rem",
              wordBreak: "break-all",
              maxWidth: "calc(100% - 60px)",
              flex: 1,
            }}
          >
            {message.split("Hash:")[1].trim()}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(message.split("Hash:")[1].trim());
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            onMouseEnter={(e) => (e.target.style.opacity = "0.8")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
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
              transition: "opacity 0.3s ease",
              minWidth: "44px",
            }}
            title="Copy to clipboard"
          >
            {copied ? <FiCheck size={20} /> : <FiCopy size={20} />}
          </button>
        </div>

        {/* 🔗 Etherscan */}
        <div style={{ marginTop: "10px" }}>
          <a
            href={`https://sepolia.etherscan.io/tx/${message.split("Hash:")[1].trim()}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#6e8efb",
              textDecoration: "underline",
              fontSize: "0.95rem",
            }}
          >
            View on Etherscan ↗
          </a>
        </div>

        {/* Navigation Buttons */}
        <div
          style={{
            marginTop: "20px",
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => (window.location.href = "/dashboard")}
            style={navButtonStyle}
            onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => (window.location.href = "/vote-history")}
            style={navButtonStyle}
            onMouseEnter={(e) => (e.target.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.target.style.opacity = "1")}
          >
            Check Voting History
          </button>
        </div>
      </>
    ) : (
      <p>{message}</p>
    )}
  </div>
)}



            </>
          ) : (
            <p style={{ textAlign: "center" }}>Loading poll...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PollDetail;
