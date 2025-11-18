// src/pages/FormBuilder.js
import React, { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

export default function FormBuilder() {
    const [title, setTitle] = useState("");
    const [questions, setQuestions] = useState([
        { question_text: "", ans_kind: "short_text", is_required: true, position: 0, options: [] }
    ]);
    const nav = useNavigate();

    function addQuestion() {
        setQuestions(qs => [...qs, { question_text: "", ans_kind: "short_text", is_required: true, position: qs.length, options: [] }]);
    }

    function updateQuestion(i, patch) {
        setQuestions(qs => qs.map((q, idx) => idx===i ? {...q, ...patch} : q));
    }

    function addOption(qidx) {
        updateQuestion(qidx, { options: [...questions[qidx].options, { option_text: "", position: questions[qidx].options.length }] });
    }

    async function submit(e) {
        e.preventDefault();
        try {
            await api.post("/forms", { title, questions });
            alert("Utworzono formularz");
            nav("/dashboard");
        } catch (err) {
            console.error(err);
            alert("Błąd tworzenia formularza");
        }
    }

    return (
        <div style={{ padding: 20 }}>
            <h2>Nowy formularz</h2>
            <form onSubmit={submit}>
                <div>
                    <label>Tytuł</label>
                    <input value={title} onChange={e=>setTitle(e.target.value)} />
                </div>

                {questions.map((q, i) => (
                    <div key={i} style={{ border: "1px solid #ddd", padding: 8, marginTop: 8 }}>
                        <label>Pytanie {i+1}</label>
                        <input value={q.question_text} onChange={e=>updateQuestion(i, { question_text: e.target.value })} />
                        <div>
                            <label>Typ</label>
                            <select value={q.ans_kind} onChange={e=>updateQuestion(i, { ans_kind: e.target.value })}>
                                <option value="short_text">Krótki tekst</option>
                                <option value="long_text">Długi tekst</option>
                                <option value="single_choice">Jednokrotny wybór</option>
                                <option value="multiple_choice">Wielokrotny wybór</option>
                            </select>
                        </div>
                        {["single_choice", "multiple_choice"].includes(q.ans_kind) && (
                            <div>
                                <button type="button" onClick={()=>addOption(i)}>Dodaj opcję</button>
                                {q.options.map((o, oi) => (
                                    <div key={oi}>
                                        <input placeholder="Tekst opcji" value={o.option_text} onChange={e=>{
                                            const newOpts = q.options.map((op, idx)=> idx===oi ? {...op, option_text: e.target.value} : op);
                                            updateQuestion(i, { options: newOpts });
                                        }} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                <div style={{ marginTop: 10 }}>
                    <button type="button" onClick={addQuestion}>Dodaj pytanie</button>
                    <button type="submit">Utwórz formularz</button>
                </div>
            </form>
        </div>
    );
}
