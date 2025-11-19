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
            api.get(`/forms/${id}`),
            api.get(`/forms/${id}/submissions`),
        ])
            .then(([formRes, subRes]) => {
                setFormInfo(formRes.data);
                setSubmissions(subRes.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                alert("Błąd ładowania wyników");
                nav("/dashboard");
            });
    }, [id, nav]);

    if (loading) return <div style={{ padding: 20 }}>Ładowanie wyników...</div>;

    return (
        <div style={{ padding: 20 }}>
            <button
                onClick={() => nav("/dashboard")}
                style={{ marginBottom: 20 }}
            >
                ← Wróć do Dashboardu
            </button>

            <h2>Wyniki: {formInfo.title}</h2>
            <p>
                Liczba zgłoszeń: <strong>{submissions.length}</strong>
            </p>

            {submissions.length === 0 ? (
                <p style={{ fontStyle: "italic", color: "#666" }}>
                    Nikt jeszcze nie wypełnił tej ankiety.
                </p>
            ) : (
                <div style={{ overflowX: "auto" }}>
                    <table
                        border="1"
                        cellPadding="10"
                        style={{
                            borderCollapse: "collapse",
                            width: "100%",
                            minWidth: 600,
                        }}
                    >
                        <thead style={{ background: "#f0f0f0" }}>
                        <tr>
                            <th>ID Zgłoszenia</th>
                            <th>Data</th>
                            {formInfo.questions.map((q) => (
                                <th
                                    key={q.id}
                                    style={{ minWidth: 150 }}
                                >
                                    {q.question_text}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {submissions.map((sub) => (
                            <tr key={sub.id}>
                                <td>#{sub.id}</td>
                                <td>
                                    {new Date(
                                        sub.started_at
                                    ).toLocaleString()}
                                </td>

                                {formInfo.questions.map((q) => {
                                    // Wszystkie odpowiedzi dla danego pytania
                                    const answersForQuestion =
                                        sub.answers.filter(
                                            (a) =>
                                                Number(a.question_id) ===
                                                Number(q.id)
                                        );

                                    let cellContent = "-";

                                    if (
                                        answersForQuestion &&
                                        answersForQuestion.length > 0
                                    ) {
                                        // Jeśli to pytanie tekstowe – bierzemy tekst
                                        if (
                                            ["short_text", "long_text"].includes(
                                                q.ans_kind
                                            )
                                        ) {
                                            cellContent =
                                                answersForQuestion[0]
                                                    .answer_text || "-";
                                        } else {
                                            // single_choice / multiple_choice – mapujemy option_id -> option_text
                                            const optionLabels =
                                                answersForQuestion.map(
                                                    (a) => {
                                                        if (!a.option_id)
                                                            return null;
                                                        const opt =
                                                            q.options.find(
                                                                (o) =>
                                                                    Number(
                                                                        o.id
                                                                    ) ===
                                                                    Number(
                                                                        a.option_id
                                                                    )
                                                            );
                                                        return opt
                                                            ? opt.option_text
                                                            : `Opcja ID: ${a.option_id}`;
                                                    }
                                                ).filter(Boolean);

                                            cellContent =
                                                optionLabels.length > 0
                                                    ? optionLabels.join(
                                                        ", "
                                                    )
                                                    : "-";
                                        }
                                    }

                                    return (
                                        <td key={q.id}>{cellContent}</td>
                                    );
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
