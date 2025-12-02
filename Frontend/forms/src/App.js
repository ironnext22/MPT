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
import Contact from "./pages/Contact"; // <--- NOWE
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
        marginRight: 12,
        textDecoration: "none",
        color: "#e5e7eb",
        fontSize: 14,
    };

    return (
        <ModalContext.Provider value={{ showModal, closeModal }}>
            <div
                style={{
                    fontFamily:
                        "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
                    minHeight: "100vh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* NAVBAR */}
                <nav
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 24px",
                        borderBottom: "1px solid #1f2937",
                        position: "sticky",
                        top: 0,
                        zIndex: 20,
                    }}
                >
                    <div>
                        <Link
                            to="/"
                            style={{
                                ...navLinkStyle,
                                fontWeight: 800,
                                fontSize: 18,
                                marginRight: 24,
                            }}
                        >
                            MPT
                        </Link>
                        <Link to="/contact" style={navLinkStyle}>
                            Kontakt
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
                                            background: "#111827",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: 14,
                                            fontWeight: "bold",
                                            color: "#e5e7eb",
                                            overflow: "hidden",
                                            border: "1px solid #1f2937",
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
                                        color: "#e5e7eb",
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
                <main
                    style={{
                        flex: 1,
                        padding: "24px 16px 32px",
                        maxWidth: 960,
                        width: "100%",
                        margin: "0 auto",
                    }}
                >
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
                        <Route path="/contact" element={<Contact />} />
                        <Route
                            path="*"
                            element={<Navigate to="/" replace />}
                        />
                    </Routes>
                </main>

                {/* FOOTER */}
                <footer
                    style={{
                        padding: "16px 24px",
                        borderTop: "1px solid #1f2937",
                        fontSize: 12,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 16,
                        flexWrap: "wrap",
                    }}
                >
                    <div style={{ color: "#6b7280" }}>
                        © {new Date().getFullYear()} MPT. Wszystkie prawa
                        zastrzeżone.
                    </div>
                    <div
                        style={{
                            display: "flex",
                            gap: 16,
                            alignItems: "center",
                        }}
                    >
                        <Link
                            to="/contact"
                            style={{
                                textDecoration: "none",
                                color: "#9ca3af",
                                fontSize: 12,
                            }}
                        >
                            Kontakt
                        </Link>
                        <span style={{ color: "#374151" }}>•</span>
                        <span style={{ color: "#4b5563" }}>
                            support@mpt.app
                        </span>
                    </div>
                </footer>

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
