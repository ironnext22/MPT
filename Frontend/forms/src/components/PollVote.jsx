import { useState } from "react";

export default function PollVote({ poll, onVote }) {
    const [selected, setSelected] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (selected === null) return alert("Wybierz odpowiedź!");
        onVote(selected);
    };

    return (
        <form onSubmit={handleSubmit} className="poll-vote">
            <h2>{poll.question}</h2>
            {poll.options.map((opt, i) => (
                <label key={i} className="block">
                    <input
                        type="radio"
                        name="vote"
                        value={i}
                        onChange={() => setSelected(i)}
                    />{" "}
                    {opt}
                </label>
            ))}
            <button type="submit" className="vote-btn">
                Zagłosuj
            </button>
        </form>
    );
}
