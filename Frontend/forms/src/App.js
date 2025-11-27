// src/App.js
import React, { useContext, useState, createContext } from "react";
import { Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import FormBuilder from "./pages/FormBuilder";
import PublicForm from "./pages/PublicForm";
import SubmissionsList from "./pages/SubmissionsList";
import Home from "./pages/Home";
import { AuthContext } from "./contexts/AuthContext";
import AppModal from "./components/AppModal";
import Profile from "./pages/Profile";

export const ModalContext = createContext({
    showModal: () => {},
    closeModal: () => {},
});

function PrivateRoute({ children }) {
    const { token } = useContext(AuthContext);
    return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
    const { token, setToken } = useContext(AuthContext);

    // STAN MODALA
    const [modalState, setModalState] = useState({
        open: false,
        title: "",
        message: "",
    });

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

    function handleLogout() {
        setToken(null);
        window.location.href = "/login";
    }

    return (
        <ModalContext.Provider value={{ showModal, closeModal }}>
            <div>
                <nav
                    style={{
                        padding: 10,
                        borderBottom: "1px solid #ddd",
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <div>
                        <Link to="/" style={{ marginRight: 10 }}>
                            Home
                        </Link>
                        {token && (
                            <>
                                <Link to="/dashboard" style={{ marginRight: 10 }}>
                                    Dashboard
                                </Link>
                                {/* Link do profilu – tylko dla zalogowanego */}
                                <Link to="/profile" style={{ marginRight: 10 }}>
                                    Profil
                                </Link>
                            </>
                        )}
                    </div>

                    <div>
                        {!token ? (
                            <>
                                <Link to="/login" style={{ marginRight: 10 }}>
                                    Logowanie
                                </Link>
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
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />

                    <Route path="/forms/public/:token" element={<PublicForm />} />
                </Routes>

                {/* GLOBALNY MODAL – zawsze na końcu, nad całą aplikacją */}
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
