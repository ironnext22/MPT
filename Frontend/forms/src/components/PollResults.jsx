import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function PollResults({ poll, onBack }) {
    const data = poll.options.map((opt, i) => ({
        name: opt,
        value: poll.votes[i],
    }));

    const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

    return (
        <div className="poll-results">
            <h2>📈 Wyniki głosowania</h2>
            <PieChart width={300} height={300}>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={100}
                    label
                >
                    {data.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
            <button onClick={onBack} className="back-btn">
                ⬅️ Utwórz nową ankietę
            </button>
        </div>
    );
}
