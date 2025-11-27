import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ModalContext } from "../App";

export default function Dashboard() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true); // Dodano stan ładowania
    const nav = useNavigate();

    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareData, setShareData] = useState({ link: "", qrCode: "" });
    const modal = useContext(ModalContext);
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
                modal.showModal("Błąd","Sesja wygasła. Zaloguj się ponownie.");
                nav("/login");
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { load(); }, [modal]);

    // 2. AKCJA: Przejdź do wypełniania
    async function handleFillForm(formId) {
        try {
            const res = await api.post(`/forms/${formId}/link`);
            const token = res.data.token;
            nav(`/forms/public/${token}`);
        } catch (err) {
            modal.showModal("Błąd","Nie udało się otworzyć ankiety");
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
            const { share_link, qr_code, token } = res.data;

            // na wszelki wypadek fallback, gdyby share_link nie przyszedł
            const fullLink = share_link || `${window.location.origin}/forms/public/${token}`;

            setShareData({
                link: fullLink,
                qrCode: qr_code || "",
            });
            setShareModalOpen(true);
        } catch (err) {
            console.error(err);
            modal.showModal("Błąd","Błąd generowania linku");
        }
    }

    async function handleCopyLink() {
        try {
            await navigator.clipboard.writeText(shareData.link);
            modal.showModal("Sukces", "Link skopiowany do schowka ✅");
        } catch (err) {
            console.error(err);
            modal.showModal("Błąd", "Nie udało się skopiować linku. Skopiuj ręcznie.");
        }
    }

    return (
        <div style={{ padding: 20, maxWidth: 900, margin: "0 auto" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 30,
                }}
            >
                <h2>Twoje Ankiety</h2>
                <button
                    onClick={() => nav("/forms/new")}
                    style={{
                        padding: "10px 20px",
                        background: "#28a745",
                        color: "white",
                        border: "none",
                        borderRadius: 5,
                        cursor: "pointer",
                        fontSize: "16px",
                    }}
                >
                    + Nowa Ankieta
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", marginTop: 50 }}>
                    Ładowanie danych...
                </div>
            ) : forms.length === 0 ? (
                <div
                    style={{
                        textAlign: "center",
                        color: "#777",
                        marginTop: 50,
                    }}
                >
                    <p>Nie masz jeszcze żadnych ankiet.</p>
                </div>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {forms.map((f) => (
                        <li key={f.id} style={cardStyle}>
                            <div
                                style={{
                                    fontSize: "1.25em",
                                    fontWeight: "bold",
                                    color: "#333",
                                    marginBottom: 15,
                                }}
                            >
                                {f.title}
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    gap: 10,
                                    flexWrap: "wrap",
                                }}
                            >
                                <button
                                    onClick={() => handleFillForm(f.id)}
                                    style={btnStyle}
                                >
                                    ✍️ Wypełnij / Podgląd
                                </button>

                                <button
                                    onClick={() => handleViewResults(f.id)}
                                    style={btnStyle}
                                >
                                    📊 Zobacz Wyniki
                                </button>

                                <button
                                    onClick={() => handleShare(f.id)}
                                    style={{
                                        ...btnStyle,
                                        background: "#007bff",
                                        color: "white",
                                        border: "none",
                                    }}
                                >
                                    🔗 Udostępnij
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {/* MODAL Z LINKIEM I QR-KODEM */}
            {shareModalOpen && (
                <div
                    style={backdropStyle}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShareModalOpen(false);
                    }}
                >
                    <div style={modalStyle}>
                        <h3 style={{ marginTop: 0 }}>Udostępnij ankietę</h3>
                        <p>Skopiuj link lub zeskanuj kod QR.</p>

                        <div
                            style={{
                                display: "flex",
                                gap: 8,
                                marginBottom: 16,
                            }}
                        >
                            <input
                                type="text"
                                readOnly
                                value={shareData.link}
                                style={{
                                    flex: 1,
                                    padding: "8px",
                                    borderRadius: 4,
                                    border: "1px solid #ccc",
                                    fontSize: 14,
                                }}
                            />
                            <button
                                onClick={handleCopyLink}
                                style={copyBtnStyle}
                            >
                                📋 Kopiuj
                            </button>
                        </div>

                        {shareData.qrCode && (
                            <div
                                style={{
                                    textAlign: "center",
                                    marginBottom: 16,
                                }}
                            >
                                <img
                                    src={shareData.qrCode}
                                    alt="Kod QR do ankiety"
                                    style={{ maxWidth: 200, maxHeight: 200 }}
                                />
                            </div>
                        )}

                        <div style={{ textAlign: "right" }}>
                            <button
                                onClick={() => setShareModalOpen(false)}
                                style={btnStyle}
                            >
                                Zamknij
                            </button>
                        </div>
                    </div>
                </div>
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

const backdropStyle = {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
};

const modalStyle = {
    background: "#fff",
    padding: 20,
    borderRadius: 8,
    maxWidth: 500,
    width: "90%",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
};

const copyBtnStyle = {
    ...btnStyle,
    background: "#007bff",
    color: "white",
    border: "none",
};