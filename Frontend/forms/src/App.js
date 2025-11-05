import React, { useEffect, useState } from "react";
import "./App.css"


const API_ENDPOINT = "http://localhost:8000";
export default function App() {
    const [msg, setMsg] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(API_ENDPOINT, { headers: { Accept: "application/json" } });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (typeof data?.message === "string") setMsg(data.message);
                else throw new Error('Brak pola "message" w odpowiedzi API');
            } catch (e) {
                setError(e.message || "Błąd nieznany");
            } finally {
                setLoading(false);
            }
        })();
    }, []);
    return (
        <main className="App">
            <h1>Witaj w React 👋</h1>
            {loading ? (
                <p>Ładowanie…</p>
            ) : error ? (
                <>
                    <p className="error">Nie udało się pobrać wiadomości: {error}</p>
                </>
            ) : (
                <p>{msg}</p>
            )}
        </main>
    );
}