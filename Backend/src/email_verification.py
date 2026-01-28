import secrets
import os
import smtplib
from email.message import EmailMessage
from urllib.parse import urlencode

def generate_email_verification_token():
    return secrets.token_hex(32)

EMAIL_BACKEND = os.getenv("EMAIL_BACKEND", "mailhog")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
EMAIL_FROM = os.getenv("EMAIL_FROM", "no-reply@local.dev")

MAILHOG_HOST = os.getenv("MAILHOG_HOST", "mailhog")
MAILHOG_PORT = int(os.getenv("MAILHOG_PORT", "1025"))

def send_verification_email(email: str, token: str):
    params = urlencode({"token": token})
    link = f"{FRONTEND_URL}/verify-email?{params}"

    msg = EmailMessage()
    msg["Subject"] = "Potwierdź rejestrację"
    msg["From"] = EMAIL_FROM
    msg["To"] = email
    msg.set_content(f"Kliknij, aby potwierdzić konto:\n{link}\n")

    if EMAIL_BACKEND == "mailhog":
        # MailHog nie wymaga TLS/loginu
        with smtplib.SMTP(MAILHOG_HOST, MAILHOG_PORT) as server:
            server.send_message(msg)
        return

    # awaryjnie: log do konsoli
    if EMAIL_BACKEND == "console":
        print(f"[DEV EMAIL] To: {email} Link: {link}")
        return

    raise RuntimeError(f"Unknown EMAIL_BACKEND={EMAIL_BACKEND}")
