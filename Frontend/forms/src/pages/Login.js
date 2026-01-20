// src/pages/Login.js
import React, { useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { ModalContext } from "../App";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const { setToken } = useContext(AuthContext);
    const nav = useNavigate();
    const modal = useContext(ModalContext);

    async function submit(e) {
        e.preventDefault();

        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        try {
            const res = await api.post("/token", formData);
            setToken(res.data.access_token);
            nav("/dashboard");
        } catch (err) {
            console.error(err);

            let message = "Wystąpił błąd logowania.";

            if (err.response) {
                const { status } = err.response;

                if (status === 401) {
                    message = "Nieprawidłowa nazwa użytkownika lub hasło.";
                } else if (status === 400) {
                    message = "Niepoprawne dane logowania.";
                }
            } else {
                message = "Brak połączenia z serwerem.";
            }

            modal.showModal("Błąd logowania", message);
        }
    }

    return (
        <div style={{ padding: 20, maxWidth: 400, margin: "0 auto" }}>
            <h2>Logowanie</h2>

            <form onSubmit={submit}>
                <div style={{ marginBottom: 10 }}>
                    <label>Nazwa użytkownika</label><br />
                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ width: "100%", padding: 8 }}
                        required
                    />
                </div>

                <div style={{ marginBottom: 10 }}>
                    <label>Hasło</label><br />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: "100%", padding: 8 }}
                        required
                    />
                </div>

                <button type="submit">Zaloguj</button>
            </form>

            <p>
                Nie masz konta? <Link to="/register">Zarejestruj się</Link>
            </p>
        </div>
    );
}
