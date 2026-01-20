import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div style={{ padding: 20, maxWidth: 900, margin: "0 auto", color: "var(--text-color)" }}>
            {/* HERO SECTION */}
            <div
                style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    background: "var(--card-bg)",
                    borderRadius: 12,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    marginBottom: 40,
                    border: "1px solid var(--border-color)"
                }}
            >
                <h1 style={{ fontSize: 36, marginBottom: 10, color: "var(--nav-bg)" }}>
                    Witamy w aplikacji ankietowej!
                </h1>
                <p style={{ fontSize: 18, color: "var(--footer-text)" }}>
                    Twórz formularze, zbieraj odpowiedzi i analizuj wyniki — łatwo i szybko.
                </p>

                <div style={{ marginTop: 25 }}>
                    <Link to="/register">
                        <button
                            style={{
                                padding: "12px 22px",
                                marginRight: 10,
                                background: "var(--nav-bg)",
                                border: "none",
                                borderRadius: 8,
                                color: "var(--nav-text)",
                                fontSize: 16,
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            Rozpocznij teraz
                        </button>
                    </Link>

                    <Link to="/login">
                        <button
                            style={{
                                padding: "12px 22px",
                                background: "transparent",
                                border: "2px solid var(--nav-bg)",
                                borderRadius: 8,
                                color: "var(--nav-bg)",
                                fontSize: 16,
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                        >
                            Mam już konto
                        </button>
                    </Link>
                </div>
            </div>

            {/* FEATURES SECTION */}
            <h2 style={{ marginBottom: 20, color: "var(--text-color)" }}>Co możesz zrobić?</h2>

            <div
                style={{
                    display: "grid",
                    gap: 20,
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                }}
            >
                <div
                    style={{
                        background: "var(--card-bg)",
                        padding: 20,
                        borderRadius: 12,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        border: "1px solid var(--border-color)"
                    }}
                >
                    <h3 style={{ color: "var(--nav-bg)" }}>📄 Tworzenie formularzy</h3>
                    <p>
                        Buduj własne ankiety i formularze z pytaniami otwartymi lub
                        wielokrotnego wyboru.
                    </p>
                    <Link to="/forms/new" style={{ color: "var(--nav-bg)", textDecoration: "none", fontWeight: "bold" }}>
                        ➡️ Stwórz pierwszą ankietę
                    </Link>
                </div>

                <div
                    style={{
                        background: "var(--card-bg)",
                        padding: 20,
                        borderRadius: 12,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        border: "1px solid var(--border-color)"
                    }}
                >
                    <h3 style={{ color: "var(--nav-bg)" }}>🔗 Udostępnianie linków</h3>
                    <p>
                        Wygeneruj publiczny link i wyślij go uczestnikom — dostęp bez logowania.
                    </p>
                    <Link to="/dashboard" style={{ color: "var(--nav-bg)", textDecoration: "none", fontWeight: "bold" }}>
                        ➡️ Zobacz swoje ankiety
                    </Link>
                </div>

                <div
                    style={{
                        background: "var(--card-bg)",
                        padding: 20,
                        borderRadius: 12,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                        border: "1px solid var(--border-color)"
                    }}
                >
                    <h3 style={{ color: "var(--nav-bg)" }}>📊 Analiza odpowiedzi</h3>
                    <p>
                        Sprawdzaj odpowiedzi w czasie rzeczywistym i analizuj zgłoszenia.
                    </p>
                    <Link to="/dashboard" style={{ color: "var(--nav-bg)", textDecoration: "none", fontWeight: "bold" }}>
                        ➡️ Przeglądaj odpowiedzi
                    </Link>
                </div>
            </div>

            {/* GETTING STARTED SECTION */}
            <h2 style={{ marginTop: 50, color: "var(--text-color)" }}>Jak zacząć?</h2>
            <ol style={{ fontSize: 16, lineHeight: 1.6, color: "var(--text-color)" }}>
                <li>Zarejestruj się lub zaloguj.</li>
                <li>Przejdź do <Link to="/dashboard" style={{ color: "var(--nav-bg)" }}>Dashboard</Link>.</li>
                <li>Utwórz nową ankietę w <Link to="/forms/new" style={{ color: "var(--nav-bg)" }}>Form Builderze</Link>.</li>
                <li>Skopiuj publiczny link i udostępnij uczestnikom.</li>
                <li>Przeglądaj wyniki i eksportuj odpowiedzi.</li>
            </ol>

            {/* TIP SECTION */}
            <div
                style={{
                    marginTop: 40,
                    background: "var(--input-bg)", // Używamy tła wejść dla kontrastu
                    padding: 20,
                    borderRadius: 12,
                    border: "1px solid var(--nav-bg)", // Akcent kolorem głównym
                    color: "var(--text-color)",
                }}
            >
                <strong style={{ color: "var(--nav-bg)" }}>💡 Porada:</strong>
                <span style={{ marginLeft: 8 }}>
                    Twoje formularze mogą zawierać dowolną liczbę pytań. Upewnij się, że
                    testujesz je, zanim udostępnisz link innym!
                </span>
            </div>

            {/* FOOTER */}
            <div style={{ textAlign: "center", marginTop: 50, color: "var(--footer-text)" }}>
                <p>© {new Date().getFullYear()} MPT. Wszystkie prawa zastrzeżone.</p>
            </div>
        </div>
    );
}