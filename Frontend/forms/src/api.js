// src/api.js
import axios from "axios";

const BACKEND = process.env.REACT_APP_API_URL || "http://localhost:8000";

const api = axios.create({
    baseURL: BACKEND,
});

export function setAuthToken(token) {
    if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete api.defaults.headers.common["Authorization"];
}

export default api;
