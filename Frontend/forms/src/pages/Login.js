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

        try {
            const data = new URLSearchParams();
            data.append("username", username);
            data.append("password", password);

            const res = await api.post("/token", data, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            setToken(res.data.access_token);
            nav("/");

        } catch (err) {
            if (err.response?.status === 403) {
                modal.showModal(
                    "Konto nieaktywne",
                    "Musisz potwierdzić adres e-mail. Sprawdź skrzynkę pocztową i kliknij link weryfikacyjny."
                );
            } else {
                modal.showModal(
                    "Błąd logowania",
                    "Nieprawidłowy login lub hasło."
                );
            }
        }
    }

    return (
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <h2>Logowanie</h2>

            <form onSubmit={submit}>
                <div style={{ marginBottom: 10 }}>
                    <label>Login</label><br/>
                    <input
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={{ width: "100%", padding: 8 }}
                        autoComplete="username"
                    />
                </div>

                <div style={{ marginBottom: 10 }}>
                    <label>Hasło</label><br/>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ width: "100%", padding: 8 }}
                        autoComplete="current-password"
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
