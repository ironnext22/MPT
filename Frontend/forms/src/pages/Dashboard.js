// src/pages/Dashboard.js
import React, { useEffect, useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";


export default function Dashboard() {
    const [forms, setForms] = useState([]);
    const nav = useNavigate();

    async function load() {
        try {
            const r = await api.get("/forms");
            setForms(r.data);
        } catch (err) {
            console.error(err);
            alert("Błąd ładowania formularzy");
        }
    }

    useEffect(()=>{ load(); }, []);

    async function createShare(formId) {
        try {
            const res = await api.post(`/forms/${formId}/link`);
            prompt("Publiczny link (skopiuj):", res.data.share_link);
        } catch (err) {
            console.error(err);
            alert("Błąd generowania linku");
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Moje ankiety</h2>
            <button onClick={() => nav("/forms/new")}>Utwórz nową ankietę</button>
            <ul>
                {forms.map(f => (
                    <li key={f.id}>
                        <strong>{f.title}</strong> — <Link to={`/forms/${f.id}/submissions`}>Zgłoszenia</Link>{" "}
                        <button onClick={()=>createShare(f.id)}>Generuj publiczny link</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
