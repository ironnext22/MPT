// src/pages/PublicForm.js
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function PublicForm() {
    const { token } = useParams();
    const [form, setForm] = useState(null);
    const [respondentEmail, setRespondentEmail] = useState("");
    const [answers, setAnswers] = useState({});

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get(`/forms/public/${token}`);
                setForm(res.data);
            } catch (err) {
                console.error(err);
                alert("Błąd ładowania formularza");
            }
        }
        load();
    }, [token]);

    function setAnswer(questionId, value, optionId=null) {
        setAnswers(a => ({ ...a, [questionId]: { question_id: questionId, value_text: value, value_option_id: optionId } }));
    }

    async function submit(e) {
        e.preventDefault();
        try {
            // najpierw utwórz respondent
            const r = await api.post("/respondents", { email: respondentEmail, gdpr_consent: true });
            const answersArr = Object.values(answers);

            await api.post("/submissions", {
                form_id: form.id,
                respondent_id: r.data.id,
                answers: answersArr
            });
            alert("Dziękujemy za odpowiedź");
        } catch (err) {
            console.error(err);
            alert("Błąd wysyłki odpowiedzi");
        }
    }

    if (!form) return <div style={{ padding: 20 }}>Ładowanie...</div>;

    return (
        <div style={{ padding: 20 }}>
            <h2>{form.title}</h2>
            <form onSubmit={submit}>
                <div>
                    <label>Twój email</label>
                    <input value={respondentEmail} onChange={e=>setRespondentEmail(e.target.value)} required />
                </div>

                {form.questions.map(q => (
                    <div key={q.id} style={{ marginTop: 10 }}>
                        <div><strong>{q.question_text}</strong></div>
                        {q.ans_kind === "short_text" && (
                            <input onChange={e=>setAnswer(q.id, e.target.value, null)} required={q.is_required} />
                        )}
                        {q.ans_kind === "long_text" && (
                            <textarea onChange={e=>setAnswer(q.id, e.target.value, null)} required={q.is_required} />
                        )}
                        {q.ans_kind === "single_choice" && q.options.map(o => (
                            <div key={o.id}>
                                <label>
                                    <input type="radio" name={`q${q.id}`} onChange={()=>setAnswer(q.id, null, o.id)} />
                                    {o.option_text}
                                </label>
                            </div>
                        ))}
                        {q.ans_kind === "multiple_choice" && q.options.map(o => (
                            <div key={o.id}>
                                <label>
                                    <input type="checkbox" onChange={(e)=>{
                                        const prev = answers[q.id]?.value_option_id || [];
                                        let vals = Array.isArray(prev) ? prev.slice() : (prev ? [prev] : []);
                                        if (e.target.checked) vals.push(o.id); else vals = vals.filter(x=>x!==o.id);
                                        setAnswers(a => ({ ...a, [q.id]: { question_id: q.id, value_text: null, value_option_id: vals.length ? vals[0] : null } }));
                                        // NOTE: backend current model stores single option_id; to support multi you must adapt backend.
                                    }} />
                                    {o.option_text}
                                </label>
                            </div>
                        ))}
                    </div>
                ))}

                <div style={{ marginTop: 12 }}>
                    <button type="submit">Wyślij odpowiedź</button>
                </div>
            </form>
        </div>
    );
}
