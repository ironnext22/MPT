import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const [formData, setFormData] = useState({ username: "", email: "", password: "" });
    const nav = useNavigate();

    async function submit(e) {
        e.preventDefault();
        try {
            await api.post("/users", formData);
            alert("Zarejestrowano pomyślnie! Możesz się zalogować.");
            nav("/login");
        } catch (err) {
            console.error(err);
            alert("Błąd rejestracji (np. użytkownik już istnieje).");
        }
    }

    return (
        <div style={{ padding: 20, maxWidth: 400, margin: "0 auto" }}>
            <h2>Rejestracja</h2>
            <form onSubmit={submit}>
                <div style={{ marginBottom: 10 }}>
                    <label>Nazwa użytkownika</label><br/>
                    <input
                        value={formData.username}
                        onChange={e => setFormData({...formData, username: e.target.value})}
                        style={{ width: "100%" }}
                    />
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Email</label><br/>
                    <input
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        style={{ width: "100%" }}
                    />
                </div>
                <div style={{ marginBottom: 10 }}>
                    <label>Hasło</label><br/>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        style={{ width: "100%" }}
                    />
                </div>
                <button type="submit">Zarejestruj się</button>
            </form>
        </div>
    );
}