// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect } from "react";
import { setAuthToken } from "../api";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null);

    useEffect(() => {
        setAuthToken(token);
        if (token) localStorage.setItem("token", token);
        else localStorage.removeItem("token");
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, setToken, user, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}
