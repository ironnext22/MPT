import React, { useContext } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom"; // dodano useNavigate
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FormBuilder from "./pages/FormBuilder";
import PublicForm from "./pages/PublicForm";
import SubmissionsList from "./pages/SubmissionsList";
import Home from "./pages/Home";
import { AuthContext } from "./contexts/AuthContext";

function PrivateRoute({ children }) {
    const { token } = useContext(AuthContext);
    return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
    const { token, setToken } = useContext(AuthContext);
    // useNavigate nie może być użyty bezpośrednio w App, jeśli App jest wewnątrz BrowserRouter,
    // ale tutaj App jest dzieckiem BrowserRouter w index.js, więc zadziała.
    // Jeśli jednak App zawiera BrowserRouter, to hook musi być niżej.
    // Zakładając strukturę z index.js:

    function handleLogout() {
        setToken(null);
        // localStorage.removeItem("token"); // To robi AuthContext w useEffect, ale można dodać dla pewności
        window.location.href = "/login"; // Proste przekierowanie
    }

    return (
        <div>
            <nav style={{ padding: 10, borderBottom: "1px solid #ddd", display: "flex", justifyContent: "space-between" }}>
                <div>
                    <Link to="/" style={{ marginRight: 10 }}>Home</Link>
                    {token && <Link to="/dashboard" style={{ marginRight: 10 }}>Dashboard</Link>}
                </div>

                <div>
                    {!token ? (
                        <>
                            <Link to="/login" style={{ marginRight: 10 }}>Logowanie</Link>
                            <Link to="/register">Rejestracja</Link>
                        </>
                    ) : (
                        <button onClick={handleLogout} style={{ cursor: "pointer" }}>
                            Wyloguj
                        </button>
                    )}
                </div>
            </nav>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route
                    path="/dashboard"
                    element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/forms/new"
                    element={
                        <PrivateRoute>
                            <FormBuilder />
                        </PrivateRoute>
                    }
                />

                <Route
                    path="/forms/:id/submissions"
                    element={
                        <PrivateRoute>
                            <SubmissionsList />
                        </PrivateRoute>
                    }
                />

                <Route path="/forms/public/:token" element={<PublicForm />} />
            </Routes>
        </div>
    );
}