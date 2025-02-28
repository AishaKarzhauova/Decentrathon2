import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreatePoll from "./pages/CreatePoll";
import Vote from "./pages/Vote";
import AdminDashboard from "./pages/AdminDashboard";
import Results from "./pages/Results";
import PollsList from "./pages/PollsList";
import PollDetail from "./pages/PollDetail";
import ForgotPassword from "./pages/ForgotPassword";  // 📌 Добавлено
import ResetPassword from "./pages/ResetPassword";    // 📌 Добавлено

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/create-poll" element={<CreatePoll />} />
                <Route path="/vote" element={<Vote />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/results" element={<Results />} />
                
                {/* Список голосований */}
                <Route path="/polls" element={<PollsList />} />

                {/* Детальная страница одного голосования */}
                <Route path="/vote/:pollId" element={<PollDetail />} />
                {/* 📌 Новый функционал: Восстановление пароля */}
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

            </Routes>
        </Router>
    );
}

export default App;
