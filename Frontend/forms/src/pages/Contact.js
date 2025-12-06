// src/pages/Contact.js
import React from "react";

export default function Contact() {
    return (
        <div
            style={{
                maxWidth: 600,
                margin: "40px auto",
                padding: 20,
                borderRadius: 8,
                border: "1px solid #ddd",
                background: "#f9f9f9",
            }}
        >
            <h1
                style={{
                    fontSize: 24,
                    marginBottom: 16,
                    color: "#111827",
                    fontWeight: 700,
                }}
            >
                Kontakt
            </h1>

            <p
                style={{
                    marginBottom: 20,
                    fontSize: 15,
                    color: "#374151",
                }}
            >
                Masz pytania dotyczące aplikacji MPT? Napisz do nas – chętnie pomożemy.
            </p>

            <div style={{ marginBottom: 14 }}>
                <div
                    style={{
                        fontSize: 13,
                        color: "#6b7280",
                        marginBottom: 2,
                    }}
                >
                    E-mail
                </div>
                <a
                    href="mailto:support@mpt.app"
                    style={{
                        color: "#2563eb",
                        textDecoration: "none",
                        fontSize: 15,
                    }}
                >
                    support@mpt.app
                </a>
            </div>

            <div style={{ marginBottom: 14 }}>
                <div
                    style={{
                        fontSize: 13,
                        color: "#6b7280",
                        marginBottom: 2,
                    }}
                >
                    Telefon
                </div>
                <div
                    style={{
                        fontSize: 15,
                        color: "#111827",
                    }}
                >
                    +48 123 456 789
                </div>
            </div>

            <div>
                <div
                    style={{
                        fontSize: 13,
                        color: "#6b7280",
                        marginBottom: 2,
                    }}
                >
                    Godziny wsparcia
                </div>
                <div
                    style={{
                        fontSize: 15,
                        color: "#111827",
                    }}
                >
                    Pon–Pt, 9:00–17:00
                </div>
            </div>
        </div>
    );
}
