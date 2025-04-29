import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import SidebarLayout from "../components/SidebarLayout";
import "./Dashboard.css";
import {FaBars, FaTimes} from "react-icons/fa";
import { FaUserMinus } from "react-icons/fa";

const GroupDetail = () => {
  const { groupId } = useParams();
  const [groupInfo, setGroupInfo] = useState(null);
  const [members, setMembers] = useState([]);
  const [polls, setPolls] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch current user
      const userRes = await axios.get("http://127.0.0.1:8000/user/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  setCurrentUser(userRes.data);

      const groupsRes = await axios.get("http://127.0.0.1:8000/groups/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const foundGroup = groupsRes.data.find((g) => g.id == groupId);
      if (!foundGroup) {
        setMessage("Group not found.");
        return;
      }
      setGroupInfo(foundGroup);

      let fetchedMembers = [];

  try {
    const res = await axios.get(`http://127.0.0.1:8000/groups/${groupId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchedMembers = res.data;
    setMembers(fetchedMembers);

  } catch (err) {
    setMessage("Failed to fetch group members.");
    return;
  }

  // Now we can safely check admin status
  const isAdmin = fetchedMembers.some(
    (m) => m.user_id === userRes.data.id && m.role === "admin"
  );
  setIsGroupAdmin(isAdmin);


      const pollsRes = await axios.get(`http://127.0.0.1:8000/polls/group/${groupId}/polls`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPolls(pollsRes.data);
    } catch (error) {
      console.error(error);
      setMessage("Failed to load group data.");
    }
  };

// const currentMember = members.find((m) => m.user_id === currentUserId);

  const kickMember = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://127.0.0.1:8000/groups/${groupId}/kick/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembers((prev) => prev.filter((m) => m.user_id !== userId));
      setMessage("✅ Member kicked!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage("❌ " + (err.response?.data?.detail || "Failed to kick member"));
    }
  };

  return (
    <div className="dashboard-container montserrat-font">
      <div className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        <SidebarLayout />
      </div>

      <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="collapse-btn">
        {sidebarCollapsed ? <FaBars size={18} /> : <FaTimes size={18} />}
      </button>

      <div className="main-content">
        {message && <p style={{ color: "red", marginBottom: "20px" }}>{message}</p>}

        {groupInfo && (
          <>
            <h2 className="dashboard-heading">{groupInfo.name}</h2>
            <p className="poll-description" style={{ marginBottom: "20px" }}>
              {groupInfo.description || "No description provided."}
            </p>

            <h3 className="dashboard-heading">Group Members</h3>
            <ul className="polls-list">
              {members.map((member) => {
                console.log("CHECK:", {
                  currentUserId,
                  viewing: member.user_id,
                  role: members.find((m) => m.user_id === currentUserId)?.role,
                });
                const currentMember = members.find((m) => m.user_id === currentUser?.id);
                return (
                  <li key={member.user_id} className="poll-card">
                    <div className="poll-card-inner">
                      <p className="poll-name">
                        👤 {member.nickname} ({member.first_name} {member.last_name}){" "}
                        {member.role === "admin" ? "(Admin)" : ""}
                      </p>

                      {member.role !== "admin" && (
                        <button
                          className="gradient-button danger"
                          onClick={() => kickMember(member.user_id)}
                        >
                          <FaUserMinus style={{ marginRight: "6px" }} />
                          Kick
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>



            <h3 className="dashboard-heading" style={{ marginTop: "40px" }}>Group Polls</h3>
            <ul className="polls-list">
              {polls.length > 0 ? polls.map((poll) => (
                <li key={poll.id} className="poll-card">
                  <div className="poll-card-inner">
                    <p
                      className="poll-name"
                      style={{ cursor: "pointer", color: "#6e8efb", textDecoration: "underline" }}
                      onClick={() => navigate(`/vote/${poll.id}`)}
                    >
                      {poll.name}
                    </p>
                  </div>
                </li>
              )) : (
                <p>No polls created in this group yet.</p>
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupDetail;