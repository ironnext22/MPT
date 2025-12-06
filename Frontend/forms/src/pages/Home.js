import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
            {/* HERO SECTION */}
            <div
                style={{
                    textAlign: "center",
                    padding: "40px 20px",
                    background: "#f8f9fa",
                    borderRadius: 12,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    marginBottom: 40,
                }}
            >
                <h1 style={{ fontSize: 36, marginBottom: 10 }}>
                    Witamy w aplikacji ankietowej!
                </h1>
                <p style={{ fontSize: 18, color: "#555" }}>
                    Twórz formularze, zbieraj odpowiedzi i analizuj wyniki — łatwo i szybko.
                </p>

                <div style={{ marginTop: 25 }}>
                    <Link to="/register">
                        <button
                            style={{
                                padding: "12px 22px",
                                marginRight: 10,
                                background: "#007bff",
                                border: "none",
                                borderRadius: 8,
                                color: "white",
                                fontSize: 16,
                                cursor: "pointer",
                            }}
                        >
                            Rozpocznij teraz
                        </button>
                    </Link>

                    <Link to="/login">
                        <button
                            style={{
                                padding: "12px 22px",
                                background: "white",
                                border: "2px solid #007bff",
                                borderRadius: 8,
                                color: "#007bff",
                                fontSize: 16,
                                cursor: "pointer",
                            }}
                        >
                            Mam już konto
                        </button>
                    </Link>
                </div>
            </div>

            {/* FEATURES SECTION */}
            <h2 style={{ marginBottom: 20 }}>Co możesz zrobić?</h2>

            <div
                style={{
                    display: "grid",
                    gap: 20,
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                }}
            >
                <div
                    style={{
                        background: "white",
                        padding: 20,
                        borderRadius: 12,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                >
                    <h3>📄 Tworzenie formularzy</h3>
                    <p>
                        Buduj własne ankiety i formularze z pytaniami otwartymi lub
                        wielokrotnego wyboru.
                    </p>
                    <Link to="/forms/new">➡️ Stwórz pierwszą ankietę</Link>
                </div>

                <div
                    style={{
                        background: "white",
                        padding: 20,
                        borderRadius: 12,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                >
                    <h3>🔗 Udostępnianie linków</h3>
                    <p>
                        Wygeneruj publiczny link i wyślij go uczestnikom — dostęp bez logowania.
                    </p>
                    <Link to="/dashboard">➡️ Zobacz swoje ankiety</Link>
                </div>

                <div
                    style={{
                        background: "white",
                        padding: 20,
                        borderRadius: 12,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                    }}
                >
                    <h3>📊 Analiza odpowiedzi</h3>
                    <p>
                        Sprawdzaj odpowiedzi w czasie rzeczywistym i analizuj zgłoszenia.
                    </p>
                    <Link to="/dashboard">➡️ Przeglądaj odpowiedzi</Link>
                </div>
            </div>

            {/* GETTING STARTED SECTION */}
            <h2 style={{ marginTop: 50 }}>Jak zacząć?</h2>
            <ol style={{ fontSize: 16, lineHeight: 1.6 }}>
                <li>Zarejestruj się lub zaloguj.</li>
                <li>Przejdź do <Link to="/dashboard">Dashboard</Link>.</li>
                <li>Utwórz nową ankietę w <Link to="/forms/new">Form Builderze</Link>.</li>
                <li>Skopiuj publiczny link i udostępnij uczestnikom.</li>
                <li>Przeglądaj wyniki i eksportuj odpowiedzi.</li>
            </ol>

            {/* TIP SECTION */}
            <div
                style={{
                    marginTop: 40,
                    background: "#fff3cd",
                    padding: 20,
                    borderRadius: 12,
                    border: "1px solid #ffeeba",
                    color: "#856404",
                }}
            >
                <strong>💡 Porada:</strong>
                Twoje formularze mogą zawierać dowolną liczbę pytań. Upewnij się, że
                testujesz je, zanim udostępnisz link innym!
            </div>

            {/* FOOTER */}
            <div style={{ textAlign: "center", marginTop: 50, color: "#777" }}>
                <p>© {new Date().getFullYear()} Aplikacja Ankietowa. Wszystkie prawa zastrzeżone.</p>
            </div>
        </div>
    );
}
