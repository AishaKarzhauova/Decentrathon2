import React, { useEffect, useState } from "react";
import axios from "axios";
import SidebarLayout from "../components/SidebarLayout";
import "../pages/Dashboard.css";

const Results = () => {
  const [results, setResults] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const pollsRes = await axios.get("http://127.0.0.1:8000/polls/list/");
        const polls = pollsRes.data;
        const voteData = [];

        for (const poll of polls) {
          for (const candidate of poll.candidates) {
            try {
              const voteRes = await axios.get(`http://127.0.0.1:8000/votes/${poll.id}/${candidate}`);
              voteData.push({
                poll: poll.name,
                description: poll.description,
                candidate,
                votes: voteRes.data.votes || 0,
              });
            } catch {
              voteData.push({
                poll: poll.name,
                description: poll.description,
                candidate,
                votes: 0,
              });
            }
          }
        }

        setResults(voteData);
      } catch (err) {
        setError("Failed to load results.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const filteredResults = results.filter((r) =>
    r.poll.toLowerCase().includes(search.toLowerCase()) ||
    r.candidate.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dashboard-container" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarLayout />
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
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              marginBottom: "25px",
              background: "linear-gradient(90deg, #6e8efb, #a777e3)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
            }}
          >
            Voting Results
          </div>

          <div style={{ maxWidth: "750px", width: "100%", margin: "0 auto", marginBottom: "30px" }}>
            <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <input
                type="text"
                placeholder="Search polls or candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  flexGrow: 1,
                  padding: "12px 16px",
                  borderRadius: "20px",
                  border: "2px solid #ccc",
                  outline: "none",
                  background: "#fff",
                  fontSize: "16px",
                  color: "#333",
                  width: "100%",
                  boxShadow: "0 0 0 2px rgba(110, 142, 251, 0.1)",
                }}
              />
            </div>
          </div>

          {loading ? (
            <p style={{ textAlign: "center" }}>Loading results...</p>
          ) : error ? (
            <p style={{ textAlign: "center", color: "red" }}>{error}</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {Object.entries(
                filteredResults.reduce((acc, curr) => {
                  if (!acc[curr.poll]) {
                    acc[curr.poll] = {
                      description: curr.description,
                      candidates: [],
                    };
                  }
                  acc[curr.poll].candidates.push({ candidate: curr.candidate, votes: curr.votes });
                  return acc;
                }, {})
              ).map(([pollName, pollData], idx) => (
                <div
                  key={idx}
                  style={{
                    borderRadius: "12px",
                    padding: "20px 30px",
                    background: "#f9f9f9",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      background: "linear-gradient(90deg, #6e8efb, #a777e3)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      wordWrap: "break-word",
                    }}
                  >
                    {pollName}
                  </div>

                  <div
                    style={{
                      fontSize: "0.95rem",
                      color: "#666",
                      marginTop: "-4px",
                      marginBottom: "10px",
                      lineHeight: "1.4",
                    }}
                  >
                    {pollData.description}
                  </div>

                  <ul style={{ margin: 0, paddingLeft: "20px" }}>
                    {pollData.candidates.map((c, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: "17px",
                          fontWeight: 600,
                          color: "#111",
                          listStyle: "none",
                        }}
                      >
                        {c.candidate}: {c.votes} vote{c.votes !== 1 ? "s" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
