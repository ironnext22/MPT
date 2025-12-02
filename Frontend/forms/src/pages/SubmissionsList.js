import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { ModalContext } from "../App";

const TEXT_PAGE_SIZE = 5;

export default function SubmissionsList() {
    const { id } = useParams(); // form_id
    const nav = useNavigate();
    const modal = useContext(ModalContext);

    const [submissions, setSubmissions] = useState([]);
    const [formInfo, setFormInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    // paginacja tekstowych odpowiedzi: question_id -> page
    const [textPages, setTextPages] = useState({});

    useEffect(() => {
        setLoading(true);
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
                modal.showModal(
                    "Błąd",
                    "Nie udało się załadować wyników ankiety."
                );
                nav("/dashboard");
            });
    }, [id, nav, modal]);

    const handleChangeTextPage = (questionId, newPage, maxPage) => {
        if (newPage < 0 || newPage > maxPage) return;
        setTextPages((prev) => ({
            ...prev,
            [questionId]: newPage,
        }));
    };

    if (loading) return <div style={{ padding: 20 }}>Ładowanie wyników...</div>;

    if (!formInfo)
        return (
            <div style={{ padding: 20 }}>
                Nie udało się pobrać informacji o formularzu.
            </div>
        );

    return (
        <div style={{ padding: 20 }}>
            <button
                onClick={() => nav("/dashboard")}
                style={{ marginBottom: 20 }}
            >
                ← Wróć do Dashboardu
            </button>

            <h2 style={{ marginBottom: 4 }}>Wyniki: {formInfo.title}</h2>
            <p style={{ marginBottom: 24 }}>
                Liczba zgłoszeń:{" "}
                <strong>{submissions ? submissions.length : 0}</strong>
            </p>

            {(!submissions || submissions.length === 0) && (
                <p style={{ fontStyle: "italic", color: "#666" }}>
                    Nikt jeszcze nie wypełnił tej ankiety.
                </p>
            )}

            {submissions &&
                submissions.length > 0 &&
                formInfo.questions.map((q, index) => {
                    // zbierz wszystkie odpowiedzi na to pytanie
                    const allAnswers = [];
                    submissions.forEach((sub) => {
                        sub.answers
                            .filter(
                                (a) =>
                                    Number(a.question_id) === Number(q.id)
                            )
                            .forEach((a) => {
                                allAnswers.push({
                                    ...a,
                                    submissionId: sub.id,
                                    started_at: sub.started_at,
                                });
                            });
                    });

                    const isText =
                        q.ans_kind === "short_text" ||
                        q.ans_kind === "long_text";

                    return (
                        <div
                            key={q.id}
                            style={{
                                marginBottom: 24,
                                padding: 16,
                                borderRadius: 8,
                                border: "1px solid #ddd",
                                background: "#fafafa",
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    marginBottom: 8,
                                }}
                            >
                                <h3
                                    style={{
                                        margin: 0,
                                        fontSize: 16,
                                        fontWeight: 600,
                                    }}
                                >
                                    {index + 1}. {q.question_text}
                                </h3>
                                <span
                                    style={{
                                        fontSize: 12,
                                        color: "#666",
                                    }}
                                >
                                    {allAnswers.length} odpowiedzi
                                </span>
                            </div>

                            {/* pytania tekstowe */}
                            {isText && (
                                <TextAnswersBlock
                                    question={q}
                                    answers={allAnswers}
                                    textPages={textPages}
                                    onChangePage={handleChangeTextPage}
                                />
                            )}

                            {/* pytania wyboru (single / multiple) */}
                            {!isText && (
                                <ChoiceStatsBlock
                                    question={q}
                                    answers={allAnswers}
                                />
                            )}
                        </div>
                    );
                })}
        </div>
    );
}

function TextAnswersBlock({
                              question,
                              answers,
                              textPages,
                              onChangePage,
                          }) {
    const allTexts = answers
        .map((a) => a.answer_text?.trim())
        .filter(Boolean);

    if (allTexts.length === 0) {
        return (
            <p
                style={{
                    marginTop: 8,
                    fontStyle: "italic",
                    color: "#888",
                }}
            >
                Brak odpowiedzi tekstowych.
            </p>
        );
    }

    const page = textPages[question.id] || 0;
    const maxPage = Math.max(
        0,
        Math.ceil(allTexts.length / TEXT_PAGE_SIZE) - 1
    );
    const start = page * TEXT_PAGE_SIZE;
    const slice = allTexts.slice(start, start + TEXT_PAGE_SIZE);

    return (
        <div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                    marginTop: 8,
                    marginBottom: 8,
                }}
            >
                {slice.map((text, idx) => (
                    <div
                        key={`${question.id}-${start + idx}`}
                        style={{
                            padding: 8,
                            borderRadius: 6,
                            border: "1px solid #e5e5e5",
                            background: "#fff",
                            fontSize: 14,
                            color: "#333",
                        }}
                    >
                        {text}
                    </div>
                ))}
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: 4,
                }}
            >
                <div style={{ fontSize: 12, color: "#666" }}>
                    Strona {page + 1} z {maxPage + 1}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                    <button
                        onClick={() =>
                            onChangePage(question.id, page - 1, maxPage)
                        }
                        disabled={page === 0}
                        style={{
                            fontSize: 12,
                            padding: "4px 8px",
                            cursor: page === 0 ? "default" : "pointer",
                        }}
                    >
                        Poprzednie
                    </button>
                    <button
                        onClick={() =>
                            onChangePage(question.id, page + 1, maxPage)
                        }
                        disabled={page >= maxPage}
                        style={{
                            fontSize: 12,
                            padding: "4px 8px",
                            cursor:
                                page >= maxPage ? "default" : "pointer",
                        }}
                    >
                        Następne
                    </button>
                </div>
            </div>
        </div>
    );
}

function ChoiceStatsBlock({ question, answers }) {
    const totalAnswers = answers.length;

    if (!question.options || question.options.length === 0) {
        return (
            <p
                style={{
                    marginTop: 8,
                    fontStyle: "italic",
                    color: "#888",
                }}
            >
                Brak zdefiniowanych opcji odpowiedzi.
            </p>
        );
    }

    const stats = question.options.map((opt) => {
        const count = answers.filter(
            (a) => Number(a.option_id) === Number(opt.id)
        ).length;
        const percent =
            totalAnswers > 0
                ? Math.round((count / totalAnswers) * 100)
                : 0;
        return { opt, count, percent };
    });

    return (
        <div style={{ marginTop: 8 }}>
            <ul style={{ paddingLeft: 18, margin: 0, marginBottom: 6 }}>
                {stats.map(({ opt, count, percent }) => (
                    <li
                        key={opt.id}
                        style={{
                            fontSize: 14,
                            marginBottom: 2,
                            color: "#333",
                        }}
                    >
                        <strong>{opt.option_text}</strong>: {count}{" "}
                        odpowiedzi ({percent}%)
                    </li>
                ))}
            </ul>
            <p
                style={{
                    fontSize: 12,
                    color: "#999",
                    fontStyle: "italic",
                    margin: 0,
                }}
            >
                Tutaj później pojawi się wykres (np. słupkowy / kołowy).
            </p>
        </div>
    );
}
