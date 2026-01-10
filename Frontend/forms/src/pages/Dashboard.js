import React, { useEffect, useState, useContext } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ModalContext } from "../App";

export default function Dashboard() {
    const [forms, setForms] = useState([]);
    const [loading, setLoading] = useState(true);
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

            console.log("-> Sukces! Dane z serwera (r.data):", r.data);

            const dataToSet = Array.isArray(r.data)
                ? r.data
                : (r.data && Array.isArray(r.data.items) ? r.data.items : []);

            setForms(dataToSet);

            if (dataToSet.length === 0) {
                console.warn("Wczytana lista ankiet jest pusta.");
            }
        } catch (err) {
            console.error("-> Błąd przy pobieraniu ankiet:", err);
            modal.showModal("Błąd", "Nie udało się pobrać listy ankiet");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // 2. AKCJA: Przejdź do wypełniania
    async function handleFillForm(formId) {
        try {
            const res = await api.post(`/forms/${formId}/link`);
            const token = res.data.token;
            nav(`/public/${token}`);
        } catch (err) {
            console.error(err);
            modal.showModal("Błąd", "Nie udało się otworzyć ankiety");
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
            const { qr_code, token } = res.data;

            const fullLink = `${window.location.origin}/public/${token}`;

            setShareData({
                link: fullLink,
                qrCode: qr_code ? `data:image/png;base64,${qr_code}` : "",
            });

            setShareModalOpen(true);
        } catch (err) {
            console.error(err);
            modal.showModal("Błąd", "Nie udało się wygenerować linku");
        }
    }

    // ✅ NOWE: Edycja
    function handleEdit(formId) {
        nav(`/forms/${formId}/edit`);
    }

    // ✅ NOWE: Usuwanie
    async function handleDelete(formId) {
        const ok = window.confirm(
            "Na pewno usunąć tę ankietę?\nTej akcji nie da się cofnąć."
        );
        if (!ok) return;

        try {
            await api.delete(`/forms/${formId}`);
            modal.showModal("Sukces", "Ankieta usunięta ✅");
            load();
        } catch (err) {
            console.error(err);
            modal.showModal("Błąd", "Nie udało się usunąć ankiety.");
        }
    }

    // 5. AKCJA: kopiowanie linku
    async function copyLink() {
        try {
            await navigator.clipboard.writeText(shareData.link);
            modal.showModal("OK", "Skopiowano link ✅");
        } catch (err) {
            console.error(err);
            modal.showModal("Błąd", "Nie udało się skopiować linku");
        }
    }

    return (
        <div style={containerStyle}>
            <div style={headerStyle}>
                <h2>Twoje Ankiety</h2>
                <button
                    onClick={() => nav("/forms/new")}
                    style={primaryBtnStyle}
                >
                    + Nowa Ankieta
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", marginTop: 50 }}>
                    Ładowanie danych...
                </div>
            ) : forms.length === 0 ? (
                <div style={{ textAlign: "center", color: "#777", marginTop: 50 }}>
                    <p>Nie masz jeszcze żadnych ankiet.</p>
                </div>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {forms.map((f) => (
                        <li key={f.id} style={cardStyle}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                <div>
                                    <h3 style={{ margin: "0 0 6px 0" }}>{f.title}</h3>
                                    <div style={{ color: "#666", fontSize: 13 }}>
                                        ID: {f.id}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                                <button onClick={() => handleFillForm(f.id)} style={btnStyle}>
                                    ✍️ Wypełnij / Podgląd
                                </button>

                                <button onClick={() => handleViewResults(f.id)} style={btnStyle}>
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

                                {/* ✅ NOWE */}
                                <button onClick={() => handleEdit(f.id)} style={btnStyle}>
                                    ✏️ Edytuj
                                </button>

                                {/* ✅ NOWE */}
                                <button
                                    onClick={() => handleDelete(f.id)}
                                    style={{
                                        ...btnStyle,
                                        background: "#dc3545",
                                        color: "white",
                                        border: "none",
                                    }}
                                >
                                    🗑️ Usuń
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
                        <h3>Udostępnij ankietę</h3>

                        <div style={{ marginTop: 10 }}>
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>Link:</div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <input
                                    value={shareData.link}
                                    readOnly
                                    style={{
                                        width: "100%",
                                        padding: 10,
                                        borderRadius: 6,
                                        border: "1px solid #ddd",
                                    }}
                                />
                                <button onClick={copyLink} style={copyBtnStyle}>Kopiuj</button>
                            </div>
                        </div>

                        {shareData.qrCode && (
                            <div style={{ marginTop: 16, textAlign: "center" }}>
                                <div style={{ fontWeight: 600, marginBottom: 8 }}>QR Code:</div>
                                <img
                                    src={shareData.qrCode}
                                    alt="QR Code"
                                    style={{ width: 200, height: 200 }}
                                />
                            </div>
                        )}

                        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
                            <button onClick={() => setShareModalOpen(false)} style={btnStyle}>
                                Zamknij
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Styles
const containerStyle = {
    maxWidth: 900,
    margin: "0 auto",
    padding: 20,
};

const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    gap: 10,
};

const cardStyle = {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
};

const btnStyle = {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#f7f7f7",
    cursor: "pointer",
    fontSize: 14,
    color: "#111",
};

const primaryBtnStyle = {
    ...btnStyle,
    background: "#28a745",
    border: "none",
    color: "white",
};

const backdropStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 16,
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
