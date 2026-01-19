import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import { ModalContext } from "../App";

export default function PublicForm() {
    const { token } = useParams();
    const [form, setForm] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [respondentEmail, setRespondentEmail] = useState("");
    const [answersMap, setAnswersMap] = useState({});
    const modal = useContext(ModalContext);

    useEffect(() => {
        api.get(`/forms/public/${token}`)
            .then((res) => setForm(res.data))
            .catch(() =>
                modal.showModal(
                    "Błąd",
                    "Link do ankiety jest nieprawidłowy lub wygasł.")
            );
    }, [token, modal]);

    const handleAnswerChange = (qId, value) => {
        setAnswersMap((prev) => ({ ...prev, [qId]: value }));
    };

    const handleMultipleChoiceChange = (qId, optionId, checked) => {
        setAnswersMap((prev) => {
            const prevVals = Array.isArray(prev[qId]) ? prev[qId] : [];
            let nextVals;
            if (checked) {
                nextVals = [...new Set([...prevVals, optionId])];
            } else {
                nextVals = prevVals.filter((id) => id !== optionId);
            }
            return { ...prev, [qId]: nextVals };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form) return;

        let respondentId = null;
        if (respondentEmail) {
            try {
                const rRes = await api.post("/respondents", {
                    email: respondentEmail,
                    gdpr_consent: true,
                });
                respondentId = rRes.data.id;
            } catch (err) {
                console.warn("Nie udało się zapisać respondenta", err);
            }
        }

        const answersList = form.questions.flatMap((q) => {
            const val = answersMap[q.id];
            if (val == null || val === "" || (Array.isArray(val) && val.length === 0)) {
                return [];
            }
            if (["short_text", "long_text"].includes(q.ans_kind)) {
                return [{ question_id: q.id, answer_text: val }];
            }
            if (q.ans_kind === "single_choice") {
                return [{ question_id: q.id, option_id: parseInt(val, 10) }];
            }
            if (q.ans_kind === "multiple_choice") {
                const arr = Array.isArray(val) ? val : [val];
                return arr.map((optId) => ({
                    question_id: q.id,
                    option_id: parseInt(optId, 10),
                }));
            }
            return [];
        });

        const payload = { form_id: form.id, respondent_id: respondentId, answers: answersList };

        try {
            await api.post("/submissions", payload);
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            modal.showModal("Błąd", "Wystąpił błąd podczas wysyłania.");
        }
    };

    if (submitted) {
        return (
            <div style={{ padding: 40, textAlign: "center", fontFamily: "sans-serif" }}>
                <h1>Dziękujemy!</h1>
                <p>Twoja odpowiedź została zapisana.</p>
            </div>
        );
    }

    if (!form) {
        return <div style={{ padding: 20 }}>Ładowanie ankiety...</div>;
    }

    // STYLE DLA WIERSZA OPCJI
    const optionRowStyle = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between", // Rozsuwa tekst i input na boki
        padding: "10px 0",
        borderBottom: "1px solid #eee",
        cursor: "pointer",
        width: "100%"
    };

    const textStyle = {
        flex: 1, // Tekst zabiera całą wolną przestrzeń
        paddingRight: "20px", // Odstęp, żeby tekst nie dotykał okienka
        wordBreak: "break-word" // Łamanie długich słów
    };

    const inputStyle = {
        cursor: "pointer",
        width: "18px",
        height: "18px",
        flexShrink: 0 // Zapobiega ściskaniu okienka przy bardzo długim tekście
    };

    return (
        <div style={{ padding: 20, maxWidth: 600, margin: "0 auto", fontFamily: "sans-serif", color: "#333" }}>
            <h1 style={{ textAlign: "center", marginBottom: 30 }}>{form.title}</h1>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 30, padding: 20, background: "#fdfdfd", border: "1px solid #ddd", borderRadius: 10 }}>
                    <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>Twój e-mail (opcjonalnie):</label>
                    <input
                        type="email"
                        value={respondentEmail}
                        onChange={(e) => setRespondentEmail(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: 5, border: "1px solid #ccc", boxSizing: "border-box" }}
                        placeholder="np. jan@kowalski.pl"
                    />
                </div>

                {form.questions.map((q, idx) => (
                    <div key={q.id} style={{ marginBottom: 40 }}>
                        <p style={{ fontWeight: "bold", fontSize: "1.1em", marginBottom: idx === 0 ? 15 : 10 }}>
                            {idx + 1}. {q.question_text} {q.is_required && <span style={{ color: "red" }}>*</span>}
                        </p>

                        {/* Krótka instrukcja dla wielokrotnego wyboru */}
                        {q.ans_kind === "multiple_choice" && (
                            <p style={{ fontSize: "0.85em", color: "#777", marginTop: -10, marginBottom: 10 }}>(Możesz wybrać kilka odpowiedzi)</p>
                        )}

                        {/* PYTANIA TEKSTOWE */}
                        {["short_text", "long_text"].includes(q.ans_kind) && (
                            <input
                                type="text"
                                required={q.is_required}
                                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                style={{ width: "100%", padding: "10px", borderRadius: 5, border: "1px solid #ccc", boxSizing: "border-box" }}
                            />
                        )}

                        {/* WYBÓR JEDNOKROTNY I WIELOKROTNY */}
                        {(q.ans_kind === "single_choice" || q.ans_kind === "multiple_choice") &&
                            q.options.map((opt) => (
                                <label key={opt.id} style={optionRowStyle}>
                                    <span style={textStyle}>{opt.option_text}</span>
                                    <input
                                        type={q.ans_kind === "single_choice" ? "radio" : "checkbox"}
                                        name={q.ans_kind === "single_choice" ? `q_${q.id}` : `q_${q.id}_${opt.id}`}
                                        value={opt.id}
                                        required={q.ans_kind === "single_choice" ? q.is_required : false}
                                        onChange={(e) =>
                                            q.ans_kind === "single_choice"
                                                ? handleAnswerChange(q.id, e.target.value)
                                                : handleMultipleChoiceChange(q.id, opt.id, e.target.checked)
                                        }
                                        style={inputStyle}
                                    />
                                </label>
                            ))}
                    </div>
                ))}

                <button
                    type="submit"
                    style={{
                        width: "100%",
                        padding: "15px",
                        fontSize: "1.1em",
                        fontWeight: "bold",
                        cursor: "pointer",
                        background: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        transition: "background 0.2s"
                    }}
                >
                    Wyślij zgłoszenie
                </button>
            </form>
        </div>
    );
}
