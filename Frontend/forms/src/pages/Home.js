import React from "react";
import { Link } from "react-router-dom";


export default function Home() {
    return (
        <div style={{ padding: 20 }}>
            <h1>Witamy w aplikacji Ankietowej!</h1>
            <p>
                Ta aplikacja pozwala tworzyć własne formularze, udostępniać je innym i analizować odpowiedzi.
            </p>

            <h2>Jak zacząć?</h2>
            <ol>
                <li>Zarejestruj się lub zaloguj, jeśli już masz konto.</li>
                <li>Przejdź do <Link to="/dashboard">Dashboard</Link>, aby zobaczyć swoje ankiety.</li>
                <li>Utwórz nową ankietę poprzez <Link to="/forms/new">Formularz</Link>.</li>
                <li>Udostępnij publiczny link uczestnikom, aby mogli wypełnić ankietę.</li>
                <li>Przeglądaj zgłoszenia w <Link to="/dashboard">Dashboard</Link> lub w szczegółach formularza.</li>
            </ol>

            <div style={{ marginTop: 20 }}>
                <Link to="/register">
                    <button style={{ marginRight: 10 }}>Zarejestruj się</button>
                </Link>
                <Link to="/login">
                    <button>Zaloguj się</button>
                </Link>
            </div>

            <div style={{ marginTop: 40, fontStyle: "italic", color: "#555" }}>
                <p>Porada: każda ankieta może zawierać pytania otwarte i wielokrotnego wyboru.</p>
                <p>Pamiętaj, aby zawsze sprawdzić swoje ankiety przed udostępnieniem!</p>
            </div>
        </div>
    );
}
