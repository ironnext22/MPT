// src/pages/Contact.js
import React from "react";

export default function Contact() {
    return (
        <div
            style={{
                maxWidth: 600,
                margin: "40px auto",
                padding: 30,
                borderRadius: 12,
                border: "1px solid var(--border-color)",
                background: "var(--card-bg)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                color: "var(--text-color)"
            }}
        >
            <h1
                style={{
                    fontSize: 28,
                    marginBottom: 16,
                    color: "var(--nav-bg)",
                    fontWeight: 700,
                }}
            >
                Kontakt
            </h1>

            <p
                style={{
                    marginBottom: 24,
                    fontSize: 16,
                    color: "var(--text-color)",
                    lineHeight: "1.5"
                }}
            >
                Masz pytania dotyczące aplikacji MPT? Napisz do nas – chętnie pomożemy.
            </p>

            <div style={{ marginBottom: 20 }}>
                <div
                    style={{
                        fontSize: 13,
                        color: "var(--footer-text)",
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontWeight: 600
                    }}
                >
                    E-mail
                </div>
                <a
                    href="mailto:support@mpt.app"
                    style={{
                        color: "var(--nav-bg)",
                        textDecoration: "none",
                        fontSize: 18,
                        fontWeight: "500"
                    }}
                >
                    support@mpt.app
                </a>
            </div>

            <div style={{ marginBottom: 20 }}>
                <div
                    style={{
                        fontSize: 13,
                        color: "var(--footer-text)",
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontWeight: 600
                    }}
                >
                    Telefon
                </div>
                <div
                    style={{
                        fontSize: 18,
                        color: "var(--text-color)",
                    }}
                >
                    +48 123 456 789
                </div>
            </div>

            <div style={{ paddingBottom: 10 }}>
                <div
                    style={{
                        fontSize: 13,
                        color: "var(--footer-text)",
                        marginBottom: 4,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontWeight: 600
                    }}
                >
                    Godziny wsparcia
                </div>
                <div
                    style={{
                        fontSize: 16,
                        color: "var(--text-color)",
                    }}
                >
                    Poniedziałek – Piątek, 9:00 – 17:00
                </div>
            </div>
        </div>
    );
}