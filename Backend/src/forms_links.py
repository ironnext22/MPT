from jose import jwt, JWTError
from datetime import datetime, timedelta
from fastapi import HTTPException

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

