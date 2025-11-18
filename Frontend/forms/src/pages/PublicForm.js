import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function PublicForm() {
    const { token } = useParams();
    const [form, setForm] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [respondentEmail, setRespondentEmail] = useState("");
    const [answersMap, setAnswersMap] = useState({});

    useEffect(() => {
        // Używamy backticków ` ` do wstawienia tokena
        api.get(`/forms/public/${token}`)
            .then(res => setForm(res.data))
            .catch(err => alert("Błąd: Link jest nieprawidłowy lub wygasł."));
    }, [token]);

    const handleAnswerChange = (qId, value) => {
        setAnswersMap(prev => ({ ...prev, [qId]: value }));
    };

    async function submit(e) {
        e.preventDefault();
        if (!form) return;

        let respondentId = null;
        if (respondentEmail) {
            try {
                const rRes = await api.post("/respondents", {
                    email: respondentEmail,
                    gdpr_consent: true
                });
                respondentId = rRes.data.id;
            } catch (err) {
                console.warn("Nie udało się zapisać respondenta", err);
            }
        }

        const answersList = form.questions.map(q => {
            const val = answersMap[q.id];
            if (!val) return null;

            const answerObj = { question_id: q.id };

            if (["short_text", "long_text"].includes(q.ans_kind)) {
                answerObj.value_text = val;
            } else if (["single_choice", "multiple_choice"].includes(q.ans_kind)) {
                answerObj.value_option_id = parseInt(val);
            }
            return answerObj;
        }).filter(a => a !== null);

        const payload = {
            form_id: form.id,
            respondent_id: respondentId,
            answers: answersList
        };

        try {
            await api.post("/submissions", payload);
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            alert("Wystąpił błąd podczas wysyłania ankiety.");
        }
    }

    if (submitted) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <h1>Dziękujemy!</h1>
                <p>Twoja odpowiedź została zapisana.</p>
            </div>
        );
    }

    if (!form) return <div style={{ padding: 20 }}>Ładowanie ankiety...</div>;

    return (
        <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
            <h1>{form.title}</h1>
            <form onSubmit={submit}>
                <div style={{ marginBottom: 20, padding: 15, background: "#f8f9fa", borderRadius: 8 }}>
                    <label style={{ display:"block", marginBottom: 5 }}>Twój e-mail (opcjonalnie):</label>
                    <input
                        type="email"
                        value={respondentEmail}
                        onChange={e=>setRespondentEmail(e.target.value)}
                        style={{ width: "100%", padding: 8 }}
                        placeholder="name@example.com"
                    />
                    <small style={{ color: "#666" }}>Podanie e-maila oznacza zgodę na przetwarzanie danych (RODO).</small>
                </div>

                {form.questions.map((q, idx) => (
                    <div key={q.id} style={{ marginBottom: 25 }}>
                        <p style={{ fontWeight: "bold", marginBottom: 10 }}>
                            {idx + 1}. {q.question_text} {q.is_required && <span style={{color:"red"}}>*</span>}
                        </p>

                        {["short_text", "long_text"].includes(q.ans_kind) && (
                            <input
                                type="text"
                                required={q.is_required}
                                onChange={e => handleAnswerChange(q.id, e.target.value)}
                                style={{ width: "100%", padding: 8 }}
                            />
                        )}

                        {q.ans_kind === "single_choice" && q.options.map(opt => (
                            <div key={opt.id} style={{ marginBottom: 5 }}>
                                <label>
                                    <input
                                        type="radio"
                                        name={`q_${q.id}`} // Poprawione backticki
                                        value={opt.id}
                                        required={q.is_required}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                    />
                                    {" "}{opt.option_text}
                                </label>
                            </div>
                        ))}

                        {q.ans_kind === "multiple_choice" && (
                            <div>
                                <p style={{ fontSize: "0.8em", fontStyle: "italic" }}>(Wybierz jedną opcję)</p>
                                {q.options.map(opt => (
                                    <div key={opt.id}>
                                        <label>
                                            <input
                                                type="radio"
                                                name={`q_${q.id}`}
                                                value={opt.id}
                                                required={q.is_required}
                                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                            />
                                            {" "}{opt.option_text}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <button
                    type="submit"
                    style={{ padding: "10px 20px", fontSize: "1.1em", cursor: "pointer", background: "#007bff", color: "white", border: "none", borderRadius: 5 }}
                >
                    Wyślij zgłoszenie
                </button>
            </form>
        </div>
    );
}