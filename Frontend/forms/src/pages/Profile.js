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

    // stany edycji
    const [editingUsername, setEditingUsername] = useState(false);
    const [editingEmail, setEditingEmail] = useState(false);
    const [editingPassword, setEditingPassword] = useState(false);

    const [usernameInput, setUsernameInput] = useState("");
    const [emailInput, setEmailInput] = useState("");
    const [currentPasswordInput, setCurrentPasswordInput] = useState("");
    const [newPasswordInput, setNewPasswordInput] = useState("");

    // fallback z JWT
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

    // pobranie profilu z backendu
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
            .then((res) => {
                setProfile(res.data);
            })
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

    const maskedPassword = "********";

    // avatar

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
                    alert(
                        err.response?.data?.detail ||
                        "Nie udało się zaktualizować avatara."
                    );
                });
        };
        reader.readAsDataURL(file);
    };

    // LOGIN

    const startEditUsername = () => {
        setUsernameInput(effectiveUsername);
        setEditingUsername(true);
    };

    const cancelEditUsername = () => {
        setEditingUsername(false);
        setUsernameInput("");
    };

    const saveUsername = () => {
        api
            .patch(
                "/me/username",
                { username: usernameInput },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then((res) => {
                setProfile(res.data);
                setEditingUsername(false);
                alert("Login został zaktualizowany.");
            })
            .catch((err) => {
                console.error("Nie udało się zaktualizować loginu", err);
                alert(
                    err.response?.data?.detail ||
                    "Nie udało się zaktualizować loginu."
                );
            });
    };

    // EMAIL

    const startEditEmail = () => {
        setEmailInput(effectiveEmail === "brak" ? "" : effectiveEmail);
        setEditingEmail(true);
    };

    const cancelEditEmail = () => {
        setEditingEmail(false);
        setEmailInput("");
    };

    const saveEmail = () => {
        api
            .patch(
                "/me/email",
                { email: emailInput },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then((res) => {
                setProfile(res.data);
                setEditingEmail(false);
                alert("E-mail został zaktualizowany.");
            })
            .catch((err) => {
                console.error("Nie udało się zaktualizować e-maila", err);
                alert(
                    err.response?.data?.detail ||
                    "Nie udało się zaktualizować e-maila."
                );
            });
    };

    // HASŁO

    const startEditPassword = () => {
        setCurrentPasswordInput("");
        setNewPasswordInput("");
        setEditingPassword(true);
    };

    const cancelEditPassword = () => {
        setEditingPassword(false);
        setCurrentPasswordInput("");
        setNewPasswordInput("");
    };

    const savePassword = () => {
        api
            .patch(
                "/me/password",
                {
                    current_password: currentPasswordInput,
                    new_password: newPasswordInput,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            .then((res) => {
                setProfile(res.data);
                setEditingPassword(false);
                setCurrentPasswordInput("");
                setNewPasswordInput("");
                alert("Hasło zostało zaktualizowane.");
            })
            .catch((err) => {
                console.error("Nie udało się zaktualizować hasła", err);
                alert(
                    err.response?.data?.detail ||
                    "Nie udało się zaktualizować hasła."
                );
            });
    };

    if (!token) {
        return (
            <div style={{ padding: 20 }}>
                Musisz być zalogowany, aby zobaczyć profil.
            </div>
        );
    }

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

            {/* Dane + edycja */}
            <div
                style={{
                    marginTop: 24,
                    padding: 20,
                    borderRadius: 8,
                    border: "1px solid #ddd",
                }}
            >
                {/* LOGIN */}
                <div style={rowStyle}>
                    <div>
                        <strong>Login:</strong>{" "}
                        {editingUsername ? (
                            <input
                                type="text"
                                value={usernameInput}
                                onChange={(e) =>
                                    setUsernameInput(e.target.value)
                                }
                                style={{ marginLeft: 8, padding: 4 }}
                            />
                        ) : (
                            effectiveUsername
                        )}
                    </div>
                    <div>
                        {editingUsername ? (
                            <>
                                <button
                                    type="button"
                                    style={{
                                        ...btnInlineStyle,
                                        marginRight: 8,
                                    }}
                                    onClick={saveUsername}
                                >
                                    Zapisz
                                </button>
                                <button
                                    type="button"
                                    style={btnInlineStyleSecondary}
                                    onClick={cancelEditUsername}
                                >
                                    Anuluj
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                style={btnInlineStyle}
                                onClick={startEditUsername}
                            >
                                Zmień login
                            </button>
                        )}
                    </div>
                </div>

                {/* EMAIL */}
                <div style={rowStyle}>
                    <div>
                        <strong>E-mail:</strong>{" "}
                        {editingEmail ? (
                            <input
                                type="email"
                                value={emailInput}
                                onChange={(e) =>
                                    setEmailInput(e.target.value)
                                }
                                style={{ marginLeft: 8, padding: 4 }}
                            />
                        ) : (
                            effectiveEmail
                        )}
                    </div>
                    <div>
                        {editingEmail ? (
                            <>
                                <button
                                    type="button"
                                    style={{
                                        ...btnInlineStyle,
                                        marginRight: 8,
                                    }}
                                    onClick={saveEmail}
                                >
                                    Zapisz
                                </button>
                                <button
                                    type="button"
                                    style={btnInlineStyleSecondary}
                                    onClick={cancelEditEmail}
                                >
                                    Anuluj
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                style={btnInlineStyle}
                                onClick={startEditEmail}
                            >
                                Zmień e-mail
                            </button>
                        )}
                    </div>
                </div>

                {/* HASŁO */}
                <div style={rowStyle}>
                    <div>
                        <strong>Hasło:</strong> {maskedPassword}
                        {editingPassword && (
                            <div style={{ marginTop: 8 }}>
                                <div style={{ marginBottom: 6 }}>
                                    <label>
                                        Obecne hasło:{" "}
                                        <input
                                            type="password"
                                            value={currentPasswordInput}
                                            onChange={(e) =>
                                                setCurrentPasswordInput(
                                                    e.target.value
                                                )
                                            }
                                            style={{ padding: 4 }}
                                        />
                                    </label>
                                </div>
                                <div>
                                    <label>
                                        Nowe hasło:{" "}
                                        <input
                                            type="password"
                                            value={newPasswordInput}
                                            onChange={(e) =>
                                                setNewPasswordInput(
                                                    e.target.value
                                                )
                                            }
                                            style={{ padding: 4 }}
                                        />
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                    <div>
                        {editingPassword ? (
                            <>
                                <button
                                    type="button"
                                    style={{
                                        ...btnInlineStyle,
                                        marginRight: 8,
                                    }}
                                    onClick={savePassword}
                                >
                                    Zapisz
                                </button>
                                <button
                                    type="button"
                                    style={btnInlineStyleSecondary}
                                    onClick={cancelEditPassword}
                                >
                                    Anuluj
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                style={btnInlineStyle}
                                onClick={startEditPassword}
                            >
                                Zmień hasło
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* input do wyboru pliku z avatarem */}
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

const btnInlineStyleSecondary = {
    ...btnInlineStyle,
    background: "#6c757d",
};
