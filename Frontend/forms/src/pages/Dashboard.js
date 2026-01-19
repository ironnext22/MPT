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

    async function load() {
        setLoading(true);
        try {
            const r = await api.get("/forms");
            const dataToSet = Array.isArray(r.data)
                ? r.data
                : (r.data && Array.isArray(r.data.items) ? r.data.items : []);

            setForms(dataToSet);
        } catch (err) {
            console.error("Błąd przy pobieraniu ankiet:", err);
            modal.showModal("Błąd", "Nie udało się pobrać listy ankiet");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

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

    function handleViewResults(formId) {
        nav(`/forms/${formId}/submissions`);
    }

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

    function handleEdit(formId) {
        nav(`/forms/${formId}/edit`);
    }

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
                <h2 style={{ color: "var(--nav-bg)" }}>Twoje Ankiety</h2>
                <button
                    onClick={() => nav("/forms/new")}
                    style={primaryBtnStyle}
                >
                    + Nowa Ankieta
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: "center", marginTop: 50, color: "var(--text-color)" }}>
                    Ładowanie danych...
                </div>
            ) : forms.length === 0 ? (
                <div style={{ textAlign: "center", color: "var(--footer-text)", marginTop: 50 }}>
                    <p>Nie masz jeszcze żadnych ankiet.</p>
                </div>
            ) : (
                <ul style={{ listStyle: "none", padding: 0 }}>
                    {forms.map((f) => (
                        <li key={f.id} style={cardStyle}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                <div>
                                    <h3 style={{ margin: "0 0 6px 0", color: "var(--text-color)" }}>{f.title}</h3>
                                    <div style={{ color: "var(--footer-text)", fontSize: 13 }}>
                                        ID: {f.id}
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
                                <button onClick={() => handleFillForm(f.id)} style={btnStyle}>
                                    ✍️ Podgląd
                                </button>

                                <button onClick={() => handleViewResults(f.id)} style={btnStyle}>
                                    📊 Wyniki
                                </button>

                                <button
                                    onClick={() => handleShare(f.id)}
                                    style={shareBtnStyle}
                                >
                                    🔗 Udostępnij
                                </button>

                                <button onClick={() => handleEdit(f.id)} style={btnStyle}>
                                    ✏️ Edytuj
                                </button>

                                <button
                                    onClick={() => handleDelete(f.id)}
                                    style={deleteBtnStyle}
                                >
                                    🗑️ Usuń
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {shareModalOpen && (
                <div
                    style={backdropStyle}
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setShareModalOpen(false);
                    }}
                >
                    <div style={modalStyle}>
                        <h3 style={{ marginTop: 0, color: "var(--text-color)" }}>Udostępnij ankietę</h3>

                        <div style={{ marginTop: 10 }}>
                            <div style={{ fontWeight: 600, marginBottom: 6, color: "var(--text-color)" }}>Link:</div>
                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                <input
                                    value={shareData.link}
                                    readOnly
                                    style={modalInputStyle}
                                />
                                <button onClick={copyLink} style={copyBtnStyle}>Kopiuj</button>
                            </div>
                        </div>

                        {shareData.qrCode && (
                            <div style={{ marginTop: 16, textAlign: "center" }}>
                                <div style={{ fontWeight: 600, marginBottom: 8, color: "var(--text-color)" }}>QR Code:</div>
                                <div style={qrWrapperStyle}>
                                    <img
                                        src={shareData.qrCode}
                                        alt="QR Code"
                                        style={{ width: 180, height: 180, display: "block", margin: "0 auto" }}
                                    />
                                </div>
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
    background: "var(--card-bg)",
    border: "1px solid var(--border-color)",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
};

const btnStyle = {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid var(--border-color)",
    background: "var(--input-bg)",
    cursor: "pointer",
    fontSize: 14,
    color: "var(--text-color)",
};

const primaryBtnStyle = {
    ...btnStyle,
    background: "var(--primary-button)",
    border: "none",
    color: "white",
    fontWeight: "600"
};

const shareBtnStyle = {
    ...btnStyle,
    background: "var(--nav-bg)",
    color: "var(--nav-text)",
    border: "none",
};

const deleteBtnStyle = {
    ...btnStyle,
    background: "#dc3545",
    color: "white",
    border: "none",
};

const backdropStyle = {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    background: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 16,
};

const modalStyle = {
    background: "var(--card-bg)",
    padding: 24,
    borderRadius: 12,
    maxWidth: 500,
    width: "90%",
    boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
    border: "1px solid var(--border-color)",
};

const modalInputStyle = {
    width: "100%",
    padding: 10,
    borderRadius: 6,
    border: "1px solid var(--border-color)",
    background: "var(--bg-color)",
    color: "var(--text-color)",
};

const copyBtnStyle = {
    ...btnStyle,
    background: "var(--nav-bg)",
    color: "var(--nav-text)",
    border: "none",
};

const qrWrapperStyle = {
    background: "white", // QR kody zawsze potrzebują białego tła do skanowania
    padding: 10,
    borderRadius: 8,
    display: "inline-block"
};