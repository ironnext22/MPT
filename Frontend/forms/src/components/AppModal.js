import React from "react";

export default function AppModal({ open, onClose, title, children }) {
    if (!open) return null;

    return (
        <div
            style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999
            }}
            onClick={(e)=>{ if(e.target === e.currentTarget) onClose(); }}
        >
            <div
                style={{
                    background: "#fff",
                    padding: 20,
                    borderRadius: 10,
                    width: "90%",
                    maxWidth: 420,
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
                }}
            >
                <h3 style={{ marginTop: 0 }}>{title}</h3>
                <div style={{ marginBottom: 20 }}>
                    {children}
                </div>

                <div style={{ textAlign: "right" }}>
                    <button
                        onClick={onClose}
                        style={{
                            padding: "8px 16px",
                            cursor: "pointer",
                            background: "#007bff",
                            color: "white",
                            border: "none",
                            borderRadius: 6,
                        }}
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
}
