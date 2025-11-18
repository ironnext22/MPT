// src/pages/Register.js
import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const nav = useNavigate();

    async function submit(e) {
        e.preventDefault();
        try {
            await api.post("/users", { username, password, email });
            alert("Zarejestrowano. Zaloguj się.");
            nav("/login");
        } catch (err) {
            alert("Błąd rejestracji");
            console.error(err);
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Rejestracja</h2>
            <form onSubmit={submit}>
                <div>
                    <label>Username</label>
                    <input value={username} onChange={e=>setUsername(e.target.value)} />
                </div>
                <div>
                    <label>Email</label>
                    <input value={email} onChange={e=>setEmail(e.target.value)} />
                </div>
                <div>
                    <label>Password</label>
                    <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
                </div>
                <button type="submit">Zarejestruj</button>
            </form>
        </div>
    );
}
