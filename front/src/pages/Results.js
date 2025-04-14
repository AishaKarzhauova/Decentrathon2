import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";

const Results = () => {
  const [polls, setPolls] = useState([]);
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [agaBalance, setAgaBalance] = useState(null);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [pollsRes, userRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/polls/list/"),
        axios.get("http://127.0.0.1:8000/user/me", { headers }),
      ]);

      setUser(userRes.data);
      setAgaBalance(userRes.data.balance || null);
      setPolls(pollsRes.data);

      const fetchedResults = [];

      for (const poll of pollsRes.data) {
        const voteResults = {};
        for (const candidate of poll.candidates) {
          const res = await axios.get(`http://127.0.0.1:8000/votes/${poll.id}/${candidate}`);
          voteResults[candidate] = res.data.votes;
        }
        fetchedResults.push({ poll: poll.name, candidates: voteResults });
      }

      setResults(fetchedResults);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const filteredResults = results.filter((item) =>
    item.poll.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inputStyle = {
    width: "100%",
    maxWidth: "700px",
    padding: "12px",
    borderRadius: "20px",
    border: "2px solid #ccc",
    fontSize: "16px",
    marginBottom: "30px",
    outline: "none",
    background: "white",
    color: "#333",
  };

  const thTdStyle = {
    padding: "14px",
    textAlign: "left",
    fontWeight: "bold",
    fontSize: "20px",
    background: "linear-gradient(90deg, #6e8efb, #a777e3)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
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
            Voting Results
          </h2>

          <input
            type="text"
            placeholder="Search polls or candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={inputStyle}
          />

          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 16px" }}>
            <thead>
              <tr style={{ background: "#f4f4f4" }}>
                <th style={thTdStyle}>Poll</th>
                <th style={thTdStyle}>Candidates</th>
                <th style={thTdStyle}>Votes</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((entry, index) => (
                <tr
                  key={index}
                  style={{
                    background: "#fefefe",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                >
                  <td style={thTdStyle}>{entry.poll}</td>
                  <td style={thTdStyle}>
                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                      {Object.keys(entry.candidates).map((candidate, idx) => (
                        <li key={idx}>{candidate}</li>
                      ))}
                    </ul>
                  </td>
                  <td style={thTdStyle}>
                    <ul style={{ margin: 0, paddingLeft: "20px" }}>
                      {Object.values(entry.candidates).map((votes, idx) => (
                        <li key={idx}>{votes}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredResults.length === 0 && (
            <p style={{ textAlign: "center", marginTop: "20px", fontWeight: 500 }}>
              No results found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
