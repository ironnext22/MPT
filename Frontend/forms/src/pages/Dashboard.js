import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true); // Dodano stan ładowania
    const nav = useNavigate();

    // 1. Pobieranie listy ankiet
    async function load() {
        setLoading(true);
        console.log("-> Rozpoczynam GET /forms");
        try {
            const r = await api.get("/forms");

            // Poniższy log to klucz do diagnozy: co serwer naprawdę zwrócił?
            console.log("-> Sukces! Dane z serwera (r.data):", r.data);

            // Zabezpieczenie na wypadek, gdyby serwer zwrócił inny format
            const dataToSet = Array.isArray(r.data)
                ? r.data
                : (r.data && Array.isArray(r.data.items) ? r.data.items : []);

            setForms(dataToSet);

            // Sprawdzamy czy forms jest puste po ustawieniu
            if (dataToSet.length === 0) {
                console.warn("Wczytana lista ankiet jest pusta. Sprawdź creator_id w bazie danych.");
            }

        } catch (err) {
            console.error("-> BŁĄD ŁADOWANIA ANKIET:", err);
            if (err.response && err.response.status === 401) {
                alert("Sesja wygasła. Zaloguj się ponownie.");
                nav("/login");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, []);

    // 2. AKCJA: Przejdź do wypełniania
    async function handleFillForm(formId) {
        try {
            const res = await api.post(`/forms/${formId}/link`);
            const token = res.data.token;
            nav(`/forms/public/${token}`);
        } catch (err) {
            alert("Nie udało się otworzyć ankiety");
        }
    }

    // 3. AKCJA: Przejdź do wyników
    function handleViewResults(formId) {
        nav(`/forms/${formId}/submissions`);
    }

    // 4. AKCJA: Udostępnij link
    async function handleShare(formId) {
        try {
            const res = await api.post(`/forms/${formId}/link`);
            const token = res.data.token;
            const fullLink = `${window.location.origin}/forms/public/${token}`;
            prompt("Link dla użytkowników:", fullLink);
        } catch (err) {
            alert("Błąd generowania linku");
        }
    }

    return (
        <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
                <h2>Twoje Ankiety</h2>
                <button
                    onClick={() => nav("/forms/new")}
                    style={{ padding: "10px 20px", background: "#28a745", color: "white", border: "none", borderRadius: 5, cursor: "pointer", fontSize: "16px" }}
                >
                    + Nowa Ankieta
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", marginTop: 50 }}>Ładowanie danych...</div>
            ) : forms.length === 0 ? (
                <div style={{ textAlign: "center", color: "#777", marginTop: 50 }}>
                    <p>Nie masz jeszcze żadnych ankiet.</p>
                </div>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {forms.map(f => (
                        <li key={f.id} style={cardStyle}>
                            <div style={{ fontSize: "1.25em", fontWeight: "bold", color: "#333", marginBottom: 15 }}>
                                {f.title}
                            </div>

                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <button onClick={() => handleFillForm(f.id)} style={btnStyle}>
                                    ✍️ Wypełnij / Podgląd
                                </button>
                                <button onClick={() => handleViewResults(f.id)} style={btnStyle}>
                                    📊 Zobacz Wyniki
                                </button>
                                <button onClick={() => handleShare(f.id)} style={{...btnStyle, background: "#007bff", color: "white", border: "none"}}>
                                    🔗 Udostępnij
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

const cardStyle = {
    border: "1px solid #e0e0e0",
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
    background: "#fff",
    boxShadow: "0 2px 5px rgba(0,0,0,0.05)"
};

const btnStyle = {
    padding: "8px 16px",
    cursor: "pointer",
    border: "1px solid #ccc",
    borderRadius: 4,
    background: "#f8f9fa",
    fontWeight: "600",
    fontSize: "14px",
    color: "#333"
};