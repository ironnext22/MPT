// src/pages/SubmissionsList.js
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function SubmissionsList() {
    const { id } = useParams(); // oczekuje /forms/:id/submissions
    const [subs, setSubs] = useState([]);

    useEffect(()=> {
        async function load() {
            try {
                const res = await api.get(`/forms/${id}/submissions`);
                setSubs(res.data);
            } catch (err) {
                console.error(err);
                alert("Błąd ładowania zgłoszeń");
            }
        }
        load();
    }, [id]);

    return (
        <div style={{ padding: 20 }}>
            <h2>Zgłoszenia</h2>
            {subs.map(s => (
                <div key={s.id} style={{ border: "1px solid #ddd", margin: 8, padding: 8 }}>
                    <div>ID: {s.id} — respondent: {s.respondent_id || s.respondent_user_id} — {s.submitted_at}</div>
                    <ul>
                        {s.answers.map(a => (
                            <li key={a.id}>Q {a.question_id}: {a.value_text ?? `option ${a.value_option_id}`}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
}
