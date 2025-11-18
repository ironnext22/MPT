// src/App.js
import React, { useContext } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FormBuilder from "./pages/FormBuilder";
import PublicForm from "./pages/PublicForm";
import SubmissionsList from "./pages/SubmissionsList";
import { AuthContext } from "./contexts/AuthContext";

function PrivateRoute({ children }) {
    const { token } = useContext(AuthContext);
    return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
    return (
        <div>
            <nav style={{ padding: 10, borderBottom: "1px solid #ddd" }}>
                <Link to="/">Home</Link>{" | "}
                <Link to="/dashboard">Dashboard</Link>{" | "}
                <Link to="/login">Login</Link>
            </nav>

            <Routes>
                <Route path="/" element={<div style={{ padding: 20 }}>Witamy — aplikacja ankiet</div>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/dashboard" element={<PrivateRoute><Dashboard/></PrivateRoute>} />
                <Route path="/forms/new" element={<PrivateRoute><FormBuilder/></PrivateRoute>} />
                <Route path="/forms/:id/submissions" element={<PrivateRoute><SubmissionsList/></PrivateRoute>} />

                <Route path="/forms/public/:token" element={<PublicForm/>} />
            </Routes>
        </div>
    );
}
