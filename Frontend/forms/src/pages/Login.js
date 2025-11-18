// src/pages/Login.js
import React, { useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { setToken } = useContext(AuthContext);
    const nav = useNavigate();

    async function submit(e) {
        e.preventDefault();

        // KLUCZOWA ZMIANA:
        // FastAPI oczekuje danych jako formularz, nie JSON.
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);

        try {
            // Wysyłamy formData zamiast obiektu JSON
            const res = await api.post("/token", formData);
            setToken(res.data.access_token);
            nav("/dashboard");
        } catch (err) {
            console.error(err);
            alert("Błąd logowania. Sprawdź dane.");
        }
    }

    return (
        <div style={{ padding: 20, maxWidth: 400, margin: "0 auto" }}>
            <h2>Logowanie</h2>
            <form onSubmit={submit}>
                <div style={{ marginBottom: 10 }}>
                    <label>Nazwa użytkownika</label><br/>
                    <input
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        style={{ width: "100%", padding: 8 }}
                    />
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Hasło</label><br/>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        style={{ width: "100%", padding: 8 }}
                    />
                </div>
                <button type="submit">Zaloguj</button>
            </form>
            <p>Nie masz konta? <Link to="/register">Zarejestruj się</Link></p>
        </div>
    );
}