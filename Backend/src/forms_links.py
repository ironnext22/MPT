from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import HTTPException
import qrcode
import base64
from io import BytesIO

SECRET_KEY = "SEKRETNY_KLUCZ_:)"
TOKEN_EXPIRE_DAYS = 30
ALGORITHM = "HS256"

def create_forms_token(id: int, creator_mail: str) -> str:
    expire = datetime.utcnow() + timedelta(days=TOKEN_EXPIRE_DAYS)
    payload = {
        "form_id": id,
        "creator_email": creator_mail,
        "exp": expire,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_forms_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=400, detail="Invalid or expired token")


def generate_qr_code(data: str) -> str:
    qr = qrcode.QRCode(
        version=1,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)

    img_base = buffer.getvalue()
    b64 = base64.b64encode(img_base).decode("utf-8")

    return f"data:image/png;base64,{b64}"
