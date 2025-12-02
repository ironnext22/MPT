import React from "react";

export default function Contact() {
    return (
        <div
            style={{
                maxWidth: 600,
                margin: "0 auto",
                padding: "24px",
                background: "#020617",
                borderRadius: 16,
                boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
                border: "1px solid #1f2937",
            }}
        >
            <h1
                style={{
                    fontSize: 24,
                    marginBottom: 16,
                    color: "#e5e7eb",
                    fontWeight: 700,
                }}
            >
                Kontakt
            </h1>

            <p style={{ marginBottom: 16, color: "#9ca3af" }}>
                Masz pytania dotyczące aplikacji MPT? Napisz do nas – chętnie
                pomożemy.
            </p>

            <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 14, color: "#6b7280" }}>E-mail</div>
                <a
                    href="mailto:support@mpt.app"
                    style={{
                        color: "#38bdf8",
                        textDecoration: "none",
                        fontSize: 16,
                    }}
                >
                    support@mpt.app
                </a>
            </div>

            <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 14, color: "#6b7280" }}>Telefon</div>
                <div style={{ fontSize: 16, color: "#e5e7eb" }}>
                    +48 123 456 789
                </div>
            </div>

            <div>
                <div style={{ fontSize: 14, color: "#6b7280" }}>
                    Godziny wsparcia
                </div>
                <div style={{ fontSize: 16, color: "#e5e7eb" }}>
                    Pon–Pt, 9:00–17:00
                </div>
            </div>
        </div>
    );
}