import React, {
    useContext,
    useMemo,
    useEffect,
    useState,
    useRef,
} from "react";
import { AuthContext } from "../contexts/AuthContext";
import api from "../api";

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

    const [profile, setProfile] = useState(null);
    const fileInputRef = useRef(null);

    // dane wyciągane z JWT – używane jako fallback
    const userInfo = useMemo(() => {
        if (!token) return null;
        const payload = parseJwt(token) || {};

        const username =
            payload.preferred_username ||
            payload.username ||
            payload.sub ||
            "użytkownik";

        const email = payload.email || "brak";

        return {
            username,
            email,
            displayName: username,
        };
    }, [token]);

    // pobieramy pełny profil z backendu
    useEffect(() => {
        if (!token) {
            setProfile(null);
            return;
        }

        api
            .get("/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })
            .then((res) => setProfile(res.data))
            .catch((err) => {
                console.error("Nie udało się pobrać profilu", err);
                setProfile(null);
            });
    }, [token]);

    const effectiveUsername =
        profile?.username || userInfo?.username || "użytkownik";
    const effectiveEmail = profile?.email || userInfo?.email || "brak";
    const avatarUrl = profile?.avatar_url || null;

    const initials = (effectiveUsername || "U")
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const maskedPassword = "********"; // placeholder na hasło

    const handleAvatarClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleAvatarFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const dataUrl = reader.result;

            api
                .patch(
                    "/me/avatar",
                    { avatar_url: dataUrl },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                )
                .then((res) => {
                    setProfile(res.data);
                })
                .catch((err) => {
                    console.error("Nie udało się zaktualizować avatara", err);
                });
        };
        reader.readAsDataURL(file);
    };

    // na razie tylko placeholdery – potem można podpiąć modale / formularze
    const handleChangeLogin = () => {
        alert("Zmiana loginu: TODO – do podpięcia z backendem.");
    };

    const handleChangeEmail = () => {
        alert("Zmiana e-maila: TODO – do podpięcia z backendem.");
    };

    const handleChangePassword = () => {
        alert("Zmiana hasła: TODO – do podpięcia z backendem.");
    };

    return (
        <div
            style={{
                padding: 20,
                maxWidth: 700,
                margin: "40px auto",
            }}
        >
            <h2>Profil użytkownika</h2>

            {/* Górna karta z avatarem */}
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
                {/* Avatar */}
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
                        cursor: "pointer",
                        overflow: "hidden",
                    }}
                    onClick={handleAvatarClick}
                    title="Kliknij, aby zmienić awatar"
                >
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="Awatar"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                        />
                    ) : (
                        initials
                    )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                        style={{
                            fontSize: 18,
                            fontWeight: 600,
                            marginBottom: 4,
                        }}
                    >
                        {effectiveUsername}
                    </div>
                    <div
                        style={{
                            fontSize: 14,
                            color: "#666",
                            marginBottom: 8,
                            wordBreak: "break-all",
                        }}
                    >
                        {effectiveEmail}
                    </div>

                    <button
                        type="button"
                        style={btnInlineStyle}
                        onClick={handleAvatarClick}
                    >
                        Zmień awatar
                    </button>
                </div>
            </div>

            {/* Szczegółowe dane + przyciski */}
            <div
                style={{
                    marginTop: 24,
                    padding: 20,
                    borderRadius: 8,
                    border: "1px solid #ddd",
                }}
            >
                {/* Login + przycisk zmiany */}
                <div style={rowStyle}>
                    <div>
                        <strong>Login:</strong> {effectiveUsername}
                    </div>
                    <button
                        type="button"
                        style={btnInlineStyle}
                        onClick={handleChangeLogin}
                    >
                        Zmień login
                    </button>
                </div>

                {/* E-mail + przycisk zmiany */}
                <div style={rowStyle}>
                    <div>
                        <strong>E-mail:</strong> {effectiveEmail}
                    </div>
                    <button
                        type="button"
                        style={btnInlineStyle}
                        onClick={handleChangeEmail}
                    >
                        Zmień e-mail
                    </button>
                </div>

                {/* Hasło + przycisk zmiany */}
                <div style={rowStyle}>
                    <div>
                        <strong>Hasło:</strong> {maskedPassword}
                    </div>
                    <button
                        type="button"
                        style={btnInlineStyle}
                        onClick={handleChangePassword}
                    >
                        Zmień hasło
                    </button>
                </div>
            </div>

            {/* Ukryty input do wyboru pliku z avatarem */}
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleAvatarFileChange}
            />
        </div>
    );
}

const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
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
