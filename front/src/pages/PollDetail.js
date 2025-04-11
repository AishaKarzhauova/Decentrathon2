import React, { useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { useParams } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import { FiCheck } from "react-icons/fi";
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
                <p className="message" style={{ marginTop: "20px" }}>
                  {message.includes("Hash:") ? (
                    <>
                      {message.split("Hash:")[0]}
                      <br />
                      <code style={{ background: "#eee", padding: "10px", borderRadius: "6px", wordBreak: "break-all" }}>
                        {message.split("Hash:")[1]}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(message.split("Hash:")[1].trim());
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        style={{
                          marginLeft: "10px",
                          background: "linear-gradient(90deg, #6e8efb, #a777e3)",
                          padding: "8px",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          color: "white",
                        }}
                      >
                        {copied ? <FiCheck /> : "Copy"}
                      </button>
                    </>
                  ) : (
                    message
                  )}
                </p>
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
