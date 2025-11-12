import { useState } from "react";

export default function PollForm({ onCreate }) {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);

    const addOption = () => setOptions([...options, ""]);

    const handleOptionChange = (i, value) => {
        const updated = [...options];
        updated[i] = value;
        setOptions(updated);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!question.trim() || options.some((o) => !o.trim())) return alert("Uzupełnij wszystkie pola!");
        onCreate({ question, options });
    };

    return (
        <form onSubmit={handleSubmit} className="poll-form">
            <h2>📝 Utwórz nową ankietę</h2>
            <input
                type="text"
                placeholder="Pytanie ankiety"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="input"
            />
            {options.map((opt, i) => (
                <input
                    key={i}
                    type="text"
                    placeholder={`Odpowiedź ${i + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    className="input"
                />
            ))}
            <button type="button" onClick={addOption}>
                ➕ Dodaj opcję
            </button>
            <button type="submit" className="create-btn">
                Utwórz ankietę
            </button>
        </form>
    );
}
