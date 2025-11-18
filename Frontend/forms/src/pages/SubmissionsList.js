import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";

export default function SubmissionsList() {
    const { id } = useParams(); // to jest form_id
    const nav = useNavigate();

    const [submissions, setSubmissions] = useState([]);
    const [formInfo, setFormInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            api.get(`/forms/${id}`),              // Poprawione backticki
            api.get(`/forms/${id}/submissions`)   // Poprawione backticki
        ]).then(([formRes, subRes]) => {
            setFormInfo(formRes.data);
            setSubmissions(subRes.data);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            alert("Błąd ładowania wyników");
            nav("/dashboard");
        });
    }, [id, nav]);

    if (loading) return <div style={{ padding: 20 }}>Ładowanie wyników...</div>;

    return (
        <div style={{ padding: 20 }}>
            <button onClick={() => nav("/dashboard")} style={{ marginBottom: 20 }}>← Wróć do Dashboardu</button>

            <h2>Wyniki: {formInfo.title}</h2>
            <p>Liczba zgłoszeń: <strong>{submissions.length}</strong></p>

            {submissions.length === 0 ? (
                <p style={{ fontStyle: "italic", color: "#666" }}>Nikt jeszcze nie wypełnił tej ankiety.</p>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%", minWidth: 600 }}>
                        <thead style={{ background: "#f0f0f0" }}>
                        <tr>
                            <th>ID Zgłoszenia</th>
                            <th>Data</th>
                            {formInfo.questions.map(q => (
                                <th key={q.id} style={{ minWidth: 150 }}>{q.question_text}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {submissions.map(sub => (
                            <tr key={sub.id}>
                                <td>#{sub.id}</td>
                                <td>{new Date(sub.started_at).toLocaleString()}</td>

                                {formInfo.questions.map(q => {
                                    const answer = sub.answers.find(a => Number(a.question_id) === Number(q.id));
                                    console.log("ans:", answer);
                                    let cellContent = "-";
                                    if (answer) {
                                        if (answer.answer_text) {
                                            cellContent = answer.answer_text;
                                        } else if (answer.option_id) {
                                            const option = q.options.find(o => o.id === answer.option_id);
                                            cellContent = option ? option.option_text : `Opcja ID: ${answer.option_id}`;
                                        }
                                    }

                                    return <td key={q.id}>{cellContent}</td>;
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}