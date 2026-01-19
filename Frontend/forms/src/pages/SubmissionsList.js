import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { ModalContext } from "../App";
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

const TEXT_PAGE_SIZE = 5;

export default function SubmissionsList() {
    const { id } = useParams(); // form_id
    const nav = useNavigate();
    const modal = useContext(ModalContext);

    const [submissions, setSubmissions] = useState([]);
    const [formInfo, setFormInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [questionStats, setQuestionStats] = useState({}); // question_id -> stats from get_question_stats

    // paginacja tekstowych odpowiedzi: question_id -> page
    const [textPages, setTextPages] = useState({});

    useEffect(() => {
        setLoading(true);
        Promise.all([
            api.get(`/forms/${id}`),
            api.get(`/forms/${id}/submissions`),
        ])
            .then(async ([formRes, subRes]) => {
                const form = formRes.data;
                setFormInfo(form);
                setSubmissions(subRes.data);

                // Pobierz statystyki dla pytań wyboru (single_choice / multiple_choice)
                try {
                    const choiceQuestions = (form.questions || []).filter(
                        (q) =>
                            q.ans_kind === "single_choice" ||
                            q.ans_kind === "multiple_choice"
                    );

                    const statsPairs = await Promise.all(
                        choiceQuestions.map(async (q) => {
                            const res = await api.get(
                                `/forms/${id}/stats/questions/${q.id}`
                            );
                            return [q.id, res.data];
                        })
                    );

                    setQuestionStats(Object.fromEntries(statsPairs));
                } catch (e) {
                    console.error("Nie udało się pobrać statystyk pytań:", e);
                    setQuestionStats({});
                }

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
                                (a) => Number(a.question_id) === Number(q.id)
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
                                    stats={questionStats[q.id]}
                                />
                            )}
                        </div>
                    );
                })}
        </div>
    );
}

function TextAnswersBlock({ question, answers, textPages, onChangePage }) {
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
        <div style={{ marginTop: 8 }}>
            <ul style={{ paddingLeft: 18, margin: 0, marginBottom: 10 }}>
                {slice.map((txt, i) => (
                    <li
                        key={`${question.id}-${page}-${i}`}
                        style={{
                            fontSize: 14,
                            marginBottom: 4,
                            color: "#333",
                            wordBreak: "break-word",
                        }}
                    >
                        {txt}
                    </li>
                ))}
            </ul>

            {maxPage > 0 && (
                <div
                    style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                        justifyContent: "flex-start",
                    }}
                >
                    <button
                        onClick={() =>
                            onChangePage(question.id, page - 1, maxPage)
                        }
                        disabled={page <= 0}
                    >
                        ←
                    </button>
                    <span style={{ fontSize: 12, color: "#666" }}>
                        Strona {page + 1} / {maxPage + 1}
                    </span>
                    <button
                        onClick={() =>
                            onChangePage(question.id, page + 1, maxPage)
                        }
                        disabled={page >= maxPage}
                    >
                        →
                    </button>
                </div>
            )}
        </div>
    );
}

function ChoiceStatsBlock({ question, stats }) {
    if (!stats) {
        return (
            <p style={{ marginTop: 8, fontStyle: "italic", color: "#888", marginBottom: 0 }}>
                Ładowanie statystyk...
            </p>
        );
    }

    const total = Number(stats.total_answers || 0);
    const options = Array.isArray(stats.options) ? stats.options : [];

    if (options.length === 0) {
        return (
            <p style={{ marginTop: 8, fontStyle: "italic", color: "#888", marginBottom: 0 }}>
                Brak statystyk opcji.
            </p>
        );
    }

    // Recharts lubi format: [{ name, value }]
    const data = options.map((o) => ({
        name: o.text ?? "(bez nazwy)",
        value: Number(o.count || 0),
        id: o.id,
    }));

    // (opcjonalnie) usuń zera, żeby nie było “pustych” legend
    const dataNonZero = data.filter((d) => d.value > 0);
    const chartData = dataNonZero.length ? dataNonZero : data;

    // prosta paleta kolorów (bez grzebania w CSS)
    const COLORS = ["#4f46e5", "#22c55e", "#f59e0b", "#ef4444", "#06b6d4", "#a855f7", "#64748b"];

    return (
        <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                Odpowiedzi: <strong>{total}</strong>
            </div>

            <div style={{ width: "100%", height: 260 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            outerRadius={90}
                            label={(entry) => {
                                const percent = total > 0 ? Math.round((entry.value / total) * 100) : 0;
                                return `${percent}%`;
                            }}
                        >
                            {chartData.map((entry, idx) => (
                                <Cell key={entry.id ?? entry.name} fill={COLORS[idx % COLORS.length]} />
                            ))}
                        </Pie>

                        <Tooltip
                            formatter={(value, name) => {
                                const v = Number(value || 0);
                                const percent = total > 0 ? Math.round((v / total) * 100) : 0;
                                return [`${v} (${percent}%)`, name];
                            }}
                        />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <p style={{ fontSize: 11, color: "#999", fontStyle: "italic", marginTop: 10, marginBottom: 0 }}>
                Wykres generowany na podstawie get_question_stats.
            </p>
        </div>
    );
}

