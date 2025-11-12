import React, { useState } from "react";
import PollForm from "./components/PollForm";
import PollVote from "./components/PollVote";
import PollResults from "./components/PollResults";

export default function App() {
    const [polls, setPolls] = useState([]);      // wszystkie ankiety
    const [currentPoll, setCurrentPoll] = useState(null); // aktywna ankieta
    const [view, setView] = useState("form");    // "form" | "vote" | "results"

    // tworzenie nowej ankiety
    const handleCreatePoll = (poll) => {
        const newPoll = {
            ...poll,
            id: Date.now(),
            votes: Array(poll.options.length).fill(0),
        };
        setPolls([...polls, newPoll]);
        setCurrentPoll(newPoll);
        setView("vote");
    };

    // głosowanie
    const handleVote = (index) => {
        const updated = { ...currentPoll };
        updated.votes[index] += 1;
        setCurrentPoll(updated);
        setView("results");
    };

    // reset do formularza
    const reset = () => {
        setCurrentPoll(null);
        setView("form");
    };

    return (
        <main className="App">
            <h1>📊 Platforma do Ankiet i Głosowań</h1>

            {view === "form" && <PollForm onCreate={handleCreatePoll} />}
            {view === "vote" && currentPoll && (
                <PollVote poll={currentPoll} onVote={handleVote} />
            )}
            {view === "results" && currentPoll && (
                <PollResults poll={currentPoll} onBack={reset} />
            )}
        </main>
    );
}
