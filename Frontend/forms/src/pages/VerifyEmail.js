// src/pages/VerifyEmail.js
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function VerifyEmail() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");

        if (!token) {
            navigate("/");
            return;
        }

        (async () => {
            try {
                await api.get(`/verify-email?token=${encodeURIComponent(token)}`);

                // Po poprawnej weryfikacji → strona główna
                navigate("/");

            } catch (err) {
                // Nawet przy błędzie i tak wracamy na stronę główną
                console.error("Błąd weryfikacji e-maila:", err);
                navigate("/");
            }
        })();
    }, [searchParams, navigate]);

    return (
        <div style={{ textAlign: "center", padding: 40 }}>
            <p>Weryfikuję e-mail…</p>
        </div>
    );
}
