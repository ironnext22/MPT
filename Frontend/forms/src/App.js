// src/App.js
import React, { useContext, useState, useEffect, createContext } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FormBuilder from "./pages/FormBuilder";
import PublicForm from "./pages/PublicForm";
import SubmissionsList from "./pages/SubmissionsList";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import { AuthContext } from "./contexts/AuthContext";
import AppModal from "./components/AppModal";
import api from "./api";

export const ModalContext = createContext({
    showModal: () => {},
    closeModal: () => {},
});

function ProtectedRoute({ children }) {
    const { token } = useContext(AuthContext);
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

export default function App() {
    const { token, setToken } = useContext(AuthContext);

    // MODAL
    const [modalState, setModalState] = useState({
        open: false,
        title: "",
        message: "",
    });

    // Avatar do navbaru
    const [avatarUrl, setAvatarUrl] = useState(null);
    const [avatarInitials, setAvatarInitials] = useState("U");

    useEffect(() => {
        if (!token) {
            setAvatarUrl(null);
            setAvatarInitials("U");
            return;
        }

        api
            .get("/me", {
                headers: { Authorization: `Bearer ${token}` },
            })
            .then((res) => {
                const user = res.data;
                setAvatarUrl(user.avatar_url || null);

                const name = user.username || user.email || "U";
                const initials = name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                setAvatarInitials(initials);
            })
            .catch((err) => {
                console.error("Nie udało się pobrać profilu do navbaru", err);
                setAvatarUrl(null);
                setAvatarInitials("U");
            });
    }, [token]);

    const showModal = (title, message) => {
        setModalState({
            open: true,
            title,
            message,
        });
    };

    const closeModal = () => {
        setModalState((prev) => ({ ...prev, open: false }));
    };

    const handleLogout = () => {
        setToken(null);
    };

    const navLinkStyle = {
        marginRight: 10,
        textDecoration: "none",
        color: "#fff",
    };

    return (
        <ModalContext.Provider value={{ showModal, closeModal }}>
            <div
                style={{
                    fontFamily:
                        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                }}
            >
                {/* NAVBAR */}
                <nav
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 16px",
                    }}
                >
                    <div>
                        <Link
                            to="/"
                            style={{ ...navLinkStyle, fontWeight: 700 }}
                        >
                            MPT
                        </Link>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        {!token && (
                            <>
                                <Link to="/login" style={navLinkStyle}>
                                    Logowanie
                                </Link>
                                <Link to="/register" style={navLinkStyle}>
                                    Rejestracja
                                </Link>
                            </>
                        )}

                        {token && (
                            <>
                                <Link
                                    to="/dashboard"
                                    style={navLinkStyle}
                                >
                                    Dashboard
                                </Link>

                                {/* Avatar jako link do profilu */}
                                <Link
                                    to="/profile"
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginRight: 10,
                                        textDecoration: "none",
                                    }}
                                    title="Profil"
                                >
                                    <div
                                        style={{
                                            width: 32,
                                            height: 32,
                                            borderRadius: "50%",
                                            background: "#e0e0e0",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 14,
                                            fontWeight: "bold",
                                            color: "#555",
                                            overflow: "hidden",
                                        }}
                                    >
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt="Awatar"
                                                style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        ) : (
                                            avatarInitials
                                        )}
                                    </div>
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    style={{
                                        cursor: "pointer",
                                        border: "none",
                                        background: "transparent",
                                        color: "#fff",
                                        fontSize: 14,
                                    }}
                                >
                                    Wyloguj
                                </button>
                            </>
                        )}
                    </div>
                </nav>

                {/* ROUTES */}
                <div style={{ padding: 16 }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route
                            path="/login"
                            element={
                                token ? (
                                    <Navigate
                                        to="/dashboard"
                                        replace
                                    />
                                ) : (
                                    <Login />
                                )
                            }
                        />
                        <Route
                            path="/register"
                            element={
                                token ? (
                                    <Navigate
                                        to="/dashboard"
                                        replace
                                    />
                                ) : (
                                    <Register />
                                )
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/forms/new"
                            element={
                                <ProtectedRoute>
                                    <FormBuilder />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/forms/:id"
                            element={
                                <ProtectedRoute>
                                    <FormBuilder />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/forms/:id/submissions"
                            element={
                                <ProtectedRoute>
                                    <SubmissionsList />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/public/:token"
                            element={<PublicForm />}
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="*"
                            element={<Navigate to="/" replace />}
                        />
                    </Routes>
                </div>

                {/* GLOBALNY MODAL */}
                <AppModal
                    open={modalState.open}
                    title={modalState.title}
                    onClose={closeModal}
                >
                    {modalState.message}
                </AppModal>
            </div>
        </ModalContext.Provider>
    );
}
