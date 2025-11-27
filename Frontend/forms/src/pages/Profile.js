import React, { useContext, useMemo } from "react";
import { AuthContext } from "../contexts/AuthContext";

function parseJwt(token) {
    if (!token) return null;
    try {
        const base64 = token.split(".")[1];
        if (!base64) return null;
        const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
        return JSON.parse(json);
    } catch (e) {
        console.warn("Nie udało się zdekodować JWT", e);
        return null;
    }
}

export default function Profile() {
    const { token } = useContext(AuthContext);

    const userInfo = useMemo(() => {
        if (!token) return null;
        const payload = parseJwt(token) || {};

        const username =
            payload.preferred_username ||
            payload.username ||
            payload.sub ||
            "użytkownik";

        const email =
            payload.email || "brak";

        return {
            username,
            email,
            displayName: username, // teraz = login, później osobne pole w bazie
        };
    }, [token]);

    const initials =
        (userInfo?.displayName || "U")
            .split(" ")
            .map((p) => p[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);

    const maskedPassword = "********"; // placeholder

    return (
        <div style={{ padding: 20, maxWidth: 700, margin: "0 auto" }}>
            <h2>Profil użytkownika</h2>

            <div
                style={{
                    marginTop: 20,
                    padding: 20,
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    display: "flex",
                    gap: 20,
                    alignItems: "center",
                    background: "#f9f9f9",
                }}
            >
                {/* Placeholder dla awatara */}
                <div
                    style={{
                        width: 90,
                        height: 90,
                        borderRadius: "50%",
                        background: "#e0e0e0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 32,
                        fontWeight: "bold",
                        color: "#555",
                        flexShrink: 0,
                    }}
                >
                    {initials}
                </div>

                {/* Informacje o użytkowniku + przyciski obok */}
                <div style={{ flex: 1 }}>
                    {/* Wyświetlana nazwa */}
                    <div style={{ marginBottom: 14 }}>
                        <div style={{ fontWeight: "bold" }}>
                            Wyświetlana nazwa:
                        </div>
                        <div>{userInfo?.displayName || "—"}</div>
                    </div>

                    {/* Login + przycisk zmiany */}
                    <div style={rowStyle}>
                        <div>
                            <strong>Login:</strong>{" "}
                            {userInfo?.username || "—"}
                        </div>
                        <button
                            type="button"
                            style={btnInlineStyle}
                            onClick={() => {
                                // TODO: modal zmiany loginu
                                console.log("TODO: zmiana loginu");
                            }}
                        >
                            Zmień login
                        </button>
                    </div>

                    {/* E-mail + przycisk zmiany */}
                    <div style={rowStyle}>
                        <div>
                            <strong>E-mail:</strong>{" "}
                            {userInfo?.email || "—"}
                        </div>
                        <button
                            type="button"
                            style={btnInlineStyle}
                            onClick={() => {
                                // TODO: modal zmiany e-maila
                                console.log("TODO: zmiana e-maila");
                            }}
                        >
                            Zmień e-mail
                        </button>
                    </div>

                    {/* Hasło (zagwiazdkowane) + przycisk zmiany */}
                    <div style={rowStyle}>
                        <div>
                            <strong>Hasło:</strong>{" "}
                            <span>{maskedPassword}</span>
                        </div>
                        <button
                            type="button"
                            style={btnInlineStyle}
                            onClick={() => {
                                // TODO: modal zmiany hasła
                                console.log("TODO: zmiana hasła");
                            }}
                        >
                            Zmień hasło
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: 20, fontSize: 12, color: "#777" }}>
                Uwaga: akcje zmiany loginu, e-maila i hasła są na razie
                placeholderami – zostaną podpięte do API i własnych popupów,
                gdy backend będzie gotowy.
            </div>
        </div>
    );
}

const rowStyle = {
    marginBottom: 8,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
};

const btnInlineStyle = {
    padding: "6px 12px",
    borderRadius: 6,
    border: "none",
    background: "#007bff",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    color: "#fff",
    whiteSpace: "nowrap",
};
