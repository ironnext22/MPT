// src/pages/Register.js
import React, { useState, useContext } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ModalContext } from "../App";

export default function Register() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });

    const nav = useNavigate();
    const modal = useContext(ModalContext);

    async function submit(e) {
        e.preventDefault();

        try {
            await api.post("/users", formData);

            modal.showModal(
                "Rejestracja udana",
                "Na Twój adres e-mail został wysłany link weryfikacyjny. " +
                "Musisz potwierdzić konto, aby móc się zalogować."
            );

            nav("/login");

        } catch (err) {
            modal.showModal(
                "Błąd rejestracji",
                err.response?.data?.detail || "Nie udało się utworzyć konta."
            );
        }
    }

    return (
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <h2>Rejestracja</h2>

            <p style={{ fontSize: 14, color: "#555" }}>
                Po rejestracji otrzymasz e-mail z linkiem weryfikacyjnym.
                Bez potwierdzenia konta logowanie nie będzie możliwe.
            </p>

            <form onSubmit={submit}>
                <div style={{ marginBottom: 10 }}>
                    <label>Login</label><br/>
                    <input
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                        style={{ width: "100%", padding: 8 }}
                    />
                </div>

                <div style={{ marginBottom: 10 }}>
                    <label>Email</label><br/>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        style={{ width: "100%", padding: 8 }}
                    />
                </div>

                <div style={{ marginBottom: 10 }}>
                    <label>Hasło</label><br/>
                    <input
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        style={{ width: "100%", padding: 8 }}
                    />
                </div>

                <button type="submit">Zarejestruj się</button>
            </form>
        </div>
    );
}
