// src/pages/FormBuilder.js
import React, { useEffect, useMemo, useState, useContext } from "react";
import api from "../api";
import { useNavigate, useParams } from "react-router-dom";
import { ModalContext } from "../App";

const ANSWER_TYPES = [
    { value: "short_text", label: "Krótka odpowiedź" },
    { value: "long_text", label: "Długa odpowiedź" },
    { value: "single_choice", label: "Jednokrotny wybór" },
    { value: "multiple_choice", label: "Wielokrotny wybór" },
];

function isChoiceKind(kind) {
    return kind === "single_choice" || kind === "multiple_choice";
}

export default function FormBuilder() {
    // ✅ u Ciebie param to :id
    const { id } = useParams();

    // ✅ “Kontynuacja”: jeśli jest id -> edytujemy (nie sprawdzamy /edit)
    const isEdit = useMemo(() => !!id, [id]);

    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState([
        { question_text: "", ans_kind: "short_text", is_required: true, position: 0, options: [] },
    ]);

    const nav = useNavigate();
    const modal = useContext(ModalContext) || { showModal: () => {} };

    // ✅ Wczytanie danych formularza do kontynuacji/edycji
    useEffect(() => {
        if (!isEdit) return;

        (async () => {
            try {
                const r = await api.get(`/forms/${id}`);
                const data = r.data;

                setTitle(data.title || "");

                const qs = (data.questions || [])
                    .slice()
                    .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                    .map((q, idx) => ({
                        question_text: q.question_text || "",
                        ans_kind: q.ans_kind || "short_text",
                        is_required: q.is_required ?? true,
                        position: q.position ?? idx,
                        options: (q.options || [])
                            .slice()
                            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                            .map((o, oi) => ({
                                option_text: o.option_text || "",
                                position: o.position ?? oi,
                                is_correct: o.is_correct ?? false,
                            })),
                    }));

                setQuestions(
                    qs.length
                        ? qs
                        : [{ question_text: "", ans_kind: "short_text", is_required: true, position: 0, options: [] }]
                );
            } catch (err) {
                console.error(err);
                modal.showModal("Błąd", "Nie udało się wczytać formularza do edycji.");
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isEdit, id]);

    function normalizePositions(qs) {
        return qs.map((q, idx) => ({
            ...q,
            position: idx,
            options: (q.options || []).map((o, oi) => ({ ...o, position: oi })),
        }));
    }

    function addQuestion() {
        setQuestions((qs) =>
            normalizePositions([
                ...qs,
                { question_text: "", ans_kind: "short_text", is_required: true, position: qs.length, options: [] },
            ])
        );
    }

    function removeQuestion(qidx) {
        setQuestions((qs) => normalizePositions(qs.filter((_, i) => i !== qidx)));
    }

    function updateQuestion(qidx, patch) {
        setQuestions((qs) => normalizePositions(qs.map((q, i) => (i === qidx ? { ...q, ...patch } : q))));
    }

    function addOption(qidx) {
        setQuestions((qs) => {
            const next = qs.slice();
            const q = { ...next[qidx] };
            const opts = (q.options || []).slice();

            opts.push({ option_text: "", position: opts.length, is_correct: false });
            q.options = opts;
            next[qidx] = q;
            return normalizePositions(next);
        });
    }

    function updateOption(qidx, oidx, patch) {
        setQuestions((qs) => {
            const next = qs.slice();
            const q = { ...next[qidx] };
            const opts = (q.options || []).slice();
            opts[oidx] = { ...opts[oidx], ...patch };
            q.options = opts;
            next[qidx] = q;
            return normalizePositions(next);
        });
    }

    function removeOption(qidx, oidx) {
        setQuestions((qs) => {
            const next = qs.slice();
            const q = { ...next[qidx] };
            q.options = (q.options || []).filter((_, i) => i !== oidx);
            next[qidx] = q;
            return normalizePositions(next);
        });
    }

    async function submit(e) {
        e.preventDefault();

        const payload = {
            title: (title || "").trim(),
            questions: normalizePositions(questions).map((q) => {
                const clean = {
                    question_text: (q.question_text || "").trim(),
                    ans_kind: q.ans_kind,
                    is_required: !!q.is_required,
                    position: q.position ?? 0,
                    options: [],
                };

                if (isChoiceKind(q.ans_kind)) {
                    clean.options = (q.options || [])
                        .filter((o) => (o.option_text || "").trim().length > 0)
                        .map((o) => ({
                            option_text: (o.option_text || "").trim(),
                            position: o.position ?? 0,
                            is_correct: o.is_correct ?? false,
                        }));
                }
                return clean;
            }),
        };

        if (!payload.title) {
            modal.showModal("Błąd", "Podaj tytuł ankiety.");
            return;
        }
        if (!payload.questions.length || !payload.questions[0].question_text) {
            modal.showModal("Błąd", "Dodaj przynajmniej jedno pytanie.");
            return;
        }

        try {
            if (isEdit) {
                await api.patch(`/forms/${id}`, payload);
                modal.showModal("Sukces", "Zapisano zmiany ✅");
            } else {
                await api.post("/forms", payload);
                modal.showModal("Sukces", "Utworzono formularz ✅");
            }
            nav("/dashboard");
        } catch (err) {
            console.error(err);
            if (err.response?.status === 409) {
                modal.showModal("Błąd", "Nie można edytować ankiety, która ma już odpowiedzi.");
                return;
            }
            modal.showModal("Błąd", "Błąd zapisu formularza.");
        }
    }

    return (
        <div style={wrapStyle}>
            <h2 style={{ marginBottom: 12 }}>{isEdit ? "Edytuj formularz" : "Nowy formularz"}</h2>

            <form onSubmit={submit}>
                <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Tytuł</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="np. Ankieta satysfakcji"
                        style={inputStyle}
                    />
                </div>

                {questions.map((q, qidx) => (
                    <div key={qidx} style={cardStyle}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                            <div style={{ flex: 1 }}>
                                <label style={labelStyle}>Pytanie #{qidx + 1}</label>
                                <input
                                    value={q.question_text}
                                    onChange={(e) => updateQuestion(qidx, { question_text: e.target.value })}
                                    placeholder="Treść pytania..."
                                    style={inputStyle}
                                />
                            </div>

                            <div style={{ width: 220 }}>
                                <label style={labelStyle}>Typ odpowiedzi</label>
                                <select
                                    value={q.ans_kind}
                                    onChange={(e) => {
                                        const nextKind = e.target.value;
                                        if (isChoiceKind(nextKind)) {
                                            const nextOpts =
                                                q.options && q.options.length
                                                    ? q.options
                                                    : [
                                                        { option_text: "", position: 0, is_correct: false },
                                                        { option_text: "", position: 1, is_correct: false },
                                                    ];
                                            updateQuestion(qidx, { ans_kind: nextKind, options: nextOpts });
                                        } else {
                                            updateQuestion(qidx, { ans_kind: nextKind, options: [] });
                                        }
                                    }}
                                    style={inputStyle}
                                >
                                    {ANSWER_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
                            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <input
                                    type="checkbox"
                                    checked={!!q.is_required}
                                    onChange={(e) => updateQuestion(qidx, { is_required: e.target.checked })}
                                />
                                Wymagane
                            </label>

                            <div style={{ flex: 1 }} />

                            <button
                                type="button"
                                onClick={() => removeQuestion(qidx)}
                                style={{ ...btnStyle, background: "#dc3545", color: "white", border: "none" }}
                                disabled={questions.length <= 1}
                            >
                                Usuń pytanie
                            </button>
                        </div>

                        {isChoiceKind(q.ans_kind) && (
                            <div style={{ marginTop: 12 }}>
                                <div style={{ fontWeight: 600, marginBottom: 8 }}>Opcje</div>

                                {(q.options || []).map((o, oidx) => (
                                    <div key={oidx} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                                        <input
                                            value={o.option_text}
                                            onChange={(e) => updateOption(qidx, oidx, { option_text: e.target.value })}
                                            placeholder={`Opcja ${oidx + 1}`}
                                            style={{ ...inputStyle, marginBottom: 0 }}
                                        />
                                        <button type="button" onClick={() => removeOption(qidx, oidx)} style={btnStyle}>
                                            Usuń
                                        </button>
                                    </div>
                                ))}

                                <button type="button" onClick={() => addOption(qidx)} style={btnStyle}>
                                    + Dodaj opcję
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                <div style={{ display: "flex", gap: 10, marginTop: 10, flexWrap: "wrap" }}>
                    <button type="button" onClick={addQuestion} style={btnStyle}>
                        + Dodaj pytanie
                    </button>

                    <button type="submit" style={primaryBtnStyle}>
                        {isEdit ? "Zapisz zmiany" : "Utwórz formularz"}
                    </button>

                    <button type="button" onClick={() => nav("/dashboard")} style={btnStyle}>
                        Anuluj
                    </button>
                </div>
            </form>
        </div>
    );
}

// styles
const wrapStyle = {
    maxWidth: 900,
    margin: "0 auto",
    padding: 20,
};

const cardStyle = {
    background: "#fff",
    border: "1px solid #eee",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
};

const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#444",
    marginBottom: 6,
};

const inputStyle = {
    width: "100%",
    padding: 10,
    borderRadius: 8,
    border: "1px solid #ddd",
    marginBottom: 6,
    outline: "none",
};

const btnStyle = {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ddd",
    background: "#f7f7f7",
    cursor: "pointer",
    fontSize: 14,
    color: "#111",
};

const primaryBtnStyle = {
    ...btnStyle,
    background: "#28a745",
    border: "none",
    color: "white",
};
