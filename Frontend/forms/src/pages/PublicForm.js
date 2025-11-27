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
    }, [token,modal]);

    // tekst + single_choice (jedna wartość)
    const handleAnswerChange = (qId, value) => {
        setAnswersMap((prev) => ({ ...prev, [qId]: value }));
    };

    // multiple_choice (tablica zaznaczonych opcji)
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

        // opcjonalny respondent
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

        // budujemy listę odpowiedzi zgodnie z backendem (AnswerCreate)
        const answersList = form.questions.flatMap((q) => {
            const val = answersMap[q.id];

            // nic nie wpisane / zaznaczone
            if (
                val == null ||
                val === "" ||
                (Array.isArray(val) && val.length === 0)
            ) {
                return [];
            }

            // odpowiedzi tekstowe
            if (["short_text", "long_text"].includes(q.ans_kind)) {
                return [
                    {
                        question_id: q.id,
                        answer_text: val,
                    },
                ];
            }

            // jedna odpowiedź
            if (q.ans_kind === "single_choice") {
                return [
                    {
                        question_id: q.id,
                        option_id: parseInt(val, 10),
                    },
                ];
            }

            // wiele odpowiedzi – osobny rekord dla każdej opcji
            if (q.ans_kind === "multiple_choice") {
                const arr = Array.isArray(val) ? val : [val];
                return arr.map((optId) => ({
                    question_id: q.id,
                    option_id: parseInt(optId, 10),
                }));
            }

            return [];
        });

        const payload = {
            form_id: form.id,
            respondent_id: respondentId,
            answers: answersList,
        };

        try {
            await api.post("/submissions", payload);
            setSubmitted(true);
        } catch (err) {
            console.error(err);
            modal.showModal(
                "Błąd",
                "Wystąpił błąd podczas wysyłania ankiety."
            );
        }
    };

    if (submitted) {
        return (
            <div style={{ padding: 40, textAlign: "center" }}>
                <h1>Dziękujemy!</h1>
                <p>Twoja odpowiedź została zapisana.</p>
            </div>
        );
    }

    if (!form) {
        return <div style={{ padding: 20 }}>Ładowanie ankiety...</div>;
    }

    return (
        <div style={{ padding: 20, maxWidth: 600, margin: "0 auto" }}>
            <h1>{form.title}</h1>

            <form onSubmit={handleSubmit}>
                {/* E-mail respondenta (opcjonalny) */}
                <div
                    style={{
                        marginBottom: 20,
                        padding: 15,
                        background: "#f8f9fa",
                        borderRadius: 8,
                    }}
                >
                    <label
                        style={{
                            display: "block",
                            marginBottom: 5,
                        }}
                    >
                        Twój e-mail (opcjonalnie):
                    </label>
                    <input
                        type="email"
                        value={respondentEmail}
                        onChange={(e) => setRespondentEmail(e.target.value)}
                        style={{ width: "100%", padding: 8 }}
                        placeholder="name@example.com"
                    />
                    <small style={{ color: "#666" }}>
                        Podanie e-maila oznacza zgodę na przetwarzanie danych
                        (RODO).
                    </small>
                </div>

                {form.questions.map((q, idx) => (
                    <div key={q.id} style={{ marginBottom: 25 }}>
                        <p
                            style={{
                                fontWeight: "bold",
                                marginBottom: 10,
                            }}
                        >
                            {idx + 1}. {q.question_text}{" "}
                            {q.is_required && (
                                <span style={{ color: "red" }}>*</span>
                            )}
                        </p>

                        {/* pytania tekstowe */}
                        {["short_text", "long_text"].includes(q.ans_kind) && (
                            <input
                                type="text"
                                required={q.is_required}
                                onChange={(e) =>
                                    handleAnswerChange(q.id, e.target.value)
                                }
                                style={{ width: "100%", padding: 8 }}
                            />
                        )}

                        {/* single_choice */}
                        {q.ans_kind === "single_choice" &&
                            q.options.map((opt) => (
                                <div key={opt.id} style={{ marginBottom: 5 }}>
                                    <label>
                                        <input
                                            type="radio"
                                            name={`q_${q.id}`}
                                            value={opt.id}
                                            required={q.is_required}
                                            onChange={(e) =>
                                                handleAnswerChange(
                                                    q.id,
                                                    e.target.value
                                                )
                                            }
                                        />{" "}
                                        {opt.option_text}
                                    </label>
                                </div>
                            ))}

                        {/* multiple_choice */}
                        {q.ans_kind === "multiple_choice" && (
                            <div>
                                <p
                                    style={{
                                        fontSize: "0.8em",
                                        fontStyle: "italic",
                                    }}
                                >
                                    (Możesz wybrać kilka odpowiedzi)
                                </p>
                                {q.options.map((opt) => (
                                    <div key={opt.id}>
                                        <label>
                                            <input
                                                type="checkbox"
                                                name={`q_${q.id}_${opt.id}`}
                                                value={opt.id}
                                                onChange={(e) =>
                                                    handleMultipleChoiceChange(
                                                        q.id,
                                                        opt.id,
                                                        e.target.checked
                                                    )
                                                }
                                            />{" "}
                                            {opt.option_text}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <button
                    type="submit"
                    style={{
                        padding: "10px 20px",
                        fontSize: "1.1em",
                        cursor: "pointer",
                        background: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: 5,
                    }}
                >
                    Wyślij zgłoszenie
                </button>
            </form>
        </div>
    );
}
