// src/pages/Register.js
import React, { useState, useContext } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ModalContext } from "../App";

export default function Register() {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });

    const nav = useNavigate();
    const modal = useContext(ModalContext);

    async function submit(e) {
        e.preventDefault();

        try {
            await api.post("/users", formData);
            modal.showModal(
                "Sukces",
                "Zarejestrowano pomyślnie. Możesz się teraz zalogować."
            );
            nav("/login");

        } catch (err) {
            console.error(err);

            let message = "Wystąpił nieoczekiwany błąd rejestracji.";

            if (err.response) {
                const { status, data } = err.response;

                if (status === 409) {
                    message = "Użytkownik o podanej nazwie lub adresie e-mail już istnieje.";
                } else if (status === 422 || status === 400) {
                    if (data?.detail) {
                        const details = Array.isArray(data.detail)
                            ? data.detail.map(d => d.msg).join(", ")
                            : data.detail;
                        message = `Błąd danych wejściowych: ${details}`;
                    } else {
                        message = "Niepoprawny e-mail lub hasło nie spełnia wymagań.";
                    }
                }
            } else {
                message = "Brak połączenia z serwerem.";
            }

            modal.showModal("Błąd rejestracji", message);
        }
    }

    return (
        <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <h2>Rejestracja</h2>

            <form onSubmit={submit}>
                <div style={{ marginBottom: 10 }}>
                    <label>Nazwa użytkownika</label><br />
                    <input
                        value={formData.username}
                        onChange={(e) =>
                            setFormData({ ...formData, username: e.target.value })
                        }
                        style={{ width: "100%", padding: 8 }}
                        required
                    />
                </div>

                <div style={{ marginBottom: 10 }}>
                    <label>Email</label><br />
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                        }
                        style={{ width: "100%", padding: 8 }}
                        required
                    />
                </div>

                <div style={{ marginBottom: 10 }}>
                    <label>Hasło</label><br />
                    <input
                        type="password"
                        value={formData.password}
                        onChange={(e) =>
                            setFormData({ ...formData, password: e.target.value })
                        }
                        style={{ width: "100%", padding: 8 }}
                        required
                    />
                </div>

                <button type="submit">Zarejestruj się</button>
            </form>
        </div>
    );
}
