import React, { useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const { setToken } = useContext(AuthContext);
    const nav = useNavigate();

    async function submit(e) {
        e.preventDefault();
        try {
            const form = new URLSearchParams();
            form.append("username", username);
            form.append("password", password);
            const res = await api.post("/token", form);
            setToken(res.data.access_token);
            nav("/dashboard");
        } catch (err) {
            alert("Błąd logowania");
            console.error(err);
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Logowanie</h2>

            <form onSubmit={submit}>
                <div>
                    <label>Username</label>
                    <input value={username} onChange={e=>setUsername(e.target.value)} />
                </div>
                <div>
                    <label>Password</label>
                    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
                </div>
                <button type="submit">Zaloguj</button>
            </form>

            {/* 🔥 DEBUG: Przycisk omijający logowanie */}
            <button
                onClick={() => {
                    setToken("DEV-TOKEN");
                    nav("/dashboard");
                }}
                style={{ marginTop: 10 }}
            >
                Skip login (DEV)
            </button>
        </div>
    );
}
