// src/components/AppModal.js
import React from "react";

export default function AppModal({ open, onClose, title, children }) {
    if (!open) return null;

    return (
        <div
            className="app-modal-backdrop"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="app-modal">
                <h3 className="app-modal__title">{title}</h3>

                <div className="app-modal__content">{children}</div>

                <div className="app-modal__actions">
                    {/* bez inline kolorów → bierze kolory z globalnych CSS variables (działa w darkmode) */}
                    <button onClick={onClose}>OK</button>
                </div>
            </div>
        </div>
    );
}
